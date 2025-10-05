// js/home.js
// MoviesDom - home page dynamic loader (MultiAPI based)
// Requires: multi-api-setup.js (window.MultiAPI) and config.js (keys set)

// small helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));
function createMovieCard(m) {
  // m: { id, title, poster, rating, year }
  return `
    <div class="movie-card" data-id="${m.id}">
      <img class="movie-poster" src="${m.poster || 'images/placeholder.jpg'}" alt="${m.title}">
      <div class="movie-info">
        <h4 style="margin:0 0 6px">${m.title}</h4>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="color:#bbb;font-size:13px">${m.year || ''}</div>
          <div class="rating">⭐ ${m.rating ? Number(m.rating).toFixed(1) : '—'}</div>
        </div>
      </div>
    </div>
  `;
}

// Auto-rotate hero slides
function setupHeroRotation() {
  const slides = qsa('.hero-slide');
  if (!slides.length) return;
  let idx = 0;
  slides.forEach((s,i)=> s.classList.toggle('active', i===0));
  setInterval(()=> {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 4500);
}

async function loadHero() {
  const heroEl = qs('#heroCarousel');
  heroEl.innerHTML = `<div class="hero-placeholder" style="color:#bbb">Loading featured...</div>`;
  try {
    const data = await MultiAPI.getTrendingAll(); // {trendingMovies, trendingShows}
    const movies = data.trendingMovies || [];
    // pick top 4-5 and fetch OMDb details for poster/plot if needed
    const picks = movies.slice(0,5);
    const slidesHtml = await Promise.all(picks.map(async (mv) => {
      // mv from Trakt has fields like title, ids (tmdb/imdb), year
      let poster = '';
      let overview = mv.overview || '';
      // try OMDb by title for poster + rating
      try {
        const om = await MultiAPI.getMovieDetails(mv.title);
        poster = om.poster && om.poster !== "N/A" ? om.poster : (`${window.TMDB_CONFIG ? window.TMDB_CONFIG.IMAGE_BASE_URL + (mv.backdrop_path || mv.poster_path || '') : ''}`);
        overview = overview || om.plot || '';
      } catch(e) {
        poster = `${window.TMDB_CONFIG ? window.TMDB_CONFIG.IMAGE_BASE_URL + (mv.backdrop_path || mv.poster_path || '') : 'images/placeholder.jpg'}`;
      }
      return `
        <div class="hero-slide" style="background-image: url('${poster}');">
          <div class="slide-overlay"></div>
        </div>
      `;
    }));

    heroEl.innerHTML = slidesHtml.join('');
    setupHeroRotation();

    // set hero text using first pick
    const first = picks[0];
    if (first) {
      qs('#hero-title').textContent = first.title || 'Featured';
      qs('#hero-desc').textContent = (first.overview && first.overview.length>120) ? first.overview.substring(0,140)+'...' : (first.overview || 'Top trending picks for you.');
    }
  } catch (err) {
    console.error('Error loading hero:', err);
    heroEl.innerHTML = `<div class="hero-placeholder" style="color:#bbb">Failed to load featured</div>`;
  }
}

async function renderSection(apiFn, containerSelector, titleFallback) {
  const container = qs(containerSelector);
  if (!container) return;
  container.innerHTML = `<div class="movie-card" style="padding:18px;color:#bbb">Loading...</div>`;
  try {
    const items = await apiFn();
    // items expected to be array of movie objects (Trakt movie object or OMDb fallback)
    const cards = await Promise.all(items.slice(0,12).map(async (it) => {
      // Normalize fields
      let title = it.title || it.name;
      let year = it.year || it.release_year || (it.release_date ? it.release_date.split('-')[0] : '');
      let rating = (it.rating || it.vote_average || (it.imdbRating ? Number(it.imdbRating) : '')) || '';
      let poster = '';

      // If Trakt movie object has ids or poster, try to use OMDb via title
      try {
        const md = await MultiAPI.getMovieDetails(title);
        poster = md.poster && md.poster !== "N/A" ? md.poster : (it.images && it.images.poster ? it.images.poster : '');
        rating = rating || md.rating || md.imdbRating || '';
      } catch (e) {
        // fallback: use TMDB_CONFIG image if available
        poster = (window.TMDB_CONFIG && it.poster_path) ? (window.TMDB_CONFIG.IMAGE_BASE_URL + it.poster_path) : 'images/placeholder.jpg';
      }

      return {
        id: it.ids && it.ids.trakt ? it.ids.trakt : (it.id || title),
        title,
        year,
        rating,
        poster
      };
    }));

    container.innerHTML = cards.map(createMovieCard).join('');
    // click handler to go to details (movie-details.html?id=...)
    qsa(containerSelector + ' .movie-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        // attempt to pass title via query if id not numeric
        const title = card.querySelector('h4')?.textContent || '';
        location.href = `movie-details.html?id=${encodeURIComponent(id)}&title=${encodeURIComponent(title)}`;
      });
    });
  } catch (err) {
    console.error('Error rendering section', containerSelector, err);
    container.innerHTML = `<div style="color:#bbb;padding:12px">Failed to load.</div>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load hero & sections
  await loadHero();

  // Trending (Trakt)
  await renderSection(async () => {
    const d = await MultiAPI.getTrendingAll();
    return d.trendingMovies || [];
  }, '#trendingMovies');

  // Now Playing (try Trakt popular + fallback)
  await renderSection(async () => {
    try {
      // Trakt doesn't expose "now playing" exact; use Trakt trending first.
      const d = await MultiAPI.getTrendingAll();
      return d.trendingMovies || [];
    } catch (e) {
      return [];
    }
  }, '#nowPlaying');

  // Upcoming - use OMDb search by year upcoming? fallback to empty
  await renderSection(async () => {
    // Trakt upcoming isn't simple; we show trending as placeholder to keep UI consistent
    const d = await MultiAPI.getTrendingAll();
    return d.trendingMovies || [];
  }, '#upcomingMovies');
});
