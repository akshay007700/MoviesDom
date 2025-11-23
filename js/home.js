// MoviesDom - Advanced Home Page with Mock Data
class HomePage {
    constructor() {
        this.currentSlide = 0;
        this.autoSlideInterval = null;
        this.watchlist = new Set();
        this.favorites = new Set();
        this.init();
    }

    init() {
        console.log('🎬 MoviesDom Home Page Initialized');
        
        this.loadHeroCarousel();
        this.loadAllMovieSections();
        this.setupEventListeners();
        this.startAutoSlide();
        this.animateStats();
        
        // Load user preferences
        this.loadUserData();
    }

    setupEventListeners() {
        // Search input events
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.showSearchSuggestions(e.target.value);
            }, 300));

            searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions(searchInput.value);
            });
        }

        // Mobile menu
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                document.querySelector('.nav-links').classList.toggle('active');
            });
        }

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                this.hideSearchSuggestions();
            }
        });
    }

    // 🎪 Hero Carousel Functions
    loadHeroCarousel() {
        const featuredMovies = this.getFeaturedMovies();
        this.renderHeroCarousel(featuredMovies);
    }

    getFeaturedMovies() {
        return [
            {
                title: "Avengers: Endgame",
                overview: "The grave course of events set in motion by Thanos that wiped out half the universe and fractured the Avengers ranks compels the remaining Avengers to take one final stand in Marvel Studios' grand conclusion to twenty-two films.",
                rating: 8.4,
                year: 2019,
                genre: "Action, Adventure, Drama",
                badge: "Trending"
            },
            {
                title: "Spider-Man: No Way Home",
                overview: "Peter Parker's secret identity is revealed to the entire world. Desperate for help, Peter turns to Doctor Strange to make the world forget that he is Spider-Man.",
                rating: 8.2,
                year: 2021,
                genre: "Action, Adventure, Sci-Fi",
                badge: "Popular"
            },
            {
                title: "The Batman",
                overview: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
                rating: 7.8,
                year: 2022,
                genre: "Action, Crime, Drama",
                badge: "New"
            }
        ];
    }

    renderHeroCarousel(movies) {
        const container = document.getElementById('heroCarousel');
        if (!container) return;

        container.innerHTML = `
            <div class="carousel-track">
                ${movies.map((movie, index) => `
                    <div class="carousel-slide ${index === 0 ? 'active' : ''}" 
                         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="hero-content">
                            <span class="hero-badge">${movie.badge}</span>
                            <h1 class="hero-title">${movie.title}</h1>
                            <p class="hero-overview">${movie.overview}</p>
                            <div class="movie-meta">
                                <span>⭐ ${movie.rating}/10</span>
                                <span>${movie.year}</span>
                                <span>${movie.genre}</span>
                            </div>
                            <div class="hero-actions">
                                <button class="btn btn-primary" onclick="homePage.watchTrailer('${movie.title}')">
                                    <i class="fas fa-play"></i> Watch Trailer
                                </button>
                                <button class="btn btn-secondary" onclick="homePage.addToWatchlist('${movie.title}')">
                                    <i class="fas fa-plus"></i> Watchlist
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="carousel-indicators">
                ${movies.map((_, index) => `
                    <button class="indicator ${index === 0 ? 'active' : ''}" 
                            onclick="homePage.goToSlide(${index})"></button>
                `).join('')}
            </div>
            <button class="carousel-btn prev" onclick="homePage.prevSlide()">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-btn next" onclick="homePage.nextSlide()">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        if (slides.length === 0) return;

        this.currentSlide = (this.currentSlide + 1) % slides.length;
        this.updateCarousel();
    }

    prevSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;

        this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        // Reset auto-slide timer
        clearInterval(this.autoSlideInterval);
        this.startAutoSlide();
    }

    // 🎬 Movie Sections
    loadAllMovieSections() {
        this.loadTrendingMovies();
        this.loadNowPlayingMovies();
        this.loadUpcomingMovies();
    }

    loadTrendingMovies() {
        const movies = this.generateMockMovies(8, 'Trending');
        this.renderMovieSection(movies, 'trendingMovies');
    }

    loadNowPlayingMovies() {
        const movies = this.generateMockMovies(8, 'Now Playing');
        this.renderMovieSection(movies, 'nowPlayingMovies');
    }

    loadUpcomingMovies() {
        const movies = this.generateMockMovies(8, 'Upcoming');
        this.renderMovieSection(movies, 'upcomingMovies');
    }

    generateMockMovies(count, type) {
        const movieTitles = {
            'Trending': ['Avengers: Endgame', 'Spider-Man: No Way Home', 'The Batman', 'Black Panther', 'Avatar: The Way of Water', 'Top Gun: Maverick', 'Jurassic World', 'The Flash'],
            'Now Playing': ['John Wick 4', 'Guardians 3', 'Fast X', 'Transformers', 'Mission Impossible', 'The Marvels', 'Ant-Man 3', 'Dune 2'],
            'Upcoming': ['Avatar 3', 'Spider-Man 4', 'Black Panther 3', 'Avengers 5', 'Superman: Legacy', 'The Batman 2', 'Star Wars', 'Fantastic Four']
        };

        return Array(count).fill().map((_, index) => ({
            id: index + 1,
            title: movieTitles[type][index] || `${type} Movie ${index + 1}`,
            rating: (6.5 + Math.random() * 2.5).toFixed(1),
            year: 2020 + Math.floor(Math.random() * 5),
            isInWatchlist: this.watchlist.has(index + 1),
            isInFavorites: this.favorites.has(index + 1)
        }));
    }

    renderMovieSection(movies, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="homePage.viewMovie(${movie.id})">
                <div class="movie-poster" style="background: linear-gradient(45deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.1rem; text-align: center; padding: 20px;">
                    ${movie.title}
                </div>
                <div class="movie-overlay">
                    <div class="movie-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); homePage.quickView(${movie.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon ${movie.isInWatchlist ? 'active' : ''}" 
                                onclick="event.stopPropagation(); homePage.toggleWatchlist(${movie.id})">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="btn-icon ${movie.isInFavorites ? 'active' : ''}" 
                                onclick="event.stopPropagation(); homePage.toggleFavorite(${movie.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-rating">
                        <i class="fas fa-star"></i>
                        <span>${movie.rating}</span>
                        <span class="movie-year">${movie.year}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 🔍 Search Functionality
    showSearchSuggestions(query) {
        const suggestions = document.getElementById('searchSuggestions');
        if (!suggestions) return;

        if (query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }

        const mockSuggestions = [
            'Avengers: Endgame',
            'The Batman',
            'Spider-Man',
            'John Wick',
            'Avatar',
            'Black Panther',
            'Wonder Woman',
            'Superman'
        ].filter(item => item.toLowerCase().includes(query.toLowerCase()));

        if (mockSuggestions.length > 0) {
            suggestions.innerHTML = mockSuggestions.map(item => `
                <div class="suggestion-item" onclick="homePage.selectSuggestion('${item}')">
                    <i class="fas fa-search"></i>
                    <span>${item}</span>
                </div>
            `).join('');
            suggestions.classList.add('show');
        } else {
            this.hideSearchSuggestions();
        }
    }

    hideSearchSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) {
            suggestions.classList.remove('show');
        }
    }

    selectSuggestion(term) {
        document.getElementById('globalSearch').value = term;
        this.hideSearchSuggestions();
        this.performSearch();
    }

    performSearch() {
        const searchTerm = document.getElementById('globalSearch').value.trim();
        if (searchTerm) {
            this.showToast(`Searching for: ${searchTerm}`);
            // In real app: window.location.href = `movies.html?search=${encodeURIComponent(searchTerm)}`;
        } else {
            this.showToast('Please enter a search term', 'error');
        }
    }

    // ⭐ User Interactions
    viewMovie(movieId) {
        this.showToast(`Opening movie details for ID: ${movieId}`);
        // window.location.href = `movie-details.html?id=${movieId}`;
    }

    quickView(movieId) {
        this.showToast(`Quick view for movie ${movieId}`);
        // Show quick view modal
    }

    toggleWatchlist(movieId) {
        if (this.watchlist.has(movieId)) {
            this.watchlist.delete(movieId);
            this.showToast('Removed from watchlist');
        } else {
            this.watchlist.add(movieId);
            this.showToast('Added to watchlist!');
        }
        this.saveUserData();
        this.loadAllMovieSections(); // Refresh to update icons
    }

    toggleFavorite(movieId) {
        if (this.favorites.has(movieId)) {
            this.favorites.delete(movieId);
            this.showToast('Removed from favorites');
        } else {
            this.favorites.add(movieId);
            this.showToast('Added to favorites!');
        }
        this.saveUserData();
        this.loadAllMovieSections(); // Refresh to update icons
    }

    watchTrailer(movieTitle) {
        this.showToast(`Playing trailer for: ${movieTitle}`);
    }

    addToWatchlist(movieTitle) {
        this.showToast(`Added "${movieTitle}" to watchlist`);
    }

    // 📊 Animations
    animateStats() {
        const stats = [
            { element: 'totalMovies', value: 10000 },
            { element: 'totalPeople', value: 50000 },
            { element: 'totalReviews', value: 100000 },
            { element: 'totalVideos', value: 5000 }
        ];

        stats.forEach(stat => {
            this.animateValue(stat.element, 0, stat.value, 2000);
        });
    }

    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString() + '+';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // 💾 Data Management
    loadUserData() {
        const saved = localStorage.getItem('moviesdom_user');
        if (saved) {
            const data = JSON.parse(saved);
            this.watchlist = new Set(data.watchlist || []);
            this.favorites = new Set(data.favorites || []);
        }
    }

    saveUserData() {
        const data = {
            watchlist: Array.from(this.watchlist),
            favorites: Array.from(this.favorites)
        };
        localStorage.setItem('moviesdom_user', JSON.stringify(data));
    }

    // 🛠️ Utilities
    showToast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the home page
document.addEventListener('DOMContentLoaded', () => {
    window.homePage = new HomePage();
});

// Global function for search button
function performGlobalSearch() {
    if (window.homePage) {
        window.homePage.performSearch();
    }
}