/* ========================================
SYSTEM NOTES (For Backend Implementation)
======================================== 

Registration Status Flow:
1. When user submits form, set status to "Pending"
2. Admin/Staff can review and change status to:
   - "Approved" (user can now login)
   - "Rejected" (user cannot login, may need to reapply)
3. Users with "Pending" or "Rejected" status cannot log in
4. Send email notification when status changes

Database Fields Suggested:
- registration_status: ENUM('pending', 'approved', 'rejected')
- registration_date: TIMESTAMP
- approval_date: TIMESTAMP (nullable)
- approved_by: INT (staff/admin user ID, nullable)
- rejection_reason: TEXT (nullable, for admin notes)

======================================== */

// Toggle password visibility
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

// Show/hide landlord field based on resident type
document.getElementById('residentType').addEventListener('change', function() {
    const landlordField = document.getElementById('landlordField');
    if (this.value === 'tenant') {
        landlordField.classList.add('show');
    } else {
        landlordField.classList.remove('show');
        document.getElementById('landlordName').value = ''; // Clear field if not tenant
    }
});

// File upload display
document.getElementById('proofOfResidency').addEventListener('change', function() {
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (this.files.length > 0) {
        const fileName = this.files[0].name;
        const fileSize = (this.files[0].size / 1024 / 1024).toFixed(2); // Convert to MB
        fileNameDisplay.innerHTML = `<i class="fas fa-file-alt"></i> ${fileName} (${fileSize} MB)`;
    } else {
        fileNameDisplay.innerHTML = '';
    }
});

// Form validation and submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAgreement = document.getElementById('termsAgreement').checked;
    const proofOfResidency = document.getElementById('proofOfResidency').files[0];

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    // Validate terms agreement
    if (!termsAgreement) {
        alert('Please confirm that the information provided is true and accurate.');
        return;
    }

    // Validate file upload
    if (!proofOfResidency) {
        alert('Please upload proof of residency.');
        return;
    }

    // Validate file size (max 5MB)
    if (proofOfResidency.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(proofOfResidency.type)) {
        alert('Only JPG, PNG, and PDF files are allowed.');
        return;
    }

    // Collect form data
    const formData = new FormData(this);

    // Log form data (for development)
    console.log('Registration Data:');
    for (let [key, value] of formData.entries()) {
        if (key !== 'password' && key !== 'confirmPassword') {
            console.log(`${key}: ${value}`);
        }
    }

    /* 
    Backend Implementation Notes:
    1. Set registration_status to 'pending' by default
    2. Store the uploaded file securely
    3. Send confirmation email to user
    4. Notify admin/staff of new registration
    5. Do NOT allow login until status is 'approved'
    */

    // Show success message and hide form
    document.querySelector('.register-form').style.display = 'none';
    document.getElementById('successMessage').classList.add('show');

    // Scroll to success message
    document.getElementById('successMessage').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });

    // In production, this would be an AJAX call to your backend
    // Example:
    /*
    fetch('/api/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector('.register-form').style.display = 'none';
            document.getElementById('successMessage').classList.add('show');
        } else {
            alert('Registration failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
    */
});

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Mobile number formatting (optional enhancement)
document.getElementById('mobile').addEventListener('input', function(e) {
    // Remove all non-numeric characters
    let value = e.target.value.replace(/\D/g, '');
    // Limit to 11 digits
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    e.target.value = value;
});