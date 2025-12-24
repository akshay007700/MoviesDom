// Advanced Movie News System
class MovieNewsPage {
    constructor() {
        this.currentCategory = 'all';
        this.currentFilters = {
            time: 'all',
            source: 'all',
            sort: 'latest'
        };
        this.newsPage = 1;
        this.hasMoreNews = true;
        
        this.articles = [];
        this.filteredArticles = [];
        this.featuredArticles = [];
        this.trendingTopics = [];
        
        this.swiper = null;
        
        this.init();
    }

    async init() {
        await this.loadNewsData();
        this.initializeSwiper();
        this.setupEventListeners();
        this.loadTrendingTopics();
        this.loadNewsSources();
        this.loadUpcomingEvents();
        this.showBreakingNews();
    }

    async loadNewsData() {
        this.showLoading(true);
        
        try {
            // Load popular movies to generate news about
            const moviesData = await movieAPI.getPopularMovies(1);
            this.generateNewsArticles(moviesData.results);
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading news data:', error);
            showNotification('Failed to load news articles', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    generateNewsArticles(movies) {
        const newsCategories = [
            'breaking', 'releases', 'casting', 'reviews', 'box-office', 
            'interviews', 'awards', 'rumors', 'technology'
        ];
        
        const newsSources = [
            { name: 'Variety', logo: 'https://logo.clearbit.com/variety.com', credibility: 95 },
            { name: 'The Hollywood Reporter', logo: 'https://logo.clearbit.com/hollywoodreporter.com', credibility: 94 },
            { name: 'Deadline', logo: 'https://logo.clearbit.com/deadline.com', credibility: 93 },
            { name: 'Entertainment Weekly', logo: 'https://logo.clearbit.com/ew.com', credibility: 92 },
            { name: 'IMDb', logo: 'https://logo.clearbit.com/imdb.com', credibility: 90 },
            { name: 'Screen Rant', logo: 'https://logo.clearbit.com/screenrant.com', credibility: 85 },
            { name: 'Collider', logo: 'https://logo.clearbit.com/collider.com', credibility: 88 }
        ];

        this.articles = movies.flatMap((movie, index) => {
            return Array.from({ length: 3 }, (_, i) => {
                const category = newsCategories[Math.floor(Math.random() * newsCategories.length)];
                const source = newsSources[Math.floor(Math.random() * newsSources.length)];
                const hoursAgo = Math.floor(Math.random() * 72);
                const isBreaking = Math.random() > 0.9;
                
                return {
                    id: `article-${movie.id}-${i}`,
                    title: this.generateArticleTitle(movie.title, category),
                    excerpt: this.generateArticleExcerpt(movie.title, category),
                    content: this.generateArticleContent(movie.title, category),
                    category: category,
                    categoryName: this.getCategoryName(category),
                    source: source.name,
                    sourceLogo: source.logo,
                    credibility: source.credibility,
                    image: movie.backdrop_path ? 
                        `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : 
                        'images/placeholder.jpg',
                    movieId: movie.id,
                    movieTitle: movie.title,
                    timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
                    isBreaking: isBreaking,
                    views: Math.floor(Math.random() * 10000),
                    shares: Math.floor(Math.random() * 1000),
                    comments: Math.floor(Math.random() * 500),
                    readTime: Math.floor(Math.random() * 5) + 3,
                    tags: this.generateTags(movie.title, category)
                };
            });
        });

        // Select featured articles (first 5 with highest views)
        this.featuredArticles = [...this.articles]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);
    }

    generateArticleTitle(movieTitle, category) {
        const titles = {
            breaking: [
                `Breaking: Major Development for ${movieTitle}`,
                `Exclusive: ${movieTitle} Faces Unexpected Challenge`,
                `Urgent Update: ${movieTitle} Production News`
            ],
            releases: [
                `${movieTitle} Release Date Confirmed`,
                `New Release Schedule for ${movieTitle}`,
                `${movieTitle} Coming Soon to Theaters`
            ],
            casting: [
                `Star Joins Cast of ${movieTitle}`,
                `${movieTitle} Casting Announcement Shocks Fans`,
                `Exclusive: Cast Revealed for ${movieTitle}`
            ],
            reviews: [
                `Critics Praise ${movieTitle}`,
                `${movieTitle} Review: A Masterpiece?`,
                `Early Reviews for ${movieTitle} Are In`
            ],
            'box-office': [
                `${movieTitle} Dominates Box Office`,
                `Box Office Update: ${movieTitle} Breaks Records`,
                `${movieTitle} Earnings Report Released`
            ],
            interviews: [
                `Exclusive Interview: ${movieTitle} Director Speaks`,
                `Cast of ${movieTitle} Reveals Behind-the-Scenes Details`,
                `Director's Vision for ${movieTitle} Explained`
            ],
            awards: [
                `${movieTitle} Receives Multiple Award Nominations`,
                `${movieTitle} Wins Big at Awards Ceremony`,
                `Award Recognition for ${movieTitle}`
            ],
            rumors: [
                `Rumor: ${movieTitle} Sequel in Development`,
                `Industry Insider Reveals ${movieTitle} Secrets`,
                `Speculation Grows About ${movieTitle} Future`
            ],
            technology: [
                `${movieTitle} Uses Groundbreaking Technology`,
                `VFX Breakthrough in ${movieTitle}`,
                `Technical Innovations in ${movieTitle}`
            ]
        };

        const categoryTitles = titles[category] || titles.breaking;
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }

    generateArticleExcerpt(movieTitle, category) {
        const excerpts = {
            breaking: `Major developments are unfolding for ${movieTitle}. Stay tuned for live updates as this story develops.`,
            releases: `Fans of ${movieTitle} will be excited to learn about the latest release information and scheduling updates.`,
            casting: `The casting department has made some surprising choices for ${movieTitle}. See who's joining the cast.`,
            reviews: `Early critical reception for ${movieTitle} is generating significant buzz in the film community.`,
            'box-office': `${movieTitle} continues to perform exceptionally well at the box office, breaking several records.`,
            interviews: `In an exclusive interview, the creative team behind ${movieTitle} shares insights about the production.`,
            awards: `${movieTitle} has been recognized with several prestigious award nominations this season.`,
            rumors: `Industry insiders are buzzing with rumors about potential future developments for ${movieTitle}.`,
            technology: `The technical achievements in ${movieTitle} are setting new standards for the industry.`
        };

        return excerpts[category] || `Latest news and updates about ${movieTitle}.`;
    }

    generateArticleContent(movieTitle, category) {
        return `
            <h2>${this.generateArticleTitle(movieTitle, category)}</h2>
            <p>${this.generateArticleExcerpt(movieTitle, category)}</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <blockquote>
                "This is a significant development for the film industry and fans of ${movieTitle} alike."
                <cite>- Industry Expert</cite>
            </blockquote>
            <p>The production team has worked tirelessly to bring this project to life, and the results are truly remarkable.</p>
        `;
    }

    generateTags(movieTitle, category) {
        const baseTags = [movieTitle.toLowerCase(), category];
        const additionalTags = ['movie', 'news', 'hollywood', 'entertainment', 'cinema'];
        
        return [...baseTags, ...additionalTags.slice(0, 3)];
    }

    getCategoryName(category) {
        const names = {
            all: 'All News',
            breaking: 'Breaking News',
            releases: 'Releases',
            casting: 'Casting',
            reviews: 'Reviews',
            'box-office': 'Box Office',
            interviews: 'Interviews',
            awards: 'Awards',
            rumors: 'Rumors',
            technology: 'Technology'
        };
        
        return names[category] || category;
    }

    initializeSwiper() {
        this.swiper = new Swiper('.featured-carousel', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.carousel-next',
                prevEl: '.carousel-prev',
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });

        this.renderFeaturedCarousel();
    }

    renderFeaturedCarousel() {
        const container = document.getElementById('featuredCarousel');
        
        container.innerHTML = this.featuredArticles.map(article => `
            <div class="swiper-slide">
                <div class="featured-slide" onclick="movieNews.openArticle('${article.id}')">
                    <img src="${article.image}" alt="${article.title}" class="featured-image" onerror="this.src='images/placeholder.jpg'">
                    <div class="featured-overlay">
                        <span class="featured-badge">${article.categoryName}</span>
                        <h3 class="featured-title">${article.title}</h3>
                        <p class="featured-excerpt">${article.excerpt}</p>
                        <div class="featured-meta">
                            <span>${article.source}</span>
                            <span>${this.formatTimeAgo(article.timestamp)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Update Swiper
        if (this.swiper) {
            this.swiper.update();
        }
    }

    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategory(e.currentTarget.dataset.category);
            });
        });

        // Filter changes
        ['timeFilter', 'sourceFilter', 'sortFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.currentFilters[e.target.id.replace('Filter', '')] = e.target.value;
                this.applyFilters();
            });
        });

        // Search functionality
        document.getElementById('newsSearch').addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.applyFilters();
            }, 500);
        });

        // Load more
        document.getElementById('loadMoreNews').addEventListener('click', () => {
            this.loadMoreNews();
        });

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    setCategory(category) {
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.applyFilters();
        
        // Scroll to news grid
        document.querySelector('.news-feed').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    applyFilters() {
        this.filteredArticles = this.articles.filter(article => {
            // Category filter
            if (this.currentCategory !== 'all' && article.category !== this.currentCategory) {
                return false;
            }
            
            // Time filter
            if (this.currentFilters.time !== 'all') {
                const articleTime = article.timestamp.getTime();
                const now = Date.now();
                let timeDiff;
                
                switch (this.currentFilters.time) {
                    case 'today': timeDiff = 24 * 60 * 60 * 1000; break;
                    case 'week': timeDiff = 7 * 24 * 60 * 60 * 1000; break;
                    case 'month': timeDiff = 30 * 24 * 60 * 60 * 1000; break;
                    default: break;
                }
                
                if (timeDiff && now - articleTime > timeDiff) return false;
            }
            
            // Source filter
            if (this.currentFilters.source !== 'all' && article.source !== this.currentFilters.source) {
                return false;
            }
            
            // Search filter
            const searchTerm = document.getElementById('newsSearch').value.toLowerCase();
            if (searchTerm && !article.title.toLowerCase().includes(searchTerm) && 
                !article.excerpt.toLowerCase().includes(searchTerm) &&
                !article.tags.some(tag => tag.includes(searchTerm))) {
                return false;
            }
            
            return true;
        });

        this.sortArticles();
        this.renderNewsGrid();
        this.updateStats();
    }

    sortArticles() {
        const sortBy = this.currentFilters.sort;
        
        this.filteredArticles.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return b.views - a.views;
                case 'trending':
                    const aTrend = a.views + a.shares * 2 + a.comments * 3;
                    const bTrend = b.views + b.shares * 2 + b.comments * 3;
                    return bTrend - aTrend;
                case 'latest':
                default:
                    return b.timestamp - a.timestamp;
            }
        });
    }

    renderNewsGrid() {
        const container = document.getElementById('newsGrid');
        
        if (this.filteredArticles.length === 0) {
            container.innerHTML = `
                <div class="no-articles" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search fa-3x" style="color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3>No articles found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button class="btn btn-primary" onclick="movieNews.resetFilters()">Reset Filters</button>
                </div>
            `;
            return;
        }

        const articlesToShow = this.filteredArticles.slice(0, this.newsPage * 9);
        
        container.innerHTML = articlesToShow.map(article => this.createArticleCard(article)).join('');
        
        // Update load more button visibility
        this.updateLoadMoreButton();
    }

    createArticleCard(article) {
        return `
            <div class="news-article" onclick="movieNews.openArticle('${article.id}')">
                <img src="${article.image}" alt="${article.title}" class="article-image" onerror="this.src='images/placeholder.jpg'">
                <div class="article-content">
                    <div class="article-header">
                        <span class="article-category">${article.categoryName}</span>
                        <span class="article-date">${this.formatTimeAgo(article.timestamp)}</span>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-footer">
                        <div class="article-source">
                            <img src="${article.sourceLogo}" alt="${article.source}" class="source-logo" onerror="this.style.display='none'">
                            <span>${article.source}</span>
                        </div>
                        <div class="article-actions">
                            <span class="article-action" onclick="event.stopPropagation(); movieNews.shareArticle('${article.id}')">
                                <i class="fas fa-share"></i> ${article.shares}
                            </span>
                            <span class="article-action" onclick="event.stopPropagation(); movieNews.likeArticle('${article.id}')">
                                <i class="fas fa-heart"></i> ${article.views}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadTrendingTopics() {
        // Generate trending topics from article tags
        const topicCounts = {};
        this.articles.forEach(article => {
            article.tags.forEach(tag => {
                topicCounts[tag] = (topicCounts[tag] || 0) + 1;
            });
        });

        this.trendingTopics = Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([topic, count], index) => ({
                rank: index + 1,
                topic: topic.charAt(0).toUpperCase() + topic.slice(1),
                count: count
            }));

        this.renderTrendingTopics();
    }

    renderTrendingTopics() {
        const container = document.querySelector('.topics-list');
        
        container.innerHTML = this.trendingTopics.map(topic => `
            <div class="topic-item" onclick="movieNews.searchTopic('${topic.topic}')">
                <span class="topic-rank">${topic.rank}</span>
                <span class="topic-name">${topic.topic}</span>
                <span class="topic-count">${topic.count}</span>
            </div>
        `).join('');
    }

    loadNewsSources() {
        const sources = [...new Set(this.articles.map(article => article.source))];
        const select = document.getElementById('sourceFilter');
        
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add source options
        sources.forEach(source => {
            const option = document.createElement('option');
            option.value = source;
            option.textContent = source;
            select.appendChild(option);
        });

        this.renderNewsSources();
    }

    renderNewsSources() {
        const sources = [...new Set(this.articles.map(article => ({
            name: article.source,
            logo: article.sourceLogo,
            count: this.articles.filter(a => a.source === article.source).length
        })))].slice(0, 6);

        const container = document.querySelector('.sources-grid');
        
        container.innerHTML = sources.map(source => `
            <div class="source-item" onclick="movieNews.filterBySource('${source.name}')">
                <img src="${source.logo}" alt="${source.name}" class="source-logo-large" onerror="this.style.display='none'">
                <span class="source-name">${source.name}</span>
            </div>
        `).join('');
    }

    loadUpcomingEvents() {
        this.upcomingEvents = [
            {
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                title: 'Oscar Nominations Announcement',
                location: 'Los Angeles, CA'
            },
            {
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                title: 'Film Festival Opening',
                location: 'Virtual Event'
            },
            {
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                title: 'Major Movie Premiere',
                location: 'Hollywood, CA'
            }
        ];

        this.renderUpcomingEvents();
    }

    renderUpcomingEvents() {
        const container = document.querySelector('.events-list');
        
        container.innerHTML = this.upcomingEvents.map(event => `
            <div class="event-item">
                <div class="event-date">
                    <div class="event-day">${event.date.getDate()}</div>
                    <div class="event-month">${event.date.toLocaleString('en-US', { month: 'short' })}</div>
                </div>
                <div class="event-details">
                    <div class="event-title">${event.title}</div>
                    <div class="event-location">${event.location}</div>
                </div>
            </div>
        `).join('');
    }

    showBreakingNews() {
        const breakingArticles = this.articles.filter(article => article.isBreaking);
        if (breakingArticles.length > 0) {
            const breakingNews = document.getElementById('breakingNews');
            const breakingItems = document.querySelector('.breaking-items');
            
            breakingItems.innerHTML = breakingArticles.map(article => `
                <span class="breaking-item">${article.title}</span>
            `).join('');
            
            breakingNews.classList.add('active');
        }
    }

    openArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        const modal = document.getElementById('articleModal');
        const content = document.getElementById('articleModalContent');

        content.innerHTML = `
            <div class="article-detail">
                <div class="article-detail-header">
                    <img src="${article.image}" alt="${article.title}" class="article-detail-image" onerror="this.src='images/placeholder.jpg'">
                    <div class="article-detail-meta">
                        <span class="article-category">${article.categoryName}</span>
                        <h2>${article.title}</h2>
                        <div class="article-detail-info">
                            <span><i class="fas fa-newspaper"></i> ${article.source}</span>
                            <span><i class="fas fa-clock"></i> ${this.formatTimeAgo(article.timestamp)}</span>
                            <span><i class="fas fa-eye"></i> ${article.views} views</span>
                            <span><i class="fas fa-hourglass"></i> ${article.readTime} min read</span>
                        </div>
                    </div>
                </div>
                <div class="article-detail-content">
                    ${article.content}
                </div>
                <div class="article-detail-footer">
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="article-tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="article-detail-actions">
                        <button class="btn btn-primary" onclick="movieNews.shareArticle('${article.id}')">
                            <i class="fas fa-share"></i> Share Article
                        </button>
                        <button class="btn btn-secondary" onclick="movieNews.saveArticle('${article.id}')">
                            <i class="fas fa-bookmark"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        
        // Track article view
        article.views++;
    }

    shareArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: window.location.href + `?article=${articleId}`
            });
        } else {
            navigator.clipboard.writeText(window.location.href + `?article=${articleId}`);
            showNotification('Article link copied to clipboard!', 'success');
        }

        article.shares++;
        this.renderNewsGrid();
    }

    likeArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            article.views++;
            this.renderNewsGrid();
            showNotification('Article liked!', 'success');
        }
    }

    searchTopic(topic) {
        document.getElementById('newsSearch').value = topic;
        this.applyFilters();
    }

    filterBySource(source) {
        document.getElementById('sourceFilter').value = source;
        this.currentFilters.source = source;
        this.applyFilters();
    }

    loadMoreNews() {
        this.newsPage++;
        this.renderNewsGrid();
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreNews');
        const articlesShown = this.newsPage * 9;
        
        if (articlesShown >= this.filteredArticles.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    resetFilters() {
        this.currentCategory = 'all';
        this.currentFilters = { time: 'all', source: 'all', sort: 'latest' };
        this.newsPage = 1;
        
        document.getElementById('newsSearch').value = '';
        document.getElementById('timeFilter').value = 'all';
        document.getElementById('sourceFilter').value = 'all';
        document.getElementById('sortFilter').value = 'latest';
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-category="all"]').classList.add('active');
        
        this.applyFilters();
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showLoading(show) {
        const loader = document.getElementById('newsLoading');
        if (show) {
            loader.classList.add('active');
        } else {
            loader.classList.remove('active');
        }
    }

    updateStats() {
        document.getElementById('totalArticles').textContent = 
            this.filteredArticles.length.toLocaleString();
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return timestamp.toLocaleDateString();
    }

    saveArticle(articleId) {
        const savedArticles = JSON.parse(localStorage.getItem('moviesdom_saved_articles') || '[]');
        if (!savedArticles.includes(articleId)) {
            savedArticles.push(articleId);
            localStorage.setItem('moviesdom_saved_articles', JSON.stringify(savedArticles));
            showNotification('Article saved to your collection!', 'success');
        } else {
            showNotification('Article already saved!', 'warning');
        }
    }
}

// Global functions
function closeBreakingNews() {
    document.getElementById('breakingNews').classList.remove('active');
}

function searchNews() {
    if (window.movieNews) {
        const query = document.getElementById('newsSearch').value;
        window.movieNews.applyFilters();
    }
}

function applyFilters() {
    if (window.movieNews) {
        window.movieNews.applyFilters();
    }
}

function resetFilters() {
    if (window.movieNews) {
        window.movieNews.resetFilters();
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    window.movieNews = new MovieNewsPage();
});