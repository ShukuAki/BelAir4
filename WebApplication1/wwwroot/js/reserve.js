// ========================================
// RESERVE AMENITIES PAGE JAVASCRIPT
// Single column layout with popup calendar
// Colors: Green=Available, Orange=Your Pending, Red=Your Approved, Gray=Unavailable
// ========================================

// Configuration
const MAX_BOOKING_DAYS = 14;
const MAX_RESERVATIONS_PER_DAY = 2;
const CURRENT_USER = window.CURRENT_USER || '';
const EARLIEST_BOOKING_TIME = '10:30';

// In-memory cache of reservations loaded from the server
let RESERVATIONS = [];

// Time slots (30-minute increments from 10:30 AM to 8 PM)
const TIME_SLOTS = [];
for (let hour = 10; hour <= 20; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    if (hour === 10 && minute < 30) continue;
    if (hour === 20 && minute > 0) continue;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    TIME_SLOTS.push(timeStr);
  }
}

// Global variables
let currentAmenity = 'Basketball Court';
let selectedDate = null;
let flatpickrInstance = null;
let reservationBlocked = false;
let reservationBlockMsg = '';

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  initializeDatePicker();
  setupEventListeners();
  loadReservations();
  checkReservationStatus();
});

// ========================================
// SERVER DATA FUNCTIONS
// ========================================
async function loadReservations() {
  try {
    const response = await PageCoordinator.api.get('/api/reservations');
    RESERVATIONS = response.data || [];
  } catch (err) {
    console.error('Failed to load reservations:', err);
    RESERVATIONS = [];
  }
  if (flatpickrInstance) styleCalendarDates(flatpickrInstance);
}

function getReservations() {
  return RESERVATIONS;
}

// ========================================
// DATE STATUS CHECKING
// ========================================
function getUserReservationStatusForDate(date, amenity) {
  const dateStr = formatDate(date);
  const reservations = getReservations();
  const userReservations = reservations.filter(r => 
    r.userId === CURRENT_USER && 
    r.amenity === amenity && 
    r.date === dateStr
  );
  
  if (userReservations.length === 0) return null;
  
  // Check if any approved
  if (userReservations.some(r => r.status === 'approved')) {
    return 'approved';
  }
  // Check if any pending
  if (userReservations.some(r => r.status === 'pending')) {
    return 'pending';
  }
  return null;
}

function isDateAvailable(date, amenity) {
  const dateStr = formatDate(date);
  const reservations = getReservations();

  // Check if user already has max reservations on this date (any amenity)
  const userReservationsCount = reservations.filter(r => 
    r.userId === CURRENT_USER && 
    r.date === dateStr &&
    (r.status === 'pending' || r.status === 'approved')
  ).length;

  if (userReservationsCount >= MAX_RESERVATIONS_PER_DAY) {
    return false;
  }

  // NEW LOGIC: Check if this specific amenity has ANY approved or pending reservation on this date
  // Date becomes unavailable if there's any active reservation (not rejected)
  const hasActiveReservation = reservations.some(r => 
    r.amenity === amenity && 
    r.date === dateStr &&
    (r.status === 'pending' || r.status === 'approved')
  );

  // Date is available only if NO active reservations exist
  return !hasActiveReservation;
}

function getAvailableTimeSlots(date, amenity, currentStartTime = null) {
  const dateStr = formatDate(date);
  const reservations = getReservations();
  
  // Get all booked time slots for this amenity and date
  const bookedSlots = reservations.filter(r => 
    r.amenity === amenity && 
    r.date === dateStr &&
    (r.status === 'pending' || r.status === 'approved')
  );
  
  // Check each time slot for availability
  const availableSlots = TIME_SLOTS.filter(slot => {
    // Check if this slot is already booked
    const isBooked = bookedSlots.some(booked => {
      const slotStart = slot;
      const slotEnd = getEndTimeFromStart(slot);
      const bookedStart = booked.startTime;
      const bookedEnd = booked.endTime;
      
      return (slotStart < bookedEnd && slotEnd > bookedStart);
    });
    
    return !isBooked;
  });
  
  return availableSlots;
}

