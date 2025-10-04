// ✅ MoviesDom - api.js
// Handles all TMDB API requests and caching

class MovieAPI {
    constructor() {
        this.cache = new Map();
    }

    async fetchWithCache(url) {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < APP_CONFIG.CACHE_DURATION) {
            return cached.data;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        this.cache.set(url, { data, timestamp: Date.now() });
        return data;
    }

    async getPopularMovies(page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/popular?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
        return this.fetchWithCache(url);
    }

    async getNowPlayingMovies(page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/now_playing?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
        return this.fetchWithCache(url);
    }

    async getUpcomingMovies(page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/upcoming?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
        return this.fetchWithCache(url);
    }

    async getTrendingMovies(page = 1) {
        const url = `${TMDB_CONFIG.BASE_URL}/trending/movie/day?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}&page=${page}`;
        return this.fetchWithCache(url);
    }

    async getMovieDetails(movieId) {
        const url = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`;
        return this.fetchWithCache(url);
    }
}

// ✅ Global Access
window.movieAPI = new MovieAPI();
