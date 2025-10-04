// API Configuration
const CONFIG = {
    TMDB_API_KEY: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzhlMGJiOGZiNDJkYjRmYTBiNTZiNDI0NjE1MWYwOCIsIm5iZiI6MTc1ODQ5MDE2MC4zMzMsInN1YiI6IjY4ZDA2ZTMwODQ0YTFmMGUxZWZlOTcxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4eCjy3pNJMWTLKicA_U_3Vg0umJH-Kht5SzyGk14azE',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    YOUTUBE_BASE_URL: 'https://www.youtube.com/embed',
    
    // Mock data settings
    USE_MOCK_DATA: true,
    MOCK_DELAY: 500
};

// YouTube trailer keys for demo (real movie trailers)
const YOUTUBE_TRAILER_KEYS = [
    'jBdxRhU3WC4', // Dune: Part Two
    'U2Qp5pL3ovA', // Poor Things
    'Y274jZs5s7s', // Killers of the Flower Moon
    'tVlaahkXhJo', // The Marvels
    'qEVUtrk8_B4', // John Wick: Chapter 4
    'TQPKnMwJ8_0', // The Batman
    'giWIr7U1doA', // Fast X
    'mYfJxlgR2jw', // Transformers: Rise of the Beasts
    'cD0teq0eCIw', // The Little Mermaid
    't96hVDL_pyE'  // Avatar: The Way of Water
];

// Popular movies for mock data
const POPULAR_MOVIES = [
    {
        id: 693134,
        title: "Dune: Part Two",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg"
    },
    {
        id: 792307,
        title: "Poor Things",
        backdrop_path: "/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg",
        poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg"
    },
    {
        id: 466420,
        title: "Killers of the Flower Moon",
        backdrop_path: "/sRvXNDItGlWCqtO3j6wks52FmbD.jpg",
        poster_path: "/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg"
    },
    {
        id: 609681,
        title: "The Marvels",
        backdrop_path: "/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg",
        poster_path: "/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg"
    },
    {
        id: 603692,
        title: "John Wick: Chapter 4",
        backdrop_path: "/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
        poster_path: "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg"
    },
    {
        id: 27205,
        title: "Inception",
        backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
    },
    {
        id: 155,
        title: "The Dark Knight",
        backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
    },
    {
        id: 680,
        title: "Pulp Fiction",
        backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
        poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg"
    }
];

class MovieAPI {
    constructor() {
        this.cache = new Map();
    }

    async fetchWithCache(url) {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < APP_CONFIG.CACHE_DURATION) {
            return cached.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(url, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Simulate API delay for mock data
    async simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, CONFIG.MOCK_DELAY));
    }

    // Movie endpoints
    async getPopularMovies(page = 1) {
        if (CONFIG.USE_MOCK_DATA) {
            await this.simulateDelay();
            
            // Return mock popular movies
            const startIndex = (page - 1) * 8;
            const endIndex = startIndex + 8;
            const movies = POPULAR_MOVIES.slice(startIndex, endIndex);
            
            return {
                page,
                results: movies,
                total_pages: Math.ceil(POPULAR_MOVIES.length / 8),
                total_results: POPULAR_MOVIES.length
            };
        } else {
            const url = `${TMDB_CONFIG.BASE_URL}/movie/popular?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
            return this.fetchWithCache(url);
        }
    }

    async getMovieDetails(movieId) {
        if (CONFIG.USE_MOCK_DATA) {
            await this.simulateDelay();
            
            const movie = POPULAR_MOVIES.find(m => m.id === movieId) || POPULAR_MOVIES[0];
            
            return {
                ...movie,
                overview: "This is a mock overview for demonstration purposes. In a real application, this would contain the actual movie plot summary.",
                release_date: "2024-01-01",
                runtime: 120,
                genres: [{ id: 1, name: "Action" }, { id: 2, name: "Adventure" }],
                vote_average: 7.5 + Math.random() * 2,
                vote_count: Math.floor(Math.random() * 10000)
            };
        } else {
            const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&append_to_response=credits,videos,reviews,similar`;
            return this.fetchWithCache(url);
        }
    }

    async searchMovies(query, page = 1) {
        if (CONFIG.USE_MOCK_DATA) {
            await this.simulateDelay();
            
            const filteredMovies = POPULAR_MOVIES.filter(movie =>
                movie.title.toLowerCase().includes(query.toLowerCase())
            );
            
            return {
                page,
                results: filteredMovies,
                total_pages: 1,
                total_results: filteredMovies.length
            };
        } else {
            const url = `${TMDB_CONFIG.BASE_URL}/search/movie?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&query=${encodeURIComponent(query)}&page=${page}`;
            return this.fetchWithCache(url);
        }
    }

    async getNowPlaying(page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/now_playing?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
        return this.fetchWithCache(url);
    }

    async getUpcomingMovies(page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/upcoming?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
        return this.fetchWithCache(url);
    }

    async getMovieTrailers(movieId) {
        if (CONFIG.USE_MOCK_DATA) {
            await this.simulateDelay();
            
            // Generate mock videos
            const videoTypes = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes'];
            const movie = POPULAR_MOVIES.find(m => m.id === movieId) || POPULAR_MOVIES[0];
            
            return {
                id: movieId,
                results: videoTypes.map((type, index) => ({
                    id: `video-${movieId}-${index}`,
                    key: YOUTUBE_TRAILER_KEYS[(movieId + index) % YOUTUBE_TRAILER_KEYS.length],
                    name: `${type} - ${movie.title}`,
                    type: type,
                    site: "YouTube",
                    size: 1080,
                    official: true,
                    published_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
                }))
            };
        } else {
            const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_CONFIG.API_KEY}`;
            return this.fetchWithCache(url);
        }
    }

    // NEW: Get movie images
    async getMovieImages(movieId) {
        if (CONFIG.USE_MOCK_DATA) {
            await this.simulateDelay();
            
            const movie = POPULAR_MOVIES.find(m => m.id === movieId) || POPULAR_MOVIES[0];
            const imageTypes = ['poster', 'backdrop', 'still'];
            
            return {
                id: movieId,
                backdrops: Array.from({ length: 5 }, (_, i) => ({
                    file_path: movie.backdrop_path,
                    width: 1920,
                    height: 1080,
                    aspect_ratio: 1.78,
                    vote_average: 5.0 + Math.random(),
                    vote_count: Math.floor(Math.random() * 1000)
                })),
                posters: Array.from({ length: 3 }, (_, i) => ({
                    file_path: movie.poster_path,
                    width: 1000,
                    height: 1500,
                    aspect_ratio: 0.67,
                    vote_average: 5.0 + Math.random(),
                    vote_count: Math.floor(Math.random() * 1000)
                })),
                logos: []
            };
        } else {
            const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/images?api_key=${TMDB_CONFIG.API_KEY}`;
            return this.fetchWithCache(url);
        }
    }

    // NEW: Get movie videos (alias for getMovieTrailers for consistency)
    async getMovieVideos(movieId) {
        return this.getMovieTrailers(movieId);
    }
}

const movieAPI = new MovieAPI();