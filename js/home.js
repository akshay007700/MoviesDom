// Home page functionality
class HomePage {
    constructor() {
        this.currentTrendingPage = 1;
        this.currentNowPlayingPage = 1;
        this.currentUpcomingPage = 1;
        this.init();
    }

    async init() {
        await this.loadHeroCarousel();
        await this.loadTrendingMovies();
        await this.loadNowPlayingMovies();
        await this.loadUpcomingMovies();
        this.setupEventListeners();
        this.updateQuickStats();
    }

    async loadHeroCarousel() {
        try {
            const data = await movieAPI.getPopularMovies(1);
            const heroMovies = data.results.slice(0, 5);
            this.renderHeroCarousel(heroMovies);
        } catch (error) {
            console.error('Error loading hero carousel:', error);
        }
    }

    renderHeroCarousel(movies) {
        const carousel = document.getElementById('heroCarousel');
        carousel.innerHTML = movies.map((movie, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <div class="hero-background" style="background-image: url('https://image.tmdb.org/t/p/w1280${movie.backdrop_path}')"></div>
                <div class="hero-content">
                    <h2>${movie.title}</h2>
                    <p>${movie.overview.substring(0, 150)}...</p>
                    <div class="hero-rating">⭐ ${movie.vote_average}/10</div>
                    <button class="btn btn-primary" onclick="viewMovieDetails(${movie.id})">
                        <i class="fas fa-play"></i> Watch Trailer
                    </button>
                    <button class="btn btn-secondary" onclick="addToWatchlist(${movie.id})">
                        <i class="fas fa-plus"></i> Watchlist
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadTrendingMovies() {
        try {
            const data = await movieAPI.getPopularMovies(this.currentTrendingPage);
            this.renderMovies(data.results, 'trendingMovies');
        } catch (error) {
            console.error('Error loading trending movies:', error);
        }
    }

    async loadNowPlayingMovies() {
        try {
            const data = await movieAPI.getNowPlaying(this.currentNowPlayingPage);
            this.renderMovies(data.results, 'nowPlayingMovies');
        } catch (error) {
            console.error('Error loading now playing movies:', error);
        }
    }

    async loadUpcomingMovies() {
        try {
            const data = await movieAPI.getUpcomingMovies(this.currentUpcomingPage);
            this.renderMovies(data.results, 'upcomingMovies');
        } catch (error) {
            console.error('Error loading upcoming movies:', error);
        }
    }

    renderMovies(movies, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="viewMovieDetails(${movie.id})">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
                        <span class="movie-rating">
                            <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                        </span>
                    </div>
                    <div class="movie-actions">
                        <button class="btn btn-primary" onclick="event.stopPropagation(); viewMovieDetails(${movie.id})">
                            Details
                        </button>
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); addToWatchlist(${movie.id})">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateQuickStats() {
        // Simulate stats - in real app, you'd get these from API
        document.getElementById('totalMovies').textContent = '50,000+';
        document.getElementById('totalPeople').textContent = '200,000+';
        document.getElementById('totalReviews').textContent = '1M+';
        document.getElementById('totalVideos').textContent = '10,000+';
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('globalSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performGlobalSearch();
            }
        });

        // Mobile menu
        document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });
    }

    performGlobalSearch() {
        const query = document.getElementById('globalSearch').value.trim();
        if (query) {
            window.location.href = `movies.html?search=${encodeURIComponent(query)}`;
        }
    }
}

// Global functions
function viewMovieDetails(movieId) {
    window.location.href = `movie-details.html?id=${movieId}`;
}

function addToWatchlist(movieId) {
    const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
    if (!watchlist.includes(movieId)) {
        watchlist.push(movieId);
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
        showNotification('Added to watchlist!', 'success');
    } else {
        showNotification('Already in watchlist!', 'warning');
    }
}

function showNotification(message, type = 'info') {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});