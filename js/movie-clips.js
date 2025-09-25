class MovieReels {
    constructor() {
        this.reelsContainer = document.getElementById('reelsContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.soundBtn = document.getElementById('soundBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        
        this.currentReelIndex = 0;
        this.reels = [];
        this.isPlaying = true;
        this.isMuted = false;
        this.userProfile = this.getUserProfile();
        this.categories = ['All', 'Trending', 'Comedy', 'Action', 'Horror', 'Drama', 'Sci-Fi'];
        
        this.init();
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
    
    setupModals() {
        // Upload Modal
        this.uploadModal = document.getElementById('uploadModal');
        this.uploadForm = document.getElementById('uploadForm');
        this.uploadArea = document.getElementById('uploadArea');
        this.videoInput = document.getElementById('videoInput');
        this.videoPreview = document.getElementById('videoPreview');
        
        // Comments Modal
        this.commentsModal = document.getElementById('commentsModal');
        this.commentsList = document.getElementById('commentsList');
        this.commentInput = document.getElementById('commentInput');
        
        // Profile Modal
        this.profileModal = document.getElementById('profileModal');
        
        // Editor Modal
        this.editorModal = document.getElementById('editorModal');
        
        // Notifications Panel
        this.notificationsPanel = document.getElementById('notificationsPanel');
    }
    
    setupEventListeners() {
        // Existing event listeners...
        this.reelsContainer.addEventListener('scroll', this.handleScroll.bind(this));
        this.pauseBtn.addEventListener('click', this.togglePlayback.bind(this));
        this.soundBtn.addEventListener('click', this.toggleSound.bind(this));
        
        // New modal event listeners
        this.setupUploadModal();
        this.setupCommentsModal();
        this.setupProfileModal();
        this.setupEditorModal();
        this.setupNotifications();
        
        // Category filter
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.filterByCategory(e.target.dataset.category);
            }
        });
    }
    
    setupUploadModal() {
        // Open upload modal
        this.uploadBtn.addEventListener('click', () => this.showModal(this.uploadModal));
        document.getElementById('mainUploadBtn').addEventListener('click', () => this.showModal(this.uploadModal));
        
        // Close modals
        document.getElementById('closeModal').addEventListener('click', () => this.hideModal(this.uploadModal));
        document.getElementById('cancelUpload').addEventListener('click', () => this.hideModal(this.uploadModal));
        
        // File upload handling
        this.uploadArea.addEventListener('click', () => this.videoInput.click());
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = '#e50914';
        });
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.style.borderColor = '#555';
        });
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = '#555';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
        
        this.videoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
        
        // Form submission
        this.uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });
    }
    
    setupCommentsModal() {
        document.getElementById('closeComments').addEventListener('click', () => this.hideModal(this.commentsModal));
        document.getElementById('postComment').addEventListener('click', () => this.postComment());
        this.commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.postComment();
        });
    }
    
    setupProfileModal() {
        document.getElementById('profileBtn').addEventListener('click', () => this.showUserProfile());
        document.querySelector('.close-btn').addEventListener('click', () => this.hideModal(this.profileModal));
    }
    
    setupEditorModal() {
        document.getElementById('closeEditor').addEventListener('click', () => this.hideModal(this.editorModal));
        document.getElementById('cancelEdit').addEventListener('click', () => this.hideModal(this.editorModal));
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEditedVideo());
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyFilter(e.target.dataset.filter);
            });
        });
    }
    
    setupNotifications() {
        document.getElementById('notificationsBtn').addEventListener('click', () => this.toggleNotifications());
        document.getElementById('closeNotifications').addEventListener('click', () => this.hideNotifications());
    }
    
    handleFileSelect(file) {
        if (!file.type.startsWith('video/')) {
            alert('Please select a video file');
            return;
        }
        
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            alert('File size must be less than 100MB');
            return;
        }
        
        const url = URL.createObjectURL(file);
        this.videoPreview.src = url;
        this.videoPreview.style.display = 'block';
        this.uploadArea.querySelector('p').textContent = file.name;
        
        // Store file for upload
        this.selectedFile = file;
    }
    
    async handleUpload() {
        const title = document.getElementById('clipTitle').value;
        const description = document.getElementById('clipDescription').value;
        const hashtags = document.getElementById('clipHashtags').value;
        
        if (!this.selectedFile || !title) {
            alert('Please select a video and enter a title');
            return;
        }
        
        // Simulate upload process
        this.showUploadProgress();
        
        // In a real app, you would upload to your server here
        await this.simulateUpload(this.selectedFile);
        
        // Create new reel object
        const newReel = {
            id: Date.now(),
            movie: {
                title: title,
                overview: description,
                poster_path: null
            },
            video: {
                key: URL.createObjectURL(this.selectedFile),
                type: 'User Upload'
            },
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isUserClip: true,
            hashtags: this.extractHashtags(hashtags),
            uploadDate: new Date().toISOString()
        };
        
        // Add to beginning of reels
        this.reels.unshift(newReel);
        this.renderReels();
        this.hideModal(this.uploadModal);
        this.showNotification('Your clip has been uploaded successfully!');
        
        // Save to user profile
        this.saveUserClip(newReel);
    }
    
    async simulateUpload(file) {
        return new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                this.updateUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 200);
        });
    }
    
    showUploadProgress() {
        // Add progress bar to modal
        const progressHtml = `
            <div class="upload-progress">
                <div class="progress-fill" id="uploadProgress"></div>
            </div>
        `;
        this.uploadForm.querySelector('.form-actions').insertAdjacentHTML('beforebegin', progressHtml);
    }
    
    updateUploadProgress(percent) {
        const progressBar = document.getElementById('uploadProgress');
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    }
    
    extractHashtags(text) {
        return text.match(/#\w+/g) || [];
    }
    
    async showComments(reelIndex) {
        this.currentCommentsReel = reelIndex;
        const reel = this.reels[reelIndex];
        
        // Load comments
        await this.loadComments(reel.id);
        this.showModal(this.commentsModal);
    }
    
    async loadComments(reelId) {
        // Simulate loading comments from server
        const comments = [
            { id: 1, user: 'MovieFan123', text: 'This scene was amazing!', avatar: 'images/avatar-placeholder.jpg', time: '2h ago' },
            { id: 2, user: 'CinemaLover', text: 'The cinematography is stunning!', avatar: 'images/avatar-placeholder.jpg', time: '1d ago' },
            { id: 3, user: 'FilmCritic', text: 'Great acting performance!', avatar: 'images/avatar-placeholder.jpg', time: '3d ago' }
        ];
        
        this.renderComments(comments);
    }
    
    renderComments(comments) {
        this.commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <img src="${comment.avatar}" alt="${comment.user}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-author">${comment.user}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-time">${comment.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    postComment() {
        const text = this.commentInput.value.trim();
        if (!text) return;
        
        // Add new comment
        const newComment = {
            id: Date.now(),
            user: this.userProfile.username,
            text: text,
            avatar: this.userProfile.avatar,
            time: 'Just now'
        };
        
        this.commentsList.insertAdjacentHTML('afterbegin', `
            <div class="comment-item">
                <img src="${newComment.avatar}" alt="${newComment.user}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-author">${newComment.user}</div>
                    <div class="comment-text">${newComment.text}</div>
                    <div class="comment-time">${newComment.time}</div>
                </div>
            </div>
        `);
        
        this.commentInput.value = '';
        
        // Update comment count
        if (this.currentCommentsReel !== undefined) {
            this.reels[this.currentCommentsReel].comments++;
            this.updateActionCounts(this.currentCommentsReel);
        }
    }
    
    showUserProfile() {
        document.getElementById('profileUsername').textContent = this.userProfile.username;
        document.getElementById('profileBio').textContent = this.userProfile.bio;
        document.getElementById('clipsCount').textContent = this.userProfile.clips.length;
        document.getElementById('followersCount').textContent = this.userProfile.followers;
        document.getElementById('followingCount').textContent = this.userProfile.following;
        
        this.renderUserClips();
        this.showModal(this.profileModal);
    }
    
    renderUserClips() {
        const profileClips = document.getElementById('profileClips');
        profileClips.innerHTML = this.userProfile.clips.map(clip => `
            <div class="profile-clip" onclick="movieReels.playUserClip('${clip.id}')">
                <video src="${clip.video.key}" style="width: 100%; height: 100%; object-fit: cover;"></video>
            </div>
        `).join('');
    }
    
    playUserClip(clipId) {
        const clipIndex = this.reels.findIndex(reel => reel.id == clipId);
        if (clipIndex !== -1) {
            this.scrollToReel(clipIndex);
            this.hideModal(this.profileModal);
        }
    }
    
    saveUserClip(clip) {
        this.userProfile.clips.push(clip);
        localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
    }
    
    loadUserClips() {
        const savedClips = this.userProfile.clips;
        if (savedClips.length > 0) {
            this.reels.unshift(...savedClips);
            this.renderReels();
        }
    }
    
    getUserProfile() {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            username: 'MovieLover',
            bio: 'Movie enthusiast sharing awesome clips!',
            avatar: 'images/avatar-placeholder.jpg',
            clips: [],
            followers: 42,
            following: 156
        };
    }
    
    showEditor(videoElement) {
        this.editingVideo = videoElement;
        document.getElementById('editPreview').src = videoElement.src;
        this.showModal(this.editorModal);
    }
    
    applyFilter(filter) {
        const preview = document.getElementById('editPreview');
        preview.style.filter = filter === 'none' ? '' : `filter: ${filter}(100%)`;
    }
    
    saveEditedVideo() {
        // In a real app, you would apply the edits to the video
        this.showNotification('Video edits saved successfully!');
        this.hideModal(this.editorModal);
    }
    
    toggleNotifications() {
        this.notificationsPanel.classList.toggle('open');
        if (this.notificationsPanel.classList.contains('open')) {
            this.loadNotifications();
        }
    }
    
    hideNotifications() {
        this.notificationsPanel.classList.remove('open');
    }
    
    loadNotifications() {
        const notifications = [
            { id: 1, user: 'MovieFan123', action: 'liked your clip', time: '5m ago', avatar: 'images/avatar-placeholder.jpg' },
            { id: 2, user: 'CinemaLover', action: 'commented on your clip', time: '1h ago', avatar: 'images/avatar-placeholder.jpg' },
            { id: 3, user: 'FilmCritic', action: 'started following you', time: '2h ago', avatar: 'images/avatar-placeholder.jpg' }
        ];
        
        document.getElementById('notificationsList').innerHTML = notifications.map(notif => `
            <div class="notification-item">
                <img src="${notif.avatar}" alt="${notif.user}" class="notification-avatar">
                <div class="notification-content">
                    <strong>${notif.user}</strong> ${notif.action}
                    <div class="notification-time">${notif.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    showNotification(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e50914;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    renderCategoryFilter() {
        const filterHtml = `
            <div class="category-filter">
                ${this.categories.map(cat => 
                    `<button class="category-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>`
                ).join('')}
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', filterHtml);
    }
    
    filterByCategory(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Filter logic would go here
        this.showNotification(`Showing ${category} clips`);
    }
    
    showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // ... rest of your existing methods
}

// Initialize the enhanced reels system
let movieReels;

document.addEventListener('DOMContentLoaded', () => {
    movieReels = new MovieReels();
});