// ========================================
// ANNOUNCEMENTS PAGE JAVASCRIPT
// Updated to work with new header/hero design
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
  // MOBILE DROPDOWN TOGGLE SUPPORT
  // ========================================
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('dropdown-open');
      // Close all other dropdowns
      dropdowns.forEach(d => d.classList.remove('dropdown-open'));
      if (!isOpen) dropdown.classList.add('dropdown-open');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    dropdowns.forEach(d => {
      if (!d.contains(e.target)) d.classList.remove('dropdown-open');
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
      // In production, this would navigate to a detailed page
      // For demo purposes, show an alert
      alert('Viewing details for: ' + cardTitle + '\n\nFull announcement content would appear here in production.');
    });
  });

  // ========================================
  // HOVER EFFECT ENHANCEMENT FOR CARDS
  // ========================================
  const announcementCards = document.querySelectorAll('.announcement-card');
  announcementCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'transform 0.3s, box-shadow 0.3s, border-color 0.3s';
    });
  });

  // ========================================
  // ADD ACTIVE CLASS TO CURRENT PAGE
  // ========================================
  function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
    
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

  // ========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS (if any)
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== "#") {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ========================================
  // OPTIONAL: LOAD ANNOUNCEMENTS FROM JSON
  // (Uncomment if you want to fetch from a data source)
  // ========================================
  // function loadAnnouncements() {
  //   fetch('announcements-data.json')
  //     .then(response => response.json())
  //     .then(data => {
  //       const container = document.querySelector('.announcements');
  //       if (container && data.announcements) {
  //         container.innerHTML = '';
  //         data.announcements.forEach(announcement => {
  //           const card = createAnnouncementCard(announcement);
  //           container.appendChild(card);
  //         });
  //       }
  //     })
  //     .catch(error => console.error('Error loading announcements:', error));
  // }
  //
  // function createAnnouncementCard(announcement) {
  //   const card = document.createElement('div');
  //   card.className = 'announcement-card';
  //   card.innerHTML = `
  //     <img src="${announcement.image || 'LBAlogo.png'}" alt="${announcement.title}">
  //     <h2>${announcement.title}</h2>
  //     <p>${announcement.summary || announcement.content.substring(0, 120)}...</p>
  //     <a href="announcement-detail.html?id=${announcement.id}" class="read-more">Read More</a>
  //   `;
  //   return card;
  // }
  //
  // // Uncomment to load dynamic announcements
  // // loadAnnouncements();

});