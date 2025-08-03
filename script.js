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
            alert('Form submitted successfully! (This would be sent to the server)');
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
