// ✅ MoviesDom - home.js (Updated for new design with TMDB API)
// Modern homepage with TMDB API integration + New Features

document.addEventListener("DOMContentLoaded", () => {
    const homePage = new ModernHomePage();
    homePage.init();
});

class ModernHomePage {
    constructor() {
        // Existing elements
        this.heroSlider = document.getElementById("heroSlider");
        this.heroTitle = document.getElementById("heroTitle");
        this.heroDescription = document.getElementById("heroDescription");
        this.sliderDots = document.getElementById("sliderDots");
        
        // Grid containers
        this.trendingContainer = document.getElementById("trendingMoviesGrid");
        this.nowPlayingContainer = document.getElementById("nowPlayingMoviesGrid");
        this.upcomingContainer = document.getElementById("upcomingMoviesGrid");
        this.trailersContainer = document.getElementById("trailersSlider");
        
        // New elements for infinite strip
        this.posterStrip = document.getElementById("posterStrip");
        
        // Store API data
        this.heroMovies = [];
        this.trendingMovies = [];
        this.nowPlayingMovies = [];
        this.upcomingMovies = [];
        this.posterMovies = [];
        
        // Category filter
        this.currentFilter = 'all';
    }

    async init() {
        try {
            console.log("🎬 Initializing MoviesDom Homepage with new design...");
            
            // Check if API is available
            if (!movieAPI) {
                throw new Error("Movie API not found");
            }
            
            // Load all data in parallel for better performance
            await Promise.all([
                this.loadHeroCarousel(),
                this.loadInfinitePosterStrip(),  // New function
                this.loadTrendingMovies(),
                this.loadNowPlayingMovies(),
                this.loadUpcomingMovies(),
                this.loadMovieTrailers()
            ]);
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Start hero slider autoplay
            this.startSlideShow();
            
            // Initialize navbar scroll effect
            this.initNavbarScroll();
            
            console.log("✅ Homepage fully loaded with TMDB data and new design");
            
        } catch (err) {
            console.error("❌ Error initializing homepage:", err);
            this.showErrorMessage();
        }
    }

    // ========== NEW: INFINITE POSTER STRIP ==========
    async loadInfinitePosterStrip() {
        try {
            console.log("🔄 Loading infinite poster strip...");
            const data = await movieAPI.getPopularMovies();
            
            if (!data || !data.results || data.results.length === 0) {
                throw new Error("No movies found for poster strip");
            }
            
            this.posterMovies = data.results.slice(0, 15);
            this.renderInfinitePosterStrip();
            console.log(`✅ Loaded ${this.posterMovies.length} movies for infinite strip`);
            
        } catch (error) {
            console.error("Error loading infinite poster strip:", error);
            this.renderFallbackPosterStrip();
        }
    }

    renderInfinitePosterStrip() {
        if (!this.posterStrip || this.posterMovies.length === 0) return;
        
        // Create duplicate for seamless infinite scroll
        const allMovies = [...this.posterMovies, ...this.posterMovies];
        
        this.posterStrip.innerHTML = allMovies.map(movie => `
            <div class="poster-item" data-id="${movie.id}">
                <img src="${movie.poster_path ? TMDB_CONFIG.IMAGE_BASE_URL + movie.poster_path : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'}" 
                     alt="${movie.title}" 
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'">
            </div>
        `).join('');
        
        // Add click handlers
        this.posterStrip.querySelectorAll('.poster-item').forEach(item => {
            item.addEventListener('click', () => {
                const movieId = item.dataset.id;
                this.viewMovieDetails(movieId);
            });
        });
    }

    renderFallbackPosterStrip() {
        if (!this.posterStrip) return;
        
        // Fallback posters if API fails
        const fallbackPosters = Array(30).fill().map((_, i) => `
            <div class="poster-item" data-id="fallback-${i}">
                <img src="https://picsum.photos/seed/movie${i}/180/270" 
                     alt="Fallback Movie ${i+1}" 
                     loading="lazy">
            </div>
        `).join('');
        
        this.posterStrip.innerHTML = fallbackPosters;
    }

