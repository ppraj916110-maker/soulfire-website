// ===== Firebase imports - CORRECTED PATHS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // ===== 1. Cache All UI Elements for Performance =====
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

    // ===== 2. Firebase Config and Initialization =====
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

    // ===== 3. Modularity - Setup Functions =====
    const setupMenuToggle = () => {
        if (!menuToggle || !menu) return;

        menuToggle.setAttribute('role', 'button');
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.addEventListener("click", () => {
            const isExpanded = menu.classList.toggle("active");
            menuToggle.classList.toggle("open", isExpanded);
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        if (closeMenuBtn) {
            closeMenuBtn.addEventListener("click", () => {
                menu.classList.remove("active");
                menuToggle.classList.remove("open");
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        }
    };

    const setupDarkMode = () => {
        if (!darkToggle) return;

        if (localStorage.getItem("theme") === "dark") {
            body.classList.add("dark-mode");
            darkToggle.textContent = "☀️";
        }

        darkToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            const isDark = body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            darkToggle.textContent = isDark ? "☀️" : "🌙";
        });
    };

    const setupRotatingQuotes = () => {
        if (!quoteEl) return;

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
    };

    const setupPasswordToggles = () => {
        passwordToggles.forEach(toggle => {
            const input = document.getElementById(toggle.dataset.target);
            if (!input) return;

            toggle.setAttribute('role', 'button');
            toggle.setAttribute('aria-label', input.type === "password" ? "Show password" : "Hide password");

            toggle.addEventListener("click", () => {
                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                toggle.textContent = isPassword ? "🙈" : "👁️";
                toggle.setAttribute('aria-label', isPassword ? "Hide password" : "Show password");
            });
        });
    };

    const setupContentToggles = () => {
        toggleButtons.forEach(btn => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            
            target.style.display = "none";
            btn.innerHTML = "<strong>Show More Content</strong>";
            btn.setAttribute("aria-expanded", "false");
            btn.addEventListener("click", () => {
                const isHidden = target.style.display === "none";
                target.style.display = isHidden ? "block" : "none";
                btn.innerHTML = `<strong>${isHidden ? "Show Less" : "Show More"} Content</strong>`;
                btn.setAttribute("aria-expanded", !isHidden);
            });
        });
    };

    // ===== 4. Helper Functions =====
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

    const showFormFeedback = (form, message, isError = true) => {
        const messageEl = form.querySelector("#form-message");
        const submitBtn = form.querySelector("button[type='submit']");
        
        if (!messageEl || !submitBtn) return;

        messageEl.textContent = message;
        messageEl.style.color = isError ? "var(--accent-color)" : "var(--primary-color)";
        submitBtn.disabled = false;
        if(isError) {
            submitBtn.innerHTML = "Submit";
        }
    };

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

    // ===== 5. Initial Setup and Event Listeners =====
    setupMenuToggle();
    setupDarkMode();
    setupRotatingQuotes();
    if (typeof AOS !== "undefined") {
        AOS.init({ duration: 1000, once: true });
    }
    setupPasswordToggles();
    setupContentToggles();

    // Disable Right Click + Copy
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("keydown", e => {
        if ((e.ctrlKey && ["c", "u", "s"].includes(e.key.toLowerCase())) || e.key === "PrintScreen") {
            e.preventDefault();
        }
    });

    // New: Accessibility for form messages
    if (formMessage) {
        formMessage.setAttribute('role', 'status');
        formMessage.setAttribute('aria-live', 'polite');
    }

    // Signup Form Handler
    if (currentPage === "signup.html" && signupForm) {
        signupForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();
            const submitBtn = signupForm.querySelector("button[type='submit']");

            formMessage.textContent = "";
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Signing up...";

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return showFormFeedback(signupForm, "❌ Please enter a valid email.");
            }
            if (password !== confirmPassword) {
                return showFormFeedback(signupForm, "❌ Passwords do not match!");
            }
            if (password.length < 8) {
                return showFormFeedback(signupForm, "⚠️ Password must be at least 8 characters.");
            }
            if (!/[!@#$%^&*]/.test(password)) {
                return showFormFeedback(signupForm, "⚠️ Password must contain a special character (!@#$%^&*).");
            }

            try {
                // ADDED: Set session persistence to SESSION before creating a new user
                await setPersistence(auth, browserSessionPersistence);
                await createUserWithEmailAndPassword(auth, email, password);
                formMessage.textContent = "✅ Signup successful! Redirecting...";
                submitBtn.innerHTML = "Success!";
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                showFormFeedback(signupForm, getFirebaseErrorMessage(error));
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // Login Form Handler
    if (currentPage === "login.html" && loginForm) {
        loginForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const submitBtn = loginForm.querySelector("button[type='submit']");

            formMessage.textContent = "";
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Logging in...";

            try {
                // ADDED: Set session persistence to SESSION before logging in
                await setPersistence(auth, browserSessionPersistence);
                await signInWithEmailAndPassword(auth, email, password);
                formMessage.textContent = "✅ Login successful! Redirecting...";
                submitBtn.innerHTML = "Success!";
                setTimeout(() => window.location.href = "course.html", 1500);
            } catch (error) {
                showFormFeedback(loginForm, getFirebaseErrorMessage(error));
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // Auth State and Firestore Logic
    onAuthStateChanged(auth, async user => {
        const protectedPages = ["beginner.html", "technical.html", "advance.html"];
        if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
            return;
        }

        if (currentPage === "course.html" && courseLockIcons) {
            courseLockIcons.forEach(icon => {
                icon.classList.toggle("fa-lock", !user);
                icon.classList.toggle("locked", !user);
                icon.classList.toggle("fa-unlock", !!user);
                icon.classList.toggle("unlocked", !!user);
            });
        }
        

        if (logoutBtn) logoutBtn.style.display = user ? "block" : "none";

       if (user) {
            for (const container of courseContainers) {
                const courseId = container.getAttribute("data-course-id");
                
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.exists() ? userSnap.data() : {};
                    let completedSet = new Set(userData[courseId] || []);
                    
                    const checkboxes = container.querySelectorAll(".lesson-complete");

                    checkboxes.forEach(checkbox => {
                        const lessonIndex = checkbox.closest('[data-lesson-index]').getAttribute('data-lesson-index');
                        
                        if (completedSet.has(lessonIndex)) {
                            checkbox.checked = true;
                        }
                        
                        checkbox.addEventListener("change", async () => {
                            if (checkbox.checked) {
                                completedSet.add(lessonIndex);
                            } else {
                                completedSet.delete(lessonIndex);
                            }

                            try {
                                await setDoc(userRef, {
                                    ...userData,
                                    [courseId]: Array.from(completedSet)
                                }, { merge: true });

                                if (window.location.pathname.includes("course.html")) {
                                    await updateProgress(user.uid);
                                }
                            } catch (firestoreError) {
                                console.error("Error saving progress to Firestore:", firestoreError);
                            }
                        });
                    });
                } catch (firestoreError) {
                    console.error("Error fetching user data from Firestore:", firestoreError);
                }
            }

            if (currentPage === "course.html") {
                await updateProgress(user.uid);
            }
        }
    });

    // ===== Pages where Auto Logout is Disabled =====
const authPages = ["login.html", "signup.html"];
const currentPage = window.location.pathname.split("/").pop();

// ===== Idle Timeout Settings =====
const AUTO_LOGOUT_IDLE_TIME = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // 1 minute before logout
let idleTimer, warningTimer;
let autoLogoutListener;

// ===== Function to Reset Idle Timer =====
function resetIdleTimer() {
    clearTimeout(idleTimer);
    clearTimeout(warningTimer);

    // Show warning 1 minute before actual logout
    warningTimer = setTimeout(() => {
        const stay = confirm("You will be logged out in 1 minute due to inactivity. Click OK to stay logged in.");
        if (stay) {
            resetIdleTimer(); // Reset timer if user chooses to stay
        }
    }, AUTO_LOGOUT_IDLE_TIME - WARNING_TIME);

    // Actual logout after full idle time
    idleTimer = setTimeout(() => {
        if (auth.currentUser) {
            signOut(auth).then(() => {
                alert("You have been logged out due to inactivity.");
                window.location.href = "login.html";
            }).catch(console.error);
        }
    }, AUTO_LOGOUT_IDLE_TIME);
}

// ===== Auto Logout When Leaving the Site (Exclude Refresh & Login Pages) =====
if (!authPages.includes(currentPage)) {
    autoLogoutListener = () => {
        const nextURL = document.activeElement?.href || "";

        // Detect if it's a refresh
        const isRefresh = performance.getEntriesByType("navigation")[0]?.type === "reload";
        if (isRefresh) return; // Skip logout on refresh

        const isTabClose = !nextURL;
        const isExternal = nextURL && !nextURL.includes(window.location.hostname);

        if (auth.currentUser && (isTabClose || isExternal)) {
            signOut(auth).catch(console.error);
        }
    };
    window.addEventListener("beforeunload", autoLogoutListener);

    // ===== Start Idle Timer on Any Activity =====
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(event => {
        document.addEventListener(event, resetIdleTimer);
    });

    // Start the timer if logged in
    onAuthStateChanged(auth, user => {
        if (user) {
            resetIdleTimer();
        } else {
            clearTimeout(idleTimer);
            clearTimeout(warningTimer);
        }
    });
}

// ===== Manual Logout Button (Clears Auto Logout & Idle Timer) =====
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (autoLogoutListener) {
            window.removeEventListener("beforeunload", autoLogoutListener);
        }
        clearTimeout(idleTimer);
        clearTimeout(warningTimer);
        signOut(auth).catch(console.error);
    });
}
});
