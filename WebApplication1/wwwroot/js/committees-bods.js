/**
* Board of Directors Interactive Organization Tree
* Laguna BelAir 4 - Village Website
*/
// ========================================
// DATA STRUCTURE
// ========================================
const boardMembers = [
{
id: 1,
name: "Maria Santos",
position: "President",
term: "2025-2026",
level: "President",
image: "https://via.placeholder.com/200/0a4d3c/ffffff?text=MS",
description: "Maria Santos leads the Board of Directors with a vision for community development and sustainable growth. She oversees all board operations, represents the homeowners in external affairs, and ensures that our village maintains its high standards of living. With over 15 years of community leadership experience, Maria is committed to transparency, innovation, and resident satisfaction."
},
{
id: 2,
name: "Juan Dela Cruz",
position: "Vice President",
term: "2025-2026",
level: "Officer",
image: "https://via.placeholder.com/200/7bc96f/ffffff?text=JD",
description: "Juan Dela Cruz supports the President in all administrative matters and assumes leadership duties when needed. He coordinates with various committees and ensures smooth communication between the board and residents. Juan specializes in conflict resolution and community engagement, bringing a collaborative approach to village governance."
},
{
id: 3,
name: "Ana Reyes",
position: "Secretary",
term: "2025-2026",
level: "Officer",
image: "https://via.placeholder.com/200/7bc96f/ffffff?text=AR",
description: "Ana Reyes maintains all official records, documents board meetings, and manages correspondence. She ensures that all homeowners have access to important documents and meeting minutes. Ana's meticulous attention to detail and organizational skills keep our board operations running efficiently and transparently."
},
{
id: 4,
name: "Roberto Garcia",
position: "Treasurer",
term: "2025-2026",
level: "Officer",
image: "https://via.placeholder.com/200/7bc96f/ffffff?text=RG",
description: "Roberto Garcia oversees all financial operations of the homeowners association. He manages the budget, tracks expenses, collects dues, and provides financial reports to the community. With a background in accounting and finance, Roberto ensures fiscal responsibility and financial transparency for all residents."
},
{
id: 5,
name: "Carmen Lopez",
position: "Auditor",
term: "2025-2026",
level: "Officer",
image: "https://via.placeholder.com/200/7bc96f/ffffff?text=CL",
description: "Carmen Lopez conducts regular audits of the association's financial records and ensures compliance with established policies and procedures. She provides independent oversight and reports directly to the homeowners, ensuring accountability and proper use of association funds."
},
{
id: 6,
name: "Pedro Martinez",
position: "Public Relations Officer",
term: "2025-2026",
level: "Officer",
image: "https://via.placeholder.com/200/7bc96f/ffffff?text=PM",
description: "Pedro Martinez manages all communications between the board and residents, coordinates community events, and maintains the association's public image. He handles media relations, manages our online presence, and ensures that residents stay informed about important updates and activities within Laguna BelAir 4."
}
];

// ========================================
// STATE MANAGEMENT
// ========================================
let currentView = 'full'; // 'full' or 'focused'
let focusedMemberId = null;

// ========================================
// DOM ELEMENTS
// ========================================
const orgTree = document.getElementById('orgTree');
const detailPanel = document.getElementById('detailPanel');
const sideMembersPanel = document.getElementById('sideMembersPanel');
const sideMembersList = document.getElementById('sideMembersList');
const overlay = document.getElementById('overlay');
const backToFullViewBtn = document.getElementById('backToFullView');
const closeDetailBtn = document.getElementById('closeDetail');

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
renderOrgTree();
setupEventListeners();
});

// ========================================
// RENDER ORGANIZATION TREE
// ========================================
function renderOrgTree() {
const members = boardMembers;
orgTree.innerHTML = '';

// Render President
const president = members.find(m => m.level === 'President');
if (president) {
const presidentLevel = document.createElement('div');
presidentLevel.className = 'level-president';
presidentLevel.appendChild(createMemberCard(president, true));
orgTree.appendChild(presidentLevel);
}

// Render Officers
const officers = members.filter(m => m.level === 'Officer');
if (officers.length > 0) {
const officersLevel = document.createElement('div');
officersLevel.className = 'level-officers';
const officerRow = document.createElement('div');
officerRow.className = 'officer-row';
officers.forEach(officer => {
officerRow.appendChild(createMemberCard(officer, false));
});
officersLevel.appendChild(officerRow);
orgTree.appendChild(officersLevel);
}
}

// ========================================
// CREATE MEMBER CARD
// ========================================
function createMemberCard(member, isPresident = false) {
const card = document.createElement('div');
card.className = `member-card ${isPresident ? 'president' : ''}`;
card.dataset.memberId = member.id;
card.setAttribute('role', 'button');
card.setAttribute('tabindex', '0');
card.setAttribute('aria-label', `View details for ${member.name}, ${member.position}`);
card.innerHTML = `
<div class="member-photo-wrapper">
<img src="${member.image}" alt="${member.name}" class="member-photo">
</div>
<h3 class="member-name">${member.name}</h3>
<p class="member-position">${member.position}</p>
<p class="member-term">${member.term}</p>
`;

// Click event
card.addEventListener('click', () => openDetailPanel(member));

// Keyboard accessibility
card.addEventListener('keypress', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
openDetailPanel(member);
}
});

