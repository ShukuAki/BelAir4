// ========================================
// CONTACT FORM HANDLER
// Updated to work with new header/hero design
// ========================================

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

  // Set footer year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ========================================
  // SMOOTH SCROLL FOR INTERNAL LINKS
  // ========================================
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
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
          (currentPath.includes('contacts') && linkHref === 'contacts.html') ||
          (currentPath === '/' && linkHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  setActiveNav();

  // ========================================
  // SCROLL ANIMATIONS
  // ========================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.office-info-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'info') {
  const existing = document.querySelector('.lba4-toast');
  if (existing) existing.remove();

  const icons = {
    info: 'fa-circle-info',
    warn: 'fa-triangle-exclamation',
    error: 'fa-circle-xmark'
  };
  const colors = {
    info: '#0a4d3c',
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
  }, 4000);
}