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
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // ===== Elements =====
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

    // ===== Menu Toggle =====
    if (menuToggle && menu) {
        menuToggle.addEventListener("click", () => {
            menu.classList.toggle("active");
            menuToggle.classList.toggle("open", menu.classList.contains("active"));
        });
    }
    if (closeMenuBtn) {
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

    // ===== AOS =====
    if (typeof AOS !== "undefined") {
        AOS.init({ duration: 1000, once: true });
    }

    // ===== Rotating Quotes =====
    const quotes = [
        "Every expert was once a beginner — start your journey today.",
        "Small consistent steps build big trading success.",
        "In trading, patience is not just a virtue — it’s a profit strategy.",
        "A disciplined trader turns losses into lessons."
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

    // ===== Disable Right Click + Copy =====
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("keydown", e => {
        if ((e.ctrlKey && ["c", "u", "s"].includes(e.key.toLowerCase())) || e.key === "PrintScreen") {
            e.preventDefault();
        }
    });

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

    // ===== Show/Hide Password =====
    document.querySelectorAll(".toggle-password").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const targetInput = document.getElementById(toggle.dataset.target);
            if (targetInput) {
                if (targetInput.type === "password") {
                    targetInput.type = "text";
                    toggle.textContent = "🙈";
                } else {
                    targetInput.type = "password";
                    toggle.textContent = "👁️";
                }
            }
        });
    });

    // ===== Signup =====
    if (currentPage === "signup.html" && signupForm) {
        signupForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                return formMessage.textContent = "❌ Please enter a valid email.";
            if (password !== confirmPassword)
                return formMessage.textContent = "❌ Passwords do not match!";
            if (password.length < 8)
                return formMessage.textContent = "⚠️ Password must be at least 8 characters.";
            if (!/[!@#$%^&*]/.test(password))
                return formMessage.textContent = "⚠️ Password must contain a special character (!@#$%^&*).";

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                formMessage.textContent = "✅ Signup successful! Redirecting...";
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                formMessage.textContent = `❌ ${error.message}`;
            }
        });
    }

    // ===== Login =====
    if (currentPage === "login.html" && loginForm) {
        loginForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();
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

    // ===== Auth State =====
    onAuthStateChanged(auth, async user => {
        const protectedPages = ["beginner.html", "technical.html", "advance.html"];
        if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
            return;
        }

        // Course lock/unlock
        if (currentPage === "course.html") {
            document.querySelectorAll(".course-lock-icon").forEach(icon => {
                icon.classList.toggle("fa-lock", !user);
                icon.classList.toggle("locked", !user);
                icon.classList.toggle("fa-unlock", !!user);
                icon.classList.toggle("unlocked", !!user);
            });
        }

        if (logoutBtn) logoutBtn.style.display = user ? "block" : "none";

        if (user) {
            const courseContainers = document.querySelectorAll("[data-course-id]");

            for (const container of courseContainers) {
                const courseId = container.getAttribute("data-course-id");
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : {};
                let completedSet = new Set(userData[courseId] || []);

                const checkboxes = container.querySelectorAll(".lesson-complete");
                checkboxes.forEach(checkbox => {
                    const lessonIndex = checkbox.closest("[data-lesson-index]").getAttribute("data-lesson-index");

                    // Set initial state
                    checkbox.checked = completedSet.has(lessonIndex);

                    // Update on change
                    checkbox.addEventListener("change", async () => {
                        if (checkbox.checked) completedSet.add(lessonIndex);
                        else completedSet.delete(lessonIndex);

                        await setDoc(userRef, {
                            ...userData,
                            [courseId]: Array.from(completedSet)
                        }, { merge: true });

                        if (currentPage === "course.html") {
                            await updateProgress(user.uid);
                        }
                    });
                });
            }

            if (currentPage === "course.html") {
                await updateProgress(user.uid);
            }
        }
    });

    // ===== Logout =====
    if (logoutBtn) logoutBtn.addEventListener("click", () => signOut(auth));

    // ===== Toggle Sections =====
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

    // ===== Update Progress =====
    async function updateProgress(uid) {
        try {
            const combinedBar = document.getElementById("combinedProgressBar");
            const progressText = document.getElementById("progressText");
            const courseContainers = document.querySelectorAll("[data-course-id]");
            let totalCompleted = 0, totalLessons = 0;

            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            courseContainers.forEach(container => {
                const courseId = container.getAttribute("data-course-id");
                const lessonCount = parseInt(container.getAttribute("data-total-lessons"), 10) || 0;
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
