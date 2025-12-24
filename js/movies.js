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
        
        this.init();
    }

    async init() {
        await this.loadGenres();
        await this.loadLanguages();
        await this.generateYears();
        this.setupEventListeners();
        this.loadMoviesFromURL();
        
        // Show advanced filters if URL has parameters
        if (this.hasFiltersInURL()) {
            this.toggleAdvancedFilters();
        }
        moviesGrid.innerHTML = "<p style='text-align:center;color:#ccc;'>Loading...</p>";

    }

    async loadGenres() {
        try {
            const response = await fetch(`${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}&language=${TMDB_CONFIG.LANGUAGE}`);
            const data = await response.json();
            this.genres = data.genres;
            this.populateGenreFilter();
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    async loadLanguages() {
        try {
            const response = await fetch(`${TMDB_CONFIG.BASE_URL}/configuration/languages?api_key=${TMDB_CONFIG.API_KEY}`);
            const data = await response.json();
            this.languages = data.filter(lang => lang.english_name).slice(0, 20); // Top 20 languages
            this.populateLanguageFilter();
        } catch (error) {
            console.error('Error loading languages:', error);
        }
    }

    generateYears() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1900; year--) {
            this.years.push(year);
        }
        this.populateYearFilter();
    }

    populateGenreFilter() {
        const select = document.getElementById('genreFilter');
        this.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            select.appendChild(option);
        });
    }

    populateLanguageFilter() {
        const select = document.getElementById('languageFilter');
        this.languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.iso_639_1;
            option.textContent = lang.english_name;
            select.appendChild(option);
        });
    }

    populateYearFilter() {
        const select = document.getElementById('yearFilter');
        this.years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Search input
        document.getElementById('moviesSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performMoviesSearch();
            }
        });

        // Advanced filters toggle
        document.getElementById('toggleAdvancedFilters').addEventListener('click', () => {
            this.toggleAdvancedFilters();
        });

        // Quick view modal
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
            document.getElementById(id).addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Keyword and company filters with debounce
        this.setupDebouncedFilters();
    }

    setupDebouncedFilters() {
        let timeout;
        ['keywordFilter', 'companyFilter'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.applyFilters();
                }, 500);
            });
        });
    }

    toggleAdvancedFilters() {
        const filters = document.getElementById('advancedFilters');
        const button = document.getElementById('toggleAdvancedFilters');
        
        filters.classList.toggle('active');
        button.innerHTML = filters.classList.contains('active') ? 
            '<i class="fas fa-times"></i> Hide Filters' : 
            '<i class="fas fa-sliders-h"></i> Advanced Filters';
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
        
        // Update UI with current filters
        this.updateFilterUI();
        
        // Load movies
        await this.loadMovies();
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
                data = await movieAPI.getPopularMovies(this.currentPage);
            }

            this.currentMovies = data.results;
            this.totalPages = data.total_pages > 500 ? 500 : data.total_pages; // TMDB limits to 500 pages
            this.totalResults = data.total_results;

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

    renderMovies() {
        const container = document.getElementById('moviesContainer');
        const isListView = container.classList.contains('list-view');
        
        if (this.currentMovies.length === 0) {
            document.getElementById('noResults').style.display = 'block';
            container.innerHTML = '';
            return;
        }

        document.getElementById('noResults').style.display = 'none';
        
        container.innerHTML = this.currentMovies.map(movie => this.createMovieCard(movie, isListView)).join('');
    }

    createMovieCard(movie, isListView = false) {
        if (isListView) {
            return `
                <div class="movie-item list-view" onclick="moviesPage.viewMovieDetails(${movie.id})">
                    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
                         alt="${movie.title}" 
                         class="movie-poster"
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="movie-info">
                        <div>
                            <h4 class="movie-title">${movie.title}</h4>
                            <p class="movie-overview">${movie.overview || 'No description available.'}</p>
                        </div>
                        <div class="movie-meta">
                            <span class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
                            <span class="movie-rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
                            <span class="movie-votes">${movie.vote_count} votes</span>
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
            <div class="movie-card" onclick="moviesPage.quickView(${movie.id})">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="movie-info">
                    <h4 class="movie-title">${movie.title}</h4>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
                        <span class="movie-rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
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
        const start = (this.currentPage - 1) * 20 + 1;
        const end = Math.min(this.currentPage * 20, this.totalResults);
        
        document.getElementById('resultsTitle').textContent = 
            this.currentFilters.query ? `Search Results for "${this.currentFilters.query}"` : 'Popular Movies';
        
        document.getElementById('resultsCount').textContent = 
            `Showing ${start}-${end} of ${this.totalResults.toLocaleString()} movies`;
    }

    renderPagination() {
        const container = document.getElementById('pagination');
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
        }
    }

    showQuickView(movie) {
        const modal = document.getElementById('quickViewModal');
        const content = document.getElementById('quickViewContent');
        
        content.innerHTML = `
            <div class="quick-view-content">
                <div class="quick-view-header" style="background-image: url('https://image.tmdb.org/t/p/w1280${movie.backdrop_path}')">
                    <div class="quick-view-overlay"></div>
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                         alt="${movie.title}" 
                         class="quick-view-poster"
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="quick-view-body">
                    <h2 class="quick-view-title">${movie.title}</h2>
                    <div class="quick-view-meta">
                        <span>${movie.release_date ? movie.release_date.split('-')[0] : 'TBA'}</span>
                        <span>⭐ ${movie.vote_average.toFixed(1)}/10</span>
                        <span>${movie.runtime || 'N/A'} min</span>
                        <span>${movie.genres.map(g => g.name).join(', ')}</span>
                    </div>
                    <p class="quick-view-overview">${movie.overview || 'No description available.'}</p>
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
        document.getElementById('quickViewModal').style.display = 'none';
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
        document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
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
    
    container.className = 'movies-container ' + viewType + '-view';
    gridBtn.classList.toggle('active', viewType === 'grid');
    listBtn.classList.toggle('active', viewType === 'list');
    
    // Re-render movies with new view
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