// Calendar Page Wiring Script
// This file shows how to wire calendars.cshtml with live event data

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Fetch all events from API
    const response = await PageCoordinator.api.get('/api/hoa-events');
    const allEvents = response.data || [];

    // Helper function to format date
    function formatDate(date) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }

    // Helper function to get events for specific date
    function getEventsForDate(date) {
      const dateStr = date.toISOString().split('T')[0];
      return allEvents.filter(e => e.date === dateStr);
    }

    // Display events for a given date
    function displayEventsForDate(date) {
      const events = getEventsForDate(date);
      const container = document.getElementById('events-container');

      document.getElementById('current-date').textContent = formatDate(date);
      document.getElementById('display-date').textContent = formatDate(date);

      if (events.length === 0) {
        container.innerHTML = '<div class="no-events"><i class="fas fa-calendar-day"></i><p>No events scheduled for this date</p></div>';
        return;
      }

      const html = events.map(event => `
        <div class="event-item">
          <div class="event-time">${escapeHtml(event.time || 'TBD')}</div>
          <div class="event-details">
            <h5>${escapeHtml(event.title)}</h5>
            <p>${escapeHtml(event.description || 'No description')}</p>
            <small>${escapeHtml(event.location || 'Location TBD')}</small>
          </div>
        </div>
      `).join('');

      container.innerHTML = html;
    }

    // Generate calendar grid
    function generateCalendarDays(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const container = document.getElementById('calendar-days');
      container.innerHTML = '';

      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        container.innerHTML += '<div class="calendar-day empty"></div>';
      }

      // Add days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const hasEvents = getEventsForDate(date).length > 0;
        const isToday = date.toDateString() === new Date().toDateString();

        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${hasEvents ? 'has-events' : ''} ${isToday ? 'today' : ''}`;
        dayElement.textContent = day;
        dayElement.onclick = () => displayEventsForDate(date);

        container.appendChild(dayElement);
      }
    }

    // Initialize calendar
    let currentDate = new Date();
    displayEventsForDate(currentDate);
    generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('current-month-year').textContent = 
      `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    // Previous month button
    document.getElementById('prev-month').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      document.getElementById('current-month-year').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
    });

    // Next month button
    document.getElementById('next-month').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      document.getElementById('current-month-year').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
    });

  } catch (err) {
    console.error('Error loading calendar events:', err);
    document.getElementById('events-container').innerHTML = 
      '<div style="color: red;"><p>Failed to load events. Please try again later.</p></div>';
  }
});
