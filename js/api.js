// ✅ MoviesDom - api.js (SAFE BACKEND VERSION)
// Handles all Movies API requests via your secure backend + caching

class MovieAPI {
    constructor() {
        this.cache = new Map();
    }

    // path = backend path, example: "/api/movies/popular?page=1"
    async fetchWithCache(path) {
        const base = BACKEND_CONFIG.BASE_URL.replace(/\/+$/, ""); // remove trailing slash
        const url = `${base}${path}`;

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
        // calls: GET /api/movies/popular?page=1
        return this.fetchWithCache(`/api/movies/popular?page=${page}`);
    }

    async getNowPlayingMovies(page = 1) {
        // calls: GET /api/movies/now-playing?page=1
        return this.fetchWithCache(`/api/movies/now-playing?page=${page}`);
    }

    async getUpcomingMovies(page = 1) {
        // calls: GET /api/movies/upcoming?page=1
        return this.fetchWithCache(`/api/movies/upcoming?page=${page}`);
    }

    async getTrendingMovies(page = 1) {
        // calls: GET /api/movies/trending?page=1
        return this.fetchWithCache(`/api/movies/trending?page=${page}`);
    }

    async getMovieDetails(movieId) {
        // calls: GET /api/movies/:id
        return this.fetchWithCache(`/api/movies/${movieId}`);
    }
}

// ✅ Global Access
window.movieAPI = new MovieAPI();
