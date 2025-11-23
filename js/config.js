// ✅ MoviesDom - config.js (SAFE VERSION)
// Centralized app and backend configuration

// TMDB image config (no key needed here)
const TMDB_CONFIG = {
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500",
    LANGUAGE: "en-US"
};

// 🔐 Your backend (Node/Express) URL
// ⬇️ yaha apna backend URL daalna (example: Render / Railway / local)
const BACKEND_CONFIG = {
    // Local development:
    // BASE_URL: "http://localhost:3000"

    // Deployed backend example:
    // BASE_URL: "https://moviesdom-backend.onrender.com"

    BASE_URL: "moviesdom-backend-production.up.railway.app" // <- abhi ke liye local rakha hai
};

const APP_CONFIG = {
    CACHE_DURATION: 1000 * 60 * 5, // 5 minutes cache
    THEME: "dark",
};

window.TMDB_CONFIG = TMDB_CONFIG;
window.BACKEND_CONFIG = BACKEND_CONFIG;
window.APP_CONFIG = APP_CONFIG;
