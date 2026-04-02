/* ============================================================
   staff-dashboard.js  — Laguna BelAir 4 Staff Portal
   Complete with Ad Approvals Management
   - Pending Ads: Accept, Reject, Cancel, View buttons
   - Published Ads: Edit, Delete, View buttons
   - localStorage persistence for ads
   - Full original functionality preserved
============================================================ */
'use strict';

/* ============================================================
   VILLAGE GEOGRAPHY — updated + relaxed bounds
============================================================ */
const LBA4 = {
  center: [14.268997281118446, 121.06832877618916],
  zoom: 16,
  bounds: [
    [14.2635, 121.0640],
    [14.2740, 121.0730]
  ],
  boundary: [
    [14.27224386576994,  121.06872562180403],
    [14.26821184430071,  121.06584048424482],
    [14.265360237729556, 121.06580294014364],
    [14.266069876482966, 121.071074765642],
    [14.27224386576994,  121.06872562180403]
  ]
};

/* ============================================================
   INCIDENT DATA
============================================================ */
const INCIDENTS = [];
const PRIORITY_COLOURS = { high:'#c0392b', medium:'#c0621a', low:'#5aaa4f' };

/* ============================================================
   MAP INSTANCES
============================================================ */
let mainMap = null, previewMap = null;
let heatLayer = null, markerLayer = null;
let editLandmarkMap = null, editLandmarkMarker = null;
let addLandmarkMap  = null, addLandmarkMarker  = null;
let cmMap = null, cmMarkers = {}, cmFilter = 'all';
let cmAddMap = null, cmAddMarker = null;
let cmEditMap = null, cmEditMarker = null;
let staffIncMap = null, staffIncMarker = null;

/* ============================================================
   ADS DATA MANAGEMENT
============================================================ */
const DEFAULT_ADS = {
  pending: [
    { id: "ad_001", title: "Homemade Lunch Boxes", seller: "Pedro Cruz", sellerLocation: "Block A, H5", category: "Food & Catering", price: "₱120/box", description: "Delicious homemade meals prepared fresh daily.", status: "pending", submittedAt: "Feb 18, 2026", image: "🍱" },
    { id: "ad_002", title: "Home Repair & Plumbing", seller: "Ben Ocampo", sellerLocation: "Block C, H12", category: "Services", price: "Rates negotiable", description: "Professional home repair, plumbing, and electrical services.", status: "pending", submittedAt: "Feb 17, 2026", image: "🛠️" },
    { id: "ad_003", title: "Custom Cakes & Pastries", seller: "Cynthia Ramos", sellerLocation: "Block B, H8", category: "Food & Catering", price: "₱350/cake", description: "Custom cakes for birthdays and special occasions.", status: "pending", submittedAt: "Feb 16, 2026", image: "🧁" }
  ],
  published: [
    { id: "pub_001", title: "Fresh Vegetables", seller: "Nena Bautista", sellerLocation: "Block D, H3", category: "Food & Catering", price: "₱50-₱200 per kg", description: "Fresh organic vegetables delivered weekly.", status: "published", publishedAt: "Feb 15, 2026", image: "🥬" },
    { id: "pub_002", title: "Math Tutoring", seller: "Nico Santos", sellerLocation: "Block A, H9", category: "Services", price: "₱300/hour", description: "Math tutoring for grades 1-12.", status: "published", publishedAt: "Feb 12, 2026", image: "📐" },
    { id: "pub_003", title: "Garden Maintenance", seller: "Ramon Villanueva", sellerLocation: "Block C, H2", category: "Services", price: "₱500/session", description: "Lawn mowing and garden maintenance.", status: "published", publishedAt: "Feb 10, 2026", image: "🌿" }
  ]
};

function loadAds() {
  try {
    const stored = localStorage.getItem('lba4_ads');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.pending && data.published) return data;
    }
  } catch (e) {}
  localStorage.setItem('lba4_ads', JSON.stringify(DEFAULT_ADS));
  return { pending: [...DEFAULT_ADS.pending], published: [...DEFAULT_ADS.published] };
}

