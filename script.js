document.addEventListener("DOMContentLoaded", () => {
  // Search functionality
  const searchInput = document.getElementById("searchInput");
  const movieCards = document.querySelectorAll(".movie-card");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      movieCards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = title.includes(term) ? "block" : "none";
      });
    });
  }document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const movieCards = document.querySelectorAll(".movie-card");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();

      movieCards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        if (title.includes(term)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
});


  // Simple filter example
  const filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    filterBar.addEventListener("change", () => {
      alert("Filter applied (demo only)");
    });
  }
});
