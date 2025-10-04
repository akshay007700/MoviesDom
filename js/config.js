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

// Enhanced API Configuration
const CONFIG = {
    TMDB_API_KEY: TMDB_CONFIG.API_KEY,
    TMDB_BASE_URL: TMDB_CONFIG.BASE_URL,
    TMDB_IMAGE_BASE_URL: TMDB_CONFIG.IMAGE_BASE_URL,
    YOUTUBE_BASE_URL: 'https://www.youtube.com/embed',
    
    // Mock data settings
    USE_MOCK_DATA: true, // Set to false to use real TMDB API
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
        poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        release_date: "2024-03-01"
    },
    {
        id: 792307,
        title: "Poor Things",
        backdrop_path: "/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg",
        poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
        release_date: "2023-12-08"
    },
    {
        id: 466420,
        title: "Killers of the Flower Moon",
        backdrop_path: "/sRvXNDItGlWCqtO3j6wks52FmbD.jpg",
        poster_path: "/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
        release_date: "2023-10-20"
    },
    {
        id: 609681,
        title: "The Marvels",
        backdrop_path: "/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg",
        poster_path: "/9GBhzXMFjgcZ3FdR9w3bUMMTps5.jpg",
        release_date: "2023-11-10"
    },
    {
        id: 603692,
        title: "John Wick: Chapter 4",
        backdrop_path: "/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
        poster_path: "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        release_date: "2023-03-24"
    },
    {
        id: 27205,
        title: "Inception",
        backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        release_date: "2010-07-16"
    },
    {
        id: 155,
        title: "The Dark Knight",
        backdrop_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        release_date: "2008-07-18"
    },
    {
        id: 680,
        title: "Pulp Fiction",
        backdrop_path: "/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",
        poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        release_date: "1994-10-14"
    },
    {
        id: 238,
        title: "The Godfather",
        backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
        poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        release_date: "1972-03-14"
    },
    {
        id: 157336,
        title: "Interstellar",
        backdrop_path: "/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        release_date: "2014-11-07"
    },
    {
        id: 299534,
        title: "Avengers: Endgame",
        backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        release_date: "2019-04-26"
    },
    {
        id: 122,
        title: "The Lord of the Rings: The Return of the King",
        backdrop_path: "/8BPZO0Bf8TeAy8znF43z8soK3ys.jpg",
        poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        release_date: "2003-12-17"
    }
];

// Mobile breakpoints
const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
};