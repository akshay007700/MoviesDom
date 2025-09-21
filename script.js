// 🗝️ Final API key
const API_KEY = "e78e0bb8fb42db4fa0b56b4246151f08"; 
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

document.addEventListener("DOMContentLoaded", () => {
  const moviesGrid = document.querySelector(".movies-grid");
  const searchInput = document.getElementById("searchInput");
  const genreFilter = document.getElementById("filterGenre");
  const yearFilter = document.getElementById("filterYear");
  const ratingFilter = document.getElementById("filterRating");

  let allMovies = [];

  // 🎬 Movies Load from API
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      allMovies = data.results;
      renderMovies(allMovies);
    })
    .catch(err => console.error("Error fetching movies:", err));

  // 📌 Render Movies Function
  function renderMovies(movies) {
    moviesGrid.innerHTML = "";
    if (movies.length === 0) {
      moviesGrid.innerHTML = "<p style='grid-column:1/-1;text-align:center;'>No movies found.</p>";
      return;
    }

    movies.forEach(movie => {
      const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

      const card = document.createElement("div");
      card.classList.add("movie-card");
      card.setAttribute("data-genre", movie.genre_ids[0] || "unknown");
      card.setAttribute("data-year", year);
      card.setAttribute("data-rating", rating);

      card.innerHTML = `
        <a href="movie-detail.html?id=${movie.id}">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        </a>
        <h3>${movie.title}</h3>
        <p>${year} • Rating: ${rating}</p>
      `;

      moviesGrid.appendChild(card);
    });
  }

  // 🔍 Search & Filters
  function applyFilters() {
    const term = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedGenre = genreFilter?.value || "all";
    const selectedYear = yearFilter?.value || "all";
    const selectedRating = ratingFilter?.value || "all";

    const filteredMovies = allMovies.filter(movie => {
      const title = movie.title.toLowerCase();
      const year = movie.release_date ? movie.release_date.split("-")[0] : "";
      const rating = movie.vote_average;

      const matchesSearch = title.includes(term);
      const matchesGenre = selectedGenre === "all" || movie.genre_ids.includes(parseInt(selectedGenre));
      const matchesYear = selectedYear === "all" || year === selectedYear;
      const matchesRating = selectedRating === "all" || rating >= parseInt(selectedRating);

      return matchesSearch && matchesGenre && matchesYear && matchesRating;
    });

    renderMovies(filteredMovies);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  [genreFilter, yearFilter, ratingFilter].forEach(filter => {
    if (filter) filter.addEventListener("change", applyFilters);
  });
});
