// ========================================
// ADVERTISEMENTS PAGE JAVASCRIPT
// ========================================
// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
// Header elements
const dropdowns = document.querySelectorAll('.dropdown');
const currentYearEl = document.getElementById('current-year');

// ========================================
// INITIALIZATION FUNCTION
// ========================================
function init() {
// Set current year in footer
if (currentYearEl) {
currentYearEl.textContent = new Date().getFullYear();
}
// Set up event listeners
setupEventListeners();
}

// ========================================
// EVENT LISTENERS SETUP
// ========================================
function setupEventListeners() {
// Handle dropdown click for mobile/touch devices
dropdowns.forEach(dropdown => {
const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
dropdownToggle.addEventListener('click', function(e) {
// Prevent default link behavior
e.preventDefault();
// Toggle dropdown menu on click (for mobile/touch)
const isDropdownOpen = dropdown.classList.contains('dropdown-open');
// Close all other dropdowns
dropdowns.forEach(otherDropdown => {
otherDropdown.classList.remove('dropdown-open');
});
// Toggle current dropdown
if (!isDropdownOpen) {
dropdown.classList.add('dropdown-open');
}
});
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
dropdowns.forEach(dropdown => {
if (!dropdown.contains(e.target)) {
dropdown.classList.remove('dropdown-open');
}
});
});
}

// ========================================
// CALL INITIALIZATION
// ========================================
init();
});