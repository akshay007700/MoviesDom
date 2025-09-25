// Advanced Movie Reviews System
class MovieReviewsPage {
    constructor() {
        this.currentUser = null;
        this.reviews = [];
        this.filteredReviews = [];
        this.currentView = 'detailed';
        this.reviewsPage = 1;
        this.hasMoreReviews = true;
        
        this.userRating = 0;
        this.categoryRatings = {
            story: 0,
            acting: 0,
            direction: 0,
            cinematography: 0
        };
        
        this.init();
    }

    async init() {
        await this.loadMoviesForReview();
        this.setupEventListeners();
        this.initializeRatingSystem();
        this.loadReviews();
        this.checkUserAuth();
        this.animateRatingBars();
    }

    async loadMoviesForReview() {
        try {
            const moviesData = await movieAPI.getPopularMovies(1);
            const select = document.getElementById('reviewMovieSelect');
            
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add movie options
            moviesData.results.slice(0, 20).forEach(movie => {
                const option = document.createElement('option');
                option.value = movie.id;
                option.textContent = `${movie.title} (${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'})`;
                select.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading movies for review:', error);
        }
    }

    initializeRatingSystem() {
        // Main rating stars
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                this.setUserRating(parseInt(e.target.dataset.value));
            });
            
            star.addEventListener('mouseover', (e) => {
                this.highlightStars(parseInt(e.target.dataset.value));
            });
        });

        document.querySelector('.star-rating').addEventListener('mouseleave', () => {
            this.highlightStars(this.userRating);
        });

        // Category ratings
        Object.keys(this.categoryRatings).forEach(category => {
            const stars = document.querySelectorAll(`[data-category="${category}"] .category-star`);
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    this.setCategoryRating(category, index + 1);
                });
            });
        });

        // Initialize category stars
        this.initializeCategoryStars();
    }

    initializeCategoryStars() {
        Object.keys(this.categoryRatings).forEach(category => {
            const container = document.querySelector(`[data-category="${category}"]`);
            if (!container) return;

            container.innerHTML = ''; // Clear existing stars
            
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.className = 'category-star';
                star.textContent = '★';
                star.dataset.value = i;
                star.addEventListener('click', () => this.setCategoryRating(category, i));
                container.appendChild(star);
            }
        });
    }

    setUserRating(rating) {
        this.userRating = rating;
        this.updateRatingDisplay();
        this.highlightStars(rating);
    }

    setCategoryRating(category, rating) {
        this.categoryRatings[category] = rating;
        this.highlightCategoryStars(category, rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
        document.getElementById('ratingValue').textContent = `${rating}/10`;
    }

    highlightCategoryStars(category, rating) {
        const stars = document.querySelectorAll(`[data-category="${category}"] .category-star`);
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }

    updateRatingDisplay() {
        document.getElementById('ratingValue').textContent = `${this.userRating}/10`;
    }

    setupEventListeners() {
        // Review submission
        document.getElementById('reviewText').addEventListener('input', (e) => {
            this.updateCharacterCount(e.target.value.length);
        });

        // Formatting tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyFormatting(e.target.dataset.format);
            });
        });

        // Filters
        ['reviewTypeFilter', 'ratingFilter', 'sortReviews'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.dataset.view);
            });
        });

        // Load more
        document.getElementById('loadMoreReviews').addEventListener('click', () => {
            this.loadMoreReviews();
        });

        // Search
        document.getElementById('reviewSearch').addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchReviews(e.target.value);
            }, 500);
        });

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    async loadReviews(page = 1) {
        this.showLoading(true);
        
        try {
            // Generate sample reviews for demonstration
            const newReviews = this.generateSampleReviews(10);
            
            if (page === 1) {
                this.reviews = newReviews;
            } else {
                this.reviews = [...this.reviews, ...newReviews];
            }
            
            this.hasMoreReviews = page < 3; // Simulate limited pages
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            this.showLoading(false);
        }
    }

    generateSampleReviews(count) {
        const sampleMovies = ['Inception', 'The Dark Knight', 'Pulp Fiction', 'The Godfather', 'Fight Club'];
        const sampleUsers = [
            { name: 'MovieExpert42', avatar: 'https://i.pravatar.cc/50?img=1', verified: true },
            { name: 'CinemaLover', avatar: 'https://i.pravatar.cc/50?img=2', verified: false },
            { name: 'FilmCriticPro', avatar: 'https://i.pravatar.cc/50?img=3', verified: true },
            { name: 'ScreenQueen', avatar: 'https://i.pravatar.cc/50?img=4', verified: true },
            { name: 'DirectorFan', avatar: 'https://i.pravatar.cc/50?img=5', verified: false }
        ];

        const sampleTexts = [
            "This movie completely blew me away! The cinematography was stunning and the performances were outstanding.",
            "A masterpiece of modern cinema. The direction and storytelling are simply impeccable.",
            "While I enjoyed certain aspects, I felt the plot was somewhat predictable. Still worth watching!",
            "One of the best films I've seen this year. The emotional depth and character development are remarkable.",
            "The visual effects were groundbreaking, but I wish the characters had more depth."
        ];

        return Array.from({ length: count }, (_, i) => {
            const movie = sampleMovies[i % sampleMovies.length];
            const user = sampleUsers[i % sampleUsers.length];
            const rating = Math.floor(Math.random() * 4) + 7; // 7-10
            const isCritic = Math.random() > 0.7;
            
            return {
                id: `review-${Date.now()}-${i}`,
                movieId: i + 1,
                movieTitle: movie,
                userId: user.name,
                userAvatar: user.avatar,
                userName: user.name,
                isVerified: user.verified,
                isCritic: isCritic,
                rating: rating,
                title: `Review of ${movie}`,
                content: sampleTexts[i % sampleTexts.length],
                likes: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 20),
                shares: Math.floor(Math.random() * 10),
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                categories: {
                    story: Math.floor(Math.random() * 5) + 6,
                    acting: Math.floor(Math.random() * 5) + 6,
                    direction: Math.floor(Math.random() * 5) + 6,
                    cinematography: Math.floor(Math.random() * 5) + 6
                }
            };
        });
    }

    applyFilters() {
        const typeFilter = document.getElementById('reviewTypeFilter').value;
        const ratingFilter = document.getElementById('ratingFilter').value;
        const sortBy = document.getElementById('sortReviews').value;

        this.filteredReviews = this.reviews.filter(review => {
            // Type filter
            if (typeFilter === 'user' && review.isCritic) return false;
            if (typeFilter === 'critic' && !review.isCritic) return false;
            if (typeFilter === 'verified' && !review.isVerified) return false;

            // Rating filter
            if (ratingFilter !== 'all') {
                const [min, max] = ratingFilter.split('-').map(Number);
                if (review.rating < min || review.rating > max) return false;
            }

            return true;
        });

        this.sortReviews(sortBy);
        this.renderReviews();
    }

    sortReviews(sortBy) {
        this.filteredReviews.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'popular':
                    return b.likes - a.likes;
                case 'highest':
                    return b.rating - a.rating;
                case 'lowest':
                    return a.rating - b.rating;
                case 'controversial':
                    return Math.abs(b.rating - 7.5) - Math.abs(a.rating - 7.5); // Distance from middle
                default:
                    return new Date(b.timestamp) - new Date(a.timestamp);
            }
        });
    }

    renderReviews() {
        const container = document.getElementById('reviewsGrid');
        const isCompact = this.currentView === 'compact';

        if (this.filteredReviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews" style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
                    <i class="fas fa-search fa-3x" style="color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3>No reviews found</h3>
                    <p>Try adjusting your filters or be the first to review a movie!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredReviews.map(review => 
            this.createReviewCard(review, isCompact)
        ).join('');

        // Update stats
        document.getElementById('reviewsCount').textContent = 
            `Showing ${this.filteredReviews.length} of ${this.reviews.length} reviews`;
    }

    createReviewCard(review, isCompact = false) {
        if (isCompact) {
            return this.createCompactReviewCard(review);
        }

        const categoryScores = Object.entries(review.categories).map(([category, score]) => `
            <div class="category-score">
                <span>${category}:</span>
                <span>${score}/10</span>
            </div>
        `).join('');

        return `
            <div class="review-card" onclick="movieReviews.showReviewDetail('${review.id}')">
                <div class="review-header">
                    <div class="reviewer-meta">
                        <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar-large">
                        <div class="reviewer-details">
                            <h4>
                                ${review.userName}
                                ${review.isVerified ? '<span class="reviewer-badge">Verified</span>' : ''}
                                ${review.isCritic ? '<span class="reviewer-badge" style="background: #f37335;">Critic</span>' : ''}
                            </h4>
                            <div class="review-movie">${review.movieTitle}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        <div class="rating-score">${review.rating}</div>
                        <div class="rating-stars">${'★'.repeat(Math.floor(review.rating/2))}${review.rating % 2 === 1 ? '½' : ''}</div>
                    </div>
                </div>
                
                <div class="review-content">
                    <div class="review-text">${review.content}</div>
                    <div class="review-categories-small">
                        ${categoryScores}
                    </div>
                </div>
                
                <div class="review-footer">
                    <div class="review-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); movieReviews.likeReview('${review.id}')">
                            <i class="fas fa-thumbs-up"></i> ${review.likes}
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); movieReviews.commentOnReview('${review.id}')">
                            <i class="fas fa-comment"></i> ${review.comments}
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); movieReviews.shareReview('${review.id}')">
                            <i class="fas fa-share"></i> ${review.shares}
                        </button>
                    </div>
                    <div class="review-date">${this.formatDate(review.timestamp)}</div>
                </div>
            </div>
        `;
    }

    createCompactReviewCard(review) {
        return `
            <div class="review-card compact" onclick="movieReviews.showReviewDetail('${review.id}')">
                <div class="reviewer-meta">
                    <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar-large">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4>${review.userName}</h4>
                            <div class="rating-score">${review.rating}</div>
                        </div>
                        <div class="review-movie">${review.movieTitle}</div>
                        <div class="review-text" style="font-size: 0.9rem; margin-top: 0.5rem;">${review.content.substring(0, 150)}...</div>
                    </div>
                </div>
            </div>
        `;
    }

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        this.renderReviews();
    }

    updateCharacterCount(length) {
        const counter = document.querySelector('.char-count');
        counter.textContent = `${length}/2000 characters`;
        counter.style.color = length > 2000 ? '#ff6b6b' : 'var(--text-secondary)';
    }

    applyFormatting(format) {
        const textarea = document.getElementById('reviewText');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let formattedText = selectedText;
        
        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'spoiler':
                formattedText = `||${selectedText}||`;
                break;
        }
        
        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }

    submitReview() {
        if (!this.checkUserAuth()) {
            this.showLoginModal();
            return;
        }

        const movieSelect = document.getElementById('reviewMovieSelect');
        const reviewText = document.getElementById('reviewText').value.trim();

        if (!movieSelect.value) {
            showNotification('Please select a movie to review', 'error');
            return;
        }

        if (this.userRating === 0) {
            showNotification('Please provide a rating', 'error');
            return;
        }

        if (reviewText.length < 50) {
            showNotification('Review must be at least 50 characters long', 'error');
            return;
        }

        if (reviewText.length > 2000) {
            showNotification('Review must be less than 2000 characters', 'error');
            return;
        }

        // Create new review object
        const newReview = {
            id: `review-${Date.now()}`,
            movieId: movieSelect.value,
            movieTitle: movieSelect.options[movieSelect.selectedIndex].text,
            userId: this.currentUser.id,
            userAvatar: this.currentUser.avatar,
            userName: this.currentUser.name,
            isVerified: this.currentUser.verified,
            isCritic: false,
            rating: this.userRating,
            title: `Review of ${movieSelect.options[movieSelect.selectedIndex].text.split(' (')[0]}`,
            content: reviewText,
            likes: 0,
            comments: 0,
            shares: 0,
            timestamp: new Date(),
            categories: this.categoryRatings
        };

        // Add to reviews array
        this.reviews.unshift(newReview);
        this.applyFilters();

        // Reset form
        this.resetReviewForm();

        showNotification('Review published successfully!', 'success');
    }

    resetReviewForm() {
        this.userRating = 0;
        this.categoryRatings = { story: 0, acting: 0, direction: 0, cinematography: 0 };
        document.getElementById('reviewText').value = '';
        document.getElementById('reviewMovieSelect').value = '';
        this.updateRatingDisplay();
        this.initializeCategoryStars();
        this.updateCharacterCount(0);
    }

    checkUserAuth() {
        // Simulate user check - in real app, this would check localStorage or backend
        this.currentUser = {
            id: 'user-123',
            name: 'Current User',
            avatar: 'https://i.pravatar.cc/50?img=6',
            verified: true
        };
        return true; // Simulating logged in user
    }

    showLoginModal() {
        document.getElementById('loginModal').style.display = 'block';
    }

    likeReview(reviewId) {
        if (!this.checkUserAuth()) {
            this.showLoginModal();
            return;
        }

        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            review.likes++;
            this.renderReviews();
            showNotification('Review liked!', 'success');
        }
    }

    commentOnReview(reviewId) {
        if (!this.checkUserAuth()) {
            this.showLoginModal();
            return;
        }

        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            const comment = prompt('Enter your comment:');
            if (comment) {
                review.comments++;
                this.renderReviews();
                showNotification('Comment added!', 'success');
            }
        }
    }

    shareReview(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            if (navigator.share) {
                navigator.share({
                    title: `Review of ${review.movieTitle}`,
                    text: review.content.substring(0, 100) + '...',
                    url: window.location.href + `?review=${reviewId}`
                });
            } else {
                navigator.clipboard.writeText(window.location.href + `?review=${reviewId}`);
                showNotification('Review link copied to clipboard!', 'success');
            }
        }
    }

    showReviewDetail(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return;

        const modal = document.getElementById('reviewModal');
        const content = document.getElementById('reviewModalContent');

        content.innerHTML = `
            <div class="review-detail">
                <div class="review-detail-header">
                    <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar-large">
                    <div>
                        <h3>${review.userName}</h3>
                        <p>Review of <strong>${review.movieTitle}</strong></p>
                    </div>
                    <div class="rating-score-large">${review.rating}</div>
                </div>
                <div class="review-detail-content">
                    <p>${review.content}</p>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    loadMoreReviews() {
        this.reviewsPage++;
        this.loadReviews(this.reviewsPage);
    }

    searchReviews(query) {
        this.applyFilters(); // Filters will handle search
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showLoading(show) {
        const loadMoreBtn = document.getElementById('loadMoreReviews');
        if (show) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            loadMoreBtn.disabled = true;
        } else {
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Reviews';
            loadMoreBtn.disabled = false;
            loadMoreBtn.style.display = this.hasMoreReviews ? 'block' : 'none';
        }
    }

    animateRatingBars() {
        setTimeout(() => {
            document.querySelectorAll('.bar-fill').forEach(bar => {
                const percentage = bar.dataset.percentage;
                bar.style.width = percentage + '%';
            });
        }, 500);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    saveDraft() {
        const draft = {
            movieId: document.getElementById('reviewMovieSelect').value,
            rating: this.userRating,
            content: document.getElementById('reviewText').value,
            categories: this.categoryRatings,
            timestamp: new Date()
        };
        
        localStorage.setItem('moviesdom_review_draft', JSON.stringify(draft));
        showNotification('Draft saved successfully!', 'success');
    }
}

// Global functions
function searchReviews() {
    if (window.movieReviews) {
        const query = document.getElementById('reviewSearch').value;
        window.movieReviews.searchReviews(query);
    }
}

function submitReview() {
    if (window.movieReviews) {
        window.movieReviews.submitReview();
    }
}

function saveDraft() {
    if (window.movieReviews) {
        window.movieReviews.saveDraft();
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    window.movieReviews = new MovieReviewsPage();
});