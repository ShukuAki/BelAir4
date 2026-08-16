'use strict';
/* ============================================================
   staff-dashboard.js  —  Laguna BelAir 4  v4  (complete)
   FIXES:
   - Incidents: added Type (Incident/Concern), visibility is now a dropdown
   - Kanban: dragging out of Done restores original tag/color; Priority removed
   - Residents: View on Verified tab is functional; Suspend duration hidden for Ban
   - Community Exchange: View works; Edit removed from published; connected to lba4_exchange
   - Usap Tayo: connected to forums.html (Option 2 — staff uses actual page)
   - Events: Past Events section added
   - BOD: Committee field removed
   - Map Items: Landmark items do NOT show "Pending" status — show icon instead
============================================================ */

/* ── VILLAGE CONFIG ── */
const LBA4 = {
  center: [14.268997, 121.068329],
  zoom: 16,
  boundary: [
    [14.27224,121.06873],[14.26821,121.06584],
    [14.26536,121.06580],[14.26607,121.07107],
    [14.27224,121.06873]
  ]
};

/* ── UTILITIES ── */
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── STATE ── */
let INCIDENTS   = [];
let MAP_ITEMS   = [];
let EVENTS_DATA = [
  {id:'ev-1', title:'BOD Gate Pass Review',     date:'2026-02-19', time:'10:00', location:'Admin Office',  cat:'Governance'},
  {id:'ev-2', title:'Community Clean-up Drive',  date:'2026-02-25', time:'07:00', location:'All Blocks',    cat:'Community'},
  {id:'ev-3', title:'Monthly BOD Meeting',       date:'2026-03-01', time:'18:00', location:'Function Room', cat:'Governance'},
  {id:'ev-p1', title:'Fiesta sa Subdivision',    date:'2026-01-15', time:'14:00', location:'Clubhouse',     cat:'Social'},
  {id:'ev-p2', title:'Fire Drill — Phase 1',     date:'2026-01-22', time:'09:00', location:'Gate 1 Area',   cat:'Emergency'},
  {id:'ev-p3', title:'Q4 2025 BOD Meeting',      date:'2026-01-10', time:'18:00', location:'Function Room', cat:'Governance'}
];
let calYear = 2026, calMonth = 1;

/* ── MAP INSTANCES ── */
let cmMap = null, previewMap = null;
let cmMapMarkers = [], cmFilter = 'all';
let amiMap = null, amiMarker = null;
let incLogMap = null, incLogMarker = null;

/* ── TASK AUTO-DELETE TIMERS ── */
let taskTimers = {};

/* ── TASK ORIGINAL DATA (for restoring when dragged out of Done) ── */
const taskOriginal = {};

/* ============================================================
   UTILITIES
============================================================ */
function escHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type) {
  type = type || 'success';
  const old = document.getElementById('sd-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'sd-toast';
  const bg = {success:'#0a4d3c', error:'#c0392b', info:'#1a5fa8'}[type] || '#0a4d3c';
  const ic = {success:'✓', error:'✕', info:'ℹ'}[type] || '✓';
  t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};color:white;`
    + `padding:12px 20px;border-radius:8px;font-family:Nunito,sans-serif;font-size:13px;`
    + `font-weight:700;box-shadow:0 4px 18px rgba(0,0,0,.22);z-index:9999;`
    + `display:flex;align-items:center;gap:8px;max-width:340px`;
  t.innerHTML = `<span>${ic}</span> ${escHtml(msg)}`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 320);
  }, 3000);
}

/* ============================================================
   PAGE NAVIGATION
============================================================ */
const PAGE_LABELS = {
  overview     : 'Overview',
  incidents    : 'Incident Reports',
  taskboard    : 'Task Board',
  residents    : 'Residents & Verification',
  exchange     : 'Community Exchange',
  forums       : 'Usap Tayo Para sa HOA',
  reservations : 'Reservations',
  announcements: 'Announcements',
  events       : 'Events / Calendar',
  bods         : 'Committees & BODs',
  meetings     : 'Meeting Records',
  documents    : 'Forms & Documents',
  contacts     : 'Contacts',
  communitymap : 'Community Map',
  wordbank     : 'Word Bank',
  reports      : 'Reports',
  subscribers  : 'Subscribers'
};

function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const tgt = document.getElementById('page-' + id);
  if (!tgt) return;
  tgt.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  if (el) { el.classList.add('active'); }
  else { const l = document.querySelector(`.nav-link[onclick*="'${id}'"]`); if (l) l.classList.add('active'); }
  const bc = document.getElementById('breadcrumb-label');
  const tt = document.getElementById('topbar-title');
  if (bc) bc.textContent = PAGE_LABELS[id] || id;
  if (tt) tt.textContent = PAGE_LABELS[id] || id;
  if (id === 'communitymap') setTimeout(initCommunityMap, 80);
  if (id === 'incidents')    setTimeout(initPreviewMap, 80);
  if (id === 'events')       { renderCalendar(); renderEventsList(); }
  if (id === 'exchange')     loadExchangeData();
  if (id === 'forums')       renderForumsDashboard();
  if (id === 'reservations') loadReservations();
  if (id === 'wordbank')     { loadWordBank(); loadKeywordsData(); checkAiStatus(); }
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('mobile-open');
}

/* ============================================================
   SIDEBAR TOGGLE
============================================================ */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const main = document.getElementById('main-content');
  const tb = document.getElementById('topbar');
  if (window.innerWidth <= 768) { sb.classList.toggle('mobile-open'); }
  else {
    sb.classList.toggle('collapsed');
    main.classList.toggle('expanded');
    tb.classList.toggle('expanded');
    setTimeout(() => { [cmMap,previewMap,amiMap,incLogMap].forEach(m => m && m.invalidateSize()); }, 280);
  }
}

/* ============================================================
   MODAL HELPERS
============================================================ */
function openModal(id) {
  const m = document.getElementById('modal-' + id);
  if (!m) return;
  m.classList.add('open');
  if (id === 'addMapItem') setTimeout(initAmiMap, 150);
}
function closeModal(id) {
  const m = document.getElementById('modal-' + id);
  if (m) m.classList.remove('open');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

/* ============================================================
   INCIDENTS — with Type (Incident / Concern) + visibility dropdown
============================================================ */
function persistIncidents() {
  try { localStorage.setItem('lba4_incidents', JSON.stringify(INCIDENTS)); } catch(e) {}
}
function loadIncidents() {
  try { const s = localStorage.getItem('lba4_incidents'); if (s) INCIDENTS = JSON.parse(s); } catch(e) {}
}

function detectPriority(desc) {
  const t = desc.toLowerCase();
  const HIGH = ['suspicious','break-in','theft','nakawan','tubig','water leak','baha','flood',
                'sunog','fire','emergency','fallen tree','open gate','exposed wiring',
                'natumba','basag','nasusunog','robbery','holdap'];
  const MED  = ['ilaw','light out','kuryente','pothole','kalsada','maintenance','sira',
                'broken','leaking','malansa','drainage','clogged','blocked'];
  for (const k of HIGH) if (t.includes(k)) return 'high';
  for (const k of MED)  if (t.includes(k)) return 'medium';
  return 'low';
}

function updateAutoPriority() {
  const desc = (document.getElementById('inc-description') || {}).value || '';
  const ovrd = (document.getElementById('inc-priority-override') || {}).value || 'auto';
  if (ovrd !== 'auto') return;
  const box = document.getElementById('inc-priority-box'); if (!box) return;
  const p = detectPriority(desc);
  const bg  = {high:'#fdecea', medium:'#fdf0e2', low:'#fdf5e0'};
  const lbl = {high:'🔴 HIGH — Immediate attention', medium:'🟠 MEDIUM — Within 24–48 hrs', low:'🟡 LOW — Schedule within 3–7 days'};
  if (desc.trim()) { box.style.background = bg[p]; box.innerHTML = `<i class="fas fa-brain"></i> <strong>Auto-detected: ${lbl[p]}</strong>`; }
  else { box.style.background = 'var(--green-light)'; box.innerHTML = '<i class="fas fa-brain"></i> <strong>Auto-priority</strong> will be assigned based on keywords.'; }
}

async function saveIncident() {
  const reporter = (document.getElementById('inc-reporter').value || '').trim();
  const desc     = (document.getElementById('inc-description').value || '').trim();
  const cat      = document.getElementById('inc-category').value;
  const locType  = document.querySelector('[name="inc-loc-type"]:checked')?.value || 'text';
  const visVal   = document.getElementById('inc-visibility')?.value || 'public';

  let street = '', lat = null, lng = null;
  if (locType === 'text') {
    street = (document.getElementById('inc-location').value || '').trim();
  } else {
    lat    = parseFloat(document.getElementById('inc-log-lat').value) || null;
    lng    = parseFloat(document.getElementById('inc-log-lng').value) || null;
    street = (document.getElementById('inc-log-street')?.value || '').trim();
  }

  if (!desc)                   { showToast('Description is required.', 'error'); return; }
  if (!street && !lat && !lng) { showToast('Location is required.', 'error');    return; }

  const fd = new FormData();
  fd.append('description',  desc);
  fd.append('category',     cat);
  fd.append('street',       street);
  fd.append('address',      street);
  fd.append('reporterName', reporter || 'Anonymous');
  fd.append('anonymous',    reporter ? 'false' : 'true');
  if (lat != null) fd.append('latitude',  String(lat));
  if (lng != null) fd.append('longitude', String(lng));
  const photoFile = document.getElementById('inc-file')?.files[0];
  if (photoFile) fd.append('photo', photoFile);

  try {
    const res  = await fetch('/api/concerns/report', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || data.success === false) { showToast(data?.error || 'Failed to save report', 'error'); return; }
    showToast(`Incident ${data.reference || data.id || ''} logged`);
    closeModal('addIncident'); resetIncidentForm();
    await loadIncidentReportsWithAnalysis();
    _updateNotifBadge();
  } catch (err) {
    console.error('Save incident failed:', err);
    showToast('Failed to save report', 'error');
  }
}

function resetIncidentForm() {
  ['inc-reporter','inc-description','inc-location','inc-log-street'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  const pr = document.getElementById('inc-priority-override'); if (pr) pr.value = 'auto';
  const fl = document.getElementById('inc-file-list'); if (fl) fl.innerHTML = '';
  const bx = document.getElementById('inc-priority-box');
  if (bx) { bx.style.background = 'var(--green-light)'; bx.innerHTML = '<i class="fas fa-brain"></i> <strong>Auto-priority</strong> will be assigned based on keywords.'; }
  if (incLogMarker && incLogMap) { incLogMap.removeLayer(incLogMarker); incLogMarker = null; }
  const le = document.getElementById('inc-log-lat'); if (le) le.value = '';
  const lo = document.getElementById('inc-log-lng'); if (lo) lo.value = '';
  const cd = document.getElementById('inc-log-coords-display'); if (cd) cd.textContent = 'No location pinned yet';
  const hi = document.getElementById('inc-log-map-hint'); if (hi) hi.style.display = 'block';
  document.querySelectorAll('[name="inc-loc-type"]').forEach(r => { r.checked = r.value === 'text'; });
  const vis = document.getElementById('inc-visibility'); if (vis) vis.value = 'public';
  const tp  = document.getElementById('inc-type'); if (tp) tp.value = 'Incident';
  toggleIncidentLocType();
}

function filterIncidents(filter, el) {
  document.querySelectorAll('#incidents-table-card .chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  renderIncidentsTable(filter);
}

function renderIncidentsTable(filter) {
  filter = filter || 'all';
  const tb = document.getElementById('incidents-tbody'); if (!tb) return;
  const list = filter === 'all' ? INCIDENTS : INCIDENTS.filter(i => i.status === filter);
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--gray-400)"><i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px"></i>${filter !== 'all' ? `No "${filter}" items.` : 'No reports yet.'}</td></tr>`;
    return;
  }
  const pm = {high:'p-high', medium:'p-medium', low:'p-low'};
  const sm = {open:'sp-open', progress:'sp-progress', resolved:'sp-resolved'};
  const sl = {open:'Open', progress:'In Progress', resolved:'Resolved'};
  tb.innerHTML = list.map(inc => `
    <tr>
      <td class="mono">${escHtml(inc.id)}</td>
      <td><span class="tag ${inc.type==='Concern'?'tag-yellow':'tag-red'}">${escHtml(inc.type||'Incident')}</span></td>
      <td style="max-width:150px;white-space:normal;word-break:break-word">${escHtml(inc.description.substring(0,55))}${inc.description.length>55?'…':''}</td>
      <td>${escHtml(inc.location)}</td>
      <td><span class="tag tag-gray">${escHtml(inc.category)}</span></td>
      <td><span class="priority ${pm[inc.priority]||'p-medium'}">${inc.priority.charAt(0).toUpperCase()+inc.priority.slice(1)}</span></td>
      <td><span class="status-pill ${sm[inc.status]||'sp-open'}">${sl[inc.status]||inc.status}</span></td>
      <td>${escHtml(inc.reporter)}</td>
      <td style="white-space:nowrap">${escHtml(inc.date)}</td>
      <td style="text-align:center">${inc.isPublic?'<i class="fas fa-globe" style="color:var(--green)" title="Public"></i>':'<i class="fas fa-lock" style="color:var(--gray-400)" title="Staff only"></i>'}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-outline btn-sm" onclick="viewIncident('${inc.id}')"><i class="fas fa-eye"></i></button>
        <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteIncident('${inc.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function viewIncident(id) {
  const inc = INCIDENTS.find(i => i.id === id); if (!inc) return;
  const ct = document.getElementById('view-incident-content'); if (!ct) return;
  ct.dataset.incId = id;
  const sl = {open:'Open', progress:'In Progress', resolved:'Resolved'};
  ct.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px">
      <div><div class="field-label">Ref #</div><strong>${escHtml(inc.id)}</strong></div>
      <div><div class="field-label">Type</div><span class="tag ${inc.type==='Concern'?'tag-yellow':'tag-red'}">${escHtml(inc.type||'Incident')}</span></div>
      <div><div class="field-label">Status</div><span class="status-pill sp-${inc.status}">${sl[inc.status]||inc.status}</span></div>
      <div><div class="field-label">Priority</div><span class="priority p-${inc.priority}">${inc.priority}</span></div>
      <div><div class="field-label">Date</div><span style="font-size:12px">${escHtml(inc.date)}</span></div>
      <div><div class="field-label">Visibility</div><span>${inc.isPublic?'🌐 Public':'🔒 Staff only'}</span></div>
    </div>
    <div class="form-group"><label>Reporter</label><div class="text-display">${escHtml(inc.reporter)}</div></div>
    <div class="form-group"><label>Location</label><div class="text-display">${escHtml(inc.location)}</div></div>
    <div class="form-group"><label>Category</label><div class="text-display">${escHtml(inc.category)}</div></div>
    <div class="form-group"><label>Description</label><div class="text-display" style="white-space:pre-wrap">${escHtml(inc.description)}</div></div>
    <div class="form-row">
      <div class="form-group"><label>Update Status</label>
        <select id="vi-status">
          <option value="open" ${inc.status==='open'?'selected':''}>Open</option>
          <option value="progress" ${inc.status==='progress'?'selected':''}>In Progress</option>
          <option value="resolved" ${inc.status==='resolved'?'selected':''}>Resolved</option>
        </select>
      </div>
      <div class="form-group"><label>Override Priority</label>
        <select id="vi-priority">
          <option value="high" ${inc.priority==='high'?'selected':''}>High</option>
          <option value="medium" ${inc.priority==='medium'?'selected':''}>Medium</option>
          <option value="low" ${inc.priority==='low'?'selected':''}>Low</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>Show on Public Map</label>
      <select id="vi-visibility">
        <option value="public" ${inc.isPublic?'selected':''}>🌐 Public — visible to residents</option>
        <option value="staff" ${!inc.isPublic?'selected':''}>🔒 Staff only — internal</option>
      </select>
    </div>
    <div class="form-group"><label>Staff Notes</label>
      <textarea id="vi-notes" style="min-height:80px" placeholder="Steps taken, follow-ups…">${escHtml(inc.notes||'')}</textarea>
    </div>`;
  openModal('viewIncident');
}

function saveIncidentUpdate() {
  const ct = document.getElementById('view-incident-content'); if (!ct) return;
  const id = ct.dataset.incId;
  const inc = INCIDENTS.find(i => i.id === id); if (!inc) return;
  inc.status   = document.getElementById('vi-status').value;
  inc.priority = document.getElementById('vi-priority').value;
  inc.notes    = document.getElementById('vi-notes').value;
  inc.isPublic = document.getElementById('vi-visibility').value === 'public';
  persistIncidents();
  const idx = MAP_ITEMS.findIndex(m => m.incidentId === id);
  if (inc.isPublic && inc.lat && inc.lng) {
    if (idx >= 0) { MAP_ITEMS[idx].status = inc.status; }
    else { MAP_ITEMS.push({ id:'mi-inc-'+id, title:`${inc.type||'Incident'}: ${inc.description.substring(0,40)}`, description:inc.description, category:inc.type||'Incident', status:inc.status, lat:inc.lat, lng:inc.lng, fromIncident:true, incidentId:id }); }
  } else if (!inc.isPublic && idx >= 0) { MAP_ITEMS.splice(idx,1); }
  if (cmMap) renderCmItems();
  renderIncidentsTable('all'); renderOverviewIncidents(); updateIncidentStats(); updateDistribution();
  closeModal('viewIncident'); showToast(`${inc.type||'Incident'} ${id} updated`);
}

