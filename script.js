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
  const message = document.getElementById("form-message");
  const darkToggle = document.getElementById("dark-toggle");

  // Dark Mode Toggle
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // Form Validation and Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;
    const terms = document.getElementById("terms").checked;

    if (!name || !email || !password || !confirm) {
      message.textContent = "Please fill in all fields.";
      return;
    }

    if (password.length < 6) {
      message.textContent = "Password must be at least 6 characters.";
      return;
    }

    if (password !== confirm) {
      message.textContent = "Passwords do not match.";
      return;
    }

    if (!terms) {
      message.textContent = "You must agree to the terms.";
      return;
    }

    // Simulate success
    showSuccessScreen();
  });

  function showSuccessScreen() {
    document.querySelector("main").innerHTML = `
      <div class="success-screen" data-aos="zoom-in">
        <h2>✅ Signup Successful!</h2>
        <p>Thank you for joining Trading Ek Mission.</p>
        <p>Check your email to verify your account.</p>
      </div>
    `;
  }
});
