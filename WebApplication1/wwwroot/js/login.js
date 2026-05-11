/* ========================================
TOGGLE PASSWORD VISIBILITY
======================================== */
document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
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

/* ========================================
USER DATABASE
Email-based detection for auto-redirect
======================================== */
const userDatabase = {
    // MEMBERS - redirect to index.html (public homepage)
    "member0@gmail.com": { password: "member123", type: "member", redirect: "index.html" },
    "resident@example.com": { password: "resident123", type: "member", redirect: "index.html" },
    "juan.dela.cruz@example.com": { password: "juan123", type: "member", redirect: "index.html" },
    "maria.santos@example.com": { password: "maria123", type: "member", redirect: "index.html" },
    "pedro.reyes@example.com": { password: "pedro123", type: "member", redirect: "index.html" },
    
    // STAFF - redirect to staff-dashboard.html
    "staff0@gmail.com": { password: "staff123", type: "staff", redirect: "staff-dashboard.html" },
    "staff@lba4.com": { password: "staff123", type: "staff", redirect: "staff-dashboard.html" },
    "hoa.staff@lba4.com": { password: "staff123", type: "staff", redirect: "staff-dashboard.html" },
    "security@lba4.com": { password: "staff123", type: "staff", redirect: "staff-dashboard.html" },
    "maintenance@lba4.com": { password: "staff123", type: "staff", redirect: "staff-dashboard.html" },
    
    // ADMIN - redirect to admin-dashboard.html
    "admin0@gmail.com": { password: "admin", type: "admin", redirect: "admin-dashboard.html" },
    "admin@lba4.com": { password: "admin123", type: "admin", redirect: "admin-dashboard.html" },
    "president@lba4.com": { password: "president123", type: "admin", redirect: "admin-dashboard.html" },
    "hoa.admin@lba4.com": { password: "admin123", type: "admin", redirect: "admin-dashboard.html" }
};

/* ========================================
LOGIN VALIDATION AND AUTO-DETECT REDIRECT
======================================== */
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Post to server-side login endpoint
    try {
        const token = document.querySelector('input[name="__RequestVerificationToken"]').value;
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await fetch('/login', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'RequestVerificationToken': token
            },
            body: formData.toString()
        });

        if (res.redirected) {
            window.location.href = res.url;
            return;
        }

        if (res.status === 200) {
            // assume login succeeded and server redirected
            window.location.reload();
            return;
        }

        // fallback to show error
        showError('Login failed. Please check your credentials.');
    } catch (err) {
        showError('Login error. Please try again later.');
    }
});

/* ========================================
ERROR MESSAGE DISPLAY
======================================== */
function showError(message) {
    // Remove existing error if any
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background-color: #fee;
        color: #c0392b;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-left: 4px solid #c0392b;
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert error at top of login form
    const loginForm = document.getElementById('loginForm');
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

/* ========================================
REMEMBER ME FUNCTIONALITY
======================================== */
document.addEventListener('DOMContentLoaded', function() {
    // Check for remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const emailInput = document.getElementById('email');
        const rememberCheckbox = document.querySelector('input[name="remember"]');
        if (emailInput && rememberCheckbox) {
            emailInput.value = rememberedEmail;
            rememberCheckbox.checked = true;
        }
    }
    
    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});