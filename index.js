"use strict";

const USERS_KEY = "hometube_users";
const CURRENT_USER_KEY = "hometube_current_user";

const createAccountForm =
    document.getElementById("createAccountForm");

const formMessage = document.getElementById("formMessage");

// function getUsers() {
//     try {
//         const savedUsers = localStorage.getItem(USERS_KEY);
//         const users = savedUsers ? JSON.parse(savedUsers) : [];

//         return Array.isArray(users) ? users : [];
//     } catch (error) {
//         return [];
//     }
// }

function showMessage(message, success = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("success", success);
}

createAccountForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName =
        document.getElementById("fullName").value.trim();

    const username =
        document.getElementById("username").value.trim();

    const email =
        document.getElementById("email").value.trim().toLowerCase();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (username.length < 3) {
        showMessage("Your username must have at least 3 characters.");
        return;
    }

    if (password.length < 8) {
        showMessage("Your password must have at least 8 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("The passwords do not match.");
        return;
    }

    // const users = getUsers();

    // const existingUser = users.find(function(user) {
    //     return (
    //         (typeof user.email === "string" &&
    //             user.email.toLowerCase() === email) ||
    //         (typeof user.username === "string" &&
    //             user.username.toLowerCase() === username.toLowerCase())
    //     );
    // });

    // if (existingUser) {
    //     showMessage("That email or username is already registered.");
    //     return;
    // }

    const newUser = {
        id: "user_" + Date.now(),
        fullName: fullName,
        username: username,
        email: email,
        password: password
    };

    // try {
    //     users.push(newUser);

    //     localStorage.setItem(
    //         USERS_KEY,
    //         JSON.stringify(users)
    //     );

    // const currentUser = {
    //     id: newUser.id,
    //     fullName: newUser.fullName,
    //     username: newUser.username,
    //     email: newUser.email
    // };

    // localStorage.setItem(
    //     CURRENT_USER_KEY,
    //     JSON.stringify(currentUser)
    // );

    window.location.href = "index.html";

    // } catch (error) {
    //     showMessage(
    //         "Unable to create your account. Please try again."
    //     );
    // }
});