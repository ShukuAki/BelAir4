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
// Calendar state
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
// Sample events data (in a real app, this would come from a server)
const eventsData = {
// Format: "YYYY-MM-DD": [events array]
[getDateKey(new Date())]: [
{
time: "10:00 AM",
title: "Village Council Meeting",
description: "Monthly council meeting at Town Hall"
},
{
time: "2:30 PM",
title: "Park Cleanup Event",
description: "Community park cleanup at Central Park"
},
{
time: "7:00 PM",
title: "Public Safety Workshop",
description: "Fire safety and prevention workshop"
}
],
[getDateKey(new Date(currentYear, currentMonth, 5))]: [
{
time: "9:00 AM",
title: "Building Permit Deadline",
description: "Last day to submit building permits for Q1"
}
],
[getDateKey(new Date(currentYear, currentMonth, 12))]: [
{
time: "6:00 PM",
title: "Community Dinner",
description: "Annual community potluck dinner"
}
],
[getDateKey(new Date(currentYear, currentMonth, 15))]: [
{
time: "8:00 AM",
title: "Road Maintenance",
description: "Main Street will be closed for maintenance"
},
{
time: "3:00 PM",
title: "Library Story Time",
description: "Children's story time at village Library"
}
],
[getDateKey(new Date(currentYear, currentMonth, 20))]: [
{
time: "All Day",
title: "Incident Report Filed",
description: "Water main break reported on Oak Street"
}
],
[getDateKey(new Date(currentYear, currentMonth, 25))]: [
{
time: "1:00 PM",
title: "Farmers Market",
description: "Weekly farmers market at Town Square"
}
],
[getDateKey(new Date(currentYear, currentMonth, 28))]: [
{
time: "10:00 AM",
title: "Tax Payment Due",
description: "Quarterly property tax payments due"
}
],
[getDateKey(new Date(currentYear, currentMonth + 1, 3))]: [
{
time: "7:00 PM",
title: "Planning Board Meeting",
description: "Monthly planning board meeting"
}
]
};
// Initialize
function init() {
// Set current year in footer
currentYearEl.textContent = currentYear;
// Set today's date display
updateDateDisplay(currentDate);
// Generate calendar for current month
generateCalendar(currentMonth, currentYear);
// Display today's events
displayEventsForDate(currentDate);
// Set up event listeners
setupEventListeners();
}
// Set up event listeners
function setupEventListeners() {
// Previous month button
prevMonthBtn.addEventListener('click', function() {
currentMonth--;
if (currentMonth < 0) {
currentMonth = 11;
currentYear--;
}
generateCalendar(currentMonth, currentYear);
});
// Next month button
nextMonthBtn.addEventListener('click', function() {
currentMonth++;
if (currentMonth > 11) {
currentMonth = 0;
currentYear++;
}
generateCalendar(currentMonth, currentYear);
});
}
// Generate calendar for given month and year
function generateCalendar(month, year) {
// Clear existing calendar days
calendarDaysEl.innerHTML = '';
// Update month/year display
const monthNames = [
"January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];
currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;
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
currentDateEl.textContent = formattedDate;
displayDateEl.textContent = formattedDate;
}
// Display events for a specific date
function displayEventsForDate(date) {
const dateKey = getDateKey(date);
const events = eventsData[dateKey];
// Clear events container
eventsContainer.innerHTML = '';
if (events && events.length > 0) {
// Create event items
events.forEach(event => {
const eventElement = document.createElement('div');
eventElement.className = 'event-item';
eventElement.innerHTML = `
<div class="event-time">${event.time}</div>
<div class="event-title">${event.title}</div>
<div class="event-desc">${event.description}</div>
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
// Add more sample events for demonstration
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
title: "Incident Report Filed",
description: "Power outage reported in Maplewood area"
}
];
}
// Call initialization
addMoreSampleEvents(); // Add more events for demo
init();
});