// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Utility functions for the movie clips system
class MovieUtils {
    static formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    static formatUploadTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovieUtils;
}

// Add these NEW functions to your existing utils.js
const utils = {
    // Existing functions
    formatDuration: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    formatUploadTime: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    },

    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    truncateText: function(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    extractHashtags: function(text) {
        return text.match(/#\w+/g) || [];
    },

    // Video-specific utilities
    isVideoFile: function(file) {
        return file && file.type.startsWith('video/');
    },

    isValidFileSize: function(file, maxSizeMB = 100) {
        return file.size <= maxSizeMB * 1024 * 1024;
    },

    createObjectURL: function(file) {
        return URL.createObjectURL(file);
    },

    revokeObjectURL: function(url) {
        URL.revokeObjectURL(url);
    },

    // Social media formatting
    formatCount: function(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    },

    // Modal utilities
    showModal: function(modalElement) {
        modalElement.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    hideModal: function(modalElement) {
        modalElement.style.display = 'none';
        document.body.style.overflow = 'auto';
    },

    // Notification system
    showToast: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#e50914' : '#ff4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // NEW: Enhanced utility functions for trailers and photos
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatDate: function(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },

    getPlaceholderImage: function(width = 300, height = 450) {
        return `https://via.placeholder.com/${width}x${height}/2c2c2c/ffffff?text=No+Image`;
    },

    getImageURL: function(path, size = 'w500') {
        if (!path) return this.getPlaceholderImage();
        return `https://image.tmdb.org/t/p/${size}${path}`;
    },

    // Enhanced notification system
    showAdvancedNotification: function(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.advanced-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `advanced-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles if not already added
        if (!document.querySelector('#advanced-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'advanced-notification-styles';
            styles.textContent = `
                .advanced-notification {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: var(--bg-secondary);
                    border-left: 4px solid var(--primary-color);
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    max-width: 300px;
                }
                .advanced-notification.notification-success { border-left-color: #4CAF50; }
                .advanced-notification.notification-error { border-left-color: #f44336; }
                .advanced-notification.notification-info { border-left-color: #2196F3; }
                .advanced-notification .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Mobile detection
    isMobile: function() {
        return window.innerWidth <= 768;
    },

    // Touch device detection
    isTouchDevice: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

// Make utils available globally
window.utils = utils;
window.MovieUtils = MovieUtils;

// Alias for backward compatibility
window.showNotification = showNotification;