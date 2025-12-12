// ✅ MoviesDom - home.js (Updated for TMDB API)
// Modern homepage with TMDB API integration

document.addEventListener("DOMContentLoaded", () => {
    const homePage = new ModernHomePage();
    homePage.init();
});

class ModernHomePage {
    constructor() {
        // Hero section elements
        this.heroSlider = document.getElementById("heroSlider");
        this.heroTitle = document.getElementById("heroTitle");
        this.heroDescription = document.getElementById("heroDescription");
        this.sliderDots = document.getElementById("sliderDots");
        
        // Grid containers
        this.trendingContainer = document.getElementById("trendingMoviesGrid");
        this.nowPlayingContainer = document.getElementById("nowPlayingMoviesGrid");
        this.upcomingContainer = document.getElementById("upcomingMoviesGrid");
        this.trailersContainer = document.getElementById("trailersSlider");
        this.clipsContainer = document.getElementById("clipsContainer");
        this.newsContainer = document.getElementById("newsContainer");
        
        // Hero slider variables
        this.currentSlide = 0;
        this.slideInterval = null;
        
        // Store API data
        this.heroMovies = [];
        this.trendingMovies = [];
        this.nowPlayingMovies = [];
        this.upcomingMovies = [];
    }

    async init() {
        try {
            console.log("🎬 Initializing MoviesDom Homepage...");
            
            // Check if API is available
            if (!movieAPI) {
                throw new Error("Movie API not found");
            }
            
            // Load all data in parallel for better performance
            await Promise.all([
                this.loadHeroCarousel(),
                this.loadTrendingMovies(),
                this.loadNowPlayingMovies(),
                this.loadUpcomingMovies(),
                this.loadMovieTrailers(),
                this.loadMovieClips(),
                this.loadMovieNews()
            ]);
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Start hero slider autoplay
            this.startSlideShow();
            
            // Initialize navbar scroll effect
            this.initNavbarScroll();
            
            console.log("✅ Homepage fully loaded with TMDB data");
            
        } catch (err) {
            console.error("❌ Error initializing homepage:", err);
            this.showErrorMessage();
        }
    }

    // ========== HERO CAROUSEL ==========
    async loadHeroCarousel() {
        try {
            console.log("🔄 Loading hero carousel...");
            const data = await movieAPI.getPopularMovies();
            
            if (!data || !data.results || data.results.length === 0) {
                throw new Error("No popular movies found");
            }
            
            this.heroMovies = data.results.slice(0, 5);
            this.renderHeroCarousel(this.heroMovies);
            console.log(`✅ Loaded ${this.heroMovies.length} hero movies`);
            
        } catch (error) {
            console.error("Error loading hero carousel:", error);
            throw error;
        }
    }

    renderHeroCarousel(movies) {
        if (!this.heroSlider || movies.length === 0) return;
        
        this.heroSlider.innerHTML = '';
        this.sliderDots.innerHTML = '';
        
        movies.forEach((movie, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            
            // Use backdrop image or poster as fallback
            const bgImage = movie.backdrop_path 
                ? TMDB_CONFIG.IMAGE_BASE_URL + movie.backdrop_path
                : movie.poster_path 
                    ? TMDB_CONFIG.IMAGE_BASE_URL + movie.poster_path
                    : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1925&q=80';
            
            slide.style.backgroundImage = `url('${bgImage}')`;
            slide.dataset.index = index;
            slide.dataset.movieId = movie.id;
            this.heroSlider.appendChild(slide);
            
            // Create dot
            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.addEventListener('click', () => this.goToSlide(index));
            this.sliderDots.appendChild(dot);
        });
        
        // Set initial content
        if (movies.length > 0) {
            this.updateHeroContent(movies[0]);
        }
    }

