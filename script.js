// ===== Firebase imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
import {
    getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, setPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                return formMessage.textContent = "❌ Please enter a valid email.";
            if (password !== confirmPassword)
                return formMessage.textContent = "❌ Passwords do not match!";
            if (password.length < 8)
                return formMessage.textContent = "⚠️ Password must be at least 8 characters.";
            if (!/[!@#$%^&*]/.test(password))
                return formMessage.textContent = "⚠️ Password must contain a special character (!@#$%^&*).";

            try {
                await setPersistence(auth, browserSessionPersistence);
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
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                await setPersistence(auth, browserSessionPersistence);
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

        if (logoutBtn) logoutBtn.style.display = user ? "block" : "none";

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

    // ===== Auto Logout (Idle + Tab Close) =====
    const AUTO_LOGOUT_IDLE_TIME = 15 * 60 * 1000;
    const WARNING_TIME = 60 * 1000;
    let idleTimer, warningTimer;

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        clearTimeout(warningTimer);
        warningTimer = setTimeout(showIdleModal, AUTO_LOGOUT_IDLE_TIME - WARNING_TIME);
        idleTimer = setTimeout(() => {
            if (auth.currentUser) {
                signOut(auth).then(() => {
                    alert("You have been logged out due to inactivity.");
                    window.location.href = "login.html";
                });
            }
        }, AUTO_LOGOUT_IDLE_TIME);
    }

    function createIdleWarningModal() {
        if (document.getElementById("idleWarningModal")) return;
        const modalHTML = `
            <div id="idleWarningModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center;">
                <div id="idleModalBox" style="padding:20px;border-radius:12px;max-width:400px;text-align:center;box-shadow:0 4px 15px rgba(0,0,0,0.3);background:#fff;">
                    <h3>Session Expiring</h3>
                    <p>You will be logged out in 1 minute due to inactivity.</p>
                    <div style="margin-top:15px;">
                        <button id="stayLoggedInBtn" style="padding:8px 14px;background:#4caf50;color:white;border:none;border-radius:6px;margin-right:8px;">Stay Logged In</button>
                        <button id="logoutNowBtn" style="padding:8px 14px;background:#f44336;color:white;border:none;border-radius:6px;">Logout Now</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        document.getElementById("stayLoggedInBtn").addEventListener("click", () => {
            hideIdleModal();
            resetIdleTimer();
        });
        document.getElementById("logoutNowBtn").addEventListener("click", () => {
            hideIdleModal();
            signOut(auth);
        });
    }

    function showIdleModal() {
        createIdleWarningModal();
        document.getElementById("idleWarningModal").style.display = "flex";
    }

    function hideIdleModal() {
        document.getElementById("idleWarningModal").style.display = "none";
    }

    if (!authPages.includes(currentPage)) {
        window.addEventListener("beforeunload", (e) => {
            if (auth.currentUser && performance.getEntriesByType("navigation")[0]?.type !== "reload") {
                signOut(auth);
            }
        });
        ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(event => {
            document.addEventListener(event, resetIdleTimer);
        });
        onAuthStateChanged(auth, user => {
            if (user) resetIdleTimer();
            else {
                clearTimeout(idleTimer);
                clearTimeout(warningTimer);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearTimeout(idleTimer);
            clearTimeout(warningTimer);
            signOut(auth);
        });
    }
});
