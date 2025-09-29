const YT_API_KEY = AIzaSyAf3Ov8t11NoFhZL4_vOrJ2bk4IiJT-0hw; // 👈 यहां अपनी restricted YouTube API key डालें
const QUERY = "movie shorts"; // Only shorts-related search
const MAX_RESULTS = 8;

// Fetch YouTube Shorts
async function fetchShorts() {
  const clipsList = document.getElementById("clipsList");
  clipsList.innerHTML = `<p class="loader">Fetching Shorts...</p>`;

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      QUERY
    )}&maxResults=${MAX_RESULTS}&key=${YT_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      clipsList.innerHTML = `<p style="color:red;text-align:center;">
        YouTube API Error: ${data.error.message}
      </p>`;
      return;
    }

    // Filter: केवल उन्हीं videos को allow करें जिनके title/description में "short" है
    const shorts = data.items.filter(
      (item) =>
        item.snippet.title.toLowerCase().includes("short") ||
        item.snippet.description.toLowerCase().includes("short")
    );

    if (!shorts.length) {
      clipsList.innerHTML = `<p style="text-align:center;color:#ccc;">No Shorts found.</p>`;
      return;
    }

    // Render Shorts
    clipsList.innerHTML = shorts
      .map(
        (item) => `
        <div class="short-card">
          <iframe 
            src="https://www.youtube.com/embed/${item.id.videoId}?playsinline=1"
            allow="autoplay; encrypted-media"
            allowfullscreen>
          </iframe>
          <div class="short-info">
            <h4>${item.snippet.title}</h4>
          </div>
          <div class="short-actions">
            <button>❤️</button>
            <button>💬</button>
            <button>🔗</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Fetch error:", err);
    clipsList.innerHTML = `<p style="color:red;text-align:center;">Failed to load Shorts</p>`;
  }
}

// Auto-play/stop logic (future upgrade: use YouTube IFrame API)
document.addEventListener("DOMContentLoaded", fetchShorts);
