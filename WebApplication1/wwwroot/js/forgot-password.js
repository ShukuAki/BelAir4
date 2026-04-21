/* ========================================
USER DATABASE (Same as login.js)
======================================== */
const userDatabase = {
    // MEMBERS - redirect to index.html
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

// Store temporary reset data
let pendingResetEmail = null;

/* ========================================
TOGGLE PASSWORD VISIBILITY
======================================== */
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
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

/* ========================================
STEP 1: REQUEST RESET
======================================== */
document.getElementById('requestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim().toLowerCase();
    
    // Check if email exists in database
    if (userDatabase[email]) {
        // Store email for reset
        pendingResetEmail = email;
        
        // Show step 2 (reset password form)
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        
        // Display email in reset form
        document.getElementById('resetEmailDisplay').innerHTML = `Resetting password for: <strong>${email}</strong>`;
        
        // Clear any existing error messages
        removeMessages();
    } else {
        showError('Email address not found. Please check your email or register for an account.');
    }
});

/* ========================================
STEP 2: RESET PASSWORD
======================================== */
document.getElementById('resetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password length
    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long.');
        return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match. Please try again.');
        return;
    }
    
    // Update password in database
    if (pendingResetEmail && userDatabase[pendingResetEmail]) {
        userDatabase[pendingResetEmail].password = newPassword;
        
        // Log the update (for demo purposes)
        console.log(`Password updated for ${pendingResetEmail}: ${newPassword}`);
        
        // Show success message
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        
        // Clear pending reset
        pendingResetEmail = null;
        
        // Clear form fields
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
});

/* ========================================
ERROR MESSAGE DISPLAY
======================================== */
function showError(message) {
    // Remove existing messages
    removeMessages();
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert error at top of active form
    const activeStep = document.querySelector('.step-content.active');
    const form = activeStep.querySelector('form');
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    // Remove existing messages
    removeMessages();
    
    // Create success element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Insert success at top of active form
    const activeStep = document.querySelector('.step-content.active');
    const form = activeStep.querySelector('form');
    if (form) {
        form.insertBefore(successDiv, form.firstChild);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
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

/* ========================================
BACK TO LOGIN (Preserve email if available)
======================================== */
// The back links in HTML already handle navigation

/* ========================================
SET CURRENT YEAR IN FOOTER
======================================== */
document.addEventListener('DOMContentLoaded', function() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Set active nav class for current page
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

/* ========================================
DEMO: LIST OF REGISTERED EMAILS (for testing)
======================================== */
console.log('=== FORGOT PASSWORD DEMO ===');
console.log('Registered emails for testing:');
console.log('Members: member0@gmail.com, resident@example.com, juan.dela.cruz@example.com');
console.log('Staff: staff0@gmail.com, staff@lba4.com');
console.log('Admin: admin0@gmail.com, admin@lba4.com, president@lba4.com');
console.log('Default passwords: member123, staff123, admin123');
console.log('===============================');