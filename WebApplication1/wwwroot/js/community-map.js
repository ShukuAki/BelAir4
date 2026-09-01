/* =======================================================
community-map.js — Laguna BelAir 4 Community Map
Updated to work with new header/hero design
Four categories:
Incident  — pending | in-progress | resolved      (red)
Concern   — pending | in-progress | resolved      (purple)
Project   — planned | ongoing | completed         (orange)
Landmark  — permanent locations, icon per item    (blue)
Resident-submitted incidents from lba4_incidents
(mapApproved=true) also appear under Incidents.
Detail modal: click any marker → full popup
with description, status, and before/after photos.
======================================================= */
document.addEventListener('DOMContentLoaded', function () {
  
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

  const CENTER = [14.268997281118446, 121.06832877618916];
  const POLY   = [
    [14.27224386576994,  121.06872562180403],
    [14.26821184430071,  121.06584048424482],
    [14.265360237729556, 121.06580294014364],
    [14.266069876482966, 121.071074765642]
  ];
  const BOUNDS = L.latLngBounds(
    [14.265360237729556, 121.06580294014364],
    [14.27224386576994,  121.071074765642]
  );

  /* ── Category config ── */
  const CAT = {
    Incident: { color:'#c0392b', icon:'fa-exclamation-circle', label:'Incident'              },
    Concern:  { color:'#8e44ad', icon:'fa-comment-alt',        label:'Concern'               },
    Project:  { color:'#c0621a', icon:'fa-hard-hat',           label:'Project / Maintenance' },
    Landmark: { color:'#1a5fa8', icon:'fa-map-marker-alt',     label:'Landmark'              }
  };
  const STATUS_COLOUR = {
    pending:       '#f9a825',
    'in-progress': '#1a5fa8',
    resolved:      '#5aaa4f',
    planned:       '#9e9a94',
    ongoing:       '#c0621a',
    completed:     '#5aaa4f'
  };

  /* ── Map init ── */
  const map = L.map('map', {
    center: CENTER, zoom: 17,
    minZoom: 15, maxZoom: 19, zoomControl: true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  L.polygon(POLY, {
    color:'#0a4d3c', fillColor:'#0a4d3c', fillOpacity:0.06, weight:2
  }).addTo(map);
  L.marker(CENTER, {
    icon: L.divIcon({
      className: '',
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#0a4d3c;
      border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.3);
      display:flex;align-items:center;justify-content:center">
      <i class="fas fa-building" style="color:white;font-size:13px"></i></div>`,
      iconSize:[32,32], iconAnchor:[16,16]
    })
  }).addTo(map).bindPopup('<strong style="font-family:DM Sans,sans-serif">HOA Office</strong><br><small>Laguna BelAir 4</small>');
  setTimeout(() => map.fitBounds(BOUNDS, { padding:[30,30] }), 100);

  /* ── Layer groups per category ── */
  const incidentHeatLayer = L.layerGroup().addTo(map);
  const layers = {
    Incident: L.layerGroup().addTo(map),
    Concern:  L.layerGroup().addTo(map),
    Project:  L.layerGroup().addTo(map),
    Landmark: L.layerGroup().addTo(map)
  };

  /* ── Layer toggle checkboxes ── */
  [
    ['toggleIncidents', 'Incident'],
    ['toggleConcerns',  'Concern'],
    ['toggleProjects',  'Project'],
    ['toggleLandmarks', 'Landmark']
  ].forEach(([id, cat]) => {
    document.getElementById(id)?.addEventListener('change', function () {
      if (this.checked) {
        map.addLayer(layers[cat]);
        if (cat === 'Incident') map.addLayer(incidentHeatLayer);
      } else {
        map.removeLayer(layers[cat]);
        if (cat === 'Incident') map.removeLayer(incidentHeatLayer);
      }
    });
  });

  function makeIncidentHeatCircle(report) {
    const status = (report.status || '').toLowerCase();
    if (status === 'resolved') return null;

    const color = status === 'in-progress' ? STATUS_COLOUR['in-progress']
      : CAT.Incident.color;

    return L.circle([report.lat, report.lng], {
      radius: 55,
      stroke: true,
      color,
      weight: 1,
      opacity: 0.35,
      fillColor: color,
      fillOpacity: 0.18,
      interactive: false
    });
  }

  /* ── Icon builder ── */
  function makeIcon(item) {
    const cat  = (typeof item === 'string') ? item : item.category;
    const cfg  = CAT[cat] || CAT.Landmark;
    const icon = (cat === 'Landmark' && item && item.icon) ? item.icon : cfg.icon;
    return L.divIcon({
      className: '',
      html: `<div style="width:34px;height:34px;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${cfg.color};border:2.5px solid white;
      box-shadow:0 3px 10px rgba(0,0,0,.28);
      display:flex;align-items:center;justify-content:center">
      <i class="fas ${icon}" style="transform:rotate(45deg);color:white;font-size:12px"></i>
      </div>`,
      iconSize:[34,34], iconAnchor:[17,34]
    });
  }

  /* ── Badge builders ── */
  function catBadge(cat) {
    const cfg = CAT[cat] || CAT.Landmark;
    return `<span class="cm-badge" style="background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}44">${cfg.label}</span>`;
  }
  function statusBadge(status) {
    if (!status) return '';
    const col = STATUS_COLOUR[status] || '#9e9a94';
    const lbl = status.replace(/-/g,' ').replace(/\b\w/g, s => s.toUpperCase());
    return `<span class="cm-badge" style="background:${col}22;color:${col};border:1px solid ${col}44">${lbl}</span>`;
  }

  /* ── Data readers ── */
  async function readMapItems() {
    try {
      const response = await PageCoordinator.api.get('/api/landmarks');
      return (response.data || []).map(l => ({
        id: l.id,
        category: 'Landmark',
        name: l.name,
        description: l.description || '',
        status: '',
        icon: l.icon || 'fa-map-marker-alt',
        lat: l.latitude,
        lng: l.longitude,
        active: true
      }));
    } catch (err) {
      console.error('Error loading landmarks:', err);
      return [];
    }
  }
  async function readResidentReports() {
    try {
      const response = await PageCoordinator.api.get('/api/incidents');
      return (response.data || [])
        .filter(r => r.latitude && r.longitude)
        .map(r => ({
          _isReport: true,
          id: 'rpt-' + r.id,
          category: 'Incident',
          name: (r.description || '').substring(0, 60),
          description: r.description || '',
          status: r.status || 'pending',
          icon: '',
          beforeImage: r.image || '',
          afterImage: '',
          lat: r.latitude,
          lng: r.longitude,
          active: true
        }));
    } catch (err) {
      console.error('Error loading incidents:', err);
      return [];
    }
  }

  /* ── Detail Modal ── */
  const overlay = document.getElementById('cmDetailOverlay');
  function openDetail(item) {
    /* Title */
    document.getElementById('cmDetailTitle').textContent = item.name || '—';
    /* Header accent */
    const cfg = CAT[item.category] || CAT.Landmark;
    document.getElementById('cmDetailHeader').style.borderBottom = `3px solid ${cfg.color}`;
    /* Badges */
    document.getElementById('cmDetailBadges').innerHTML =
      catBadge(item.category) + (item.status ? ' ' + statusBadge(item.status) : '');
    /* Description */
    const descEl = document.getElementById('cmDetailDescription');
    if (item.description) {
      descEl.textContent = item.description;
      descEl.style.display = '';
    } else {
      descEl.style.display = 'none';
    }
    /* Info rows */
    document.getElementById('cmDetailInfo').innerHTML = '';
    /* Before / After */
    const hasPhoto = !!(item.beforeImage || item.afterImage);
    const isReportCat = item.category === 'Incident' || item.category === 'Concern';
    document.getElementById('cmBeforeAfter').style.display = hasPhoto ? '' : 'none';
    document.getElementById('cmNoImage').style.display     = (!hasPhoto && isReportCat) ? '' : 'none';
    const bPanel = document.getElementById('cmBeforePanel');
    const aPanel = document.getElementById('cmAfterPanel');
    const bImg   = document.getElementById('cmBeforeImg');
    const aImg   = document.getElementById('cmAfterImg');
    if (item.beforeImage) {
      bImg.src = item.beforeImage; bPanel.style.display = '';
    } else {
      bImg.src = ''; bPanel.style.display = item.afterImage ? 'none' : '';
    }
    if (item.afterImage) {
      aImg.src = item.afterImage; aPanel.style.display = '';
    } else {
      aImg.src = ''; aPanel.style.display = item.beforeImage ? 'none' : '';
    }
    overlay.classList.add('open');
  }
  window.closeCmDetail = function () { overlay.classList.remove('open'); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCmDetail(); });

  /* ── Render all markers ── */
  async function renderMap() {
    incidentHeatLayer.clearLayers();
    Object.values(layers).forEach(l => l.clearLayers());
    const items   = (await readMapItems()).filter(r => r.active !== false && r.lat && r.lng);
    const reports = await readResidentReports();
    const allData = [...items, ...reports];
    /* Staff-managed items */
    items.forEach(item => {
      const m = L.marker([item.lat, item.lng], { icon: makeIcon(item) });
      m.on('click', e => { L.DomEvent.stopPropagation(e); openDetail(item); });
      const cfg = CAT[item.category] || CAT.Landmark;
      m.bindTooltip(
        `<strong>${esc(item.name)}</strong><br><small style="color:${cfg.color}">${cfg.label}</small>`,
        { direction:'top', className:'cm-tooltip' }
      );
      (layers[item.category] || layers.Landmark).addLayer(m);
    });
    /* Resident-submitted reports */
    reports.forEach(report => {
      const heatCircle = makeIncidentHeatCircle(report);
      if (heatCircle) incidentHeatLayer.addLayer(heatCircle);
      const m = L.circleMarker([report.lat, report.lng], {
        radius:8, fillColor: CAT.Incident.color,
        color:'white', weight:2, fillOpacity:0.9
      });
      m.on('click', e => { L.DomEvent.stopPropagation(e); openDetail(report); });
      m.bindTooltip(
        `<strong>Resident Report</strong><br><small>${esc(report.name.substring(0,35))}</small>`,
        { direction:'top', className:'cm-tooltip' }
      );
      layers.Incident.addLayer(m);
    });
    map.on('click', closeCmDetail);
    updateStats(items, reports);
  }

  /* ── Stats ── */
  function updateStats(items, reports) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('stat-incidents', items.filter(r=>r.category==='Incident').length + reports.length);
    set('stat-resolved',
      items.filter(r=>(r.category==='Incident'||r.category==='Concern')&&r.status==='resolved').length
      + reports.filter(r=>r.status==='resolved').length);
    set('stat-projects', items.filter(r=>r.category==='Project').length);
  }

  /* ── Real-time sync ── */
  window.addEventListener('lba4:mapitems:update', renderMap);
  window.addEventListener('lba4:update', renderMap);
  window.addEventListener('storage', e => {
    if (e.key==='lba4_map_items' || e.key==='lba4_incidents') renderMap();
  });

  /* ── Escape html ── */
  function esc(str) {
    return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Boot ── */
  renderMap();

  /* ── Scroll animations ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity='1';
        e.target.style.transform='translateY(0)';
      }
    });
  }, { threshold:0.1 });
  document.querySelectorAll('.stat-card').forEach(el => {
    el.style.opacity='0';
    el.style.transform='translateY(20px)';
    el.style.transition='opacity .5s ease, transform .5s ease';
    obs.observe(el);
  });

  /* ── Footer year ── */
  const footerYear = document.getElementById('current-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ── Set active nav ── */
  function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPath ||
          (currentPath.includes('community-map') && linkHref === 'community-map.html') ||
          (currentPath === '/' && linkHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  setActiveNav();

  console.log('%c LBA4 Community Map — 4 categories ✓', 'color:#0a4d3c;font-weight:bold');
});