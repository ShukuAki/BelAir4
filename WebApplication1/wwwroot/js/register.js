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
- additional_lots: JSON / TEXT (array of additional lot addresses for homeowners)

======================================== */

document.addEventListener('DOMContentLoaded', function() {
  
  // ========================================
  // MOBILE DROPDOWN TOGGLE SUPPORT
  // ========================================
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('dropdown-open');
      dropdowns.forEach(d => d.classList.remove('dropdown-open'));
      if (!isOpen) dropdown.classList.add('dropdown-open');
    });
  });

  document.addEventListener('click', (e) => {
    dropdowns.forEach(d => {
      if (!d.contains(e.target)) d.classList.remove('dropdown-open');
    });
  });

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

  // Show/hide conditional fields based on resident type (reserved)
  const residentTypeSelect = document.getElementById('residentType');
  if (residentTypeSelect) {
    residentTypeSelect.addEventListener('change', function() {
      // Reserved for future conditional fields
    });
  }

  // ========================================
  // DYNAMIC ADDRESS ROWS
  // ========================================
  const addressList = document.getElementById('addressList');

  function createAddressRow(placeholder, isFirst) {
    const row = document.createElement('div');
    row.classList.add('address-row');

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'address[]';
    input.placeholder = placeholder || 'e.g., P3 B16, Alpine St., LBA4';
    input.classList.add('address-input');
    if (isFirst) input.required = true;

    const btn = document.createElement('button');
    btn.type = 'button';

    function setAdd() {
      btn.className = 'add-address-btn';
      btn.title = 'Add another address';
      btn.innerHTML = '<i class="fas fa-plus"></i>';
      btn.onclick = function() {
        setRemove();
        const newRow = createAddressRow();
        addressList.appendChild(newRow);
        newRow.querySelector('.address-input').focus();
      };
    }

    function setRemove() {
      btn.className = 'remove-address-btn';
      btn.title = 'Remove this address';
      btn.innerHTML = '<i class="fas fa-minus"></i>';
      btn.onclick = function() {
        row.remove();
        refreshLastButton();
      };
    }

    setAdd();
    row.appendChild(input);
    row.appendChild(btn);
    return row;
  }

  function refreshLastButton() {
    const rows = addressList.querySelectorAll('.address-row');
    rows.forEach((r, i) => {
      const btn = r.querySelector('button');
      if (i < rows.length - 1) {
        btn.className = 'remove-address-btn';
        btn.title = 'Remove this address';
        btn.innerHTML = '<i class="fas fa-minus"></i>';
        btn.onclick = function() {
          r.remove();
          refreshLastButton();
        };
      } else {
        btn.className = 'add-address-btn';
        btn.title = 'Add another address';
        btn.innerHTML = '<i class="fas fa-plus"></i>';
        btn.onclick = function() {
          btn.className = 'remove-address-btn';
          btn.title = 'Remove this address';
          btn.innerHTML = '<i class="fas fa-minus"></i>';
          btn.onclick = function() {
            r.remove();
            refreshLastButton();
          };
          const newRow = createAddressRow();
          addressList.appendChild(newRow);
          newRow.querySelector('.address-input').focus();
        };
      }
    });
  }

  // Initialize the first row
  if (addressList) {
    addressList.innerHTML = '';
    addressList.appendChild(createAddressRow('e.g., P3 B15, Alpine St., LBA4', true));
  }

  // File upload display
  const fileInput = document.getElementById('proofOfResidency');
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      const fileNameDisplay = document.getElementById('fileNameDisplay');
      if (this.files.length > 0) {
        const fileName = this.files[0].name;
        const fileSize = (this.files[0].size / 1024 / 1024).toFixed(2);
        fileNameDisplay.innerHTML = `<i class="fas fa-file-alt"></i> ${fileName} (${fileSize} MB)`;
      } else {
        fileNameDisplay.innerHTML = '';
      }
    });
  }

  // Form validation (client-side only, let server handle submission)
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      // Get form values for validation
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const termsAgreement = document.getElementById('termsAgreement').checked;
      const proofOfResidency = document.getElementById('proofOfResidency').files[0];

      // Validate passwords match
      if (password !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match. Please try again.');
        return;
      }

      // Validate password strength (minimum 8 characters)
      if (password.length < 8) {
        e.preventDefault();
        alert('Password must be at least 8 characters long.');
        return;
      }

      // Validate terms agreement
      if (!termsAgreement) {
        e.preventDefault();
        alert('Please confirm that the information provided is true and accurate.');
        return;
      }

      // Validate file upload
      console.log('File input element:', document.getElementById('proofOfResidency'));
      console.log('Files array:', document.getElementById('proofOfResidency')?.files);
      console.log('First file:', proofOfResidency);

      if (!proofOfResidency) {
        e.preventDefault();
        alert('Please upload proof of residency.');
        return;
      }

      // Validate file size (max 5MB)
      if (proofOfResidency.size > 5 * 1024 * 1024) {
        e.preventDefault();
        alert('File size must be less than 5MB.');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(proofOfResidency.type)) {
        e.preventDefault();
        alert('Only JPG, PNG, and PDF files are allowed.');
        return;
      }

      // Validate all address fields are filled
      const addressInputs = document.querySelectorAll('.address-input');
      for (let input of addressInputs) {
        if (!input.value.trim()) {
          e.preventDefault();
          alert('Please fill in all address fields, or remove empty ones.');
          input.focus();
          return;
        }
      }

      // Let the form submit normally to the server
    });
  }

  // Mobile number formatting (optional enhancement)
  const mobileInput = document.getElementById('mobile');
  if (mobileInput) {
    mobileInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      e.target.value = value;
    });
  }

  // Set current year in footer
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Add active class to current page
  function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
    
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPath ||
          (currentPath.includes('register') && linkHref === 'register.html') ||
          (currentPath === '/' && linkHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  setActiveNav();

  console.log('%c Registration Page Loaded ✓', 'color:#0a4d3c;font-weight:bold');
});