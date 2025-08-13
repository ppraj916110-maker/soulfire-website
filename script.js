// ----- Firebase Imports -----
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu");
    const closeMenuBtn = document.getElementById("close-menu-btn");
    const darkToggle = document.getElementById("dark-toggle");
    const body = document.body;
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const formMessage = document.getElementById("form-message");

    // Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            menu.classList.toggle("active");
            menuToggle.classList.toggle("open");
        });
    }
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener("click", () => {
            menu.classList.remove("active");
            menuToggle.classList.remove("open");
        });
    }

    // Dark Mode
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if (darkToggle) darkToggle.textContent = "☀️";
    } else {
        if (darkToggle) darkToggle.textContent = "🌙";
    }
    if (darkToggle) {
        darkToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const isDark = body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            darkToggle.textContent = isDark ? "☀️" : "🌙";
        });
    }

    // Firebase Config
    const firebaseConfig = {
        apiKey: "AIzaSyDa5EPtNbmugtaIMiIaYmVtapYsvU7biMc",
        authDomain: "tradingekmission.firebaseapp.com",
        projectId: "tradingekmission",
        storageBucket: "tradingekmission.firebasestorage.app",
        messagingSenderId: "301971513060",
        appId: "1:301971513060:web:a6027176e12af4b227d6f1",
        measurementId: "G-C0W3J8LNSE"
    };

    const app = initializeApp(firebaseConfig);
    getAnalytics(app);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const currentPage = window.location.pathname.split("/").pop();

    // Signup
    if (currentPage === "signup.html" && signupForm) {
        signupForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                formMessage.textContent = "❌ Please enter a valid email address.";
                return;
            }
            if (password !== confirmPassword) {
                formMessage.textContent = "❌ Passwords do not match!";
                return;
            }
            if (password.length < 8) {
                formMessage.textContent = "⚠️ Password must be at least 8 characters.";
                return;
            }
            if (!/[!@#$%^&*]/.test(password)) {
                formMessage.textContent = "⚠️ Password must contain a special character (!@#$%^&*).";
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                formMessage.textContent = "✅ Signup successful! Redirecting...";
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                formMessage.textContent = `❌ ${error.message}`;
            }
        });
    }

    // Login
    if (currentPage === "login.html" && loginForm) {
        loginForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                await signInWithEmailAndPassword(auth, email, password);
                formMessage.textContent = "✅ Login successful! Redirecting...";
                setTimeout(() => window.location.href = "course.html", 1500);
            } catch (error) {
                formMessage.textContent = `❌ ${error.message}`;
            }
        });
    }

    // Auth State
    onAuthStateChanged(auth, async user => {
        const protectedPages = ["beginner.html", "technical.html", "advance.html"];
        if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
            return;
        }

        if (logoutBtn) logoutBtn.style.display = user ? "block" : "none";

        if (currentPage === "course.html" && user) {
            await updateProgress(user.uid);
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => signOut(auth));
    }

    // Update Progress Function
    async function updateProgress(uid) {
        const combinedBar = document.getElementById("combinedProgressBar");
        const progressText = document.getElementById("progressText");

        const lessonCounts = {
            beginnerCourse: 6,
            technicalCourse: 12,
            advanceCourse: 8
        };

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            let totalCompleted = 0;
            let totalLessons = 0;

            for (const key in lessonCounts) {
                const lessonCount = lessonCounts[key];
                const completedCount = (userData[key] || []).length;

                totalCompleted += completedCount;
                totalLessons += lessonCount;

                const bar = document.getElementById(`${key}ProgressBar`);
                const text = document.getElementById(`${key}ProgressText`);
                if (bar && text) {
                    const percent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
                    bar.style.width = percent + "%";
                    bar.textContent = percent + "%";
                    text.textContent = `Completed: ${completedCount} / ${lessonCount}`;
                }
            }

            const combinedPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
            if (combinedBar) {
                combinedBar.style.width = combinedPercent + "%";
                combinedBar.textContent = combinedPercent + "%";
            }
            if (progressText) {
                progressText.textContent = `Total lessons completed: ${totalCompleted} / ${totalLessons}`;
            }
        } catch (err) {
            console.error("Error updating progress:", err);
        }
    }
});
