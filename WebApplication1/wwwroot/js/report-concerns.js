/**
 * report-concerns.js
 * NLP-Ready Issue Reporting System — Laguna BelAir 4
 *
 * Data submitted to localStorage (or future API):
 *   description, latitude, longitude, imageFilename,
 *   anonymous, reporterName, reporterContact, timestamp
 *
 * Fields intentionally NOT collected:
 *   priority, type, category, visibility
 *   → These are assigned by Staff Dashboard NLP pipeline
 *
 * [BACKEND] Replace LBA4Storage.incidents.submit() with:
 *   fetch('/api/incidents', { method:'POST', body: JSON.stringify(payload) })
 */

'use strict';

/* ═══════════════════════════════════════════
   VILLAGE GEOGRAPHY
═══════════════════════════════════════════ */
const VILLAGE = {
  center:    [14.268997281118446, 121.06832877618916],
  bounds: [
    [14.265360237729556, 121.06580294014364], // SW
    [14.27224386576994,  121.06872562180403], // NE
  ],
  polygon: [
    [14.27224386576994,  121.06872562180403], // NE
    [14.26821184430071,  121.06584048424482], // NW
    [14.265360237729556, 121.06580294014364], // SW
    [14.266069876482966, 121.071074765642],   // SE
  ]
};

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
const state = {
  map: null,
  marker: null,
  lat: null,
  lng: null,
  photoFile: null,
};

/* ═══════════════════════════════════════════
   DOM REFERENCES
═══════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const dom = {
  form:              $('reportForm'),
  description:       $('f-description'),
  charCount:         $('char-count'),
  latInput:          $('f-latitude'),
  lngInput:          $('f-longitude'),
  timestampInput:    $('f-timestamp'),
  /* Location toggle */
  addressFields:     $('address-fields'),
  mapContainer:      $('map-container'),
  addressInput:      $('f-address'),
  streetInput:       $('f-street'),
  additionalLoc:     $('f-additional-location'),
  /* Map */
  mapHint:           $('mapHint'),
  locationStatus:    $('locationStatus'),
  locationText:      $('locationStatusText'),
  btnLocate:         $('btnLocate'),
  /* Category */
  categorySelect:    $('f-category'),
  /* Photo */
  uploadZone:        $('uploadZone'),
  fileInput:         $('f-photo'),
  uploadIdle:        $('uploadIdle'),
  uploadPreview:     $('uploadPreview'),
  previewImg:        $('previewImg'),
  removePhoto:       $('removePhoto'),
  /* Anonymous / reporter */
  anonymousChk:      $('f-anonymous'),
  reporterSection:   $('reporterSection'),
  /* Submit */
  confirmChk:        $('f-confirm'),
  btnSubmit:         $('btnSubmit'),
  btnSubmitText:     document.querySelector('.btn-submit-text'),
  btnSubmitLoad:     document.querySelector('.btn-submit-loading'),
  /* Modal */
  successModal:      $('successModal'),
  modalRef:          $('modalRef'),
  footerYear:        $('footerYear'),
};

/* ═══════════════════════════════════════════
   MOBILE DROPDOWN TOGGLE SUPPORT
═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setTimestamp();
  setFooterYear();
  bindLocationToggle();
  bindDescription();
  bindUploadZone();
  bindAnonymousToggle();
  bindConfirmCheckbox();
  bindFormSubmit();
  setActiveNav();
});

function setActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath ||
        (currentPath.includes('report-concerns') && linkHref === 'report-concerns.html') ||
        (currentPath === '/' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ═══════════════════════════════════════════
   TIMESTAMP
═══════════════════════════════════════════ */
function setTimestamp() {
  dom.timestampInput.value = new Date().toISOString();
}

