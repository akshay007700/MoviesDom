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

    async loadFeaturedContent() {
        try {
            showNotification('Loading featured content...', 'info');
            
            // Load popular movies for featured section
            const moviesData = await movieAPI.getPopularMovies(1);
            this.featuredMovies = moviesData.results.slice(0, 8);
            
            // Load videos and images for featured movies
            await this.loadFeaturedVideos();
            await this.loadFeaturedPhotos();
            
            showNotification('Featured content loaded!', 'success');
            
        } catch (error) {
            console.error('Error loading featured content:', error);
            showNotification('Error loading featured content', 'error');
        }
    }

    async loadFeaturedVideos() {
        try {
            // Get videos for first 4 featured movies
            const videoPromises = this.featuredMovies.slice(0, 4).map(movie => 
                movieAPI.getMovieVideos(movie.id)
            );
            
            const videosData = await Promise.all(videoPromises);
            const featuredVideos = videosData.flatMap(data => 
                data.results.filter(video => video.site === 'YouTube')
            );
            
            this.renderFeaturedTrailers(featuredVideos.slice(0, 8));
            
        } catch (error) {
            console.error('Error loading featured videos:', error);
        }
    }

    async loadFeaturedPhotos() {
        try {
            // Get images for last 4 featured movies
            const imagePromises = this.featuredMovies.slice(4, 8).map(movie =>
                movieAPI.getMovieImages(movie.id)
            );
            
            const imagesData = await Promise.all(imagePromises);
            const featuredPhotos = imagesData.flatMap(data => [
                ...data.backdrops.slice(0, 2),
                ...data.posters.slice(0, 1)
            ]);
            
            this.renderFeaturedPhotos(featuredPhotos.slice(0, 12));
            
        } catch (error) {
            console.error('Error loading featured photos:', error);
        }
    }

    async loadTrailers(page = 1) {
        this.showLoading('trailers', true);
        
        try {
            showNotification('Loading trailers...', 'info');
            
            const moviesData = await movieAPI.getPopularMovies(page);
            
            // Get videos for all movies
            const videoPromises = moviesData.results.map(movie =>
                movieAPI.getMovieVideos(movie.id)
            );
            
            const videosData = await Promise.all(videoPromises);
            const allVideos = videosData.flatMap(data =>
                data.results.filter(video => video.site === 'YouTube')
            );

            // Remove duplicates and format videos
            const uniqueVideos = this.removeDuplicateVideos(allVideos);
            
            if (page === 1) {
                this.allVideos = uniqueVideos;
            } else {
                this.allVideos = [...this.allVideos, ...uniqueVideos];
            }
            
            this.hasMoreTrailers = moviesData.total_pages > page;
            this.renderTrailers();
            
            showNotification(`Loaded ${uniqueVideos.length} trailers`, 'success');
            
        } catch (error) {
            console.error('Error loading trailers:', error);
            showNotification('Error loading trailers', 'error');
        } finally {
            this.showLoading('trailers', false);
        }
    }

    async loadPhotos(page = 1) {
        this.showLoading('photos', true);
        
        try {
            showNotification('Loading photos...', 'info');
            
            const moviesData = await movieAPI.getPopularMovies(page);
            
            // Get images for all movies
            const imagePromises = moviesData.results.map(movie =>
                movieAPI.getMovieImages(movie.id)
            );
            
            const imagesData = await Promise.all(imagePromises);
            const allPhotos = imagesData.flatMap(data => [
                ...data.backdrops.map(img => ({ ...img, type: 'backdrop' })),
                ...data.posters.map(img => ({ ...img, type: 'poster' }))
            ]);

            // Remove duplicates and format photos
            const uniquePhotos = this.removeDuplicatePhotos(allPhotos);
            
            if (page === 1) {
                this.allPhotos = uniquePhotos;
            } else {
                this.allPhotos = [...this.allPhotos, ...uniquePhotos];
            }
            
            this.hasMorePhotos = moviesData.total_pages > page;
            this.renderPhotos();
            
            showNotification(`Loaded ${uniquePhotos.length} photos`, 'success');
            
        } catch (error) {
            console.error('Error loading photos:', error);
            showNotification('Error loading photos', 'error');
        } finally {
            this.showLoading('photos', false);
        }
    }

    removeDuplicateVideos(videos) {
        const seen = new Set();
        return videos.filter(video => {
            const key = `${video.movieId || video.key}-${video.type}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    removeDuplicatePhotos(photos) {
        const seen = new Set();
        return photos.filter(photo => {
            const key = photo.file_path;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    renderFeaturedTrailers(videos) {
        const container = document.getElementById('trailersCarousel');
        if (!container) return;

        if (videos.length === 0) {
            container.innerHTML = '<div class="no-content">No featured trailers available</div>';
            return;
        }

        container.innerHTML = videos.map(video => {
            const movie = this.featuredMovies.find(m => m.id === (video.movieId || video.id)) || this.featuredMovies[0];
            const thumbnail = Utils.getImageURL(movie.backdrop_path, 'w500');
            
            return `
                <div class="video-card" onclick="trailersPage.playVideo('${video.key}', '${video.name}', '${movie.title}', '${video.type}')">
                    <div class="video-thumbnail">
                        <img src="${thumbnail}" alt="${video.name}" onerror="this.src='${Utils.getPlaceholderImage(500, 281)}'">
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="video-duration">2:30</div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${Utils.truncateText(video.name, 50)}</div>
                        <div class="video-meta">
                            <span class="video-movie">${movie.title}</span>
                            <span class="video-type">${video.type}</span>
                        </div>
                        <div class="video-views">
                            <i class="fas fa-eye"></i> ${Utils.formatNumber(Math.floor(Math.random() * 1000000))} views
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderFeaturedPhotos(photos) {
        const container = document.getElementById('featuredPhotos');
        if (!container) return;

        if (photos.length === 0) {
            container.innerHTML = '<div class="no-content">No featured photos available</div>';
            return;
        }

        container.innerHTML = photos.map(photo => {
            const movie = this.featuredMovies.find(m => m.backdrop_path === photo.file_path || m.poster_path === photo.file_path) || this.featuredMovies[4];
            const imageUrl = Utils.getImageURL(photo.file_path, 'w500');
            
            return `
                <div class="photo-card" onclick="trailersPage.viewPhoto('${imageUrl}', '${movie.title}', '${movie.title}', '${photo.width}x${photo.height}', '${photo.aspect_ratio}')">
                    <img src="${imageUrl}" alt="${movie.title}" class="photo-image" onerror="this.src='${Utils.getPlaceholderImage(500, 281)}'">
                    <div class="photo-info">
                        <div class="photo-title">${Utils.truncateText(movie.title, 30)}</div>
                        <div class="photo-meta">
                            <span>${movie.title}</span>
                            <span>${photo.width}x${photo.height}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTrailers() {
        const container = document.getElementById('trailersGrid');
        if (!container) return;

        const filteredVideos = this.filterVideos(this.allVideos);
        
        if (filteredVideos.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-film fa-3x"></i>
                    <h3>No trailers found</h3>
                    <p>Try changing your filters or search terms</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredVideos.map(video => {
            const movie = this.featuredMovies.find(m => m.id === (video.movieId || video.id)) || this.featuredMovies[0];
            const thumbnail = Utils.getImageURL(movie.backdrop_path, 'w500');
            
            return `
                <div class="video-card" onclick="trailersPage.playVideo('${video.key}', '${video.name}', '${movie.title}', '${video.type}')">
                    <div class="video-thumbnail">
                        <img src="${thumbnail}" alt="${video.name}" onerror="this.src='${Utils.getPlaceholderImage(500, 281)}'">
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="video-duration">2:30</div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${Utils.truncateText(video.name, 50)}</div>
                        <div class="video-meta">
                            <span class="video-movie">${movie.title}</span>
                            <span class="video-type">${video.type}</span>
                        </div>
                        <div class="video-description">Official ${video.type.toLowerCase()} for ${movie.title}</div>
                        <div class="video-views">
                            <i class="fas fa-eye"></i> ${Utils.formatNumber(Math.floor(Math.random() * 1000000))} views
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPhotos() {
        const container = document.getElementById('photosContainer');
        if (!container) return;

        const filteredPhotos = this.filterPhotos(this.allPhotos);
        container.className = `photos-container ${this.currentView}-view`;
        
        if (filteredPhotos.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-camera fa-3x"></i>
                    <h3>No photos found</h3>
                    <p>Try changing your filters or search terms</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredPhotos.map(photo => {
            const movie = this.featuredMovies.find(m => m.backdrop_path === photo.file_path || m.poster_path === photo.file_path) || this.featuredMovies[0];
            const imageUrl = Utils.getImageURL(photo.file_path, 'w500');
            
            return `
                <div class="photo-card" onclick="trailersPage.viewPhoto('${imageUrl}', '${movie.title}', '${movie.title}', '${photo.width}x${photo.height}', '${photo.aspect_ratio}')">
                    <img src="${imageUrl}" alt="${movie.title}" class="photo-image" onerror="this.src='${Utils.getPlaceholderImage(500, 281)}'">
                    <div class="photo-info">
                        <div class="photo-title">${Utils.truncateText(movie.title, 30)}</div>
                        <div class="photo-meta">
                            <span>${movie.title}</span>
                            <span>${photo.type}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        if (this.currentView === 'masonry') {
            this.initLightGallery();
        }
    }

    filterVideos(videos) {
        return videos.filter(video => {
            // Media type filter
            if (this.currentMediaType !== 'all' && video.type.toLowerCase() !== this.currentMediaType) {
                return false;
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

    playVideo(youtubeKey, title, movieTitle, type) {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        
        if (player && modal) {
            player.innerHTML = `
                <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1" 
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
            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    viewPhoto(url, title, movieTitle, resolution, aspectRatio) {
        const modal = document.getElementById('photoModal');
        
        if (modal) {
            document.getElementById('photoViewerImage').src = url;
            document.getElementById('photoTitle').textContent = title;
            document.getElementById('photoMovie').textContent = movieTitle;
            document.getElementById('photoResolution').textContent = resolution;
            document.getElementById('photoAspect').textContent = aspectRatio;
            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // ... (keep all the existing mobile and utility methods from previous version)

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
        const loadMoreTrailers = document.getElementById('loadMoreTrailers');
        const loadMorePhotos = document.getElementById('loadMorePhotos');
        
        if (loadMoreTrailers) {
            loadMoreTrailers.addEventListener('click', () => {
                this.loadMoreTrailers();
            });
        }
        
        if (loadMorePhotos) {
            loadMorePhotos.addEventListener('click', () => {
                this.loadMorePhotos();
            });
        }

        // Search functionality
        const mediaSearch = document.getElementById('mediaSearch');
        if (mediaSearch) {
            mediaSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performMediaSearch();
                }
            });
        }

        // Filter changes
        ['mediaTypeFilter', 'sortFilter', 'timeFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.applyMediaFilters();
                });
            }
        });

        // Modal close events
        this.setupModalEvents();
    }

    setupModalEvents() {
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').style.display = 'none';
                document.body.style.overflow = 'auto';
                // Stop video when modal closes
                const videoPlayer = document.getElementById('videoPlayer');
                if (videoPlayer) {
                    videoPlayer.innerHTML = '';
                }
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                document.body.style.overflow = 'auto';
                // Stop video when modal closes
                const videoPlayer = document.getElementById('videoPlayer');
                if (videoPlayer) {
                    videoPlayer.innerHTML = '';
                }
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.tab-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }
        
        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeTabContent = document.getElementById(`${tabName}-tab`);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }
        
        // Load content for the tab
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'trailers':
                if (this.allVideos.length === 0) {
                    this.loadTrailers(1);
                } else {
                    this.renderTrailers();
                }
                break;
            case 'photos':
                if (this.allPhotos.length === 0) {
                    this.loadPhotos(1);
                } else {
                    this.renderPhotos();
                }
                break;
            case 'clips':
                // Load clips (filtered videos)
                if (this.allVideos.length === 0) {
                    this.loadTrailers(1);
                } else {
                    this.currentMediaType = 'clip';
                    this.renderTrailers();
                }
                break;
            case 'bts':
                // Load behind the scenes content
                if (this.allVideos.length === 0) {
                    this.loadTrailers(1);
                } else {
                    this.currentMediaType = 'behind the scenes';
                    this.renderTrailers();
                }
                break;
        }
    }

    performMediaSearch() {
        const query = document.getElementById('mediaSearch').value.trim();
        if (query) {
            showNotification(`Searching for: ${query}`, 'info');
            // In a real implementation, you would filter the content based on search
            this.renderTrailers();
            this.renderPhotos();
        }
    }

    applyMediaFilters() {
        this.currentMediaType = document.getElementById('mediaTypeFilter').value;
        this.currentSort = document.getElementById('sortFilter').value;
        this.currentTimeRange = document.getElementById('timeFilter').value;
        
        this.updateFilterCount();
        
        if (this.isMobile && this.filtersVisible) {
            this.toggleFilters();
        }
        
        this.renderTrailers();
    }

    loadMoreTrailers() {
        this.trailersPage++;
        this.loadTrailers(this.trailersPage);
    }

    loadMorePhotos() {
        this.photosPage++;
        this.loadPhotos(this.photosPage);
    }

    updateStats() {
        // These would come from API in real app
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
                
                if (type === 'trailers' && !this.hasMoreTrailers) {
                    loaders[type].style.display = 'none';
                }
                if (type === 'photos' && !this.hasMorePhotos) {
                    loaders[type].style.display = 'none';
                }
            }
        }
    }

    // ... (keep all mobile methods from previous version)
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    window.trailersPage = new TrailersPhotosPage();
});