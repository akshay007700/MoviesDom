// ✅ MoviesDom - home.js
// Loads movies dynamically into homepage sections

document.addEventListener("DOMContentLoaded", () => {
    const homePage = new HomePage();
    homePage.init();
});

class HomePage {
    constructor() {
        this.heroContainer = document.querySelector(".hero-carousel");
        this.trendingContainer = document.querySelector(".trending-movies");
        this.nowPlayingContainer = document.querySelector(".now-playing");
        this.upcomingContainer = document.querySelector(".upcoming-movies");
    }

    async init() {
        try {
            await this.loadHeroCarousel();
            await this.loadTrendingMovies();
            await this.loadNowPlayingMovies();
            await this.loadUpcomingMovies();
        } catch (err) {
            console.error("Error initializing homepage:", err);
        }
    }

    async loadHeroCarousel() {
        try {
            const data = await movieAPI.getPopularMovies();
            this.renderHeroCarousel(data.results.slice(0, 5));
        } catch (error) {
            console.error("Error loading hero carousel:", error);
        }
    }

    renderHeroCarousel(movies) {
        if (!this.heroContainer) return;
        this.heroContainer.innerHTML = movies
            .map(
                (m) => `
            <div class="hero-slide" style="background-image: url('${TMDB_CONFIG.IMAGE_BASE_URL + m.backdrop_path}')">
                <div class="overlay">
                    <h2>${m.title}</h2>
                    <p>${m.overview.substring(0, 120)}...</p>
                    <a href="movie-details.html?id=${m.id}" class="btn">Watch Now</a>
                </div>
            </div>`
            )
            .join("");
    }

    async loadTrendingMovies() {
        try {
            const data = await movieAPI.getTrendingMovies();
            this.renderMovies(data.results, this.trendingContainer, "Trending");
        } catch (error) {
            console.error("Error loading trending movies:", error);
        }
    }

    async loadNowPlayingMovies() {
        try {
            const data = await movieAPI.getNowPlayingMovies();
            this.renderMovies(data.results, this.nowPlayingContainer, "Now Playing");
        } catch (error) {
            console.error("Error loading now playing movies:", error);
        }
    }

    async loadUpcomingMovies() {
        try {
            const data = await movieAPI.getUpcomingMovies();
            this.renderMovies(data.results, this.upcomingContainer, "Upcoming");
        } catch (error) {
            console.error("Error loading upcoming movies:", error);
        }
    }

    renderMovies(movies, container, title = "") {
        if (!container) return;
        container.innerHTML = `
            <h2>${title}</h2>
            <div class="movie-grid">
                ${movies
                    .map(
                        (m) => `
                    <div class="movie-card">
                        <img src="${TMDB_CONFIG.IMAGE_BASE_URL + m.poster_path}" alt="${m.title}" class="movie-poster"/>
                        <h3>${m.title}</h3>
                        <p>⭐ ${m.vote_average.toFixed(1)}</p>
                    </div>`
                    )
                    .join("")}
            </div>`;
    }
}
