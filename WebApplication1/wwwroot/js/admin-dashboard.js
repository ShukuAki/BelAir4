'use strict';

const PAGE_LABELS = {
  overview:'Admin Overview', auditlog:'Audit Log', systemhealth:'System Health',
  staffaccounts:'Staff Accounts', roles:'Roles & Permissions', allresidents:'All Residents',
  banned:'Banned Users', appsettings:'App Settings', wordbank:'Word Bank Config',
  integrations:'Integrations', dataexport:'Data Export', backups:'Backup Management'
};

function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (!target) return;
  target.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const label = PAGE_LABELS[id] || id;
  const bc = document.getElementById('breadcrumb-label');
  const ti = document.getElementById('topbar-title');
  if (bc) bc.textContent = label;
  if (ti) ti.textContent = label;
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('mobile-open');
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const m = document.getElementById('main-content');
  const tb = document.querySelector('.topbar');
  if (window.innerWidth <= 768) { s.classList.toggle('mobile-open'); }
  else { s.classList.toggle('collapsed'); m.classList.toggle('expanded'); tb.classList.toggle('expanded'); }
}

function openModal(id) { const m = document.getElementById('modal-' + id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById('modal-' + id); if (m) m.classList.remove('open'); }

document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); });

function showToast(msg, type) {
  type = type || 'success';
  const old = document.getElementById('toast'); if (old) old.remove();
  const t = document.createElement('div'); t.id = 'toast';
  const bg = { success:'#0d1f3c', error:'#c0392b', info:'#1a5fa8', warn:'#c8960a' };
  const ic = { success:'✓', error:'✕', info:'ℹ', warn:'⚠' };
  t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:'+(bg[type]||bg.success)+';color:white;padding:12px 20px;border-radius:8px;font-family:Nunito,sans-serif;font-size:13px;font-weight:700;box-shadow:0 4px 18px rgba(0,0,0,.25);z-index:9999;display:flex;align-items:center;gap:8px;max-width:360px;border-left:3px solid rgba(255,255,255,.3)';
  t.innerHTML = '<span style="font-size:15px">'+(ic[type]||ic.success)+'</span> '+msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

function logAudit(action, target) {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;
  const now = new Date();
  const ts = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')+':'+String(now.getSeconds()).padStart(2,'0');
  const tr = document.createElement('tr');
  tr.innerHTML = '<td class="mono">'+ts+'</td><td><strong>Admin</strong></td><td><span class="tag tag-navy">Admin</span></td><td>'+action+'</td><td>'+target+'</td><td class="mono">192.168.1.1</td><td><span class="status-pill sp-approved">Success</span></td>';
  tr.style.background = 'rgba(200,150,10,.08)';
  tbody.insertBefore(tr, tbody.firstChild);
  setTimeout(() => { tr.style.background=''; tr.style.transition='background 1s'; }, 100);
}

// ── STAFF ──
function sendInvite() {
  const name = document.getElementById('invite-name').value.trim();
  const email = document.getElementById('invite-email').value.trim();
  if (!name) { showToast('Please enter a full name','error'); return; }
  if (!email) { showToast('Please enter an email','error'); return; }
  closeModal('inviteStaff');
  const tbody = document.getElementById('pending-invites-tbody');
  const today = new Date(); const expiry = new Date(today.getTime()+7*24*60*60*1000);
  const fmt = d => d.toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><strong>'+email+'</strong></td><td><span class="tag tag-blue">Staff</span></td><td>Admin</td><td>'+fmt(today)+'</td><td>'+fmt(expiry)+'</td><td><button class="btn btn-outline btn-sm" onclick="resendInvite(this)"><i class="fas fa-redo"></i> Resend</button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="cancelInvite(this)"><i class="fas fa-times"></i> Cancel</button></td>';
  tr.style.animation='fadeUp .3s ease both'; tbody.appendChild(tr);
  document.getElementById('invite-name').value=''; document.getElementById('invite-email').value=''; document.getElementById('invite-msg').value='';
  logAudit('Sent staff invitation', email); showToast('Invitation sent to '+email);
}

function resendInvite(btn) {
  const email = btn.closest('tr').querySelector('td strong').textContent;
  logAudit('Resent invitation', email); showToast('Invitation resent to '+email,'info');
}

function cancelInvite(btn) {
  const row = btn.closest('tr'); const email = row.querySelector('td strong').textContent;
  if (!confirm('Cancel invitation to "'+email+'"?')) return;
  row.style.opacity='0'; row.style.transition='opacity .3s'; setTimeout(() => row.remove(), 300);
  logAudit('Cancelled invitation', email); showToast('Invitation cancelled','warn');
}

function openEditStaff(btn) {
  const row = btn.closest('tr'); const cells = row.querySelectorAll('td');
  document.getElementById('edit-staff-name').value = cells[0].querySelector('strong').textContent;
  document.getElementById('edit-staff-email').value = cells[1].textContent;
  const statusText = cells[4].querySelector('.status-pill').textContent.trim();
  document.getElementById('edit-staff-status').value = statusText.includes('Suspend') ? 'Suspended' : 'Active';
  const rows = Array.from(document.getElementById('staff-tbody').querySelectorAll('tr'));
  document.getElementById('edit-staff-row-ref').value = rows.indexOf(row);
  openModal('editStaff');
}

function saveStaffEdit() {
  const name = document.getElementById('edit-staff-name').value.trim();
  const email = document.getElementById('edit-staff-email').value.trim();
  const status = document.getElementById('edit-staff-status').value;
  if (!name||!email) { showToast('Name and email required','error'); return; }
  const idx = parseInt(document.getElementById('edit-staff-row-ref').value);
  const rows = Array.from(document.getElementById('staff-tbody').querySelectorAll('tr'));
  const row = rows[idx];
  if (row) {
    row.cells[0].innerHTML='<strong>'+name+'</strong>'; row.cells[1].textContent=email;
    const pill = row.cells[4].querySelector('.status-pill');
    pill.className='status-pill '+(status==='Suspended'?'sp-open':'sp-resolved');
    pill.textContent=status;
  }
  closeModal('editStaff'); logAudit('Updated staff account', name); showToast(name+"'s account updated");
}

function removeStaff(btn) {
  const row = btn.closest('tr'); const name = row.querySelector('td strong').textContent;
  if (!confirm('Permanently remove "'+name+'"? This cannot be undone. Access revoked immediately.')) return;
  row.style.opacity='0'; row.style.transition='opacity .3s';
  setTimeout(() => { row.remove(); updateStaffCount(); }, 300);
  logAudit('Removed staff account', name); showToast('"'+name+'" account removed','error');
}

function updateStaffCount() {
  const tbody = document.getElementById('staff-tbody'); if (!tbody) return;
  const staffOnly = tbody.querySelectorAll('tr').length - 1;
  const el = document.getElementById('staff-role-count');
  if (el) el.textContent = staffOnly+' user'+(staffOnly!==1?'s':'');
}

// ── RESIDENTS ──
function addResident() {
  const name = document.getElementById('res-name').value.trim();
  const email = document.getElementById('res-email').value.trim();
  const block = document.getElementById('res-block').value;
  const unit = document.getElementById('res-unit').value.trim();
  const contact = document.getElementById('res-contact').value.trim();
  const status = document.getElementById('res-status').value;
  if (!name) { showToast('Please enter a full name','error'); return; }
  if (!email) { showToast('Please enter an email','error'); return; }
  const tbody = document.getElementById('residents-tbody');
  const today = new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  const sp = status==='Verified'?'sp-approved':'sp-pending';
  const banBtn = '<button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="banResident(this)" title="Ban"><i class="fas fa-ban"></i></button>';
  const tr = document.createElement('tr'); tr.setAttribute('data-status',status);
  tr.innerHTML = '<td><strong>'+name+'</strong></td><td>'+(unit||'—')+'</td><td>'+block+'</td><td>'+(contact||'—')+'</td><td>'+email+'</td><td>'+(status==='Verified'?today:'—')+'</td><td><span class="status-pill '+sp+'">'+status+'</span></td><td><button class="btn btn-outline btn-sm" onclick="editResident(this)" title="Edit"><i class="fas fa-edit"></i></button> '+banBtn+' <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="removeResident(this)" title="Remove"><i class="fas fa-trash"></i></button></td>';
  tr.style.animation='fadeUp .3s ease both'; tbody.appendChild(tr);
  closeModal('addResident');
  ['res-name','res-email','res-unit','res-contact'].forEach(id => document.getElementById(id).value='');
  updateResidentStats(); logAudit('Added resident', name+' — '+block); showToast(name+' added to directory');
}

function editResident(btn) {
  const row = btn.closest('tr'); const cells = row.querySelectorAll('td');
  document.getElementById('edit-res-name').value = cells[0].querySelector('strong').textContent;
  document.getElementById('edit-res-email').value = cells[4].textContent;
  document.getElementById('edit-res-block').value = cells[2].textContent;
  document.getElementById('edit-res-unit').value = cells[1].textContent;
  document.getElementById('edit-res-contact').value = cells[3].textContent;
  document.getElementById('edit-res-status').value = row.getAttribute('data-status')||'Verified';
  const rows = Array.from(document.getElementById('residents-tbody').querySelectorAll('tr'));
  document.getElementById('edit-res-row-ref').value = rows.indexOf(row);
  openModal('editResident');
}

function saveResidentEdit() {
  const name = document.getElementById('edit-res-name').value.trim();
  const email = document.getElementById('edit-res-email').value.trim();
  if (!name) { showToast('Name is required','error'); return; }
  const idx = parseInt(document.getElementById('edit-res-row-ref').value);
  const rows = Array.from(document.getElementById('residents-tbody').querySelectorAll('tr'));
  const row = rows[idx];
  if (row) {
    const status = document.getElementById('edit-res-status').value;
    row.cells[0].innerHTML='<strong>'+name+'</strong>';
    row.cells[1].textContent=document.getElementById('edit-res-unit').value||'—';
    row.cells[2].textContent=document.getElementById('edit-res-block').value;
    row.cells[3].textContent=document.getElementById('edit-res-contact').value||'—';
    row.cells[4].textContent=email;
    row.setAttribute('data-status',status);
    const sp = status==='Verified'?'sp-approved':status==='Banned'?'sp-open':'sp-pending';
    row.cells[6].innerHTML='<span class="status-pill '+sp+'">'+status+'</span>';
  }
  closeModal('editResident'); updateResidentStats(); logAudit('Edited resident',name); showToast(name+"'s record updated");
}

function banResident(btn) {
  const row = btn.closest('tr'); const name = row.querySelector('td strong').textContent;
  const reason = prompt('Enter reason for banning "'+name+'":','Violation of community rules');
  if (!reason) return;
  row.setAttribute('data-status','Banned');
  row.cells[6].innerHTML='<span class="status-pill sp-open">Banned</span>';
  row.cells[7].innerHTML='<button class="btn btn-outline btn-sm" onclick="unbanResident(this)"><i class="fas fa-undo"></i> Unban</button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="removeResident(this)" title="Remove"><i class="fas fa-trash"></i></button>';
  addToBannedTable(name, reason); updateResidentStats();
  logAudit('Banned resident',name+' — '+reason); showToast(name+' has been banned','error');
}

function unbanResident(btn) {
  const row = btn.closest('tr'); const name = row.querySelector('td strong').textContent;
  if (!confirm('Unban "'+name+'"? They will regain access.')) return;
  row.setAttribute('data-status','Verified');
  row.cells[6].innerHTML='<span class="status-pill sp-approved">Verified</span>';
  row.cells[7].innerHTML='<button class="btn btn-outline btn-sm" onclick="editResident(this)" title="Edit"><i class="fas fa-edit"></i></button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="banResident(this)" title="Ban"><i class="fas fa-ban"></i></button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="removeResident(this)" title="Remove"><i class="fas fa-trash"></i></button>';
  updateResidentStats(); logAudit('Unbanned resident',name); showToast(name+' has been unbanned');
}

function removeResident(btn) {
  const row = btn.closest('tr'); const name = row.querySelector('td strong').textContent;
  if (!confirm('Permanently remove "'+name+'" from the directory?')) return;
  row.style.opacity='0'; row.style.transition='opacity .3s';
  setTimeout(() => { row.remove(); updateResidentStats(); }, 300);
  logAudit('Removed resident',name); showToast(name+' removed','error');
}

function filterResidents(status, chip) {
  document.querySelectorAll('#resident-chips .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  document.querySelectorAll('#residents-tbody tr').forEach(row => {
    row.style.display = (status==='all'||row.getAttribute('data-status')===status) ? '' : 'none';
  });
}

