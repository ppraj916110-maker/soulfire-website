// ---------------------------
// Firebase Integration Script
// ---------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------
    // UI ELEMENT REFERENCES
    // -------------------------------------
    const menuToggleBtn = document.getElementById("menu-toggle");
    const sideMenu = document.getElementById("menu");
    const closeMenuBtn = document.getElementById("close-menu-btn");
    const darkModeToggle = document.getElementById("dark-toggle");
    const pageBody = document.body;
    const quoteElement = document.getElementById("trader-quote");
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const logoutButton = document.getElementById("logout-btn");
    const formMessage = document.getElementById("form-message");

    // -------------------------------------
    // MENU TOGGLE FUNCTIONALITY
    // -------------------------------------
    if (menuToggleBtn && sideMenu) {
        menuToggleBtn.addEventListener("click", () => {
            sideMenu.classList.toggle("active");
            menuToggleBtn.classList.toggle("open");
            menuToggleBtn.classList.toggle("close");
        });
    }

    if (closeMenuBtn && sideMenu) {
        closeMenuBtn.addEventListener("click", () => {
            sideMenu.classList.remove("active");
            menuToggleBtn.classList.remove("open", "close");
        });
    }

    // -------------------------------------
    // DARK MODE SETUP
    -------------------------------------
    if (localStorage.getItem("theme") === "dark") {
        pageBody.classList.add("dark-mode");
        if (darkModeToggle) darkModeToggle.textContent = "☀️";
    } else {
        if (darkModeToggle) darkModeToggle.textContent = "🌙";
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            pageBody.classList.toggle("dark-mode");
            const isDarkMode = pageBody.classList.contains("dark-mode");
            localStorage.setItem("theme", isDarkMode ? "dark" : "light");
            darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
        });
    }

    // -------------------------------------
    // INITIALIZE AOS ANIMATIONS
    // -------------------------------------
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 1000,
            once: true
        });
    }

    // -------------------------------------
    // ROTATING QUOTES FOR TRADER MOTIVATION
    // -------------------------------------
    const quotesList = [
        "Every expert was once a beginner — start your journey today.",
        "Small consistent steps build big trading success.",
        "Mistakes, failure, humiliation, disappointment and rejection are all a part of growth.",
        "In trading, patience is not just a virtue — it’s a profit strategy.",
        "Learn before you earn — the market rewards preparation.",
        "A disciplined trader turns losses into lessons.",
        "Trading is not about speed, it’s about direction.",
        "Risk is the cost of opportunity — manage it wisely.",
        "Your first trade is not the end goal, it’s the starting line.",
        "Charts don’t lie, but traders who read them well succeed.",
        "The best investment you can make is in your trading education."
    ];
    let currentQuoteIndex = 0;

    if (quoteElement) {
        const changeQuote = () => {
            quoteElement.style.opacity = 0;
            setTimeout(() => {
                quoteElement.textContent = quotesList[currentQuoteIndex];
                quoteElement.style.opacity = 1;
                currentQuoteIndex = (currentQuoteIndex + 1) % quotesList.length;
            }, 800);
        };
        changeQuote();
        setInterval(changeQuote, 5000);
    }

    // -------------------------------------
    // DISABLE RIGHT CLICK & COPY SHORTCUTS
    // -------------------------------------
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("keydown", e => {
        if ((e.ctrlKey && ["c", "u", "s"].includes(e.key.toLowerCase())) || e.key === "PrintScreen") {
            e.preventDefault();
        }
    });

    // -------------------------------------
    // FIREBASE CONFIGURATION
    // -------------------------------------
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

    // Get current page file name
    const currentPage = window.location.pathname.split("/").pop();

    // -------------------------------------
    // SIGNUP FUNCTIONALITY
    // -------------------------------------
    if (currentPage === "signup.html" && signupForm) {
        signupForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            // Email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                formMessage.textContent = "❌ Please enter a valid email address.";
                return;
            }

            // Password validations
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
                formMessage.textContent = "✅ Signup successful! Redirecting... Remember your password.";
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                formMessage.textContent = `❌ ${error.message}`;
            }
        });
    }

    // -------------------------------------
    // LOGIN FUNCTIONALITY
    // -------------------------------------
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

    // -------------------------------------
    // AUTH STATE CHANGE HANDLING
    // -------------------------------------
    onAuthStateChanged(auth, async user => {
        const protectedPages = ["beginner.html", "technical.html", "advance.html"];

        // Redirect to login if user is not authenticated
        if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
            return;
        }

        // Lock/Unlock course icons
        if (currentPage === "course.html") {
            document.querySelectorAll(".course-lock-icon").forEach(icon => {
                icon.classList.toggle("fa-lock", !user);
                icon.classList.toggle("locked", !user);
                icon.classList.toggle("fa-unlock", !!user);
                icon.classList.toggle("unlocked", !!user);
            });
        }

        // Show logout button only when logged in
        if (logoutButton) {
            logoutButton.style.display = user ? "block" : "none";
        }

        // Track lesson completion for each course
        if (user) {
            const courseContainers = document.querySelectorAll(".course-container");

            for (const container of courseContainers) {
                const lessonList = container.querySelector(".lessonList");
                const courseId = container.getAttribute("data-course-id");

                if (lessonList) {
                    const lessons = lessonList.querySelectorAll("li");

                    try {
                        const userRef = doc(db, "users", user.uid);
                        const userSnap = await getDoc(userRef);
                        const userData = userSnap.exists() ? userSnap.data() : {};
                        let completedLessons = new Set(userData[courseId] || []);

                        lessons.forEach((lesson, index) => {
                            // Check if the lesson is in the completed lessons set and apply the class
                            // Using toString() for robustness against data type inconsistencies
                            if (completedLessons.has(index.toString())) {
                                lesson.classList.add("completed");
                            }

                            lesson.addEventListener("click", async () => {
                                lesson.classList.toggle("completed");

                                if (lesson.classList.contains("completed")) {
                                    completedLessons.add(index.toString());
                                } else {
                                    completedLessons.delete(index.toString());
                                }

                                try {
                                    await setDoc(userRef, {
                                        ...userData,
                                        [courseId]: Array.from(completedLessons)
                                    });
                                    // Update progress meter on click
                                    if (currentPage === "course.html") {
                                        await updateProgress(user.uid);
                                    }
                                } catch (err) {
                                    console.error("Error saving lesson progress:", err);
                                }
                            });
                        });
                    } catch (err) {
                        console.error("Error loading lesson progress:", err);
                    }
                }
            }

            // **FIX:** Call the updateProgress function here, after all lessons have been checked
            if (currentPage === "course.html") {
                await updateProgress(user.uid);
            }
        }
    });

    // -------------------------------------
    // LOGOUT FUNCTIONALITY
    // -------------------------------------
    if (logoutButton) {
        logoutButton.addEventListener("click", () => signOut(auth));
    }

    // -------------------------------------
    // SHOW/HIDE CONTENT BUTTONS
    // -------------------------------------
    document.querySelectorAll(".toggle-btn").forEach(button => {
        const targetElement = document.getElementById(button.dataset.target);

        if (targetElement) {
            targetElement.style.display = "none";
            button.innerHTML = "<strong>Show More Content</strong>";

            button.addEventListener("click", () => {
                const isHidden = targetElement.style.display === "none";
                targetElement.style.display = isHidden ? "block" : "none";
                button.innerHTML = `<strong>${isHidden ? "Show Less" : "Show More"} Content</strong>`;
                button.setAttribute("aria-expanded", !isHidden);
            });
        }
    });

    // -------------------------------------
    // UPDATE COURSE PROGRESS BARS
    // -------------------------------------
    async function updateProgress(uid) {
        const combinedProgressBar = document.getElementById("combinedProgressBar");
        const totalProgressText = document.getElementById("progressText");

        const courseIds = ["beginnerCourse", "technicalCourse", "advanceCourse"];

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            let totalLessonsCompleted = 0;
            let totalLessonsAvailable = 0;

            courseIds.forEach(courseId => {
                const courseContainer = document.querySelector(`.course-container[data-course-id="${courseId}"] .lessonList`);
                const lessonCount = courseContainer ? courseContainer.querySelectorAll("li").length : 0;
                const completedCount = (userData[courseId] || []).length;

                totalLessonsCompleted += completedCount;
                totalLessonsAvailable += lessonCount;

                // Update individual progress bar
                const bar = document.getElementById(`${courseId}ProgressBar`);
                const text = document.getElementById(`${courseId}ProgressText`);

                if (bar && text) {
                    const percent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
                    bar.style.width = percent + "%";
                    bar.textContent = percent + "%";
                    text.textContent = `Completed: ${completedCount} / ${lessonCount}`;
                }
            });

            // Update combined progress bar
            const combinedPercent = totalLessonsAvailable > 0
                ? Math.round((totalLessonsCompleted / totalLessonsAvailable) * 100)
                : 0;

            if (combinedProgressBar) {
                combinedProgressBar.style.width = combinedPercent + "%";
                combinedProgressBar.textContent = combinedPercent + "%";
            }

            if (totalProgressText) {
                totalProgressText.textContent = `Total lessons completed: ${totalLessonsCompleted} / ${totalLessonsAvailable}`;
            }
        } catch (err) {
            console.error("Error updating progress:", err);
        }
    }
});
