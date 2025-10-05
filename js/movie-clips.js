/* ============================================================
   🎬 Movie Clips Page Script (Fixed Version)
   Author: Akshay (MoviesDom)
   Note: 404 JSON error fixed, enhanced error handling added
   ============================================================ */

class MovieClipApp {
    constructor() {
        // ✅ FIXED: Correct JSON path
        // Previously: this.baseURL = 'data/clips.json';
        this.baseURL = 'movie-clip.json';

        // Elements
        this.container = document.querySelector('.clip-container');
        this.searchInput = document.getElementById('search-input');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.loader = document.querySelector('.loader');
        this.errorBox = document.querySelector('.error-message');

        // Data storage
        this.allClips = [];
        this.filteredClips = [];

        // Init
        this.init();
    }

    // ======================
    // 🚀 Initialize the page
    // ======================
    async init() {
        try {
            this.showLoader(true);
            const clips = await this.fetchClips();
            this.allClips = clips;
            this.filteredClips = clips;
            this.renderClips(clips);
            this.showLoader(false);
            console.log("🎬 Movie Clips Loaded Successfully");

            // Setup events
            this.setupSearch();
            this.setupFilters();

        } catch (error) {
            this.showLoader(false);
            console.error("❌ Error initializing MovieClipApp:", error);
            this.showError("⚠️ Failed to load movie clips. Please check your internet connection or file path.");
        }
    }

    // ===========================
    // 📡 Fetch clips JSON data
    // ===========================
    async fetchClips() {
        try {
            const response = await fetch(this.baseURL, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (!Array.isArray(data)) throw new Error("Invalid JSON format (expected an array)");
            return data;

        } catch (err) {
            console.error("❌ FetchClips Error:", err);
            this.showError("Couldn't fetch clip data. JSON file missing or incorrect path.");
            return [];
        }
    }

    // ===========================
    // 🎥 Render clips on the page
    // ===========================
    renderClips(clips) {
        if (!this.container) return;

        if (!clips.length) {
            this.container.innerHTML = `<div class="no-results">😢 No clips found</div>`;
            return;
        }

        const html = clips.map(clip => `
            <div class="clip-card" data-category="${clip.category}">
                <div class="clip-thumb">
                    <video 
                        src="${clip.src}" 
                        poster="${clip.thumbnail}" 
                        controls 
                        preload="metadata"
                        class="clip-video"
                    ></video>
                </div>
                <div class="clip-details">
                    <h3 class="clip-title">${clip.title}</h3>
                    <p class="clip-category">${clip.category}</p>
                    <div class="clip-meta">
                        <span>⭐ ${clip.rating || "N/A"}</span>
                        <span>${clip.duration || "00:00"}</span>
                    </div>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = html;

        // Add modal / preview event listeners if present
        this.enablePreview();
    }

    // ===========================
    // 🔍 Search functionality
    // ===========================
    setupSearch() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            this.filteredClips = this.allClips.filter(
                clip =>
                    clip.title.toLowerCase().includes(query) ||
                    clip.category.toLowerCase().includes(query)
            );
            this.renderClips(this.filteredClips);
        });
    }

    // ===========================
    // 🎛 Filter buttons (by category)
    // ===========================
    setupFilters() {
        if (!this.filterButtons.length) return;

        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;

                if (filter === "all") {
                    this.renderClips(this.allClips);
                } else {
                    const filtered = this.allClips.filter(c => c.category.toLowerCase() === filter.toLowerCase());
                    this.renderClips(filtered);
                }
            });
        });
    }

    // ===========================
    // 🖼 Video Preview Modal
    // ===========================
    enablePreview() {
        const videos = document.querySelectorAll('.clip-video');
        videos.forEach(video => {
            video.addEventListener('mouseenter', () => {
                video.play();
            });
            video.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        });
    }

    // ===========================
    // 🌀 Loader & Error Handling
    // ===========================
    showLoader(show) {
        if (!this.loader) return;
        this.loader.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        if (!this.errorBox) {
            this.container.innerHTML = `<div class="error-message">${message}</div>`;
        } else {
            this.errorBox.textContent = message;
            this.errorBox.style.display = "block";
        }
    }
}

// ===========================
// 🚀 Initialize App
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    new MovieClipApp();
});
