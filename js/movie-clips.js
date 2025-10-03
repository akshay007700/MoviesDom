// 👇 Replace with your restricted YouTube API Key
const YT_API_KEY = "AIzaSyAf3Ov8t11NoFhZL4_vOrJ2bk4IiJT-0hw";
const QUERY = "movie shorts";
const MAX_RESULTS = 6;

let nextPageToken = null;
let isLoading = false;

/* ===== LocalStorage Helpers ===== */
function loadComments(videoId) {
  const saved = localStorage.getItem("comments_" + videoId);
  return saved ? JSON.parse(saved) : [];
}

function saveComment(videoId, text) {
  const comments = loadComments(videoId);
  comments.push(text);
  localStorage.setItem("comments_" + videoId, JSON.stringify(comments));
}

function loadLikes(videoId) {
  return parseInt(localStorage.getItem("likes_" + videoId) || "0", 10);
}

function saveLike(videoId, count) {
  localStorage.setItem("likes_" + videoId, count);
}

/* ===== Fetch Shorts ===== */
async function fetchShorts(loadMore = false) {
  const clipsList = document.getElementById("clipsList");

  if (!loadMore) {
    clipsList.innerHTML = `<p class="loader">Fetching Shorts...</p>`;
  } else {
    showLoader();
  }

  if (isLoading) return;
  isLoading = true;

  try {
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      QUERY
    )}&maxResults=${MAX_RESULTS}&key=${YT_API_KEY}`;

    if (nextPageToken) {
      url += `&pageToken=${nextPageToken}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    nextPageToken = data.nextPageToken || null;

    if (data.error) {
      clipsList.innerHTML += `<p style="color:red;text-align:center;">
        YouTube API Error: ${data.error.message}
      </p>`;
      return;
    }

    const shorts = data.items.filter(
      (item) =>
        item.snippet.title.toLowerCase().includes("short") ||
        item.snippet.description.toLowerCase().includes("short")
    );

    if (!shorts.length && !loadMore) {
      clipsList.innerHTML = `<p style="text-align:center;color:#ccc;">No Shorts found.</p>`;
      return;
    }

    const newClips = shorts
      .map((item) => {
        const videoId = item.id.videoId;
        const savedLikes = loadLikes(videoId);
        return `
        <div class="short-card" data-video="${videoId}">
          <iframe 
            class="yt-player"
            src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1"
            allow="autoplay; encrypted-media"
            allowfullscreen>
          </iframe>
          <div class="short-info">
            <h4>${item.snippet.title}</h4>
          </div>
          <div class="short-actions">
            <button class="like-btn">❤️ <span class="like-count">${savedLikes}</span></button>
            <button class="comment-btn">💬</button>
            <button onclick="copyLink('https://www.youtube.com/watch?v=${videoId}')">🔗</button>
          </div>
          <!-- Comments Section -->
          <div class="comments-box" style="display:none;">
            <div class="comments-list"></div>
            <div class="comment-form">
              <input type="text" placeholder="Add a comment..." class="comment-input"/>
              <button class="post-comment">Post</button>
            </div>
          </div>
        </div>`;
      })
      .join("");

    if (loadMore) {
      removeLoader();
      clipsList.insertAdjacentHTML("beforeend", newClips);
    } else {
      clipsList.innerHTML = newClips;
    }

    setupAutoPlay();
    setupInteractions();
    restoreAllComments();
    restoreAllLikes();
  } catch (err) {
    console.error("Fetch error:", err);
    clipsList.innerHTML += `<p style="color:red;text-align:center;">Failed to load Shorts</p>`;
  } finally {
    isLoading = false;
  }
}

/* ===== AutoPlay TikTok Style ===== */
function setupAutoPlay() {
  const players = document.querySelectorAll(".yt-player");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const iframe = entry.target;
        if (entry.isIntersecting) {
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            "*"
          );
        } else {
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            "*"
          );
        }
      });
    },
    { threshold: 0.7 }
  );

  players.forEach((iframe) => {
    if (!iframe.src.includes("enablejsapi=1")) {
      iframe.src += "&enablejsapi=1";
    }
    observer.observe(iframe);
  });
}

/* ===== Infinite Scroll ===== */
function setupInfiniteScroll() {
  const sentinel = document.createElement("div");
  sentinel.id = "scrollSentinel";
  sentinel.style.height = "50px";
  document.querySelector(".clips-container").appendChild(sentinel);

  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && nextPageToken) {
          fetchShorts(true);
        }
      });
    },
    { rootMargin: "100px" }
  );

  scrollObserver.observe(sentinel);
}

/* ===== Loader ===== */
function showLoader() {
  let loader = document.getElementById("scrollLoader");
  if (!loader) {
    loader = document.createElement("p");
    loader.id = "scrollLoader";
    loader.className = "loader";
    loader.innerText = "Loading more...";
    document.getElementById("clipsList").appendChild(loader);
  }
}

function removeLoader() {
  const loader = document.getElementById("scrollLoader");
  if (loader) loader.remove();
}

/* ===== Interactions ===== */
function setupInteractions() {
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".short-card");
      const videoId = card.getAttribute("data-video");
      const countSpan = btn.querySelector(".like-count");
      let count = parseInt(countSpan.textContent, 10);
      count++;
      countSpan.textContent = count;
      saveLike(videoId, count);
    });
  });

  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".short-card");
      const box = card.querySelector(".comments-box");
      box.style.display = box.style.display === "none" ? "block" : "none";
    });
  });

  document.querySelectorAll(".post-comment").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".short-card");
      const videoId = card.getAttribute("data-video");
      const form = btn.closest(".comment-form");
      const input = form.querySelector(".comment-input");
      const text = input.value.trim();

      if (text) {
        const list = card.querySelector(".comments-list");
        const commentEl = document.createElement("p");
        commentEl.className = "comment-item";
        commentEl.textContent = text;
        list.appendChild(commentEl);
        saveComment(videoId, text);
        input.value = "";
      }
    });
  });
}

/* ===== Restore Data ===== */
function restoreAllComments() {
  document.querySelectorAll(".short-card").forEach((card) => {
    const videoId = card.getAttribute("data-video");
    const list = card.querySelector(".comments-list");
    const savedComments = loadComments(videoId);

    savedComments.forEach((c) => {
      const commentEl = document.createElement("p");
      commentEl.className = "comment-item";
      commentEl.textContent = c;
      list.appendChild(commentEl);
    });
  });
}

function restoreAllLikes() {
  document.querySelectorAll(".short-card").forEach((card) => {
    const videoId = card.getAttribute("data-video");
    const countSpan = card.querySelector(".like-count");
    const savedLikes = loadLikes(videoId);
    countSpan.textContent = savedLikes;
  });
}

/* ===== Copy Link ===== */
function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert("Link copied: " + url);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchShorts();
  setupInfiniteScroll();
});