function updateResidentStats() {
  let v=0,p=0,b=0;
  document.querySelectorAll('#residents-tbody tr').forEach(r => {
    const s=r.getAttribute('data-status');
    if(s==='Verified')v++; else if(s==='Pending')p++; else if(s==='Banned')b++;
  });
  const ve=document.getElementById('stat-verified'); const pe=document.getElementById('stat-pending'); const be=document.getElementById('stat-banned-count');
  if(ve)ve.textContent=v; if(pe)pe.textContent=p; if(be)be.textContent=b;
}

function exportResidents() {
  showToast('Exporting resident directory…','info');
  setTimeout(() => { const fn='residents_export_'+getDateSlug()+'.csv'; addExportEntry(fn,'52 KB'); logAudit('Exported resident directory',fn); showToast('Download ready: '+fn); }, 1200);
}

// ── BANNED USERS ──
function viewBannedUser(btn, name, reason, date, duration, email) {
  document.getElementById('view-banned-name').textContent = name;
  document.getElementById('view-banned-email').textContent = email;
  document.getElementById('view-banned-reason').textContent = reason;
  document.getElementById('view-banned-date').textContent = date;
  document.getElementById('view-banned-duration').textContent = duration;
  document.getElementById('view-banned-unban-btn').onclick = () => { closeModal('viewBanned'); unbanUser(btn); };
  openModal('viewBanned');
}