function deleteIncident(id) {
  if (!confirm(`Delete ${id}? This cannot be undone.`)) return;
  MAP_ITEMS = MAP_ITEMS.filter(m => m.incidentId !== id);
  INCIDENTS = INCIDENTS.filter(i => i.id !== id);
  persistIncidents();
  renderIncidentsTable('all'); renderOverviewIncidents(); updateIncidentStats(); updateDistribution(); updateCommonKeywords();
  if (cmMap) renderCmItems(); refreshPreviewMap(); _updateNotifBadge();
  showToast(`${id} removed`, 'error');
}

function renderOverviewIncidents() {
  const el = document.getElementById('overview-incidents-list'); if (!el) return;
  if (!INCIDENTS.length) { el.innerHTML = '<div class="empty-state-inline"><i class="fas fa-inbox"></i><span>No incident reports yet</span></div>'; return; }
  const pc = {high:'var(--red)', medium:'var(--orange)', low:'var(--yellow)'};
  const pb = {high:'var(--red-light)', medium:'var(--orange-light)', low:'var(--yellow-light)'};
  el.innerHTML = INCIDENTS.slice(0,6).map(inc => {
    const priority = inc.priority || 'medium';
    const status   = inc.status   || 'open';
    const reporter = inc.reporterName || (inc.anonymous ? 'Anonymous' : '—');
    const location = inc.street || inc.address || '—';
    const date     = inc.timestamp ? new Date(inc.timestamp).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}) : (inc.date || '—');
    const ref      = inc.reference || ('INC-' + inc.id);
    const cat      = inc.category || 'Incident';
    const spClass  = status === 'in-progress' ? 'sp-progress' : status === 'resolved' ? 'sp-resolved' : 'sp-open';
    const spLabel  = status === 'in-progress' ? 'In Progress' : status === 'resolved' ? 'Resolved' : 'Open';
    return `
    <div onclick="showPage('incidents',null);setTimeout(()=>viewIncidentDetail(${inc.id}),200)"
      style="display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid var(--gray-100);cursor:pointer;align-items:flex-start;transition:background .12s"
      onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''">
      <div style="width:36px;height:36px;border-radius:var(--radius);background:${pb[priority]};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="fas fa-exclamation-circle" style="color:${pc[priority]}"></i></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--green)">${escHtml((inc.description||'').substring(0,55))}${(inc.description||'').length>55?'…':''}</div>
        <div style="font-size:11px;color:var(--gray-400);margin-top:2px">${escHtml(location)} · ${escHtml(reporter)} · ${escHtml(date)}</div>
        <div style="display:flex;gap:6px;margin-top:5px;flex-wrap:wrap">
          <span class="tag tag-gray">${escHtml(cat)}</span>
          <span class="priority p-${priority}">${priority}</span>
          <span class="status-pill ${spClass}">${spLabel}</span>
        </div>
      </div>
      <div style="font-size:10px;color:var(--gray-400);flex-shrink:0">${escHtml(ref)}</div>
    </div>`;
  }).join('');
}

function updateIncidentStats() {
  const open = INCIDENTS.filter(i => i.status !== 'resolved').length;
  const sv = document.getElementById('stat-open-incidents'); if (sv) sv.textContent = open;
  const bi = document.getElementById('badge-incidents'); if (bi) { bi.textContent = open; bi.style.display = open > 0 ? '' : 'none'; }
}

function updateDistribution() {
  const c = {high:0, medium:0, low:0};
  INCIDENTS.forEach(i => { if (c[i.priority] !== undefined) c[i.priority]++; });
  const total = INCIDENTS.length || 1;
  ['high','medium','low'].forEach(p => {
    const bar = document.getElementById(`dist-${p}-bar`); const num = document.getElementById(`dist-${p}-n`);
    if (bar) bar.style.width = Math.round((c[p]/total)*100) + '%'; if (num) num.textContent = c[p];
  });
  const de = document.getElementById('dist-empty'); if (de) de.style.display = INCIDENTS.length ? 'none' : 'block';
}

function updateCommonKeywords() {
  const grid = document.getElementById('common-keywords-grid'); if (!grid) return;
  if (!INCIDENTS.length) { grid.innerHTML = '<div class="empty-state-inline" style="padding:16px"><i class="fas fa-tags"></i><span>Appear as incidents are logged</span></div>'; return; }
  const stop = new Set(['the','is','a','an','in','on','at','near','of','and','to','for','with','was','has','have','are','that','this','it','not','by','from','our','there','been','they','when','also','which','its']);
  const freq = {};
  INCIDENTS.forEach(inc => { inc.description.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).forEach(w => { if (w.length >= 4 && !stop.has(w)) freq[w] = (freq[w]||0)+1; }); });
  const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,14);
  if (!sorted.length) { grid.innerHTML = '<div class="empty-state-inline" style="padding:16px"><i class="fas fa-tags"></i><span>No keywords yet</span></div>'; return; }
  const mx = sorted[0][1];
  grid.innerHTML = sorted.map(([w,c]) => { const cls = c>=mx*.7?'kw-high':c>=mx*.35?'kw-medium':'kw-low'; return `<span class="kw-chip ${cls}">${escHtml(w)} <em style="opacity:.65;font-style:normal">(${c})</em></span>`; }).join('');
}

function toggleIncidentLocType() {
  const v  = document.querySelector('[name="inc-loc-type"]:checked')?.value || 'text';
  const tw = document.getElementById('inc-loc-text-wrap'); if (tw) tw.style.display = v === 'text' ? '' : 'none';
  const mw = document.getElementById('inc-loc-map-wrap');  if (mw) mw.style.display = v === 'map'  ? '' : 'none';
  if (v === 'map') setTimeout(initIncLogMap, 150);
}

function initIncLogMap() {
  const el = document.getElementById('inc-log-map'); if (!el) return;
  if (incLogMap) { incLogMap.invalidateSize(); return; }
  incLogMap = L.map('inc-log-map', {attributionControl:false}).setView(LBA4.center, 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(incLogMap);
  L.polygon(LBA4.boundary, {color:'#0a4d3c', fillOpacity:.05, weight:2}).addTo(incLogMap);
  incLogMap.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6), lng = e.latlng.lng.toFixed(6);
    if (incLogMarker) incLogMap.removeLayer(incLogMarker);
    incLogMarker = L.marker([lat,lng], { icon:L.divIcon({className:'', html:`<div style="width:16px;height:16px;background:#c0392b;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`, iconAnchor:[8,8]}), draggable:true }).addTo(incLogMap);
    incLogMarker.on('dragend', function() { const p = incLogMarker.getLatLng(); setIncCoords(p.lat.toFixed(6), p.lng.toFixed(6)); });
    setIncCoords(lat, lng);
    const h = document.getElementById('inc-log-map-hint'); if (h) h.style.display = 'none';
  });
}

function setIncCoords(lat, lng) {
  const le = document.getElementById('inc-log-lat'); if (le) le.value = lat;
  const lo = document.getElementById('inc-log-lng'); if (lo) lo.value = lng;
  const d  = document.getElementById('inc-log-coords-display'); if (d) d.textContent = `${lat}, ${lng}`;
}

/* ── File / image upload listeners ── */
document.addEventListener('change', function(e) {
  if (e.target.id === 'inc-file') {
    const list = document.getElementById('inc-file-list'); if (!list) return;
    list.innerHTML = Array.from(e.target.files).map(f => `<div class="inc-att-chip"><i class="fas fa-paperclip"></i> ${escHtml(f.name)}</div>`).join('');
  }
  if (e.target.id === 'ann-header-img' && e.target.files[0]) {
    const pr = document.getElementById('ann-header-preview');
    if (pr) { const url = URL.createObjectURL(e.target.files[0]); pr.innerHTML = `<img src="${url}" style="width:100%;max-height:120px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--gray-200)">`; }
  }
  if (e.target.id === 'ann-body-img') { const el = document.getElementById('ann-body-img-name'); if (el && e.target.files[0]) el.textContent = '📷 ' + e.target.files[0].name; }
  if (e.target.id === 'ann-doc')      { const el = document.getElementById('ann-doc-name');      if (el && e.target.files[0]) el.textContent = '📎 ' + e.target.files[0].name; }
  if (e.target.id === 'ami-photo')    { const el = document.getElementById('ami-photo-name');    if (el && e.target.files[0]) el.textContent = e.target.files[0].name; }
});

/* ============================================================
   KANBAN — FIXED: restores original style when moved out of Done; Priority removed
============================================================ */
function initKanban() {
  let dragCard = null;

  /* Save original state of every default card */
  document.querySelectorAll('.k-card').forEach(card => {
    if (card.dataset.taskId && !taskOriginal[card.dataset.taskId]) {
      const tg = card.querySelector('.k-card-header-row .tag');
      taskOriginal[card.dataset.taskId] = {
        colorClass: ['kc-red','kc-orange','kc-yellow','kc-green'].find(c => card.classList.contains(c)) || '',
        tagClass:   tg ? tg.className : '',
        tagHTML:    tg ? tg.innerHTML : ''
      };
    }
  });

  function onDragStart(e) { dragCard = this; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => this.classList.add('dragging'), 0); }
  function onDragEnd()    { this.classList.remove('dragging'); dragCard = null; }
  function onDragOver(e)  { e.preventDefault(); this.classList.add('drag-over'); }
  function onDragLeave()  { this.classList.remove('drag-over'); }

  function onDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (!dragCard || dragCard.parentNode === this) return;

    const ab = this.querySelector('.k-add-btn');
    this.insertBefore(dragCard, ab || null);

    if (this.id === 'k-body-done') {
      /* Moving INTO Done — mark as done */
      dragCard.classList.remove('kc-red','kc-orange','kc-yellow');
      dragCard.classList.add('kc-green');
      const tg = dragCard.querySelector('.k-card-header-row .tag');
      if (tg) { tg.className = 'tag tag-green'; tg.innerHTML = '<i class="fas fa-check"></i> Done'; }
      const ad = dragCard.dataset.autodel; const tid = dragCard.dataset.taskId;
      if (ad && parseInt(ad) > 0 && tid) scheduleTaskDelete(tid, parseInt(ad));
    } else {
      /* Moving OUT of Done (or between non-done columns) — restore original */
      const tid = dragCard.dataset.taskId;
      if (tid && taskTimers[tid]) { clearTimeout(taskTimers[tid]); delete taskTimers[tid]; }
      const orig = tid ? taskOriginal[tid] : null;
      if (orig) {
        dragCard.classList.remove('kc-green','kc-red','kc-orange','kc-yellow');
        if (orig.colorClass) dragCard.classList.add(orig.colorClass);
        const tg = dragCard.querySelector('.k-card-header-row .tag');
        if (tg && orig.tagClass) { tg.className = orig.tagClass; tg.innerHTML = orig.tagHTML; }
      }
    }
    updateKanbanCounts(); showToast('Task moved ✓');
  }

  function bindCards() {
    document.querySelectorAll('.k-card').forEach(card => {
      card.removeEventListener('dragstart', onDragStart);
      card.removeEventListener('dragend',   onDragEnd);
      card.addEventListener('dragstart', onDragStart);
      card.addEventListener('dragend',   onDragEnd);
    });
  }

  document.querySelectorAll('.k-col-body').forEach(col => {
    col.addEventListener('dragover',  onDragOver);
    col.addEventListener('dragleave', onDragLeave);
    col.addEventListener('drop',      onDrop);
  });
  bindCards();
  window._bindKanbanCards = bindCards;
  checkDeadlines();
}

function scheduleTaskDelete(tid, days) {
  if (taskTimers[tid]) clearTimeout(taskTimers[tid]);
  taskTimers[tid] = setTimeout(() => {
    const card = document.querySelector(`[data-task-id="${tid}"]`);
    if (card) {
      card.style.transition = 'opacity .5s'; card.style.opacity = '0';
      setTimeout(() => { card.remove(); updateKanbanCounts(); }, 500);
      showToast(`Task auto-deleted after ${days} day${days!==1?'s':''} in Done`, 'info');
    }
  }, days * 24 * 60 * 60 * 1000);
}

function checkDeadlines() {
  const today = new Date(); today.setHours(0,0,0,0);
  document.querySelectorAll('.k-card').forEach(card => {
    const due = card.dataset.due; if (!due) return;
    const dueDate = new Date(due); dueDate.setHours(0,0,0,0);
    const diff = Math.ceil((dueDate - today) / (1000*60*60*24));
    const de = card.querySelector('.k-card-date'); if (!de) return;
    if (diff < 0)       de.className = 'k-card-date overdue';
    else if (diff <= 2) de.className = 'k-card-date due-soon';
    if (diff <= 2 && diff >= 0 && !card.dataset.notified) {
      card.dataset.notified = '1';
      const title = card.querySelector('.k-card-title')?.textContent || 'Task';
      showToast(`⏰ Due ${diff===0?'today':diff===1?'tomorrow':'in 2 days'}: ${title.substring(0,35)}`, 'info');
    }
  });
}

function updateKanbanCounts() {
  ['todo','progress','review','done'].forEach(col => {
    const b = document.getElementById('k-body-'+col); const c = document.getElementById('k-count-'+col);
    if (b && c) c.textContent = b.querySelectorAll('.k-card').length;
  });
  const total = document.querySelectorAll('.k-card').length;
  const badge = document.getElementById('badge-tasks'); if (badge) badge.textContent = total;
}

function filterTasks(type, btn) {
  document.querySelectorAll('.kanban-toolbar .btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-outline'); });
  btn.classList.remove('btn-outline'); btn.classList.add('btn-primary');
  document.querySelectorAll('.k-card').forEach(card => { card.style.display = type === 'all' ? '' : 'none'; });
}

function deleteTask(btn) {
  const card = btn.closest('.k-card'); if (!card) return;
  const title = card.querySelector('.k-card-title')?.textContent || 'this task';
  if (!confirm(`Delete "${title.substring(0,50)}"?`)) return;
  card.style.transition = 'opacity .3s'; card.style.opacity = '0';
  setTimeout(() => { card.remove(); updateKanbanCounts(); }, 320);
  showToast('Task deleted', 'error');
}

