// ✅ MoviesDom - config.js
// Centralized app and TMDB configuration

const TMDB_CONFIG = {
    API_KEY: "e78e0bb8fb42db4fa0b56b4246151f08", // 🔑 Replace with your actual TMDB key
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500",
    LANGUAGE: "en-US"
};

const APP_CONFIG = {
    CACHE_DURATION: 1000 * 60 * 5, // 5 minutes cache
    THEME: "dark",
};

window.TMDB_CONFIG = TMDB_CONFIG;
window.APP_CONFIG = APP_CONFIG;
