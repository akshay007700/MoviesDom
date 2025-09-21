document.addEventListener("DOMContentLoaded", () => {
  // 🔍 Search functionality
  const searchInput = document.getElementById("searchInput");
  const movieCards = document.querySelectorAll(".movie-card");

  function filterMovies() {
    const term = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedGenre = document.getElementById("filterGenre")?.value || "all";
    const selectedYear = document.getElementById("filterYear")?.value || "all";
    const selectedRating = document.getElementById("filterRating")?.value || "all";

    movieCards.forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const genre = card.getAttribute("data-genre");
      const year = card.getAttribute("data-year");
      const rating = card.getAttribute("data-rating");

      const matchesSearch = title.includes(term);
      const matchesGenre = selectedGenre === "all" || genre === selectedGenre;
      const matchesYear = selectedYear === "all" || year === selectedYear;
      const matchesRating = selectedRating === "all" || rating === selectedRating;

      if (matchesSearch && matchesGenre && matchesYear && matchesRating) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterMovies);
  }

  // 🎛 Filters
  const genreFilter = document.getElementById("filterGenre");
  const yearFilter = document.getElementById("filterYear");
  const ratingFilter = document.getElementById("filterRating");

  [genreFilter, yearFilter, ratingFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener("change", filterMovies);
    }
  });

  // 🎬 Poster Click → Movie Detail Page
  const posters = document.querySelectorAll(".movie-card a img");
  posters.forEach(poster => {
    poster.addEventListener("click", (e) => {
      e.preventDefault();
      const movieTitle = poster.closest(".movie-card").querySelector("h3").textContent;
      // Example: Pass title in URL for dynamic detail page
      window.location.href = `movie-detail.html?title=${encodeURIComponent(movieTitle)}`;
    });
  });
});