function addNewTask() {
  const title = (document.getElementById('task-title')?.value || '').trim();
  const cat   = document.getElementById('task-cat')?.value    || 'Admin';
  const due   = document.getElementById('task-due')?.value    || '';
  const ad    = document.getElementById('task-autodel')?.value || '';
  const desc  = (document.getElementById('task-desc')?.value  || '').trim();
  if (!title) { showToast('Task title is required.', 'error'); return; }
  const tagMap = { Admin:'tag-orange', Maintenance:'tag-gray', Finance:'tag-orange', Communications:'tag-blue', Environment:'tag-green', Security:'tag-red', Legal:'tag-blue', Events:'tag-green', Other:'tag-gray' };
  const today = new Date(); today.setHours(0,0,0,0);
  let dateCls = 'k-card-date';
  let dueTxt  = due ? new Date(due).toLocaleDateString('en-PH',{month:'short',day:'numeric'}) : 'No due date';
  if (due) {
    const d = new Date(due); d.setHours(0,0,0,0);
    const diff = Math.ceil((d-today)/(1000*60*60*24));
    if (diff < 0) dateCls = 'k-card-date overdue'; else if (diff <= 2) dateCls = 'k-card-date due-soon';
  }
  const tid = 'task-' + Date.now();
  const card = document.createElement('div');
  card.className = 'k-card'; card.draggable = true;
  card.dataset.taskId = tid;
  if (due) card.dataset.due = due;
  if (ad)  card.dataset.autodel = ad;
  card.innerHTML = `
    <div class="k-card-header-row">
      <span class="tag ${tagMap[cat]||'tag-gray'}">${escHtml(cat)}</span>
      <button class="k-card-del" onclick="deleteTask(this)"><i class="fas fa-times"></i></button>
    </div>
    <div class="k-card-title">${escHtml(title)}</div>
    ${desc?`<div style="font-size:11px;color:var(--gray-400);margin-bottom:4px;line-height:1.4">${escHtml(desc.substring(0,60))}</div>`:''}
    <div class="k-card-meta">
      <div class="${dateCls}"><i class="fas fa-calendar"></i> ${dueTxt}</div>
      <div class="mini-avs"><div class="mini-av ma-g">MS</div></div>
    </div>`;
  /* Save original state */
  taskOriginal[tid] = { colorClass:'', tagClass:`tag ${tagMap[cat]||'tag-gray'}`, tagHTML: escHtml(cat) };
  const tb = document.getElementById('k-body-todo');
  if (tb) { const ab = tb.querySelector('.k-add-btn'); tb.insertBefore(card, ab||null); }
  if (window._bindKanbanCards) window._bindKanbanCards();
  updateKanbanCounts(); closeModal('addTask');
  ['task-title','task-desc','task-due'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  const ade = document.getElementById('task-autodel'); if (ade) ade.value = '';
  showToast(`Task "${title}" added`); checkDeadlines();
}

/* ============================================================
   RESIDENTS & VERIFICATION
============================================================ */
function switchResTab(tab, btn) {
  document.querySelectorAll('.res-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const p = document.getElementById('res-tab-pending');
  const v = document.getElementById('res-tab-verified');
  if (p) p.style.display = tab === 'pending'  ? '' : 'none';
  if (v) v.style.display = tab === 'verified' ? '' : 'none';
  if (tab === 'verified') loadApprovedRegistrations();
}

async function approveResident(rowId, name) {
  const id = rowId.replace('verif-', '');
  try {
    const response = await fetch(`/api/registrations/${id}/approve`, { method: 'POST' });
    if (response.ok) {
      const r = document.getElementById(rowId);
      if (r) r.remove();
      showToast(`✅ ${name} approved and verified`);
      _updateNotifBadge();
      loadPendingRegistrations();
      loadRecentlyVerified();
    }
  } catch (error) {
    showToast('Failed to approve registration', 'error');
  }
}

async function rejectResident(rowId, name) {
  const id = rowId.replace('verif-', '');
  const reason = prompt('Enter rejection reason (optional):');
  try {
    const response = await fetch(`/api/registrations/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reason || '')
    });
    if (response.ok) {
      const r = document.getElementById(rowId);
      if (r) r.remove();
      showToast(`${name} rejected`, 'error');
      _updateNotifBadge();
      loadPendingRegistrations();
    }
  } catch (error) {
    showToast('Failed to reject registration', 'error');
  }
}

async function quickApprove(btn, name) {
  const rowId = btn.closest('.verif-item')?.id;
  if (!rowId) return;
  const id = rowId.replace('verif-', '');
  try {
    const response = await fetch(`/api/registrations/${id}/approve`, { method: 'POST' });
    if (response.ok) {
      const i = btn.closest('.verif-item');
      if (i) i.remove();
      showToast(`✅ ${name} approved`);
      _updateNotifBadge();
      loadPendingRegistrations();
    }
  } catch (error) {
    showToast('Failed to approve registration', 'error');
  }
}

async function quickReject(btn, name) {
  const rowId = btn.closest('.verif-item')?.id;
  if (!rowId) return;
  const id = rowId.replace('verif-', '');
  const reason = prompt('Enter rejection reason (optional):');
  try {
    const response = await fetch(`/api/registrations/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reason || '')
    });
    if (response.ok) {
      const i = btn.closest('.verif-item');
      if (i) i.remove();
      showToast(`${name} rejected`, 'error');
      _updateNotifBadge();
      loadPendingRegistrations();
    }
  } catch (error) {
    showToast('Failed to reject registration', 'error');
  }
}

async function loadPendingRegistrations() {
  try {
    console.log('Loading pending registrations...');
    const response = await fetch('/api/registrations/pending');
    console.log('Response status:', response.status);
    if (response.ok) {
      const registrations = await response.json();
      console.log('Registrations loaded:', registrations);
      const container = document.getElementById('verif-pending-list');
      if (!container) {
        console.error('Container not found');
        return;
      }

      if (registrations.length === 0) {
        container.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)"><i class="fas fa-inbox" style="font-size:24px;margin-bottom:8px"></i><p>No pending registrations</p></div>';
        return;
      }

      container.innerHTML = registrations.map(reg => {
        const initials = reg.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const submittedDate = new Date(reg.submittedAt).toLocaleDateString();
        return `
          <div class="verif-item" id="verif-${reg.id}">
            <div class="verif-av">${initials}</div>
            <div class="verif-info">
              <div class="verif-name">${escHtml(reg.fullName)}</div>
              <div class="verif-sub">${escHtml(reg.address)} · ${submittedDate} · ${escHtml(residentTypeDisplay(reg.residentType))}</div>
            </div>
            <div class="verif-actions">
              <button class="btn btn-primary btn-sm" onclick="approveResident('verif-${reg.id}', '${escHtml(reg.fullName)}')"><i class="fas fa-check"></i> Approve</button>
              <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="rejectResident('verif-${reg.id}', '${escHtml(reg.fullName)}')"><i class="fas fa-times"></i> Reject</button>
              <button class="btn btn-outline btn-sm" onclick="openResidentDetail({
                name: '${escHtml(reg.fullName)}',
                unit: '${escHtml(reg.address)}',
                date: '${submittedDate}',
                docs: [{name: 'Proof of Residency', url: '${reg.proofOfResidencyPath}'}]
              })"><i class="fas fa-eye"></i> View</button>
            </div>
          </div>
        `;
      }).join('');

      // Update badge count
      const badge = document.getElementById('badge-verif');
      const badgeTab = document.getElementById('badge-verif-tab');
      const statPending = document.getElementById('stat-pending-verif');
      if (badge) badge.textContent = registrations.length;
      if (badgeTab) badgeTab.textContent = registrations.length;
      if (statPending) statPending.textContent = registrations.length;

      // Also update overview verification queue (compact version, first 3)
      const overviewQueue = document.getElementById('overview-verif-queue');
      if (overviewQueue) {
        if (!registrations.length) {
          overviewQueue.innerHTML = '<div class="empty-state-inline" style="padding:20px"><i class="fas fa-check-circle" style="color:var(--green)"></i><span>No pending verification</span></div>';
        } else {
          overviewQueue.innerHTML = registrations.slice(0, 3).map(reg => {
            const ini = reg.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            const dt  = new Date(reg.submittedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
            return `<div class="verif-item">
              <div class="verif-av">${ini}</div>
              <div class="verif-info"><div class="verif-name">${escHtml(reg.fullName)}</div><div class="verif-sub">${escHtml(reg.address)} · ${dt}</div></div>
              <div class="verif-actions">
                <button class="approve-btn yes" onclick="approveResident('verif-${reg.id}','${escHtml(reg.fullName)}')"><i class="fas fa-check"></i></button>
                <button class="approve-btn no"  onclick="rejectResident('verif-${reg.id}','${escHtml(reg.fullName)}')"><i class="fas fa-times"></i></button>
              </div>
            </div>`;
          }).join('');
          if (registrations.length > 3) {
            overviewQueue.innerHTML += `<div style="padding:8px 16px;font-size:12px;color:var(--gray-400);text-align:center">+${registrations.length - 3} more — <a href="#" onclick="showPage('residents',null);return false" style="color:var(--accent-dark)">View all</a></div>`;
          }
        }
      }
    } else {
      console.error('Failed to load registrations:', response.status, response.statusText);
      const container = document.getElementById('verif-pending-list');
      if (container) {
        container.innerHTML = '<div style="padding:32px;text-align:center;color:var(--red)"><i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:8px"></i><p>Failed to load registrations</p></div>';
      }
    }
  } catch (error) {
    console.error('Failed to load pending registrations:', error);
    const container = document.getElementById('verif-pending-list');
    if (container) {
      container.innerHTML = '<div style="padding:32px;text-align:center;color:var(--red)"><i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:8px"></i><p>Error loading registrations</p></div>';
    }
  }
}

async function loadApprovedRegistrations() {
  try {
    const response = await fetch('/api/registrations/approved');
    if (response.ok) {
      const registrations = await response.json();
      const tbody = document.getElementById('residents-tbody');
      if (!tbody) return;

      if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:32px;text-align:center;color:var(--gray-400)">No verified residents</td></tr>';
        return;
      }

      tbody.innerHTML = registrations.map(reg => {
        const initials = reg.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const approvedDate = new Date(reg.submittedAt).toLocaleDateString();
        return `
          <tr id="res-r${reg.id}">
            <td><strong>${escHtml(reg.fullName)}</strong></td>
            <td>${escHtml(reg.address)}</td>
            <td>${escHtml(reg.mobile || 'N/A')}</td>
            <td>${approvedDate}</td>
            <td><span class="status-pill sp-approved">Verified</span></td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="viewResidentInfo('${escHtml(reg.fullName)}','${escHtml(reg.address)}')"><i class="fas fa-eye"></i> View</button>
              <button class="btn btn-outline btn-sm" style="color:var(--orange)" onclick="openSuspendModal('res-r${reg.id}','${escHtml(reg.fullName)}')"><i class="fas fa-ban"></i> Suspend</button>
            </td>
          </tr>
        `;
      }).join('');

      // Update count in header
      const headerCount = document.querySelector('#res-tab-verified .card-header h3');
      if (headerCount) {
        headerCount.textContent = `All Verified Residents (${registrations.length})`;
      }
    }
  } catch (error) {
    console.error('Failed to load approved registrations:', error);
  }
}

async function loadRecentlyVerified() {
  console.log('loadRecentlyVerified called');
  const tbody = document.getElementById('recently-verified-tbody');
  if (!tbody) {
    console.error('recently-verified-tbody element not found');
    return;
  }
  try {
    const response = await fetch('/api/registrations/approved');
    console.log('Response status:', response.status);
    if (response.ok) {
      const registrations = await response.json();
      console.log('Approved registrations loaded:', registrations);

      // Get 5 most recent
      const recent = registrations.slice(0, 5);

      if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding:32px;text-align:center;color:var(--gray-400)">No recently verified residents</td></tr>';
        return;
      }

      tbody.innerHTML = recent.map(reg => {
        const approvedDate = new Date(reg.submittedAt).toLocaleDateString();
        return `
          <tr>
            <td><strong>${escHtml(reg.fullName)}</strong></td>
            <td>${escHtml(reg.address)}</td>
            <td>${escHtml(reg.reviewedBy || 'Admin')}</td>
            <td>${approvedDate}</td>
          </tr>
        `;
      }).join('');
    } else {
      console.error('Failed to load approved registrations:', response.status, response.statusText);
      tbody.innerHTML = '<tr><td colspan="4" style="padding:32px;text-align:center;color:var(--red)">Failed to load</td></tr>';
    }
  } catch (error) {
    console.error('Failed to load recently verified:', error);
    tbody.innerHTML = '<tr><td colspan="4" style="padding:32px;text-align:center;color:var(--red)">Error loading</td></tr>';
  }
}

function residentTypeDisplay(type) {
  return type === 'homeowner' ? 'Homeowner' : type === 'tenant' ? 'Tenant' : type;
}

function openResidentDetail(data) {
  const ct = document.getElementById('resident-detail-content'); if (!ct) return;
  const ini = data.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  ct.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;padding-bottom:18px;border-bottom:1px solid var(--gray-100);margin-bottom:18px">
      <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;flex-shrink:0">${ini}</div>
      <div>
        <div style="font-size:16px;font-weight:800;color:var(--green)">${escHtml(data.name)}</div>
        <div style="font-size:12px;color:var(--gray-600)">${escHtml(data.unit)}</div>
        <div style="font-size:11px;color:var(--gray-400)">Submitted: ${escHtml(data.date)}</div>
      </div>
    </div>
    <div class="form-group"><label>Submitted Documents</label>
      <div style="background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius);overflow:hidden">
        ${(data.docs||[]).map(doc=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--gray-100)"><i class="fas fa-file-alt" style="color:var(--green);flex-shrink:0"></i><span style="flex:1;font-size:13px">${escHtml(doc.name)}</span><a href="${doc.url||'#'}" target="_blank" class="btn btn-outline btn-sm" style="font-size:11px"><i class="fas fa-eye"></i> View</a><span class="status-pill sp-approved" style="font-size:10px">Submitted</span></div>`).join('')}
        ${data.missing?`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--orange-light)"><i class="fas fa-exclamation-triangle" style="color:var(--orange);flex-shrink:0"></i><span style="color:var(--orange);font-size:13px;font-weight:700">Missing: ${escHtml(data.missing)}</span></div>`:''}
      </div>
    </div>
    <div class="form-group"><label>Staff Notes</label><textarea placeholder="Internal notes…" style="min-height:70px"></textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
      <button class="btn btn-primary" onclick="showToast('✅ ${escHtml(data.name)} approved');closeModal('residentDetail')"><i class="fas fa-check"></i> Approve</button>
      <button class="btn btn-outline" style="color:var(--red)" onclick="showToast('${escHtml(data.name)} rejected','error');closeModal('residentDetail')"><i class="fas fa-times"></i> Reject</button>
    </div>`;
  openModal('residentDetail');
}

/* FIXED: View on Verified tab opens a proper modal */
function viewResidentInfo(name, unit) {
  const ct = document.getElementById('resident-detail-content'); if (!ct) return;
  const ini = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  ct.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;padding-bottom:18px;border-bottom:1px solid var(--gray-100);margin-bottom:18px">
      <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;flex-shrink:0">${ini}</div>
      <div>
        <div style="font-size:16px;font-weight:800;color:var(--green)">${escHtml(name)}</div>
        <div style="font-size:12px;color:var(--gray-600)">${escHtml(unit)}</div>
        <span class="status-pill sp-approved" style="margin-top:4px;display:inline-flex">Verified</span>
      </div>
    </div>
    <div class="form-group"><label>Submitted Documents</label>
      <div style="background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius);overflow:hidden">
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--gray-100)"><i class="fas fa-id-card" style="color:var(--green);flex-shrink:0"></i><span style="flex:1;font-size:13px">Government ID</span><span class="status-pill sp-approved" style="font-size:10px">Verified</span></div>
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px"><i class="fas fa-file-alt" style="color:var(--green);flex-shrink:0"></i><span style="flex:1;font-size:13px">Proof of Residency</span><span class="status-pill sp-approved" style="font-size:10px">Verified</span></div>
      </div>
    </div>
    <div class="form-group"><label>Contact Information</label>
      <div class="text-display">On file — accessible via main resident database</div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
      <button class="btn btn-outline" onclick="closeModal('residentDetail')">Close</button>
    </div>`;
  openModal('residentDetail');
}

function openSuspendModal(rowId, name) {
  document.getElementById('suspend-row-id').value = rowId;
  document.getElementById('suspend-name').value   = name;
  document.getElementById('suspend-reason').value = '';
  document.getElementById('suspend-action').value = 'suspend';
  toggleSuspendDuration();
  openModal('suspendResident');
}

/* FIXED: duration only shows when action = suspend, hidden for ban */
function toggleSuspendDuration() {
  const action = document.getElementById('suspend-action')?.value;
  const dg = document.getElementById('suspend-duration-group');
  if (dg) dg.style.display = action === 'suspend' ? '' : 'none';
}

function confirmSuspend() {
  const rowId  = document.getElementById('suspend-row-id').value;
  const name   = document.getElementById('suspend-name').value;
  const action = document.getElementById('suspend-action').value;
  const reason = (document.getElementById('suspend-reason').value || '').trim();
  if (!reason) { showToast('Reason is required.', 'error'); return; }
  const row = document.getElementById(rowId);
  if (row) {
    const sc = row.querySelector('td:nth-child(5)');
    if (sc) sc.innerHTML = `<span class="status-pill sp-suspended">${action==='ban'?'Banned':'Suspended'}</span>`;
    row.querySelectorAll('button').forEach(b => b.style.display = 'none');
  }
  closeModal('suspendResident');
  showToast(`${name} has been ${action==='ban'?'permanently banned':'suspended'}`, 'error');
}

function searchResidents(q) {
  document.querySelectorAll('#residents-tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

/* ============================================================
   COMMUNITY EXCHANGE — API-based (pending/approved advertisements)
============================================================ */
let exchangeData = { pending: [], published: [] };

async function loadExchangeData() {
  try {
    const [pendingRes, approvedRes] = await Promise.all([
      fetch('/api/advertisements/pending'),
      fetch('/api/advertisements')
    ]);
    const pendingJson = await pendingRes.json();
    const approvedJson = await approvedRes.json();
    
    if (pendingJson.success) {
      exchangeData.pending = pendingJson.data.map(ad => ({
        id: ad.id,
        title: ad.title,
        seller: ad.author || ad.contactName || 'Unknown',
        sellerLocation: '',
        category: ad.type,
        price: ad.price || '—',
        description: ad.description,
        status: 'pending',
        submittedAt: formatDate(ad.createdAt),
        image: ad.image || '📢'
      }));
    }
    
    if (approvedJson.success) {
      exchangeData.published = approvedJson.data.map(ad => ({
        id: ad.id,
        title: ad.title,
        seller: ad.author || ad.contactName || 'Unknown',
        sellerLocation: '',
        category: ad.type,
        price: ad.price || '—',
        description: ad.description,
        status: 'published',
        publishedAt: formatDate(ad.createdAt),
        image: ad.image || '📢'
      }));
    }
    
    renderExchangeDashboard();
  } catch (err) {
    console.error('Error loading exchange data:', err);
  }
}

async function approveExchange(id) {
  try {
    const res = await fetch(`/api/advertisements/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewedBy: 'Staff' })
    });
    const json = await res.json();
    if (json.success) {
      showToast('Advertisement approved and published');
      await loadExchangeData();
    } else {
      showToast('Failed to approve: ' + (json.error || 'Unknown error'), 'error');
    }
  } catch (err) {
    console.error('Error approving exchange:', err);
    showToast('Error approving advertisement', 'error');
  }
}

async function rejectExchange(id) {
  if (!confirm('Reject this advertisement?')) return;
  try {
    const res = await fetch(`/api/advertisements/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewedBy: 'Staff' })
    });
    const json = await res.json();
    if (json.success) {
      showToast('Advertisement rejected', 'error');
      await loadExchangeData();
    } else {
      showToast('Failed to reject: ' + (json.error || 'Unknown error'), 'error');
    }
  } catch (err) {
    console.error('Error rejecting exchange:', err);
    showToast('Error rejecting advertisement', 'error');
  }
}

