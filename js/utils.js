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
}// Add these NEW functions to your existing utils.js
utils.formatDuration = function(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

utils.formatUploadTime = function(dateString) {
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
};

utils.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

utils.truncateText = function(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

utils.extractHashtags = function(text) {
    return text.match(/#\w+/g) || [];
};

// Video-specific utilities
utils.isVideoFile = function(file) {
    return file && file.type.startsWith('video/');
};

utils.isValidFileSize = function(file, maxSizeMB = 100) {
    return file.size <= maxSizeMB * 1024 * 1024;
};

utils.createObjectURL = function(file) {
    return URL.createObjectURL(file);
};

utils.revokeObjectURL = function(url) {
    URL.revokeObjectURL(url);
};

// Social media formatting
utils.formatCount = function(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
};

// Modal utilities
utils.showModal = function(modalElement) {
    modalElement.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

utils.hideModal = function(modalElement) {
    modalElement.style.display = 'none';
    document.body.style.overflow = 'auto';
};

// Notification system
utils.showToast = function(message, type = 'success') {
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
};