function setFooterYear() {
  if (dom.footerYear) dom.footerYear.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════
   LOCATION METHOD TOGGLE
═══════════════════════════════════════════ */
function bindLocationToggle() {
  const radios = document.querySelectorAll('input[name="search-type"]');
  radios.forEach(r => r.addEventListener('change', toggleLocationMethod));
}

function toggleLocationMethod() {
  const val = document.querySelector('input[name="search-type"]:checked').value;
  if (val === 'address') {
    dom.addressFields.style.display = 'block';
    dom.mapContainer.style.display  = 'none';
  } else {
    dom.addressFields.style.display = 'none';
    dom.mapContainer.style.display  = 'block';
    if (!state.map) initMap();
    else setTimeout(() => state.map.invalidateSize(), 100);
  }
}

// expose for inline onchange
window.toggleLocationMethod = toggleLocationMethod;

/* ═══════════════════════════════════════════
   MAP
═══════════════════════════════════════════ */
function initMap() {
  const map = L.map('map', {
    center: VILLAGE.center,
    zoom: 17,
    minZoom: 15,
    maxZoom: 19,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Village boundary overlay
  L.polygon(VILLAGE.polygon, {
    color: '#0a4d3c',
    fillColor: '#0a4d3c',
    fillOpacity: 0.06,
    weight: 2,
    dashArray: '6,4',
  }).addTo(map);

  // HOA Office marker
  L.marker(VILLAGE.center, {
    icon: L.divIcon({
      className: '',
      html: '<div style="background:#0a4d3c;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.35);"><i class="fas fa-building"></i></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  }).addTo(map).bindPopup('<strong>HOA Office</strong>');

  // Click to pin
  map.on('click', e => {
    const pt = [e.latlng.lat, e.latlng.lng];
    if (isInPolygon(pt)) {
      placePin(map, e.latlng);
    } else {
      showToast('Please select a location within Laguna BelAir 4 boundaries.', 'warn');
    }
  });

  // Fit bounds
  map.fitBounds(VILLAGE.bounds, { padding: [20, 20] });

  state.map = map;

  // Locate button
  dom.btnLocate.addEventListener('click', useCurrentLocation);
}

function placePin(map, latlng) {
  if (state.marker) map.removeLayer(state.marker);

  state.marker = L.marker(latlng, {
    draggable: true,
    icon: L.divIcon({
      className: '',
      html: `<div style="position:relative;width:36px;height:36px;">
               <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);color:#c0392b;font-size:36px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));">
                 <i class="fas fa-map-pin"></i>
               </div>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    }),
  }).addTo(map);

  // Update state when dragged
  state.marker.on('dragend', e => {
    const pos = e.target.getLatLng();
    if (isInPolygon([pos.lat, pos.lng])) {
      updateCoords(pos.lat, pos.lng);
    } else {
      showToast('Marker moved outside village boundaries — please reposition.', 'warn');
      state.marker.setLatLng({ lat: state.lat, lng: state.lng });
    }
  });

  updateCoords(latlng.lat, latlng.lng);

  // Hide hint after first pin
  if (dom.mapHint) dom.mapHint.classList.add('hidden');
}

function updateCoords(lat, lng) {
  state.lat = lat;
  state.lng = lng;
  dom.latInput.value  = lat.toFixed(7);
  dom.lngInput.value  = lng.toFixed(7);
  dom.locationStatus.classList.add('pinned');
  dom.locationText.textContent =
    `Location pinned — ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  dom.locationStatus.querySelector('i').className = 'fas fa-map-pin';
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    return;
  }
  dom.btnLocate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating…';
  dom.btnLocate.disabled  = true;

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      if (isInPolygon([lat, lng])) {
        state.map.setView([lat, lng], 18);
        placePin(state.map, L.latLng(lat, lng));
      } else {
        state.map.setView([lat, lng], 16);
        showToast('Your location is outside Laguna BelAir 4. Please pin manually.', 'warn');
      }
      resetLocateBtn();
    },
    () => {
      showToast('Unable to access your location. Please pin on the map.', 'error');
      resetLocateBtn();
    }
  );
}

function resetLocateBtn() {
  dom.btnLocate.innerHTML = '<i class="fas fa-crosshairs"></i> Use My Current Location';
  dom.btnLocate.disabled  = false;
}

/* ═══════════════════════════════════════════
   POLYGON CHECK
═══════════════════════════════════════════ */
function isInPolygon(point) {
  const poly = VILLAGE.polygon;
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/* ═══════════════════════════════════════════
   DESCRIPTION + CHAR COUNTER
═══════════════════════════════════════════ */
function bindDescription() {
  dom.description.addEventListener('input', () => {
    const len = dom.description.value.length;
    dom.charCount.textContent = len;
    if (len > 1800) dom.charCount.style.color = '#d97706';
    else            dom.charCount.style.color = '';
  });
}

/* ═══════════════════════════════════════════
   PHOTO UPLOAD
═══════════════════════════════════════════ */
function bindUploadZone() {
  const zone  = dom.uploadZone;
  const input = dom.fileInput;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') input.click(); });

  // Drag and drop
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) handlePhotoFile(input.files[0]);
  });

  dom.removePhoto.addEventListener('click', e => {
    e.stopPropagation();
    clearPhoto();
  });
}

function handlePhotoFile(file) {
  const MAX_MB = 10;
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file (JPG, PNG, WEBP).', 'error');
    return;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    showToast(`File is too large. Maximum size is ${MAX_MB} MB.`, 'error');
    return;
  }

  state.photoFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    dom.previewImg.src = e.target.result;
    dom.uploadIdle.style.display    = 'none';
    dom.uploadPreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function clearPhoto() {
  state.photoFile = null;
  dom.fileInput.value = '';
  dom.previewImg.src = '';
  dom.uploadIdle.style.display    = 'flex';
  dom.uploadPreview.style.display = 'none';
}

/* ═══════════════════════════════════════════
   ANONYMOUS TOGGLE
═══════════════════════════════════════════ */
function bindAnonymousToggle() {
  dom.anonymousChk.addEventListener('change', () => {
    dom.reporterSection.style.display = dom.anonymousChk.checked ? 'none' : 'block';
  });
}

/* ═══════════════════════════════════════════
   CONFIRM CHECKBOX → ENABLE SUBMIT
═══════════════════════════════════════════ */
function bindConfirmCheckbox() {
  dom.confirmChk.addEventListener('change', () => {
    dom.btnSubmit.disabled = !dom.confirmChk.checked;
  });
}

/* ═══════════════════════════════════════════
   FORM SUBMISSION
═══════════════════════════════════════════ */
function bindFormSubmit() {
  dom.form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate description
    const description = dom.description.value.trim();
    if (!description) {
      dom.description.focus();
      showToast('Please describe the issue before submitting.', 'error');
      return;
    }

    // Validate location — map pin required only when map mode is selected
    const searchType = document.querySelector('input[name="search-type"]:checked').value;
    if (searchType === 'map' && (!state.lat || !state.lng)) {
      showToast('Please pin the location of the issue on the map.', 'error');
      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Build FormData for multipart (supports photo upload)
    const fd = new FormData();
    fd.append('description', description);
    fd.append('category', dom.categorySelect.value || '');
    fd.append('anonymous', dom.anonymousChk.checked ? 'true' : 'false');

    if (searchType === 'address') {
      fd.append('address', dom.addressInput.value.trim() || '');
      fd.append('street',  dom.streetInput.value.trim()  || '');
    }
    if (state.lat) fd.append('latitude',  state.lat.toFixed(7));
    if (state.lng) fd.append('longitude', state.lng.toFixed(7));
    if (dom.additionalLoc.value.trim()) fd.append('additionalLocation', dom.additionalLoc.value.trim());

    if (!dom.anonymousChk.checked) {
      fd.append('reporterName',    $('f-name')?.value.trim()    || '');
      fd.append('reporterContact', $('f-contact')?.value.trim() || '');
    }
    if (state.photoFile) fd.append('photo', state.photoFile);

    setSubmitLoading(true);

    try {
      const res  = await fetch('/api/concerns/report', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        showToast(data.error || 'Failed to submit report. Please try again.', 'error');
        setSubmitLoading(false);
        return;
      }

      setSubmitLoading(false);
      showSuccess(data.reference || data.id || 'REF-???');
    } catch (err) {
      console.error('[LBA4] Submit error:', err);
      showToast('Failed to submit report. Please try again.', 'error');
      setSubmitLoading(false);
    }
  });
}

function setSubmitLoading(loading) {
  dom.btnSubmit.disabled        = loading;
  dom.btnSubmitText.style.display = loading ? 'none'         : 'inline-flex';
  dom.btnSubmitLoad.style.display = loading ? 'inline-flex'  : 'none';
}

/* ═══════════════════════════════════════════
   SUCCESS MODAL
═══════════════════════════════════════════ */
function showSuccess(refNumber) {
  dom.modalRef.textContent   = refNumber;
  dom.successModal.style.display = 'flex';
  document.body.style.overflow   = 'hidden';
}

function closeModal() {
  dom.successModal.style.display = 'none';
  document.body.style.overflow   = '';
  resetForm();
}

// Expose to inline HTML
window.closeModal = closeModal;

function resetForm() {
  dom.form.reset();
  setTimestamp();
  clearPhoto();
  state.lat = null;
  state.lng = null;

  if (state.marker && state.map) {
    state.map.removeLayer(state.marker);
    state.marker = null;
  }

  if (dom.mapHint) dom.mapHint.classList.remove('hidden');
  if (dom.locationStatus) dom.locationStatus.classList.remove('pinned');
  if (dom.locationText) dom.locationText.textContent = 'No location selected yet.';
  if (dom.locationStatus) dom.locationStatus.querySelector('i').className = 'fas fa-circle-info';

  // Reset to address mode
  dom.addressFields.style.display = 'block';
  dom.mapContainer.style.display  = 'none';

  dom.reporterSection.style.display = 'block';
  dom.btnSubmit.disabled = true;

  dom.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.lba4-toast');
  if (existing) existing.remove();

  const icons = { info: 'fa-circle-info', warn: 'fa-triangle-exclamation', error: 'fa-circle-xmark' };
  const colors = { info: '#0a4d3c', warn: '#d97706', error: '#c0392b' };

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

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }