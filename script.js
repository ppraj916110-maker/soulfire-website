// JavaScript Enhancements for Trading Ek Mission Website

document.addEventListener("DOMContentLoaded", function () {
  // Smooth scroll behavior for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Title bar close functionality
  const closeBtn = document.querySelector(".close");
  const titleBar = document.querySelector(".title-bar");
  closeBtn?.addEventListener("click", () => {
    titleBar.classList.add("slide-out");
  });

  // Dark Mode Toggle
  const darkToggle = document.querySelector(".dark-toggle");
  darkToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // Initialize AOS animations
  AOS.init({
    duration: 1000,
    once: true,
  });
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const termsCheckbox = document.getElementById('terms');

    // Event listener for form submission
    form.addEventListener('submit', function (event) {
        // Prevent the form from submitting immediately
        event.preventDefault();
        
        // Reset all error messages
        resetErrors();

        // Perform validation
        const isFormValid = validateForm();

        // If the form is valid, you can proceed to submit it
        if (isFormValid) {
            alert('Form submitted successfully!');
            // In a real application, you would use form.submit() or an AJAX request here
            // form.submit();
        }
    });

    function validateForm() {
        let isValid = true;

        // Username validation
        if (usernameInput.value.trim() === '') {
            showError('usernameError', 'Username is required.');
            isValid = false;
        }

        // Email validation
        if (!validateEmail(emailInput.value)) {
            showError('emailError', 'Please enter a valid email address.');
            isValid = false;
        }

        // Password validation
        if (passwordInput.value.length < 8) {
            showError('passwordError', 'Password must be at least 8 characters long.');
            isValid = false;
        }

        // Confirm password validation
        if (confirmPasswordInput.value !== passwordInput.value) {
            showError('confirmPasswordError', 'Passwords do not match.');
            isValid = false;
        }

        // Terms and conditions validation
        if (!termsCheckbox.checked) {
            alert('You must agree to the Terms and Conditions.');
            isValid = false;
        }

        return isValid;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function showError(id, message) {
        const errorElement = document.getElementById(id);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function resetErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.textContent = '');
    }
});