function cancelExchange(id) {
  // For pending ads, cancel is same as reject
  rejectExchange(id);
}

function deleteExchange(id) {
  if (!confirm('Delete this published advertisement?')) return;
  // Note: Delete would need a separate API endpoint if needed
  // For now, we can only reject (which removes from approved list)
  rejectExchange(id);
}

function viewExchange(id) {
  const item = [...exchangeData.pending, ...exchangeData.published].find(i => i.id === id);
  if (!item) return;
  const ct = document.getElementById('resident-detail-content'); if (!ct) return;
  ct.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--gray-100);margin-bottom:16px">
      <div style="width:60px;height:60px;border-radius:var(--radius-lg);background:var(--green-light);display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0">${escHtml(item.image||'📢')}</div>
      <div>
        <div style="font-size:16px;font-weight:800;color:var(--green)">${escHtml(item.title)}</div>
        <div style="font-size:12px;color:var(--gray-600)">${escHtml(item.seller)}</div>
        <span class="tag ${item.status==='published'?'tag-green':'tag-yellow'}" style="margin-top:4px">${item.status==='published'?'Published':'Pending'}</span>
      </div>
    </div>
    <div class="form-group"><label>Category</label><div class="text-display">${escHtml(item.category)}</div></div>
    <div class="form-group"><label>Price</label><div class="text-display">${escHtml(item.price||'—')}</div></div>
    <div class="form-group"><label>Description</label><div class="text-display" style="white-space:pre-wrap">${escHtml(item.description)}</div></div>
    <div class="form-group"><label>${item.status==='published'?'Published':'Submitted'}</label><div class="text-display">${escHtml(item.publishedAt||item.submittedAt||'—')}</div></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
      ${item.status==='pending'?`<button class="btn btn-primary" onclick="approveExchange(${item.id});closeModal('residentDetail')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-outline" style="color:var(--red)" onclick="rejectExchange(${item.id});closeModal('residentDetail')"><i class="fas fa-times"></i> Reject</button>`:''}
      <button class="btn btn-outline" onclick="closeModal('residentDetail')">Close</button>
    </div>`;
  openModal('residentDetail');
}

function renderExchangeDashboard() {
  const d = exchangeData;
  const badge = document.getElementById('badge-exchange'); if (badge) { badge.textContent = d.pending.length; badge.style.display = d.pending.length > 0 ? '' : 'none'; }
  const cnt = document.getElementById('pending-exchange-count'); if (cnt) cnt.textContent = d.pending.length;

  const pel = document.getElementById('pending-exchange-list');
  if (pel) {
    if (!d.pending.length) {
      pel.innerHTML = `<div class="empty-state-inline" style="padding:32px"><i class="fas fa-check-circle" style="font-size:36px;color:var(--green)"></i><span>No pending approvals — all caught up!</span></div>`;
    } else {
      pel.innerHTML = d.pending.map(item => `
        <div class="ad-item">
          <div class="ad-thumb">${escHtml(item.image||'📢')}</div>
          <div class="ad-body">
            <div class="ad-title">${escHtml(item.title)}</div>
            <div class="ad-sub">${escHtml(item.seller)} · ${escHtml(item.category)}</div>
            <div class="ad-meta">${escHtml(item.price||'')} · Submitted ${escHtml(item.submittedAt||'')}</div>
            <div class="ad-actions">
              <button class="btn btn-primary btn-sm" onclick="approveExchange(${item.id})"><i class="fas fa-check"></i> Accept</button>
              <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="rejectExchange(${item.id})"><i class="fas fa-times"></i> Reject</button>
              <button class="btn btn-outline btn-sm" style="color:var(--orange)" onclick="cancelExchange(${item.id})"><i class="fas fa-ban"></i> Cancel</button>
              <button class="btn btn-outline btn-sm" onclick="viewExchange(${item.id})"><i class="fas fa-eye"></i> View</button>
            </div>
          </div>
        </div>`).join('');
    }
  }

  /* Published — NO Edit button as requested */
  const pub = document.getElementById('published-exchange-list');
  if (pub) {
    if (!d.published.length) {
      pub.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--gray-400)">No published posts yet</td></tr>`;
    } else {
      pub.innerHTML = d.published.map(item => {
        const tc = item.category==='Business Ad'?'tag-green':item.category==='Services'?'tag-blue':item.category==='Selling'?'tag-orange':item.category==='Looking For'?'tag-purple':'tag-gray';
        return `<tr>
          <td><strong>${escHtml(item.title)}</strong></td>
          <td><span class="tag ${tc}">${escHtml(item.category)}</span></td>
          <td>${escHtml(item.seller)}</td>
          <td>${escHtml(item.publishedAt||'')}</td>
          <td><span class="status-pill sp-approved">Published</span></td>
          <td class="ad-actions-table">
            <button class="btn btn-outline btn-sm" onclick="viewExchange(${item.id})"><i class="fas fa-eye"></i> View</button>
            <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteExchange(${item.id})"><i class="fas fa-trash"></i> Delete</button>
          </td>
        </tr>`;
      }).join('');
    }
  }
  updateOverviewExchange();
}

function updateOverviewExchange() {
  const d = exchangeData;
  const sv = document.getElementById('overview-pending-exchange'); if (sv) sv.textContent = d.pending.length;
  const le = document.getElementById('overview-exchange-list'); if (!le) return;
  if (!d.pending.length) { le.innerHTML = `<div class="empty-state-inline" style="padding:20px"><i class="fas fa-check-circle" style="color:var(--green)"></i><span>No pending posts</span></div>`; return; }
  le.innerHTML = d.pending.slice(0,3).map(item => `
    <div class="ad-item" style="padding:10px 16px">
      <div class="ad-thumb" style="width:40px;height:40px;font-size:18px">${escHtml(item.image||'📢')}</div>
      <div class="ad-body">
        <div class="ad-title" style="font-size:12px">${escHtml(item.title)}</div>
        <div class="ad-sub"   style="font-size:10px">${escHtml(item.seller)} · ${escHtml(item.category)}</div>
      </div>
    </div>`).join('');
}

/* ============================================================
   USAP TAYO PARA SA HOA — Forum moderation (live database)
============================================================ */
let FORUM_POSTS = [];

function renderForumsDashboard() {
  loadForumPosts();
}

async function loadForumPosts() {
  const container = document.getElementById('forum-posts-list');
  if (container) {
    container.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)"><i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:8px"></i><p>Loading discussions...</p></div>';
  }
  try {
    const res = await fetch('/api/forums/posts', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Network');
    FORUM_POSTS = await res.json();
    renderForumPosts();
    renderForumStats();
    renderForumCategories();
    const bforum = document.getElementById('badge-forums');
    if (bforum) { bforum.textContent = FORUM_POSTS.length; bforum.style.display = FORUM_POSTS.length > 0 ? '' : 'none'; }
  } catch (err) {
    console.error('Failed to load forum posts:', err);
    if (container) {
      container.innerHTML = '<div style="padding:32px;text-align:center;color:var(--red)"><i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:8px"></i><p>Failed to load discussions</p></div>';
    }
  }
}

function renderForumPosts() {
  const container = document.getElementById('forum-posts-list');
  if (!container) return;
  if (!FORUM_POSTS.length) {
    container.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)"><i class="fas fa-inbox" style="font-size:24px;margin-bottom:8px"></i><p>No discussions yet</p></div>';
    return;
  }
  container.innerHTML = FORUM_POSTS.map(p => {
    const author = p.author || 'Anonymous';
    const initials = author.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const replyCount = (p.replies || []).length;
    const cat = p.category || 'General';
    const status = p.status || 'Open';
    return `
      <div class="forum-item" id="forum-post-${p.id}">
        <div class="forum-av">${escHtml(initials)}</div>
        <div class="forum-body">
          <div class="forum-title">${escHtml(p.title || '(no title)')}</div>
          <div class="forum-meta">
            <span><i class="fas fa-user"></i> ${escHtml(author)}</span>
            <span><i class="fas fa-tag"></i> ${escHtml(cat)}</span>
            <span><i class="fas fa-reply"></i> ${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}</span>
            <span><i class="fas fa-circle" style="font-size:8px;color:${status === 'Resolved' ? 'var(--green)' : 'var(--orange)'}"></i> ${escHtml(status)}</span>
            <span>${escHtml(p.date || '')}</span>
          </div>
          <div style="font-size:13px;color:var(--gray-500);margin:6px 0">${escHtml((p.description || '').substring(0, 160))}${(p.description || '').length > 160 ? '…' : ''}</div>
          <div class="forum-actions">
            <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteForumPost(${p.id})"><i class="fas fa-trash"></i> Remove Post</button>
            <button class="btn btn-outline btn-sm" onclick="toggleForumReplies(${p.id})"><i class="fas fa-comments"></i> View Replies (${replyCount})</button>
            <button class="btn btn-outline btn-sm" style="color:var(--orange)" onclick="moderateForumUser('${escHtml(author).replace(/'/g, "\\'")}')"><i class="fas fa-user-slash"></i> Ban / Timeout</button>
            <a href="forums.html" target="_blank" class="btn btn-outline btn-sm"><i class="fas fa-external-link-alt"></i> Open Forum</a>
          </div>
          <div id="forum-replies-${p.id}" class="forum-replies" style="display:none;margin-top:10px;padding-left:12px;border-left:2px solid var(--gray-100)"></div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleForumReplies(postId) {
  const box = document.getElementById(`forum-replies-${postId}`);
  if (!box) return;
  if (box.style.display === 'none') {
    const post = FORUM_POSTS.find(p => p.id === postId);
    const replies = post?.replies || [];
    if (!replies.length) {
      box.innerHTML = '<div style="font-size:12px;color:var(--gray-400);padding:6px 0">No replies</div>';
    } else {
      box.innerHTML = replies.map(r => `
        <div class="forum-reply" id="forum-reply-${r.id}" style="padding:6px 0;display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
          <div>
            <strong style="font-size:12px">${escHtml(r.name || 'Anonymous')}</strong>${r.isStaff ? ' <span class="tag tag-green" style="font-size:10px">Staff</span>' : ''}
            <span style="font-size:11px;color:var(--gray-400)">· ${escHtml(r.date || '')}</span>
            <div style="font-size:13px;color:var(--gray-600)">${escHtml(r.text || '')}</div>
          </div>
          <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteForumReply(${r.id}, ${postId})"><i class="fas fa-trash"></i></button>
        </div>
      `).join('');
    }
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}

async function deleteForumPost(id) {
  const post = FORUM_POSTS.find(p => p.id === id);
  const title = post?.title || 'this post';
  if (!confirm(`Remove this post?\n"${title.substring(0, 60)}"\n\nThis will also delete all its replies.`)) return;
  try {
    const res = await fetch(`/api/forums/posts/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed');
    FORUM_POSTS = FORUM_POSTS.filter(p => p.id !== id);
    document.getElementById(`forum-post-${id}`)?.remove();
    renderForumStats();
    renderForumCategories();
    if (!FORUM_POSTS.length) renderForumPosts();
    showToast('Post removed', 'error');
  } catch (err) {
    console.error('Delete post failed:', err);
    showToast('Failed to remove post', 'error');
  }
}

async function deleteForumReply(replyId, postId) {
  if (!confirm('Remove this reply?')) return;
  try {
    const res = await fetch(`/api/forums/replies/${replyId}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed');
    const post = FORUM_POSTS.find(p => p.id === postId);
    if (post) post.replies = (post.replies || []).filter(r => r.id !== replyId);
    document.getElementById(`forum-reply-${replyId}`)?.remove();
    renderForumStats();
    showToast('Reply removed', 'error');
  } catch (err) {
    console.error('Delete reply failed:', err);
    showToast('Failed to remove reply', 'error');
  }
}

async function moderateForumUser(username) {
  if (!username || username === 'Anonymous') {
    showToast('Cannot moderate an anonymous author', 'error');
    return;
  }
  // Duration: 0 / empty = permanent ban; otherwise number of hours = timeout
  const input = prompt(
    `Ban or timeout "${username}" from the forums.\n\n` +
    `Enter a timeout duration in HOURS (e.g. 24 for 1 day),\n` +
    `or leave blank / 0 for a PERMANENT ban.`,
    '24'
  );
  if (input === null) return; // cancelled

  const durationHours = parseInt(input, 10);
  const isPermanent = isNaN(durationHours) || durationHours <= 0;

  const reason = prompt(`Reason for ${isPermanent ? 'banning' : 'timing out'} "${username}" (optional):`, '');
  if (reason === null) return; // cancelled

  try {
    const res = await fetch(`/api/forums/users/${encodeURIComponent(username)}/ban`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationHours: isPermanent ? null : durationHours, reason: reason || null })
    });
    if (res.status === 403) { showToast('You are not authorized to moderate users', 'error'); return; }
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      showToast(j.error || 'Failed to apply moderation', 'error');
      return;
    }
    showToast(isPermanent ? `${username} banned from forums` : `${username} timed out for ${durationHours}h`);
  } catch (err) {
    console.error('Moderation failed:', err);
    showToast('Failed to apply moderation', 'error');
  }
}

async function unbanForumUser(username) {
  if (!username) return;
  try {
    const res = await fetch(`/api/forums/users/${encodeURIComponent(username)}/unban`, {
      method: 'POST',
      credentials: 'same-origin'
    });
    if (!res.ok) { showToast('Failed to lift ban', 'error'); return; }
    showToast(`${username} can post again`);
  } catch (err) {
    console.error('Unban failed:', err);
    showToast('Failed to lift ban', 'error');
  }
}

function renderForumStats() {
  const totalReplies = FORUM_POSTS.reduce((sum, p) => sum + (p.replies || []).length, 0);
  const resolved = FORUM_POSTS.filter(p => (p.status || '').toLowerCase() === 'resolved').length;
  const unanswered = FORUM_POSTS.filter(p => (p.replies || []).length === 0).length;

  const sc = document.getElementById('forums-stat-posts');      if (sc) sc.textContent = FORUM_POSTS.length;
  const sr = document.getElementById('forums-stat-replies');    if (sr) sr.textContent = totalReplies;
  const sv = document.getElementById('forums-stat-resolved');   if (sv) sv.textContent = resolved;
  const su = document.getElementById('forums-stat-unanswered'); if (su) su.textContent = unanswered;
}

function renderForumCategories() {
  const box = document.getElementById('forum-category-breakdown');
  if (!box) return;
  if (!FORUM_POSTS.length) { box.innerHTML = '<div style="padding:16px;text-align:center;color:var(--gray-400)">No data</div>'; return; }
  const counts = {};
  FORUM_POSTS.forEach(p => { const c = p.category || 'General'; counts[c] = (counts[c] || 0) + 1; });
  const total = FORUM_POSTS.length;
  const colors = ['pf-green', 'pf-red', 'pf-orange', 'pf-blue'];
  box.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count], i) => {
      const pct = Math.round((count / total) * 100);
      return `<div class="progress-wrap"><div class="progress-label"><span>${escHtml(cat)}</span><span>${pct}%</span></div><div class="progress-bar"><div class="progress-fill ${colors[i % colors.length]}" style="width:${pct}%"></div></div></div>`;
    }).join('');
}

/* ============================================================
   RESERVATIONS — Amenity reservations (live database)
============================================================ */
let RESERVATIONS = [];

async function loadReservations() {
  const pendingTbody = document.getElementById('resv-pending-tbody');
  const allTbody = document.getElementById('resv-all-tbody');
  if (pendingTbody) pendingTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--gray-400)"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
  try {
    const res = await fetch('/api/reservations', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Network');
    RESERVATIONS = await res.json();
    renderReservations();
    renderReservationStats();
  } catch (err) {
    console.error('Failed to load reservations:', err);
    if (pendingTbody) pendingTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--red)"><i class="fas fa-exclamation-triangle"></i> Failed to load reservations</td></tr>';
    if (allTbody) allTbody.innerHTML = '';
  }
}

function _resvStatusPill(status) {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return '<span class="status-pill sp-approved">Approved</span>';
  if (s === 'rejected') return '<span class="status-pill sp-open">Rejected</span>';
  return '<span class="status-pill sp-pending">Pending</span>';
}

function _resvDateTime(r) {
  const d = r.date ? new Date(r.date + 'T00:00:00') : null;
  const dateStr = d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : escHtml(r.date || '');
  const time = [r.startTime, r.endTime].filter(Boolean).join(' - ');
  return `${dateStr}${time ? ', ' + escHtml(time) : ''}`;
}

function renderReservations() {
  const pendingTbody = document.getElementById('resv-pending-tbody');
  const allTbody = document.getElementById('resv-all-tbody');
  const countLabel = document.getElementById('resv-pending-count');

  const pending = RESERVATIONS.filter(r => (r.status || '').toLowerCase() === 'pending');
  if (countLabel) countLabel.textContent = `(${pending.length})`;
  const bresv = document.getElementById('badge-reservations');
  if (bresv) { bresv.textContent = pending.length; bresv.style.display = pending.length > 0 ? '' : 'none'; }

  if (pendingTbody) {
    pendingTbody.innerHTML = pending.length
      ? pending.map(r => `
          <tr id="resv-${r.id}">
            <td><strong>${escHtml(r.residentName || r.userId || 'Resident')}</strong></td>
            <td>${escHtml(r.amenity || '')}</td>
            <td>${_resvDateTime(r)}</td>
            <td>${escHtml(r.purpose || '')}</td>
            <td>${_resvStatusPill(r.status)}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="approveReservation(${r.id})"><i class="fas fa-check"></i> Approve</button>
              <button class="btn btn-outline btn-sm" onclick="rejectReservation(${r.id})"><i class="fas fa-times"></i> Reject</button>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--gray-400)"><i class="fas fa-inbox"></i> No pending reservations</td></tr>';
  }

  if (allTbody) {
    allTbody.innerHTML = RESERVATIONS.length
      ? RESERVATIONS.map(r => `
          <tr>
            <td><strong>${escHtml(r.residentName || r.userId || 'Resident')}</strong></td>
            <td>${escHtml(r.amenity || '')}</td>
            <td>${_resvDateTime(r)}</td>
            <td>${escHtml(r.purpose || '')}</td>
            <td>${_resvStatusPill(r.status)}</td>
            <td>${escHtml(r.reviewedBy || '—')}</td>
          </tr>`).join('')
      : '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--gray-400)"><i class="fas fa-inbox"></i> No reservations yet</td></tr>';
  }
}

