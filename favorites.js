/* ========================================
   HOMETUBE - FAVORITES PAGE
   File: favorites.js
======================================== */

"use strict";

const FAVORITES_KEY = "hometube_favourites";

// Get saved favorite video IDs
function getFavoriteIds() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        const favorites = saved ? JSON.parse(saved) : [];

        return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
        console.error("Could not load favorites:", error);
        return [];
    }
}

// Get the favorites grid
function getFavoritesContainer() {
    return document.getElementById("favoritesGrid");
}

// Display the favorite videos
function renderFavouriteVideos() {
    const container = getFavoritesContainer();

    if (!container) {
        return;
    }

    const allVideos = window.hometubeVideos || [];
    const favoriteIds = getFavoriteIds();

    const favoriteVideos = allVideos.filter(function(video) {
        return favoriteIds.some(function(id) {
            return String(id) === String(video.id);
        });
    });

    container.innerHTML = "";

    const countElement = document.getElementById("favoritesCount");
    const emptyState = document.getElementById("favoritesEmptyState");

    // Update the favorites count
    if (countElement) {
        countElement.textContent =
            favoriteVideos.length +
            (favoriteVideos.length === 1 ? " favorite" : " favorites");
    }

    // Show the existing empty-state design
    if (emptyState) {
        emptyState.classList.toggle(
            "d-none",
            favoriteVideos.length > 0
        );
    }

    if (favoriteVideos.length === 0) {
        return;
    }

    // Display the existing HomeTube video cards
    favoriteVideos.forEach(function(video) {
        if (typeof window.createVideoCard === "function") {
            container.appendChild(window.createVideoCard(video));
        }
    });
}

// Keep the expected function name for index.js
window.renderFavouriteVideos = renderFavouriteVideos;
window.renderFavorites = renderFavouriteVideos;

// Listen for favorite changes from another tab
window.addEventListener("storage", function(event) {
    if (event.key === FAVORITES_KEY) {
        renderFavouriteVideos();
    }
});

// Handle buttons on favorite video cards
document.addEventListener("click", function(event) {
    const button = event.target.closest(
        "#favoritesGrid [data-action]"
    );

    if (!button) {
        return;
    }

    const card = button.closest("[data-video-id]");

    if (!card) {
        return;
    }

    const videoId = card.dataset.videoId;
    const action = button.dataset.action;

    // Remove a video from favorites
    if (action === "favourite") {
        event.preventDefault();

        const favorites = getFavoriteIds();
        const updatedFavorites = favorites.filter(function(id) {
            return String(id) !== String(videoId);
        });

        localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify(updatedFavorites)
        );

        renderFavouriteVideos();

        // Refresh the homepage if its renderer is available
        if (typeof window.renderVideos === "function") {
            window.renderVideos();
        }
    }
});

// Wait for index.js to load the video library
function waitForVideos() {
    if (Array.isArray(window.hometubeVideos)) {
        renderFavouriteVideos();
        return;
    }

    setTimeout(waitForVideos, 100);
}

// Start the favorites page
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForVideos);
} else {
    waitForVideos();
}

// Refresh favorites when the page becomes visible again
document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
        renderFavouriteVideos();
    }
});