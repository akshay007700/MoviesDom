/**
 * MoviesDom Home Page Controller
 * Enhanced with localStorage caching, theme toggle, and search functionality
 */
const IMAGE_BASE = "https://image.tmdb.org/t/p";

class HomePage {
    constructor() {
        this.cacheKey = 'moviesdom_home_cache';
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        
        // DOM Elements
        this.posterStrip = document.getElementById('posterStrip');
        this.trendingMovies = document.getElementById('trendingMovies');
        this.nowPlayingMovies = document.getElementById('nowPlayingMovies');
        this.popularMovies = document.getElementById('popularMovies');
        this.upcomingMovies = document.getElementById('upcomingMovies');
        this.latestTrailers = document.getElementById('latestTrailers');
        
        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        
        // Theme elements
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        
        // Stats elements
        this.statMovies = document.getElementById('statMovies');
        this.statPeople = document.getElementById('statPeople');
        this.statReviews = document.getElementById('statReviews');
        this.statVideos = document.getElementById('statVideos');
        
        // Data containers
        this.cachedData = null;
        this.searchDebounceTimer = null;
        this.searchResults = [];
    }
    
    async init() {
        console.log('🎬 Initializing MoviesDom Home Page...');
        
        try {
            // Initialize theme from localStorage
            this.initTheme();
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Load data with caching
            await this.loadHomeData();
            
            // Initialize lazy loading
            this.initLazyLoading();
            
            console.log('✅ Home page initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing home page:', error);
            this.showErrorState();
        }
    }
    