function unbanUser(btn) {
  const row = btn.closest('tr'); if (!row) return;
  const name = row.querySelector('td strong').textContent;
  if (!confirm('Unban "'+name+'"? They will regain platform access.')) return;
  row.style.opacity='0'; row.style.transition='opacity .3s';
  setTimeout(() => { row.remove(); updateBannedCount(); }, 300);
  logAudit('Unbanned user',name); showToast('"'+name+'" has been unbanned');
}

function addToBannedTable(name, reason) {
  const tbody = document.getElementById('banned-tbody'); if (!tbody) return;
  const today = new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><strong>'+name+'</strong></td><td>'+reason+'</td><td>Admin</td><td>'+today+'</td><td>Permanent</td><td><button class="btn btn-outline btn-sm" onclick="viewBannedUser(this,\''+name+'\',\''+reason+'\',\''+today+'\',\'Permanent\',\'—\')"><i class="fas fa-eye"></i> View</button> <button class="btn btn-outline btn-sm" onclick="unbanUser(this)"><i class="fas fa-undo"></i> Unban</button></td>';
  tr.style.animation='fadeUp .3s ease both'; tbody.appendChild(tr); updateBannedCount();
}

function updateBannedCount() {
  const tbody = document.getElementById('banned-tbody'); if (!tbody) return;
  const h = document.querySelector('#page-banned .card-header h3');
  if (h) h.innerHTML='<i class="fas fa-list"></i> Currently Banned ('+tbody.querySelectorAll('tr').length+')';
}

