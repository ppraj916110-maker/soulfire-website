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
        "Mistakes, failure, humiliation, disappointment and rejection are all a part of growth and development.";
        "No one can achieve anything in life without facing all these five things.✌️";
        "Small consistent steps build big trading success.",
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

    // ===== Auth Protection for Multiple Pages =====
    const protectedPages = ["beginner.html", "technical.html", "advance.html"];
    if (protectedPages.includes(currentPage)) {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = "login.html";
            }
        });
    }

    // ===== Logout Button =====
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => window.location.href = "login.html");
        });
    }
    
    // ===== Toggle Content Logic (Site-wide) =====
   const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
        const moreInfo = document.getElementById(button.dataset.target);

        // Initially hide the content
        moreInfo.style.display = 'none';

        button.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !isExpanded);
            
            if (moreInfo.style.display === 'none') {
                moreInfo.style.display = 'block';
                this.innerHTML = '<strong>Show Less Content</strong>';
            } else {
                moreInfo.style.display = 'none';
                this.innerHTML = '<strong>Show More Content</strong>';
            }
        });
    });
});   // <-- End of DOMContentLoaded