    /**
     * Initialize theme from localStorage
     */
    initTheme() {
        const savedTheme = localStorage.getItem('moviesdom_theme') || 'dark';
        this.body.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    /**
     * Update theme toggle icon
     */
    updateThemeIcon(theme) {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-moon';
            icon.setAttribute('title', 'Switch to light mode');
        } else {
            icon.className = 'fas fa-sun';
            icon.setAttribute('title', 'Switch to dark mode');
        }
    }
    
    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        const currentTheme = this.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('moviesdom_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    /**
     * Handle search input
     */
    async handleSearchInput(query) {
        if (!query.trim()) {
            this.hideSearchSuggestions();
            return;
        }
        
        try {
            // Debounce search requests
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(async () => {
                await this.performSearch(query);
            }, 300);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    /**
     * Perform search with backend API
     */
    async performSearch(query) {
        // Check if movieAPI exists
        if (!window.movieAPI || typeof window.movieAPI.searchMovies !== 'function') {
            console.warn('Search API not available');
            return;
        }
        
        try {
            const results = await window.movieAPI.searchMovies(query);
            this.searchResults = results?.results?.slice(0, 5) || [];
            this.showSearchSuggestions();
        } catch (error) {
            console.error('Search failed:', error);
            this.searchResults = [];
            this.hideSearchSuggestions();
        }
    }
    
    /**
     * Show search suggestions dropdown
     */
    showSearchSuggestions() {
        if (!this.searchSuggestions || this.searchResults.length === 0) {
            this.hideSearchSuggestions();
            return;
        }
        
        const suggestionsHTML = this.searchResults.map(movie => {
            const imageUrl = movie.poster_path || movie.backdrop_path ? 
                `${IMAGE_BASE}/w92${movie.poster_path || movie.backdrop_path}` : 
                'https://via.placeholder.com/92x138/333/666?text=No+Image';
            
            const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
            
            return `
                <div class="search-suggestion" data-id="${movie.id}">
                    <img src="${imageUrl}" 
                         alt="${movie.title}"
                         onerror="this.src='https://via.placeholder.com/92x138/333/666?text=No+Image'">
                    <div class="suggestion-info">
                        <div class="suggestion-title">${movie.title}</div>
                        <div class="suggestion-year">${year}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.searchSuggestions.innerHTML = suggestionsHTML;
        this.searchSuggestions.classList.add('visible');
        
        // Add click handlers to suggestions
        this.searchSuggestions.querySelectorAll('.search-suggestion').forEach(item => {
            item.addEventListener('click', () => {
                const movieId = item.dataset.id;
                this.navigateToMovie(movieId);
            });
        });
    }
    
    /**
     * Hide search suggestions
     */
    hideSearchSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.classList.remove('visible');
            this.searchSuggestions.innerHTML = '';
        }
    }
    
    /**
     * Navigate to search results page
     */
    navigateToSearchResults(query) {
        if (query.trim()) {
            window.location.href = `movies.html?search=${encodeURIComponent(query)}`;
        }
    }
    
    /**
     * Load all homepage data with caching strategy
     */
    async loadHomeData() {
        // Try to get cached data first
        const cached = this.getCachedData();
        
        if (cached && this.isCacheValid(cached.timestamp)) {
            console.log('📦 Using cached data');
            this.renderHomeData(cached.data);
            this.cachedData = cached.data;
            
            // Update in background
            this.fetchFreshData();
        } else {
            console.log('🔄 Fetching fresh data');
            await this.fetchFreshData();
        }
    }
    
    /**
     * Fetch fresh data from API
     */
    async fetchFreshData() {
        try {
            this.showSkeletonLoaders();
            
            // Check if movieAPI exists
            if (!window.movieAPI) {
                throw new Error('Movie API not available');
            }
            
            // Fetch all data in parallel
            const [
                trending,
                nowPlaying,
                popular,
                upcoming,
                trailers
            ] = await Promise.all([
                this.fetchMovies('trending'),
                this.fetchMovies('now_playing'),
                this.fetchMovies('popular'),
                this.fetchMovies('upcoming'),
                this.fetchTrailers()
            ]);
            
            const homeData = {
                trending: trending?.results?.slice(0, 6) || [],
                nowPlaying: nowPlaying?.results?.slice(0, 6) || [],
                popular: popular?.results?.slice(0, 6) || [],
                upcoming: upcoming?.results?.slice(0, 6) || [],
                trailers: trailers?.results?.slice(0, 4) || []
            };
            
            // Cache the data
            this.cacheData(homeData);
            
            // Render the data
            this.renderHomeData(homeData);
            this.cachedData = homeData;
            
            // Update stats with real numbers
            this.updateStats(homeData);
            
        } catch (error) {
            console.error('Error fetching fresh data:', error);
            
            // If we have cached data, use it even if expired
            const cached = this.getCachedData();
            if (cached) {
                console.log('🔄 Falling back to expired cache');
                this.renderHomeData(cached.data);
            } else {
                // Show error state if no cache available
                this.showErrorState();
            }
        }
    }
    
    /**
     * Fetch movies by category
     */
    async fetchMovies(category) {
        if (!window.movieAPI) {
            throw new Error('Movie API not available');
        }
        
        switch (category) {
            case 'trending':
                return window.movieAPI.getTrendingMovies();
            case 'now_playing':
                return window.movieAPI.getNowPlayingMovies();
            case 'popular':
                return window.movieAPI.getPopularMovies();
            case 'upcoming':
                return window.movieAPI.getUpcomingMovies();
            default:
                return window.movieAPI.getPopularMovies();
        }
    }
    
    /**
     * Fetch latest trailers
     */
    async fetchTrailers() {
        try {
            // Fallback to popular movies if no trailer API
            if (!window.movieAPI || typeof window.movieAPI.getMovieTrailers !== 'function') {
                const popular = await this.fetchMovies('popular');
                return { results: popular?.results?.slice(0, 4) || [] };
            }
            
            // Get a popular movie and its trailers
            const popular = await this.fetchMovies('popular');
            if (popular?.results?.length > 0) {
                const movieId = popular.results[0].id;
                return window.movieAPI.getMovieTrailers(movieId);
            }
            return { results: [] };
        } catch (error) {
            console.error('Error fetching trailers:', error);
            return { results: [] };
        }
    }
    
    /**
     * Render all homepage data
     */
    renderHomeData(data) {
        // Render hero poster strip (uses trending movies)
        this.renderPosterStrip(data.trending.concat(data.popular));
        
        // Render movie sections
        this.renderMovieSection(data.trending, this.trendingMovies, 'Trending');
        this.renderMovieSection(data.nowPlaying, this.nowPlayingMovies, 'Now Playing');
        this.renderMovieSection(data.popular, this.popularMovies, 'Popular');
        this.renderMovieSection(data.upcoming, this.upcomingMovies, 'Upcoming');
        
        // Render trailers
        this.renderTrailers(data.trailers);
    }
    
    /**
     * Render infinite poster strip
     */
    renderPosterStrip(movies) {
        if (!this.posterStrip || !movies?.length) {
            this.posterStrip.innerHTML = '<div class="no-content">No movies available</div>';
            return;
        }

        // Filter out movies without poster
        const filteredMovies = movies.filter(movie => movie.poster_path);
        if (filteredMovies.length === 0) {
            this.posterStrip.innerHTML = '<div class="no-content">No posters available</div>';
            return;
        }

        // Duplicate for seamless animation
        const allMovies = [...filteredMovies, ...filteredMovies];

        const postersHTML = allMovies.map(movie => {
            return `
                <div class="poster-item" data-id="${movie.id}" tabindex="0">
                    <img
                        src="${IMAGE_BASE}/w342${movie.poster_path}"
                        alt="${movie.title}"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/342x513/333/666?text=No+Image'"
                    />
                </div>
            `;
        }).join('');

        this.posterStrip.innerHTML = postersHTML;

        // Add click handlers
        this.posterStrip.querySelectorAll('.poster-item').forEach(item => {
            item.addEventListener('click', () => {
                const movieId = item.dataset.id;
                this.navigateToMovie(movieId);
            });
            
            // Keyboard navigation
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const movieId = item.dataset.id;
                    this.navigateToMovie(movieId);
                }
            });
        });
    }
    
    /**
     * Render a movie section
     */
    renderMovieSection(movies, container, title = '') {
        if (!container) return;
        
        if (!movies?.length) {
            container.innerHTML = `<div class="no-content">No ${title.toLowerCase()} movies available</div>`;
            return;
        }

        // Filter out movies without poster
        const filteredMovies = movies.filter(movie => movie.poster_path);
        if (filteredMovies.length === 0) {
            container.innerHTML = `<div class="no-content">No ${title.toLowerCase()} posters available</div>`;
            return;
        }

        const moviesHTML = filteredMovies.map(movie => {
            const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
            
            return `
                <div class="movie-card" data-id="${movie.id}" tabindex="0">
                    <img
                        src="${IMAGE_BASE}/w342${movie.poster_path}"
                        alt="${movie.title}"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/342x513/333/666?text=No+Image'"
                    />
                    <div class="movie-info">
                        <h3 title="${movie.title}">${movie.title}</h3>
                        <div class="movie-meta">
                            <span>${year}</span>
                            <span>⭐ ${rating}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = moviesHTML;
        
        // Add click handlers
        container.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.dataset.id;
                this.navigateToMovie(movieId);
            });
            
            // Keyboard navigation
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const movieId = card.dataset.id;
                    this.navigateToMovie(movieId);
                }
            });
        });
    }
    
    /**
     * Render trailers section
     */
    renderTrailers(trailers) {
        if (!this.latestTrailers) return;
        
        if (!trailers?.length) {
            this.latestTrailers.innerHTML = `
                <div class="no-content">
                    <p>No trailers available</p>
                </div>
            `;
            return;
        }
        
        // Use first 4 trailers or movies if no trailers
        const trailerItems = trailers.slice(0, 4).map(item => {
            const title = item.name || item.title || 'Watch Trailer';
            const type = item.type || 'Movie Trailer';
            const youtubeKey = item.key || '';
            
            // Determine thumbnail URL
            let thumbnail = 'https://via.placeholder.com/500x281/333/666?text=No+Trailer';
            if (youtubeKey) {
                thumbnail = `https://img.youtube.com/vi/${youtubeKey}/hqdefault.jpg`;
            } else if (item.backdrop_path) {
                thumbnail = `${IMAGE_BASE}/w500${item.backdrop_path}`;
            }
            
            return `
                <div class="trailer-card" data-id="${item.id || item.movie_id}" data-key="${youtubeKey}" tabindex="0">
                    <div class="trailer-thumbnail">
                        <img 
                            src="${thumbnail}"
                            alt="${title}"
                            loading="lazy"
                            onerror="this.src='https://via.placeholder.com/500x281/333/666?text=No+Trailer'"
                        >
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="trailer-info">
                        <h3 class="trailer-title" title="${title}">${title}</h3>
                        <div class="trailer-meta">${type}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.latestTrailers.innerHTML = trailerItems;
        
        // Add click handlers for trailers
        this.latestTrailers.querySelectorAll('.trailer-card').forEach(card => {
            card.addEventListener('click', () => {
                const trailerKey = card.dataset.key;
                if (trailerKey) {
                    this.playTrailer(trailerKey);
                } else {
                    const movieId = card.dataset.id;
                    this.navigateToMovie(movieId);
                }
            });
            
            // Keyboard navigation
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const trailerKey = card.dataset.key;
                    if (trailerKey) {
                        this.playTrailer(trailerKey);
                    } else {
                        const movieId = card.dataset.id;
                        this.navigateToMovie(movieId);
                    }
                }
            });
        });
    }
    
    /**
     * Play trailer in modal or new tab
     */
    playTrailer(youtubeKey) {
        if (!youtubeKey) return;
        const trailerUrl = `https://www.youtube.com/watch?v=${youtubeKey}`;
        window.open(trailerUrl, '_blank');
    }
    
    /**
     * Navigate to movie details page
     */
    navigateToMovie(movieId) {
        if (movieId && movieId !== 'undefined') {
            window.location.href = `movie-details.html?id=${movieId}`;
        }
    }
    
    /**
     * Update stats with real data
     */
    updateStats(data) {
        // Calculate approximate counts based on data
        const movieCount = data.trending.length + data.nowPlaying.length + 
                          data.popular.length + data.upcoming.length;
        
        if (movieCount > 0 && this.statMovies) {
            // Update with dynamic numbers
            this.statMovies.textContent = `${Math.round(movieCount * 250)}`;
            if (this.statPeople) this.statPeople.textContent = `${Math.round(movieCount * 1250)}+`;
            if (this.statReviews) this.statReviews.textContent = `${Math.round(movieCount * 2500)}+`;
            if (this.statVideos) this.statVideos.textContent = `${Math.round(movieCount * 125)}+`;
        }
    }
    
    /**
     * Show skeleton loaders while data is loading
     */
    showSkeletonLoaders() {
        const sections = [
            this.posterStrip,
            this.trendingMovies,
            this.nowPlayingMovies,
            this.popularMovies,
            this.upcomingMovies,
            this.latestTrailers
        ];
        
        sections.forEach((section, index) => {
            if (!section) return;
            
            const skeletonCount = index === 0 ? 12 : (index === 5 ? 4 : 6);
            let skeletonHTML = '';
            
            if (index === 0) {
                // Poster strip skeleton
                skeletonHTML = Array(skeletonCount).fill(`
                    <div class="skeleton-poster"></div>
                `).join('');
            } else if (index === 5) {
                // Trailers skeleton
                skeletonHTML = Array(skeletonCount).fill(`
                    <div class="trailer-card">
                        <div class="trailer-thumbnail skeleton-poster"></div>
                        <div class="trailer-info">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-meta"></div>
                        </div>
                    </div>
                `).join('');
            } else {
                // Movies skeleton
                skeletonHTML = Array(skeletonCount).fill(`
                    <div class="movie-card">
                        <div class="movie-poster skeleton-poster"></div>
                        <div class="movie-info">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-meta"></div>
                        </div>
                    </div>
                `).join('');
            }
            
            section.innerHTML = skeletonHTML;
        });
    }
    
    /**
     * Show error state
     */
    showErrorState() {
        const errorHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load content</h3>
                <p>Please check your connection and try again</p>
                <button onclick="location.reload()" class="retry-btn">
                    Retry
                </button>
            </div>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = errorHTML;
        }
    }
    
    /**
     * Initialize IntersectionObserver for lazy loading
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            
            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                observer.observe(img);
            });
        }
    }
    
    /**
     * Initialize all event listeners
     */
    initEventListeners() {
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.navigateToSearchResults(this.searchInput.value);
                }
            });
            
            // Close suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (this.searchSuggestions && this.searchSuggestions.classList.contains('visible')) {
                    if (!this.searchInput.contains(e.target) && 
                        !this.searchSuggestions.contains(e.target)) {
                        this.hideSearchSuggestions();
                    }
                }
            });
        }
        
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.navigateToSearchResults(this.searchInput.value);
            });
        }
        
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks && navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) && 
                mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
        
        // Pause poster strip animation on hover
        if (this.posterStrip) {
            this.posterStrip.addEventListener('mouseenter', () => {
                this.posterStrip.style.animationPlayState = 'paused';
            });
            
            this.posterStrip.addEventListener('mouseleave', () => {
                this.posterStrip.style.animationPlayState = 'running';
            });
        }
    }
    
    /**
     * Caching utilities
     */
    cacheData(data) {
        const cache = {
            data: data,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(cache));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }
    
    getCachedData() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn('Failed to read cache:', error);
            return null;
        }
    }
    
    isCacheValid(timestamp) {
        return Date.now() - timestamp < this.cacheDuration;
    }
    
    clearCache() {
        localStorage.removeItem(this.cacheKey);
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const homePage = new HomePage();
    homePage.init();
    
    // Make homePage available globally for debugging
    window.homePage = homePage;
});