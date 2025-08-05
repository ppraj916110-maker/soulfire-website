// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  const darkToggle = document.getElementById("dark-toggle");
  const body = document.body;

  // ====== Slide Menu Toggle ======
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    menuToggle.classList.toggle("open");
  });

  // ====== Dark Mode Toggle ======
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    body.classList.add("dark-mode");
  }

  darkToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // ====== AOS Initialization ======
  AOS.init({
    duration: 1000,
    once: true,
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const message = document.getElementById("form-message");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent actual form submission

    // Basic validation
    if (!name.value || !email.value || !password.value || !confirmPassword.value) {
      message.textContent = "Please fill in all fields.";
      message.style.color = "red";
      return;
    }

    // Email format validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.value.match(emailPattern)) {
      message.textContent = "Invalid email format.";
      message.style.color = "red";
      return;
    }

    // Password match
    if (password.value !== confirmPassword.value) {
      message.textContent = "Passwords do not match.";
      message.style.color = "red";
      return;
    }

    // Password length
    if (password.value.length < 6) {
      message.textContent = "Password must be at least 6 characters.";
      message.style.color = "red";
      return;
    }

    // If all good
    message.textContent = "Signup successful (demo only).";
    message.style.color = "green";

    // Here you can send data to backend (see Part 2)
  });
});
