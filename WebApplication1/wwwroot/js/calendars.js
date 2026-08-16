// ========================================
// CALENDAR JAVASCRIPT
// Updated to work with new header/hero design
// ========================================

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Calendar elements
  const currentDateEl = document.getElementById('current-date');
  const displayDateEl = document.getElementById('display-date');
  const eventsContainer = document.getElementById('events-container');
  const calendarDaysEl = document.getElementById('calendar-days');
  const currentMonthYearEl = document.getElementById('current-month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const currentYearEl = document.getElementById('current-year');

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

  // Calendar state
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  // Sample events data - will be loaded from API
  let eventsData = {};

  // ========================================
  // INITIALIZATION FUNCTION
  // ========================================
  async function init() {
    // Load events from API
    try {
      const response = await PageCoordinator.api.get('/api/hoa-events');
      const events = response.data || [];

      // Transform API data to calendar format
      eventsData = {};
      events.forEach(evt => {
        const dateKey = evt.date; // Assuming date format "YYYY-MM-DD"
        if (!eventsData[dateKey]) {
          eventsData[dateKey] = [];
        }
        eventsData[dateKey].push({
          time: evt.time || "TBD",
          title: evt.title,
          description: evt.description || ""
        });
      });
    } catch (err) {
      console.error('Error loading events:', err);
      // Continue with empty eventsData
    }

    // Set current year in footer
    if (currentYearEl) {
      currentYearEl.textContent = currentYear;
    }
    // Set today's date display
    updateDateDisplay(currentDate);
    // Generate calendar for current month
    generateCalendar(currentMonth, currentYear);
    // Display today's events
    displayEventsForDate(currentDate);
    // Set up event listeners
    setupEventListeners();
  }

  // ========================================
  // EVENT LISTENERS SETUP
  // ========================================
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

  // ========================================
  // GENERATE CALENDAR FUNCTION
  // ========================================
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

  // ========================================
  // UPDATE DATE DISPLAY
  // ========================================
  function updateDateDisplay(date) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('en-US', options);

    if (currentDateEl) {
      currentDateEl.textContent = formattedDate;
    }
    if (displayDateEl) {
      displayDateEl.textContent = formattedDate;
    }

    // Update events list header
    const eventsListHeader = document.querySelector('.events-list h4');
    if (eventsListHeader) {
      eventsListHeader.innerHTML = `Events for <span id="display-date">${formattedDate}</span>`;
    }
  }

  // ========================================
  // DISPLAY EVENTS FOR DATE
  // ========================================
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

  // ========================================
  // HELPER FUNCTION - GET DATE KEY
  // ========================================
  function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ========================================
  // HELPER FUNCTION - ESCAPE HTML
  // ========================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ========================================
  // ADD MORE SAMPLE EVENTS FOR DEMO
  // ========================================
  function addMoreSampleEvents() {
    // Add events for next few days
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    eventsData[getDateKey(tomorrow)] = [
      {
        time: "8:00 AM - 5:00 PM",
        title: "Village Offices Open",
        description: "All village offices open for regular business"
      }
    ];

    eventsData[getDateKey(dayAfter)] = [
      {
        time: "9:00 AM",
        title: "Trash Collection",
        description: "Regular trash and recycling collection"
      },
      {
        time: "6:30 PM",
        title: "Zoning Board Hearing",
        description: "Public hearing on proposed zoning changes"
      }
    ];

    // Add an event for next week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    eventsData[getDateKey(nextWeek)] = [
      {
        time: "All Day",
        title: "Power Maintenance",
        description: "Scheduled power maintenance in select areas"
      }
    ];
  }

  // ========================================
  // ADD ACTIVE CLASS TO CURRENT PAGE
  // ========================================
  function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
    
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPath ||
          (currentPath.includes('calendars') && linkHref === 'calendars.html') ||
          (currentPath === '/' && linkHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ========================================
  // CALL INITIALIZATION
  // ========================================
  addMoreSampleEvents(); // Add more events for demo
  setActiveNav();
  init();
});