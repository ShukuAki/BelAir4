// DOM Elements
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

  // Calendar elements
  const currentDateEl = document.getElementById('current-date');
  const displayDateEl = document.getElementById('display-date');
  const eventsContainer = document.getElementById('events-container');
  const calendarDaysEl = document.getElementById('calendar-days');
  const currentMonthYearEl = document.getElementById('current-month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const currentYearEl = document.getElementById('current-year');
  
  // Calendar state
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  
  // Events data loaded from the community calendar API
  // Format: "YYYY-MM-DD": [events array]
  let eventsData = {};

  // Load real events from the HOA events API (same backend used by the Calendars page)
  async function loadEvents() {
    try {
      const response = await fetch('/api/hoa-events');
      const result = await response.json();
      const events = (result && result.data) || [];

      eventsData = {};
      events.forEach(evt => {
        const dateKey = evt.date;
        if (!dateKey) return;
        if (!eventsData[dateKey]) eventsData[dateKey] = [];
        eventsData[dateKey].push({
          time: evt.time || "TBD",
          title: evt.title,
          description: evt.description || ""
        });
      });
    } catch (err) {
      console.error('Error loading community calendar events:', err);
      eventsData = {};
    }
  }

  // Initialize
  async function init() {
    // Set current year in footer
    if (currentYearEl) currentYearEl.textContent = currentYear;
    // Load real events from the database
    await loadEvents();
    // Set today's date display
    updateDateDisplay(currentDate);
    // Generate calendar for current month
    generateCalendar(currentMonth, currentYear);
    // Display today's events
    displayEventsForDate(currentDate);
    // Set up event listeners
    setupEventListeners();
    // Set up search functionality
    setupSearch();
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Previous month button
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
      });
    }
    
    // Next month button
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
      });
    }
  }
  
  // Setup search functionality
  function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (searchInput && searchButton) {
      const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
          // Simple search: redirect to appropriate pages based on keywords
          if (query.includes('announcement') || query.includes('news')) {
            window.location.href = 'announcement.html';
          } else if (query.includes('calendar') || query.includes('event')) {
            window.location.href = 'calendars.html';
          } else if (query.includes('forum') || query.includes('discussion')) {
            window.location.href = 'forums.html';
          } else if (query.includes('report') || query.includes('concern')) {
            window.location.href = 'report-concerns.html';
          } else if (query.includes('reserve') || query.includes('amenity')) {
            window.location.href = 'reserve.html';
          } else if (query.includes('map')) {
            window.location.href = 'community-map.html';
          } else {
            // Default to home with a notice
            showToast('Try "announcements", "calendar", "forums", or "report"', 'info');
          }
        }
      };
      
      searchButton.addEventListener('click', performSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    }
  }
  
  // Generate calendar for given month and year
  function generateCalendar(month, year) {
    if (!calendarDaysEl) return;
    
    // Clear existing calendar days
    calendarDaysEl.innerHTML = '';
    
    // Update month/year display
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    if (currentMonthYearEl) {
      currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarDaysEl.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    const todayKey = getDateKey(today);
    
    for (let day = 1; day <= totalDays; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = day;
      
      // Create date object for this day
      const dateObj = new Date(year, month, day);
      const dateKey = getDateKey(dateObj);
      
      // Check if today
      if (dateKey === todayKey) {
        dayElement.classList.add('today');
      }
      
      // Check if has events
      if (eventsData[dateKey]) {
        dayElement.classList.add('has-event');
      }
      
      // Check if selected (compare with current displayed date)
      const displayedDateKey = getDateKey(currentDate);
      if (dateKey === displayedDateKey) {
        dayElement.classList.add('selected');
      }
      
      // Add click event
      dayElement.addEventListener('click', function() {
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
          day.classList.remove('selected');
        });
        
        // Add selected class to clicked day
        dayElement.classList.add('selected');
        
        // Update current date and display
        currentDate = dateObj;
        updateDateDisplay(dateObj);
        displayEventsForDate(dateObj);
      });
      
      calendarDaysEl.appendChild(dayElement);
    }
  }
  
  // Update date display elements
  function updateDateDisplay(date) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    if (currentDateEl) currentDateEl.textContent = formattedDate;
    if (displayDateEl) displayDateEl.textContent = formattedDate;
  }
  
  // Display events for a specific date
  function displayEventsForDate(date) {
    const dateKey = getDateKey(date);
    const events = eventsData[dateKey];
    
    // Clear events container
    if (!eventsContainer) return;
    eventsContainer.innerHTML = '';
    
    if (events && events.length > 0) {
      // Create event items
      events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
          <div class="event-time">${escapeHtml(event.time)}</div>
          <div class="event-title">${escapeHtml(event.title)}</div>
          <div class="event-desc">${escapeHtml(event.description)}</div>
        `;
        eventsContainer.appendChild(eventElement);
      });
    } else {
      // No events message
      const noEventsElement = document.createElement('div');
      noEventsElement.className = 'no-events';
      
      // Different message based on whether it's today or another day
      const today = new Date();
      const isToday = getDateKey(date) === getDateKey(today);
      
      if (isToday) {
        noEventsElement.innerHTML = `
          <i class="fas fa-calendar-day"></i>
          <p>No events scheduled for today</p>
        `;
      } else {
        noEventsElement.innerHTML = `
          <i class="fas fa-calendar"></i>
          <p>No events scheduled for this date</p>
        `;
      }
      
      eventsContainer.appendChild(noEventsElement);
    }
  }
  
  // Helper function to get date key in YYYY-MM-DD format
  function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper function to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  // Toast notification function
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.lba4-toast');
    if (existing) existing.remove();
    
    const icons = {
      info: 'fa-circle-info',
      warn: 'fa-triangle-exclamation',
      error: 'fa-circle-xmark',
      success: 'fa-check-circle'
    };
    const colors = {
      info: '#0a4d3c',
      warn: '#d97706',
      error: '#c0392b',
      success: '#0a4d3c'
    };
    
    const toast = document.createElement('div');
    toast.className = 'lba4-toast';
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
      cursor: pointer;
    `;
    
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    
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
    }, 4000);
  }
  
  // Add active class to current page
  function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
    
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPath ||
          (currentPath === '/' && linkHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  
  // Call initialization
  setActiveNav();
  init();
});