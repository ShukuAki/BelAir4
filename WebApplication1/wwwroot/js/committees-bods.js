/**
 * Board of Directors Interactive Organization Tree
 * Laguna BelAir 4 - Village Website
 * Updated to work with new header/hero design
 */

// ========================================
// DATA STRUCTURE - LOADED FROM API
// ========================================
let boardMembers = [];

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
// MOBILE DROPDOWN TOGGLE SUPPORT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
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
});

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load BOD members from API
    const response = await PageCoordinator.api.get('/api/bod-members');
    const rawMembers = response.data || [];

    // Map raw DB fields (id, name, position, term, phone, email) to the
    // shape expected by the org tree renderer (level, image, description).
    boardMembers = rawMembers.map(m => ({
      ...m,
      level: /president/i.test(m.position || '') ? 'President' : 'Officer',
      image: m.image || '/assets/LBAlogo.png',
      description: m.description || `${m.position || 'Board Member'} of Laguna BelAir 4 Homeowners Association.`
    }));

    if (!boardMembers.length) {
      orgTree.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;"><p>No board members available at this time.</p></div>';
      return;
    }
  } catch (err) {
    console.error('Error loading BOD members:', err);
    // Fallback: show error message
    if (orgTree) {
      orgTree.innerHTML = '<div style="padding: 40px; color: red;"><p>Failed to load board members. Please try again later.</p></div>';
    }
    return;
  }

  renderOrgTree();
  setupEventListeners();
});

// ========================================
// RENDER ORGANIZATION TREE
// ========================================
function renderOrgTree() {
  if (!orgTree) return;
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
      <img src="${member.image}" alt="${escapeHtml(member.name)}" class="member-photo">
    </div>
    <h3 class="member-name">${escapeHtml(member.name)}</h3>
    <p class="member-position">${escapeHtml(member.position)}</p>
    <p class="member-term">${escapeHtml(member.term)}</p>
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
  const detailImage = document.getElementById('detailImage');
  const detailName = document.getElementById('detailName');
  const detailPosition = document.getElementById('detailPosition');
  const detailTerm = document.getElementById('detailTerm');
  const detailDescription = document.getElementById('detailDescription');
  
  if (detailImage) {
    detailImage.src = member.image;
    detailImage.alt = member.name;
  }
  if (detailName) detailName.textContent = member.name;
  if (detailPosition) detailPosition.textContent = member.position;
  if (detailTerm) detailTerm.textContent = `Term: ${member.term}`;
  if (detailDescription) {
    detailDescription.innerHTML = `
      <p><strong>Responsibilities:</strong></p>
      <p>${escapeHtml(member.description)}</p>
    `;
  }

  // Populate side members panel
  populateSideMembers(member.id);

  // Show panels and overlay
  setTimeout(() => {
    if (detailPanel) detailPanel.classList.add('active');
    if (sideMembersPanel) sideMembersPanel.classList.add('active');
    if (overlay) overlay.classList.add('active');
  }, 100);

  // Show back button
  if (backToFullViewBtn) backToFullViewBtn.classList.add('visible');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// ========================================
// POPULATE SIDE MEMBERS PANEL
// ========================================
function populateSideMembers(currentMemberId) {
  if (!sideMembersList) return;
  sideMembersList.innerHTML = '';

  // Get all other members
  const otherMembers = boardMembers.filter(m => m.id !== currentMemberId);
  otherMembers.forEach(member => {
    const memberItem = document.createElement('div');
    memberItem.className = 'side-member-item';
    memberItem.setAttribute('role', 'button');
    memberItem.setAttribute('tabindex', '0');
    memberItem.innerHTML = `
      <img src="${member.image}" alt="${escapeHtml(member.name)}" class="side-member-photo">
      <div class="side-member-info">
        <div class="side-member-name">${escapeHtml(member.name)}</div>
        <div class="side-member-position">${escapeHtml(member.position)}</div>
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
  
  // Animate transition
  if (detailPanel) detailPanel.style.opacity = '0';
  
  setTimeout(() => {
    const detailImage = document.getElementById('detailImage');
    const detailName = document.getElementById('detailName');
    const detailPosition = document.getElementById('detailPosition');
    const detailTerm = document.getElementById('detailTerm');
    const detailDescription = document.getElementById('detailDescription');
    
    if (detailImage) {
      detailImage.src = member.image;
      detailImage.alt = member.name;
    }
    if (detailName) detailName.textContent = member.name;
    if (detailPosition) detailPosition.textContent = member.position;
    if (detailTerm) detailTerm.textContent = `Term: ${member.term}`;
    if (detailDescription) {
      detailDescription.innerHTML = `
        <p><strong>Responsibilities:</strong></p>
        <p>${escapeHtml(member.description)}</p>
      `;
    }

    // Update side members
    populateSideMembers(member.id);
    if (detailPanel) detailPanel.style.opacity = '1';
  }, 200);
}

// ========================================
// CLOSE DETAIL PANEL
// ========================================
function closeDetailPanel() {
  // Hide panels and overlay
  if (detailPanel) detailPanel.classList.remove('active');
  if (sideMembersPanel) sideMembersPanel.classList.remove('active');
  if (overlay) overlay.classList.remove('active');

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
  if (backToFullViewBtn) backToFullViewBtn.classList.remove('visible');

  // Restore body scroll
  document.body.style.overflow = '';
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
  // Close detail panel
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', closeDetailPanel);
  }

  // Overlay click
  if (overlay) {
    overlay.addEventListener('click', closeDetailPanel);
  }

  // Back to full view
  if (backToFullViewBtn) {
    backToFullViewBtn.addEventListener('click', () => {
      closeDetailPanel();
    });
  }

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailPanel && detailPanel.classList.contains('active')) {
        closeDetailPanel();
      } else if (currentView === 'focused') {
        resetFocus();
      }
    }
  });

  // Prevent detail panel close when clicking inside
  if (detailPanel) {
    detailPanel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================
// Trap focus within detail panel when open
if (detailPanel) {
  detailPanel.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusableElements = detailPanel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        if (lastElement) lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        if (firstElement) firstElement.focus();
      }
    }
  });
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
// ADD ACTIVE CLASS TO CURRENT PAGE
// ========================================
function setActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath ||
        (currentPath.includes('committees-bods') && linkHref === 'committees-bods.html') ||
        (currentPath === '/' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Call setActiveNav on load
document.addEventListener('DOMContentLoaded', setActiveNav);

// Smooth scroll to top on page load
window.addEventListener('load', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});