import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    // ----- UI Elements -----
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

    // ----- Menu Toggle -----
    if (menuToggle && menu) {
        menuToggle.addEventListener("click", () => {
            menu.classList.toggle("active");
            menuToggle.classList.toggle("open");
            menuToggle.classList.toggle("close");
        });
    }
    if (closeMenuBtn && menu) {
        closeMenuBtn.addEventListener("click", () => {
            menu.classList.remove("active");
            menuToggle.classList.remove("open", "close");
        });
    }

    // ----- Dark Mode -----
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

    // ----- AOS Animation -----
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 1000,
            once: true
        });
    }

    // ----- Rotating Quotes -----
    const quotes = [
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
    let quoteIndex = 0;
    if (quoteEl) {
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

    // ----- Disable Right Click + Copy -----
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("keydown", e => {
        if (
            (e.ctrlKey && ["c", "u", "s"].includes(e.key.toLowerCase())) ||
            e.key === "PrintScreen"
        ) {
            e.preventDefault();
        }
    });

    // ----- Firebase Config -----
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

    // ----- Signup -----
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
                formMessage.textContent = "✅ Signup successful! Redirecting...Remember your password";
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                formMessage.textContent = `❌ ${error.message}`;
            }
        });
    }

    // ----- Login -----
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

    // ----- Auth State -----
    onAuthStateChanged(auth, async user => {
        const protectedPages = ["beginner.html", "technical.html", "advance.html"];
        if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
            return;
        }

        // Lock/Unlock Course Icons
        if (currentPage === "course.html") {
            document.querySelectorAll(".course-lock-icon").forEach(icon => {
                icon.classList.toggle("fa-lock", !user);
                icon.classList.toggle("locked", !user);
                icon.classList.toggle("fa-unlock", !!user);
                icon.classList.toggle("unlocked", !!user);
            });
            if (user) {
                await updateProgress(user.uid);
            }
        }

        // Show Logout
        if (logoutBtn) {
            logoutBtn.style.display = user ? "block" : "none";
        }

        // Track Lessons per Course
        if (user) {
            const courseContainers = document.querySelectorAll(".course-container");
            for (const container of courseContainers) {
                const lessonList = container.querySelector(".lessonList");
                const courseId = container.getAttribute("data-course-id");

                if (lessonList) {
                    const lessons = lessonList.querySelectorAll("li");
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.exists() ? userSnap.data() : {};
                    let completedSet = new Set(userData[courseId] || []);

                    lessons.forEach((lesson, index) => {
                        if (completedSet.has(index)) {
                            lesson.classList.add("completed");
                        }
                        lesson.addEventListener("click", async () => {
                            lesson.classList.toggle("completed");
                            if (lesson.classList.contains("completed")) {
                                completedSet.add(index);
                            } else {
                                completedSet.delete(index);
                            }
                            await setDoc(userRef, {
                                ...userData,
                                [courseId]: Array.from(completedSet)
                            });
                            if (currentPage === "course.html") {
                                await updateProgress(user.uid);
                            }
                        });
                    });
                }
            }
        }
    });

    // ----- Logout -----
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => signOut(auth));
    }

    // ----- Show/Hide Content Buttons -----
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        const target = document.getElementById(btn.dataset.target);
        if (target) {
            target.style.display = "none";
            btn.innerHTML = "<strong>Show More Content</strong>";
            btn.addEventListener("click", () => {
                const isHidden = target.style.display === "none";
                target.style.display = isHidden ? "block" : "none";
                btn.innerHTML = `<strong>${isHidden ? "Show Less" : "Show More"} Content</strong>`;
                btn.setAttribute("aria-expanded", !isHidden);
            });
        }
    });

    // ----- Update Progress -----
    async function updateProgress(uid) {
        const combinedBar = document.getElementById("combinedProgressBar");
        const progressText = document.getElementById("progressText");

        const courseKeys = ["beginnerCourse", "technicalCourse", "advanceCourse"];
        const courseNameMap = {
            beginnerCourse: "Beginner",
            technicalCourse: "Technical",
            advanceCourse: "Advance"
        };

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            let totalCompleted = 0;
            let totalLessons = 0;

            courseKeys.forEach(key => {
                const container = document.querySelector(`.course-container[data-course-id="${key}"] .lessonList`);
                const lessonCount = container ? container.querySelectorAll("li").length : 0;
                const completedCount = (userData[key] || []).length;

                totalCompleted += completedCount;
                totalLessons += lessonCount;

                // Update individual progress bars
                const bar = document.getElementById(`${key}ProgressBar`);
                const text = document.getElementById(`${key}ProgressText`);
                if (bar && text) {
                    const percent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
                    bar.style.width = percent + "%";
                    bar.textContent = percent + "%";
                    text.textContent = `Completed: ${completedCount} / ${lessonCount}`;
                }
            });

            // Update combined progress bar
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