// ── WORD BANK ──
function addKeyword() {
  const word = document.getElementById('kw-word').value.trim();
  const translation = document.getElementById('kw-translation').value.trim();
  const severity = document.getElementById('kw-severity').value;
  const weight = document.getElementById('kw-weight').value;
  if (!word) { showToast('Please enter a keyword','error'); return; }
  const today = new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  const sc = {Critical:'p-critical',High:'p-high',Medium:'p-medium',Low:'p-low'};
  const tbody = document.getElementById('wordbank-tbody');
  const tr = document.createElement('tr'); tr.setAttribute('data-severity',severity);
  tr.innerHTML = '<td><strong>'+word+'</strong></td><td>'+(translation||'—')+'</td><td><span class="priority '+sc[severity]+'">'+severity+'</span></td><td>'+weight+'</td><td>0</td><td>'+today+'</td><td><button class="btn btn-outline btn-sm" onclick="editKeyword(this)"><i class="fas fa-edit"></i></button> <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="deleteKeyword(this)"><i class="fas fa-trash"></i></button></td>';
  tr.style.animation='fadeUp .3s ease both'; tbody.appendChild(tr);
  closeModal('addKeyword');
  document.getElementById('kw-word').value=''; document.getElementById('kw-translation').value=''; document.getElementById('kw-weight').value='5';
  logAudit('Added keyword','"'+word+'" — '+severity); showToast('Keyword "'+word+'" added ('+severity+')');
}

function editKeyword(btn) {
  const row = btn.closest('tr'); const cells = row.querySelectorAll('td');
  document.getElementById('edit-kw-word').value = cells[0].querySelector('strong').textContent;
  document.getElementById('edit-kw-translation').value = cells[1].textContent==='—'?'':cells[1].textContent;
  document.getElementById('edit-kw-severity').value = row.getAttribute('data-severity')||'Medium';
  document.getElementById('edit-kw-weight').value = cells[3].textContent;
  const rows = Array.from(document.getElementById('wordbank-tbody').querySelectorAll('tr'));
  document.getElementById('edit-kw-row-ref').value = rows.indexOf(row);
  openModal('editKeyword');
}

function saveKeywordEdit() {
  const word = document.getElementById('edit-kw-word').value.trim();
  const translation = document.getElementById('edit-kw-translation').value.trim();
  const severity = document.getElementById('edit-kw-severity').value;
  const weight = document.getElementById('edit-kw-weight').value;
  if (!word) { showToast('Keyword cannot be empty','error'); return; }
  const idx = parseInt(document.getElementById('edit-kw-row-ref').value);
  const rows = Array.from(document.getElementById('wordbank-tbody').querySelectorAll('tr'));
  const row = rows[idx];
  if (row) {
    const today = new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'});
    const sc = {Critical:'p-critical',High:'p-high',Medium:'p-medium',Low:'p-low'};
    row.setAttribute('data-severity',severity);
    row.cells[0].innerHTML='<strong>'+word+'</strong>';
    row.cells[1].textContent=translation||'—';
    row.cells[2].innerHTML='<span class="priority '+sc[severity]+'">'+severity+'</span>';
    row.cells[3].textContent=weight; row.cells[5].textContent=today;
  }
  closeModal('editKeyword'); logAudit('Edited keyword','"'+word+'" → '+severity); showToast('Keyword "'+word+'" updated');
}

function deleteKeyword(btn) {
  const row = btn.closest('tr'); const word = row.querySelector('td strong').textContent;
  if (!confirm('Delete keyword "'+word+'"? This affects real-time incident detection.')) return;
  row.style.opacity='0'; row.style.transition='opacity .3s'; setTimeout(() => row.remove(), 300);
  logAudit('Deleted keyword','"'+word+'"'); showToast('Keyword "'+word+'" deleted','error');
}

function filterKeywords(severity, chip) {
  document.querySelectorAll('#wb-chips .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  document.querySelectorAll('#wordbank-tbody tr').forEach(row => {
    row.style.display = (severity==='all'||row.getAttribute('data-severity')===severity) ? '' : 'none';
  });
}

// ── APP SETTINGS ──
function initSaveSettings() {
  const btn = document.getElementById('saveSettingsBtn'); if (!btn) return;
  btn.addEventListener('click', () => {
    const village = document.getElementById('setting-village-name').value;
    logAudit('Saved app settings','Village: '+village); showToast('Application settings saved');
  });
}

// ── INTEGRATIONS ──
function testNotification() {
  showToast('Sending test push notification…','info');
  setTimeout(() => { logAudit('Sent test notification','All subscribers'); showToast('Test delivered to 214 subscribers'); }, 1500);
}

function saveIntegration() {
  closeModal('manageNotifIntegration');
  logAudit('Updated integration config','Push Notification Service'); showToast('Integration configuration saved');
}

// ── DATA EXPORT ──
function getDateSlug() {
  const n = new Date();
  return n.getFullYear()+String(n.getMonth()+1).padStart(2,'0')+String(n.getDate()).padStart(2,'0');
}

function addExportEntry(filename, size) {
  const tbody = document.getElementById('recent-exports-tbody'); if (!tbody) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><strong>'+filename+'</strong></td><td>Admin</td><td>Today '+timeStr+'</td><td>'+size+'</td>';
  tr.style.background='rgba(200,150,10,.1)'; tr.style.animation='fadeUp .3s ease both';
  tbody.insertBefore(tr, tbody.firstChild);
  setTimeout(() => { tr.style.background=''; tr.style.transition='background 1.5s'; }, 100);
}

