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

    // Movie endpoints
    async getPopularMovies(page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/popular?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
        return this.fetchWithCache(url);
    }

    async getMovieDetails(movieId) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&append_to_response=credits,videos,reviews,similar`;
        return this.fetchWithCache(url);
    }

    async searchMovies(query, page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/search/movie?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&query=${encodeURIComponent(query)}&page=${page}`;
        return this.fetchWithCache(url);
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
        const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_CONFIG.API_KEY}`;
        return this.fetchWithCache(url);
    }
}

const movieAPI = new MovieAPI();