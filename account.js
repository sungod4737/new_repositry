"use strict";

const CURRENT_USER_KEY = "hometube_current_user";

function getCurrentUser() {
    try {
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        return null;
    }
}

function loadAccount() {
    const user = getCurrentUser();

    if (!user || !user.email) {
        window.location.replace("signin.html");
        return;
    }

    document.getElementById("accountName").textContent =
        user.fullName || "Not provided";

    document.getElementById("accountEmail").textContent =
        user.email || "Not provided";

    document.getElementById("accountUsername").textContent =
        user.username || "Not provided";
}

document.getElementById("signOutBtn").addEventListener("click", function() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.replace("index.html");
});

loadAccount();