// Movie Details Page Functionality
class MovieDetailsPage {
    constructor() {
        this.movieId = this.getMovieIdFromURL();
        this.movieData = null;
        this.userRating = 0;
        
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
            this.movieData = await movieAPI.getMovieDetails(this.movieId);
            this.renderMovieDetails();
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
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('movieYear').textContent = 
            movie.release_date ? movie.release_date.split('-')[0] : 'TBA';
        document.getElementById('movieRating').textContent = 
            `⭐ ${movie.vote_average.toFixed(1)}/10`;
        document.getElementById('movieRuntime').textContent = 
            movie.runtime ? `${movie.runtime} min` : 'N/A';
        
        // Update poster and background
        const poster = document.getElementById('moviePoster');
        const background = document.querySelector('.hero-background');
        
        if (movie.poster_path) {
            poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            poster.onerror = () => {
                poster.src = 'images/placeholder.jpg';
            };
        }
        
        if (movie.backdrop_path) {
            background.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`;
        }
        
        // Update metadata
        document.getElementById('movieGenres').textContent = 
            movie.genres.map(genre => genre.name).join(', ');
        document.getElementById('movieReleaseDate').textContent = 
            movie.release_date || 'Unknown';
        document.getElementById('movieLanguage').textContent = 
            movie.original_language ? movie.original_language.toUpperCase() : 'N/A';
        document.getElementById('movieBudget').textContent = 
            movie.budget ? `$${movie.budget.toLocaleString()}` : 'Unknown';
        document.getElementById('movieRevenue').textContent = 
            movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'Unknown';
        
        // Update overview
        document.getElementById('movieDescription').textContent = 
            movie.overview || 'No description available.';
    }

    async loadAdditionalData() {
        await this.loadCastAndCrew();
        await this.loadVideos();
        await this.loadSimilarMovies();
        this.loadTechnicalDetails();
    }

    async loadCastAndCrew() {
        if (!this.movieData.credits) return;
        
        const cast = this.movieData.credits.cast.slice(0, 12); // Top 12 cast members
        const crew = this.movieData.credits.crew.filter(person => 
            ['Director', 'Producer', 'Writer', 'Screenplay'].includes(person.job)
        ).slice(0, 8); // Top 8 crew members
        
        this.renderCast(cast);
        this.renderCrew(crew);
    }

    renderCast(cast) {
        const container = document.getElementById('castContainer');
        
        container.innerHTML = cast.map(person => `
            <div class="cast-member">
                <img src="${person.profile_path ? 
                    `https://image.tmdb.org/t/p/w200${person.profile_path}` : 
                    'images/avatar-placeholder.jpg'}" 
                     alt="${person.name}" 
                     class="cast-photo"
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
                    `https://image.tmdb.org/t/p/w200${person.profile_path}` : 
                    'images/avatar-placeholder.jpg'}" 
                     alt="${person.name}" 
                     class="crew-photo"
                     onerror="this.src='images/avatar-placeholder.jpg'">
                <div class="crew-name">${person.name}</div>
                <div class="crew-job">${person.job}</div>
            </div>
        `).join('');
    }

    async loadVideos() {
        if (!this.movieData.videos) return;
        
        const videos = this.movieData.videos.results
            .filter(video => video.site === 'YouTube')
            .slice(0, 6); // Show first 6 videos
        
        this.renderVideos(videos);
    }

    renderVideos(videos) {
        const container = document.getElementById('videosContainer');
        
        if (videos.length === 0) {
            container.innerHTML = '<p>No videos available for this movie.</p>';
            return;
        }
        
        container.innerHTML = videos.map(video => `
            <div class="video-item" onclick="movieDetails.playVideo('${video.key}')">
                <img src="https://img.youtube.com/vi/${video.key}/hqdefault.jpg" 
                     alt="${video.name}" 
                     class="video-thumbnail">
                <div class="video-info">
                    <div class="video-title">${video.name}</div>
                    <div class="video-meta">${video.type}</div>
                </div>
            </div>
        `).join('');
    }

    async loadSimilarMovies() {
        if (!this.movieData.similar) return;
        
        const similarMovies = this.movieData.similar.results.slice(0, 8); // Show 8 similar movies
        this.renderSimilarMovies(similarMovies);
    }

    renderSimilarMovies(movies) {
        const container = document.getElementById('similarMoviesContainer');
        
        container.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="window.location.href='movie-details.html?id=${movie.id}'">
                <img src="${movie.poster_path ? 
                    `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
                    'images/placeholder.jpg'}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
                        <span class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
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
            movie.production_countries.map(country => country.name).join(', ') || 'Unknown';
        document.getElementById('detailCompanies').textContent = 
            movie.production_companies.map(company => company.name).join(', ') || 'Unknown';
        document.getElementById('detailSpokenLanguages').textContent = 
            movie.spoken_languages.map(lang => lang.english_name).join(', ') || 'Unknown';
        
        const homepageLink = document.getElementById('detailHomepage');
        if (movie.homepage) {
            homepageLink.href = movie.homepage;
            homepageLink.textContent = 'Visit Official Website';
        } else {
            homepageLink.textContent = 'Not available';
        }
        
        document.getElementById('detailImdbId').textContent = movie.imdb_id || 'N/A';
    }

    setupEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
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

        // Review form
        document.getElementById('reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });

        // Star rating
        document.querySelectorAll('.star-rating .star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.setRating(parseInt(e.target.dataset.rating));
            });
            
            star.addEventListener('mouseover', (e) => {
                this.highlightStars(parseInt(e.target.dataset.rating));
            });
        });

        document.querySelector('.star-rating').addEventListener('mouseleave', () => {
            this.highlightStars(this.userRating);
        });

        // Modal close buttons
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').style.display = 'none';
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Copy link functionality
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyShareLink();
        });
    }

    setupTabs() {
        // Activate first tab by default
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
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    playFirstTrailer() {
        if (!this.movieData.videos) return;
        
        const trailer = this.movieData.videos.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        if (trailer) {
            this.playVideo(trailer.key);
        } else {
            showNotification('No trailer available for this movie', 'warning');
        }
    }

    playVideo(videoKey) {
        const modal = document.getElementById('videoModal');
        const iframe = document.getElementById('videoPlayer');
        
        iframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
        modal.style.display = 'block';
    }

    addToWatchlist() {
        const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
        
        if (!watchlist.includes(this.movieId)) {
            watchlist.push(this.movieId);
            localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
            showNotification('Added to watchlist!', 'success');
            
            // Update button state
            document.getElementById('addToWatchlistBtn').innerHTML = 
                '<i class="fas fa-check"></i> In Watchlist';
        } else {
            showNotification('Already in watchlist!', 'warning');
        }
    }

    showShareModal() {
        const modal = document.getElementById('shareModal');
        const urlInput = document.getElementById('shareUrl');
        
        urlInput.value = window.location.href;
        modal.style.display = 'block';
    }

    copyShareLink() {
        const urlInput = document.getElementById('shareUrl');
        urlInput.select();
        document.execCommand('copy');
        showNotification('Link copied to clipboard!', 'success');
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
        document.getElementById('selectedRating').textContent = `${this.userRating}/10`;
        this.highlightStars(this.userRating);
    }

    submitReview() {
        if (this.userRating === 0) {
            showNotification('Please select a rating', 'warning');
            return;
        }

        const reviewText = document.getElementById('reviewText').value.trim();
        if (!reviewText) {
            showNotification('Please write a review', 'warning');
            return;
        }

        const review = {
            movieId: this.movieId,
            rating: this.userRating,
            text: reviewText,
            date: new Date().toISOString(),
            author: 'You' // In real app, this would be the logged-in user
        };

        this.saveReview(review);
        this.addReviewToDOM(review);
        
        // Reset form
        document.getElementById('reviewForm').reset();
        this.userRating = 0;
        this.updateRatingDisplay();
        
        showNotification('Review submitted successfully!', 'success');
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
    }

    renderReviews(reviews) {
        const container = document.getElementById('reviewsList');
        
        if (reviews.length === 0) {
            container.innerHTML = '<p>No reviews yet. Be the first to review this movie!</p>';
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">${review.author}</div>
                    <div class="review-rating">⭐ ${review.rating}/10</div>
                </div>
                <div class="review-content">${review.text}</div>
                <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    addReviewToDOM(review) {
        const container = document.getElementById('reviewsList');
        const reviewHTML = `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">${review.author}</div>
                    <div class="review-rating">⭐ ${review.rating}/10</div>
                </div>
                <div class="review-content">${review.text}</div>
                <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
            </div>
        `;
        
        if (container.innerHTML.includes('No reviews yet')) {
            container.innerHTML = reviewHTML;
        } else {
            container.insertAdjacentHTML('afterbegin', reviewHTML);
        }
    }

    showLoading(show) {
        // You can implement a loading indicator here
        if (show) {
            document.body.style.opacity = '0.7';
        } else {
            document.body.style.opacity = '1';
        }
    }

    showError(message) {
        const hero = document.querySelector('.movie-hero');
        hero.innerHTML = `
            <div class="container" style="text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle fa-3x" style="color: var(--error-color); margin-bottom: 1rem;"></i>
                <h2>Error Loading Movie</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.history.back()">Go Back</button>
            </div>
        `;
    }
}

// Initialize movie details page
document.addEventListener('DOMContentLoaded', () => {
    window.movieDetails = new MovieDetailsPage();
});