// ===== Firebase Imports (CORRECT LOCATION) =====
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
document.addEventListener('DOMContentLoaded', () => {
    // A. Get all the necessary elements using their IDs
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const darkToggle = document.getElementById('dark-toggle');
    const body = document.body;
    const quoteElement = document.getElementById("trader-quote");
    const signupForm = document.getElementById("signup-form");
    const formMsg = document.getElementById("form-message");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");
    const authIcon = document.getElementById("auth-icon"); // This is from the previous fix, now integrated below
    
    // B. Handle the main menu toggle button
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            menuToggle.classList.toggle("open");
            menuToggle.classList.toggle("close");
        });
    }

    // C. Handle the NEW close button
    if (closeMenuBtn && menu) {
        closeMenuBtn.addEventListener('click', () => {
            menu.classList.remove('active');
            menuToggle.classList.remove("open");
            menuToggle.classList.remove("close");
        });
    }

    // ====== Theme Detection from LocalStorage ======
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
        body.classList.add("dark-mode");
        if (darkToggle) {
            darkToggle.textContent = "☀️";
        }
    } else {
        if (darkToggle) {
            darkToggle.textContent = "🌙";
        }
    }

    // ====== Dark Mode Toggle Button ======
    if (darkToggle) {
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
    }

    // ====== AOS Animation ======
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }

    // ===== Rotating Trader Quotes =====
    const quotes = [
        "Every expert was once a beginner — start your journey today.",
        "Small consistent steps build big trading success.",
        "Mistakes, failure, humiliation, disappointment and rejection are all a part of growth and development.",
        "No one can achieve anything in life without facing all these five things.",
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
        function showNextQuote() {
            quoteElement.style.opacity = 0;
            setTimeout(() => {
                quoteElement.textContent = quotes[currentQuoteIndex];
                quoteElement.style.opacity = 1;
                currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            }, 800);
        }

        showNextQuote();
        setInterval(showNextQuote, 5000);
    }

    // Disable right-click menu silently
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Disable Ctrl+C, Ctrl+U, Ctrl+S, PrintScreen keys silently
    document.addEventListener('keydown', function(e) {
        if (
            (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) ||
            e.key === 'PrintScreen'
        ) {
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

    // ===== Detect Current Page =====
    const currentPage = window.location.pathname.split("/").pop();

    // ===== Signup Logic =====
    if (currentPage === "signup.html" && signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // <-- Email regex

            // --- Client-Side Validation ---
            if (!emailRegex.test(email)) {
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
                formMsg.textContent = "⚠️ Password must contain at least one special character (!@#$%^&*).";
                return;
            }
            
            // If all client-side checks pass, proceed to Firebase
            try {
                // Firebase will perform its own server-side validation here
                await createUserWithEmailAndPassword(auth, email, password);
                formMsg.textContent = "✅ Signup successful! Redirecting to login...";
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                formMsg.textContent = `❌ ${error.message}`;
            }
        });
    }

    // ===== Login Logic =====
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

    // ===== UNIVERSAL AUTHENTICATION LISTENER (FIXED: Handles all pages) =====
    onAuthStateChanged(auth, (user) => {
        // --- Protected Pages Redirection ---
        const protectedPages = ["beginner.html", "technical.html", "advance.html"];
        if (protectedPages.includes(currentPage) && !user) {
            window.location.href = "login.html";
        }

        // --- Logout Button Redirection (for all pages) ---
        // If a user is logged out and the current page is NOT login/signup, redirect them.
        if (!user && currentPage !== "login.html" && currentPage !== "signup.html") {
            window.location.href = "login.html";
        }
        
        // --- Lock/Unlock Icons Logic (for course page only) ---
        if (currentPage === "course.html") {
            const lockIcons = document.querySelectorAll('.course-lock-icon');
            lockIcons.forEach(icon => {
                if (user) {
                    icon.classList.remove("fa-lock", "locked");
                    icon.classList.add("fa-unlock", "unlocked");
                } else {
                    icon.classList.remove("fa-unlock", "unlocked");
                    icon.classList.add("fa-lock", "locked");
                }
            });
        }
    });

    // ===== Logout Button =====
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // This is still the simple, correct logic.
            signOut(auth);
        });
    }
    
    // --- Course Progress and Toggles (Dynamic, Reusable Section) ---
    document.querySelectorAll('.course-container').forEach(courseContainer => {
        const progressBar = courseContainer.querySelector('#progressBar');
        const lessonList = courseContainer.querySelector('.lessonList');
        const courseId = courseContainer.getAttribute('data-course-id');

        if (progressBar && lessonList && courseId) {
            const lessons = lessonList.querySelectorAll('li');
            const totalLessons = lessons.length;
            
            let completedLessonsSet = new Set(JSON.parse(localStorage.getItem(courseId) || '[]'));

            // Apply saved completions on page load
            lessons.forEach((lesson, index) => {
                if (completedLessonsSet.has(index)) {
                    lesson.classList.add('completed');
                }
            });

            function updateProgressBar() {
                const completedCount = completedLessonsSet.size;
                const progress = Math.round((completedCount / totalLessons) * 100);
                
                progressBar.style.width = progress + '%';
                progressBar.textContent = progress + '%';
                
                if (progress < 50) {
                    progressBar.style.backgroundColor = `rgb(255, ${Math.round(progress * 5.1)}, 0)`;
                } else {
                    progressBar.style.backgroundColor = `rgb(${Math.round(255 - (progress - 50) * 5.1)}, 255, 0)`;
                }
            }

            updateProgressBar();

            // Lesson click handler
            lessons.forEach((lesson, index) => {
                lesson.addEventListener('click', () => {
                    if (lesson.classList.contains('completed')) {
                        lesson.classList.remove('completed');
                        completedLessonsSet.delete(index);
                    } else {
                        lesson.classList.add('completed');
                        completedLessonsSet.add(index);
                    }
                    localStorage.setItem(courseId, JSON.stringify(Array.from(completedLessonsSet)));
                    updateProgressBar();
                });
            });
        }
    });

    // Toggle "More" content (Corrected to change button text)
    document.querySelectorAll('.toggle-btn').forEach(button => {
        const moreInfo = document.getElementById(button.dataset.target);
        if (moreInfo) {
            // Hide the content by default on page load
            moreInfo.style.display = 'none';
            // Set initial button text
            button.innerHTML = '<strong>Show More Content</strong>';

            button.addEventListener('click', () => {
                const isHidden = moreInfo.style.display === 'none';
                
                if (isHidden) {
                    moreInfo.style.display = 'block';
                    button.innerHTML = '<strong>Show Less Content</strong>'; // Change text to 'Show Less'
                } else {
                    moreInfo.style.display = 'none';
                    button.innerHTML = '<strong>Show More Content</strong>'; // Change text back to 'Show More'
                }
                
                button.setAttribute('aria-expanded', !isHidden); // Set aria-expanded based on new state
            });
        }
    });

    // --- NEW Combined Progress Meter Logic ---
    function updateCombinedProgressMeter() {
        const progressBar = document.getElementById('combinedProgressBar');
        const progressText = document.getElementById('progressText');
        
        if (!progressBar) return; // Exit if not on the course.html page

        const courseIds = ["beginnerCourse", "technicalCourse", "advanceCourse"];
        
        // IMPORTANT: You MUST update these numbers if you change the number of lessons in each course.
        const lessonCounts = {
            "beginnerCourse": 7,  // Total lessons in beginner.html
            "technicalCourse": 11, // Update this with your actual count
            "advanceCourse": 7    // Update this with your actual count
        };
        
        let totalCompletedLessons = 0;
        let totalLessons = 0;

        courseIds.forEach(courseId => {
            const completed = JSON.parse(localStorage.getItem(courseId) || '[]').length;
            const total = lessonCounts[courseId];
            
            totalCompletedLessons += completed;
            totalLessons += total;
        });
        
        const progress = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;
        
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';
        progressText.textContent = `Total lessons completed: ${totalCompletedLessons} / ${totalLessons}`;
    }

    // Call the new function when the page loads if it's the courses page
    if (currentPage === "course.html") {
        updateCombinedProgressMeter();
    }
});
 