function saveAds(pending, published) {
  localStorage.setItem('lba4_ads', JSON.stringify({ pending, published }));
  window.dispatchEvent(new CustomEvent('lba4:ads:update'));
}

function getAds() { return loadAds(); }

function approveAd(adId) {
  const ads = getAds();
  const index = ads.pending.findIndex(ad => ad.id === adId);
  if (index !== -1) {
    const approvedAd = { ...ads.pending[index], status: "published", publishedAt: new Date().toLocaleString('en-PH', { year:'numeric', month:'short', day:'numeric' }) };
    delete approvedAd.submittedAt;
    ads.published.unshift(approvedAd);
    ads.pending.splice(index, 1);
    saveAds(ads.pending, ads.published);
    renderAdsDashboard();
    showToast(`✅ Ad "${approvedAd.title}" approved`, 'success');
    updateOverviewAdStats();
  }
}

function rejectAd(adId) {
  const ads = getAds();
  const index = ads.pending.findIndex(ad => ad.id === adId);
  if (index !== -1) {
    const title = ads.pending[index].title;
    ads.pending.splice(index, 1);
    saveAds(ads.pending, ads.published);
    renderAdsDashboard();
    showToast(`❌ Ad "${title}" rejected`, 'error');
    updateOverviewAdStats();
  }
}

function cancelAd(adId) {
  const ads = getAds();
  const index = ads.pending.findIndex(ad => ad.id === adId);
  if (index !== -1) {
    const title = ads.pending[index].title;
    ads.pending.splice(index, 1);
    saveAds(ads.pending, ads.published);
    renderAdsDashboard();
    showToast(`⚠️ Ad "${title}" cancelled`, 'info');
    updateOverviewAdStats();
  }
}

function deleteAd(adId) {
  const ads = getAds();
  const index = ads.published.findIndex(ad => ad.id === adId);
  if (index !== -1 && confirm(`Delete "${ads.published[index].title}"?`)) {
    const title = ads.published[index].title;
    ads.published.splice(index, 1);
    saveAds(ads.pending, ads.published);
    renderAdsDashboard();
    showToast(`🗑️ Ad "${title}" deleted`, 'error');
  }
}

function editAd(adId) {
  const ads = getAds();
  const ad = ads.published.find(a => a.id === adId);
  if (!ad) return;
  
  let modal = document.getElementById('modal-editAd');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-editAd';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="width: 550px;">
        <div class="modal-head"><h3><i class="fas fa-edit"></i> Edit Advertisement</h3><button class="modal-close" onclick="closeModal('editAd')"><i class="fas fa-times"></i></button></div>
        <div class="form-group"><label>Title</label><input type="text" id="edit-ad-title"></div>
        <div class="form-group"><label>Seller Name</label><input type="text" id="edit-ad-seller"></div>
        <div class="form-group"><label>Location</label><input type="text" id="edit-ad-location"></div>
        <div class="form-row"><div class="form-group"><label>Category</label><select id="edit-ad-category"><option>Food & Catering</option><option>Services</option><option>Retail</option><option>Other</option></select></div><div class="form-group"><label>Price</label><input type="text" id="edit-ad-price"></div></div>
        <div class="form-group"><label>Description</label><textarea id="edit-ad-description" rows="3"></textarea></div>
        <div class="form-group"><label>Icon</label><input type="text" id="edit-ad-icon" maxlength="2" style="width: 60px"></div>
        <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('editAd')">Cancel</button><button class="btn btn-primary" id="save-edit-ad-btn"><i class="fas fa-save"></i> Save Changes</button></div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('save-edit-ad-btn')?.addEventListener('click', function() {
      const id = this.dataset.editId;
      const adsData = getAds();
      const idx = adsData.published.findIndex(a => a.id === id);
      if (idx !== -1) {
        adsData.published[idx] = { ...adsData.published[idx], title: document.getElementById('edit-ad-title').value.trim(), seller: document.getElementById('edit-ad-seller').value.trim(), sellerLocation: document.getElementById('edit-ad-location').value.trim(), category: document.getElementById('edit-ad-category').value, price: document.getElementById('edit-ad-price').value.trim(), description: document.getElementById('edit-ad-description').value.trim(), image: document.getElementById('edit-ad-icon').value.trim() || '📢' };
        saveAds(adsData.pending, adsData.published);
        renderAdsDashboard();
        closeModal('editAd');
        showToast(`✅ Ad updated`, 'success');
      }
    });
  }
  document.getElementById('edit-ad-title').value = ad.title || '';
  document.getElementById('edit-ad-seller').value = ad.seller || '';
  document.getElementById('edit-ad-location').value = ad.sellerLocation || '';
  document.getElementById('edit-ad-category').value = ad.category || 'Other';
  document.getElementById('edit-ad-price').value = ad.price || '';
  document.getElementById('edit-ad-description').value = ad.description || '';
  document.getElementById('edit-ad-icon').value = ad.image || '📢';
  document.getElementById('save-edit-ad-btn').dataset.editId = adId;
  openModal('editAd');
}

