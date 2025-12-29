// Movies Page Functionality
class MoviesPage {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalResults = 0;
        this.currentMovies = [];
        this.currentFilters = {
            query: '',
            genre: '',
            year: '',
            rating: '',
            sort: 'popularity.desc',
            language: '',
            runtime: '',
            keyword: '',
            company: ''
        };
        
        this.genres = [];
        this.languages = [];
        this.years = [];
        this.category = '';
        
        this.init();
    }

    async init() {
        await this.loadGenres();
        await this.loadLanguages();
        await this.generateYears();
        this.setupEventListeners();
        await this.loadMoviesFromURL();
        
        // Show advanced filters if URL has parameters
        if (this.hasFiltersInURL()) {
            this.toggleAdvancedFilters();
        }
    }

    async loadGenres() {
        try {
            const response = await fetch(`${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`);
            const data = await response.json();
            this.genres = data.genres || [];
            this.populateGenreFilter();
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    async loadLanguages() {
        try {
            const response = await fetch(`${TMDB_CONFIG.BASE_URL}/configuration/languages?api_key=${TMDB_CONFIG.API_KEY}`);
            const data = await response.json();
            this.languages = (data || []).filter(lang => lang.english_name).slice(0, 20); // Top 20 languages
            this.populateLanguageFilter();
        } catch (error) {
            console.error('Error loading languages:', error);
        }
    }

    generateYears() {
        const currentYear = new Date().getFullYear();
        this.years = [];
        for (let year = currentYear; year >= 1900; year--) {
            this.years.push(year);
        }
        this.populateYearFilter();
    }

    populateGenreFilter() {
        const select = document.getElementById('genreFilter');
        select.innerHTML = '<option value="">All Genres</option>';
        this.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            select.appendChild(option);
        });
    }

    populateLanguageFilter() {
        const select = document.getElementById('languageFilter');
        select.innerHTML = '<option value="">All Languages</option>';
        this.languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.iso_639_1;
            option.textContent = lang.english_name;
            select.appendChild(option);
        });
    }

    populateYearFilter() {
        const select = document.getElementById('yearFilter');
        select.innerHTML = '<option value="">All Years</option>';
        this.years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Search button
        document.querySelector('.search-box button').addEventListener('click', () => {
            this.performMoviesSearch();
        });

        // Search input enter key
        document.getElementById('moviesSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performMoviesSearch();
            }
        });

        // Advanced filters toggle
        document.getElementById('toggleAdvancedFilters').addEventListener('click', () => {
            this.toggleAdvancedFilters();
        });

        // Quick view modal close
        document.querySelector('.quick-view-modal .close').addEventListener('click', () => {
            this.closeQuickView();
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('quickViewModal');
            if (e.target === modal) {
                this.closeQuickView();
            }
        });

        // Filter changes
        ['genreFilter', 'yearFilter', 'ratingFilter', 'sortFilter', 'languageFilter', 'runtimeFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });

        // Keyword and company filters with debounce
        this.setupDebouncedFilters();
    }

    setupDebouncedFilters() {
        let timeout;
        ['keywordFilter', 'companyFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.applyFilters();
                    }, 500);
                });
            }
        });
    }

    toggleAdvancedFilters() {
        const filters = document.getElementById('advancedFilters');
        const button = document.getElementById('toggleAdvancedFilters');
        
        if (filters && button) {
            filters.classList.toggle('active');
            button.innerHTML = filters.classList.contains('active') ? 
                '<i class="fas fa-times"></i> Hide Filters' : 
                '<i class="fas fa-sliders-h"></i> Advanced Filters';
        }
    }

    async loadMoviesFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Get filters from URL
        this.currentFilters.query = urlParams.get('search') || '';
        this.currentFilters.genre = urlParams.get('genre') || '';
        this.currentFilters.year = urlParams.get('year') || '';
        this.currentFilters.rating = urlParams.get('rating') || '';
        this.currentFilters.sort = urlParams.get('sort') || 'popularity.desc';
        this.currentFilters.language = urlParams.get('language') || '';
        
        this.currentPage = parseInt(urlParams.get('page')) || 1;
        
        // Get category from URL and apply language logic
        this.category = urlParams.get('category') || '';
        this.applyCategoryFilter();
        
        // Update UI with current filters
        this.updateFilterUI();
        
        // Update header based on category
        this.updateCategoryHeader();
        
        // Load movies
        await this.loadMovies();
    }

    applyCategoryFilter() {
        if (!this.category) return;
        
        switch(this.category) {
            case 'hollywood':
                this.currentFilters.language = 'en';
                break;
            case 'bollywood':
                this.currentFilters.language = 'hi';
                break;
            case 'south':
                this.currentFilters.language = 'ta|te|ml|kn';
                break;
        }
    }

    updateCategoryHeader() {
        const titleElement = document.getElementById('categoryTitle');
        const subtitleElement = document.getElementById('categorySubtitle');
        
        if (!titleElement || !subtitleElement) return;
        
        switch(this.category) {
            case 'hollywood':
                titleElement.innerHTML = `<i class="fas fa-film"></i> Hollywood Movies 🎬`;
                subtitleElement.textContent = 'Popular and trending English movies';
                break;
            case 'bollywood':
                titleElement.innerHTML = `<i class="fas fa-film"></i> Bollywood Movies 🇮🇳`;
                subtitleElement.textContent = 'Latest Hindi movies & blockbusters';
                break;
            case 'south':
                titleElement.innerHTML = `<i class="fas fa-film"></i> South Indian Movies 🔥`;
                subtitleElement.textContent = 'Tamil • Telugu • Malayalam • Kannada cinema';
                break;
            default:
                titleElement.innerHTML = `<i class="fas fa-film"></i> Browse Movies 🎥`;
                subtitleElement.textContent = 'Discover movies from all industries';
        }
    }

    updateFilterUI() {
        document.getElementById('moviesSearch').value = this.currentFilters.query;
        document.getElementById('genreFilter').value = this.currentFilters.genre;
        document.getElementById('yearFilter').value = this.currentFilters.year;
        document.getElementById('ratingFilter').value = this.currentFilters.rating;
        document.getElementById('sortFilter').value = this.currentFilters.sort;
        document.getElementById('languageFilter').value = this.currentFilters.language;
    }

    async loadMovies() {
        this.showLoading(true);
        
        try {
            let data;
            if (this.currentFilters.query) {
                data = await movieAPI.searchMovies(this.currentFilters.query, this.currentPage);
            } else {
                // Handle South Indian languages special case
                if (this.currentFilters.language === 'ta|te|ml|kn') {
                    data = await this.loadSouthIndianMovies();
                } else {
                    data = await movieAPI.getPopularMovies(this.currentPage, this.currentFilters.language);
                }
            }

            this.currentMovies = data.results || [];
            this.totalPages = data.total_pages > 500 ? 500 : (data.total_pages || 1);
            this.totalResults = data.total_results || 0;

            this.renderMovies();
            this.updateResultsInfo();
            this.renderPagination();
            
        } catch (error) {
            console.error('Error loading movies:', error);
            this.showError('Failed to load movies. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async loadSouthIndianMovies() {
        // For South Indian movies, we need to combine results from multiple languages
        const languages = ['ta', 'te', 'ml', 'kn'];
        const allResults = [];
        let totalResults = 0;
        let totalPages = 1;
        
        // Get first page from each language and combine
        for (const lang of languages) {
            try {
                const data = await movieAPI.getPopularMovies(1, lang);
                if (data.results && data.results.length > 0) {
                    // Add first 5 movies from each language
                    allResults.push(...data.results.slice(0, 5));
                }
                totalResults += data.total_results || 0;
            } catch (error) {
                console.error(`Error loading ${lang} movies:`, error);
            }
        }
        
        // Remove duplicates based on movie ID
        const uniqueResults = [];
        const seenIds = new Set();
        
        for (const movie of allResults) {
            if (!seenIds.has(movie.id)) {
                seenIds.add(movie.id);
                uniqueResults.push(movie);
            }
        }
        
        // Sort by popularity
        uniqueResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        
        return {
            results: uniqueResults.slice(0, 20),
            total_results: totalResults,
            total_pages: totalPages
        };
    }

    renderMovies() {
        const container = document.getElementById('moviesContainer');
        if (!container) return;
        
        const isListView = container.classList.contains('list-view');
        
        if (this.currentMovies.length === 0) {
            document.getElementById('noResults').style.display = 'block';
            container.innerHTML = '';
            return;
        }

        document.getElementById('noResults').style.display = 'none';
        
        container.innerHTML = this.currentMovies.map(movie => this.createMovieCard(movie, isListView)).join('');
        
        // Add click event listeners to movie cards
        container.querySelectorAll('.movie-card, .movie-item.list-view').forEach(card => {
            const movieId = card.getAttribute('data-movie-id');
            if (movieId) {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.movie-actions')) {
                        this.quickView(parseInt(movieId));
                    }
                });
            }
        });
    }

    createMovieCard(movie, isListView = false) {
        const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'images/placeholder.jpg';
        const title = movie.title || 'Untitled Movie';
        const overview = movie.overview || 'No description available.';
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'TBA';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
        const voteCount = movie.vote_count || 0;

        if (isListView) {
            return `
                <div class="movie-item list-view" data-movie-id="${movie.id}">
                    <img src="${posterPath}" 
                         alt="${title}" 
                         class="movie-poster"
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="movie-info">
                        <div>
                            <h4 class="movie-title">${title}</h4>
                            <p class="movie-overview">${overview}</p>
                        </div>
                        <div class="movie-meta">
                            <span class="movie-year">${year}</span>
                            <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
                            <span class="movie-votes">${voteCount} votes</span>
                        </div>
                    </div>
                    <div class="movie-actions">
                        <button class="btn btn-primary" onclick="event.stopPropagation(); moviesPage.viewMovieDetails(${movie.id})">
                            Details
                        </button>
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); moviesPage.addToWatchlist(${movie.id})">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="movie-card" data-movie-id="${movie.id}">
                <img src="${posterPath}" 
                     alt="${title}" 
                     class="movie-poster"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h4 class="movie-title">${title}</h4>
                    <div class="movie-meta">
                        <span class="movie-year">${year}</span>
                        <span class="movie-rating"><i class="fas fa-star"></i> ${rating}</span>
                    </div>
                    <div class="movie-actions">
                        <button class="btn btn-primary" onclick="event.stopPropagation(); moviesPage.viewMovieDetails(${movie.id})">
                            Details
                        </button>
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); moviesPage.addToWatchlist(${movie.id})">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateResultsInfo() {
        const titleElement = document.getElementById('resultsTitle');
        const countElement = document.getElementById('resultsCount');
        
        if (!titleElement || !countElement) return;
        
        const start = (this.currentPage - 1) * 20 + 1;
        const end = Math.min(this.currentPage * 20, this.totalResults);
        
        titleElement.textContent = this.currentFilters.query ? 
            `Search Results for "${this.currentFilters.query}"` : 'Popular Movies';
        
        countElement.textContent = `Showing ${start}-${end} of ${this.totalResults.toLocaleString()} movies`;
    }

    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container || this.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        let html = '';
        
        // Previous button
        html += `<button onclick="moviesPage.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                 </button>`;
        
        // First page and ellipsis
        if (startPage > 1) {
            html += `<button onclick="moviesPage.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `<button onclick="moviesPage.goToPage(${i})" ${i === this.currentPage ? 'class="active"' : ''}>${i}</button>`;
        }
        
        // Last page and ellipsis
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button onclick="moviesPage.goToPage(${this.totalPages})">${this.totalPages}</button>`;
        }
        
        // Next button
        html += `<button onclick="moviesPage.goToPage(${this.currentPage + 1})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                 </button>`;
        
        container.innerHTML = html;
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        
        this.currentPage = page;
        this.updateURL();
        this.loadMovies();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    performMoviesSearch() {
        const query = document.getElementById('moviesSearch').value.trim();
        this.currentFilters.query = query;
        this.currentPage = 1;
        this.updateURL();
        this.loadMovies();
    }

    applyFilters() {
        this.currentFilters.genre = document.getElementById('genreFilter').value;
        this.currentFilters.year = document.getElementById('yearFilter').value;
        this.currentFilters.rating = document.getElementById('ratingFilter').value;
        this.currentFilters.sort = document.getElementById('sortFilter').value;
        this.currentFilters.language = document.getElementById('languageFilter').value;
        this.currentFilters.runtime = document.getElementById('runtimeFilter').value;
        this.currentFilters.keyword = document.getElementById('keywordFilter').value;
        this.currentFilters.company = document.getElementById('companyFilter').value;
        
        this.currentPage = 1;
        this.updateURL();
        this.loadMovies();
    }

    resetFilters() {
        this.currentFilters = {
            query: '',
            genre: '',
            year: '',
            rating: '',
            sort: 'popularity.desc',
            language: '',
            runtime: '',
            keyword: '',
            company: ''
        };
        
        this.currentPage = 1;
        
        document.getElementById('moviesSearch').value = '';
        document.getElementById('genreFilter').value = '';
        document.getElementById('yearFilter').value = '';
        document.getElementById('ratingFilter').value = '';
        document.getElementById('sortFilter').value = 'popularity.desc';
        document.getElementById('languageFilter').value = '';
        document.getElementById('runtimeFilter').value = '';
        document.getElementById('keywordFilter').value = '';
        document.getElementById('companyFilter').value = '';
        
        this.updateURL();
        this.loadMovies();
    }

    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentFilters.query) params.set('search', this.currentFilters.query);
        if (this.currentFilters.genre) params.set('genre', this.currentFilters.genre);
        if (this.currentFilters.year) params.set('year', this.currentFilters.year);
        if (this.currentFilters.rating) params.set('rating', this.currentFilters.rating);
        if (this.currentFilters.sort !== 'popularity.desc') params.set('sort', this.currentFilters.sort);
        if (this.currentFilters.language) params.set('language', this.currentFilters.language);
        if (this.currentPage > 1) params.set('page', this.currentPage);
        if (this.category) params.set('category', this.category);
        
        const newURL = params.toString() ? `movies.html?${params.toString()}` : 'movies.html';
        window.history.replaceState({}, '', newURL);
    }

    hasFiltersInURL() {
        const params = new URLSearchParams(window.location.search);
        return params.toString().length > 0;
    }

    async quickView(movieId) {
        try {
            const movie = await movieAPI.getMovieDetails(movieId);
            this.showQuickView(movie);
        } catch (error) {
            console.error('Error loading movie details:', error);
            showNotification('Failed to load movie details', 'error');
        }
    }

    showQuickView(movie) {
        const modal = document.getElementById('quickViewModal');
        const content = document.getElementById('quickViewContent');
        
        if (!modal || !content) return;
        
        const backdropPath = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : '';
        const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'images/placeholder.jpg';
        const title = movie.title || 'Untitled Movie';
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'TBA';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
        const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
        const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : '';
        const overview = movie.overview || 'No description available.';
        
        content.innerHTML = `
            <div class="quick-view-content">
                <div class="quick-view-header" style="background-image: url('${backdropPath}')">
                    <div class="quick-view-overlay"></div>
                    <img src="${posterPath}" 
                         alt="${title}" 
                         class="quick-view-poster"
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="quick-view-body">
                    <h2 class="quick-view-title">${title}</h2>
                    <div class="quick-view-meta">
                        <span>${year}</span>
                        <span>⭐ ${rating}/10</span>
                        <span>${runtime}</span>
                        <span>${genres}</span>
                    </div>
                    <p class="quick-view-overview">${overview}</p>
                    <div class="quick-view-actions">
                        <button class="btn btn-primary" onclick="moviesPage.viewMovieDetails(${movie.id})">
                            <i class="fas fa-info-circle"></i> Full Details
                        </button>
                        <button class="btn btn-secondary" onclick="moviesPage.addToWatchlist(${movie.id})">
                            <i class="fas fa-bookmark"></i> Watchlist
                        </button>
                        <button class="btn btn-outline" onclick="moviesPage.closeQuickView()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    closeQuickView() {
        const modal = document.getElementById('quickViewModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    viewMovieDetails(movieId) {
        window.location.href = `movie-details.html?id=${movieId}`;
    }

    addToWatchlist(movieId) {
        const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]');
        if (!watchlist.includes(movieId)) {
            watchlist.push(movieId);
            localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
            showNotification('Added to watchlist!', 'success');
        } else {
            showNotification('Already in watchlist!', 'warning');
        }
    }

    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        showNotification(message, 'error');
    }
}

// Global functions for HTML onclick attributes
function toggleView(viewType) {
    const container = document.getElementById('moviesContainer');
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    
    if (!container || !gridBtn || !listBtn) return;
    
    container.className = 'movies-container ' + viewType + '-view';
    gridBtn.classList.toggle('active', viewType === 'grid');
    listBtn.classList.toggle('active', viewType === 'list');

    if (window.moviesPage) {
        window.moviesPage.renderMovies();
    }
}

function performMoviesSearch() {
    if (window.moviesPage) {
        window.moviesPage.performMoviesSearch();
    }
}

function applyFilters() {
    if (window.moviesPage) {
        window.moviesPage.applyFilters();
    }
}

function resetFilters() {
    if (window.moviesPage) {
        window.moviesPage.resetFilters();
    }
}

// Initialize movies page
document.addEventListener('DOMContentLoaded', () => {
    window.moviesPage = new MoviesPage();
});