return card;
}

// ========================================
// OPEN DETAIL PANEL - CENTER WITH SIDE MEMBERS
// ========================================
function openDetailPanel(member) {
// Enter focus mode
currentView = 'focused';
focusedMemberId = member.id;

// Populate detail panel (center)
document.getElementById('detailImage').src = member.image;
document.getElementById('detailImage').alt = member.name;
document.getElementById('detailName').textContent = member.name;
document.getElementById('detailPosition').textContent = member.position;
document.getElementById('detailTerm').textContent = `Term: ${member.term}`;
document.getElementById('detailDescription').innerHTML = `
<p><strong>Responsibilities:</strong></p>
<p>${member.description}</p>
`;

// Populate side members panel
populateSideMembers(member.id);

// Show panels and overlay
setTimeout(() => {
detailPanel.classList.add('active');
sideMembersPanel.classList.add('active');
overlay.classList.add('active');
}, 100);

// Show back button
backToFullViewBtn.classList.add('visible');

// Prevent body scroll
document.body.style.overflow = 'hidden';
}

// ========================================
// POPULATE SIDE MEMBERS PANEL
// ========================================
function populateSideMembers(currentMemberId) {
sideMembersList.innerHTML = '';

// Get all other members
const otherMembers = boardMembers.filter(m => m.id !== currentMemberId);
otherMembers.forEach(member => {
const memberItem = document.createElement('div');
memberItem.className = 'side-member-item';
memberItem.setAttribute('role', 'button');
memberItem.setAttribute('tabindex', '0');
memberItem.innerHTML = `
<img src="${member.image}" alt="${member.name}" class="side-member-photo">
<div class="side-member-info">
<div class="side-member-name">${member.name}</div>
<div class="side-member-position">${member.position}</div>
</div>
`;

// Click to switch to this member
memberItem.addEventListener('click', () => {
switchToMember(member);
});

// Keyboard accessibility
memberItem.addEventListener('keypress', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
switchToMember(member);
}
});

sideMembersList.appendChild(memberItem);
});
}

// ========================================
// SWITCH TO ANOTHER MEMBER
// ========================================
function switchToMember(member) {
focusedMemberId = member.id;

// Update detail panel with smooth transition
detailPanel.style.opacity = '0';
setTimeout(() => {
document.getElementById('detailImage').src = member.image;
document.getElementById('detailImage').alt = member.name;
document.getElementById('detailName').textContent = member.name;
document.getElementById('detailPosition').textContent = member.position;
document.getElementById('detailTerm').textContent = `Term: ${member.term}`;
document.getElementById('detailDescription').innerHTML = `
<p><strong>Responsibilities:</strong></p>
<p>${member.description}</p>
`;

// Update side members
populateSideMembers(member.id);
detailPanel.style.opacity = '1';
}, 200);
}

// ========================================
// CLOSE DETAIL PANEL
// ========================================
function closeDetailPanel() {
// Hide panels and overlay
detailPanel.classList.remove('active');
sideMembersPanel.classList.remove('active');
overlay.classList.remove('active');

// Reset focus
setTimeout(() => {
resetFocus();
}, 300);

// Restore body scroll
document.body.style.overflow = '';
}

// ========================================
// RESET FOCUS
// ========================================
function resetFocus() {
focusedMemberId = null;
currentView = 'full';

// Hide back button
backToFullViewBtn.classList.remove('visible');

// Restore body scroll
document.body.style.overflow = '';
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
// Close detail panel
closeDetailBtn.addEventListener('click', closeDetailPanel);

// Overlay click
overlay.addEventListener('click', closeDetailPanel);

// Back to full view
backToFullViewBtn.addEventListener('click', () => {
closeDetailPanel();
});

// Escape key to close
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') {
if (detailPanel.classList.contains('active')) {
closeDetailPanel();
} else if (currentView === 'focused') {
resetFocus();
}
}
});

// Prevent detail panel close when clicking inside
detailPanel.addEventListener('click', (e) => {
e.stopPropagation();
});
}

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================
// Trap focus within detail panel when open
detailPanel.addEventListener('keydown', (e) => {
if (e.key === 'Tab') {
const focusableElements = detailPanel.querySelectorAll(
'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
const firstElement = focusableElements[0];
const lastElement = focusableElements[focusableElements.length - 1];

if (e.shiftKey && document.activeElement === firstElement) {
e.preventDefault();
lastElement.focus();
} else if (!e.shiftKey && document.activeElement === lastElement) {
e.preventDefault();
firstElement.focus();
}
}
});

// ========================================
// UTILITY FUNCTIONS
// ========================================
// Update year in footer
document.addEventListener('DOMContentLoaded', () => {
const yearElement = document.getElementById('current-year');
if (yearElement) {
yearElement.textContent = new Date().getFullYear();
}
});

// Smooth scroll to top on page load
window.addEventListener('load', () => {
window.scrollTo({ top: 0, behavior: 'smooth' });
});