function initExportButtons() {
  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const dataset = this.dataset.dataset; const format = this.dataset.format;
      const ext = format==='XLSX'?'xlsx':format==='PDF'?'pdf':format==='ALL'?'zip':'csv';
      const filename = dataset.toLowerCase().replace(/\s/g,'_')+'_'+getDateSlug()+'.'+ext;
      const size = Math.floor(Math.random()*180+30)+' KB';
      showToast('Exporting "'+dataset+'" as '+format+'…','info');
      const self = this; self.disabled=true;
      setTimeout(() => {
        self.disabled=false;
        addExportEntry(filename, size);
        logAudit('Exported '+dataset, filename+' ('+format+')');
        showToast('Download ready: '+filename);
      }, 1400);
    });
  });
}

// ── BACKUPS ──
function initBackupButtons() {
  ['mainBackupBtn','healthBackupBtn'].forEach(id => {
    const btn = document.getElementById(id); if (!btn) return;
    btn.addEventListener('click', function() {
      this.disabled=true; this.innerHTML='<i class="fas fa-spinner fa-spin"></i> Running…';
      setTimeout(() => {
        this.disabled=false;
        this.innerHTML = id==='mainBackupBtn'?'<i class="fas fa-play"></i> Run Manual Backup':'<i class="fas fa-play"></i> Run Manual Backup Now';
        addBackupEntry(); logAudit('Ran manual backup','Full database snapshot'); showToast('Backup completed successfully');
      }, 2800);
    });
  });
}

function addBackupEntry() {
  const tbody = document.getElementById('backup-tbody'); if (!tbody) return;
  const firstId = tbody.querySelector('tr td.mono');
  const lastNum = firstId ? parseInt(firstId.textContent.replace('BKP-','')) : 234;
  const newId = 'BKP-'+String(lastNum+1).padStart(4,'0');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH',{month:'short',day:'numeric'})+', '+now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
  const tr = document.createElement('tr');
  tr.innerHTML = '<td class="mono">'+newId+'</td><td>'+dateStr+'</td><td>Manual</td><td>1.21 GB</td><td><span class="status-pill sp-approved">Success</span></td><td><button class="btn btn-outline btn-sm" onclick="downloadBackup(this)"><i class="fas fa-download"></i></button> <button class="btn btn-outline btn-sm" onclick="restoreBackup(this)"><i class="fas fa-undo"></i> Restore</button></td>';
  tr.style.animation='fadeUp .3s ease both'; tr.style.background='rgba(200,150,10,.08)';
  tbody.insertBefore(tr, tbody.firstChild);
  setTimeout(() => { tr.style.background=''; tr.style.transition='background 1.5s'; }, 100);
}

function downloadBackup(btn) {
  const id = btn.closest('tr').querySelector('td.mono').textContent;
  showToast('Downloading '+id+'…','info'); logAudit('Downloaded backup',id);
}

function restoreBackup(btn) {
  const id = btn.closest('tr').querySelector('td.mono').textContent;
  if (!confirm('Restore from "'+id+'"? This overwrites current data and is irreversible.')) return;
  showToast('Restoring from '+id+'… This may take a few minutes.','warn'); logAudit('Initiated restore',id);
}

// ── MISC ──
function initSystemHealth() {
  const btn = document.getElementById('refreshHealthBtn'); if (!btn) return;
  btn.addEventListener('click', function() {
    this.innerHTML='<i class="fas fa-spinner fa-spin"></i> Refreshing…'; this.disabled=true;
    setTimeout(() => { this.innerHTML='<i class="fas fa-sync"></i> Refresh'; this.disabled=false; showToast('System health refreshed','info'); }, 1200);
  });
}

function initAuditExport() {
  const btn = document.getElementById('exportLogBtn'); if (!btn) return;
  btn.addEventListener('click', () => {
    showToast('Exporting audit log…','info');
    setTimeout(() => {
      const fn = 'audit_log_'+getDateSlug()+'.csv';
      addExportEntry(fn,'88 KB'); logAudit('Exported audit log',fn); showToast('Download ready: '+fn);
    }, 1200);
  });
}

function initToggles() {
  document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const row = this.closest('.toggle-row');
      const label = row&&row.querySelector('strong')?row.querySelector('strong').textContent:'Setting';
      const state = this.checked?'enabled':'disabled';
      logAudit('Feature toggle: '+state, label); showToast('"'+label+'" '+state, this.checked?'success':'warn');
    });
  });
}

function initChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    if (!chip.hasAttribute('onclick')) {
      chip.addEventListener('click', function() {
        const parent = this.closest('.chip-row')||this.parentElement;
        parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    }
  });
}

function initProgressBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { const f=e.target; const w=f.style.width; f.style.width='0%'; setTimeout(()=>{f.style.width=w;},50); obs.unobserve(f); }
    });
  }, {threshold:0.3});
  document.querySelectorAll('.progress-fill').forEach(f => obs.observe(f));
}

function initClock() {
  function upd() {
    const now=new Date();
    const d=now.toLocaleDateString('en-PH',{weekday:'short',year:'numeric',month:'short',day:'numeric'});
    const t=now.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
    let cl=document.getElementById('topbar-clock');
    if (!cl){cl=document.createElement('span');cl.id='topbar-clock';cl.style.cssText='margin-left:auto;font-size:11px;color:#9e9a94;font-weight:600;white-space:nowrap;';document.querySelector('.topbar').appendChild(cl);}
    cl.textContent=d+'  '+t;
  }
  upd(); setInterval(upd, 30000);
}

