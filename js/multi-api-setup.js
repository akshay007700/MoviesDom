// ✅ MoviesDom - Multi API Setup (OMDb + TVMaze + Trakt)
// Author: Akshay's Project Build
// Works with all three free APIs

// =============================
// 🧩 API Keys Configuration
// =============================
const API_KEYS = {
  OMDB: "d2f044eb",     // Example: "2d6a1234"
  TRAKT: "3d6fe20612e704cc7039a667879c2e2a3dcc88e1f60b33ac2b5196ea9b779231",   // Example: "abcdefghi12345"
};

// =============================
// 🎬 1. OMDb API - Movies Data
// =============================
async function fetchOMDbMovie(title) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEYS.OMDB}&t=${encodeURIComponent(title)}`);
    const data = await res.json();
    if (data.Response === "False") throw new Error(data.Error);
    return {
      source: "OMDb",
      title: data.Title,
      year: data.Year,
      rating: data.imdbRating,
      genre: data.Genre,
      plot: data.Plot,
      poster: data.Poster,
    };
  } catch (err) {
    console.warn("OMDb failed:", err.message);
    return null;
  }
}

// =============================
// 📺 2. TVMaze API - Series Data
// =============================
async function fetchTVMazeShow(query) {
  try {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data.length) throw new Error("No results");
    const show = data[0].show;
    return {
      source: "TVMaze",
      title: show.name,
      rating: show.rating?.average || "N/A",
      genre: show.genres?.join(", ") || "N/A",
      summary: show.summary?.replace(/<[^>]+>/g, "") || "No summary",
      image: show.image?.original || show.image?.medium || "https://placehold.co/300x450?text=No+Image",
    };
  } catch (err) {
    console.warn("TVMaze failed:", err.message);
    return null;
  }
}

// =============================
// 🔥 3. Trakt API - Trending Movies
// =============================
async function fetchTraktTrending() {
  try {
    const res = await fetch("https://api.trakt.tv/movies/trending", {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": API_KEYS.TRAKT,
      },
    });
    const data = await res.json();
    return data.map((item) => ({
      source: "Trakt",
      title: item.movie.title,
      year: item.movie.year,
      watchers: item.watchers,
      ids: item.movie.ids,
    }));
  } catch (err) {
    console.warn("Trakt failed:", err.message);
    return [];
  }
}

// =============================
// 🧠 4. Smart Fetch Controller
// =============================
async function getMovieInfo(title) {
  // Try OMDb first
  let movie = await fetchOMDbMovie(title);
  if (movie) return movie;

  // If not found, try TVMaze
  movie = await fetchTVMazeShow(title);
  if (movie) return movie;

  // If still nothing, fallback to trending from Trakt
  const trending = await fetchTraktTrending();
  return trending.length ? trending[0] : null;
}

// =============================
// 🎨 5. UI Renderer
// =============================
async function renderMovieSearch(title) {
  const container = document.getElementById("multiApiResult");
  container.innerHTML = `<p class="loader">Fetching details for "${title}"...</p>`;

  const movie = await getMovieInfo(title);

  if (!movie) {
    container.innerHTML = `<p style="color:red;">No results found.</p>`;
    return;
  }

  if (movie.source === "Trakt") {
    container.innerHTML = `
      <div class="movie-card">
        <h2>🔥 ${movie.title}</h2>
        <p>(${movie.year})</p>
        <p>Watchers: ${movie.watchers}</p>
        <small>Source: ${movie.source}</small>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="movie-card">
        <img src="${movie.poster || movie.image}" alt="${movie.title}">
        <h2>${movie.title}</h2>
        <p><strong>Genre:</strong> ${movie.genre}</p>
        <p><strong>Rating:</strong> ${movie.rating}</p>
        <p>${movie.plot || movie.summary}</p>
        <small>Source: ${movie.source}</small>
      </div>`;
  }
}

// =============================
// 🚀 6. Search Box Event
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("multiApiSearchForm");
  const input = document.getElementById("movieInput");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (title) renderMovieSearch(title);
  });
});
