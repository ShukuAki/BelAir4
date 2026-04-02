// ========================================
// RESERVE AMENITIES PAGE JAVASCRIPT
// ========================================
document.addEventListener('DOMContentLoaded', function() {
// ========================================
// SET CURRENT YEAR IN FOOTER
// ========================================
const currentYearEl = document.getElementById('current-year');
if (currentYearEl) {
currentYearEl.textContent = new Date().getFullYear();
}

// ========================================
// SET MINIMUM DATE TO TODAY
// ========================================
const today = new Date().toISOString().split('T')[0];
const dateInput = document.getElementById('reservationDate');
if (dateInput) {
dateInput.setAttribute('min', today);
}
});

// ========================================
// FUNCTION TO SELECT AMENITY AND SHOW FORM
// ========================================
function selectAmenity(amenityName) {
// Set the selected amenity in the form
document.getElementById('selectedAmenity').value = amenityName;
// Show the form
const formContainer = document.getElementById('reservationForm');
formContainer.classList.add('active');
// Smooth scroll to the form
formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// FUNCTION TO HANDLE FORM SUBMISSION
// ========================================
function handleSubmit(event) {
event.preventDefault();
// Get form values
const amenity = document.getElementById('selectedAmenity').value;
const date = document.getElementById('reservationDate').value;
const startTime = document.getElementById('startTime').value;
const endTime = document.getElementById('endTime').value;
const purpose = document.getElementById('purpose').value;
const notes = document.getElementById('additionalNotes').value;
const agreed = document.getElementById('agreeTerms').checked;
// Validate checkbox
if (!agreed) {
showToast('Please agree to the terms and conditions.', 'error');
return;
}
// Display success message
showToast(`Reservation Request Submitted!
Amenity: ${amenity}
Date: ${date}
Time: ${startTime} - ${endTime}
Purpose: ${purpose}
Your reservation request has been submitted and is pending HOA approval.`, 'success');
// Reset form
document.getElementById('amenityReservationForm').reset();
document.getElementById('reservationForm').classList.remove('active');
// Scroll back to top
window.scrollTo({ top: 0, behavior: 'smooth' });
// Log form data (in real app, send to server)
console.log('Reservation Data:', {
amenity: amenity,
date: date,
startTime: startTime,
endTime: endTime,
purpose: purpose,
notes: notes
});
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'info') {
const existing = document.querySelector('.lba4-toast');
if (existing) existing.remove();
const icons = {
info: 'fa-circle-info',
success: 'fa-circle-check',
warn: 'fa-triangle-exclamation',
error: 'fa-circle-xmark'
};
const colors = {
info: '#0a4d3c',
success: '#5aaa4f',
warn: '#d97706',
error: '#c0392b'
};
const toast = document.createElement('div');
toast.className = 'lba4-toast';
toast.setAttribute('role', 'alert');
toast.style.cssText = `
position: fixed;
bottom: 32px;
left: 50%;
transform: translateX(-50%) translateY(16px);
background: ${colors[type]};
color: white;
padding: 13px 22px;
border-radius: 10px;
font-family: var(--font-body, sans-serif);
font-size: 14px;
font-weight: 500;
display: flex;
align-items: center;
gap: 10px;
box-shadow: 0 8px 32px rgba(0,0,0,.22);
z-index: 9999;
max-width: 90vw;
opacity: 0;
transition: opacity .25s, transform .25s;
white-space: pre-line;
`;
toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
document.body.appendChild(toast);
// Animate in
requestAnimationFrame(() => {
toast.style.opacity = '1';
toast.style.transform = 'translateX(-50%) translateY(0)';
});
// Auto remove
setTimeout(() => {
toast.style.opacity = '0';
toast.style.transform = 'translateX(-50%) translateY(10px)';
setTimeout(() => toast.remove(), 300);
}, 5000);
}