class MovieReels {
    constructor() {
        // ... existing code ...
    }
    
    async init() {
        await this.loadMovieClips();
        this.setupEventListeners();
        this.setupModals();
        this.setupIntersectionObserver();
        this.renderCategoryFilter();
        this.hideLoading();
        this.loadUserClips();
    }
    
    // Use your existing utils for API calls
    async loadMovieClips() {
        try {
            const popularMovies = await utils.fetchData(
                `https://api.themoviedb.org/3/movie/popular?api_key=${api.apiKey}`
            );
            
            if (popularMovies && popularMovies.results) {
                // ... rest of function using your existing utils
            }
        } catch (error) {
            console.error('Error loading movie clips:', error);
            utils.showToast('Failed to load clips', 'error');
        }
    }
    
    // Use your existing storage utils
    getUserProfile() {
        return utils.getFromStorage('userProfile') || {
            username: 'MovieLover',
            bio: 'Movie enthusiast sharing awesome clips!',
            avatar: 'images/avatar-placeholder.jpg',
            clips: [],
            followers: 42,
            following: 156
        };
    }
    
    saveUserClip(clip) {
        this.userProfile.clips.push(clip);
        utils.saveToStorage('userProfile', this.userProfile);
    }
    
    // Use new TikTok utilities
    handleLike(likeBtn) {
        const index = parseInt(likeBtn.dataset.index);
        const reel = this.reels[index];
        
        reel.isLiked = !reel.isLiked;
        reel.likes += reel.isLiked ? 1 : -1;
        
        const count = likeBtn.querySelector('.action-count');
        count.textContent = utils.formatCount(reel.likes); // Using new utility
        
        if (reel.isLiked) {
            this.createLikeAnimation(likeBtn);
        }
    }
    
    // Use modal utilities
    showModal(modal) {
        utils.showModal(modal); // Using new utility
    }
    
    hideModal(modal) {
        utils.hideModal(modal); // Using new utility
    }
    
    // ... rest of your methods using the appropriate utilities
}