function viewAd(adId) {
  const ads = getAds();
  const ad = [...ads.pending, ...ads.published].find(a => a.id === adId);
  if (!ad) return;
  
  let modal = document.getElementById('modal-viewAd');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-viewAd';
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal" style="width: 500px;"><div class="modal-head"><h3><i class="fas fa-store"></i> Ad Details</h3><button class="modal-close" onclick="closeModal('viewAd')"><i class="fas fa-times"></i></button></div><div id="view-ad-content"></div><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('viewAd')">Close</button></div></div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('view-ad-content').innerHTML = `<div style="text-align:center;margin-bottom:20px"><div style="font-size:48px">${ad.image || '📢'}</div><h3 style="color:var(--green)">${escapeHtml(ad.title)}</h3><div>by ${escapeHtml(ad.seller)}</div></div><div class="form-group"><label>Location</label><div class="text-display">${escapeHtml(ad.sellerLocation || '—')}</div></div><div class="form-row"><div class="form-group"><label>Category</label><div class="text-display">${escapeHtml(ad.category)}</div></div><div class="form-group"><label>Price</label><div class="text-display">${escapeHtml(ad.price || '—')}</div></div></div><div class="form-group"><label>Description</label><div class="text-display">${escapeHtml(ad.description || 'No description.')}</div></div><div class="form-group"><label>Status</label><div class="text-display"><span class="status-pill ${ad.status === 'published' ? 'sp-approved' : 'sp-pending'}">${ad.status === 'published' ? 'Published' : 'Pending'}</span></div></div><div class="form-group"><label>Date</label><div class="text-display">${ad.status === 'published' ? (ad.publishedAt || ad.submittedAt) : (ad.submittedAt || '—')}</div></div>`;
  openModal('viewAd');
}

