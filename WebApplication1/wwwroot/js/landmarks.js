// ========================================
// LANDMARKS PAGE JAVASCRIPT
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

  // ========================================
  // SET CURRENT YEAR IN FOOTER
  // ========================================
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // ========================================
  // LANDMARK DATA ARRAY
  // ========================================
  const landmarks = [
    {
      title: "Laguna BelAir 4 Homeowners Association Inc.",
      description: "The main administrative office for Laguna BelAir 4, where residents can submit concerns, pay dues, and get assistance with community matters.",
      locationDescription: "Laguna BelAir 4 Homeowners Association Inc.",
      locationDetails: "The HOA office is open Monday to Friday, 8:00 AM to 5:00 PM. Residents can visit for inquiries, document requests, and community concerns.",
      address: "Phase 3, Block 15 Alpine Street, Brgy. Don Jose, Santa Rosa, Laguna 4026",
      image: "sample.jpg",
      iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3868.516986757668!2d121.08090847585917!3d14.254847086230168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d7c99e30ad4b%3A0x3e9c8c4ef2eb0a78!2sLaguna%20BelAir%204!5e0!3m2!1sen!2sph!4v1707480000000!5m2!1sen!2sph"
    },
    {
      title: "Enchanted Kingdom",
      description: "A popular theme park located in Santa Rosa, Laguna. It offers various rides and attractions for all ages, making it a favorite destination for families.",
      locationDescription: "Enchanted Kingdom Theme Park",
      locationDetails: "This landmark is easily accessible via the South Luzon Expressway (SLEX). Parking is available on-site. Open daily from 10:00 AM to 9:00 PM.",
      address: "San Lorenzo South, RSBS Boulevard, Santa Rosa, 4026 Laguna",
      image: "sample.jpg",
      iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3869.8!2d121.08348466253851!3d14.283871337954254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d81665878673%3A0xfea80f4c6bce9f6c!2sEnchanted%20Kingdom!5e0!3m2!1sen!2sph!4v1707480000000!5m2!1sen!2sph"
    },
    {
      title: "Clubhouse & Covered Court",
      description: "The community clubhouse serves as a gathering place for residents, hosting events, meetings, and recreational activities. The covered court is available for basketball and other sports.",
      locationDescription: "LBA4 Clubhouse",
      locationDetails: "The clubhouse can be reserved for private events. The covered court is open to all residents during daylight hours. Please coordinate with the HOA for reservations.",
      address: "Central Area, Laguna BelAir 4, Santa Rosa, Laguna",
      image: "sample.jpg",
      iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3868.5!2d121.0683!3d14.2689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDE2JzAwLjAiTiAxMjHCsDA0JzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1707480000000!5m2!1sen!2sph"
    }
  ];

  // ========================================
  // DOM ELEMENTS
  // ========================================
  const landmarkImage = document.getElementById('landmark-image');
  const landmarkTitle = document.getElementById('landmark-title');
  const landmarkDescription = document.getElementById('landmark-description');
  const locationDescription = document.getElementById('location-description');
  const locationDetails = document.getElementById('location-details');
  const landmarkAddress = document.getElementById('landmark-address');
  const mapIframe = document.getElementById('map-iframe');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Current slide index
  let currentSlide = 0;

  // ========================================
  // FUNCTION TO UPDATE SLIDE
  // ========================================
  function updateSlide(index) {
    // Handle placeholder image if sample.jpg doesn't exist
    const imgSrc = landmarks[index].image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='210' font-family='Arial' font-size='24' fill='%23999' text-anchor='middle'%3ENo image available%3C/text%3E%3C/svg%3E";
    
    if (landmarkImage) {
      landmarkImage.src = imgSrc;
      // Add error handling for broken images
      landmarkImage.onerror = function() {
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='210' font-family='Arial' font-size='24' fill='%23999' text-anchor='middle'%3ENo image available%3C/text%3E%3C/svg%3E";
      };
    }
    
    if (landmarkTitle) landmarkTitle.textContent = landmarks[index].title;
    if (landmarkDescription) landmarkDescription.textContent = landmarks[index].description;
    if (locationDescription) locationDescription.textContent = landmarks[index].locationDescription;
    if (locationDetails) locationDetails.textContent = landmarks[index].locationDetails;
    if (landmarkAddress) landmarkAddress.textContent = landmarks[index].address;
    if (mapIframe) mapIframe.src = landmarks[index].iframe;
    
    console.log("Slide updated to:", landmarks[index].title);
  }

  // ========================================
  // INITIALIZE FIRST SLIDE
  // ========================================
  updateSlide(currentSlide);

  // ========================================
  // PREVIOUS BUTTON CLICK HANDLER
  // ========================================
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      currentSlide = (currentSlide - 1 + landmarks.length) % landmarks.length;
      updateSlide(currentSlide);
    });
  }

  // ========================================
  // NEXT BUTTON CLICK HANDLER
  // ========================================
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      currentSlide = (currentSlide + 1) % landmarks.length;
      updateSlide(currentSlide);
    });
  }

  // ========================================
  // KEYBOARD NAVIGATION FOR SLIDESHOW
  // ========================================
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      if (prevBtn) {
        currentSlide = (currentSlide - 1 + landmarks.length) % landmarks.length;
        updateSlide(currentSlide);
      }
    } else if (e.key === 'ArrowRight') {
      if (nextBtn) {
        currentSlide = (currentSlide + 1) % landmarks.length;
        updateSlide(currentSlide);
      }
    }
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
          (currentPath.includes('landmarks') && linkHref === 'landmarks.html') ||
          (currentPath === '/' && linkHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  setActiveNav();

  // ========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
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

  console.log('%c Landmarks Page Loaded ✓', 'color:#0a4d3c;font-weight:bold');
});