// TMDB API Configuration
const TMDB_CONFIG = {
    API_KEY: 'e78e0bb8fb42db4fa0b56b4246151f08', // Replace with your key
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    LANGUAGE: 'en-US'
};

// App Configuration
const APP_CONFIG = {
    ITEMS_PER_PAGE: 20,
    MAX_RATING: 10,
    CACHE_DURATION: 300000 // 5 minutes
};

// Local Storage Keys
const STORAGE_KEYS = {
    WATCHLIST: 'moviesdom_watchlist',
    FAVORITES: 'moviesdom_favorites',
    USER_REVIEWS: 'moviesdom_user_reviews'
};