function initMobileOverlay() {
  const ov=document.createElement('div');ov.id='sidebar-overlay';
  ov.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:299;';
  ov.addEventListener('click',()=>{document.getElementById('sidebar').classList.remove('mobile-open');ov.style.display='none';});
  document.body.appendChild(ov);
  new MutationObserver(()=>{
    if(window.innerWidth<=768)ov.style.display=document.getElementById('sidebar').classList.contains('mobile-open')?'block':'none';
  }).observe(document.getElementById('sidebar'),{attributes:true,attributeFilter:['class']});
}

function initSearch() {
  const input=document.getElementById('admin-search'); if (!input) return;
  input.addEventListener('keydown', function(e) {
    if (e.key!=='Enter') return;
    const q=this.value.trim().toLowerCase();
    if (!q) return;
    const map={log:'auditlog',audit:'auditlog',staff:'staffaccounts',user:'staffaccounts',role:'roles',permission:'roles',resident:'allresidents',ban:'banned',setting:'appsettings',word:'wordbank',keyword:'wordbank',notif:'integrations',integration:'integrations',export:'dataexport',backup:'backups',health:'systemhealth'};
    const hit=Object.keys(map).find(k=>q.includes(k));
    if (hit){const pid=map[hit];showPage(pid,document.querySelector('[onclick*="'+pid+'"]'));showToast('Showing: '+PAGE_LABELS[pid],'info');}
    else{showToast('No match for "'+this.value+'"','info');}
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initChips(); initToggles(); initProgressBars(); initClock(); initMobileOverlay();
  initSearch(); initExportButtons(); initBackupButtons(); initSystemHealth();
  initAuditExport(); initSaveSettings(); initRolesPage();
  document.querySelectorAll('.stat-card').forEach((c,i)=>c.style.animationDelay=(i*0.07)+'s');
  showPage('overview', document.querySelector('.nav-link.active'));
  console.log('%c LBA4 Admin Panel ready','background:#0d1f3c;color:#f0b429;font-weight:bold;padding:3px 8px;border-radius:3px');
});

/* ============================================================
   ROLES & PERMISSIONS — Dynamic Manager
============================================================ */

// ── Module definitions ──
const MODULES = [
  { group: 'Resident Operations', items: [
    { id: 'incidents',       label: 'Incident Reports',       desc: 'File, view, manage, escalate incidents',     icon: 'fa-exclamation-triangle' },
    { id: 'verification',    label: 'Resident Verification',  desc: 'Approve or reject resident accounts',        icon: 'fa-user-check' },
    { id: 'ads',             label: 'Ad Approvals',           desc: 'Approve, reject, remove ad listings',        icon: 'fa-store' },
    { id: 'forum',           label: 'Forum Moderation',       desc: 'Remove posts, flag users, manage threads',   icon: 'fa-comments' },
    { id: 'reservations',    label: 'Reservations',           desc: 'View and manage amenity bookings',           icon: 'fa-calendar-check' },
  ]},
  { group: 'Content Management', items: [
    { id: 'announcements',   label: 'Announcements',          desc: 'Create and publish HOA announcements',       icon: 'fa-bullhorn' },
    { id: 'events',          label: 'Events & Calendar',      desc: 'Add and manage community events',            icon: 'fa-calendar-alt' },
    { id: 'documents',       label: 'Forms & Documents',      desc: 'Upload and manage downloadable files',       icon: 'fa-file-alt' },
    { id: 'meetings',        label: 'Meeting Records',        desc: 'Manage minutes and meeting notes',           icon: 'fa-clipboard' },
    { id: 'contacts',        label: 'Contacts & BODs',        desc: 'Manage HOA contact directory',               icon: 'fa-address-book' },
  ]},
  { group: 'Operations', items: [
    { id: 'taskboard',       label: 'Task Board',             desc: 'View and manage Kanban task cards',          icon: 'fa-tasks' },
    { id: 'heatmap',         label: 'Heatmap',                desc: 'View incident heatmap and location data',    icon: 'fa-map-marked-alt' },
    { id: 'wordbank',        label: 'Word Bank (use)',        desc: 'Use word bank for auto-priority detection',  icon: 'fa-brain' },
    { id: 'reports',         label: 'Reports',                desc: 'Generate and view operational reports',      icon: 'fa-chart-bar' },
  ]},
  { group: 'Resident Data', items: [
    { id: 'residents',       label: 'Resident Directory',     desc: 'View resident contact and unit info',        icon: 'fa-users' },
    { id: 'subscribers',     label: 'Subscribers List',       desc: 'View notification subscriber records',       icon: 'fa-bell' },
  ]},
  { group: 'Admin Only', items: [
    { id: 'wordbank_config', label: 'Word Bank Config',       desc: 'Add, edit, delete keywords and weights',     icon: 'fa-sliders-h' },
    { id: 'user_mgmt',       label: 'User Account Management',desc: 'Invite, edit, remove staff accounts',        icon: 'fa-user-cog' },
    { id: 'system_config',   label: 'System Configuration',   desc: 'App settings, feature toggles, policies',    icon: 'fa-cog' },
    { id: 'audit_log',       label: 'Audit Log',              desc: 'View all system action history',             icon: 'fa-history' },
    { id: 'data_export',     label: 'Data Export',            desc: 'Export residents, incidents, audit data',    icon: 'fa-file-export' },
    { id: 'backups',         label: 'Backups & Integrations', desc: 'Run backups, manage integrations',           icon: 'fa-database' },
  ]},
];

// ── Role store ──
let roleStore = {
  admin: {
    id: 'admin', name: 'Admin', desc: 'Full system access — protected',
    protected: true,
    perms: {} // All full — computed
  },
  staff: {
    id: 'staff', name: 'Staff', desc: 'Operational access — day-to-day tasks',
    protected: false,
    perms: {
      incidents:'full', verification:'full', ads:'full', forum:'full', reservations:'full',
      announcements:'full', events:'full', documents:'full', meetings:'full', contacts:'full',
      taskboard:'full', heatmap:'full', wordbank:'full', reports:'full',
      residents:'view', subscribers:'view',
      wordbank_config:'none', user_mgmt:'none', system_config:'none',
      audit_log:'none', data_export:'none', backups:'none',
    }
  }
};

let activeRoleId = 'admin';
let pendingPerms = {}; // unsaved changes
let hasUnsaved = false;

// ── Select role → render editor ──
function selectRole(roleId, el) {
  if (hasUnsaved) {
    if (!confirm('You have unsaved permission changes. Discard them?')) return;
    hasUnsaved = false;
  }
  activeRoleId = roleId;
  document.querySelectorAll('.role-list-item').forEach(li => li.classList.remove('active-role'));
  if (el) el.classList.add('active-role');
  renderPermEditor(roleId);
}

// ── Render permission editor ──
function renderPermEditor(roleId) {
  const role = roleStore[roleId];
  if (!role) return;
  const isAdmin = role.protected;

  document.getElementById('perm-role-name').textContent = role.name;

  const actionsEl = document.getElementById('perm-editor-actions');
  const noticeEl = document.getElementById('perm-admin-notice');
  if (isAdmin) {
    actionsEl.style.display = 'none';
    noticeEl.style.display = '';
  } else {
    actionsEl.style.display = 'flex';
    noticeEl.style.display = 'none';
    pendingPerms = Object.assign({}, role.perms);
    hasUnsaved = false;
  }

  const body = document.getElementById('perm-editor-body');
  body.innerHTML = '';

  MODULES.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'perm-group-label';
    groupEl.textContent = group.group;
    body.appendChild(groupEl);

    group.items.forEach(mod => {
      const row = document.createElement('div');
      row.className = 'perm-row';
      const currentPerm = isAdmin ? 'full' : (pendingPerms[mod.id] || 'none');

      if (isAdmin) {
        row.innerHTML = `
          <div class="perm-row-icon"><i class="fas ${mod.icon}"></i></div>
          <div class="perm-row-label">
            <div class="perm-module">${mod.label}</div>
            <div class="perm-module-desc">${mod.desc}</div>
          </div>
          <span class="perm-badge-full"><i class="fas fa-check-circle" style="font-size:11px"></i> Full</span>`;
      } else {
        row.innerHTML = `
          <div class="perm-row-icon"><i class="fas ${mod.icon}"></i></div>
          <div class="perm-row-label">
            <div class="perm-module">${mod.label}</div>
            <div class="perm-module-desc">${mod.desc}</div>
          </div>
          <div class="perm-toggle-group" data-module="${mod.id}">
            <button class="perm-btn ${currentPerm==='full'?'active-full':''}" data-val="full" onclick="togglePerm('${mod.id}','full',this)">Full</button>
            <button class="perm-btn ${currentPerm==='view'?'active-view':''}" data-val="view" onclick="togglePerm('${mod.id}','view',this)">View</button>
            <button class="perm-btn ${currentPerm==='none'?'active-none':''}" data-val="none" onclick="togglePerm('${mod.id}','none',this)">None</button>
          </div>`;
      }
      body.appendChild(row);
    });
  });
}

