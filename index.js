/* ========================================
   HOMETUBE - MAIN JAVASCRIPT
   File: index.js
======================================== */

"use strict";

/* ========================================
   1. STORAGE KEYS AND VARIABLES
======================================== */

const FAVOURITES_KEY = "hometube_favourites";
const HISTORY_KEY = "hometube_history";
const DB_NAME = "hometubeDB";
const DB_VERSION = 1;
const VIDEO_STORE = "videos";

let videos = [];
let activeCategory = "All";
let searchTerm = "";
let databasePromise = null;
let uploadedVideoUrls = [];

/* ========================================
   2. SAMPLE VIDEOS
======================================== */

const sampleVideos = [{
        id: "sample-1",
        title: "Relaxing Nature and Forest Views",
        channel: "Nature World",
        category: "Lifestyle",
        views: "12K views",
        age: "2 days ago",
        duration: "2:45",
        description: "Relax and enjoy beautiful natural scenery.",
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-2",
        title: "Beautiful Mountain Landscapes",
        channel: "Travel Explorer",
        category: "Travel",
        views: "8.4K views",
        age: "4 days ago",
        duration: "3:12",
        description: "Discover amazing mountain scenery.",
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-3",
        title: "Learning Technology Basics",
        channel: "Tech Academy",
        category: "Technology",
        views: "5.2K views",
        age: "1 week ago",
        duration: "5:30",
        description: "Explore useful technology concepts.",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-4",
        title: "Gaming Highlights",
        channel: "Pixel Player",
        category: "Gaming",
        views: "24K views",
        age: "3 days ago",
        duration: "4:18",
        description: "Enjoy exciting gaming highlights.",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-5",
        title: "Study Music for Concentration",
        channel: "Calm Sounds",
        category: "Music",
        views: "31K views",
        age: "5 days ago",
        duration: "6:00",
        description: "Background music for studying and relaxing.",
        thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-6",
        title: "Discover the Wonders of Space",
        channel: "Science Hub",
        category: "Science",
        views: "18K views",
        age: "6 days ago",
        duration: "4:45",
        description: "Learn about space and the universe.",
        thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-7",
        title: "Easy Learning Tips",
        channel: "Study Smart",
        category: "Education",
        views: "7.6K views",
        age: "1 day ago",
        duration: "3:40",
        description: "Simple ideas to help you study.",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-8",
        title: "Football Skills and Training",
        channel: "Sports Central",
        category: "Sports",
        views: "15K views",
        age: "2 weeks ago",
        duration: "5:10",
        description: "Explore football skills and practice ideas.",
        thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-9",
        title: "Creative Art and Design",
        channel: "Creative Studio",
        category: "Entertainment",
        views: "9.1K views",
        age: "8 days ago",
        duration: "4:25",
        description: "Get inspired by creative art and design.",
        thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    },
    {
        id: "sample-10",
        title: "Amazing City Travel Guide",
        channel: "World Traveler",
        category: "Travel",
        views: "11K views",
        age: "9 days ago",
        duration: "3:55",
        description: "Explore beautiful cities around the world.",
        thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=640&h=360&fit=crop",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    }
];

/* ========================================
   3. LOCAL STORAGE HELPERS
======================================== */

function readStorage(key, fallback = []) {
    try {
        const saved = localStorage.getItem(key);

        if (!saved) {
            return fallback;
        }

        const parsed = JSON.parse(saved);

        return parsed === null ? fallback : parsed;
    } catch (error) {
        console.error("Could not read storage:", key, error);
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Could not save storage:", key, error);
        return false;
    }
}

/* ========================================
   4. INDEXEDDB - UPLOADED VIDEOS
======================================== */

function openDatabase() {
    if (databasePromise) {
        return databasePromise;
    }

    databasePromise = new Promise(function(resolve, reject) {
        if (!window.indexedDB) {
            reject(new Error("IndexedDB is not supported."));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(VIDEO_STORE)) {
                db.createObjectStore(VIDEO_STORE, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function() {
            resolve(request.result);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });

    return databasePromise;
}

async function getUploadedVideos() {
    const db = await openDatabase();

    return new Promise(function(resolve, reject) {
        const transaction = db.transaction(VIDEO_STORE, "readonly");
        const store = transaction.objectStore(VIDEO_STORE);
        const request = store.getAll();

        request.onsuccess = function() {
            resolve(request.result || []);
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}

async function saveUploadedVideo(video) {
    const db = await openDatabase();

    return new Promise(function(resolve, reject) {
        const transaction = db.transaction(VIDEO_STORE, "readwrite");
        const store = transaction.objectStore(VIDEO_STORE);

        store.put(video);

        transaction.oncomplete = function() {
            resolve(true);
        };

        transaction.onerror = function() {
            reject(transaction.error);
        };

        transaction.onabort = function() {
            reject(transaction.error || new Error("Upload save cancelled."));
        };
    });
}

async function deleteUploadedVideo(id) {
    const db = await openDatabase();

    return new Promise(function(resolve, reject) {
        const transaction = db.transaction(VIDEO_STORE, "readwrite");
        transaction.objectStore(VIDEO_STORE).delete(id);

        transaction.oncomplete = function() {
            resolve(true);
        };

        transaction.onerror = function() {
            reject(transaction.error);
        };
    });
}

/* ========================================
   5. LOAD THE COMPLETE VIDEO LIBRARY
======================================== */

function releaseUploadedVideoUrls() {
    uploadedVideoUrls.forEach(function(url) {
        URL.revokeObjectURL(url);
    });

    uploadedVideoUrls = [];
}

async function loadVideoLibrary() {
    let uploadedVideos = [];

    try {
        uploadedVideos = await getUploadedVideos();
    } catch (error) {
        console.error("Could not load uploaded videos:", error);
    }

    releaseUploadedVideoUrls();

    const preparedUploads = uploadedVideos.map(function(item) {
        const video = {...item };

        if (video.videoBlob instanceof Blob) {
            video.videoUrl = URL.createObjectURL(video.videoBlob);
            uploadedVideoUrls.push(video.videoUrl);
        }

        if (video.thumbnailBlob instanceof Blob) {
            video.thumbnail = URL.createObjectURL(video.thumbnailBlob);
            uploadedVideoUrls.push(video.thumbnail);
        }

        return video;
    });

    videos = [...sampleVideos, ...preparedUploads];

    // Make the full library available to history.js and other pages.
    window.hometubeVideos = videos;

    renderCategories();
    renderVideos();

    // Refresh any other page section that uses favorites.
    if (typeof window.renderFavorites === "function") {
        window.renderFavorites();
    }

    return videos;
}

/* ========================================
   6. HTML SAFETY
======================================== */




function escapeHTML(value) {
    var element = document.createElement("span");

    if (value === null || value === undefined) {
        value = "";
    }

    element.textContent = String(value);
    return element.innerHTML;
}



/* ========================================
   7. FAVORITES
======================================== */

function getFavouriteIds() {
    const saved = readStorage(FAVOURITES_KEY, []);

    if (!Array.isArray(saved)) {
        return [];
    }

    return saved.map(function(item) {
        if (item && typeof item === "object") {
            return String(item.id);
        }

        return String(item);
    });
}

function getFavourites() {
    const ids = getFavouriteIds();

    return videos.filter(function(video) {
        return ids.includes(String(video.id));
    });
}

function isFavourite(videoId) {
    return getFavouriteIds().includes(String(videoId));
}

function toggleFavourite(videoId) {
    const ids = getFavouriteIds();
    const id = String(videoId);
    let updated;

    if (ids.includes(id)) {
        updated = ids.filter(function(item) {
            return item !== id;
        });
    } else {
        updated = [...ids, id];
    }

    if (!writeStorage(FAVOURITES_KEY, updated)) {
        return;
    }

    renderVideos();

    if (typeof window.renderFavorites === "function") {
        window.renderFavorites();
    }

    if (typeof window.renderWatchHistory === "function") {
        window.renderWatchHistory();
    }
}

/* ========================================
   8. WATCH HISTORY
======================================== */

function saveToHistory(video) {
    if (!video || video.id === undefined || video.id === null) {
        return;
    }

    const history = readStorage(HISTORY_KEY, []);

    if (!Array.isArray(history)) {
        return;
    }

    const id = String(video.id);

    const updatedHistory = history.filter(function(item) {
        const itemId = item && typeof item === "object" ?
            item.id :
            item;

        return String(itemId) !== id;
    });

    updatedHistory.unshift({
        id: video.id,
        title: video.title || "Untitled video",
        channel: video.channel || "Hometube Creator",
        thumbnail: video.thumbnail || "",
        category: video.category || "Other",
        duration: video.duration || "",
        watchedAt: new Date().toISOString()
    });

    writeStorage(HISTORY_KEY, updatedHistory.slice(0, 100));
}

/* ========================================
   9. VIDEO CARD CREATION
======================================== */

function createVideoCard(video) {
    const card = document.createElement("article");

    card.className = "video-card";
    card.dataset.videoId = String(video.id);

    const favourite = isFavourite(video.id);
    const thumbnail = video.thumbnail || "";

    card.innerHTML = `
        <div class="video-thumbnail">
            <img
                src="${escapeHTML(thumbnail)}"
                alt="${escapeHTML(video.title || "Video thumbnail")}"
                loading="lazy"
                onerror="this.style.display='none'"
            >

            ${
                video.duration
                    ? `<span class="video-duration">${escapeHTML(video.duration)}</span>`
                    : ""
            }

            <button
                class="play-overlay"
                type="button"
                data-action="play"
                aria-label="Play ${escapeHTML(video.title || "video")}"
                title="Play video"
            >
                <i class="bi bi-play-fill"></i>
            </button>
        </div>

        <div class="video-card-body">
            <div class="video-card-info">
                <h3 class="video-title">
                    ${escapeHTML(video.title || "Untitled video")}
                </h3>

                <p class="video-channel">
                    ${escapeHTML(video.channel || "Hometube Creator")}
                </p>

                <p class="video-meta">
                    ${escapeHTML(video.views || "New video")}
                    <span>•</span>
                    ${escapeHTML(video.age || "Recently uploaded")}
                </p>

                <p class="video-category">
                    ${escapeHTML(video.category || "Other")}
                </p>
            </div>

            <div class="video-card-actions">
                <button
                    class="favorite-btn ${favourite ? "active" : ""}"
                    type="button"
                    data-action="favourite"
                    aria-label="${favourite ? "Remove from" : "Add to"} favorites"
                    aria-pressed="${favourite}"
                    title="${favourite ? "Remove from favorites" : "Add to favorites"}"
                >
                    <i class="bi ${favourite ? "bi-heart-fill text-danger" : "bi-heart"}"></i>
                </button>

                <button
                    class="watch-btn btn btn-outline-dark"
                    type="button"
                    data-action="play"
                    title="Watch video"
                >
                    <i class="bi bi-play-circle"></i>
                    Watch
                </button>
            </div>
        </div>
    `;

    return card;
}

/* ========================================
   10. RENDER VIDEOS
======================================== */

function renderVideos() {
    const grid = document.getElementById("videoGrid");

    if (!grid) {
        return;
    }

    let filteredVideos = videos.slice();

    if (activeCategory !== "All") {
        filteredVideos = filteredVideos.filter(function(video) {
            return String(video.category).toLowerCase() ===
                activeCategory.toLowerCase();
        });
    }

    if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();

        filteredVideos = filteredVideos.filter(function(video) {
            return [
                video.title,
                video.channel,
                video.category,
                video.description
            ].some(function(value) {
                return String(value || "").toLowerCase().includes(term);
            });
        });
    }

    grid.innerHTML = "";

    filteredVideos.forEach(function(video) {
        grid.appendChild(createVideoCard(video));
    });

    const count = document.getElementById("videoCount");

    if (count) {
        count.textContent =
            filteredVideos.length +
            (filteredVideos.length === 1 ? " video" : " videos");
    }

    const emptyState = document.getElementById("emptyState");

    if (emptyState) {
        emptyState.style.display =
            filteredVideos.length === 0 ? "block" : "none";
    }
}

/* ========================================
   11. CATEGORY BUTTONS
======================================== */

function renderCategories() {
    const categoryContainer =
        document.getElementById("categoryButtons") ||
        document.getElementById("categoryFilters") ||
        document.querySelector(".category-list") ||
        document.querySelector(".category-buttons");

    // Keep any category buttons already present in the HTML.
    if (!categoryContainer) {
        setupExistingCategoryButtons();
        return;
    }

    const categories = [
        "All",
        "Music",
        "Gaming",
        "Education",
        "Technology",
        "Entertainment",
        "Sports",
        "Lifestyle",
        "Science",
        "Travel"
    ];

    categoryContainer.innerHTML = "";

    categories.forEach(function(category) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "category-btn btn btn-success";
        button.textContent = category;
        button.dataset.category = category;

        if (category === activeCategory) {
            button.classList.add("active");
        }

        button.addEventListener("click", function() {
            activeCategory = category;

            categoryContainer
                .querySelectorAll(".category-btn")
                .forEach(function(item) {
                    item.classList.toggle(
                        "active",
                        item.dataset.category === category
                    );
                });

            renderVideos();
        });

        categoryContainer.appendChild(button);
    });
}

function setupExistingCategoryButtons() {
    document.querySelectorAll(
        ".category-btn, [data-category]"
    ).forEach(function(button) {
        if (button.dataset.categoryBound === "true") {
            return;
        }

        button.dataset.categoryBound = "true";

        button.addEventListener("click", function() {
            activeCategory = button.dataset.category ||
                button.textContent.trim();

            document.querySelectorAll(
                ".category-btn, [data-category]"
            ).forEach(function(item) {
                item.classList.toggle(
                    "active",
                    (item.dataset.category || item.textContent.trim()) ===
                    activeCategory
                );
            });

            renderVideos();
        });
    });
}

/* ========================================
   12. VIDEO PLAYER
======================================== */

function playVideo(video) {
    if (!video) {
        return;
    }

    let modalElement = document.getElementById("hometubePlayerModal");

    if (!modalElement) {
        modalElement = document.createElement("div");

        modalElement.id = "hometubePlayerModal";
        modalElement.className = "modal fade";
        modalElement.tabIndex = -1;
        modalElement.setAttribute("aria-hidden", "true");

        modalElement.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>

                    <div class="modal-body">
                        <video
                            id="hometubePlayer"
                            controls
                            playsinline
                            style="width:100%;max-height:70vh;background:#000;"
                        ></video>

                        <p id="hometubePlayerDescription"></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalElement);
    }

    const player = modalElement.querySelector("#hometubePlayer");
    const title = modalElement.querySelector(".modal-title");
    const description = modalElement.querySelector(
        "#hometubePlayerDescription"
    );

    title.textContent = video.title || "Untitled video";
    description.textContent = video.description || "";

    if (!video.videoUrl) {
        alert(
            "This video has no playable video file. " +
            "If it was uploaded, try refreshing the page."
        );
        return;
    }

    player.pause();
    player.src = video.videoUrl;
    player.load();

    // Record the video when the user opens it.
    saveToHistory(video);

    if (typeof bootstrap !== "undefined") {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

        modalElement.addEventListener("hidden.bs.modal", function() {
            player.pause();
            player.removeAttribute("src");
            player.load();
        }, { once: true });

        modal.show();

        player.play().catch(function(error) {
            console.log("Press Play to start the video.", error);
        });
    } else {
        modalElement.style.display = "block";
        modalElement.classList.add("show");
        modalElement.style.position = "fixed";
        modalElement.style.inset = "5%";
        modalElement.style.zIndex = "9999";
        modalElement.style.overflow = "auto";
        modalElement.style.background = "#fff";
        modalElement.style.padding = "16px";

        player.play().catch(function() {});
    }
}

/* ========================================
   13. VIDEO CARD BUTTONS
======================================== */

function setupVideoCardActions() {
    document.addEventListener("click", function(event) {
        const button = event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const card = button.closest("[data-video-id]");

        if (!card) {
            return;
        }

        const videoId = card.dataset.videoId;
        const action = button.dataset.action;

        if (action === "play") {
            const video = videos.find(function(item) {
                return String(item.id) === String(videoId);
            });

            if (video) {
                playVideo(video);
            }
        }

        if (action === "favourite") {
            toggleFavourite(videoId);
        }
    });
}

/* ========================================
   14. SEARCH
======================================== */

function setupSearch() {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            searchTerm = searchInput.value;
            renderVideos();
        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function(event) {
            event.preventDefault();

            if (searchInput) {
                searchTerm = searchInput.value;
            }

            renderVideos();
        });
    }
}

/* ========================================
   15. SIDEBAR AND MOBILE MENU
======================================== */

function setupSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function() {
            sidebar.classList.toggle("active");
            sidebar.classList.toggle("show");
        });
    }

    document.addEventListener("click", function(event) {
        if (!sidebar || !menuToggle) {
            return;
        }

        if (
            window.innerWidth <= 768 &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            sidebar.classList.remove("active");
            sidebar.classList.remove("show");
        }
    });
}

/* ========================================
   16. PAGE YEAR
======================================== */

function setupCurrentYear() {
    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }
}

/* ========================================
   17. EXPOSE FUNCTIONS TO OTHER PAGES
======================================== */

window.hometubeVideos = videos;
window.loadHometubeVideoLibrary = loadVideoLibrary;
window.saveUploadedVideo = saveUploadedVideo;
window.deleteUploadedVideo = deleteUploadedVideo;
window.getHometubeFavourites = getFavourites;
window.toggleHometubeFavourite = toggleFavourite;
window.createVideoCard = createVideoCard;
window.playHometubeVideo = playVideo;
window.saveHometubeHistory = saveToHistory;
window.renderHometubeVideos = renderVideos;

/* ========================================
   18. START HOMETUBE
======================================== */

async function startHometube() {
    setupSearch();
    setupSidebar();
    setupVideoCardActions();
    setupCurrentYear();

    setupExistingCategoryButtons();

    await loadVideoLibrary();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startHometube);
} else {
    startHometube();
}