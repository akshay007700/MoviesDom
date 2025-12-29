// Enhanced Movie Details Page with Advanced Features
class MovieDetailsPage {
    constructor() {
        this.movieId = this.getMovieIdFromURL();
        this.movieData = null;
        this.userRating = 0;
        this.currentPosterIndex = 0;
        this.posterInterval = null;
        
        if (this.movieId) {
            this.init();
        } else {
            this.showError('No movie ID specified in URL');
        }
    }

    getMovieIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async init() {
        await this.loadMovieData();
        this.setupEventListeners();
        this.setupTabs();
        this.loadUserReviews();
    }

    async loadMovieData() {
        this.showLoading(true);
        
        try {
            // Load all movie data in parallel for better performance
            const [details, credits, videos, similar, images] = await Promise.all([
                movieAPI.getMovieDetails(this.movieId),
                movieAPI.getMovieCredits(this.movieId),
                movieAPI.getMovieVideos(this.movieId),
                movieAPI.getSimilarMovies(this.movieId),
                movieAPI.getMovieImages(this.movieId)
            ]);
            
            this.movieData = {
                ...details,
                credits,
                videos,
                similar,
                images
            };
            
            this.renderMovieDetails();
            this.setupPosterCarousel();
            this.renderEnhancedContent();
            this.loadAdditionalData();
            
        } catch (error) {
            console.error('Error loading movie data:', error);
            this.showError('Failed to load movie details. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    renderMovieDetails() {
        if (!this.movieData) return;

        const movie = this.movieData;
        
        // Update page title
        document.title = `${movie.title} - MoviesDom`;
        
        // Update hero section
        const movieTitle = document.getElementById('movieTitle');
        movieTitle.textContent = movie.title;
        movieTitle.style.background = `linear-gradient(135deg, var(--text-primary), ${this.getColorByRating(movie.vote_average)})`;
        movieTitle.style.webkitBackgroundClip = 'text';
        movieTitle.style.webkitTextFillColor = 'transparent';
        
        // Add Hindi title if available
        const hindiTitle = document.getElementById('hindiTitle');
        if (movie.original_language === 'hi') {
            hindiTitle.textContent = `(${movie.original_title || movie.title})`;
        }
        
        // Update badges
        document.getElementById('movieYear').innerHTML = `
            <i class="fas fa-calendar"></i>
            ${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}
        `;
        
        document.getElementById('movieRating').innerHTML = `
            <i class="fas fa-star"></i>
            ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10
        `;
        
        document.getElementById('movieRuntime').innerHTML = `
            <i class="fas fa-clock"></i>
            ${movie.runtime ? `${movie.runtime} min` : 'N/A'}
        `;
        
        // Set certification badge
        const certBadge = document.getElementById('certificationBadge');
        const cert = this.getCertification(movie);
        if (cert) {
            certBadge.innerHTML = `<i class="fas fa-user-check"></i> ${cert}`;
            certBadge.style.display = 'flex';
        }
        
        // Update background
        const background = document.querySelector('.hero-background');
        if (movie.backdrop_path) {
            background.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path})`;
        }
        
        // Update metadata
        document.getElementById('movieGenres').textContent = 
            movie.genres.map(genre => genre.name).join(', ');
        document.getElementById('movieReleaseDate').textContent = 
            movie.release_date || 'Unknown';
        document.getElementById('movieLanguage').textContent = 
            movie.original_language ? movie.original_language.toUpperCase() : 'N/A';
        document.getElementById('movieBudget').textContent = 
            movie.budget ? `$${this.formatCurrency(movie.budget)}` : 'Unknown';
        document.getElementById('movieRevenue').textContent = 
            movie.revenue ? `$${this.formatCurrency(movie.revenue)}` : 'Unknown';
        
        // Update Hindi dub info
        const hindiDub = document.getElementById('hindiDubInfo');
        if (movie.original_language !== 'hi' && movie.spoken_languages?.some(lang => lang.iso_639_1 === 'hi')) {
            hindiDub.textContent = 'Available';
            hindiDub.style.color = '#4CAF50';
        } else if (movie.original_language === 'hi') {
            hindiDub.textContent = 'Original';
            hindiDub.style.color = '#4CAF50';
        }
        
        // Update overview
        document.getElementById('movieDescription').textContent = 
            movie.overview || 'No description available.';
    }

    setupPosterCarousel() {
        if (!this.movieData?.images?.posters) return;
        
        const carousel = document.getElementById('posterCarousel');
        const posters = this.movieData.images.posters.slice(0, 5);
        
        if (posters.length === 0) return;
        
        // Create poster slides
        carousel.innerHTML = posters.map((poster, index) => `
            <img class="poster-slide ${index === 0 ? 'active' : ''}" 
                 src="https://image.tmdb.org/t/p/w500${poster.file_path}"
                 alt="${this.movieData.title} Poster ${index + 1}"
                 data-index="${index}">
        `).join('');
        
        // Create dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'poster-dots';
        dotsContainer.innerHTML = posters.map((_, index) => `
            <button class="poster-dot ${index === 0 ? 'active' : ''}" 
                    data-index="${index}"></button>
        `).join('');
        carousel.appendChild(dotsContainer);
        
        // Setup gallery
        this.setupPosterGallery();
        
        // Start auto-rotation
        this.startPosterRotation();
        
        // Add click handlers
        carousel.addEventListener('click', (e) => {
            if (e.target.classList.contains('poster-dot')) {
                this.showPoster(parseInt(e.target.dataset.index));
            }
        });
        
        // Add hover pause
        carousel.addEventListener('mouseenter', () => this.stopPosterRotation());
        carousel.addEventListener('mouseleave', () => this.startPosterRotation());
    }

    setupPosterGallery() {
        if (!this.movieData?.images?.backdrops) return;
        
        const galleryTrack = document.getElementById('galleryTrack');
        const backdrops = this.movieData.images.backdrops.slice(0, 10);
        
        galleryTrack.innerHTML = backdrops.map((backdrop, index) => `
            <div class="gallery-poster" data-index="${index}">
                <img src="https://image.tmdb.org/t/p/w300${backdrop.file_path}"
                     alt="${this.movieData.title} Backdrop ${index + 1}"
                     loading="lazy">
            </div>
        `).join('');
        
        // Setup gallery navigation
        document.getElementById('prevPosterBtn').addEventListener('click', () => {
            galleryTrack.scrollBy({ left: -300, behavior: 'smooth' });
        });
        
        document.getElementById('nextPosterBtn').addEventListener('click', () => {
            galleryTrack.scrollBy({ left: 300, behavior: 'smooth' });
        });
        
        // Add click to view larger
        galleryTrack.addEventListener('click', (e) => {
            const poster = e.target.closest('.gallery-poster');
            if (poster) {
                const index = parseInt(poster.dataset.index);
                this.showPosterInModal(backdrops[index].file_path);
            }
        });
    }

    showPoster(index) {
        const slides = document.querySelectorAll('.poster-slide');
        const dots = document.querySelectorAll('.poster-dot');
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        this.currentPosterIndex = index;
    }

    startPosterRotation() {
        this.stopPosterRotation();
        this.posterInterval = setInterval(() => {
            const slides = document.querySelectorAll('.poster-slide');
            const nextIndex = (this.currentPosterIndex + 1) % slides.length;
            this.showPoster(nextIndex);
        }, 5000);
    }

    stopPosterRotation() {
        if (this.posterInterval) {
            clearInterval(this.posterInterval);
            this.posterInterval = null;
        }
    }

    showPosterInModal(filePath) {
        const modal = document.createElement('div');
        modal.className = 'modal poster-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <img src="https://image.tmdb.org/t/p/original${filePath}" 
                     alt="${this.movieData.title} Poster"
                     class="full-poster">
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderEnhancedContent() {
        if (!this.movieData) return;
        
        const enhancer = new MovieContentEnhancer(this.movieData);
        const content = enhancer.generateAllContent();
        
        let contentSection = document.getElementById('enhancedContent');
        if (!contentSection) {
            contentSection = document.createElement('section');
            contentSection.id = 'enhancedContent';
            contentSection.className = 'movie-content-section';
            
            const heroSection = document.querySelector('.movie-hero');
            const tabsSection = document.querySelector('.movie-tabs-section');
            heroSection.parentNode.insertBefore(contentSection, tabsSection);
        }
        
        contentSection.innerHTML = `
            <div class="container">
                ${content.english}
            </div>
        `;
        
        // Add scroll animations
        this.addScrollAnimations();
    }

    async loadAdditionalData() {
        await this.loadCastAndCrew();
        await this.loadVideos();
        await this.loadSimilarMovies();
        this.loadTechnicalDetails();
        this.updateReviewStats();
    }

    async loadCastAndCrew() {
        if (!this.movieData.credits) return;
        
        const cast = this.movieData.credits.cast.slice(0, 12);
        const crew = this.movieData.credits.crew
            .filter(person => ['Director', 'Producer', 'Writer', 'Screenplay', 'Original Music Composer'].includes(person.job))
            .slice(0, 8);
        
        this.renderCast(cast);
        this.renderCrew(crew);
    }

    renderCast(cast) {
        const container = document.getElementById('castContainer');
        
        container.innerHTML = cast.map(person => `
            <div class="cast-member">
                <img src="${person.profile_path ? 
                    `https://image.tmdb.org/t/p/w300${person.profile_path}` : 
                    'images/avatar-placeholder.jpg'}" 
                     alt="${person.name}" 
                     class="cast-photo"
                     loading="lazy"
                     onerror="this.src='images/avatar-placeholder.jpg'">
                <div class="cast-name">${person.name}</div>
                <div class="cast-character">${person.character}</div>
            </div>
        `).join('');
    }

    renderCrew(crew) {
        const container = document.getElementById('crewContainer');
        
        container.innerHTML = crew.map(person => `
            <div class="crew-member">
                <img src="${person.profile_path ? 
                    `https://image.tmdb.org/t/p/w300${person.profile_path}` : 
                    'images/avatar-placeholder.jpg'}" 
                     alt="${person.name}" 
                     class="crew-photo"
                     loading="lazy"
                     onerror="this.src='images/avatar-placeholder.jpg'">
                <div class="crew-name">${person.name}</div>
                <div class="crew-job">${person.job}</div>
            </div>
        `).join('');
    }

    async loadVideos() {
        if (!this.movieData.videos?.results) return;
        
        const videos = this.movieData.videos.results
            .filter(video => video.site === 'YouTube')
            .slice(0, 6);
        
        this.renderVideos(videos);
    }

    renderVideos(videos) {
        const container = document.getElementById('videosContainer');
        
        if (videos.length === 0) {
            container.innerHTML = `
                <div class="no-content">
                    <i class="fas fa-video-slash fa-3x"></i>
                    <p>No videos available for this movie.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = videos.map(video => `
            <div class="video-item" onclick="movieDetails.playVideo('${video.key}')">
                <img src="https://img.youtube.com/vi/${video.key}/hqdefault.jpg" 
                     alt="${video.name}" 
                     class="video-thumbnail"
                     loading="lazy">
                <div class="video-info">
                    <div class="video-title">${video.name}</div>
                    <div class="video-meta">
                        <i class="fas fa-${video.type === 'Trailer' ? 'play-circle' : 'video'}"></i>
                        ${video.type}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadSimilarMovies() {
        if (!this.movieData.similar?.results) return;
        
        const similarMovies = this.movieData.similar.results.slice(0, 8);
        this.renderSimilarMovies(similarMovies);
    }

    renderSimilarMovies(movies) {
        const container = document.getElementById('similarMoviesContainer');
        
        if (movies.length === 0) {
            container.innerHTML = `
                <div class="no-content">
                    <i class="fas fa-film fa-3x"></i>
                    <p>No similar movies found.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="window.location.href='movie-details.html?id=${movie.id}'">
                <img src="${movie.poster_path ? 
                    `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
                    'images/placeholder.jpg'}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     loading="lazy"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
                        <span class="movie-rating">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadTechnicalDetails() {
        const movie = this.movieData;
        
        document.getElementById('detailStatus').textContent = movie.status || 'Unknown';
        document.getElementById('detailOriginalLanguage').textContent = 
            movie.original_language ? movie.original_language.toUpperCase() : 'N/A';
        document.getElementById('detailCountries').textContent = 
            movie.production_countries?.map(country => country.name).join(', ') || 'Unknown';
        document.getElementById('detailCompanies').textContent = 
            movie.production_companies?.map(company => company.name).join(', ') || 'Unknown';
        document.getElementById('detailSpokenLanguages').textContent = 
            movie.spoken_languages?.map(lang => lang.english_name).join(', ') || 'Unknown';
        
        const homepageLink = document.getElementById('detailHomepage');
        if (movie.homepage) {
            homepageLink.href = movie.homepage;
            homepageLink.textContent = 'Visit Official Website';
            homepageLink.target = '_blank';
        } else {
            homepageLink.textContent = 'Not available';
            homepageLink.href = '#';
        }
        
        document.getElementById('detailImdbId').textContent = movie.imdb_id || 'N/A';
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Action buttons
        document.getElementById('watchTrailerBtn').addEventListener('click', () => {
            this.playFirstTrailer();
        });

        document.getElementById('playTrailerBtn').addEventListener('click', () => {
            this.playFirstTrailer();
        });

        document.getElementById('addToWatchlistBtn').addEventListener('click', () => {
            this.addToWatchlist();
        });

        document.getElementById('shareMovieBtn').addEventListener('click', () => {
            this.showShareModal();
        });

        document.getElementById('downloadGuideBtn').addEventListener('click', () => {
            this.generateMovieGuide();
        });

        document.getElementById('readInsightsBtn').addEventListener('click', () => {
            this.scrollToContent();
        });

        // Review form
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReview();
            });
        }

        // Star rating interaction
        document.querySelectorAll('.star-rating .star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.setRating(parseInt(e.currentTarget.dataset.rating));
            });
            
            star.addEventListener('mouseover', (e) => {
                this.highlightStars(parseInt(e.currentTarget.dataset.rating));
            });
        });

        document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
            this.highlightStars(this.userRating);
        });

        // Modal controls
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Share functionality
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyShareLink();
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyShareLink();
        });

        // Share to social media
        document.querySelectorAll('.share-btn[data-platform]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareToPlatform(platform);
            });
        });

        // Download guide
        document.getElementById('printGuideBtn').addEventListener('click', () => {
            this.printMovieGuide();
        });

        document.getElementById('saveGuideBtn').addEventListener('click', () => {
            this.saveGuideAsPDF();
        });

        // Mobile menu
        document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('show');
        });

        // Back to top on logo click
        document.querySelector('.logo').addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            }
            if (e.key === 't' && e.ctrlKey) {
                e.preventDefault();
                this.playFirstTrailer();
            }
            if (e.key === 'w' && e.ctrlKey) {
                e.preventDefault();
                this.addToWatchlist();
            }
        });

        // Intersection Observer for lazy loading
        this.setupLazyLoading();
    }

    setupTabs() {
        this.switchTab('cast');
    }

    switchTab(tabName) {
        // Deactivate all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // Activate selected tab
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabPane = document.getElementById(`${tabName}-tab`);
        
        if (tabBtn && tabPane) {
            tabBtn.classList.add('active');
            tabPane.classList.add('active');
            
            // Smooth scroll to tab
            tabPane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    playFirstTrailer() {
        if (!this.movieData.videos?.results) {
            this.showNotification('No trailer available for this movie', 'warning');
            return;
        }
        
        const trailer = this.movieData.videos.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        if (trailer) {
            this.playVideo(trailer.key);
        } else {
            this.showNotification('No trailer available for this movie', 'warning');
        }
    }

    playVideo(videoKey) {
        const modal = document.getElementById('videoModal');
        const iframe = document.getElementById('videoPlayer');
        
        iframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`;
        modal.style.display = 'block';
        
        // Close modal when video ends
        iframe.addEventListener('load', () => {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        });
    }

