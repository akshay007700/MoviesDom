/* =====================================================
   MoviesDom Home Page Script
   FIXED VERSION – REAL DATA, NO DUMMY POSTERS
   ===================================================== */

import { MovieAPI } from "./api.js";
import { BACKEND_BASE_URL } from "./config.js";

/* ---------------- CONFIG ---------------- */

const IMAGE_BASE = "https://image.tmdb.org/t/p";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/* ---------------- UTILS ---------------- */

function getCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.time > CACHE_TIME) return null;
        return parsed.data;
    } catch {
        return null;
    }
}

function setCache(key, data) {
    localStorage.setItem(key, JSON.stringify({
        time: Date.now(),
        data
    }));
}

/* ---------------- HOME CLASS ---------------- */

class HomePage {
    constructor() {
        this.api = new MovieAPI(BACKEND_BASE_URL);

        this.posterStrip = document.querySelector("#heroPosterStrip");
        this.trendingRow = document.querySelector("#trendingRow");
        this.popularRow = document.querySelector("#popularRow");
        this.nowPlayingRow = document.querySelector("#nowPlayingRow");
        this.upcomingRow = document.querySelector("#upcomingRow");
    }

    async init() {
        console.log("🏠 MoviesDom Home initializing...");

        await Promise.all([
            this.loadHeroStrip(),
            this.loadTrending(),
            this.loadPopular(),
            this.loadNowPlaying(),
            this.loadUpcoming()
        ]);

        this.initThemeToggle();
    }

    /* ---------------- HERO STRIP ---------------- */

    async loadHeroStrip() {
        const cache = getCache("hero_strip");
        if (cache) {
            this.renderHeroStrip(cache);
            return;
        }

        try {
            const data = await this.api.getPopularMovies();
            setCache("hero_strip", data.results);
            this.renderHeroStrip(data.results);
        } catch (e) {
            console.error("Hero strip failed", e);
        }
    }

    renderHeroStrip(movies) {
        if (!this.posterStrip) return;

        const valid = movies.filter(m => m.poster_path);
        const doubled = [...valid, ...valid];

        this.posterStrip.innerHTML = doubled.map(m => `
            <div class="hero-poster" data-id="${m.id}">
                <img 
                  src="${IMAGE_BASE}/w342${m.poster_path}" 
                  alt="${m.title}" 
                  loading="lazy"
                />
            </div>
        `).join("");

        this.posterStrip.querySelectorAll(".hero-poster").forEach(card => {
            card.onclick = () => {
                location.href = `movie-details.html?id=${card.dataset.id}`;
            };
        });
    }

    /* ---------------- SECTIONS ---------------- */

    async loadTrending() {
        const cache = getCache("trending_movies");
        if (cache) {
            this.renderRow(cache, this.trendingRow);
            return;
        }

        try {
            const data = await this.api.getTrendingMovies();
            setCache("trending_movies", data.results);
            this.renderRow(data.results, this.trendingRow);
        } catch (e) {
            console.error("Trending failed", e);
        }
    }

    async loadPopular() {
        const cache = getCache("popular_movies");
        if (cache) {
            this.renderRow(cache, this.popularRow);
            return;
        }

        try {
            const data = await this.api.getPopularMovies();
            setCache("popular_movies", data.results);
            this.renderRow(data.results, this.popularRow);
        } catch (e) {
            console.error("Popular failed", e);
        }
    }

    async loadNowPlaying() {
        const cache = getCache("now_playing");
        if (cache) {
            this.renderRow(cache, this.nowPlayingRow);
            return;
        }

        try {
            const data = await this.api.getNowPlayingMovies();
            setCache("now_playing", data.results);
            this.renderRow(data.results, this.nowPlayingRow);
        } catch (e) {
            console.error("Now playing failed", e);
        }
    }

    async loadUpcoming() {
        const cache = getCache("upcoming_movies");
        if (cache) {
            this.renderRow(cache, this.upcomingRow);
            return;
        }

        try {
            const data = await this.api.getUpcomingMovies();
            setCache("upcoming_movies", data.results);
            this.renderRow(data.results, this.upcomingRow);
        } catch (e) {
            console.error("Upcoming failed", e);
        }
    }

    /* ---------------- RENDER ROW ---------------- */

    renderRow(movies, container) {
        if (!container) return;

        const valid = movies.filter(m => m.poster_path);

        container.innerHTML = valid.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <img 
                  src="${IMAGE_BASE}/w342${movie.poster_path}" 
                  alt="${movie.title}" 
                  loading="lazy"
                />
                <div class="movie-meta">
                    <h4>${movie.title}</h4>
                    <span>${movie.release_date?.slice(0,4) || ""}</span>
                    <span>⭐ ${movie.vote_average?.toFixed(1)}</span>
                </div>
            </div>
        `).join("");

        container.querySelectorAll(".movie-card").forEach(card => {
            card.onclick = () => {
                location.href = `movie-details.html?id=${card.dataset.id}`;
            };
        });
    }

    /* ---------------- THEME TOGGLE ---------------- */

    initThemeToggle() {
        const toggle = document.querySelector("#themeToggle");
        if (!toggle) return;

        const saved = localStorage.getItem("theme");
        if (saved) document.documentElement.setAttribute("data-theme", saved);

        toggle.onclick = () => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
        };
    }
}

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    const home = new HomePage();
    home.init();
});
