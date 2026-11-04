/* ========================================
   HOMETUBE - HISTORY PAGE
   File: history.js
======================================== */

"use strict";

const HOMETUBE_HISTORY_KEY = "hometube_history";

// Read saved watch history
function getWatchHistory() {
    try {
        const saved = localStorage.getItem(HOMETUBE_HISTORY_KEY);
        const history = saved ? JSON.parse(saved) : [];
        return Array.isArray(history) ? history : [];
    } catch (error) {
        console.error("Could not load watch history:", error);
        return [];
    }
}

// Save watch history
function saveWatchHistory(history) {
    try {
        localStorage.setItem(
            HOMETUBE_HISTORY_KEY,
            JSON.stringify(history)
        );
        return true;
    } catch (error) {
        console.error("Could not save watch history:", error);
        return false;
    }
}

// Get the video library from index.js
function getHistoryVideoLibrary() {
    return Array.isArray(window.hometubeVideos) ?
        window.hometubeVideos :
        [];
}

// Render watched videos
function renderWatchHistory() {
    const grid = document.getElementById("historyGrid");
    if (!grid) return;

    const history = getWatchHistory();
    const videos = getHistoryVideoLibrary();

    const watchedVideos = history.map(function(entry) {
        const id = entry && typeof entry === "object" ?
            entry.id :
            entry;

        // Find the complete video in the library
        const video = videos.find(function(item) {
            return String(item.id) === String(id);
        });

        // Fall back to saved history details
        if (!video && entry && typeof entry === "object") {
            return {
                ...entry,
                title: entry.title || "Untitled video",
                channel: entry.channel || "Hometube Creator",
                thumbnail: entry.thumbnail || "",
                category: entry.category || "Other",
                videoUrl: ""
            };
        }

        return video || null;
    }).filter(Boolean);

    grid.innerHTML = "";

    const count = document.getElementById("historyCount");
    if (count) {
        count.textContent = watchedVideos.length +
            (watchedVideos.length === 1 ? " video" : " videos");
    }

    const emptyState = document.getElementById("historyEmptyState");
    if (emptyState) {
        emptyState.style.display =
            watchedVideos.length === 0 ? "block" : "none";
    }

    watchedVideos.forEach(function(video) {
        if (typeof window.createVideoCard === "function") {
            grid.appendChild(window.createVideoCard(video));
        } else {
            console.error("createVideoCard() is unavailable.");
        }
    });
}

// Clear all history
function clearWatchHistory() {
    if (saveWatchHistory([])) {
        renderWatchHistory();
    }
}

// Set up clear-history controls
function setupClearHistory() {
    const clearButton = document.getElementById("clearHistoryBtn");
    const confirmButton = document.getElementById(
        "confirmClearHistoryBtn"
    );
    const modalElement = document.getElementById("clearHistoryModal");

    if (clearButton) {
        clearButton.addEventListener("click", function() {
            if (modalElement && typeof bootstrap !== "undefined") {
                bootstrap.Modal
                    .getOrCreateInstance(modalElement)
                    .show();
            } else if (window.confirm("Clear your entire watch history?")) {
                clearWatchHistory();
            }
        });
    }

    if (confirmButton) {
        confirmButton.addEventListener("click", function() {
            clearWatchHistory();

            if (modalElement && typeof bootstrap !== "undefined") {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
        });
    }
}

// Handle play and favorite buttons
function setupHistoryCardActions() {
    const grid = document.getElementById("historyGrid");
    if (!grid) return;

    grid.addEventListener("click", function(event) {
        const button = event.target.closest("[data-action]");
        if (!button || !grid.contains(button)) return;

        const card = button.closest("[data-video-id]");
        if (!card) return;

        const videoId = card.dataset.videoId;
        const action = button.dataset.action;

        if (action === "play") {
            const video = getHistoryVideoLibrary().find(function(item) {
                return String(item.id) === String(videoId);
            });

            if (video && typeof window.playHometubeVideo === "function") {
                window.playHometubeVideo(video);
            } else {
                console.warn("Video player or video is unavailable.");
            }
        }

        if (action === "favourite") {
            if (typeof window.toggleHometubeFavourite === "function") {
                window.toggleHometubeFavourite(videoId);
            } else {
                console.warn("Favorite function is unavailable.");
            }
        }
    });
}

// Wait for index.js to load the video library
function waitForHistoryVideos() {
    if (Array.isArray(window.hometubeVideos)) {
        renderWatchHistory();
        return;
    }

    window.setTimeout(waitForHistoryVideos, 200);
}

// Initialize History page
function startHistoryPage() {
    setupClearHistory();
    setupHistoryCardActions();

    const year = document.getElementById("currentYear");
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    waitForHistoryVideos();
}

// Refresh when history changes in another tab
window.addEventListener("storage", function(event) {
    if (event.key === HOMETUBE_HISTORY_KEY) {
        renderWatchHistory();
    }
});

// Expose functions for other scripts
window.renderWatchHistory = renderWatchHistory;
window.saveHometubeHistory = saveWatchHistory;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startHistoryPage);
} else {
    startHistoryPage();
}