// API Service - Simulates backend operations
class ClipAPI {
    constructor() {
        this.baseURL = 'data/clips.json'; // In real app, this would be your API endpoint
        this.clips = [];
        this.currentClipId = null;
        this.comments = new Map(); // Store comments by clip ID
        this.likes = new Map(); // Store likes by clip ID
        this.userInteractions = this.loadUserInteractions();
    }

    // Load clips from JSON file or API
    async loadClips() {
        try {
            this.showLoading(true);
            const response = await fetch(this.baseURL);
            const data = await response.json();
            this.clips = data.clips;
            
            // Initialize likes and comments for each clip
            this.clips.forEach(clip => {
                if (!this.likes.has(clip.id)) {
                    this.likes.set(clip.id, {
                        count: clip.likes || 0,
                        liked: false
                    });
                }
                if (!this.comments.has(clip.id)) {
                    this.comments.set(clip.id, clip.comments || []);
                }
            });
            
            this.showLoading(false);
            return this.clips;
        } catch (error) {
            console.error('Error loading clips:', error);
            this.showLoading(false);
            return [];
        }
    }

    // Get clip by ID
    getClipById(id) {
        return this.clips.find(clip => clip.id === id);
    }

    // Like/Unlike a clip
    toggleLike(clipId) {
        const likeData = this.likes.get(clipId);
        if (likeData) {
            likeData.liked = !likeData.liked;
            likeData.count += likeData.liked ? 1 : -1;
            this.saveUserInteractions();
            return likeData;
        }
        return null;
    }

    // Add comment to clip
    addComment(clipId, username, text) {
        const comments = this.comments.get(clipId);
        if (comments) {
            const newComment = {
                id: Date.now(),
                username: username || 'You',
                text: text,
                timestamp: new Date().toLocaleTimeString(),
                likes: 0
            };
            comments.unshift(newComment);
            this.saveUserInteractions();
            return newComment;
        }
        return null;
    }

    // Add new clip
    addClip(clipData) {
        const newClip = {
            id: Date.now(),
            ...clipData,
            timestamp: new Date().toISOString(),
            views: 0,
            shares: 0,
            comments: []
        };
        
        this.clips.unshift(newClip);
        this.likes.set(newClip.id, { count: 0, liked: false });
        this.comments.set(newClip.id, []);
        
        this.saveToLocalStorage();
        return newClip;
    }

    // Save to localStorage (simulating database)
    saveToLocalStorage() {
        const appData = {
            clips: this.clips,
            likes: Array.from(this.likes.entries()),
            comments: Array.from(this.comments.entries())
        };
        localStorage.setItem('reelsAppData', JSON.stringify(appData));
    }

    // Load from localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('reelsAppData');
        if (saved) {
            const data = JSON.parse(saved);
            this.clips = data.clips || [];
            this.likes = new Map(data.likes || []);
            this.comments = new Map(data.comments || []);
        }
    }

    // User interactions management
    loadUserInteractions() {
        return JSON.parse(localStorage.getItem('userInteractions')) || {
            likedClips: [],
            watchedClips: [],
            following: []
        };
    }

    saveUserInteractions() {
        localStorage.setItem('userInteractions', JSON.stringify(this.userInteractions));
    }

    // Utility function to show/hide loading
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.toggle('active', show);
        }
    }
}