function getEndTimeFromStart(startTime) {
  const [hours, minutes] = startTime.split(':').map(Number);
  let endHours = hours;
  let endMinutes = minutes + 30;
  
  if (endMinutes >= 60) {
    endHours++;
    endMinutes -= 60;
  }
  
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

// ========================================
// TIME PICKER FUNCTIONS
// ========================================
function updateTimePickers() {
  const startTimeSelect = document.getElementById('startTime');
  const endTimeSelect = document.getElementById('endTime');
  
  if (!selectedDate) {
    startTimeSelect.innerHTML = '<option value="">Select date first</option>';
    startTimeSelect.disabled = true;
    endTimeSelect.innerHTML = '<option value="">Select start time first</option>';
    endTimeSelect.disabled = true;
    return;
  }
  
  const availableSlots = getAvailableTimeSlots(selectedDate, currentAmenity);
  
  if (availableSlots.length === 0) {
    startTimeSelect.innerHTML = '<option value="">No available slots on this date</option>';
    startTimeSelect.disabled = true;
    endTimeSelect.innerHTML = '<option value="">Select start time first</option>';
    endTimeSelect.disabled = true;
    return;
  }
  
  // Populate start time dropdown
  startTimeSelect.innerHTML = '<option value="">Select start time</option>';
  availableSlots.forEach(slot => {
    const option = document.createElement('option');
    option.value = slot;
    option.textContent = formatTimeDisplay(slot);
    startTimeSelect.appendChild(option);
  });
  startTimeSelect.disabled = false;
  
  // Reset end time
  endTimeSelect.innerHTML = '<option value="">Select start time first</option>';
  endTimeSelect.disabled = true;
}

function updateEndTimePicker() {
  const startTimeSelect = document.getElementById('startTime');
  const endTimeSelect = document.getElementById('endTime');
  const selectedStartTime = startTimeSelect.value;
  
  if (!selectedStartTime || !selectedDate) {
    endTimeSelect.innerHTML = '<option value="">Select start time first</option>';
    endTimeSelect.disabled = true;
    return;
  }
  
  const availableSlots = getAvailableTimeSlots(selectedDate, currentAmenity, selectedStartTime);
  const startIndex = TIME_SLOTS.indexOf(selectedStartTime);
  
  // End time must be after start time (at least 30 minutes, max 4 hours)
  const possibleEndSlots = availableSlots.filter(slot => {
    const slotIndex = TIME_SLOTS.indexOf(slot);
    const duration = (slotIndex - startIndex) * 30; // in minutes
    return slotIndex > startIndex && duration <= 240;
  });
  
  if (possibleEndSlots.length === 0) {
    endTimeSelect.innerHTML = '<option value="">No available end times</option>';
    endTimeSelect.disabled = true;
    return;
  }
  
  endTimeSelect.innerHTML = '<option value="">Select end time</option>';
  possibleEndSlots.forEach(slot => {
    const option = document.createElement('option');
    option.value = slot;
    option.textContent = formatTimeDisplay(slot);
    endTimeSelect.appendChild(option);
  });
  endTimeSelect.disabled = false;
}

function formatTimeDisplay(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// ========================================
// DATE PICKER INITIALIZATION
// ========================================
function initializeDatePicker() {
  flatpickrInstance = flatpickr("#datePicker", {
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate: new Date().fp_incr(MAX_BOOKING_DAYS),
    onChange: function(selectedDates, dateStr, instance) {
      if (selectedDates.length > 0) {
        selectedDate = dateStr;
        updateTimePickers();
      }
    },
    onReady: function(selectedDates, dateStr, instance) {
      styleCalendarDates(instance);
    },
    onMonthChange: function(selectedDates, dateStr, instance) {
      styleCalendarDates(instance);
    },
    onOpen: function(selectedDates, dateStr, instance) {
      styleCalendarDates(instance);
    }
  });
}

function styleCalendarDates(instance) {
  const days = instance.calendarContainer.querySelectorAll('.flatpickr-day');
  
  days.forEach(day => {
    const dateAttr = day.getAttribute('aria-label');
    if (!dateAttr) return;
    
    const parsedDate = new Date(dateAttr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Remove existing custom classes
    day.classList.remove('available', 'user-pending', 'user-approved');
    
    // Check if date is past
    if (parsedDate < today) {
      day.classList.add('disabled');
      day.setAttribute('title', 'Past dates cannot be booked');
      return;
    }
    
    // Check max date
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + MAX_BOOKING_DAYS);
    if (parsedDate > maxDate) {
      day.classList.add('disabled');
      day.setAttribute('title', `Can only book up to ${MAX_BOOKING_DAYS} days in advance`);
      return;
    }
    
    // Check user's reservation status
    const userStatus = getUserReservationStatusForDate(parsedDate, currentAmenity);
    
    if (userStatus === 'approved') {
      day.classList.add('user-approved');
      day.classList.add('disabled');
      day.setAttribute('title', 'You already have an approved reservation on this date');
    } else if (userStatus === 'pending') {
      day.classList.add('user-pending');
      day.classList.add('disabled');
      day.setAttribute('title', 'You already have a pending reservation on this date');
    } else {
      // Check if date is available
      const available = isDateAvailable(parsedDate, currentAmenity);
      if (available) {
        day.classList.add('available');
        day.setAttribute('title', 'Available for booking');
      } else {
        day.classList.add('disabled');
        day.setAttribute('title', 'This date is already reserved by another member');
      }
    }
  });
}

// ========================================
// VALIDATION FUNCTIONS
// ========================================
function validateDailyLimit(date) {
  const reservations = getReservations();
  const count = reservations.filter(r => 
    r.userId === CURRENT_USER && 
    r.date === date &&
    (r.status === 'pending' || r.status === 'approved')
  ).length;
  
  if (count >= MAX_RESERVATIONS_PER_DAY) {
    showToast(`You already have ${count} reservation(s) on this date. Maximum of ${MAX_RESERVATIONS_PER_DAY} per day.`, 'error');
    return false;
  }
  return true;
}

function isTimeSlotAvailableForSubmit(amenity, date, startTime, endTime) {
  if (startTime < EARLIEST_BOOKING_TIME) {
    showToast('Reservations are only available from 10:30 AM onward.', 'error');
    return false;
  }

  const reservations = getReservations();
  
  return !reservations.some(res => {
    if (res.amenity !== amenity) return false;
    if (res.date !== date) return false;
    if (res.status !== 'pending' && res.status !== 'approved') return false;
    
    return (startTime < res.endTime && endTime > res.startTime);
  });
}

// ========================================
// EVENT HANDLERS
// ========================================
function setupEventListeners() {
  // Tab switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      currentAmenity = tab.dataset.amenity;
      document.getElementById('selectedAmenity').value = currentAmenity;
      
      resetForm();
      
      if (flatpickrInstance) {
        flatpickrInstance.clear();
        styleCalendarDates(flatpickrInstance);
      }
    });
  });
  
  document.getElementById('selectedAmenity').value = currentAmenity;
  
  // Start time change
  const startTimeSelect = document.getElementById('startTime');
  startTimeSelect.addEventListener('change', updateEndTimePicker);
  
  // Form submission
  const form = document.getElementById('reservationForm');
  form.addEventListener('submit', handleFormSubmit);
}