    updateHeroContent(movie) {
        if (!movie) return;
        
        if (this.heroTitle) {
            this.heroTitle.textContent = movie.title || movie.original_title;
        }
        
        if (this.heroDescription) {
            const description = movie.overview 
                ? (movie.overview.length > 150 ? movie.overview.substring(0, 150) + '...' : movie.overview)
                : "An epic cinematic experience.";
            this.heroDescription.textContent = description;
        }
        
        // Update meta info
        const ratingElement = document.querySelector('.rating');
        const yearElement = document.querySelectorAll('.hero-meta-item span')[1];
        const genreElement = document.querySelectorAll('.hero-meta-item span')[3];
        
        if (ratingElement) {
            ratingElement.textContent = movie.vote_average?.toFixed(1) || "8.5";
        }
        
        if (yearElement && movie.release_date) {
            yearElement.textContent = movie.release_date.substring(0, 4);
        }
        
        if (genreElement) {
            // In real implementation, you would fetch genre names
            genreElement.textContent = "Action, Adventure";
        }
        
        // Update button actions
        const watchTrailerBtn = document.getElementById('watchTrailerBtn');
        const viewDetailsBtn = document.getElementById('viewDetailsBtn');
        
        if (watchTrailerBtn) {
            watchTrailerBtn.onclick = () => this.watchMovieTrailer(movie.id);
        }
        
        if (viewDetailsBtn) {
            viewDetailsBtn.onclick = () => this.viewMovieDetails(movie.id);
        }
    }

    goToSlide(slideIndex) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slider-dot');
        
        if (slides.length === 0 || !this.heroMovies[slideIndex]) return;
        
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
        
        // Update current slide index
        this.currentSlide = slideIndex;
        