function renderReservationStats() {
  const lc = s => RESERVATIONS.filter(r => (r.status || '').toLowerCase() === s).length;
  const sp = document.getElementById('resv-stat-pending');  if (sp) sp.textContent = lc('pending');
  const sa = document.getElementById('resv-stat-approved'); if (sa) sa.textContent = lc('approved');
  const sr = document.getElementById('resv-stat-rejected'); if (sr) sr.textContent = lc('rejected');
  const st = document.getElementById('resv-stat-total');    if (st) st.textContent = RESERVATIONS.length;
}

async function approveReservation(id) {
  try {
    const res = await fetch(`/api/reservations/${id}/approve`, { method: 'POST', credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed');
    const r = RESERVATIONS.find(x => x.id === id);
    if (r) { r.status = 'approved'; r.reviewedBy = 'You'; }
    renderReservations();
    renderReservationStats();
    showToast('Reservation approved');
  } catch (err) {
    console.error('Approve reservation failed:', err);
    showToast('Failed to approve reservation', 'error');
  }
}

async function rejectReservation(id) {
  const reason = prompt('Enter rejection reason (optional):');
  try {
    const res = await fetch(`/api/reservations/${id}/reject`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reason || '')
    });
    if (!res.ok) throw new Error('Failed');
    const r = RESERVATIONS.find(x => x.id === id);
    if (r) { r.status = 'rejected'; r.reviewedBy = 'You'; }
    renderReservations();
    renderReservationStats();
    showToast('Reservation rejected', 'error');
  } catch (err) {
    console.error('Reject reservation failed:', err);
    showToast('Failed to reject reservation', 'error');
  }
}

/* ============================================================
   ANNOUNCEMENTS
============================================================ */
function toggleSchedule() {
  const v = document.getElementById('ann-post-type')?.value;
  const f = document.getElementById('ann-schedule-field'); if (f) f.style.display = v === 'scheduled' ? '' : 'none';
}
function publishAnnouncement() {
  const title = (document.getElementById('ann-title')?.value || '').trim();
  const cat   = document.getElementById('ann-cat')?.value || 'General';
  const type  = document.getElementById('ann-post-type')?.value || 'now';
  if (!title) { showToast('Title is required.', 'error'); return; }
  const tagMap = {Urgent:'tag-red', Governance:'tag-orange', Event:'tag-green', Newsletter:'tag-blue', General:'tag-gray'};
  const today  = new Date().toLocaleDateString('en-PH', {month:'short', day:'numeric'});
  const isScheduled = type === 'scheduled';
  const schedDt = document.getElementById('ann-schedule-dt')?.value;
  const statusHtml = isScheduled
    ? `<span class="status-pill sp-pending">Scheduled${schedDt?' · '+new Date(schedDt).toLocaleDateString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):''}</span>`
    : '<span class="status-pill sp-approved">Published</span>';
  const id = 'ann-' + Date.now();
  const tb = document.getElementById('announcements-tbody');
  if (tb) {
    const row = document.createElement('tr'); row.id = id;
    row.innerHTML = `<td><strong>${escHtml(title)}</strong></td><td><span class="tag ${tagMap[cat]||'tag-gray'}">${escHtml(cat)}</span></td><td>Maria Santos</td><td>${today}</td><td>${statusHtml}</td><td><button class="btn btn-outline btn-sm" onclick="editAnnouncement('${id}','${escHtml(title)}','${escHtml(cat)}')"><i class="fas fa-edit"></i> Edit</button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteAnnouncement('${id}','${escHtml(title)}')"><i class="fas fa-trash"></i></button></td>`;
    tb.prepend(row);
  }
  closeModal('addAnnouncement');
  const ae = document.getElementById('ann-title');       if (ae) ae.value = '';
  const ab = document.getElementById('ann-body');        if (ab) ab.value = '';
  const hp = document.getElementById('ann-header-preview'); if (hp) hp.innerHTML = '';
  const bi = document.getElementById('ann-body-img-name');  if (bi) bi.textContent = '';
  const di = document.getElementById('ann-doc-name');       if (di) di.textContent = '';
  showToast(isScheduled ? `"${title}" scheduled` : `"${title}" published`);
}
function editAnnouncement(id, title, cat) {
  document.getElementById('edit-ann-id').value    = id;
  document.getElementById('edit-ann-title').value = title || '';
  document.getElementById('edit-ann-body').value  = '';
  document.getElementById('edit-ann-cat').value   = cat   || 'General';
  openModal('editAnnouncement');
}
function saveEditAnnouncement() {
  const id    = document.getElementById('edit-ann-id').value;
  const title = (document.getElementById('edit-ann-title').value || '').trim();
  if (!title) { showToast('Title is required.', 'error'); return; }
  const row = document.getElementById(id);
  if (row) { const td = row.querySelector('td:first-child'); if (td) td.innerHTML = `<strong>${escHtml(title)}</strong>`; }
  closeModal('editAnnouncement'); showToast('Announcement updated');
}
function deleteAnnouncement(id, name) {
  if (!confirm(`Delete "${name}"?`)) return;
  const r = document.getElementById(id); if (r) r.remove(); showToast(`"${name}" deleted`, 'error');
}

/* ============================================================
   EVENTS / CALENDAR — with Past Events section
============================================================ */
function renderCalendar() {
  const grid = document.getElementById('cal-grid'); const lbl = document.getElementById('cal-month-label'); if (!grid) return;
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  lbl.textContent = `${MONTHS[calMonth]} ${calYear}`;
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const today       = new Date();
  const evDays = new Set(EVENTS_DATA.filter(ev => { const d = new Date(ev.date); return d.getFullYear()===calYear && d.getMonth()===calMonth; }).map(ev => new Date(ev.date).getDate()));
  let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="cal-day-name">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear()===calYear && today.getMonth()===calMonth && today.getDate()===d;
    const isHev   = evDays.has(d);
    const isPast  = new Date(calYear, calMonth, d) < today && !isToday;
    html += `<div class="cal-day${isToday?' today':''}${isHev?' has-event':''}${isPast?' past':''}" onclick="calDayClick(${d})" title="${isHev?'Events this day':'Click to add event'}">${d}</div>`;
  }
  grid.innerHTML = html;
}

function calNav(dir) { calMonth += dir; if (calMonth > 11) { calMonth = 0; calYear++; } if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); }

function calDayClick(d) {
  const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const de = document.getElementById('ev-date'); if (de) de.value = ds;
  openModal('addEvent');
}