    // ========== NEW: CATEGORY FILTER ==========
    filterContent(category) {
        this.currentFilter = category;
        console.log(`Filtering content by: ${category}`);
        
        // Update active chip
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.remove('active');
            if(chip.dataset.filter === category) {
                chip.classList.add('active');
            }
        });
        
        // In a real implementation, you would filter movies here
        // For now, just show a message
        if(category !== 'all') {
            // Show loading state
            this.showFilteredContent(category);
        }
    }

    async showFilteredContent(category) {
        try {
            let apiCall;
            
            switch(category) {
                case 'south':
                    // For South Indian movies - you'd need specific API or filtering
                    apiCall = movieAPI.getPopularMovies();
                    break;
                case 'bollywood':
                    // Bollywood movies - filter by language or region
                    apiCall = movieAPI.getPopularMovies();
                    break;
                case 'hollywood':
                    // Hollywood movies
                    apiCall = movieAPI.getPopularMovies();
                    break;
                case 'adult':
                    // Adult content - handle with care
                    this.showAdultContentNotice();
                    return;
                default:
                    return;
            }
            
            const data = await apiCall;
            if(data && data.results) {
                // Update trending section with filtered content
                this.trendingMovies = data.results.slice(0, 6);
                this.renderMovies(this.trendingMovies, this.trendingContainer, "filtered");
            }
            
        } catch (error) {
            console.error(`Error loading ${category} content:`, error);
        }
    }

    showAdultContentNotice() {
        // Show a modal or alert for adult content
        alert("Adult Cinema content is presented for informational and editorial purposes only. Please ensure you are 18+ to view this content.");
        
        // In a real implementation, you would:
        // 1. Show age verification modal
        // 2. Redirect to adult content page with proper warnings
        // 3. Log the access appropriately
    }

    // ========== ENHANCED: SEARCH SUGGESTIONS ==========
    initSearchSuggestions() {
        const searchInput = document.getElementById('globalSearch');
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        if(!searchInput || !searchSuggestions) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = searchInput.value.trim();
            
            if(query.length < 2) {
                searchSuggestions.style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this.performSearchSuggestions(query);
            }, 300);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if(!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });
    }

    async performSearchSuggestions(query) {
        try {
            if(!movieAPI || !movieAPI.searchMovies) return;
            
            const data = await movieAPI.searchMovies(query);
            const searchSuggestions = document.getElementById('searchSuggestions');
            
            if(!searchSuggestions || !data || !data.results) return;
            
            const movies = data.results.slice(0, 5);
            
            if(movies.length === 0) {
                searchSuggestions.innerHTML = `
                    <div class="suggestion-item">
                        <i class="fas fa-search suggestion-icon"></i>
                        <div class="suggestion-text">
                            <div class="suggestion-title">No results found</div>
                            <div class="suggestion-meta">Try different keywords</div>
                        </div>
                    </div>
                `;
            } else {
                searchSuggestions.innerHTML = movies.map(movie => `
                    <div class="suggestion-item" data-id="${movie.id}">
                        <i class="fas fa-film suggestion-icon"></i>
                        <div class="suggestion-text">
                            <div class="suggestion-title">${movie.title}</div>
                            <div class="suggestion-meta">
                                ${movie.release_date ? movie.release_date.substring(0, 4) : 'Movie'} • 
                                Rating: ${movie.vote_average?.toFixed(1) || 'N/A'}
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Add click handlers
                searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const movieId = item.dataset.id;
                        this.viewMovieDetails(movieId);
                        searchSuggestions.style.display = 'none';
                    });
                });
            }
            
            searchSuggestions.style.display = 'block';
            
        } catch (error) {
            console.error('Search suggestions error:', error);
        }
    }

    // ========== UPDATED: EVENT LISTENERS ==========
    initEventListeners() {
        // Hero slider controls (existing)
        const prevSlideBtn = document.getElementById('prevSlide');
        const nextSlideBtn = document.getElementById('nextSlide');
        
        if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => this.prevSlide());
        if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => this.nextSlide());
        
        // Trailer slider navigation (existing)
        const prevTrailerBtn = document.getElementById('prevTrailer');
        const nextTrailerBtn = document.getElementById('nextTrailer');
        
        if (prevTrailerBtn && this.trailersContainer) {
            prevTrailerBtn.addEventListener('click', () => {
                this.trailersContainer.scrollBy({ left: -350, behavior: 'smooth' });
            });
        }
        
        if (nextTrailerBtn && this.trailersContainer) {
            nextTrailerBtn.addEventListener('click', () => {
                this.trailersContainer.scrollBy({ left: 350, behavior: 'smooth' });
            });
        }
        
        // Mobile menu (existing)
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Pause hero slider on hover (existing)
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                if (this.slideInterval) {
                    clearInterval(this.slideInterval);
                }
            });
            
            heroSection.addEventListener('mouseleave', () => {
                this.startSlideShow();
            });
        }
        
        // New: Infinite poster strip hover control
        if (this.posterStrip) {
            this.posterStrip.addEventListener('mouseenter', () => {
                this.posterStrip.style.animationPlayState = 'paused';
            });
            
            this.posterStrip.addEventListener('mouseleave', () => {
                this.posterStrip.style.animationPlayState = 'running';
            });
        }
        
        // New: Search suggestions
        this.initSearchSuggestions();
        
        // New: Category chips
        document.querySelectorAll('.category-chip[data-filter]').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = chip.dataset.filter;
                this.filterContent(filter);
            });
        });
        
        // Search input enter key
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    }

    // ========== REST OF THE EXISTING FUNCTIONS REMAIN SAME ==========
    // loadHeroCarousel(), renderHeroCarousel(), updateHeroContent(),
    // goToSlide(), nextSlide(), prevSlide(), startSlideShow(),
    // loadTrendingMovies(), loadNowPlayingMovies(), loadUpcomingMovies(),
    // loadMovieTrailers(), renderMovies(), renderTrailers(),
    // initNavbarScroll(), viewMovieDetails(), addToWatchlist(),
    // watchMovieTrailer(), playTrailer(), performSearch(),
    // showErrorMessage() - ALL THESE FUNCTIONS REMAIN EXACTLY THE SAME
    // as in your original home.js file
    
    // ========== EXISTING FUNCTIONS (COPY FROM YOUR ORIGINAL home.js) ==========
    // I'm not copying all of them here to save space, but you should keep them
    // They should work exactly as before
    
}

// Make homePage available globally
let homePage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    homePage = new ModernHomePage();
    homePage.init();
});

// Global functions for backward compatibility
function performGlobalSearch() {
    if (homePage) {
        homePage.performSearch();
    }
}