// ── Toggle a single perm ──
function togglePerm(moduleId, value, btn) {
  pendingPerms[moduleId] = value;
  hasUnsaved = true;
  // Update button styles in the same toggle group
  const group = btn.closest('.perm-toggle-group');
  group.querySelectorAll('.perm-btn').forEach(b => {
    b.classList.remove('active-full','active-view','active-none');
  });
  if (value === 'full') btn.classList.add('active-full');
  else if (value === 'view') btn.classList.add('active-view');
  else btn.classList.add('active-none');
  // Show unsaved dot on role name
  updateUnsavedIndicator(true);
}

function updateUnsavedIndicator(show) {
  const nameEl = document.getElementById('perm-role-name');
  const existing = nameEl.querySelector('.unsaved-dot');
  if (show && !existing) {
    const dot = document.createElement('span'); dot.className = 'unsaved-dot'; nameEl.appendChild(dot);
  } else if (!show && existing) {
    existing.remove();
  }
}

// ── Bulk set all permissions ──
function setAllPerms(value) {
  MODULES.forEach(group => {
    group.items.forEach(mod => { pendingPerms[mod.id] = value; });
  });
  hasUnsaved = true;
  renderPermEditor(activeRoleId); // re-render with new values
  // Restore action buttons (renderPermEditor re-runs and resets them)
}

