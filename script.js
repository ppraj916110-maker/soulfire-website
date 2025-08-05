document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const darkToggle = document.getElementById('dark-toggle');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    darkToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  });

  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // AOS Init
  AOS.init();

  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  const darkToggle = document.getElementById("dark-toggle");

  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    // Optionally save preference in localStorage
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // Load dark mode from preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});
