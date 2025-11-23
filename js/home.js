// 🎬 MoviesDom - Advanced Home Page
// Enhanced with modern features and better functionality

class AdvancedHomePage {
    constructor() {
        this.currentUser = null;
        this.watchlist = new Set();
        this.favorites = new Set();
        this.currentHeroSlide = 0;
        this.heroAutoSlideInterval = null;
        this.init();
    }

    async init() {
        try {
            this.loadUserPreferences();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            
            await Promise.all([
                this.loadHeroCarousel(),
                this.loadTrendingMovies(),
                this.loadNowPlayingMovies(),
                this.loadUpcomingMovies(),
                this.loadQuickStats()
            ]);
            
            this.initHeroCarousel();
            this.initSmoothScrolling();
            this.initThemeToggle();
            
        } catch (err) {
            console.error("Error initializing homepage:", err);
            this.showErrorState();
        }
    }

    // 🎪 ENHANCED HERO CAROUSEL WITH AUTO-SLIDE
    async loadHeroCarousel() {
        try {
            const data = await movieAPI.getPopularMovies();
            const featuredMovies = data.results.slice(0, 6);
            this.renderHeroCarousel(featuredMovies);
            this.startAutoSlide();
        } catch (error) {
            console.error("Error loading hero carousel:", error);
        }
    }

