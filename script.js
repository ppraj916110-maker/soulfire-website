document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  const darkToggle = document.getElementById("dark-toggle");
  const body = document.body;

  // ====== Slide Menu Toggle ======
  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      menuToggle.classList.toggle("open");
      menuToggle.classList.toggle("close");
    });
  }

  // ====== Theme Detection from LocalStorage ======
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    body.classList.add("dark-mode");
    darkToggle.textContent = "☀️";
  } else {
    darkToggle.textContent = "🌙";
  }

  // ====== Dark Mode Toggle Button ======
  darkToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      darkToggle.textContent = "☀️";
    } else {
      localStorage.setItem("theme", "light");
      darkToggle.textContent = "🌙";
    }
  });

  // ====== AOS Animation ======
  AOS.init({
    duration: 1000,
    once: true,
  });
// ===== Firebase Imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ===== Firebase Config =====
const firebaseConfig = {
    apiKey: "AIzaSyDa5EPtNbmugtaIMiIaYmVtapYsvU7biMc",
    authDomain: "tradingekmission.firebaseapp.com",
    projectId: "tradingekmission",
    storageBucket: "tradingekmission.firebasestorage.app",
    messagingSenderId: "301971513060",
    appId: "1:301971513060:web:a6027176e12af4b227d6f1",
    measurementId: "G-C0W3J8LNSE"
};

// ===== Init Firebase =====
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);

// ===== Detect Current Page =====
const currentPage = window.location.pathname.split("/").pop();

// ===== Signup Logic =====
if (currentPage === "signup.html") {
    const signupForm = document.getElementById("signup-form");
    const formMsg = document.getElementById("form-message");

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (password !== confirmPassword) {
            formMsg.textContent = "❌ Passwords do not match!";
            return;
        }

        if (password.length < 8) {
            formMsg.textContent = "⚠️ Password must be at least 8 characters.";
            return;
        }

        if (!/[!@#$%^&*]/.test(password)) {
            formMsg.textContent = "⚠️ Password must contain at least one special character (!@#$%^&*).";
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            formMsg.textContent = "✅ Signup successful! Redirecting...";
            setTimeout(() => window.location.href = "course.html", 1500);
        } catch (error) {
            formMsg.textContent = `❌ ${error.message}`;
        }
    });
}

// ===== Login Logic =====
if (currentPage === "login.html") {
    const loginForm = document.getElementById("login-form");
    const formMsg = document.getElementById("form-message");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            formMsg.textContent = "✅ Login successful! Redirecting...";
            setTimeout(() => window.location.href = "course.html", 1500);
        } catch (error) {
            formMsg.textContent = `❌ ${error.message}`;
        }
    });
}

// ===== Auth Protection (Courses Page) =====
if (currentPage === "course.html") {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });
}

// ===== Logout Button =====
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => window.location.href = "login.html");
    });
}
}
