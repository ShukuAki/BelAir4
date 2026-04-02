// ========================================
// ANNOUNCEMENTS PAGE JAVASCRIPT
// ========================================
// Wait for DOM to fully load before running scripts
document.addEventListener('DOMContentLoaded', function() {
// ========================================
// SET CURRENT YEAR IN FOOTER
// ========================================
const currentYearEl = document.getElementById('current-year');
if (currentYearEl) {
currentYearEl.textContent = new Date().getFullYear();
}

// ========================================
// NAVIGATION LINKS FUNCTIONALITY
// ========================================
const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
navLinks.forEach(link => {
link.addEventListener('click', function(e) {
// Only prevent default for dropdown toggles (links with #)
const href = this.getAttribute('href');
if (href === '#') {
e.preventDefault();
}
// Let all other links navigate normally
});
});

// ========================================
// DROPDOWN TOGGLE SPECIFIC HANDLING
// ========================================
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
dropdownToggles.forEach(toggle => {
toggle.addEventListener('click', function(e) {
e.preventDefault(); // Prevent navigation for dropdown toggles only
});
});

// ========================================
// READ MORE BUTTON FUNCTIONALITY
// ========================================
const readMoreButtons = document.querySelectorAll('.read-more');
readMoreButtons.forEach(button => {
button.addEventListener('click', function(e) {
e.preventDefault();
const cardTitle = this.closest('.announcement-card').querySelector('h2').textContent;
alert('Viewing details for: ' + cardTitle);
// In real app: navigate to detailed page
});
});

// ========================================
// HOVER EFFECT ENHANCEMENT FOR CARDS
// ========================================
const announcementCards = document.querySelectorAll('.announcement-card');
announcementCards.forEach(card => {
card.addEventListener('mouseenter', function() {
this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
});
card.addEventListener('mouseleave', function() {
this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
});
});

// ========================================
// ADD ACTIVE CLASS TO CURRENT PAGE
// ========================================
function setActiveNav() {
const currentPath = window.location.pathname;
navLinks.forEach(link => {
const linkHref = link.getAttribute('href');
if (linkHref === currentPath ||
(currentPath.includes('announcement') && linkHref === 'announcement.html') ||
(currentPath === '/' && linkHref === 'index.html')) {
link.classList.add('active');
}
});
}
// Call the function to set active navigation
setActiveNav();
});