    renderHeroCarousel(movies) {
        const heroContainer = document.querySelector('.hero-carousel');
        if (!heroContainer) return;

        heroContainer.innerHTML = `
            <div class="carousel-track">
                ${movies.map((movie, index) => `
                    <div class="hero-slide ${index === 0 ? 'active' : ''}" 
                         style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${TMDB_CONFIG.IMAGE_BASE_URL + movie.backdrop_path}')">
                        <div class="hero-content">
                            <span class="hero-badge">🔥 Trending</span>
                            <h2 class="hero-title">${movie.title}</h2>
                            <p class="hero-overview">${movie.overview.substring(0, 150)}...</p>
                            <div class="hero-meta">
                                <span class="rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                                <span class="year">${new Date(movie.release_date).getFullYear()}</span>
                            </div>
                            <div class="hero-actions">
                                <a href="movie-details.html?id=${movie.id}" class="btn btn-primary">
                                    <i class="fas fa-play"></i> Watch Now
                                </a>
                                <button class="btn btn-secondary" onclick="homePage.addToWatchlist(${movie.id})">
                                    <i class="fas fa-bookmark"></i> Watchlist
                                </button>
                                <button class="btn btn-secondary" onclick="homePage.addToFavorites(${movie.id})">
                                    <i class="fas fa-heart"></i> Favorite
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
            <button class="carousel-btn prev" onclick="homePage.prevSlide()">❮</button>
            <button class="carousel-btn next" onclick="homePage.nextSlide()">❯</button>
        `;
    }

    // 🔄 AUTO-SLIDE FUNCTIONALITY
    startAutoSlide() {
        this.heroAutoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    nextSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        const indicators = document.querySelectorAll('.indicator');
        if (slides.length === 0) return;

        this.currentHeroSlide = (this.currentHeroSlide + 1) % slides.length;
        this.updateCarousel();
    }

    prevSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        this.currentHeroSlide = (this.currentHeroSlide - 1 + slides.length) % slides.length;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentHeroSlide = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const slides = document.querySelectorAll('.hero-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentHeroSlide);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentHeroSlide);
        });
    }

    // 🎯 ENHANCED MOVIE SECTIONS WITH LAZY LOADING
    async loadTrendingMovies() {
        try {
            const data = await movieAPI.getTrendingMovies();
            this.renderMovieSection(data.results.slice(0, 8), 'trendingMovies', 'Trending Now', 'fire');
        } catch (error) {
            console.error("Error loading trending movies:", error);
        }
    }

    async loadNowPlayingMovies() {
        try {
            const data = await movieAPI.getNowPlayingMovies();
            this.renderMovieSection(data.results.slice(0, 8), 'nowPlayingMovies', 'Now Playing', 'ticket-alt');
        } catch (error) {
            console.error("Error loading now playing movies:", error);
        }
    }

    async loadUpcomingMovies() {
        try {
            const data = await movieAPI.getUpcomingMovies();
            this.renderMovieSection(data.results.slice(0, 8), 'upcomingMovies', 'Coming Soon', 'calendar-alt');
        } catch (error) {
            console.error("Error loading upcoming movies:", error);
        }
    }

    renderMovieSection(movies, containerId, title, icon) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="section-header">
                <h3><i class="fas fa-${icon}"></i> ${title}</h3>
                <a href="movies.html?filter=${containerId.replace('Movies', '').toLowerCase()}" class="see-all">
                    See All <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <div class="movies-grid">
                ${movies.map(movie => `
                    <div class="movie-card" data-movie-id="${movie.id}">
                        <div class="movie-poster-container">
                            <img src="${TMDB_CONFIG.IMAGE_BASE_URL + movie.poster_path}" 
                                 alt="${movie.title}" 
                                 class="movie-poster"
                                 loading="lazy">
                            <div class="movie-overlay">
                                <button class="btn-icon" onclick="homePage.quickView(${movie.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="homePage.addToWatchlist(${movie.id})">
                                    <i class="fas fa-bookmark"></i>
                                </button>
                                <button class="btn-icon" onclick="homePage.addToFavorites(${movie.id})">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                            <span class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                        </div>
                        <div class="movie-info">
                            <h4 class="movie-title">${movie.title}</h4>
                            <p class="movie-year">${new Date(movie.release_date).getFullYear()}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 📊 ADVANCED QUICK STATS
    async loadQuickStats() {
        try {
            // Simulate real stats - in real app, you'd fetch these from API
            const stats = {
                movies: '10,000+',
                people: '50,000+',
                reviews: '100,000+',
                videos: '5,000+'
            };

            Object.keys(stats).forEach(stat => {
                const element = document.getElementById(`total${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
                if (element) {
                    this.animateCounter(element, 0, parseInt(stats[stat].replace('+', '').replace(',', '')), 2000);
                }
            });
        } catch (error) {
            console.error("Error loading quick stats:", error);
        }
    }

    animateCounter(element, start, end, duration) {
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

    // ⭐ USER INTERACTION FEATURES
    addToWatchlist(movieId) {
        if (this.watchlist.has(movieId)) {
            this.watchlist.delete(movieId);
            this.showToast('Removed from watchlist', 'info');
        } else {
            this.watchlist.add(movieId);
            this.showToast('Added to watchlist!', 'success');
        }
        this.saveUserPreferences();
    }

    addToFavorites(movieId) {
        if (this.favorites.has(movieId)) {
            this.favorites.delete(movieId);
            this.showToast('Removed from favorites', 'info');
        } else {
            this.favorites.add(movieId);
            this.showToast('Added to favorites!', 'success');
        }
        this.saveUserPreferences();
    }

    async quickView(movieId) {
        try {
            const movie = await movieAPI.getMovieDetails(movieId);
            this.showQuickViewModal(movie);
        } catch (error) {
            console.error('Error in quick view:', error);
        }
    }

    showQuickViewModal(movie) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="quick-view-content">
                    <img src="${TMDB_CONFIG.IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}">
                    <div class="quick-view-info">
                        <h3>${movie.title}</h3>
                        <p class="overview">${movie.overview}</p>
                        <div class="meta-info">
                            <span>⭐ ${movie.vote_average}</span>
                            <span>${movie.runtime} min</span>
                            <span>${new Date(movie.release_date).getFullYear()}</span>
                        </div>
                        <div class="actions">
                            <a href="movie-details.html?id=${movie.id}" class="btn btn-primary">View Details</a>
                            <button class="btn btn-secondary" onclick="homePage.addToWatchlist(${movie.id})">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 🎨 ADVANCED UI FEATURES
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.featured-section').forEach(section => {
            observer.observe(section);
        });
    }

    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    initThemeToggle() {
        // Add theme toggle functionality
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.onclick = this.toggleTheme;
        
        const nav = document.querySelector('.nav-links');
        if (nav) {
            nav.appendChild(themeToggle);
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    }

    // 💾 PERSISTENCE & UTILITIES
    loadUserPreferences() {
        const saved = localStorage.getItem('moviesdom_user');
        if (saved) {
            const data = JSON.parse(saved);
            this.watchlist = new Set(data.watchlist || []);
            this.favorites = new Set(data.favorites || []);
        }
    }

    saveUserPreferences() {
        const data = {
            watchlist: Array.from(this.watchlist),
            favorites: Array.from(this.favorites)
        };
        localStorage.setItem('moviesdom_user', JSON.stringify(data));
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showErrorState() {
        const containers = ['trendingMovies', 'nowPlayingMovies', 'upcomingMovies'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load content</p>
                        <button onclick="homePage.init()" class="btn btn-primary">Retry</button>
                    </div>
                `;
            }
        });
    }
}

// 🎬 Initialize Enhanced Home Page
document.addEventListener("DOMContentLoaded", () => {
    window.homePage = new AdvancedHomePage();
});

// 🔍 GLOBAL SEARCH ENHANCEMENT
function performGlobalSearch() {
    const searchTerm = document.getElementById('globalSearch').value.trim();
    if (searchTerm) {
        window.location.href = `movies.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Add real-time search suggestions
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            // Implement search suggestions here
        }, 300));
    }
});

function debounce(func, wait) {
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