function resetForm() {
  if (flatpickrInstance) flatpickrInstance.clear();
  selectedDate = null;
  document.getElementById('startTime').innerHTML = '<option value="">Select date first</option>';
  document.getElementById('startTime').disabled = true;
  document.getElementById('endTime').innerHTML = '<option value="">Select start time first</option>';
  document.getElementById('endTime').disabled = true;
  document.getElementById('purpose').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('agreeTerms').checked = false;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  // Check if user is logged in
  if (!CURRENT_USER) {
    showToast('Please log in to make a reservation', 'error');
    return;
  }
  
  const amenity = currentAmenity;
  const date = selectedDate;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const purpose = document.getElementById('purpose').value;
  const notes = document.getElementById('notes').value;
  const agreed = document.getElementById('agreeTerms').checked;
  
  if (!date) {
    showToast('Please select a reservation date from the calendar', 'error');
    return;
  }
  
  if (!startTime) {
    showToast('Please select a start time', 'error');
    return;
  }
  
  if (!endTime) {
    showToast('Please select an end time', 'error');
    return;
  }
  
  if (!purpose) {
    showToast('Please select a purpose for your reservation', 'error');
    return;
  }
  
  if (!agreed) {
    showToast('Please agree to the terms and conditions', 'error');
    return;
  }
  
  // Check daily limit
  if (!validateDailyLimit(date)) {
    return;
  }
  
  // Check time slot availability
  if (!isTimeSlotAvailableForSubmit(amenity, date, startTime, endTime)) {
    showToast('This time slot is already taken. Please choose a different time.', 'error');
    return;
  }
  
  // Create reservation on the server
  const reservation = {
    userId: CURRENT_USER,
    amenity: amenity,
    date: date,
    startTime: startTime,
    endTime: endTime,
    purpose: purpose,
    notes: notes
  };
  
  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation)
    });

    if (response.status === 403) {
      let msg = 'You are restricted from making reservations.';
      try {
        const json = await response.json();
        if (json.message) msg = json.message;
      } catch (_) {}
      reservationBlocked = true;
      reservationBlockMsg = msg;
      renderReservationNotice();
      applyBlockToControls();
      showToast(msg, 'error');
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to submit reservation');
    }

    const data = await response.json();

    showToast(`Reservation request for ${amenity} on ${new Date(date).toLocaleDateString()} has been submitted!`, 'success');

    resetForm();
    await loadReservations();

    if (flatpickrInstance) {
      styleCalendarDates(flatpickrInstance);
    }
  } catch (err) {
    console.error('Create reservation exception:', err);
    showToast('Failed to submit reservation. Please try again.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'info') {
  console.log('showToast called:', message, type);
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
    font-family: 'Outfit', system-ui, sans-serif;
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
    cursor: pointer;
  `;

  toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
  console.log('Toast element created, appending to body');
  document.body.appendChild(toast);
  console.log('Toast appended to body, current body children:', document.body.children.length);
  
  toast.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  });
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// ========================================
// BAN STATUS CHECKING
// ========================================
async function checkReservationStatus() {
  try {
    const response = await fetch('/api/reservations/my-status');
    if (!response.ok) {
      reservationBlocked = false;
      reservationBlockMsg = '';
      return;
    }
    const json = await response.json();
    reservationBlocked = !!json.blocked;
    reservationBlockMsg = json.message || '';
  } catch (e) {
    reservationBlocked = false;
    reservationBlockMsg = '';
  }
  renderReservationNotice();
  applyBlockToControls();
}

function renderReservationNotice() {
  let banner = document.getElementById('reservationNoticeBanner');
  if (!reservationBlocked) { 
    if (banner) banner.remove(); 
    return; 
  }

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'reservationNoticeBanner';
    banner.style.cssText = 'max-width:1100px;margin:16px auto;padding:14px 18px;border-radius:10px;background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500';
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    mainContent.insertBefore(banner, mainContent.firstChild);
  }
  banner.innerHTML = `<i class="fas fa-ban" style="font-size:20px"></i><span>${escapeHtml(reservationBlockMsg || 'You are currently restricted from making reservations.')}</span>`;
}

function applyBlockToControls() {
  const submitBtn = document.querySelector('.submit-btn');
  const datePicker = document.getElementById('datePicker');
  const startTime = document.getElementById('startTime');
  const endTime = document.getElementById('endTime');
  const purpose = document.getElementById('purpose');
  const notes = document.getElementById('notes');
  const agreeTerms = document.getElementById('agreeTerms');

  if (submitBtn) {
    submitBtn.disabled = reservationBlocked;
    submitBtn.style.opacity = reservationBlocked ? '0.5' : '';
    submitBtn.style.cursor = reservationBlocked ? 'not-allowed' : '';
    submitBtn.title = reservationBlocked ? (reservationBlockMsg || 'You are restricted from making reservations') : '';
  }

  if (reservationBlocked) {
    [datePicker, startTime, endTime, purpose, notes, agreeTerms].forEach(el => {
      if (el) {
        el.disabled = true;
        el.style.opacity = '0.5';
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}