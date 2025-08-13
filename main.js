// ===== Firebase Imports =====
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
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

document.addEventListener('DOMContentLoaded', () => {

    // ===== UI Elements =====
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const darkToggle = document.getElementById('dark-toggle');
    const body = document.body;
    const quoteElement = document.getElementById("trader-quote");
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const formMsg = document.getElementById("form-message");

    // ===== Menu Toggle =====
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            menuToggle.classList.toggle("open");
            menuToggle.classList.toggle("close");
        });
    }

    if (closeMenuBtn && menu) {
        closeMenuBtn.addEventListener('click', () => {
            menu.classList.remove('active');
            menuToggle.classList.remove("open", "close");
        });
    }

    // ===== Dark Mode =====
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

    // ===== AOS Animation =====
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true });
    }

    // ===== Rotating Quotes =====
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
    let currentQuoteIndex = 0;

    if (quoteElement) {
        const showNextQuote = () => {
            quoteElement.style.opacity = 0;
            setTimeout(() => {
                quoteElement.textContent = quotes[currentQuoteIndex];
                quoteElement.style.opacity = 1;
                currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            }, 800);
        };
        showNextQuote();
        setInterval(showNextQuote, 5000);
    }

    // ===== Disable Right Click & Shortcuts =====
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey && ['c', 'u', 's'].includes(e.key.toLowerCase())) || e.key === 'PrintScreen') {
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

    // ===== Init Firebase =====
    const app = initializeApp(firebaseConfig);
    getAnalytics(app);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const currentPage = window.location.pathname.split("/").pop();

    // ===== Signup =====
    if (currentPage === "signup.html" && signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                formMsg.textContent = "❌ Please enter a valid email address.";
                return;
            }
            if (password !== confirmPassword) {
                formMsg.textContent = "❌ Passwords do not match!";
                return;
            }
            if (password.length < 8) {
                formMsg.textContent = "⚠️ Password must be at least 8 characters.";
                return;
            }
            if (!/[!@#$%^&*]/.test(password)) {
                formMsg.textContent = "⚠️ Password must contain a special character (!@#$%^&*).";
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                formMsg.textContent = "✅ Signup successful! Redirecting...";
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                formMsg.textContent = `❌ ${error.message}`;
            }
        });
    }

    // ===== Login =====
    if (currentPage === "login.html" && loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                await signInWithEmailAndPassword(auth, email, password);
                formMsg.textContent = "✅ Login successful! Redirecting...";
                setTimeout(() => window.location.href = "beginner.html", 1500);
            } catch (error) {
                formMsg.textContent = `❌ ${error.message}`;
            }
        });
    }

    // ===== Auth State Listener =====
    onAuthStateChanged(auth, async (user) => {
        const protectedPages = ["beginner.html", "technical.html", "advance.html"];

        if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
            return;
        }

        // Lock/Unlock course icons
        if (currentPage === "course.html") {
            document.querySelectorAll('.course-lock-icon').forEach(icon => {
                icon.classList.toggle("fa-lock", !user);
                icon.classList.toggle("locked", !user);
                icon.classList.toggle("fa-unlock", !!user);
                icon.classList.toggle("unlocked", !!user);
            });
            if (user) {
                await updateCombinedProgressMeter(user.uid);
            }
        }

        // Logout button visibility
        if (logoutBtn) logoutBtn.style.display = user ? 'block' : 'none';

        // Progress tracking
        if (user) {
            const courseContainers = document.querySelectorAll('.course-container');
            for (const courseContainer of courseContainers) {
                const lessonList = courseContainer.querySelector('.lessonList');
                const courseId = courseContainer.getAttribute('data-course-id');

                if (lessonList) {
                    const lessons = lessonList.querySelectorAll('li');
                    const userDocRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(userDocRef);
                    const userData = docSnap.exists() ? docSnap.data() : {};
                    let completedLessonsSet = new Set(userData[courseId] || []);

                    lessons.forEach((lesson, index) => {
                        if (completedLessonsSet.has(index)) {
                            lesson.classList.add('completed');
                        }
                        lesson.addEventListener('click', async () => {
                            lesson.classList.toggle('completed');
                            if (lesson.classList.contains('completed')) {
                                completedLessonsSet.add(index);
                            } else {
                                completedLessonsSet.delete(index);
                            }
                            await setDoc(userDocRef, {
                                ...userData,
                                [courseId]: Array.from(completedLessonsSet)
                            });
                            if (currentPage === "course.html") {
                                await updateCombinedProgressMeter(user.uid);
                            }
                        });
                    });
                }
            }
        }
    });

    // ===== Logout =====
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => signOut(auth));
    }

    // ===== Show More/Less Toggle =====
    document.querySelectorAll('.toggle-btn').forEach(button => {
        const moreInfo = document.getElementById(button.dataset.target);
        if (moreInfo) {
            moreInfo.style.display = 'none';
            button.innerHTML = '<strong>Show More Content</strong>';
            button.addEventListener('click', () => {
                const isHidden = moreInfo.style.display === 'none';
                moreInfo.style.display = isHidden ? 'block' : 'none';
                button.innerHTML = `<strong>${isHidden ? 'Show Less' : 'Show More'} Content</strong>`;
                button.setAttribute('aria-expanded', !isHidden);
            });
        }
    });

    // ===== Progress Meter =====
    async function updateCombinedProgressMeter(uid) {
        const progressBar = document.getElementById('combinedProgressBar');
        const progressText = document.getElementById('progressText');
        if (!progressBar) return;

        const courseIds = ["beginnerCourse", "technicalCourse", "advanceCourse"];
        const lessonCounts = { beginnerCourse: 15, technicalCourse: 25, advanceCourse: 20 };

        try {
            const userDocRef = doc(db, "users", uid);
            const docSnap = await getDoc(userDocRef);
            const userData = docSnap.exists() ? docSnap.data() : {};

            let totalCompleted = 0;
            let totalLessons = 0;

            courseIds.forEach(id => {
                totalCompleted += (userData[id] || []).length;
                totalLessons += lessonCounts[id];
            });

            const progress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
            progressBar.style.width = progress + '%';
            progressBar.textContent = progress + '%';
            if (progressText) {
                progressText.textContent = `Total lessons completed: ${totalCompleted} / ${totalLessons}`;
            }
        } catch (err) {
            console.error("Error updating progress:", err);
        }
    }
});
