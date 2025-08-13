// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // ----- UI Elements -----
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const darkToggle = document.getElementById("dark-toggle");
  const body = document.body;
  const quoteEl = document.getElementById("trader-quote"); // optional
  const logoutBtn = document.getElementById("logout-btn");

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
    AOS.init({ duration: 800, once: true });
  }

  // ----- Rotating Quotes (optional) -----
  const quotes = [
    "Every expert was once a beginner — start your journey today.",
    "Small consistent steps build big trading success.",
    "In trading, patience is not just a virtue — it’s a profit strategy.",
    "Learn before you earn — the market rewards preparation.",
    "A disciplined trader turns losses into lessons."
  ];
  if (quoteEl) {
    let qi = 0;
    const showQuote = () => {
      quoteEl.style.opacity = 0;
      setTimeout(() => {
        quoteEl.textContent = quotes[qi];
        quoteEl.style.opacity = 1;
        qi = (qi + 1) % quotes.length;
      }, 600);
    };
    showQuote();
    setInterval(showQuote, 5000);
  }

  // ----- Disable Right Click + Common Copy Shortcuts -----
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey && ["c", "u", "s"].includes(e.key.toLowerCase())) || e.key === "PrintScreen") {
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
  try { getAnalytics(app); } catch (e) { /* analytics may fail in some envs */ }
  const auth = getAuth(app);
  const db = getFirestore(app);

  const currentPage = window.location.pathname.split("/").pop();

  // ----- Slide Toggle for arbitrary toggles (used for lesson extra content too) -----
  // Generic show/hide for elements that have id referenced by data-target attribute
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    const targetId = btn.dataset.target;
    const target = document.getElementById(targetId);
    if (!target) return;

    // If target is a lessonList, start hidden via class
    if (target.classList.contains("lessonList")) {
      target.classList.remove("show");
      btn.innerHTML = "<strong>Show More Content</strong>";
    } else {
      // generic toggle-content
      target.style.display = "none";
      btn.innerHTML = "<strong>Show More Content</strong>";
    }

    btn.addEventListener("click", () => {
      // If lessonList use show class for slide animation, else toggle display
      if (target.classList.contains("lessonList")) {
        const willShow = !target.classList.contains("show");
        target.classList.toggle("show", willShow);
        btn.innerHTML = `<strong>${willShow ? "Show Less" : "Show More"} Content</strong>`;
        btn.setAttribute("aria-expanded", willShow);
        if (willShow) target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        const isHidden = target.style.display === "none";
        target.style.display = isHidden ? "block" : "none";
        btn.innerHTML = `<strong>${isHidden ? "Show Less" : "Show More"} Content</strong>`;
        btn.setAttribute("aria-expanded", isHidden);
        if (isHidden) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ----- Update Progress (dynamic: reads lesson counts from DOM) -----
  async function updateProgress(uid) {
    const combinedBar = document.getElementById("combinedProgressBar");
    const progressText = document.getElementById("progressText");

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      let totalCompleted = 0;
      let totalLessons = 0;

      // For each course-container on the page
      const courseContainers = document.querySelectorAll(".course-container");
      courseContainers.forEach(container => {
        const courseId = container.getAttribute("data-course-id");
        const lessonList = container.querySelector(".lessonList");
        const lessons = lessonList ? lessonList.querySelectorAll("li") : [];
        const lessonCount = lessons.length;
        const completedCount = (userData[courseId] || []).length;

        totalCompleted += completedCount;
        totalLessons += lessonCount;

        // Update individual course progress UI if present
        const bar = document.getElementById(`${courseId}ProgressBar`);
        const text = document.getElementById(`${courseId}ProgressText`);
        if (bar) {
          const percent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
          bar.style.transition = "width 0.45s ease";
          bar.style.width = percent + "%";
          bar.textContent = percent + "%";
        }
        if (text) {
          text.textContent = `Completed: ${completedCount} / ${lessonCount}`;
        }
      });

      // Update combined
      const combinedPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
      if (combinedBar) {
        combinedBar.style.transition = "width 0.45s ease";
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

  // ----- Attach lesson click handlers and initialize lesson states -----
  // We'll set up handlers when user is authenticated to avoid anonymous writes
  onAuthStateChanged(auth, async (user) => {
    // If protected pages should require login, redirect
    const protectedPages = ["beginner.html", "technical.html", "advance.html"];
    if (!user && protectedPages.includes(currentPage)) {
      window.location.href = "login.html";
      return;
    }

    // Show/hide logout
    if (logoutBtn) logoutBtn.style.display = user ? "block" : "none";

    // Lock/unlock course icons if present
    document.querySelectorAll(".course-lock-icon").forEach(icon => {
      icon.classList.toggle("fa-lock", !user);
      icon.classList.toggle("locked", !user);
      icon.classList.toggle("fa-unlock", !!user);
      icon.classList.toggle("unlocked", !!user);
    });

    // If user logged in and we're on course page(s), set listeners
    if (user) {
      // For each course container on this page, attach handlers
      const courseContainers = document.querySelectorAll(".course-container");
      for (const container of courseContainers) {
        const lessonList = container.querySelector(".lessonList");
        if (!lessonList) continue;
        const courseId = container.getAttribute("data-course-id");
        const lessons = lessonList.querySelectorAll("li");
        const userRef = doc(db, "users", user.uid);

        // fetch user data once per container to initialize
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        let completedSet = new Set(userData[courseId] || []);

        // Initialize completed classes for existing lessons
        lessons.forEach((lesson, index) => {
          // support either data-lesson-index or fallback to index
          const idx = (lesson.dataset && lesson.dataset.lessonIndex !== undefined) ? lesson.dataset.lessonIndex.toString() : index.toString();
          if (completedSet.has(idx)) lesson.classList.add("completed");
          else lesson.classList.remove("completed");
          // Add cursor for interactivity
          lesson.style.cursor = "pointer";
        });

        // Use delegated click on lessonList to avoid adding many listeners
        // Remove existing listener if already added (defensive)
        // We'll use a WeakMap to mark we've attached a listener to this element
      }

      // Attach delegated listeners (single global per page) - avoids duplicates
      if (!document.__lessonsDelegated) {
        document.addEventListener("click", async (e) => {
          const li = e.target.closest(".lessonList li");
          if (!li) return;
          const lessonList = li.closest(".lessonList");
          if (!lessonList) return;
          const container = lessonList.closest(".course-container") || document.querySelector(".course-container[data-course-id]") || document.querySelector("[data-course-id]");
          if (!container) return;
          const courseId = container.getAttribute("data-course-id") || container.dataset.courseId;
          if (!courseId) return;

          // ensure user is still signed in
          const currentUser = auth.currentUser;
          if (!currentUser) {
            // optionally show a message or redirect
            window.location.href = "login.html";
            return;
          }

          // determine index (prefer data-lesson-index)
          const index = (li.dataset && li.dataset.lessonIndex !== undefined) ? li.dataset.lessonIndex.toString()
                        : Array.from(lessonList.children).indexOf(li).toString();

          try {
            const userRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(userRef);
            const userData = docSnap.exists() ? docSnap.data() : {};
            let completedSet = new Set(userData[courseId] || []);

            // toggle class & set
            li.classList.toggle("completed");
            if (li.classList.contains("completed")) completedSet.add(index);
            else completedSet.delete(index);

            // write back to Firestore (overwrite user's doc with updated course field)
            await setDoc(userRef, { ...userData, [courseId]: Array.from(completedSet) });

            // update progress (both per-course and combined)
            await updateProgress(currentUser.uid);
          } catch (err) {
            console.error("Error toggling lesson completion:", err);
          }
        });

        document.__lessonsDelegated = true;
      }

      // After setting handlers, do an initial progress update
      if (currentPage === "course.html" || currentPage === "beginner.html" || currentPage === "index.html") {
        await updateProgress(user.uid);
      }
    } else {
      // Not logged in: still update progress UI with zero or available info
      // Try to update progress with no uid (will show zeros)
      const combinedBar = document.getElementById("combinedProgressBar");
      const progressText = document.getElementById("progressText");
      if (combinedBar) { combinedBar.style.width = "0%"; combinedBar.textContent = "0%"; }
      if (progressText) { progressText.textContent = `Total lessons completed: 0 / 0`; }
      // Also update per-course bars based on DOM counts (0 completed)
      document.querySelectorAll(".course-container").forEach(container => {
        const courseId = container.getAttribute("data-course-id");
        const lessonList = container.querySelector(".lessonList");
        const lessons = lessonList ? lessonList.querySelectorAll("li") : [];
        const lessonCount = lessons.length;
        const bar = document.getElementById(`${courseId}ProgressBar`);
        const text = document.getElementById(`${courseId}ProgressText`);
        if (bar) { bar.style.width = "0%"; bar.textContent = "0%"; bar.style.transition = "width 0.45s ease"; }
        if (text) text.textContent = `Completed: 0 / ${lessonCount}`;
      });
    }
  });

  // ----- Logout -----
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => signOut(auth).catch(e => console.error(e)));
  }

  // ----- Ensure lessonLists for pages without .course-container (e.g., beginner.html structured differently) -----
  // If your beginner.html uses main[data-course-id] or direct .lessonList without course-container, support that as well:
  // (we will not duplicate listeners; the delegated click handles li in any .lessonList on the page)

  // --- End DOMContentLoaded ---
});