function renderEventsList() {
  const upEl   = document.getElementById('events-list');
  const pastEl = document.getElementById('past-events-list');
  const now = new Date(); now.setHours(0,0,0,0);
  const MN  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const upcoming = EVENTS_DATA.filter(ev => new Date(ev.date) >= now).sort((a,b) => new Date(a.date)-new Date(b.date));
  const past     = EVENTS_DATA.filter(ev => new Date(ev.date) <  now).sort((a,b) => new Date(b.date)-new Date(a.date));

  if (upEl) {
    if (!upcoming.length) { upEl.innerHTML = '<div class="empty-state-inline" style="padding:20px"><i class="fas fa-calendar"></i><span>No upcoming events</span></div>'; }
    else {
      upEl.innerHTML = upcoming.map(ev => {
        const d = new Date(ev.date);
        return `<div class="event-row" id="evrow-${ev.id}">
          <div class="ev-badge"><div class="ev-day">${String(d.getDate()).padStart(2,'0')}</div><div class="ev-mon">${MN[d.getMonth()]}</div></div>
          <div class="ev-info"><div class="ev-title">${escHtml(ev.title)}</div><div class="ev-time"><i class="fas fa-clock"></i> ${ev.time||'—'} · ${escHtml(ev.location||'TBD')}</div></div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="btn btn-outline btn-sm" onclick="editEvent('${ev.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteEvent('${ev.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('');
    }
  }

  if (pastEl) {
    if (!past.length) { pastEl.innerHTML = '<div class="empty-state-inline" style="padding:20px"><i class="fas fa-history"></i><span>No past events</span></div>'; }
    else {
      pastEl.innerHTML = past.map(ev => {
        const d = new Date(ev.date);
        return `<div class="event-row" id="evrow-${ev.id}" style="opacity:.7">
          <div class="ev-badge"><div class="ev-day" style="color:var(--gray-400)">${String(d.getDate()).padStart(2,'0')}</div><div class="ev-mon" style="color:var(--gray-400)">${MN[d.getMonth()]}</div></div>
          <div class="ev-info"><div class="ev-title" style="color:var(--gray-600)">${escHtml(ev.title)}</div><div class="ev-time"><i class="fas fa-clock"></i> ${ev.time||'—'} · ${escHtml(ev.location||'TBD')}</div></div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteEvent('${ev.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('');
    }
  }
}

function addEvent() {
  const title = (document.getElementById('ev-title')?.value || '').trim();
  const date  = document.getElementById('ev-date')?.value  || '';
  const time  = document.getElementById('ev-time')?.value  || '';
  const loc   = (document.getElementById('ev-loc')?.value  || '').trim() || 'TBD';
  const cat   = document.getElementById('ev-cat')?.value   || 'Community';
  if (!title) { showToast('Title is required.', 'error'); return; }
  if (!date)  { showToast('Date is required.',  'error'); return; }
  EVENTS_DATA.push({id:'ev-'+Date.now(), title, date, time, location:loc, cat});
  renderCalendar(); renderEventsList(); closeModal('addEvent');
  ['ev-title','ev-desc','ev-date','ev-time','ev-loc'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  showToast(`"${title}" added to calendar`);
}

function editEvent(id) {
  const ev = EVENTS_DATA.find(e => e.id === id); if (!ev) return;
  document.getElementById('edit-ev-id').value    = id;
  document.getElementById('edit-ev-title').value = ev.title    || '';
  document.getElementById('edit-ev-date').value  = ev.date     || '';
  document.getElementById('edit-ev-time').value  = ev.time     || '';
  document.getElementById('edit-ev-loc').value   = ev.location || '';
  document.getElementById('edit-ev-cat').value   = ev.cat      || 'Community';
  openModal('editEvent');
}
function saveEditEvent() {
  const id = document.getElementById('edit-ev-id').value;
  const ev = EVENTS_DATA.find(e => e.id === id); if (!ev) return;
  ev.title    = document.getElementById('edit-ev-title').value || ev.title;
  ev.date     = document.getElementById('edit-ev-date').value  || ev.date;
  ev.time     = document.getElementById('edit-ev-time').value  || ev.time;
  ev.location = document.getElementById('edit-ev-loc').value   || ev.location;
  ev.cat      = document.getElementById('edit-ev-cat').value   || ev.cat;
  closeModal('editEvent'); renderCalendar(); renderEventsList(); showToast('Event updated');
}
function deleteEvent(id) {
  const ev = EVENTS_DATA.find(e => e.id === id);
  if (!ev || !confirm(`Delete "${ev.title}"?`)) return;
  EVENTS_DATA = EVENTS_DATA.filter(e => e.id !== id);
  renderCalendar(); renderEventsList(); showToast(`"${ev.title}" deleted`, 'error');
}

/* ============================================================
   BOD MEMBERS — Committee field removed
============================================================ */
function viewBodMember(id) {
  const card = document.getElementById(id); if (!card) return;
  const name  = card.dataset.name  || card.querySelector('.bod-name')?.textContent  || '';
  const pos   = card.dataset.pos   || card.querySelector('.bod-pos')?.textContent   || '';
  const term  = card.dataset.term  || card.querySelector('.bod-term')?.textContent  || '';
  const phone = card.dataset.phone || '';
  const ct    = document.getElementById('view-member-content'); if (!ct) return;
  const ini   = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  ct.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--gray-100);margin-bottom:16px">
      <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;flex-shrink:0">${ini}</div>
      <div><div style="font-size:18px;font-weight:800;color:var(--green)">${escHtml(name)}</div><div style="font-size:13px;color:var(--accent-dark);font-weight:700">${escHtml(pos)}</div></div>
    </div>
    <div class="form-group"><label>Term</label><div class="text-display">${escHtml(term)}</div></div>
    <div class="form-group"><label>Contact</label><div class="text-display">${escHtml(phone||'—')}</div></div>`;
  openModal('viewMember');
}

function editBodMember(id) {
  const card = document.getElementById(id); if (!card) return;
  document.getElementById('edit-bod-id').value    = id;
  document.getElementById('edit-bod-name').value  = card.dataset.name  || card.querySelector('.bod-name')?.textContent || '';
  document.getElementById('edit-bod-pos').value   = card.dataset.pos   || card.querySelector('.bod-pos')?.textContent  || '';
  document.getElementById('edit-bod-term').value  = card.dataset.term  || card.querySelector('.bod-term')?.textContent?.replace('Term: ','') || '';
  document.getElementById('edit-bod-phone').value = card.dataset.phone || '';
  openModal('editMember');
}
function saveEditBodMember() {
  const id    = document.getElementById('edit-bod-id').value;
  const card  = document.getElementById(id); if (!card) return;
  const name  = (document.getElementById('edit-bod-name').value  || '').trim();
  const pos   = (document.getElementById('edit-bod-pos').value   || '').trim();
  const term  = (document.getElementById('edit-bod-term').value  || '').trim();
  const phone = (document.getElementById('edit-bod-phone').value || '').trim();
  if (!name) { showToast('Name is required.', 'error'); return; }
  const ini = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  card.dataset.name = name; card.dataset.pos = pos; card.dataset.term = term; card.dataset.phone = phone;
  const av = card.querySelector('.bod-avatar'); if (av) av.textContent = ini;
  const nm = card.querySelector('.bod-name');   if (nm) nm.textContent = name;
  const ps = card.querySelector('.bod-pos');    if (ps) ps.textContent = pos;
  const tr = card.querySelector('.bod-term');   if (tr) tr.textContent = `Term: ${term}`;
  const ph = card.querySelector('.bod-contact'); if (ph) ph.innerHTML = `<i class="fas fa-phone"></i> ${escHtml(phone||'—')}`;
  closeModal('editMember'); showToast(`${name} updated`);
}
function addBodMember() {
  const name  = (document.getElementById('bod-name')?.value  || '').trim();
  const pos   = (document.getElementById('bod-pos')?.value   || '').trim();
  const term  = (document.getElementById('bod-term')?.value  || '').trim();
  const phone = (document.getElementById('bod-phone')?.value || '').trim();
  if (!name) { showToast('Name is required.', 'error'); return; }
  const ini = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const id  = 'bod-' + Date.now();
  const grid = document.getElementById('bods-grid');
  if (grid) {
    const card = document.createElement('div');
    card.className = 'bod-card'; card.id = id;
    card.dataset.name = name; card.dataset.pos = pos; card.dataset.term = term; card.dataset.phone = phone;
    card.innerHTML = `<div class="bod-avatar">${ini}</div><div class="bod-name">${escHtml(name)}</div><div class="bod-pos">${escHtml(pos)}</div><div class="bod-term">Term: ${escHtml(term)}</div><div class="bod-contact"><i class="fas fa-phone"></i> ${escHtml(phone||'—')}</div><div class="bod-actions"><button class="btn btn-outline btn-sm" onclick="viewBodMember('${id}')"><i class="fas fa-eye"></i> View</button><button class="btn btn-outline btn-sm" onclick="editBodMember('${id}')"><i class="fas fa-edit"></i> Edit</button><button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteBodMember('${id}','${escHtml(name)}')"><i class="fas fa-trash"></i></button></div>`;
    grid.appendChild(card);
  }
  closeModal('addMember');
  ['bod-name','bod-pos','bod-term','bod-phone'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  showToast(`${name} added`);
}
function deleteBodMember(id, name) {
  if (!confirm(`Remove ${name}?`)) return;
  const card = document.getElementById(id); if (card) card.remove(); showToast(`${name} removed`, 'error');
}

/* ============================================================
   MEETING RECORDS
============================================================ */
function addMeetingRecord() {
  const title = (document.getElementById('meet-title')?.value || '').trim();
  const date  = document.getElementById('meet-date')?.value || '—';
  const type  = document.getElementById('meet-type')?.value || 'BOD';
  if (!title) { showToast('Title is required.', 'error'); return; }
  const id = 'meet-' + Date.now(); const tb = document.getElementById('meetings-tbody');
  if (tb) {
    const row = document.createElement('tr'); row.id = id;
    row.innerHTML = `<td><strong>${escHtml(title)}</strong></td><td>${escHtml(date)}</td><td><span class="tag tag-orange">${escHtml(type)}</span></td><td><span class="tag tag-gray"><i class="fas fa-file-pdf"></i> PDF</span></td><td><button class="btn btn-outline btn-sm" onclick="showToast('Download started')"><i class="fas fa-download"></i></button> <button class="btn btn-outline btn-sm" onclick="editMeeting('${id}','${escHtml(title)}','${escHtml(type)}','${escHtml(date)}')"><i class="fas fa-edit"></i></button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteMeeting('${id}','${escHtml(title)}')"><i class="fas fa-trash"></i></button></td>`;
    tb.prepend(row);
  }
  closeModal('addMeeting');
  ['meet-title','meet-date'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  showToast('Meeting record uploaded');
}
function editMeeting(id, title, type, date) {
  document.getElementById('edit-meet-id').value    = id;
  document.getElementById('edit-meet-title').value = title || '';
  document.getElementById('edit-meet-date').value  = date  || '';
  document.getElementById('edit-meet-type').value  = type  || 'BOD';
  openModal('editMeeting');
}
function saveEditMeeting() {
  const id    = document.getElementById('edit-meet-id').value;
  const title = (document.getElementById('edit-meet-title').value || '').trim();
  const date  = document.getElementById('edit-meet-date').value || '';
  const type  = document.getElementById('edit-meet-type').value || 'BOD';
  if (!title) { showToast('Title is required.', 'error'); return; }
  const row = document.getElementById(id);
  if (row) {
    const cells = row.querySelectorAll('td');
    if (cells[0]) cells[0].innerHTML = `<strong>${escHtml(title)}</strong>`;
    if (cells[1]) cells[1].textContent = date;
    if (cells[2]) cells[2].innerHTML   = `<span class="tag tag-orange">${escHtml(type)}</span>`;
  }
  closeModal('editMeeting'); showToast('Meeting record updated');
}
function deleteMeeting(id, name) { if (!confirm(`Delete "${name}"?`)) return; const r = document.getElementById(id); if (r) r.remove(); showToast(`"${name}" deleted`, 'error'); }

/* ============================================================
   FORMS & DOCUMENTS
============================================================ */
function addDocument() {
  const name = (document.getElementById('doc-name')?.value || '').trim();
  const cat  = document.getElementById('doc-cat')?.value   || 'Form';
  if (!name) { showToast('Document name is required.', 'error'); return; }
  const tagMap = {Form:'tag-orange', Policy:'tag-green', Guide:'tag-blue', Certificate:'tag-yellow'};
  const id = 'doc-' + Date.now(); const tb = document.getElementById('documents-tbody');
  if (tb) {
    const row = document.createElement('tr'); row.id = id;
    row.innerHTML = `<td><strong>${escHtml(name)}</strong></td><td><span class="tag ${tagMap[cat]||'tag-gray'}">${escHtml(cat)}</span></td><td><button class="btn btn-outline btn-sm" onclick="viewDocument('${escHtml(name)}')"><i class="fas fa-eye"></i> View</button> <button class="btn btn-outline btn-sm" onclick="showToast('Download started')"><i class="fas fa-download"></i> Download</button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteDocument('${id}','${escHtml(name)}')"><i class="fas fa-trash"></i> Delete</button></td>`;
    tb.prepend(row);
  }
  closeModal('addDocument'); const ne = document.getElementById('doc-name'); if (ne) ne.value = '';
  showToast('Document uploaded');
}
function viewDocument(name)       { showToast(`Opening "${name}"…`, 'info'); }
function deleteDocument(id, name) { if (!confirm(`Delete "${name}"?`)) return; const r = document.getElementById(id); if (r) r.remove(); showToast(`"${name}" deleted`, 'error'); }

/* ============================================================
   CONTACTS
============================================================ */
function addContact() {
  const name  = (document.getElementById('con-name')?.value  || '').trim();
  const role  = (document.getElementById('con-role')?.value  || '').trim();
  const phone = (document.getElementById('con-phone')?.value || '').trim();
  const email = (document.getElementById('con-email')?.value || '').trim();
  if (!name) { showToast('Name is required.', 'error'); return; }
  const id = 'con-' + Date.now(); const tb = document.getElementById('contacts-tbody');
  if (tb) {
    const row = document.createElement('tr'); row.id = id;
    row.innerHTML = `<td><strong>${escHtml(name)}</strong></td><td>${escHtml(role||'—')}</td><td>${escHtml(phone||'—')}</td><td>${escHtml(email||'—')}</td><td><button class="btn btn-outline btn-sm" onclick="editContact('${id}','${escHtml(name)}','${escHtml(role)}','${escHtml(phone)}','${escHtml(email)}')"><i class="fas fa-edit"></i> Edit</button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteContact('${id}','${escHtml(name)}')"><i class="fas fa-trash"></i></button></td>`;
    tb.prepend(row);
  }
  closeModal('addContact');
  ['con-name','con-role','con-phone','con-email'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  showToast('Contact saved');
}
function editContact(id, name, role, phone, email) {
  document.getElementById('edit-con-id').value    = id;
  document.getElementById('edit-con-name').value  = name  || '';
  document.getElementById('edit-con-role').value  = role  || '';
  document.getElementById('edit-con-phone').value = phone || '';
  document.getElementById('edit-con-email').value = email || '';
  openModal('editContact');
}
function saveEditContact() {
  const id    = document.getElementById('edit-con-id').value;
  const name  = (document.getElementById('edit-con-name').value  || '').trim();
  const role  = (document.getElementById('edit-con-role').value  || '').trim();
  const phone = (document.getElementById('edit-con-phone').value || '').trim();
  const email = (document.getElementById('edit-con-email').value || '').trim();
  if (!name) { showToast('Name is required.', 'error'); return; }
  const row = document.getElementById(id);
  if (row) {
    const cells = row.querySelectorAll('td');
    if (cells[0]) cells[0].innerHTML  = `<strong>${escHtml(name)}</strong>`;
    if (cells[1]) cells[1].textContent = role  || '—';
    if (cells[2]) cells[2].textContent = phone || '—';
    if (cells[3]) cells[3].textContent = email || '—';
    if (cells[4]) cells[4].innerHTML  = `<button class="btn btn-outline btn-sm" onclick="editContact('${id}','${escHtml(name)}','${escHtml(role)}','${escHtml(phone)}','${escHtml(email)}')"><i class="fas fa-edit"></i> Edit</button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteContact('${id}','${escHtml(name)}')"><i class="fas fa-trash"></i></button>`;
  }
  closeModal('editContact'); showToast('Contact updated');
}
function deleteContact(id, name) { if (!confirm(`Delete "${name}"?`)) return; const r = document.getElementById(id); if (r) r.remove(); showToast(`"${name}" deleted`, 'error'); }

/* ============================================================
   WORD BANK
============================================================ */
function addKeyword() {
  addNewKeyword();
}
function removeKeyword(chip) { if (confirm(`Remove keyword "${chip.textContent}"?`)) { chip.remove(); showToast('Keyword removed', 'info'); } }

/* ============================================================
   SETTINGS
============================================================ */
function applyTheme(theme) { document.body.classList.remove('theme-blue','theme-slate'); if (theme==='blue') document.body.classList.add('theme-blue'); if (theme==='slate') document.body.classList.add('theme-slate'); }
function applyFontSize(size) { document.body.style.fontSize = size; }
function saveSettings() {
  const name  = (document.getElementById('set-name')?.value || '').trim();
  const role  = (document.getElementById('set-role')?.value || '').trim();
  const theme = document.getElementById('set-theme')?.value    || 'green';
  const fs    = document.getElementById('set-fontsize')?.value || '13.5px';
  const sb    = document.getElementById('set-sidebar')?.value  || 'expanded';
  if (name) { const ne = document.getElementById('sb-uname'); if (ne) ne.textContent = name; const av = document.getElementById('sb-avatar'); if (av) av.textContent = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(); }
  if (role) { const re = document.getElementById('sb-urole'); if (re) re.textContent = role; }
  applyTheme(theme); applyFontSize(fs);
  const sidebar = document.getElementById('sidebar'); const main = document.getElementById('main-content'); const topbar = document.getElementById('topbar');
  if (sb === 'collapsed') { sidebar.classList.add('collapsed'); main.classList.add('expanded'); topbar.classList.add('expanded'); }
  else { sidebar.classList.remove('collapsed'); main.classList.remove('expanded'); topbar.classList.remove('expanded'); }
  try { localStorage.setItem('lba4_settings', JSON.stringify({name,role,theme,fs,sb})); } catch(e) {}
  closeModal('settings'); showToast('Settings saved');
}
function loadSettings() {
  try {
    const s = localStorage.getItem('lba4_settings'); if (!s) return; const d = JSON.parse(s);
    if (d.name) { const ne = document.getElementById('sb-uname'); if (ne) ne.textContent = d.name; const av = document.getElementById('sb-avatar'); if (av) av.textContent = d.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(); const si = document.getElementById('set-name'); if (si) si.value = d.name; }
    if (d.role) { const re = document.getElementById('sb-urole'); if (re) re.textContent = d.role; const ri = document.getElementById('set-role'); if (ri) ri.value = d.role; }
    if (d.theme) { applyTheme(d.theme); const ti = document.getElementById('set-theme'); if (ti) ti.value = d.theme; }
    if (d.fs)    { applyFontSize(d.fs); const fi = document.getElementById('set-fontsize'); if (fi) fi.value = d.fs; }
  } catch(e) {}
}

/* ============================================================
   COMMUNITY MAP
============================================================ */
const CM_COLORS = { Incident:'#c0392b', Concern:'#7c3aed', Project:'#c0621a', Landmark:'#1a5fa8' };

function makePinIcon(color, faIcon, size) {
  size = size || 38;
  return L.divIcon({ className:'', html:`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.3);border:3px solid white;"><i class="fas ${faIcon||'fa-map-marker-alt'}" style="color:white;font-size:${Math.round(size*.38)}px"></i></div>`, iconSize:[size,size], iconAnchor:[size/2,size/2] });
}
function makeCatPin(cat) {
  const colors = {Incident:'#c0392b', Concern:'#7c3aed', Project:'#c0621a', Landmark:'#1a5fa8'};
  const icons  = {Incident:'fa-exclamation', Concern:'fa-comment-dots', Project:'fa-hard-hat', Landmark:'fa-map-pin'};
  const color  = colors[cat] || '#0a4d3c'; const icon = icons[cat] || 'fa-map-marker-alt';
  return L.divIcon({ className:'', html:`<div style="position:relative;width:30px;height:42px"><div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><i class="fas ${icon}" style="transform:rotate(45deg);color:white;font-size:12px"></i></div></div>`, iconSize:[30,42], iconAnchor:[15,42] });
}

function initCommunityMap() {
  const el = document.getElementById('cm-main-map'); if (!el) return;
  if (cmMap) { cmMap.invalidateSize(); renderCmItems(); return; }
  cmMap = L.map('cm-main-map', {attributionControl:false}).setView(LBA4.center, 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(cmMap);
  L.polygon(LBA4.boundary, {color:'#0a4d3c', fillOpacity:.05, weight:2}).addTo(cmMap);
  renderCmItems();
}

function initPreviewMap() {
  const el = document.getElementById('cm-preview'); if (!el) return;
  if (previewMap) { previewMap.invalidateSize(); refreshPreviewMap(); return; }
  previewMap = L.map('cm-preview', {attributionControl:false, zoomControl:false}).setView(LBA4.center, 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(previewMap);
  L.polygon(LBA4.boundary, {color:'#0a4d3c', fillOpacity:.05, weight:2}).addTo(previewMap);
  refreshPreviewMap();
}

function refreshPreviewMap() {
  if (!previewMap) return;
  previewMap.eachLayer(layer => { if (layer instanceof L.Marker || layer instanceof L.CircleMarker) previewMap.removeLayer(layer); });
  INCIDENTS.filter(i => i.isPublic && (i.latitude || i.lat) && (i.longitude || i.lng)).forEach(inc => {
    const lat   = inc.latitude  || inc.lat;
    const lng   = inc.longitude || inc.lng;
    const color = {high:'#c0392b', medium:'#c0621a', low:'#5aaa4f'}[inc.priority] || '#c0392b';
    const ref   = inc.reference || ('INC-' + inc.id);
    const date  = inc.timestamp ? new Date(inc.timestamp).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}) : (inc.date || '');
    L.circleMarker([lat, lng], {color, fillColor:color, radius:7, fillOpacity:.85, weight:2}).addTo(previewMap)
      .bindPopup(`<div style="font-family:Nunito,sans-serif"><strong style="font-size:12px">${escHtml((inc.description||'').substring(0,50))}</strong><br><small style="color:#6b6760">${escHtml(ref)} · ${inc.priority} priority · ${escHtml(date)}</small></div>`);
  });
}

function renderCmItems() {
  if (!cmMap) return;
  cmMapMarkers.forEach(m => cmMap.removeLayer(m)); cmMapMarkers = [];
  const filtered = cmFilter === 'all' ? MAP_ITEMS : MAP_ITEMS.filter(i => i.category === cmFilter);
  filtered.forEach(item => {
    if (!item.lat || !item.lng) return;
    const color   = CM_COLORS[item.category] || '#0a4d3c';
    const iconMap = { Incident:'fa-exclamation', Concern:'fa-comment-dots', Project:'fa-hard-hat', Landmark: item.icon||'fa-map-pin' };
    const marker  = L.marker([item.lat,item.lng], {icon: makePinIcon(color, iconMap[item.category]||'fa-map-marker-alt')})
      .addTo(cmMap)
      .bindPopup(`<div style="font-family:Nunito,sans-serif;min-width:160px"><strong style="font-size:13px">${escHtml(item.title)}</strong><br><small style="color:#6b6760">${escHtml(item.category)}${item.category!=='Landmark'?' · '+escHtml(item.status||''):''}</small>${item.description?`<br><span style="font-size:11px">${escHtml(item.description.substring(0,80))}</span>`:''}</div>`);
    cmMapMarkers.push(marker);
  });

  const listEl = document.getElementById('cm-items-list');
  if (listEl) {
    if (!filtered.length) { listEl.innerHTML = '<div class="empty-state-inline"><i class="fas fa-map-marked-alt"></i><span>No items yet. Click "Add Map Item" to get started.</span></div>'; }
    else {
      listEl.innerHTML = filtered.map(item => {
        /* FIXED: Landmark shows icon chip instead of "Pending" status */
        const metaRight = item.category === 'Landmark'
          ? `<span class="tag tag-blue"><i class="fas ${item.icon||'fa-map-pin'}"></i> Landmark</span>`
          : `<span>${escHtml(item.status||'')}</span>`;
        return `<div class="cm-item-row" onclick="cmFlyTo('${item.id}')">
          <div class="cm-item-dot" style="background:${CM_COLORS[item.category]||'#0a4d3c'}"></div>
          <div class="cm-item-body">
            <div class="cm-item-name">${escHtml(item.title)}</div>
            <div class="cm-item-meta"><span class="tag tag-gray">${escHtml(item.category)}</span> ${metaRight}${item.fromIncident?'<span style="font-size:10px;color:var(--blue)"> · From resident</span>':''}</div>
          </div>
          <div class="cm-item-actions">
            ${!item.fromIncident?`<button class="edit-btn" onclick="event.stopPropagation();openEditMapItem('${item.id}')" title="Edit"><i class="fas fa-edit"></i></button>`:''}
            <button class="del-btn" onclick="event.stopPropagation();deleteCmItem('${item.id}')" title="Remove"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('');
    }
  }
  const cnt = document.getElementById('cm-item-count'); if (cnt) cnt.textContent = `${MAP_ITEMS.length} item${MAP_ITEMS.length!==1?'s':''}`;
  renderCmSummary();
}

function cmFlyTo(id)    { const item = MAP_ITEMS.find(i => i.id === id); if (item && item.lat && cmMap) cmMap.flyTo([item.lat,item.lng],18); }
function deleteCmItem(id) { MAP_ITEMS = MAP_ITEMS.filter(i => i.id !== id); renderCmItems(); showToast('Map item removed', 'error'); }

function openEditMapItem(id) {
  const item = MAP_ITEMS.find(i => i.id === id); if (!item) return;
  document.getElementById('edit-mi-id').value     = id;
  document.getElementById('edit-mi-title').value  = item.title       || '';
  document.getElementById('edit-mi-desc').value   = item.description || '';
  document.getElementById('edit-mi-status').value = item.status      || 'Pending';
  openModal('editMapItem');
}
function saveEditMapItem() {
  const id   = document.getElementById('edit-mi-id').value;
  const item = MAP_ITEMS.find(i => i.id === id); if (!item) return;
  item.title       = (document.getElementById('edit-mi-title').value  || '').trim() || item.title;
  item.description = (document.getElementById('edit-mi-desc').value   || '').trim();
  item.status      =  document.getElementById('edit-mi-status').value || item.status;
  closeModal('editMapItem'); renderCmItems(); showToast('Map item updated');
}

function cmSetFilter(filter, chipEl) {
  document.querySelectorAll('#cm-filter-chips .chip').forEach(c => c.classList.remove('active'));
  if (chipEl) chipEl.classList.add('active');
  cmFilter = filter; renderCmItems();
}
function cmResetView() { if (cmMap) cmMap.setView(LBA4.center, 16); }

function renderCmSummary() {
  const body = document.getElementById('cm-summary-body'); if (!body) return;
  if (!MAP_ITEMS.length) { body.innerHTML = '<div class="empty-state-inline"><i class="fas fa-chart-pie"></i><span>No data yet</span></div>'; return; }
  const cats = {}; MAP_ITEMS.forEach(i => { cats[i.category] = (cats[i.category]||0)+1; });
  const max  = Math.max(...Object.values(cats), 1);
  body.innerHTML = Object.entries(cats).map(([cat,count]) => `
    <div class="cm-summary-row">
      <div class="cm-summary-label">${escHtml(cat)}</div>
      <div class="cm-summary-bar"><div class="cm-summary-fill" style="background:${CM_COLORS[cat]||'#0a4d3c'};width:${Math.round(count/max*100)}%"></div></div>
      <div class="cm-summary-count">${count}</div>
    </div>`).join('');
}

function initAmiMap() {
  const el = document.getElementById('ami-map'); if (!el) return;
  if (amiMap) { amiMap.invalidateSize(); return; }
  amiMap = L.map('ami-map', {attributionControl:false}).setView(LBA4.center, 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(amiMap);
  L.polygon(LBA4.boundary, {color:'#0a4d3c', fillOpacity:.05, weight:2}).addTo(amiMap);
  amiMap.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6), lng = e.latlng.lng.toFixed(6);
    if (amiMarker) amiMap.removeLayer(amiMarker);
    const cat = document.querySelector('#ami-cat-row .ami-cat-btn.active')?.dataset.cat || 'Incident';
    amiMarker = L.marker([lat,lng], {icon:makeCatPin(cat), draggable:true}).addTo(amiMap).bindPopup(`<strong>${cat}</strong><br><small>${lat}, ${lng}</small>`).openPopup();
    amiMarker.on('dragend', function() { const p = amiMarker.getLatLng(); setAmiCoords(p.lat.toFixed(6), p.lng.toFixed(6)); });
    setAmiCoords(lat, lng);
    const hint = document.getElementById('ami-map-hint'); if (hint) hint.style.display = 'none';
  });
}

function setAmiCoords(lat, lng) { const le = document.getElementById('ami-lat'); if (le) le.value = lat; const lo = document.getElementById('ami-lng'); if (lo) lo.value = lng; }

function selectAmiCat(btn) {
  document.querySelectorAll('.ami-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.dataset.cat;
  const sw  = document.getElementById('ami-status-wrap'); const iw = document.getElementById('ami-icon-wrap');
  if (cat === 'Landmark') { if (sw) sw.style.display = 'none'; if (iw) iw.style.display = ''; }
  else                    { if (sw) sw.style.display = '';    if (iw) iw.style.display = 'none'; }
  if (amiMarker && amiMap) {
    const latVal = parseFloat(document.getElementById('ami-lat')?.value);
    const lngVal = parseFloat(document.getElementById('ami-lng')?.value);
    if (!isNaN(latVal) && !isNaN(lngVal)) {
      amiMap.removeLayer(amiMarker);
      amiMarker = L.marker([latVal,lngVal], {icon:makeCatPin(cat), draggable:true}).addTo(amiMap);
      amiMarker.on('dragend', function() { const p = amiMarker.getLatLng(); setAmiCoords(p.lat.toFixed(6), p.lng.toFixed(6)); });
    }
  }
}

function selectAmiIcon(btn) { document.querySelectorAll('.ami-icon-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }

function saveMapItem() {
  const title  = (document.getElementById('ami-title')?.value || '').trim();
  const desc   = (document.getElementById('ami-desc')?.value  || '').trim();
  const cat    = document.querySelector('#ami-cat-row .ami-cat-btn.active')?.dataset.cat || 'Incident';
  const status = document.getElementById('ami-status')?.value || 'Pending';
  const icon   = document.querySelector('.ami-icon-btn.active')?.dataset.icon || 'fa-map-pin';
  const lat    = document.getElementById('ami-lat')?.value || '';
  const lng    = document.getElementById('ami-lng')?.value || '';
  if (!title) { showToast('Title / Name is required.', 'error'); return; }
  if (!lat||!lng) { showToast('Please click the map to place a pin.', 'error'); return; }
  MAP_ITEMS.push({id:'mi-'+Date.now(), title, description:desc, category:cat, status, lat:parseFloat(lat), lng:parseFloat(lng), icon, fromIncident:false});
  if (cmMap) renderCmItems(); closeModal('addMapItem');
  ['ami-title','ami-desc','ami-lat','ami-lng'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  const pn = document.getElementById('ami-photo-name'); if (pn) pn.textContent = 'No file chosen';
  const ht = document.getElementById('ami-map-hint');   if (ht) ht.style.display = 'block';
  document.querySelectorAll('.ami-cat-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  document.querySelectorAll('.ami-icon-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  const sw = document.getElementById('ami-status-wrap'); if (sw) sw.style.display = '';
  const iw = document.getElementById('ami-icon-wrap');   if (iw) iw.style.display = 'none';
  if (amiMarker && amiMap) { amiMap.removeLayer(amiMarker); amiMarker = null; }
  if (amiMap) { amiMap.remove(); amiMap = null; }
  showToast(`"${title}" added to map`);
}

/* ============================================================
   NOTIFICATIONS
============================================================ */
function _updateNotifBadge() {
  const open  = INCIDENTS.filter(i => i.status === 'open').length;
  const badge = document.getElementById('badge-notifications');
  if (badge) { badge.textContent = open > 9 ? '9+' : open; badge.style.display = open > 0 ? 'flex' : 'none'; }
}

function buildNotifications() {
  const items = [];
  INCIDENTS.filter(i => i.status === 'open').slice(0,5).forEach(inc => {
    const reporter = inc.reporterName || (inc.anonymous ? 'Anonymous' : 'Resident');
    const ini  = reporter.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() || '??';
    const date = inc.timestamp ? new Date(inc.timestamp).toLocaleDateString('en-PH',{month:'short',day:'numeric'}) : '';
    items.push({ ini, color:{high:'#c0392b',medium:'#c0621a',low:'#5aaa4f'}[inc.priority]||'#c0621a', name:reporter, action:`Logged a ${inc.priority} priority ${inc.category||'incident'}`, detail:(inc.description||'').substring(0,55), time:date, unread:true, onClick:()=>{ closeNotifModal(); viewIncidentDetail(inc.id); } });
  });
  const ex = exchangeData;
  if (ex.pending.length) items.push({ ini:'CE', color:'#c0621a', name:'Community Exchange', action:`${ex.pending.length} post${ex.pending.length>1?'s':''} pending approval`, detail:ex.pending.map(p=>p.title).join(', ').substring(0,55), time:'Now', unread:true, onClick:()=>{ closeNotifModal(); showPage('exchange',null); } });
  if (!items.length) items.push({ ini:'LB', color:'#0a4d3c', name:'System', action:'All caught up!', detail:'No pending items.', time:'Now', unread:false, onClick:closeNotifModal });
  return items;
}

function openNotifModal() {
  const overlay = document.getElementById('notif-modal-overlay'); if (!overlay) return;
  const items = buildNotifications();
  overlay.innerHTML = `<div class="notif-modal-card">
    <div class="notif-modal-header"><div class="notif-modal-bell"><i class="fas fa-bell"></i></div><h2 class="notif-modal-title">Notifications</h2><button class="notif-modal-close" onclick="closeNotifModal()"><i class="fas fa-times"></i></button></div>
    <div class="notif-modal-body">${items.map((n,i)=>`<div class="notif-entry${n.unread?' notif-unread-entry':''}" onclick="_notifClick(${i})">${n.unread?'<div class="notif-unread-bar"></div>':''}<div class="notif-avatar" style="background:${n.color}22;color:${n.color}">${n.ini}</div><div class="notif-content"><div class="notif-name">${escHtml(n.name)}</div><div class="notif-action">${escHtml(n.action)}</div><div class="notif-detail">${escHtml(n.detail)}</div></div><div class="notif-time">${escHtml(n.time)}</div></div>`).join('')}</div>
    <div class="notif-modal-footer"><button class="notif-footer-btn" onclick="closeNotifModal()">Mark all as read</button><button class="notif-footer-btn notif-footer-link" onclick="closeNotifModal();showPage('incidents',null)">View incidents →</button></div>
  </div>`;
  overlay._handlers = items.map(n => n.onClick);
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('notif-modal-open'));
}
function _notifClick(i) { const o = document.getElementById('notif-modal-overlay'); if (o?._handlers?.[i]) o._handlers[i](); }
function closeNotifModal() { const o = document.getElementById('notif-modal-overlay'); if (!o) return; o.classList.remove('notif-modal-open'); setTimeout(() => { o.style.display = 'none'; }, 250); }

/* ============================================================
   STAFF STATS — Load overview counts from /api/staff/stats
============================================================ */
async function loadStaffStats() {
  try {
    const res  = await fetch('/api/staff/stats', { credentials: 'same-origin' });
    if (!res.ok) return;
    const d = await res.json();
    if (!d.success) return;
    const el = id => document.getElementById(id);
    if (el('stat-verified-residents'))  el('stat-verified-residents').textContent  = d.verifiedResidents ?? '—';
    if (el('stat-open-incidents'))      el('stat-open-incidents').textContent      = d.openIncidents ?? 0;
    if (el('stat-pending-verif'))       el('stat-pending-verif').textContent       = d.pendingRegistrations ?? 0;
    if (el('overview-pending-exchange'))el('overview-pending-exchange').textContent= d.pendingAds ?? 0;
    const bv = el('badge-verif');
    if (bv) bv.textContent = d.pendingRegistrations ?? 0;
    const bi = el('badge-incidents');
    if (bi) { bi.textContent = d.openIncidents ?? 0; bi.style.display = d.openIncidents > 0 ? '' : 'none'; }
  } catch (e) {
    console.warn('Could not load staff stats', e);
  }
}

/* ============================================================
   ACTIVITY FEED — Load recent activity from /api/admin/recent-activities
============================================================ */
async function loadActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  try {
    const res  = await fetch('/api/admin/recent-activities', { credentials: 'same-origin' });
    if (!res.ok) { feed.innerHTML = '<div class="activity-item"><div class="act-dot" style="background:var(--gray-300)"></div><div class="act-body"><p style="color:var(--gray-400);font-size:12px">No activity yet</p></div></div>'; return; }
    const data = await res.json();
    const items = data.success ? (data.data || []) : [];
    if (!items.length) {
      feed.innerHTML = '<div class="activity-item"><div class="act-dot" style="background:var(--gray-300)"></div><div class="act-body"><p style="color:var(--gray-400);font-size:12px">No recent activity</p></div></div>';
      return;
    }
    const colorMap = { registration:'var(--navy)', incident:'var(--red)', forum:'var(--gold)', reservation:'var(--green)' };
    feed.innerHTML = items.slice(0, 8).map(a => {
      const col  = colorMap[a.type] || 'var(--blue)';
      const time = a.time ? new Date(a.time).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      return `<div class="activity-item">
        <div class="act-dot" style="background:${col}"></div>
        <div class="act-body"><p>${a.text || ''}</p><div class="act-time">${time}</div></div>
      </div>`;
    }).join('');
  } catch (e) {
    console.warn('Could not load activity feed', e);
    feed.innerHTML = '<div class="activity-item"><div class="act-dot" style="background:var(--gray-300)"></div><div class="act-body"><p style="color:var(--gray-400);font-size:12px">Activity unavailable</p></div></div>';
  }
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  loadStaffStats();
  loadActivityFeed();
  loadExchangeData();
  renderCalendar(); renderEventsList();
  initKanban();
  loadPendingRegistrations();
  loadRecentlyVerified();
  loadIncidentReportsWithAnalysis();
  loadForumPosts();
  loadReservations();
  document.querySelector('.icon-btn[title="Notifications"]')?.addEventListener('click', openNotifModal);
  document.querySelector('.icon-btn[title="Settings"]')?.addEventListener('click', () => openModal('settings'));
  _updateNotifBadge();
  if (document.getElementById('kw-high-grid')) {
    loadKeywordsData();
  }
  showPage('overview', document.querySelector('.nav-link.active'));
  console.log('%c LBA4 Staff Dashboard v4 loaded ✓', 'color:#0a4d3c;font-weight:bold;font-size:13px');
});

/* ════════════════════════════════════════════════════════════════════════
   KEYWORD MANAGEMENT - Word Bank & AI Priority Detection
════════════════════════════════════════════════════════════════════════ */

let KEYWORDS_DATA = { high: [], medium: [], low: [] };

async function loadKeywordsData() {
  try {
    const response = await fetch('/api/keywords');
    const result = await response.json();
    if (result.success && result.data) {
      KEYWORDS_DATA = { high: [], medium: [], low: [] };
      result.data.forEach(kw => {
        if (kw.isActive) {
          const severity = (kw.severity || 'medium').toLowerCase();
          if (KEYWORDS_DATA[severity]) {
            KEYWORDS_DATA[severity].push(kw.keyword);
          }
        }
      });
      renderWordBank();
    }
  } catch (error) {
    console.error('Error loading keywords:', error);
  }
}

function renderWordBank() {
  const highGrid = document.getElementById('kw-high-grid');
  const medGrid = document.getElementById('kw-med-grid');

  if (highGrid) {
    highGrid.innerHTML = '';
    KEYWORDS_DATA.high.forEach(kw => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip kw-high';
      chip.innerHTML = kw;
      chip.onclick = () => removeKeywordChip(kw, 'high');
      highGrid.appendChild(chip);
    });
  }

  if (medGrid) {
    medGrid.innerHTML = '';
    KEYWORDS_DATA.medium.forEach(kw => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip kw-medium';
      chip.innerHTML = kw;
      chip.onclick = () => removeKeywordChip(kw, 'medium');
      medGrid.appendChild(chip);
    });

    KEYWORDS_DATA.low.forEach(kw => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip kw-low';
      chip.innerHTML = kw;
      chip.onclick = () => removeKeywordChip(kw, 'low');
      medGrid.appendChild(chip);
    });
  }
}

async function removeKeywordChip(keyword, severity) {
  try {
    // Find keyword by name and severity to get its ID
    const response = await fetch('/api/keywords');
    const result = await response.json();
    if (result.success && result.data) {
      const kwItem = result.data.find(k => k.keyword === keyword && k.severity === severity);
      if (kwItem) {
        const deleteResponse = await fetch(`/api/keywords/${kwItem.id}`, { method: 'DELETE' });
        const deleteResult = await deleteResponse.json();
        if (deleteResult.success) {
          showToast('Keyword removed');
          loadKeywordsData();
        }
      }
    }
  } catch (error) {
    console.error('Error removing keyword:', error);
    alert('Failed to remove keyword');
  }
}

async function addNewKeyword() {
  const keyword = document.getElementById('kw-word')?.value;
  const severity = document.getElementById('kw-sev')?.value || 'medium';
  const category = document.getElementById('kw-cat')?.value || 'Safety';

  if (!keyword || keyword.trim() === '') {
    alert('Please enter a keyword');
    return;
  }

  try {
    const response = await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyword: keyword.trim(),
        severity: severity,
        category: category,
        language: 'bilingual',
        isActive: true
      })
    });

    const result = await response.json();
    if (result.success) {
      showToast('Keyword added');
      document.getElementById('kw-word').value = '';
      closeModal('addKeyword');
      loadKeywordsData();
    } else {
      alert('Error: ' + (result.error || 'Failed to add keyword'));
    }
  } catch (error) {
    console.error('Error adding keyword:', error);
    alert('Failed to add keyword');
  }
}

async function analyzePriority(description) {
  try {
    const response = await fetch('/api/analyze-priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: description })
    });

    const result = await response.json();
    if (result.success) {
      return {
        priority: result.priority,
        keywords: result.detectedKeywords,
        keywordsJoined: result.keywordsJoined
      };
    }
  } catch (error) {
    console.error('Error analyzing priority:', error);
  }
  return { priority: 'medium', keywords: [], keywordsJoined: '' };
}

async function loadIncidentsFromAPI() {
  try {
    const response = await fetch('/api/incidents');
    const result = await response.json();
    if (result.success && result.data) {
      INCIDENTS = result.data;
      renderIncidentsTable('all');
      updateIncidentStats();
    }
  } catch (error) {
    console.error('Error loading incidents:', error);
  }
}

function filterIncidents(filter, btn) {
  const allBtns = document.querySelectorAll('#incidents-table-card .chip');
  allBtns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  renderIncidentsTable(filter);
}

function renderIncidentsTable(filter = 'all') {
  const tbody = document.getElementById('incidents-tbody');
  if (!tbody) return;

  let filtered = INCIDENTS;
  if (filter === 'high' || filter === 'medium' || filter === 'low') {
    filtered = INCIDENTS.filter(r => r.priority === filter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--gray-400)"><i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px"></i>No incidents found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const priorityColor = r.priority === 'high' ? '#c0392b' : r.priority === 'medium' ? '#f39c12' : '#27ae60';
    const priorityIcon = r.priority === 'high' ? 'fa-arrow-up' : r.priority === 'medium' ? 'fa-circle' : 'fa-arrow-down';
    const keywords = r.detectedKeywords || '';
    const keywordChips = keywords.split(',').filter(k => k.trim()).map(k => `<span class="tag tag-blue">${k.trim()}</span>`).join('');

    return `
      <tr>
        <td><strong>${r.reference || 'REF-' + r.id}</strong></td>
        <td><span style="color:${priorityColor};font-weight:bold"><i class="fas ${priorityIcon}"></i> ${(r.priority || 'medium').toUpperCase()}</span></td>
        <td>${r.description?.substring(0, 50)}...</td>
        <td>${r.street || r.address || '-'}</td>
        <td>${r.category || '-'}</td>
        <td>${r.reporterName || (r.anonymous ? 'Anonymous' : '-')}</td>
        <td>${new Date(r.timestamp).toLocaleDateString()}</td>
        <td>${keywordChips || '<span style="color:#ccc">-</span>'}</td>
        <td>${r.isPublic ? '<i class="fas fa-globe" style="color:var(--green)"></i>' : '<i class="fas fa-lock" style="color:var(--orange)"></i>'}</td>
        <td><button class="btn btn-outline btn-sm" onclick="viewIncidentDetail(${r.id})"><i class="fas fa-eye"></i></button></td>
      </tr>
    `;
  }).join('');

  const resultCount = document.getElementById('resultCount');
  if (resultCount) resultCount.textContent = filtered.length;
}

function viewIncidentDetail(id) {
  const incident = INCIDENTS.find(r => r.id === id);
  if (!incident) return;

  const status = (incident.status || 'open').toLowerCase();
  const statusLabels = { open: 'Open', 'in-progress': 'In Progress', resolved: 'Resolved' };
  const statusColors = { open: 'var(--orange)', 'in-progress': '#2980b9', resolved: 'var(--green)' };
  const isResolved = status === 'resolved';
  const resolvedInfo = isResolved && incident.resolvedBy
    ? `<div class="form-group"><label>Resolved By</label><input type="text" readonly value="${escHtml(incident.resolvedBy)}${incident.resolvedAt ? ' · ' + new Date(incident.resolvedAt).toLocaleString() : ''}" style="background:var(--gray-50)"></div>`
    : '';

  const html = `
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px;align-items:center">
      <div><div class="field-label">Reference</div><strong class="mono">${escHtml(incident.reference || 'INC-' + incident.id)}</strong></div>
      <div><div class="field-label">Priority</div><span class="priority p-${incident.priority}">${escHtml((incident.priority || 'medium').toUpperCase())}</span></div>
      <div><div class="field-label">Status</div><span style="font-weight:700;color:${statusColors[status] || 'var(--gray-500)'}">${statusLabels[status] || status}</span></div>
      <div><div class="field-label">Date</div><span style="font-size:12px">${incident.timestamp ? new Date(incident.timestamp).toLocaleString() : '-'}</span></div>
    </div>
    <div class="form-group"><label>Category</label><input type="text" readonly value="${escHtml(incident.category || 'Uncategorized')}" style="background:var(--gray-50)"></div>
    <div class="form-group"><label>Description</label><textarea readonly style="background:var(--gray-50);min-height:90px">${escHtml(incident.description || '')}</textarea></div>
    <div class="form-group"><label>Location</label><input type="text" readonly value="${escHtml(incident.street || incident.address || '-')}" style="background:var(--gray-50)"></div>
    <div class="form-group"><label>Detected Keywords</label><input type="text" readonly value="${escHtml(incident.detectedKeywords || '-')}" style="background:var(--gray-50)"></div>
    <div class="form-group"><label>Reporter</label><input type="text" readonly value="${escHtml(incident.reporterName || (incident.anonymous ? 'Anonymous' : '-'))}" style="background:var(--gray-50)"></div>
    ${resolvedInfo}
    <hr style="border:none;border-top:1px solid var(--gray-100);margin:14px 0">
    <div class="form-group"><label>Staff Comment / Resolution Note</label>
      <textarea id="inc-staff-comment" style="min-height:80px" placeholder="Add a note, steps taken, or resolution details…">${escHtml(incident.staffComment || '')}</textarea>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
      <button class="btn btn-outline" onclick="saveIncidentComment(${incident.id})"><i class="fas fa-comment-dots"></i> Save Comment</button>
      <button class="btn btn-primary" ${isResolved ? 'disabled' : ''} onclick="resolveIncident(${incident.id})"><i class="fas fa-check-circle"></i> ${isResolved ? 'Resolved' : 'Mark Resolved'}</button>
    </div>
  `;

  document.getElementById('view-incident-content').innerHTML = html;
  openModal('viewIncident');
}

async function saveIncidentComment(id) {
  const comment = (document.getElementById('inc-staff-comment')?.value || '').trim();
  if (!comment) { showToast('Please enter a comment first', 'error'); return; }
  try {
    const response = await fetch(`/api/incidents/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    });
    const result = await response.json();
    if (result.success) {
      showToast('Comment saved');
      closeModal('viewIncident');
      loadIncidentReportsWithAnalysis();
    } else {
      showToast(result.error || 'Failed to save comment', 'error');
    }
  } catch (error) {
    console.error('Save comment failed:', error);
    showToast('Failed to save comment', 'error');
  }
}

async function resolveIncident(id) {
  const comment = (document.getElementById('inc-staff-comment')?.value || '').trim();
  try {
    const response = await fetch(`/api/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    });
    const result = await response.json();
    if (result.success) {
      showToast('Incident marked resolved');
      closeModal('viewIncident');
      loadIncidentReportsWithAnalysis();
    } else {
      showToast(result.error || 'Failed to resolve incident', 'error');
    }
  } catch (error) {
    console.error('Resolve failed:', error);
    showToast('Failed to resolve incident', 'error');
  }
}

function updateIncidentStats() {
  const total     = INCIDENTS.length;
  const highCount = INCIDENTS.filter(r => r.priority === 'high').length;
  const medCount  = INCIDENTS.filter(r => r.priority === 'medium').length;
  const lowCount  = INCIDENTS.filter(r => r.priority === 'low').length;
  const openCount = INCIDENTS.filter(r => (r.status || 'open') !== 'resolved').length;

  const hn = document.getElementById('dist-high-n');    if (hn) hn.textContent = highCount;
  const hb = document.getElementById('dist-high-bar');  if (hb) hb.style.width = Math.round((highCount / Math.max(total,1)) * 100) + '%';
  const mn = document.getElementById('dist-medium-n');  if (mn) mn.textContent = medCount;
  const mb = document.getElementById('dist-medium-bar'); if (mb) mb.style.width = Math.round((medCount / Math.max(total,1)) * 100) + '%';
  const ln = document.getElementById('dist-low-n');     if (ln) ln.textContent = lowCount;
  const lb = document.getElementById('dist-low-bar');   if (lb) lb.style.width = Math.round((lowCount / Math.max(total,1)) * 100) + '%';
  const de = document.getElementById('dist-empty');     if (de) de.style.display = total ? 'none' : 'block';

  const si = document.getElementById('stat-open-incidents'); if (si) si.textContent = openCount;
  const bi = document.getElementById('badge-incidents'); if (bi) { bi.textContent = openCount; bi.style.display = openCount > 0 ? '' : 'none'; }
}

function updateCommonKeywords() {
  const kwGrid = document.getElementById('common-keywords-grid');
  if (!kwGrid) return;

  const keywordFreq = {};
  INCIDENTS.forEach(r => {
    if (r.detectedKeywords) {
      r.detectedKeywords.split(',').forEach(kw => {
        const k = kw.trim();
        if (k) keywordFreq[k] = (keywordFreq[k] || 0) + 1;
      });
    }
  });

  const sorted = Object.entries(keywordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sorted.length === 0) {
    kwGrid.innerHTML = '<div class="empty-state-inline"><i class="fas fa-tags"></i><span>Appear as incidents are logged</span></div>';
  } else {
    kwGrid.innerHTML = sorted.map(([kw, count]) => `<span class="tag tag-green">${kw} (${count})</span>`).join('');
  }
}

/* ============================================================
   WORD BANK & KEYWORD ANALYSIS
============================================================ */

async function checkAiStatus() {
  const badge = document.getElementById('ai-status-badge');
  if (!badge) return;
  try {
    const res = await fetch('/api/ai/status');
    const data = await res.json();
    if (data.available) {
      badge.style.background = 'var(--green-light)';
      badge.style.color = 'var(--green)';
      badge.innerHTML = '<i class="fas fa-circle" style="font-size:8px"></i> AI Online';
    } else {
      badge.style.background = '#fdecea';
      badge.style.color = 'var(--red)';
      badge.innerHTML = '<i class="fas fa-circle" style="font-size:8px"></i> AI Offline';
    }
  } catch (e) {
    badge.style.background = '#fdecea';
    badge.style.color = 'var(--red)';
    badge.innerHTML = '<i class="fas fa-circle" style="font-size:8px"></i> AI Offline';
  }
}

async function analyzeAllWithAI() {
  const btn = document.getElementById('btn-analyze-all');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing…'; }
  try {
    const res = await fetch('/api/ai/analyze-all', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`AI analyzed ${data.processed} item(s), saved ${data.newKeywords} new keyword(s)`);
      loadKeywordsData();
      loadWordBank();
    } else {
      showToast(data.error || 'AI analysis failed', 'error');
    }
  } catch (e) {
    showToast('Could not reach AI service', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-robot"></i> Analyze All with AI'; }
  }
}

// Load word bank data from API
async function loadWordBank() {
  const wordBankList = document.getElementById('wordbank-list');
  if (!wordBankList) return;
  try {
    const response = await fetch('/api/wordbank');
    const result = await response.json();

    if (!result.success || !result.data) {
      wordBankList.innerHTML = `<div class="empty-state-inline" style="padding:32px;color:var(--red)"><i class="fas fa-exclamation-circle"></i><span>Failed to load: ${escHtml(result.error || 'Unknown error')}</span></div>`;
      return;
    }

    wordBankList.innerHTML = generateWordBankTable(result.data);
  } catch (error) {
    console.error('Error loading word bank:', error);
    wordBankList.innerHTML = '<div class="empty-state-inline" style="padding:32px;color:var(--red)"><i class="fas fa-exclamation-circle"></i><span>Could not connect to server</span></div>';
  }
}

// Generate HTML table for word bank
function generateWordBankTable(data) {
  if (!data || data.length === 0) {
    return '<div class="empty-state-inline" style="padding:32px"><i class="fas fa-inbox"></i><span>No keywords extracted yet</span></div>';
  }

  const rows = data.map(item => {
    const severityColor = item.severity === 'high' ? '#c0392b' : item.severity === 'medium' ? '#f39c12' : '#27ae60';
    const severityIcon = item.severity === 'high' ? 'fa-arrow-up' : item.severity === 'medium' ? 'fa-circle' : 'fa-arrow-down';
    const priorityColor = item.priority === 'high' ? '#c0392b' : item.priority === 'medium' ? '#f39c12' : '#27ae60';

    return `
      <tr>
        <td><span class="tag" style="background:${severityColor};color:white">${(item.severity || 'medium').toUpperCase()}</span></td>
        <td><strong>${escHtml(item.keyword)}</strong></td>
        <td>${escHtml(item.source)}</td>
        <td><span class="tag tag-blue">${item.type}</span></td>
        <td>${escHtml(item.category || '-')}</td>
        <td>${escHtml(item.author || '-')}</td>
        <td>${new Date(item.date).toLocaleDateString()}</td>
      </tr>
    `;
  }).join('');

  return `
    <table style="width:100%">
      <thead>
        <tr>
          <th>SEVERITY</th>
          <th>KEYWORD</th>
          <th>SOURCE</th>
          <th>TYPE</th>
          <th>CATEGORY</th>
          <th>AUTHOR</th>
          <th>DATE</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Load incident reports with keyword analysis
async function loadIncidentReportsWithAnalysis() {
  try {
    const response = await fetch('/api/incidents');
    const result = await response.json();

    if (!result.success || !result.data) {
      console.error('Failed to load incidents:', result.error);
      return;
    }

    INCIDENTS = result.data;
    updateIncidentStats();
    updateCommonKeywords();
    renderIncidentsList();
    renderOverviewIncidents();
    refreshPreviewMap();
    _updateNotifBadge();
  } catch (error) {
    console.error('Error loading incidents:', error);
  }
}

// Render incidents list with keywords
function renderIncidentsList() {
  const tbody = document.getElementById('incidents-tbody');
  if (!tbody) return;

  if (INCIDENTS.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--gray-400)"><i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px"></i>No incidents yet. Use "Log Report" to add one.</td></tr>';
    return;
  }

  const rows = INCIDENTS.map(r => {
    const priorityColor = r.priority === 'high' ? '#c0392b' : r.priority === 'medium' ? '#f39c12' : '#27ae60';
    const priorityIcon = r.priority === 'high' ? 'fa-arrow-up' : r.priority === 'medium' ? 'fa-circle' : 'fa-arrow-down';
    const keywordChips = r.detectedKeywords
      ? r.detectedKeywords.split(',').map(k => `<span class="tag tag-green" style="font-size:11px;padding:3px 6px">${escHtml(k.trim())}</span>`).join(' ')
      : '';

    return `
      <tr>
        <td><strong>${r.reference || 'REF-' + r.id}</strong></td>
        <td><span style="color:${priorityColor};font-weight:bold"><i class="fas ${priorityIcon}"></i> ${(r.priority || 'medium').toUpperCase()}</span></td>
        <td>${r.description?.substring(0, 50) || '-'}...</td>
        <td>${r.street || r.address || '-'}</td>
        <td>${r.category || '-'}</td>
        <td>${r.reporterName || (r.anonymous ? 'Anonymous' : '-')}</td>
        <td>${new Date(r.timestamp).toLocaleDateString()}</td>
        <td>${keywordChips || '<span style="color:#ccc">-</span>'}</td>
        <td>${r.isPublic ? '<i class="fas fa-globe" style="color:var(--green)"></i>' : '<i class="fas fa-lock" style="color:var(--orange)"></i>'}</td>
        <td><button class="btn btn-outline btn-sm" onclick="viewIncidentDetail(${r.id})"><i class="fas fa-eye"></i></button></td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
}

// Initialize word bank and incident analysis on page load
function initializeWordBankAndAnalysis() {
  if (document.getElementById('page-incidents')) {
    loadIncidentReportsWithAnalysis();
  }
  if (document.getElementById('page-wordbank')) {
    loadWordBank();
  }
}

