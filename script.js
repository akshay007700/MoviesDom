// Example JS for search demo
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.querySelector(".search-box input");
  const movies = document.querySelectorAll(".movie-card");

  if (searchBox) {
    searchBox.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      movies.forEach(movie => {
        const title = movie.querySelector("h3").textContent.toLowerCase();
        movie.style.display = title.includes(term) ? "block" : "none";
      });
    });
  }
});