function renderAdsDashboard() {
  const ads = getAds();
  const pendingCount = ads.pending.length;
  const publishedCount = ads.published.length;
  
  const badge = document.getElementById('badge-ads-pending');
  if (badge) { badge.textContent = pendingCount; badge.style.display = pendingCount > 0 ? '' : 'none'; }
  
  const pendingContainer = document.getElementById('pending-ads-list');
  if (pendingContainer) {
    if (pendingCount === 0) pendingContainer.innerHTML = `<div class="empty-state-inline" style="padding:32px"><i class="fas fa-check-circle" style="font-size:32px;color:var(--green)"></i><span>No pending ads</span></div>`;
    else pendingContainer.innerHTML = ads.pending.map(ad => `<div class="ad-item"><div class="ad-thumb">${escapeHtml(ad.image || '📢')}</div><div class="ad-body"><div class="ad-title">${escapeHtml(ad.title)}</div><div class="ad-sub">${escapeHtml(ad.seller)} · ${escapeHtml(ad.sellerLocation || '')} · ${escapeHtml(ad.category)}</div><div class="ad-meta">${escapeHtml(ad.price || 'Price upon inquiry')}</div><div class="ad-actions"><button class="btn btn-primary btn-sm" onclick="approveAd('${ad.id}')"><i class="fas fa-check"></i> Accept</button><button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="rejectAd('${ad.id}')"><i class="fas fa-times"></i> Reject</button><button class="btn btn-outline btn-sm" style="color:var(--orange)" onclick="cancelAd('${ad.id}')"><i class="fas fa-ban"></i> Cancel</button><button class="btn btn-outline btn-sm" onclick="viewAd('${ad.id}')"><i class="fas fa-eye"></i> View</button></div></div></div>`).join('');
    const countSpan = document.getElementById('pending-ads-count');
    if (countSpan) countSpan.textContent = pendingCount;
  }
  
  const publishedContainer = document.getElementById('published-ads-list');
  if (publishedContainer) {
    if (publishedCount === 0) publishedContainer.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px">No published ads</td></tr>`;
    else publishedContainer.innerHTML = ads.published.map(ad => `<tr><td><strong>${escapeHtml(ad.title)}</strong><br><small>${escapeHtml(ad.seller)}</small></td><td><span class="tag ${ad.category === 'Food & Catering' ? 'tag-green' : ad.category === 'Services' ? 'tag-blue' : 'tag-gray'}">${escapeHtml(ad.category)}</span></td><td>${escapeHtml(ad.seller)}</td><td>${escapeHtml(ad.publishedAt || ad.submittedAt)}</td><td><span class="status-pill sp-approved">Published</span></td><td class="ad-actions-table"><button class="btn btn-outline btn-sm" onclick="editAd('${ad.id}')"><i class="fas fa-edit"></i> Edit</button><button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteAd('${ad.id}')"><i class="fas fa-trash"></i> Delete</button><button class="btn btn-outline btn-sm" onclick="viewAd('${ad.id}')"><i class="fas fa-eye"></i> View</button></td></tr>`).join('');
  }
  updateOverviewAdStats();
}

function updateOverviewAdStats() {
  const ads = getAds();
  const statVal = document.querySelector('#overview-pending-ads');
  if (statVal) statVal.textContent = ads.pending.length;
  const overviewList = document.getElementById('overview-ads-list');
  if (overviewList) {
    if (ads.pending.length === 0) overviewList.innerHTML = `<div class="empty-state-inline" style="padding:20px"><i class="fas fa-check-circle" style="color:var(--green)"></i><span>No pending ads</span></div>`;
    else overviewList.innerHTML = ads.pending.slice(0,3).map(ad => `<div class="ad-item" style="padding:10px 16px"><div class="ad-thumb" style="width:40px;height:40px;font-size:18px">${escapeHtml(ad.image || '📢')}</div><div class="ad-body"><div class="ad-title" style="font-size:12px">${escapeHtml(ad.title)}</div><div class="ad-sub" style="font-size:10px">${escapeHtml(ad.seller)} · ${escapeHtml(ad.category)}</div></div></div>`).join('');
  }
}

function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ============================================================
   PAGE NAVIGATION
============================================================ */
const PAGE_LABELS = {
  overview:'Overview', incidents:'Incident Reports', taskboard:'Task Board', communitymap:'Community Map', verification:'Resident Verification', advertisements:'Ad Approvals', forums:'Forum Moderation', reservations:'Reservations', announcements:'Announcements', events:'Events / Calendar', bods:'Committees & BODs', meetings:'Meeting Records', documents:'Forms & Documents', contacts:'Contacts', wordbank:'Word Bank', residents:'Residents', reports:'Reports', subscribers:'Subscribers'
};

function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (!target) return;
  target.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const label = PAGE_LABELS[id] || id;
  document.getElementById('breadcrumb-label').textContent = label;
  document.getElementById('topbar-title').textContent = label;
  if (id === 'communitymap') setTimeout(initCommunityMap, 80);
  if (id === 'incidents') setTimeout(initPreviewMap, 80);
  if (id === 'advertisements') renderAdsDashboard();
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('mobile-open');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main-content');
  const topbar = document.querySelector('.topbar');
  if (window.innerWidth <= 768) sidebar.classList.toggle('mobile-open');
  else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
    topbar.classList.toggle('expanded');
    setTimeout(() => { if (mainMap) mainMap.invalidateSize(); if (previewMap) previewMap.invalidateSize(); if (cmMap) cmMap.invalidateSize(); }, 280);
  }
}