// UI Controller
class UIController {
    constructor(api) {
        this.api = api;
        this.currentClipIndex = 0;
        this.isPlaying = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadClips();
        this.applySavedTheme();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Upload functionality
        document.getElementById('uploadBtn').addEventListener('click', () => this.showUploadModal());
        document.querySelector('.close-modal').addEventListener('click', () => this.hideUploadModal());
        document.getElementById('uploadForm').addEventListener('submit', (e) => this.handleUpload(e));

        // Comments
        document.getElementById('closeComments').addEventListener('click', () => this.hideComments());
        document.getElementById('postComment').addEventListener('click', () => this.postComment());

        // Close modal when clicking outside
        document.getElementById('uploadModal').addEventListener('click', (e) => {
            if (e.target.id === 'uploadModal') {
                this.hideUploadModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async loadClips() {
        const clips = await this.api.loadClips();
        this.renderClips(clips);
    }

    renderClips(clips) {
        const container = document.getElementById('reelsContainer');
        container.innerHTML = '';

        clips.forEach((clip, index) => {
            const reelElement = this.createClipElement(clip, index);
            container.appendChild(reelElement);
        });

        // Initialize first clip
        if (clips.length > 0) {
            this.setCurrentClip(0);
        }
    }

    createClipElement(clip, index) {
        const likeData = this.api.likes.get(clip.id) || { count: 0, liked: false };
        
        return `
            <div class="reel" data-clip-id="${clip.id}">
                <div class="progress-container">
                    ${clips.map((_, i) => 
                        `<div class="progress-bar">
                            <div class="progress-fill" style="width: ${i === index ? '0%' : i < index ? '100%' : '0%'}"></div>
                        </div>`
                    ).join('')}
                </div>
                
                <div class="video-container">
                    <video class="video-player" loop muted>
                        <source src="${clip.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    
                    <div class="video-controls">
                        <div class="play-pause-btn">
                            <div class="play-pause-icon">⏸️</div>
                        </div>
                    </div>
                    
                    <div class="video-overlay">
                        <div class="video-info">
                            <div class="video-caption">${clip.title} ${clip.hashtags || ''}</div>
                            <div class="video-music">
                                <span class="music-icon">🎵</span>
                                ${clip.music}
                            </div>
                        </div>
                    </div>
                    
                    <div class="video-actions">
                        <div class="action-button">
                            <div class="user-avatar"></div>
                            <div class="follow-button">Follow</div>
                        </div>
                        <div class="action-button like-btn" data-clip-id="${clip.id}">
                            <div class="action-icon-large">${likeData.liked ? '❤️' : '🤍'}</div>
                            <div class="action-count">${this.formatCount(likeData.count)}</div>
                        </div>
                        <div class="action-button comment-btn" data-clip-id="${clip.id}">
                            <div class="action-icon-large">💬</div>
                            <div class="action-count">${this.formatCount(clip.comments?.length || 0)}</div>
                        </div>
                        <div class="action-button">
                            <div class="action-icon-large">↗️</div>
                            <div class="action-count">Share</div>
                        </div>
                        <div class="action-button">
                            <div class="action-icon-large">⋮</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setCurrentClip(index) {
        this.currentClipIndex = index;
        const reels = document.querySelectorAll('.reel');
        const videos = document.querySelectorAll('.video-player');
        
        reels.forEach((reel, i) => {
            if (i === index) {
                const video = videos[i];
                if (video) {
                    video.play().catch(console.error);
                    this.isPlaying = true;
                }
            } else {
                videos[i].pause();
            }
        });

        this.updateProgressBars();
    }

    updateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach((bar, index) => {
            if (index < this.currentClipIndex) {
                bar.style.width = '100%';
            } else if (index > this.currentClipIndex) {
                bar.style.width = '0%';
            }
        });
    }

    handleNavigation(e) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Handle different navigation pages
        const page = e.currentTarget.dataset.page;
        this.showPage(page);
    }

    showPage(page) {
        // Implementation for different pages
        console.log('Navigating to:', page);
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    showUploadModal() {
        document.getElementById('uploadModal').classList.add('active');
    }

    hideUploadModal() {
        document.getElementById('uploadModal').classList.remove('active');
        document.getElementById('uploadForm').reset();
    }

    async handleUpload(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('clipTitle').value,
            description: document.getElementById('clipDescription').value,
            videoUrl: document.getElementById('clipVideo').value,
            music: document.getElementById('clipMusic').value,
            hashtags: document.getElementById('clipHashtags').value
        };

        const newClip = this.api.addClip(formData);
        this.renderClips(this.api.clips);
        this.hideUploadModal();
        
        // Show success message
        this.showNotification('Clip uploaded successfully!');
    }

    showComments(clipId) {
        this.api.currentClipId = clipId;
        const comments = this.api.comments.get(clipId) || [];
        this.renderComments(comments);
        document.getElementById('commentsPanel').classList.add('active');
    }

    hideComments() {
        document.getElementById('commentsPanel').classList.remove('active');
    }

    renderComments(comments) {
        const container = document.getElementById('commentsList');
        container.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-avatar"></div>
                <div class="comment-content">
                    <div class="comment-username">${comment.username}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-actions">
                        <div class="comment-action">${comment.timestamp}</div>
                        <div class="comment-action">Reply</div>
                        <div class="comment-action">❤️ ${comment.likes}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    postComment() {
        const input = document.getElementById('commentInput');
        const text = input.value.trim();
        
        if (text && this.api.currentClipId) {
            this.api.addComment(this.api.currentClipId, 'You', text);
            const comments = this.api.comments.get(this.api.currentClipId);
            this.renderComments(comments);
            input.value = '';
            
            // Update comment count
            this.updateCommentCount(this.api.currentClipId, comments.length);
        }
    }

    updateCommentCount(clipId, count) {
        const commentBtn = document.querySelector(`.comment-btn[data-clip-id="${clipId}"]`);
        if (commentBtn) {
            const countElement = commentBtn.querySelector('.action-count');
            countElement.textContent = this.formatCount(count);
        }
    }

    handleLike(clipId) {
        const likeData = this.api.toggleLike(clipId);
        if (likeData) {
            const likeBtn = document.querySelector(`.like-btn[data-clip-id="${clipId}"]`);
            if (likeBtn) {
                const icon = likeBtn.querySelector('.action-icon-large');
                const countElement = likeBtn.querySelector('.action-count');
                
                icon.textContent = likeData.liked ? '❤️' : '🤍';
                countElement.textContent = this.formatCount(likeData.count);
                
                // Show like animation
                if (likeData.liked) {
                    this.showLikeAnimation(likeBtn);
                }
            }
        }
    }

    showLikeAnimation(element) {
        const animation = document.createElement('div');
        animation.className = 'like-animation';
        animation.textContent = '❤️';
        element.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 800);
    }

    handleKeyboard(e) {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.previousClip();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.nextClip();
                break;
            case 'l':
            case 'L':
                this.handleLike(this.api.clips[this.currentClipIndex]?.id);
                break;
            case 'c':
            case 'C':
                this.showComments(this.api.clips[this.currentClipIndex]?.id);
                break;
        }
    }

    togglePlayPause() {
        const currentVideo = document.querySelectorAll('.video-player')[this.currentClipIndex];
        if (currentVideo) {
            if (this.isPlaying) {
                currentVideo.pause();
            } else {
                currentVideo.play();
            }
            this.isPlaying = !this.isPlaying;
            
            const playBtn = currentVideo.parentElement.querySelector('.play-pause-icon');
            if (playBtn) {
                playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
            }
        }
    }

    previousClip() {
        if (this.currentClipIndex > 0) {
            this.setCurrentClip(this.currentClipIndex - 1);
        }
    }

    nextClip() {
        if (this.currentClipIndex < this.api.clips.length - 1) {
            this.setCurrentClip(this.currentClipIndex + 1);
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

    showNotification(message) {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Event delegation for dynamic elements
document.addEventListener('click', (e) => {
    if (e.target.closest('.like-btn')) {
        const clipId = e.target.closest('.like-btn').dataset.clipId;
        uiController.handleLike(clipId);
    }
    
    if (e.target.closest('.comment-btn')) {
        const clipId = e.target.closest('.comment-btn').dataset.clipId;
        uiController.showComments(clipId);
    }
    
    if (e.target.closest('.play-pause-btn')) {
        uiController.togglePlayPause();
    }
});

// Scroll handling for reels
document.getElementById('reelsContainer').addEventListener('scroll', (e) => {
    const container = e.target;
    const scrollPosition = container.scrollTop;
    const reelHeight = container.clientHeight;
    const currentIndex = Math.round(scrollPosition / reelHeight);
    
    if (currentIndex !== uiController.currentClipIndex) {
        uiController.setCurrentClip(currentIndex);
    }
});

// Touch/swipe handling for mobile
let startY = 0;
document.getElementById('reelsContainer').addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
});

document.getElementById('reelsContainer').addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            uiController.nextClip();
        } else {
            uiController.previousClip();
        }
    }
});

// Double tap to like
document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.video-container')) {
        const clipId = e.target.closest('.reel').dataset.clipId;
        uiController.handleLike(clipId);
    }
});

// Initialize the application
const api = new ClipAPI();
const uiController = new UIController(api);

// Load any saved data from localStorage
api.loadFromLocalStorage();