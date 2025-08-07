document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  const darkToggle = document.getElementById("dark-toggle");
  const body = document.body;

  // ====== Slide Menu Toggle ======
  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      menuToggle.classList.toggle("open");
      menuToggle.classList.toggle("close");
    });
  }

  // ====== Theme Detection from LocalStorage ======
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    body.classList.add("dark-mode");
    darkToggle.textContent = "☀️";
  } else {
    darkToggle.textContent = "🌙";
  }

  // ====== Dark Mode Toggle Button ======
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

  // ====== AOS Animation ======
  AOS.init({
    duration: 1000,
    once: true,
  });
