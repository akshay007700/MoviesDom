
// Placeholder for future features (search, filter, detail page)
console.log("MoviesDom JS loaded!");

// Example: alert on form submit
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Message sent! (demo)");
    });
  }
});
