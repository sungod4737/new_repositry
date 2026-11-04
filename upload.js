"use strict";

// ========================================
// HOMETUBE - UPLOAD.JS
// Uses the existing database in index.js
// ========================================

let selectedVideoFile = null;
let selectedThumbnailFile = null;
let videoPreviewURL = null;
let thumbnailPreviewURL = null;

const uploadForm = document.getElementById("uploadForm");
const videoFileInput = document.getElementById("videoFile");
const videoFileLabel = document.getElementById("videoFileLabel");
const videoPreview = document.getElementById("videoPreview");
const videoPreviewContainer = document.getElementById("videoPreviewContainer");
const removeVideoButton = document.getElementById("removeVideoButton");

const thumbnailFileInput = document.getElementById("thumbnailFile");
const thumbnailPreview = document.getElementById("thumbnailPreview");
const thumbnailPlaceholder = document.getElementById("thumbnailPlaceholder");
const removeThumbnailButton = document.getElementById("removeThumbnailButton");

const uploadMessage = document.getElementById("uploadMessage");
const publishButton = document.getElementById("publishButton");

// ========================================
// 1. MESSAGES
// ========================================

function showUploadMessage(message, type) {
    uploadMessage.textContent = message;
    uploadMessage.className = "upload-message show " + type;
}

function clearUploadMessage() {
    uploadMessage.textContent = "";
    uploadMessage.className = "upload-message";
}

function releasePreviewURL(url) {
    if (url) {
        URL.revokeObjectURL(url);
    }
}

// ========================================
// 2. SELECT A VIDEO
// ========================================

videoFileInput.addEventListener("change", function() {
    clearUploadMessage();

    const file = videoFileInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("video/")) {
        showUploadMessage("Please select a valid video file.", "error");
        videoFileInput.value = "";
        return;
    }

    releasePreviewURL(videoPreviewURL);

    selectedVideoFile = file;
    videoPreviewURL = URL.createObjectURL(file);

    videoPreview.src = videoPreviewURL;
    videoPreview.load();

    videoFileLabel.textContent = file.name;
    videoPreviewContainer.hidden = false;

    showUploadMessage("Video selected successfully.", "success");
});

// ========================================
// 3. REMOVE A VIDEO
// ========================================

removeVideoButton.addEventListener("click", function() {
    selectedVideoFile = null;

    releasePreviewURL(videoPreviewURL);
    videoPreviewURL = null;

    videoPreview.pause();
    videoPreview.removeAttribute("src");
    videoPreview.load();

    videoFileInput.value = "";
    videoFileLabel.textContent = "Choose a video file";
    videoPreviewContainer.hidden = true;

    clearUploadMessage();
});

// ========================================
// 4. SELECT A THUMBNAIL
// ========================================

thumbnailFileInput.addEventListener("change", function() {
    clearUploadMessage();

    const file = thumbnailFileInput.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        showUploadMessage(
            "Please select a JPG, PNG, or WebP thumbnail.",
            "error"
        );

        thumbnailFileInput.value = "";
        return;
    }

    releasePreviewURL(thumbnailPreviewURL);

    selectedThumbnailFile = file;
    thumbnailPreviewURL = URL.createObjectURL(file);

    thumbnailPreview.src = thumbnailPreviewURL;
    thumbnailPreview.hidden = false;
    thumbnailPlaceholder.hidden = true;
    removeThumbnailButton.hidden = false;
});

// ========================================
// 5. REMOVE A THUMBNAIL
// ========================================

removeThumbnailButton.addEventListener("click", function() {
    selectedThumbnailFile = null;

    releasePreviewURL(thumbnailPreviewURL);
    thumbnailPreviewURL = null;

    thumbnailPreview.removeAttribute("src");
    thumbnailPreview.hidden = true;

    thumbnailPlaceholder.hidden = false;
    thumbnailFileInput.value = "";
    removeThumbnailButton.hidden = true;
});

// ========================================
// 6. GENERATE A UNIQUE ID
// ========================================

function createUploadId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return "upload-" + window.crypto.randomUUID();
    }

    return "upload-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 10);
}

// ========================================
// 7. PUBLISH VIDEO
// ========================================

uploadForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    clearUploadMessage();

    if (!selectedVideoFile) {
        showUploadMessage("Please select a video first.", "error");
        return;
    }

    const title = document.getElementById("videoTitle").value.trim();
    const description =
        document.getElementById("videoDescription").value.trim();
    const category = document.getElementById("videoCategory").value;

    if (!title) {
        showUploadMessage("Please enter a video title.", "error");
        return;
    }

    if (!category) {
        showUploadMessage("Please select a category.", "error");
        return;
    }

    if (typeof window.saveUploadedVideo !== "function") {
        showUploadMessage(
            "The HomeTube save function was not found. Check that index.js loads before upload.js.",
            "error"
        );
        return;
    }

    publishButton.disabled = true;
    publishButton.innerHTML =
        '<i class="bi bi-hourglass-split"></i> Publishing...';

    try {
        // Use the exact data format expected by index.js.
        const videoData = {
            id: createUploadId(),
            title: title,
            description: description,
            category: category,
            channel: "My Channel",
            views: "0 views",
            age: "Just uploaded",
            duration: "",
            videoBlob: selectedVideoFile,
            thumbnailBlob: selectedThumbnailFile || null,
            createdAt: new Date().toISOString()
        };

        // Get the video duration from the preview.
        if (
            Number.isFinite(videoPreview.duration) &&
            videoPreview.duration > 0
        ) {
            const totalSeconds = Math.floor(videoPreview.duration);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            videoData.duration =
                minutes + ":" + String(seconds).padStart(2, "0");
        }

        // Call the save function already defined in index.js.
        await window.saveUploadedVideo(videoData);

        showUploadMessage(
            "Your video has been published! Returning to HomeTube...",
            "success"
        );

        // Release temporary preview URLs.
        releasePreviewURL(videoPreviewURL);
        releasePreviewURL(thumbnailPreviewURL);

        videoPreviewURL = null;
        thumbnailPreviewURL = null;

        window.setTimeout(function() {
            window.location.href = "index.html";
        }, 1200);

    } catch (error) {
        console.error("HomeTube upload error:", error);

        showUploadMessage(
            "The video could not be saved. Check your browser console for details.",
            "error"
        );

        publishButton.disabled = false;
        publishButton.innerHTML =
            '<i class="bi bi-cloud-arrow-up-fill"></i> Publish video';
    }
});

// ========================================
// 8. SEARCH FORM
// ========================================

const uploadSearchForm = document.getElementById("searchForm");
const uploadSearchInput = document.getElementById("searchInput");

if (uploadSearchForm && uploadSearchInput) {
    uploadSearchForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const query = uploadSearchInput.value.trim();

        if (query) {
            window.location.href =
                "index.html?search=" + encodeURIComponent(query);
        }
    });
}

// ========================================
// 9. CLEAN UP PREVIEWS
// ========================================

window.addEventListener("pagehide", function() {
    releasePreviewURL(videoPreviewURL);
    releasePreviewURL(thumbnailPreviewURL);
});