// ── Save permissions ──
function savePermissions() {
  if (!roleStore[activeRoleId]) return;
  roleStore[activeRoleId].perms = Object.assign({}, pendingPerms);
  hasUnsaved = false;
  updateUnsavedIndicator(false);
  logAudit('Saved permissions', 'Role: ' + roleStore[activeRoleId].name);
  showToast('Permissions saved for "' + roleStore[activeRoleId].name + '"');
}

// ── Create new role ──
function createRole() {
  const name = document.getElementById('add-role-name').value.trim();
  const desc = document.getElementById('add-role-desc').value.trim();
  const template = document.getElementById('add-role-template').value;
  if (!name) { showToast('Please enter a role name', 'error'); return; }

  const id = 'role_' + Date.now();
  // Build starting perms from template
  let perms = {};
  const allModuleIds = MODULES.flatMap(g => g.items.map(m => m.id));
  if (template === 'staff') {
    perms = Object.assign({}, roleStore.staff.perms);
  } else if (template === 'view-only') {
    allModuleIds.forEach(mid => { perms[mid] = 'view'; });
    // Admin-only modules → none even in view-only
    ['wordbank_config','user_mgmt','system_config','audit_log','data_export','backups'].forEach(mid => { perms[mid] = 'none'; });
  } else {
    allModuleIds.forEach(mid => { perms[mid] = 'none'; });
  }

  roleStore[id] = { id, name, desc: desc || 'Custom role', protected: false, perms };

  // Add to sidebar list
  const list = document.getElementById('roles-list');
  const item = document.createElement('div');
  item.className = 'role-list-item';
  item.setAttribute('data-role-id', id);
  item.setAttribute('onclick', 'selectRole("' + id + '",this)');
  item.innerHTML = `
    <div class="rli-icon rli-custom"><i class="fas fa-user-tag"></i></div>
    <div class="rli-body">
      <div class="rli-name">${name}</div>
      <div class="rli-desc">${desc || 'Custom role'}</div>
      <div class="rli-count">0 users</div>
    </div>
    <div class="rli-actions">
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openRenameRole('${id}')" title="Rename"><i class="fas fa-pen"></i></button>
      <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="event.stopPropagation();deleteRole('${id}')" title="Delete"><i class="fas fa-trash"></i></button>
    </div>`;
  item.addEventListener('click', () => selectRole(id, item));
  list.appendChild(item);

  // Also add to invite/edit staff role dropdowns
  addRoleToDropdowns(name);

  closeModal('addRole');
  document.getElementById('add-role-name').value = '';
  document.getElementById('add-role-desc').value = '';

  // Auto-select the new role for editing
  selectRole(id, item);
  logAudit('Created new role', name);
  showToast('Role "' + name + '" created — configure permissions now', 'info');
}

// ── Add new role to the invite/edit staff dropdowns ──
function addRoleToDropdowns(name) {
  ['invite-role', 'edit-staff-role'].forEach(selectId => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    sel.appendChild(opt);
  });
}

// ── Rename role ──
function openRenameRole(roleId) {
  const role = roleStore[roleId]; if (!role) return;
  document.getElementById('rename-role-input').value = role.name;
  document.getElementById('rename-role-desc').value = role.desc || '';
  document.getElementById('rename-role-id').value = roleId;
  openModal('renameRole');
}

function saveRoleRename() {
  const id = document.getElementById('rename-role-id').value;
  const name = document.getElementById('rename-role-input').value.trim();
  const desc = document.getElementById('rename-role-desc').value.trim();
  if (!name) { showToast('Role name cannot be empty', 'error'); return; }
  if (!roleStore[id]) return;
  roleStore[id].name = name;
  roleStore[id].desc = desc;
  // Update in list
  const item = document.querySelector('[data-role-id="' + id + '"]');
  if (item) {
    const nameEl = item.querySelector('.rli-name'); if (nameEl) nameEl.textContent = name;
    const descEl = item.querySelector('.rli-desc'); if (descEl) descEl.textContent = desc || 'Custom role';
  }
  // Update editor header if active
  if (activeRoleId === id) document.getElementById('perm-role-name').textContent = name;
  closeModal('renameRole');
  logAudit('Renamed role', id + ' → ' + name);
  showToast('Role renamed to "' + name + '"');
}

// ── Delete role ──
function deleteRole(roleId) {
  const role = roleStore[roleId]; if (!role || role.protected) return;
  if (!confirm('Delete role "' + role.name + '"? Staff assigned this role will need to be reassigned.')) return;
  delete roleStore[roleId];
  const item = document.querySelector('[data-role-id="' + roleId + '"]');
  if (item) { item.style.opacity='0'; item.style.transition='opacity .3s'; setTimeout(() => item.remove(), 300); }
  if (activeRoleId === roleId) {
    activeRoleId = 'admin';
    const adminItem = document.querySelector('[data-role-id="admin"]');
    if (adminItem) selectRole('admin', adminItem);
  }
  logAudit('Deleted role', role.name);
  showToast('Role "' + role.name + '" deleted', 'error');
}

// ── Init: render admin perms on load ──
function initRolesPage() {
  renderPermEditor('admin');
  // Warn before navigating away with unsaved changes
  window.addEventListener('beforeunload', e => {
    if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; }
  });
}