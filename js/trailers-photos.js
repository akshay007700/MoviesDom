// Trailers & Photos Page Functionality
class TrailersPhotosPage {
    constructor() {
        this.currentTab = 'featured';
        this.currentMediaType = 'all';
        this.currentSort = 'popularity';
        this.currentTimeRange = 'all';
        this.currentPhotoType = 'all';
        this.currentView = 'grid';
        
        this.trailersPage = 1;
        this.photosPage = 1;
        this.hasMoreTrailers = true;
        this.hasMorePhotos = true;
        
        this.featuredMovies = [];
        this.allVideos = [];
        this.allPhotos = [];
        
        this.init();
    }

    async init() {
        await this.loadFeaturedContent();
        this.setupEventListeners();
        this.setupTabs();
        this.updateStats();
    }

    async loadFeaturedContent() {
        try {
            // Load popular movies for featured section
            const moviesData = await movieAPI.getPopularMovies(1);
            this.featuredMovies = moviesData.results.slice(0, 8);
            
            this.renderFeaturedTrailers();
            this.renderFeaturedPhotos();
            
        } catch (error) {
            console.error('Error loading featured content:', error);
        }
    }

    async loadTrailers(page = 1) {
        this.showLoading('trailers', true);
        
        try {
            // In a real app, you'd fetch videos from TMDB
            // For demo, we'll simulate with movie data
            const moviesData = await movieAPI.getPopularMovies(page);
            const trailers = this.generateMockTrailers(moviesData.results);
            
            if (page === 1) {
                this.allVideos = trailers;
            } else {
                this.allVideos = [...this.allVideos, ...trailers];
            }
            
            this.hasMoreTrailers = moviesData.total_pages > page;
            this.renderTrailers();
            
        } catch (error) {
            console.error('Error loading trailers:', error);
        } finally {
            this.showLoading('trailers', false);
        }
    }

    async loadPhotos(page = 1) {
        this.showLoading('photos', true);
        
        try {
            const moviesData = await movieAPI.getPopularMovies(page);
            const photos = this.generateMockPhotos(moviesData.results);
            
            if (page === 1) {
                this.allPhotos = photos;
            } else {
                this.allPhotos = [...this.allPhotos, ...photos];
            }
            
            this.hasMorePhotos = moviesData.total_pages > page;
            this.renderPhotos();
            
        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            this.showLoading('photos', false);
        }
    }

    generateMockTrailers(movies) {
        const videoTypes = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes', 'Bloopers'];
        
        return movies.flatMap(movie => {
            return Array.from({ length: 3 }, (_, i) => ({
                id: `${movie.id}-${i}`,
                movieId: movie.id,
                movieTitle: movie.title,
                title: `${videoTypes[i]} - ${movie.title}`,
                type: videoTypes[i].toLowerCase().replace(' ', '_'),
                thumbnail: movie.backdrop_path ? 
                    `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : 
                    'images/placeholder.jpg',
                youtubeKey: 'dQw4w9WgXcQ', // Example key
                description: `Official ${videoTypes[i].toLowerCase()} for ${movie.title}`,
                duration: '2:30',
                publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                viewCount: Math.floor(Math.random() * 1000000)
            }));
        });
    }

    generateMockPhotos(movies) {
        const photoTypes = ['poster', 'backdrop', 'still', 'logo'];
        
        return movies.flatMap(movie => {
            return Array.from({ length: 5 }, (_, i) => ({
                id: `${movie.id}-photo-${i}`,
                movieId: movie.id,
                movieTitle: movie.title,
                title: `${movie.title} - ${photoTypes[i % 4]} ${i + 1}`,
                type: photoTypes[i % 4],
                url: movie.backdrop_path ? 
                    `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : 
                    'images/placeholder.jpg',
                width: 1920,
                height: 1080,
                aspectRatio: '16:9',
                size: '2.4 MB',
                uploadedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            }));
        });
    }

    renderFeaturedTrailers() {
        const container = document.getElementById('trailersCarousel');
        const trailers = this.generateMockTrailers(this.featuredMovies.slice(0, 4)).slice(0, 8);
        
        container.innerHTML = trailers.map(trailer => `
            <div class="video-card" onclick="trailersPage.playVideo('${trailer.youtubeKey}', '${trailer.title}', '${trailer.movieTitle}', '${trailer.type}')">
                <div class="video-thumbnail">
                    <img src="${trailer.thumbnail}" alt="${trailer.title}" onerror="this.src='images/placeholder.jpg'">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-title">${trailer.title}</div>
                    <div class="video-meta">
                        <span class="video-movie">${trailer.movieTitle}</span>
                        <span class="video-type">${trailer.type}</span>
                    </div>
                    <div class="video-description">${trailer.description}</div>
                </div>
            </div>
        `).join('');
    }