/* ============================================================
   MODAL HELPERS
============================================================ */
function openModal(id) { const m = document.getElementById('modal-'+id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById('modal-'+id); if (m) m.classList.remove('open'); }
document.addEventListener('click', e=>{ if(e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open')); });

/* ============================================================
   NOTIFICATIONS
============================================================ */
function _readIncidents() { try { return JSON.parse(localStorage.getItem('lba4_incidents') || '[]'); } catch { return []; } }
function _updateNotifBadge() { const all = _readIncidents(); const unread = all.filter(r => r.status === 'open').length; const badge = document.getElementById('badge-notifications'); if (badge) { badge.textContent = unread > 9 ? '9+' : unread; badge.style.display = unread > 0 ? 'flex' : 'none'; } }

function _buildNotifications() {
  const incidents = _readIncidents();
  const dynItems = incidents.slice(0,5).map(inc => ({ initials: (inc.reporterName||'?').split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(), color: { high:'#c0392b', medium:'#c0621a', low:'#5aaa4f' }[inc.priority] || '#c0621a', name: inc.reporterName || 'Anonymous', action: `Submitted a ${inc.priority} priority report`, detail: inc.description.substring(0,60), time: inc.submittedAt || '—', unread: inc.status === 'open', onClick: () => { closeNotifModal(); openIncidentDetail(inc.id); } }));
  const staticItems = [{ initials:'AD', color:'#1a5fa8', name:'Ad Approval', action:'New ad pending review', detail:'Pending ads await approval', time:'2 hrs ago', unread:false, onClick:()=>{ closeNotifModal(); showPage('advertisements', document.querySelector('[onclick*="advertisements"]')); } }];
  return [...dynItems, ...staticItems];
}

function openNotifModal() {
  let overlay = document.getElementById('notif-modal-overlay');
  if (!overlay) { overlay = document.createElement('div'); overlay.id = 'notif-modal-overlay'; overlay.className = 'notif-modal-overlay'; overlay.addEventListener('click', e => { if (e.target === overlay) closeNotifModal(); }); document.body.appendChild(overlay); }
  const items = _buildNotifications();
  overlay.innerHTML = `<div class="notif-modal-card"><div class="notif-modal-header"><div class="notif-modal-bell"><i class="fas fa-bell"></i></div><h2 class="notif-modal-title">Notifications</h2><button class="notif-modal-close" onclick="closeNotifModal()"><i class="fas fa-times"></i></button></div><div class="notif-modal-body">${items.length === 0 ? '<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>' : items.map((n,i) => `<div class="notif-entry${n.unread ? ' notif-unread-entry' : ''}" onclick="_notifClick(${i})">${n.unread ? '<div class="notif-unread-bar"></div>' : ''}<div class="notif-avatar" style="background:${n.color}22;color:${n.color}">${n.initials}</div><div class="notif-content"><div class="notif-name">${n.name}</div><div class="notif-action">${n.action}</div><div class="notif-detail">${n.detail}</div></div><div class="notif-time">${n.time}</div></div>`).join('')}</div><div class="notif-modal-footer"><button class="notif-footer-btn" onclick="markAllNotifRead()">Mark all as read</button><button class="notif-footer-btn notif-footer-link" onclick="closeNotifModal();showPage('advertisements',null)">Review ads →</button></div></div>`;
  overlay._handlers = items.map(n => n.onClick);
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('notif-modal-open'));
}
function _notifClick(i) { const overlay = document.getElementById('notif-modal-overlay'); if (overlay && overlay._handlers && overlay._handlers[i]) overlay._handlers[i](); }
function closeNotifModal() { const overlay = document.getElementById('notif-modal-overlay'); if (!overlay) return; overlay.classList.remove('notif-modal-open'); setTimeout(() => { overlay.style.display = 'none'; }, 250); }
function markAllNotifRead() { closeNotifModal(); showToast('All notifications marked as read'); }

/* ============================================================
   TOAST
============================================================ */
function showToast(message, type='success') {
  const e = document.getElementById('toast'); if(e) e.remove();
  const t = document.createElement('div'); t.id = 'toast';
  const C = { success:{ bg:'#0a4d3c', icon:'✓' }, error:{ bg:'#c0392b', icon:'✕' }, info:{ bg:'#1a5fa8', icon:'ℹ' } };
  const c = C[type] || C.success;
  t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${c.bg};color:white;padding:12px 20px;border-radius:8px;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;box-shadow:0 4px 18px rgba(0,0,0,.2);z-index:9999;display:flex;align-items:center;gap:8px;max-width:320px;`;
  t.innerHTML = `<span style="font-size:15px">${c.icon}</span> ${message}`;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); },3000);
}

/* ============================================================
   MAP FUNCTIONS (simplified for compatibility)
============================================================ */
function initCommunityMap() { if (document.getElementById('cm-main-map')) { if(cmMap) cmMap.invalidateSize(); else { cmMap = L.map('cm-main-map').setView(LBA4.center, 16); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(cmMap); L.polygon(LBA4.boundary, {color:'#0a4d3c',fillOpacity:0.05}).addTo(cmMap); } } }
function initPreviewMap() { if (document.getElementById('cm-preview')) { if(previewMap) previewMap.invalidateSize(); else { previewMap = L.map('cm-preview').setView(LBA4.center, 16); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(previewMap); L.polygon(LBA4.boundary, {color:'#0a4d3c',fillOpacity:0.05}).addTo(previewMap); } } }
function cmResetView() { if(cmMap) cmMap.setView(LBA4.center, 16); }
function cmSetFilter() {}
function toggleIncidentLocType() {}
function openIncidentDetail(id) { showToast('View incident details', 'info'); }
function deleteIncident(id) { showToast('Delete incident', 'info'); }
function clearAllIncidents() { if(confirm('Clear all incidents?')) { localStorage.removeItem('lba4_incidents'); showToast('All incidents cleared', 'error'); renderIncidentsDashboard(); } }
function renderIncidentsDashboard() { _updateNotifBadge(); }

/* ============================================================
   KANBAN
============================================================ */
let draggedCard = null;
function initKanban() {
  document.querySelectorAll('.k-card').forEach(c=>{ c.addEventListener('dragstart',e=>{ draggedCard=this; this.classList.add('dragging'); }); c.addEventListener('dragend',function(){ this.classList.remove('dragging'); draggedCard=null; }); });
  document.querySelectorAll('.k-col-body').forEach(c=>{ c.addEventListener('dragover',e=>{ e.preventDefault(); this.classList.add('drag-over'); }); c.addEventListener('dragleave',function(){ this.classList.remove('drag-over'); }); c.addEventListener('drop',function(e){ e.preventDefault(); this.classList.remove('drag-over'); if(draggedCard && draggedCard.parentNode!==this){ const add=this.querySelector('.k-add-btn'); this.insertBefore(draggedCard,add||null); document.querySelectorAll('.k-col').forEach(col=>{ const cnt=col.querySelector('.k-col-count'); if(cnt) cnt.textContent=col.querySelectorAll('.k-card').length; }); showToast('Task moved'); } }); });
}

/* ============================================================
   BUTTON INITIALIZERS
============================================================ */
function initVerificationButtons() {
  document.querySelectorAll('.approve-btn.yes').forEach(btn=>btn.addEventListener('click',function(){ const item=this.closest('.verif-item'); const name=item?.querySelector('.verif-name')?.textContent||'Resident'; item?.remove(); showToast(`${name} approved`); }));
  document.querySelectorAll('.approve-btn.no').forEach(btn=>btn.addEventListener('click',function(){ const item=this.closest('.verif-item'); const name=item?.querySelector('.verif-name')?.textContent||'Resident'; item?.remove(); showToast(`${name} rejected`,'error'); }));
}
function initForumButtons() {
  document.querySelectorAll('#page-forums .btn').forEach(btn=>{ const text=btn.textContent.trim(); if(text.includes('Remove')) btn.addEventListener('click',function(){ const item=this.closest('.forum-item'); if(confirm('Remove post?')){ item?.remove(); showToast('Post removed','error'); } }); });
}
function initReservationButtons() {
  document.querySelectorAll('#page-reservations .btn').forEach(btn=>{ if(btn.textContent.trim()==='Approve') btn.addEventListener('click',function(){ const row=this.closest('tr'); const statusTd=row?.querySelector('td:nth-child(5)'); if(statusTd) statusTd.innerHTML='<span class="status-pill sp-approved">Approved</span>'; row?.querySelectorAll('button').forEach(b=>b.style.display='none'); showToast('Reservation approved'); }); else if(btn.textContent.trim()==='Reject') btn.addEventListener('click',function(){ const row=this.closest('tr'); const statusTd=row?.querySelector('td:nth-child(5)'); if(statusTd) statusTd.innerHTML='<span class="status-pill sp-open">Rejected</span>'; row?.querySelectorAll('button').forEach(b=>b.style.display='none'); showToast('Reservation rejected','error'); }); });
}
function initAnnouncementButtons() {
  document.querySelectorAll('#page-announcements .btn-outline').forEach(btn=>{ if(btn.querySelector('.fa-trash')) btn.addEventListener('click',function(){ const row=this.closest('tr'); const name=row?.querySelector('td strong')?.textContent||'Announcement'; if(confirm(`Delete "${name}"?`)){ row?.remove(); showToast(`"${name}" deleted`,'error'); } }); });
}
function initEventButtons() {
  document.querySelectorAll('#page-events .btn-outline').forEach(btn=>{ if(btn.querySelector('.fa-trash')) btn.addEventListener('click',function(){ const row=this.closest('tr'); const name=row?.querySelector('td strong')?.textContent||'Event'; if(confirm(`Delete "${name}"?`)){ row?.remove(); showToast(`"${name}" deleted`,'error'); } }); });
}
function initBodButtons() {
  document.querySelectorAll('#page-bods .btn-outline').forEach(btn=>{ if(btn.querySelector('.fa-trash')) btn.addEventListener('click',function(){ const row=this.closest('tr'); const name=row?.querySelector('td strong')?.textContent||'Member'; if(confirm(`Remove "${name}"?`)){ row?.remove(); showToast(`"${name}" removed`,'error'); } }); });
}
function initLandmarkButtons() {}
function initMeetingButtons() {}
function initDocumentButtons() {}
function initContactButtons() {}
function initWordBankButtons() {}
function initSubscriberButtons() {}
function initModalForms() {}
function initChips() {}
function initProgressBars() {}
function initClock() {}
function initMobileOverlay() {}
function initSearch() {}
function initIncidentsIntegration() { renderIncidentsDashboard(); }

/* ============================================================
   INITIALIZATION
============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  renderAdsDashboard();
  renderIncidentsDashboard();
  initKanban();
  initChips();
  initVerificationButtons();
  initForumButtons();
  initReservationButtons();
  initAnnouncementButtons();
  initEventButtons();
  initBodButtons();
  initLandmarkButtons();
  initMeetingButtons();
  initDocumentButtons();
  initContactButtons();
  initWordBankButtons();
  initSubscriberButtons();
  initModalForms();
  initMobileOverlay();
  initSearch();
  initProgressBars();
  initClock();
  initIncidentsIntegration();
  const notifBtn = document.querySelector('.icon-btn[title="Notifications"]');
  if (notifBtn) notifBtn.addEventListener('click', openNotifModal);
  const settingsBtn = document.querySelector('.icon-btn[title="Settings"]');
  if (settingsBtn) settingsBtn.addEventListener('click', () => openModal('settings'));
  window.addEventListener('storage', function(e) { if (e.key === 'lba4_ads') renderAdsDashboard(); if (e.key === 'lba4_incidents') renderIncidentsDashboard(); });
  window.addEventListener('lba4:ads:update', renderAdsDashboard);
  showPage('overview', document.querySelector('.nav-link.active'));
  console.log('%c LBA4 Staff Dashboard — Ad Approvals Management Loaded ✓', 'color:#0a4d3c;font-weight:bold;');
});