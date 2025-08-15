// ===== Firebase imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import {
    getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, setPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // ===== Cache UI elements =====
    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu");
    const closeMenuBtn = document.getElementById("close-menu-btn");
    const darkToggle = document.getElementById("dark-toggle");
    const body = document.body;
    const quoteEl = document.getElementById("trader-quote");
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const formMessage = document.getElementById("form-message");
    const passwordToggles = document.querySelectorAll(".password-toggle");
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    const courseContainers = document.querySelectorAll("[data-course-id]");
    const courseLockIcons = document.querySelectorAll(".course-lock-icon");

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
    const app = initializeApp(firebaseConfig);
    getAnalytics(app);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const currentPage = window.location.pathname.split("/").pop();
    const authPages = ["login.html", "signup.html"];

    // ===== Helper function for Firebase errors =====
    const getFirebaseErrorMessage = (error) => {
        if (!error || !error.code) return "An unknown error occurred. Please try again.";
        switch (error.code) {
            case "auth/email-already-in-use": return "❌ The email address is already in use.";
            case "auth/invalid-email": return "❌ The email address is not valid.";
            case "auth/operation-not-allowed": return "❌ Email/password accounts are not enabled. Contact support.";
            case "auth/weak-password": return "⚠️ Password is too weak. Please use a stronger password.";
            case "auth/user-not-found":
            case "auth/wrong-password": return "❌ Invalid email or password.";
            case "auth/network-request-failed": return "❌ Network error. Please check your internet connection.";
            default:
                console.error("Firebase Auth Error:", error);
                return `❌ An error occurred: ${error.message}`;
        }
    };

    const showFormFeedback = (message, isError = true) => {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.style.color = isError ? "var(--accent-color)" : "var(--primary-color)";
    };

    // ===== Menu Toggle =====
    if (menuToggle && menu) {
        menuToggle.addEventListener("click", () => {
            menu.classList.toggle("active");
            menuToggle.classList.toggle("open", menu.classList.contains("active"));
        });
    }
    if (closeMenuBtn && menu) {
        closeMenuBtn.addEventListener("click", () => {
            menu.classList.remove("active");
            menuToggle.classList.remove("open");
        });
    }

    // ===== Dark Mode =====
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if (darkToggle) darkToggle.textContent = "☀️";
    }
    if (darkToggle) {
        darkToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const isDark = body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            darkToggle.textContent = isDark ? "☀️" : "🌙";
        });
    }

    // ===== Rotating Quotes =====
    if (quoteEl) {
        const quotes = [
            "Every expert was once a beginner — start your journey today.",
            "Small consistent steps build big trading success.",
            "In trading, patience is not just a virtue — it’s a profit strategy.",
            "A disciplined trader turns losses into lessons."
        ];
        let quoteIndex = 0;
        const showQuote = () => {
            quoteEl.style.opacity = 0;
            setTimeout(() => {
                quoteEl.textContent = quotes[quoteIndex];
                quoteEl.style.opacity = 1;
                quoteIndex = (quoteIndex + 1) % quotes.length;
            }, 800);
        };
        showQuote();
        setInterval(showQuote, 5000);
    }

    // ===== Disable Right Click + Copy =====
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("keydown", e => {
        if ((e.ctrlKey && ["c", "u", "s"].includes(e.key.toLowerCase())) || e.key === "PrintScreen") {
            e.preventDefault();
        }
    });

    // ===== Show/Hide Password =====
    passwordToggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const input = document.getElementById(toggle.dataset.target);
            if (input) {
                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                toggle.textContent = isPassword ? "🙈" : "👁️";
            }
        });
    });

    // ===== Signup =====
    if (currentPage === "signup.html" && signupForm) {
        signupForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return showFormFeedback("❌ Please enter a valid email.");
            }
            if (password !== confirmPassword) {
                return showFormFeedback("❌ Passwords do not match!");
            }
            if (password.length < 8) {
                return showFormFeedback("⚠️ Password must be at least 8 characters.");
            }
            if (!/[!@#$%^&*]/.test(password)) {
                return showFormFeedback("⚠️ Password must contain a special character (!@#$%^&*).");
            }

            try {
                // Set session persistence to SESSION before creating a new user
                await setPersistence(auth, browserSessionPersistence);
                await createUserWithEmailAndPassword(auth, email, password);
                showFormFeedback("✅ Signup successful! Redirecting...", false);
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                showFormFeedback(getFirebaseErrorMessage(error));
            }
        });
    }

    // ===== Login =====
    if (currentPage === "login.html" && loginForm) {
        loginForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                // Set session persistence to SESSION before logging in
                await setPersistence(auth, browserSessionPersistence);
                await signInWithEmailAndPassword(auth, email, password);
                showFormFeedback("✅ Login successful! Redirecting...", false);
                setTimeout(() => window.location.href = "course.html", 1500);
            } catch (error) {
                showFormFeedback(getFirebaseErrorMessage(error));
            }
        });
    }

    // ===== Auth State =====
    onAuthStateChanged(auth, async user => {
        const protectedPages = ["beginner.html", "technical.html", "advance.html", "course.html"];
        if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
            return;
        }

        if (currentPage === "course.html") {
            courseLockIcons.forEach(icon => {
                icon.classList.toggle("fa-lock", !user);
                icon.classList.toggle("locked", !user);
                icon.classList.toggle("fa-unlock", !!user);
                icon.classList.toggle("unlocked", !!user);
            });
        }

        if (logoutBtn) {
            logoutBtn.style.display = user ? "block" : "none";
            logoutBtn.addEventListener("click", () => signOut(auth));
        }

        if (user && currentPage === "course.html") {
            await updateProgress(user.uid);
        }
    });

    // ===== Progress Meter =====
    async function updateProgress(uid) {
        try {
            const combinedBar = document.getElementById("combinedProgressBar");
            const progressText = document.getElementById("progressText");
            let totalCompleted = 0, totalLessons = 0;
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            courseContainers.forEach(container => {
                const courseId = container.getAttribute("data-course-id");
                const lessonCount = parseInt(container.getAttribute("data-total-lessons"), 10);
                const completedCount = (userData[courseId] || []).length;

                totalLessons += lessonCount;
                totalCompleted += completedCount;

                const bar = document.getElementById(`${courseId}ProgressBar`);
                const text = document.getElementById(`${courseId}ProgressText`);
                if (bar && text) {
                    const percent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
                    bar.style.width = percent + "%";
                    bar.textContent = percent + "%";
                    text.textContent = `Completed: ${completedCount} / ${lessonCount}`;
                }
            });

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