    renderFeaturedPhotos() {
        const container = document.getElementById('featuredPhotos');
        const photos = this.generateMockPhotos(this.featuredMovies.slice(4, 8)).slice(0, 12);
        
        container.innerHTML = photos.map(photo => `
            <div class="photo-card" onclick="trailersPage.viewPhoto('${photo.url}', '${photo.title}', '${photo.movieTitle}', '${photo.width}x${photo.height}', '${photo.aspectRatio}')">
                <img src="${photo.url}" alt="${photo.title}" class="photo-image" onerror="this.src='images/placeholder.jpg'">
                <div class="photo-info">
                    <div class="photo-title">${photo.title}</div>
                    <div class="photo-meta">
                        <span>${photo.movieTitle}</span>
                        <span>${photo.width}x${photo.height}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTrailers() {
        const container = document.getElementById('trailersGrid');
        const filteredVideos = this.filterVideos(this.allVideos);
        
        if (filteredVideos.length === 0) {
            container.innerHTML = '<div class="no-results"><p>No trailers found matching your criteria.</p></div>';
            return;
        }
        
        container.innerHTML = filteredVideos.map(video => `
            <div class="video-card" onclick="trailersPage.playVideo('${video.youtubeKey}', '${video.title}', '${video.movieTitle}', '${video.type}')">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='images/placeholder.jpg'">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-meta">
                        <span class="video-movie">${video.movieTitle}</span>
                        <span class="video-type">${video.type}</span>
                    </div>
                    <div class="video-description">${video.description}</div>
                </div>
            </div>
        `).join('');
    }

    renderPhotos() {
        const container = document.getElementById('photosContainer');
        const filteredPhotos = this.filterPhotos(this.allPhotos);
        
        container.className = `photos-container ${this.currentView}-view`;
        
        if (filteredPhotos.length === 0) {
            container.innerHTML = '<div class="no-results"><p>No photos found matching your criteria.</p></div>';
            return;
        }
        
        container.innerHTML = filteredPhotos.map(photo => `
            <div class="photo-card" onclick="trailersPage.viewPhoto('${photo.url}', '${photo.title}', '${photo.movieTitle}', '${photo.width}x${photo.height}', '${photo.aspectRatio}')">
                <img src="${photo.url}" alt="${photo.title}" class="photo-image" onerror="this.src='images/placeholder.jpg'">
                <div class="photo-info">
                    <div class="photo-title">${photo.title}</div>
                    <div class="photo-meta">
                        <span>${photo.movieTitle}</span>
                        <span>${photo.width}x${photo.height}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Initialize lightgallery if masonry view
        if (this.currentView === 'masonry') {
            this.initLightGallery();
        }
    }

    filterVideos(videos) {
        return videos.filter(video => {
            // Media type filter
            if (this.currentMediaType !== 'all' && video.type !== this.currentMediaType) {
                return false;
            }
            
            // Time range filter (simplified)
            if (this.currentTimeRange !== 'all') {
                const videoDate = new Date(video.publishedDate);
                const now = new Date();
                let timeDiff;
                
                switch (this.currentTimeRange) {
                    case 'day': timeDiff = 24 * 60 * 60 * 1000; break;
                    case 'week': timeDiff = 7 * 24 * 60 * 60 * 1000; break;
                    case 'month': timeDiff = 30 * 24 * 60 * 60 * 1000; break;
                    case 'year': timeDiff = 365 * 24 * 60 * 60 * 1000; break;
                    default: return true;
                }
                
                if (now - videoDate > timeDiff) return false;
            }
            
            return true;
        });
    }

    filterPhotos(photos) {
        return photos.filter(photo => {
            if (this.currentPhotoType !== 'all' && photo.type !== this.currentPhotoType) {
                return false;
            }
            return true;
        });
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Photo type filters
        document.querySelectorAll('.photo-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPhotoType(e.currentTarget.dataset.type);
            });
        });

        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.currentTarget.dataset.view);
            });
        });

        // Load more buttons
        document.getElementById('loadMoreTrailers').addEventListener('click', () => {
            this.loadMoreTrailers();
        });

        document.getElementById('loadMorePhotos').addEventListener('click', () => {
            this.loadMorePhotos();
        });

        // Search functionality
        document.getElementById('mediaSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performMediaSearch();
            }
        });

        // Filter changes
        ['mediaTypeFilter', 'sortFilter', 'timeFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.applyMediaFilters();
            });
        });

        // Modal close events
        this.setupModalEvents();
    }

    setupModalEvents() {
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
    }

    setupTabs() {
        this.switchTab('featured');
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.tab-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load content for the tab
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'trailers':
                if (this.allVideos.length === 0) {
                    this.loadTrailers(1);
                }
                break;
            case 'photos':
                if (this.allPhotos.length === 0) {
                    this.loadPhotos(1);
                }
                break;
            case 'clips':
            case 'bts':
                // These would load specific content types
                break;
        }
    }

    switchPhotoType(type) {
        this.currentPhotoType = type;
        
        document.querySelectorAll('.photo-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        this.renderPhotos();
    }

    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        this.renderPhotos();
    }

    playVideo(youtubeKey, title, movieTitle, type) {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        
        player.innerHTML = `
            <iframe width="100%" height="100%" 
                    src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        `;
        
        document.getElementById('videoTitle').textContent = title;
        document.getElementById('videoMovie').textContent = movieTitle;
        document.getElementById('videoType').textContent = type;
        document.getElementById('videoDate').textContent = new Date().toLocaleDateString();
        document.getElementById('videoDescription').textContent = `Watch the ${type} for ${movieTitle}`;
        
        modal.style.display = 'block';
    }

    viewPhoto(url, title, movieTitle, resolution, aspectRatio) {
        const modal = document.getElementById('photoModal');
        
        document.getElementById('photoViewerImage').src = url;
        document.getElementById('photoTitle').textContent = title;
        document.getElementById('photoMovie').textContent = movieTitle;
        document.getElementById('photoResolution').textContent = resolution;
        document.getElementById('photoAspect').textContent = aspectRatio;
        
        modal.style.display = 'block';
    }

    performMediaSearch() {
        const query = document.getElementById('mediaSearch').value.trim();
        if (query) {
            showNotification(`Searching for: ${query}`, 'info');
            // Implement search functionality here
        }
    }

    applyMediaFilters() {
        this.currentMediaType = document.getElementById('mediaTypeFilter').value;
        this.currentSort = document.getElementById('sortFilter').value;
        this.currentTimeRange = document.getElementById('timeFilter').value;
        
        this.renderTrailers();
    }

    resetMediaFilters() {
        document.getElementById('mediaTypeFilter').value = 'all';
        document.getElementById('sortFilter').value = 'popularity';
        document.getElementById('timeFilter').value = 'all';
        document.getElementById('mediaSearch').value = '';
        
        this.currentMediaType = 'all';
        this.currentSort = 'popularity';
        this.currentTimeRange = 'all';
        
        this.renderTrailers();
        this.renderPhotos();
    }

    loadMoreTrailers() {
        this.trailersPage++;
        this.loadTrailers(this.trailersPage);
    }

    loadMorePhotos() {
        this.photosPage++;
        this.loadPhotos(this.photosPage);
    }

    initLightGallery() {
        // This would initialize the lightgallery for photo viewing
        // You'd need to implement this based on the lightgallery library
    }

    updateStats() {
        // Update statistics (these would come from API in real app)
        document.getElementById('totalVideos').textContent = '1,247';
        document.getElementById('totalPhotos').textContent = '12,589';
        document.getElementById('totalMovies').textContent = '543';
    }

    showLoading(type, show) {
        const loaders = {
            trailers: document.getElementById('loadMoreTrailers'),
            photos: document.getElementById('loadMorePhotos')
        };
        
        if (loaders[type]) {
            if (show) {
                loaders[type].innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                loaders[type].disabled = true;
            } else {
                loaders[type].innerHTML = '<i class="fas fa-plus"></i> Load More';
                loaders[type].disabled = false;
            }
        }
    }
}

// Global functions for carousel
function moveCarousel(direction, type) {
    const carousel = document.getElementById(`${type}Carousel`);
    const scrollAmount = 300;
    carousel.scrollLeft += direction * scrollAmount;
}

// Global functions for photo actions
function downloadPhoto() {
    const imgUrl = document.getElementById('photoViewerImage').src;
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = 'movie-photo.jpg';
    link.click();
}

function sharePhoto() {
    if (navigator.share) {
        navigator.share({
            title: document.getElementById('photoTitle').textContent,
            text: 'Check out this movie photo!',
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    window.trailersPage = new TrailersPhotosPage();
});