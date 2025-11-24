// ✅ MoviesDom - home.js (With Mock Data for Immediate Design Check)

document.addEventListener("DOMContentLoaded", () => {
    const homePage = new HomePage();
    homePage.init();
});

// --- MOCK CONFIG & DATA (Isse remove karein jab real API lagayein) ---
const TMDB_CONFIG = {
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w1280", // High Res for Hero
    POSTER_BASE_URL: "https://image.tmdb.org/t/p/w500"   // Lower Res for Cards
};

// Dummy Data Generator to Simulate API
const mockMovies = [
    { id: 1, title: "Dune: Part Two", vote_average: 8.5, year: "2024", overview: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.", backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
    { id: 2, title: "Godzilla x Kong", vote_average: 7.2, year: "2024", overview: "Two ancient titans clash in an epic battle as humans unravel their interlocking origins and connection to Skull Island's mysteries.", backdrop_path: "/sR0SpYSu82R4vfpQKwVR1sxOB8Z.jpg", poster_path: "/tM26baW7t70uS16IY3k2f8qQp0r.jpg" },
    { id: 3, title: "Kung Fu Panda 4", vote_average: 7.6, year: "2024", overview: "Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.", backdrop_path: "/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg", poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg" },
    { id: 4, title: "Civil War", vote_average: 7.8, year: "2024", overview: "A journey across a dystopian future America, following a team of military-embedded journalists as they race against time to reach DC.", backdrop_path: "/fqv8v6A64L3WIgG69Qym8O8jQL5.jpg", poster_path: "/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg" },
    { id: 5, title: "The Fall Guy", vote_average: 7.5, year: "2024", overview: "A stuntman, fresh off an almost career-ending accident, has to track down a missing movie star, solve a conspiracy and try to win back the love of his life.", backdrop_path: "/H5HjE7Xb9N09rbWn1zBfxgM7.jpg", poster_path: "/tSz1qsmSJon0rqkHBxXZmrotuse.jpg" },
    { id: 6, title: "Kingdom of the Planet of the Apes", vote_average: 8.2, year: "2024", overview: "Several generations in the future following Caesar's reign, apes are the dominant species.", backdrop_path: "/fqv8v6A64L3WIgG69Qym8O8jQL5.jpg", poster_path: "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg" }
];

// --- MAIN CLASS ---
class HomePage {
    constructor() {
        this.heroContainer = document.getElementById("heroCarousel");
        this.trendingContainer = document.getElementById("trendingMovies");
        this.nowPlayingContainer = document.getElementById("nowPlayingMovies");
        this.upcomingContainer = document.getElementById("upcomingMovies");
    }

    init() {
        console.log("Initializing MoviesDom 2.0...");
        // Real project mein yahan 'await API' call hoga.
        // Abhi hum Direct Render kar rahe hain.
        
        this.renderHeroCarousel(mockMovies.slice(0, 3)); // Top 3 for slider
        this.renderMovies(mockMovies, this.trendingContainer);
        this.renderMovies(mockMovies.reverse(), this.nowPlayingContainer); // Just shuffling for variety
        this.renderMovies(mockMovies, this.upcomingContainer);
    }

    renderHeroCarousel(movies) {
        if (!this.heroContainer) return;
        
        this.heroContainer.innerHTML = movies.map((m, index) => `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${TMDB_CONFIG.IMAGE_BASE_URL + m.backdrop_path}');">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1 class="hero-title">${m.title}</h1>
                    <p class="hero-desc">${m.overview}</p>
                    <div class="hero-buttons">
                        <button class="btn-hero btn-play"><i class="fas fa-play"></i> Play</button>
                        <button class="btn-hero btn-info"><i class="fas fa-info-circle"></i> More Info</button>
                    </div>
                </div>
            </div>
        `).join("");

        // Simple Auto-Slider Logic
        let currentSlide = 0;
        const slides = document.querySelectorAll('.hero-slide');
        
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000); // Change every 5 seconds
    }

    renderMovies(movies, container) {
        if (!container) return;
        container.innerHTML = movies.map(m => `
            <div class="movie-card">
                <img src="${TMDB_CONFIG.POSTER_BASE_URL + m.poster_path}" alt="${m.title}" class="movie-poster"/>
                <div class="movie-info">
                    <h3 class="movie-title">${m.title}</h3>
                    <div class="movie-meta">
                        <span>${m.year}</span>
                        <span class="rating"><i class="fas fa-star"></i> ${m.vote_average}</span>
                    </div>
                </div>
            </div>
        `).join("");
    }
}