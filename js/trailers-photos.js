// Mobile functionality for trailers-photos.js
class TrailersPhotosPage {
    constructor() {
        // ... existing properties ...
        
        this.isMobile = window.innerWidth <= 768;
        this.filtersVisible = false;
        
        this.init();
    }

    async init() {
        await this.loadFeaturedContent();
        this.setupEventListeners();
        this.setupMobileFeatures();
        this.setupTabs();
        this.updateStats();
    }

    setupMobileFeatures() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }

        // Mobile filter toggle
        const mobileFilterToggle = document.getElementById('mobileFilterToggle');
        const mediaFilters = document.getElementById('mediaFilters');
        
        if (mobileFilterToggle && mediaFilters) {
            mobileFilterToggle.addEventListener('click', () => {
                this.toggleFilters();
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Touch improvements for carousel
        this.setupTouchCarousel();
    }

    toggleFilters() {
        const mediaFilters = document.getElementById('mediaFilters');
        const mobileFilterToggle = document.getElementById('mobileFilterToggle');
        
        if (mediaFilters && mobileFilterToggle) {
            this.filtersVisible = !this.filtersVisible;
            mediaFilters.classList.toggle('active');
            
            if (this.filtersVisible) {
                mobileFilterToggle.innerHTML = '<i class="fas fa-times"></i> Close Filters';
            } else {
                this.updateFilterCount();
            }
        }
    }

    updateFilterCount() {
        const filterCount = document.getElementById('filterCount');
        if (!filterCount) return;

        let count = 0;
        
        if (this.currentMediaType !== 'all') count++;
        if (this.currentSort !== 'popularity') count++;
        if (this.currentTimeRange !== 'all') count++;
        
        filterCount.textContent = count;
        
        const mobileFilterToggle = document.getElementById('mobileFilterToggle');
        if (mobileFilterToggle) {
            mobileFilterToggle.innerHTML = `<i class="fas fa-filter"></i> Filters <span class="filter-count">${count}</span>`;
        }
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        // Close filters on desktop
        if (!this.isMobile && this.filtersVisible) {
            this.toggleFilters();
        }
        
        // Adjust carousel behavior
        this.adjustCarouselForMobile();
    }

    setupTouchCarousel() {
        const carousels = document.querySelectorAll('.carousel-track');
        
        carousels.forEach(carousel => {
            let startX = 0;
            let scrollLeft = 0;
            let isDown = false;
            
            carousel.addEventListener('touchstart', (e) => {
                isDown = true;
                startX = e.touches[0].pageX - carousel.offsetLeft;
                scrollLeft = carousel.scrollLeft;
            });
            
            carousel.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.touches[0].pageX - carousel.offsetLeft;
                const walk = (x - startX) * 2;
                carousel.scrollLeft = scrollLeft - walk;
            });
            
            carousel.addEventListener('touchend', () => {
                isDown = false;
            });
        });
    }

    adjustCarouselForMobile() {
        const carousels = document.querySelectorAll('.carousel-track');
        const scrollAmount = this.isMobile ? 280 : 300;
        
        // Update carousel item sizes if needed
        if (this.isMobile) {
            document.querySelectorAll('.video-card').forEach(card => {
                card.style.minWidth = '280px';
            });
        }
    }

    // Override the applyMediaFilters to update mobile UI
    applyMediaFilters() {
        this.currentMediaType = document.getElementById('mediaTypeFilter').value;
        this.currentSort = document.getElementById('sortFilter').value;
        this.currentTimeRange = document.getElementById('timeFilter').value;
        
        this.updateFilterCount();
        
        // Close filters on mobile after applying
        if (this.isMobile && this.filtersVisible) {
            this.toggleFilters();
        }
        
        this.renderTrailers();
    }

    // Override resetMediaFilters for mobile
    resetMediaFilters() {
        document.getElementById('mediaTypeFilter').value = 'all';
        document.getElementById('sortFilter').value = 'popularity';
        document.getElementById('timeFilter').value = 'all';
        document.getElementById('mediaSearch').value = '';
        
        this.currentMediaType = 'all';
        this.currentSort = 'popularity';
        this.currentTimeRange = 'all';
        
        this.updateFilterCount();
        
        // Close filters on mobile after resetting
        if (this.isMobile && this.filtersVisible) {
            this.toggleFilters();
        }
        
        this.renderTrailers();
        this.renderPhotos();
    }

    // Mobile-specific search function
    performMobileSearch() {
        const query = document.getElementById('mobileMediaSearch').value.trim();
        if (query) {
            showNotification(`Searching for: ${query}`, 'info');
            // Implement mobile search functionality
        }
    }

    // Enhanced playVideo for mobile
    playVideo(youtubeKey, title, movieTitle, type) {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        
        if (player && modal) {
            // Use responsive iframe for mobile
            const iframeHtml = this.isMobile ? 
                `<iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1&playsinline=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>` :
                `<iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>`;
            
            player.innerHTML = iframeHtml;
            
            // Set video info
            const videoTitle = document.getElementById('videoTitle');
            const videoMovie = document.getElementById('videoMovie');
            const videoType = document.getElementById('videoType');
            const videoDate = document.getElementById('videoDate');
            const videoDescription = document.getElementById('videoDescription');
            
            if (videoTitle) videoTitle.textContent = title;
            if (videoMovie) videoMovie.textContent = movieTitle;
            if (videoType) videoType.textContent = type;
            if (videoDate) videoDate.textContent = new Date().toLocaleDateString();
            if (videoDescription) videoDescription.textContent = `Watch the ${type} for ${movieTitle}`;
            
            modal.style.display = 'flex';
            
            // Add escape handler for mobile
            this.setupModalEscape();
        }
    }

    setupModalEscape() {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }

    // ... rest of the existing methods ...
}

// Global mobile functions
function performMobileSearch() {
    if (window.trailersPage) {
        window.trailersPage.performMobileSearch();
    }
}

// Enhanced carousel movement for touch
function moveCarousel(direction, type) {
    const carousel = document.getElementById(`${type}Carousel`);
    if (carousel) {
        const scrollAmount = window.innerWidth <= 768 ? 280 : 300;
        carousel.scrollLeft += direction * scrollAmount;
    }
}

// Initialize with mobile detection
document.addEventListener('DOMContentLoaded', () => {
    window.trailersPage = new TrailersPhotosPage();
    
    // Add touch detection class
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
    }
});