        // Update hero content
        this.updateHeroContent(this.heroMovies[slideIndex]);
    }

    nextSlide() {
        if (this.heroMovies.length === 0) return;
        this.currentSlide = (this.currentSlide + 1) % this.heroMovies.length;
        this.goToSlide(this.currentSlide);
    }

    prevSlide() {
        if (this.heroMovies.length === 0) return;
        this.currentSlide = (this.currentSlide - 1 + this.heroMovies.length) % this.heroMovies.length;
        this.goToSlide(this.currentSlide);
    }

    startSlideShow() {
        if (this.heroMovies.length > 1) {
            this.slideInterval = setInterval(() => this.nextSlide(), 5000);
        }
    }

    // ========== TRENDING MOVIES ==========
    async loadTrendingMovies() {
        try {
            console.log("🔄 Loading trending movies...");
            const data = await movieAPI.getTrendingMovies();
            
            if (!data || !data.results) {
                throw new Error("No trending movies found");
            }
            
            this.trendingMovies = data.results.slice(0, 6);
            this.renderMovies(this.trendingMovies, this.trendingContainer, "trending");
            console.log(`✅ Loaded ${this.trendingMovies.length} trending movies`);
            
        } catch (error) {
            console.error("Error loading trending movies:", error);
            throw error;
        }
    }

    // ========== NOW PLAYING MOVIES ==========
    async loadNowPlayingMovies() {
        try {
            console.log("🔄 Loading now playing movies...");
            const data = await movieAPI.getNowPlayingMovies();
            
            if (!data || !data.results) {
                throw new Error("No now playing movies found");
            }
            
            this.nowPlayingMovies = data.results.slice(0, 6);
            this.renderMovies(this.nowPlayingMovies, this.nowPlayingContainer, "now-playing");
            console.log(`✅ Loaded ${this.nowPlayingMovies.length} now playing movies`);
            
        } catch (error) {
            console.error("Error loading now playing movies:", error);
            throw error;
        }
    }

    // ========== UPCOMING MOVIES ==========
    async loadUpcomingMovies() {
        try {
            console.log("🔄 Loading upcoming movies...");
            const data = await movieAPI.getUpcomingMovies();
            
            if (!data || !data.results) {
                throw new Error("No upcoming movies found");
            }
            
            this.upcomingMovies = data.results.slice(0, 6);
            this.renderMovies(this.upcomingMovies, this.upcomingContainer, "upcoming");
            console.log(`✅ Loaded ${this.upcomingMovies.length} upcoming movies`);
            
        } catch (error) {
            console.error("Error loading upcoming movies:", error);
            throw error;
        }
    }

    // ========== TRAILERS ==========
    async loadMovieTrailers() {
        try {
            console.log("🔄 Loading movie trailers...");
            
            // Get popular movies first
            const data = await movieAPI.getPopularMovies();
            if (!data || !data.results) {
                throw new Error("No movies found for trailers");
            }
            
            // Get trailers for first 4 movies
            const movieIds = data.results.slice(0, 4).map(movie => movie.id);
            const trailerPromises = movieIds.map(id => movieAPI.getMovieVideos(id));
            const trailersData = await Promise.all(trailerPromises);
            
            // Process trailer data
            const trailers = [];
            trailersData.forEach((trailerData, index) => {
                if (trailerData && trailerData.results && trailerData.results.length > 0) {
                    const movie = data.results[index];
                    const trailer = trailerData.results.find(v => v.type === 'Trailer' || v.site === 'YouTube');
                    
                    if (trailer && movie) {
                        trailers.push({
                            movieId: movie.id,
                            title: movie.title,
                            trailerKey: trailer.key,
                            thumbnail: `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`,
                            views: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}M`, // Simulated
                            date: this.getRandomDate()
                        });
                    }
                }
            });
            
            this.renderTrailers(trailers.slice(0, 4));
            console.log(`✅ Loaded ${trailers.length} trailers`);
            
        } catch (error) {
            console.error("Error loading trailers:", error);
            // Show placeholder trailers
            this.renderTrailers([]);
        }
    }

    // ========== CLIPS ==========
    async loadMovieClips() {
        try {
            console.log("🔄 Loading movie clips...");
            
            // Get top rated movies for clips
            const data = await movieAPI.getTopRatedMovies();
            if (!data || !data.results) {
                throw new Error("No movies found for clips");
            }
            
            const clips = data.results.slice(0, 8).map((movie, index) => ({
                movieId: movie.id,
                title: `${movie.title.substring(0, 20)}${movie.title.length > 20 ? '...' : ''}`,
                duration: `${Math.floor(Math.random() * 2) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                views: `${Math.floor(Math.random() * 900) + 100}K`,
                thumbnail: movie.poster_path 
                    ? TMDB_CONFIG.IMAGE_BASE_URL + movie.poster_path
                    : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            }));
            
            this.renderClips(clips);
            console.log(`✅ Loaded ${clips.length} clips`);
            
        } catch (error) {
            console.error("Error loading clips:", error);
            this.renderClips([]);
        }
    }

    // ========== NEWS ==========
    async loadMovieNews() {
        try {
            console.log("🔄 Loading movie news...");
            
            // Get upcoming movies for news
            const data = await movieAPI.getUpcomingMovies();
            if (!data || !data.results) {
                throw new Error("No movies found for news");
            }
            
            const news = data.results.slice(0, 3).map((movie, index) => ({
                movieId: movie.id,
                title: `${movie.title} ${index === 0 ? 'Breaks Box Office Records' : index === 1 ? 'Announced at Comic-Con' : 'Award Predictions'}`,
                excerpt: movie.overview 
                    ? (movie.overview.length > 120 ? movie.overview.substring(0, 120) + '...' : movie.overview)
                    : "Exciting news about this upcoming movie!",
                date: this.formatDate(new Date()),
                image: movie.backdrop_path 
                    ? TMDB_CONFIG.IMAGE_BASE_URL + movie.backdrop_path
                    : movie.poster_path 
                        ? TMDB_CONFIG.IMAGE_BASE_URL + movie.poster_path
                        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            }));
            
            this.renderNews(news);
            console.log(`✅ Loaded ${news.length} news items`);
            
        } catch (error) {
            console.error("Error loading news:", error);
            this.renderNews([]);
        }
    }

    // ========== RENDER FUNCTIONS ==========
    renderMovies(movies, container, type = "movie") {
        if (!container || !movies || movies.length === 0) {
            container.innerHTML = '<p class="no-data">No movies found</p>';
            return;
        }
        
        container.innerHTML = movies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <img src="${movie.poster_path ? TMDB_CONFIG.IMAGE_BASE_URL + movie.poster_path : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title || movie.original_title}</h3>
                    <div class="movie-meta">
                        <span class="movie-genre">${movie.release_date ? movie.release_date.substring(0, 4) : '2024'}</span>
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            <span>${movie.vote_average?.toFixed(1) || '8.0'}</span>
                        </div>
                    </div>
                    <div class="movie-actions">
                        <button class="btn btn-primary" onclick="homePage.viewMovieDetails(${movie.id})">
                            <i class="fas fa-play"></i> Watch
                        </button>
                        <button class="btn btn-secondary" onclick="homePage.addToWatchlist(${movie.id})">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTrailers(trailers) {
        if (!this.trailersContainer) return;
        
        if (!trailers || trailers.length === 0) {
            this.trailersContainer.innerHTML = `
                <div class="no-trailers">
                    <p>No trailers available</p>
                </div>
            `;
            return;
        }
        
        this.trailersContainer.innerHTML = trailers.map(trailer => `
            <div class="trailer-card" data-movie-id="${trailer.movieId}">
                <div class="trailer-thumbnail">
                    <img src="${trailer.thumbnail}" alt="${trailer.title}" loading="lazy">
                    <div class="play-overlay" onclick="homePage.playTrailer('${trailer.trailerKey}')">
                        <div class="play-btn">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="trailer-info">
                    <h3 class="trailer-title">${trailer.title} - Trailer</h3>
                    <div class="trailer-meta">
                        <span>${trailer.views} views</span>
                        <span>${trailer.date}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderClips(clips) {
        if (!this.clipsContainer) return;
        
        if (!clips || clips.length === 0) {
            this.clipsContainer.innerHTML = '<p class="no-data">No clips available</p>';
            return;
        }
        
        this.clipsContainer.innerHTML = clips.map(clip => `
            <div class="clip-card" data-movie-id="${clip.movieId}">
                <div class="clip-thumbnail">
                    <img src="${clip.thumbnail}" alt="${clip.title}" loading="lazy">
                    <div class="clip-duration">${clip.duration}</div>
                </div>
                <div class="clip-info">
                    <h3 class="clip-title">${clip.title}</h3>
                    <div class="clip-meta">
                        <span>${clip.views} views</span>
                        <span><i class="fas fa-play"></i></span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderNews(news) {
        if (!this.newsContainer) return;
        
        if (!news || news.length === 0) {
            this.newsContainer.innerHTML = '<p class="no-data">No news available</p>';
            return;
        }
        
        this.newsContainer.innerHTML = news.map(item => `
            <div class="news-card" data-movie-id="${item.movieId}">
                <div class="news-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="news-content">
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-excerpt">${item.excerpt}</p>
                    <div class="news-meta">
                        <div class="news-date">
                            <i class="far fa-calendar"></i>
                            <span>${item.date}</span>
                        </div>
                        <a href="#" onclick="homePage.readNews(${item.movieId})" class="read-more">Read More</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ========== EVENT LISTENERS ==========
    initEventListeners() {
        // Hero slider controls
        const prevSlideBtn = document.getElementById('prevSlide');
        const nextSlideBtn = document.getElementById('nextSlide');
        
        if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => this.prevSlide());
        if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => this.nextSlide());
        
        // Trailer slider navigation
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
        
        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Pause slider on hover
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
        
        // Search button
        const searchBtn = document.querySelector('.search-box button');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
        
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

    // ========== NAVBAR SCROLL ==========
    initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ========== UTILITY FUNCTIONS ==========
    getRandomDate() {
        const days = Math.floor(Math.random() * 30) + 1;
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    formatDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    // ========== ACTION FUNCTIONS ==========
    viewMovieDetails(movieId) {
        console.log(`Viewing details for movie ID: ${movieId}`);
        window.location.href = `movie-details.html?id=${movieId}`;
    }

    addToWatchlist(movieId) {
        console.log(`Adding movie ID: ${movieId} to watchlist`);
        // Implement watchlist functionality
        alert(`Added movie to watchlist!`);
    }

    watchMovieTrailer(movieId) {
        console.log(`Watching trailer for movie ID: ${movieId}`);
        // Open trailer in modal or new page
        window.location.href = `movie-trailers.html?movie=${movieId}`;
    }

    playTrailer(trailerKey) {
        console.log(`Playing trailer with key: ${trailerKey}`);
        // Open YouTube trailer
        window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
    }

    readNews(movieId) {
        console.log(`Reading news for movie ID: ${movieId}`);
        window.location.href = `news.html?movie=${movieId}`;
    }

    performSearch() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            alert('Please enter a search term');
            return;
        }
        
        console.log(`Searching for: ${searchTerm}`);
        
        // Get search filters
        const filterMovies = document.getElementById('filterMovies')?.checked || true;
        const filterPeople = document.getElementById('filterPeople')?.checked || false;
        const filterCompanies = document.getElementById('filterCompanies')?.checked || false;
        
        // Build search URL
        let searchUrl = `search.html?q=${encodeURIComponent(searchTerm)}`;
        if (filterPeople) searchUrl += '&type=person';
        if (filterCompanies) searchUrl += '&type=company';
        
        window.location.href = searchUrl;
    }

    showErrorMessage() {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 100px 20px;">
                    <h2>😕 Unable to Load Content</h2>
                    <p>There was an error loading movie data. Please check your internet connection and try again.</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }
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