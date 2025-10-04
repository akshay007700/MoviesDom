// TMDB API Configuration
const TMDB_CONFIG = {
    API_KEY: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNzhlMGJiOGZiNDJkYjRmYTBiNTZiNDI0NjE1MWYwOCIsIm5iZiI6MTc1ODQ5MDE2MC4zMzMsInN1YiI6IjY4ZDA2ZTMwODQ0YTFmMGUxZWZlOTcxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4eCjy3pNJMWTLKicA_U_3Vg0umJH-Kht5SzyGk14azE', // Replace with your key
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