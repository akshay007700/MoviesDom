class MovieReels {
    constructor() {
        this.reelsContainer = document.getElementById('reelsContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.soundBtn = document.getElementById('soundBtn');
        
        this.currentReelIndex = 0;
        this.reels = [];
        this.isPlaying = true;
        this.isMuted = false;
        
        this.init();
    }
    
    async init() {
        await this.loadMovieClips();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.hideLoading();
    }
    
    async loadMovieClips() {
        try {
            // Get movie videos from TMDB API
            const popularMovies = await api.fetchPopularMovies();
            this.reels = [];
            
            for (const movie of popularMovies.slice(0, 20)) {
                const videos = await api.fetchMovieVideos(movie.id);
                const trailer = videos.find(video => 
                    video.type === 'Trailer' || video.type === 'Teaser'
                );
                
                if (trailer) {
                    this.reels.push({
                        movie,
                        video: trailer,
                        likes: Math.floor(Math.random() * 1000) + 500,
                        comments: Math.floor(Math.random() * 100) + 50,
                        shares: Math.floor(Math.random() * 200) + 100,
                        isLiked: false
                    });
                }
            }
            
            this.renderReels();
        } catch (error) {
            console.error('Error loading movie clips:', error);
        }
    }
    
    renderReels() {
        this.reelsContainer.innerHTML = '';
        
        this.reels.forEach((reel, index) => {
            const reelElement = this.createReelElement(reel, index);
            this.reelsContainer.appendChild(reelElement);
        });
    }
    
    createReelElement(reel, index) {
        const reelDiv = document.createElement('div');
        reelDiv.className = 'video-reel';
        reelDiv.innerHTML = `
            <div class="progress-bar">
                <div class="progress" id="progress-${index}"></div>
            </div>
            <video 
                class="video-player" 
                id="video-${index}"
                playsinline 
                webkit-playsinline
                preload="metadata"
            >
                <source src="https://www.youtube.com/embed/${reel.video.key}" type="video/mp4">
            </video>
            
            <div class="video-info">
                <h3 class="movie-title">${reel.movie.title}</h3>
                <p class="movie-description">${reel.movie.overview}</p>
            </div>
            
            <div class="action-buttons">
                <button class="action-btn like-btn" data-index="${index}">
                    <i class="fas ${reel.isLiked ? 'fa-heart' : 'fa-heart'}"></i>
                    <div class="action-count">${this.formatCount(reel.likes)}</div>
                </button>
                
                <button class="action-btn comment-btn" data-index="${index}">
                    <i class="fas fa-comment"></i>
                    <div class="action-count">${this.formatCount(reel.comments)}</div>
                </button>
                
                <button class="action-btn share-btn" data-index="${index}">
                    <i class="fas fa-share"></i>
                    <div class="action-count">${this.formatCount(reel.shares)}</div>
                </button>
            </div>
        `;
        
        return reelDiv;
    }
    
    setupEventListeners() {
        // Scroll detection for video play/pause
        this.reelsContainer.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Video controls
        this.pauseBtn.addEventListener('click', this.togglePlayback.bind(this));
        this.soundBtn.addEventListener('click', this.toggleSound.bind(this));
        
        // Action buttons delegation
        this.reelsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) {
                this.handleLike(e.target.closest('.like-btn'));
            }
            if (e.target.closest('.comment-btn')) {
                this.handleComment(e.target.closest('.comment-btn'));
            }
            if (e.target.closest('.share-btn')) {
                this.handleShare(e.target.closest('.share-btn'));
            }
        });
        
        // Double tap to like
        this.reelsContainer.addEventListener('dblclick', (e) => {
            const likeBtn = e.target.closest('.video-reel')?.querySelector('.like-btn');
            if (likeBtn) this.handleLike(likeBtn);
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayback();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.scrollToReel(this.currentReelIndex - 1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.scrollToReel(this.currentReelIndex + 1);
                    break;
            }
        });
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(this.reelsContainer.children).indexOf(entry.target);
                    this.playReel(index);
                } else {
                    const index = Array.from(this.reelsContainer.children).indexOf(entry.target);
                    this.pauseReel(index);
                }
            });
        }, {
            threshold: 0.8,
            root: this.reelsContainer
        });
        
        // Observe all reel elements
        this.reelsContainer.querySelectorAll('.video-reel').forEach(reel => {
            observer.observe(reel);
        });
    }
    
    handleScroll() {
        const reels = this.reelsContainer.children;
        const containerTop = this.reelsContainer.getBoundingClientRect().top;
        
        for (let i = 0; i < reels.length; i++) {
            const reelTop = reels[i].getBoundingClientRect().top - containerTop;
            if (Math.abs(reelTop) < window.innerHeight / 2) {
                this.currentReelIndex = i;
                break;
            }
        }
    }
    
    async playReel(index) {
        const video = document.getElementById(`video-${index}`);
        if (video) {
            try {
                await video.play();
                this.startProgressBar(index, video);
            } catch (error) {
                console.log('Auto-play prevented:', error);
            }
        }
    }
    
    pauseReel(index) {
        const video = document.getElementById(`video-${index}`);
        if (video) {
            video.pause();
            this.stopProgressBar(index);
        }
    }
    
    startProgressBar(index, video) {
        const progressBar = document.getElementById(`progress-${index}`);
        if (!progressBar) return;
        
        const updateProgress = () => {
            if (video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
        };
        
        video.addEventListener('timeupdate', updateProgress);
    }
    
    stopProgressBar(index) {
        const progressBar = document.getElementById(`progress-${index}`);
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }
    
    handleLike(likeBtn) {
        const index = parseInt(likeBtn.dataset.index);
        const reel = this.reels[index];
        
        reel.isLiked = !reel.isLiked;
        reel.likes += reel.isLiked ? 1 : -1;
        
        // Update UI
        const icon = likeBtn.querySelector('i');
        const count = likeBtn.querySelector('.action-count');
        
        icon.style.color = reel.isLiked ? '#ff2e63' : 'white';
        count.textContent = this.formatCount(reel.likes);
        
        // Like animation
        if (reel.isLiked) {
            this.createLikeAnimation(likeBtn);
        }
    }
    
    createLikeAnimation(likeBtn) {
        const animation = document.createElement('div');
        animation.className = 'like-animation';
        animation.innerHTML = '<i class="fas fa-heart"></i>';
        
        const rect = likeBtn.getBoundingClientRect();
        animation.style.left = rect.left + 'px';
        animation.style.top = rect.top + 'px';
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 800);
    }
    
    handleComment(commentBtn) {
        const index = parseInt(commentBtn.dataset.index);
        const reel = this.reels[index];
        alert(`Comments for: ${reel.movie.title}\n\nThis would open a comments modal in a real app.`);
    }
    
    handleShare(shareBtn) {
        const index = parseInt(shareBtn.dataset.index);
        const reel = this.reels[index];
        
        if (navigator.share) {
            navigator.share({
                title: reel.movie.title,
                text: `Check out this clip from ${reel.movie.title}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`Check out "${reel.movie.title}" on MovieDom!`);
            alert('Link copied to clipboard!');
        }
    }
    
    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        const video = document.getElementById(`video-${this.currentReelIndex}`);
        
        if (video) {
            if (this.isPlaying) {
                video.play();
                this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                video.pause();
                this.pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }
    }
    
    toggleSound() {
        this.isMuted = !this.isMuted;
        const video = document.getElementById(`video-${this.currentReelIndex}`);
        
        if (video) {
            video.muted = this.isMuted;
            this.soundBtn.innerHTML = this.isMuted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        }
    }
    
    scrollToReel(index) {
        if (index >= 0 && index < this.reels.length) {
            const reels = this.reelsContainer.children;
            reels[index].scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    formatCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }
    
    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieReels();
});

// Add to api.js for video fetching
if (typeof api !== 'undefined') {
    api.fetchMovieVideos = async (movieId) => {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${api.apiKey}`
        );
        const data = await response.json();
        return data.results || [];
    };
}