    addToWatchlist() {
        const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
        
        if (!watchlist.includes(this.movieId)) {
            watchlist.push(this.movieId);
            localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
            this.showNotification('Added to watchlist! 🎬', 'success');
            
            // Update button appearance
            const btn = document.getElementById('addToWatchlistBtn');
            btn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
            btn.style.background = 'var(--success-color)';
            
            // Revert after 3 seconds
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-bookmark"></i> Watchlist';
                btn.style.background = '';
            }, 3000);
        } else {
            this.showNotification('Already in your watchlist! 👍', 'warning');
        }
    }

    showShareModal() {
        const modal = document.getElementById('shareModal');
        const urlInput = document.getElementById('shareUrl');
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${this.movieId}`;
        urlInput.value = shareUrl;
        modal.style.display = 'block';
    }

    copyShareLink() {
        const urlInput = document.getElementById('shareUrl');
        urlInput.select();
        urlInput.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(urlInput.value).then(() => {
            this.showNotification('Link copied to clipboard! 📋', 'success');
        }).catch(() => {
            document.execCommand('copy');
            this.showNotification('Link copied to clipboard! 📋', 'success');
        });
    }

    shareToPlatform(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(`${this.movieData.title} - Check out this movie on MoviesDom!`);
        
        let shareUrl = '';
        
        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title}%20${url}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
                break;
            case 'instagram':
                // Instagram doesn't support direct sharing, open app
                this.showNotification('Open Instagram to share this movie', 'info');
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    setRating(rating) {
        this.userRating = rating;
        this.updateRatingDisplay();
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }

    updateRatingDisplay() {
        const display = document.getElementById('selectedRating');
        if (display) {
            display.textContent = `${this.userRating}/10`;
        }
    }

    submitReview() {
        if (this.userRating === 0) {
            this.showNotification('Please select a rating ⭐', 'warning');
            return;
        }

        const reviewText = document.getElementById('reviewText').value.trim();
        if (!reviewText) {
            this.showNotification('Please write a review ✍️', 'warning');
            return;
        }

        const review = {
            movieId: this.movieId,
            rating: this.userRating,
            text: reviewText,
            date: new Date().toISOString(),
            author: 'You',
            avatar: '👤'
        };

        this.saveReview(review);
        this.addReviewToDOM(review);
        
        // Reset form
        document.getElementById('reviewForm').reset();
        this.userRating = 0;
        this.updateRatingDisplay();
        
        this.showNotification('Review submitted successfully! ✅', 'success');
        this.updateReviewStats();
    }

    saveReview(review) {
        const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_REVIEWS) || '{}');
        if (!reviews[this.movieId]) {
            reviews[this.movieId] = [];
        }
        reviews[this.movieId].push(review);
        localStorage.setItem(STORAGE_KEYS.USER_REVIEWS, JSON.stringify(reviews));
    }

    loadUserReviews() {
        const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_REVIEWS) || '{}');
        const movieReviews = reviews[this.movieId] || [];
        
        this.renderReviews(movieReviews);
        this.updateReviewStats(movieReviews);
    }

    renderReviews(reviews) {
        const container = document.getElementById('reviewsList');
        
        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-comment-slash fa-3x"></i>
                    <h4>No reviews yet</h4>
                    <p>Be the first to share your thoughts about this movie! 😊</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.reverse().map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author-info">
                        <span class="review-avatar">${review.avatar || '👤'}</span>
                        <div class="review-author">${review.author}</div>
                    </div>
                    <div class="review-rating">
                        <i class="fas fa-star"></i> ${review.rating}/10
                    </div>
                </div>
                <div class="review-content">${this.escapeHtml(review.text)}</div>
                <div class="review-date">
                    <i class="far fa-clock"></i> ${new Date(review.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        `).join('');
    }

    addReviewToDOM(review) {
        const container = document.getElementById('reviewsList');
        
        if (container.innerHTML.includes('no-reviews')) {
            this.renderReviews([review]);
        } else {
            const reviewHTML = `
                <div class="review-item">
                    <div class="review-header">
                        <div class="review-author-info">
                            <span class="review-avatar">${review.avatar}</span>
                            <div class="review-author">${review.author}</div>
                        </div>
                        <div class="review-rating">
                            <i class="fas fa-star"></i> ${review.rating}/10
                        </div>
                    </div>
                    <div class="review-content">${this.escapeHtml(review.text)}</div>
                    <div class="review-date">
                        <i class="far fa-clock"></i> ${new Date(review.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('afterbegin', reviewHTML);
        }
    }

    updateReviewStats(reviews) {
        if (!reviews) {
            reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_REVIEWS) || '{}')[this.movieId] || [];
        }
        
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
            : 0;
        
        document.getElementById('totalReviews').textContent = `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;
        document.getElementById('averageRating').textContent = averageRating;
        
        // Update stars
        const stars = document.getElementById('ratingStars');
        const fullStars = Math.floor(averageRating / 2);
        const hasHalfStar = averageRating % 2 >= 1;
        
        stars.innerHTML = '★'.repeat(fullStars) + 
                         (hasHalfStar ? '½' : '') + 
                         '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
    }

    generateMovieGuide() {
        const movie = this.movieData;
        const guideContent = document.getElementById('guideContent');
        
        guideContent.innerHTML = `
            <div class="guide-header">
                <h2>${movie.title} - Movie Guide</h2>
                <p class="guide-subtitle">Your personal movie companion</p>
            </div>
            
            <div class="guide-section">
                <h3><i class="fas fa-info-circle"></i> Quick Info</h3>
                <p><strong>Release Year:</strong> ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
                <p><strong>Director:</strong> ${movie.credits?.crew?.find(p => p.job === 'Director')?.name || 'Unknown'}</p>
                <p><strong>Genre:</strong> ${movie.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
                <p><strong>Runtime:</strong> ${movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
            </div>
            
            <div class="guide-section">
                <h3><i class="fas fa-book-open"></i> Story Preview</h3>
                <p>${movie.overview || 'No description available.'}</p>
            </div>
            
            <div class="guide-section">
                <h3><i class="fas fa-users"></i> Main Cast</h3>
                <ul>
                    ${movie.credits?.cast?.slice(0, 5).map(person => `
                        <li><strong>${person.name}</strong> as ${person.character}</li>
                    `).join('') || '<li>Cast information not available</li>'}
                </ul>
            </div>
            
            <div class="guide-section">
                <h3><i class="fas fa-lightbulb"></i> Viewing Tips</h3>
                <ul>
                    <li>Watch with good quality headphones for best audio experience</li>
                    <li>Best viewed in a dark room for maximum immersion</li>
                    <li>Check if Hindi dub is available on your OTT platform</li>
                    <li>Consider watching making-of documentaries if available</li>
                </ul>
            </div>
            
            <div class="guide-section">
                <h3><i class="fas fa-share-alt"></i> Share & Discuss</h3>
                <p>Share your thoughts with friends or join online discussions about this movie!</p>
            </div>
            
            <div class="guide-footer">
                <p><i class="fas fa-exclamation-circle"></i> <strong>Legal Note:</strong> This is an informational guide only. 
                Always watch movies through legal streaming services.</p>
            </div>
        `;
        
        document.getElementById('guideModal').style.display = 'block';
    }

    printMovieGuide() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.movieData.title} - Movie Guide</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    .guide-section { margin: 20px 0; }
                    .legal-note { color: #666; font-size: 12px; margin-top: 40px; }
                </style>
            </head>
            <body>
                ${document.getElementById('guideContent').innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    saveGuideAsPDF() {
        this.showNotification('PDF download feature coming soon! 📄', 'info');
        // In a real implementation, you would use jsPDF or similar library
    }

    scrollToContent() {
        const contentSection = document.getElementById('enhancedContent');
        contentSection.scrollIntoView({ behavior: 'smooth' });
    }

    addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.content-block').forEach(block => {
            block.style.opacity = '0';
            block.style.transform = 'translateY(20px)';
            block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(block);
        });
    }

    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    showLoading(show) {
        const loader = document.getElementById('loadingOverlay');
        if (!loader && show) {
            const overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loader">
                    <i class="fas fa-film fa-spin fa-3x"></i>
                    <p>Loading movie magic... ✨</p>
                </div>
            `;
            document.body.appendChild(overlay);
        } else if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        const hero = document.querySelector('.movie-hero');
        hero.innerHTML = `
            <div class="container error-container">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle fa-4x"></i>
                    <h2>Oops! Movie Not Found</h2>
                    <p>${message}</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="window.history.back()">
                            <i class="fas fa-arrow-left"></i> Go Back
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.href='movies.html'">
                            <i class="fas fa-film"></i> Browse Movies
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const toast = document.getElementById('notification');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `notification-toast ${type}`;
        toast.style.display = 'flex';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Helper methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('$', '');
    }

    getColorByRating(rating) {
        if (rating >= 8) return '#4CAF50'; // Green
        if (rating >= 6) return '#FFC107'; // Yellow
        if (rating >= 4) return '#FF9800'; // Orange
        return '#F44336'; // Red
    }

    getCertification(movie) {
        // This is a simplified version - real implementation would use certification data
        if (movie.adult) return 'A';
        if (movie.vote_average >= 8) return 'U/A';
        return 'UA';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Enhanced Content Generator
class MovieContentEnhancer {
    constructor(movieData) {
        this.movie = movieData;
        this.hindiSections = {
            story: "",
            unique: "",
            verdict: ""
        };
        this.generateHindiContent();
    }

    generateAllContent() {
        return {
            english: this.generateEnglishContent(),
            hindi: this.generateHindiContent()
        };
    }

    generateEnglishContent() {
        return `
        <div class="content-container">
            <div class="content-divider">🎬</div>
            
            <section class="content-block hook-section">
                <h2><i class="fas fa-fire"></i> MOVIE INSIGHTS</h2>
                <p class="hook-text">So you're thinking about "${this.movie.title}"? 👀 Let me tell you why people are talking about it...</p>
                <p>${this.generateHookText()}</p>
            </section>

            <div class="content-divider">📖</div>
            
            <section class="content-block story-section">
                <h2><i class="fas fa-book-open"></i> STORY VIBE (SPOILER-FREE)</h2>
                <p>${this.generateStorySummary()}</p>
                <p class="curiosity-text">${this.generateCuriosityEnding()} 😨</p>
            </section>

            <div class="content-divider">🤔</div>
            
            <section class="content-block unique-section">
                <h2><i class="fas fa-star"></i> WHY THIS MOVIE FEELS DIFFERENT</h2>
                <ul class="unique-points">
                    ${this.generateUniquePoints()}
                </ul>
            </section>

            <div class="content-divider">🎢</div>
            
            <section class="content-block fun-meter-section">
                <h2><i class="fas fa-chart-line"></i> WHAT TO EXPECT</h2>
                <div class="fun-meter-grid">
                    ${this.generateFunMeter()}
                </div>
            </section>

            <div class="content-divider">👀</div>
            
            <section class="content-block characters-section">
                <h2><i class="fas fa-users"></i> CHARACTERS YOU'LL NOTICE</h2>
                <p>${this.generateCharacterInsights()}</p>
            </section>

            <div class="content-divider">🌑</div>
            
            <section class="content-block mood-section">
                <h2><i class="fas fa-moon"></i> MOOD & ATMOSPHERE</h2>
                <div class="mood-content">
                    <p><strong>Vibe:</strong> ${this.generateMoodVibe()}</p>
                    <p><strong>Best way to experience:</strong> ${this.generateWatchingTip()} 😄</p>
                </div>
            </section>

            <div class="content-divider">🖼️</div>
            
            <section class="content-block visual-section">
                <h2><i class="fas fa-palette"></i> VISUAL EXPERIENCE</h2>
                <div class="poster-carousel-note">
                    <i class="fas fa-images"></i> Check out the posters above – they change automatically to show different moods!
                </div>
                <p>${this.generateVisualDescription()}</p>
                <p class="cinematic-feel">${this.generateCinematicFeel()}</p>
            </section>

            <div class="content-divider">🎯</div>
            
            <section class="content-block audience-section">
                <h2><i class="fas fa-user-check"></i> PERFECT FOR YOU IF...</h2>
                <div class="audience-grid">
                    ${this.generateAudienceRecommendations()}
                </div>
            </section>

            <div class="content-divider">📊</div>
            
            <section class="content-block facts-section">
                <h2><i class="fas fa-info-circle"></i> QUICK MOVIE FACTS</h2>
                <div class="facts-grid">
                    ${this.generateQuickFacts()}
                </div>
            </section>

            <div class="content-divider">🗣️</div>
            
            <section class="content-block verdict-section">
                <h2><i class="fas fa-comment-alt"></i> FRIEND'S VERDICT</h2>
                <div class="whatsapp-style">
                    <div class="message-time">Today, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div class="message-bubble">
                        <p>${this.generateFinalVerdict()}</p>
                        <div class="message-status">
                            <i class="fas fa-check-double"></i>
                        </div>
                    </div>
                </div>
            </section>

            <div class="content-divider">🇮🇳</div>
            
            <section class="content-block hindi-section">
                <h2><i class="fas fa-language"></i> HINDI VERSION (हिंदी)</h2>
                <div class="hindi-content">
                    <div class="hindi-block">
                        <h3><i class="fas fa-book"></i> कहानी का सारांश</h3>
                        <p>${this.hindiSections.story}</p>
                    </div>
                    <div class="hindi-block">
                        <h3><i class="fas fa-lightbulb"></i> खास बातें</h3>
                        <p>${this.hindiSections.unique}</p>
                    </div>
                    <div class="hindi-block">
                        <h3><i class="fas fa-comment"></i> आखिरी राय</h3>
                        <p>${this.hindiSections.verdict}</p>
                    </div>
                </div>
            </section>
        </div>
        `;
    }

    generateHookText() {
        const year = this.movie.release_date ? this.movie.release_date.split('-')[0] : '';
        const rating = this.movie.vote_average || 0;
        const genre = this.movie.genres?.[0]?.name || 'cinematic';
        
        const hooks = [
            `Released in ${year}, this ${genre.toLowerCase()} film has been getting serious attention for its ${rating >= 7 ? 'impressive' : 'unique'} approach. It's not your typical movie – there's something special here that makes it worth knowing about! 🔥`,
            `People can't stop talking about this ${year} release! With a solid ${rating}/10 rating, it brings a fresh perspective to ${genre} cinema that you don't want to miss. 🤯`,
            `If you're into ${genre} movies, this ${year} gem deserves your attention. The buzz is real, and once you know what makes it special, you'll understand why! 🎯`
        ];
        
        return hooks[Math.floor(Math.random() * hooks.length)];
    }

    generateStorySummary() {
        const mainGenre = this.movie.genres?.[0]?.name || 'story';
        const themes = [
            "human connections and the choices that define us",
            "the thin line between reality and perception",
            "personal transformation against all odds",
            "hidden truths that change everything",
            "the journey of self-discovery and redemption"
        ];
        
        const theme = themes[Math.floor(Math.random() * themes.length)];
        
        return `At its core, this ${mainGenre.toLowerCase()} masterpiece explores ${theme}. Without giving anything away, it masterfully builds tension while keeping you emotionally invested. Every scene feels purposeful, and the storytelling will keep you hooked till the very end. The way it balances character development with plot progression is truly remarkable.`;
    }

    generateCuriosityEnding() {
        const endings = [
            "Just when you think you've figured it out... the story takes an unexpected turn",
            "The final act will leave you with questions that linger long after the credits roll",
            "It builds towards a revelation that changes everything you thought you knew",
            "You'll find yourself replaying key moments in your mind, discovering new layers each time"
        ];
        return endings[Math.floor(Math.random() * endings.length)];
    }

    generateUniquePoints() {
        const points = [
            "<li><strong>Concept Innovation:</strong> Takes familiar ideas and presents them in refreshingly new ways that surprise even seasoned viewers</li>",
            "<li><strong>Genre Fusion:</strong> Blends elements from different genres seamlessly, creating a unique cinematic experience</li>",
            "<li><strong>Visual Storytelling:</strong> Every frame is crafted with intention, using color, lighting, and composition to enhance the narrative</li>",
            "<li><strong>Emotional Resonance:</strong> Creates moments that genuinely connect with the audience on a personal level</li>",
            "<li><strong>Pacing Mastery:</strong> Knows exactly when to build tension and when to provide emotional relief</li>"
        ];
        
        // Select 3 random unique points
        const selectedPoints = [];
        while (selectedPoints.length < 3) {
            const randomPoint = points[Math.floor(Math.random() * points.length)];
            if (!selectedPoints.includes(randomPoint)) {
                selectedPoints.push(randomPoint);
            }
        }
        
        return selectedPoints.join('');
    }

    generateFunMeter() {
        // Generate levels based on movie genres
        const genres = this.movie.genres?.map(g => g.name.toLowerCase()) || [];
        
        const getLevel = (category) => {
            if (genres.includes('horror') && category === 'Thrill') return 'High';
            if (genres.includes('action') && category === 'Action') return 'High';
            if (genres.includes('mystery') && category === 'Mystery') return 'High';
            if (genres.includes('drama') && category === 'Emotion') return 'High';
            if (genres.includes('romance') && category === 'Emotion') return 'High';
            return Math.random() > 0.5 ? 'Medium' : 'Low';
        };
        
        const meters = [
            { icon: '😱', label: 'Thrill', level: getLevel('Thrill') },
            { icon: '💥', label: 'Action', level: getLevel('Action') },
            { icon: '🧠', label: 'Mystery', level: getLevel('Mystery') },
            { icon: '❤️', label: 'Emotion', level: getLevel('Emotion') }
        ];
        
        return meters.map(meter => `
            <div class="meter-item">
                <div class="meter-icon">${meter.icon}</div>
                <div class="meter-label">${meter.label}</div>
                <div class="meter-level ${meter.level.toLowerCase()}">${meter.level}</div>
            </div>
        `).join('');
    }

    generateCharacterInsights() {
        const castCount = this.movie.credits?.cast?.length || 0;
        
        const insights = [
            `The characters feel incredibly real – they make relatable choices, grow through their experiences, and stay with you long after the movie ends. With ${castCount} talented actors bringing them to life, there's at least one character everyone connects with, whether it's their journey, struggles, or unique personality.`,
            `Character development is where this movie truly shines. Each main character has a distinct arc that feels authentic and meaningful. The casting feels perfectly matched, and the performances add layers of depth to every scene, making the emotional moments hit even harder.`,
            `You'll find yourself invested in these characters from the very beginning. Their motivations make sense, their conflicts feel genuine, and their relationships evolve naturally throughout the story. It's the kind of character work that makes you care about what happens to them.`
        ];
        
        return insights[Math.floor(Math.random() * insights.length)];
    }

    generateMoodVibe() {
        const genres = this.movie.genres?.map(g => g.name.toLowerCase()) || [];
        
        const vibes = [];
        if (genres.includes('thriller') || genres.includes('horror')) vibes.push('Intense', 'Suspenseful');
        if (genres.includes('drama')) vibes.push('Emotional', 'Thought-provoking');
        if (genres.includes('comedy')) vibes.push('Light-hearted', 'Fun');
        if (genres.includes('sci-fi') || genres.includes('fantasy')) vibes.push('Immersive', 'Atmospheric');
        
        if (vibes.length < 2) vibes.push('Engaging', 'Atmospheric');
        
        return `${vibes[0]} / ${vibes[1]}`;
    }

    generateWatchingTip() {
        const tips = [
            "Watch it in one sitting, preferably late at night with good headphones for complete immersion",
            "Best experienced on a weekend evening when you can give it your full attention",
            "Perfect for a movie night with friends who appreciate good storytelling",
            "Watch when you're in the mood for something that makes you think and feel"
        ];
        
        return tips[Math.floor(Math.random() * tips.length)];
    }

    generateVisualDescription() {
        const visualStyles = [
            "The visual language is absolutely stunning – color palettes shift with emotional tones, camera movements feel intentional, and every composition could be framed as art.",
            "Cinematography takes center stage here, with carefully crafted lighting, innovative camera angles, and a distinct visual rhythm that enhances the storytelling.",
            "From production design to costume details, the visual world-building is exceptional. Each setting feels authentic and contributes to the overall atmosphere."
        ];
        
        return visualStyles[Math.floor(Math.random() * visualStyles.length)];
    }

    generateCinematicFeel() {
        const feels = [
            "It has that premium OTT platform quality – high production values, cinematic photography, and visual storytelling that completely pulls you into its universe.",
            "The filmmaking quality matches major studio releases, with professional-grade cinematography, editing, and sound design that create a theater-like experience.",
            "Every technical aspect feels polished and intentional, resulting in a viewing experience that's both visually spectacular and emotionally engaging."
        ];
        
        return feels[Math.floor(Math.random() * feels.length)];
    }

    generateAudienceRecommendations() {
        const recommendations = [
            { icon: '🎯', text: 'You enjoy movies that challenge your perspective' },
            { icon: '🎯', text: 'You appreciate strong character development' },
            { icon: '🎯', text: 'You like films with visual style and atmosphere' },
            { icon: '🎯', text: 'You prefer storytelling over mindless action' },
            { icon: '⏸️', text: 'Skip if: You want fast-paced, simple entertainment only' },
            { icon: '⏸️', text: 'Skip if: You dislike emotional or thoughtful content' }
        ];
        
        // Shuffle and take 4
        const shuffled = [...recommendations].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 4).map(rec => `
            <div class="audience-item ${rec.text.includes('Skip') ? 'skip-item' : ''}">
                <div class="audience-icon">${rec.icon}</div>
                <div class="audience-text">${rec.text}</div>
            </div>
        `).join('');
    }

    generateQuickFacts() {
        const facts = [
            { 
                label: 'Genre', 
                value: this.movie.genres ? this.movie.genres.map(g => g.name).join(', ') : 'N/A' 
            },
            { 
                label: 'Runtime', 
                value: this.movie.runtime ? `${this.movie.runtime} minutes` : 'N/A' 
            },
            { 
                label: 'Language', 
                value: this.movie.original_language ? this.movie.original_language.toUpperCase() : 'N/A' 
            },
            { 
                label: 'Hindi Dub', 
                value: this.movie.original_language !== 'hi' && 
                       this.movie.spoken_languages?.some(lang => lang.iso_639_1 === 'hi') ? 
                       '✅ Available' : 
                       this.movie.original_language === 'hi' ? '🎬 Original' : '❌ Check OTT' 
            },
            { 
                label: 'Release Date', 
                value: this.movie.release_date || 'TBA' 
            },
            { 
                label: 'Rating', 
                value: this.movie.vote_average ? `${this.movie.vote_average.toFixed(1)}/10` : 'N/A' 
            }
        ];
        
        return facts.map(fact => `
            <div class="fact-item">
                <strong>${fact.label}:</strong>
                <span>${fact.value}</span>
            </div>
        `).join('');
    }

    generateFinalVerdict() {
        const rating = this.movie.vote_average || 0;
        
        const verdicts = [
            `Solid watch yaar! ⭐⭐⭐⭐ Not perfect but definitely worth your time if you like this genre. Don't go in with huge expectations, just enjoy the ride. The ${rating}/10 rating feels fair. Would recommend! 👍`,
            `Really enjoyed this one! 🎬 Has some moments that genuinely surprised me. Could've been shorter in parts but overall a good experience. Perfect for a Friday night watch with friends! 👌`,
            `Entertaining throughout! 🍿 Some parts might drag a bit if you're impatient, but the emotional payoff is worth it. Watch it when you want something that makes you think and feel. Definitely better than expected! 😊`,
            `Surprisingly good! 🤯 The story keeps you hooked even if you predict some twists. Great performances and solid direction. Good for a movie night when you want something engaging but not too heavy. Recommended! 🎯`
        ];
        
        return rating >= 7 ? verdicts[0] : 
               rating >= 6 ? verdicts[1] : 
               rating >= 5 ? verdicts[2] : verdicts[3];
    }

    generateHindiContent() {
        const rating = this.movie.vote_average || 0;
        const year = this.movie.release_date ? this.movie.release_date.split('-')[0] : '';
        const genre = this.movie.genres?.[0]?.name || 'फिल्म';
        
        // Story summary in Hindi
        this.hindiSections.story = `यह ${genre.toLowerCase()} फिल्म ${year} में रिलीज हुई थी और इसकी कहानी असल ज़िंदगी के फैसलों और उनके नतीजों के बारे में है। बिना स्पॉइलर दिए, यह फिल्म आपको एक ऐसी यात्रा पर ले जाती है जहाँ हर दृश्य नया रहस्य जोड़ता है और हर किरदार आपसे जुड़ जाता है। कहानी इतनी धीरे-धीरे खुलती है कि आप पूरे समय एंगेज रहते हैं।`;
        
        // Unique points in Hindi
        this.hindiSections.unique = `इस फिल्म की सबसे बड़ी खासियत है इसकी कहानी कहने का तरीका और विजुअल स्टाइल। एक्सपेक्टेड से हटकर है, और आपको लगातार सोचने पर मजबूर करती है। किरदार इतने रियल लगते हैं जैसे आप जानते हों उन्हें। ${rating}/10 का रेटिंग भी इसकी क्वालिटी बताता है।`;
        
        // Final verdict in Hindi
        const hindiVerdicts = [
            `बहुत अच्छी फिल्म है दोस्त! ⭐⭐⭐⭐ पूरी एंटरटेनमेंट से भरी हुई। अगर आप इस जेनर को पसंद करते हैं तो एक बार जरूर देखें। समय बर्बाद नहीं होगा। ${rating}/10 रेटिंग सही लगती है। 👍`,
            `देखने लायक है! 🎬 कुछ मोमेंट्स ऐसे हैं जो आपको सरप्राइज कर देंगे। थोड़ी लंबी लग सकती है पर ओवरऑल एक्सपीरियंस अच्छा है। फ्राइडे नाइट के लिए परफेक्ट! 👌`,
            `एंटरटेनिंग फिल्म! 🍿 कहीं-कहीं थोड़ा स्लो लग सकता है पर एंडिंग सबकुछ सेट कर देती है। जब मूड हो कुछ अलग देखने का, तब देख सकते हैं। रेकमेंडेड! 😊`
        ];
        
        this.hindiSections.verdict = rating >= 7 ? hindiVerdicts[0] : 
                                    rating >= 6 ? hindiVerdicts[1] : hindiVerdicts[2];
        
        return this.hindiSections;
    }
}

// Initialize the movie details page
document.addEventListener('DOMContentLoaded', () => {
    window.movieDetails = new MovieDetailsPage();
    
    // Add some extra styling for loading overlay
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 35, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
        }
        
        .loader {
            text-align: center;
            color: var(--primary-color);
        }
        
        .loader i {
            margin-bottom: 2rem;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error-container {
            text-align: center;
            padding: 6rem 2rem;
        }
        
        .error-content i {
            color: var(--primary-color);
            margin-bottom: 2rem;
        }
        
        .error-content h2 {
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .error-content p {
            margin-bottom: 2rem;
            color: var(--text-secondary);
        }
        
        .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        .no-content, .no-reviews {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-secondary);
        }
        
        .no-content i, .no-reviews i {
            margin-bottom: 1.5rem;
            color: var(--text-muted);
        }
        
        .notification-toast.success {
            background: var(--success-color);
        }
        
        .notification-toast.warning {
            background: var(--warning-color);
            color: #000;
        }
        
        .notification-toast.info {
            background: var(--accent-color);
        }
        
        .review-author-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .review-avatar {
            font-size: 1.5rem;
        }
        
        .nav-links.show {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-tertiary);
            padding: 1rem;
            border-radius: 0 0 15px 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .poster-modal .modal-content {
            max-width: 90%;
            background: transparent;
        }
        
        .full-poster {
            width: 100%;
            border-radius: 15px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }
    `;
    document.head.appendChild(style);
});