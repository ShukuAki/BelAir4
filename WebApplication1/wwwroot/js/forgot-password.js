// Forgot password flow: validates on the server via a POST request.

let pendingResetEmail = null;

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const icon = this.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Step 1: capture the email and advance to the reset form.
document.getElementById('requestForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value.trim().toLowerCase();
    if (!email) {
        showError('Please enter your email address.');
        return;
    }

    pendingResetEmail = email;

    const hiddenEmail = document.getElementById('resetEmailField');
    if (hiddenEmail) hiddenEmail.value = email;

    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');

    document.getElementById('resetEmailDisplay').textContent = `Resetting password for: ${email}`;

    removeMessages();
});

// Step 2: submit the new password to the server over POST.
document.getElementById('resetForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long.');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('Passwords do not match. Please try again.');
        return;
    }

    try {
        const tokenInput = this.querySelector('input[name="__RequestVerificationToken"]');
        const token = tokenInput ? tokenInput.value : '';

        const formData = new URLSearchParams();
        formData.append('email', pendingResetEmail || document.getElementById('resetEmailField').value);
        formData.append('newPassword', newPassword);
        formData.append('confirmPassword', confirmPassword);

        const res = await fetch('/forgotpassword', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'RequestVerificationToken': token
            },
            body: formData.toString()
        });

        if (res.ok) {
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');

            pendingResetEmail = null;
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            return;
        }

        let message = 'Unable to reset password. Please try again.';
        try {
            const data = await res.json();
            if (data && data.message) message = data.message;
        } catch (parseErr) {
            // response was not JSON; keep the default message
        }
        showError(message);
    } catch (err) {
        showError('Reset error. Please try again later.');
    }
});

function showError(message) {
    removeMessages();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';

    const icon = document.createElement('i');
    icon.className = 'fas fa-exclamation-circle';
    const span = document.createElement('span');
    span.textContent = message;
    errorDiv.appendChild(icon);
    errorDiv.appendChild(span);

    const activeStep = document.querySelector('.step-content.active');
    const form = activeStep.querySelector('form');
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
    }

    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function removeMessages() {
    const activeStep = document.querySelector('.step-content.active');
    if (activeStep) {
        const existingError = activeStep.querySelector('.error-message');
        const existingSuccess = activeStep.querySelector('.success-message');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    setActiveNav();
});

function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPath ||
            (currentPath.includes('forgot-password') && linkHref === 'forgot-password.html') ||
            (currentPath === '/' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}
