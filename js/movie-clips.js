h/* movie-clips.js
   YouTube + Local JSON fallback
   Keep design same — only functional changes/additions
*/

class MovieClipApp {
  constructor() {
    // <-- PASTE YOUR YOUTUBE API KEY HERE (keep quotes) -->
    // Example: this.YT_API_KEY = 'AIzaSy...';
    this.YT_API_KEY = 'AIzaSyAf3Ov8t11NoFhZL4_vOrJ2bk4IiJT-0hw';

    // default search query for YouTube if used
    this.YT_QUERY = 'movie clips short film trailer';
    this.YT_MAX = 12;

    // local fallback JSON (must exist in repo root or adjust path)
    this.localJSON = 'movie-clips.json';

    // DOM
    this.container = document.querySelector('.clip-container');
    this.searchInput = document.getElementById('search-input');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.loader = document.querySelector('.loader');
    this.errorBox = document.querySelector('.error-message');

    // state
    this.allClips = [];
    this.filteredClips = [];

    this.init();
  }

  // init
  async init() {
    this.showLoader(true);
    try {
      const fromYT = await this.tryLoadYouTube();
      if (fromYT && fromYT.length) {
        this.allClips = fromYT;
        this.renderClips(this.allClips);
        console.log('🎬 Clips loaded from YouTube API');
      } else {
        // fallback to local JSON
        const local = await this.fetchLocalClips();
        this.allClips = local;
        this.renderClips(this.allClips);
        console.log('📦 Clips loaded from local JSON (fallback)');
      }
    } catch (err) {
      console.warn('⚠️ Primary fetch failed, using local JSON fallback.', err);
      const local = await this.fetchLocalClips();
      this.allClips = local;
      this.renderClips(this.allClips);
    } finally {
      this.showLoader(false);
      this.setupSearch();
      this.setupFilters();
    }
  }

  // Try to fetch from YouTube API — returns normalized array or [] on fail
  async tryLoadYouTube() {
    // if key missing or placeholder, skip youtube and use local
    if (!this.YT_API_KEY || this.YT_API_KEY === 'PASTE_YOUR_KEY_HERE') {
      console.warn('YouTube API key missing — skipping YouTube fetch.');
      return [];
    }

    const url = `https://www.googleapis.com/youtube/v3/search?key=${encodeURIComponent(
      this.YT_API_KEY
    )}&part=snippet&type=video&order=relevance&maxResults=${this.YT_MAX}&q=${encodeURIComponent(
      this.YT_QUERY
    )}`;

    try {
      const res = await fetch(url);
      // If not ok, try parsing error body to detect referrer blocked or other reason
      if (!res.ok) {
        let errBody = {};
        try { errBody = await res.json(); } catch (e) { /* ignore */ }
        // If API key blocked due to referrer rules, throw to trigger fallback
        if (errBody && errBody.error && errBody.error.details) {
          const meta = errBody.error.details.find(d => d['@type'] && d.reason === 'API_KEY_HTTP_REFERRER_BLOCKED');
          if (meta) {
            console.error('YouTube API - HTTP referrer blocked.', errBody);
            throw new Error('YouTube API key: HTTP referrer blocked');
          }
        }
        // generic error
        console.error('YouTube API returned non-OK response', res.status, errBody);
        throw new Error('YouTube API error');
      }
      const data = await res.json();
      if (!data.items || !Array.isArray(data.items)) return [];
      // Normalize to our clip format
      const clips = data.items.map(item => {
        const vid = item.id.videoId;
        const thumb = (item.snippet.thumbnails && (item.snippet.thumbnails.high || item.snippet.thumbnails.medium || item.snippet.thumbnails.default)).url || '';
        return {
          title: item.snippet.title,
          category: 'youtube',
          thumbnail: thumb,
          // use embed URL so it can be used in iframe without extra conversion
          src: `https://www.youtube.com/embed/${vid}?rel=0&playsinline=1`,
          rating: '',
          duration: 'short'
        };
      });
      return clips;
    } catch (err) {
      console.error('Error fetching YouTube:', err);
      // bubble up to allow fallback logic
      return [];
    }
  }

  // Fetch local JSON fallback
  async fetchLocalClips() {
    try {
      const r = await fetch(this.localJSON, { cache: 'no-store' });
      if (!r.ok) throw new Error(`Local JSON HTTP ${r.status}`);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error('Local JSON invalid format (expected array)');
      return data;
    } catch (err) {
      console.error('Local JSON fetch error:', err);
      // show friendly error message and return empty
      this.showError('Failed to load local clips JSON. Check the file path or format.');
      return [];
    }
  }

  // Render clips into DOM (keeps original classes and markup)
  renderClips(clips) {
    if (!this.container) return;
    if (!clips.length) {
      this.container.innerHTML = `<div class="no-results">No clips found</div>`;
      return;
    }

    const html = clips
      .map(clip => {
        // keep design: if src is youtube embed (contains youtube.com/embed) show iframe,
        // else show <video> tag (local mp4)
        const isYouTube = typeof clip.src === 'string' && clip.src.includes('youtube.com/embed');
        const thumbAttr = clip.thumbnail ? `poster="${clip.thumbnail}"` : '';
        return `
          <div class="clip-card" data-category="${clip.category || ''}">
            <div class="clip-thumb">
              ${isYouTube
                ? `<iframe src="${clip.src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                : `<video src="${clip.src}" controls preload="metadata" ${thumbAttr}></video>`
              }
            </div>
            <div class="clip-info">
              <h3 class="clip-title">${this.escapeHtml(clip.title || '')}</h3>
              <p class="clip-category">${this.escapeHtml(clip.category || '')}</p>
              <div class="clip-meta">
                <span>${clip.rating || ''}</span>
                <span>${clip.duration || ''}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    this.container.innerHTML = html;
    this.enablePreview();
  }

  // escape small HTML to avoid breaking the layout if title contains tags
  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Setup search input (keeps behavior unchanged)
  setupSearch() {
    if (!this.searchInput) return;
    this.searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = this.allClips.filter(c =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q)
      );
      this.renderClips(filtered);
    });
  }

  // Setup filter buttons (keeps original behavior)
  setupFilters() {
    if (!this.filterButtons || !this.filterButtons.length) return;
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        if (filter === 'all') {
          this.renderClips(this.allClips);
        } else {
          const filtered = this.allClips.filter(c => (c.category || '').toLowerCase() === filter.toLowerCase());
          this.renderClips(filtered);
        }
      });
    });
  }

  // Hover preview for local videos (keeps UX same)
  enablePreview() {
    // Play video on hover for local video elements only
    const vids = Array.from(this.container.querySelectorAll('video'));
    vids.forEach(v => {
      // don't autostart inside iframe (youtube handles itself)
      v.addEventListener('mouseenter', () => { try { v.play(); } catch(e){} });
      v.addEventListener('mouseleave', () => { try { v.pause(); v.currentTime = 0; } catch(e){} });
    });
  }

  // loader / error UI
  showLoader(show) {
    if (!this.loader) return;
    this.loader.style.display = show ? 'flex' : 'none';
  }

  showError(msg) {
    if (!this.errorBox) {
      console.warn('Error box element not found. Message:', msg);
      return;
    }
    this.errorBox.textContent = msg;
    this.errorBox.style.display = 'block';
  }
}

// initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new MovieClipApp();
});
