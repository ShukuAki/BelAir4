// Meeting Agendas Page Wiring Script
(function () {
  'use strict';

  let allRecords = [];
  let allDocuments = [];

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return escapeHtml(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function typeLabel(type) {
    switch ((type || '').toLowerCase()) {
      case 'agenda': return 'Agenda';
      case 'minutes': return 'Minutes';
      case 'resolution': return 'Resolution';
      default: return type ? escapeHtml(type) : 'Document';
    }
  }

  // ── Recent Meeting Records Table ──────────────────────────────
  function renderRecords(records) {
    const tbody = document.getElementById('meeting-records-body');
    if (!tbody) return;

    if (!records.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 24px;">No meeting records found.</td></tr>';
      return;
    }

    const html = records.map(record => {
      const dateText = formatDate(record.date);
      const hasFile = !!record.filePath;
      const isAgenda = (record.type || '').toLowerCase() === 'agenda';
      const isMinutes = (record.type || '').toLowerCase() === 'minutes';

      const agendaCell = isAgenda
        ? (hasFile
            ? `<a href="${escapeHtml(record.filePath)}" class="doc-link" target="_blank" rel="noopener"><i class="fas fa-eye"></i> View</a>`
            : `<span>${escapeHtml(record.title || 'N/A')}</span>`)
        : '<span>—</span>';

      const minutesCell = isMinutes
        ? (hasFile
            ? `<a href="${escapeHtml(record.filePath)}" class="doc-link" download><i class="fas fa-download"></i> Download</a>`
            : `<span>${escapeHtml(record.title || 'N/A')}</span>`)
        : '<span>—</span>';

      const otherCell = (!isAgenda && !isMinutes)
        ? (hasFile
            ? `<a href="${escapeHtml(record.filePath)}" class="doc-link" target="_blank" rel="noopener"><i class="fas fa-file-pdf"></i> ${escapeHtml(record.title || typeLabel(record.type))}</a>`
            : `<span>${escapeHtml(record.title || '—')}</span>`)
        : '<span>—</span>';

      return `
      <tr>
        <td data-label="Date">${dateText}</td>
        <td data-label="Agenda">${agendaCell}</td>
        <td data-label="Minutes">${minutesCell}</td>
        <td data-label="Other Documents">${otherCell}</td>
        <td data-label="Status">
          <span class="status-badge status-completed">${typeLabel(record.type)}</span>
        </td>
      </tr>`;
    }).join('');

    tbody.innerHTML = html;
  }

  // ── Search / Filter ───────────────────────────────────────────
  function populateYearFilter(records) {
    const yearSelect = document.getElementById('year-filter');
    if (!yearSelect) return;

    const years = Array.from(new Set(records
      .map(r => r.date ? new Date(r.date).getFullYear() : null)
      .filter(y => y && !isNaN(y))))
      .sort((a, b) => b - a);

    const currentValue = yearSelect.value;
    yearSelect.innerHTML = '<option value="">All Years</option>' +
      years.map(y => `<option value="${y}">${y}</option>`).join('');
    if (years.includes(parseInt(currentValue))) yearSelect.value = currentValue;
  }

  function applyFilters() {
    const keyword = (document.getElementById('records-search-input')?.value || '').trim().toLowerCase();
    const year = document.getElementById('year-filter')?.value || '';
    const type = document.getElementById('type-filter')?.value || '';

    const filtered = allRecords.filter(r => {
      if (year && (!r.date || new Date(r.date).getFullYear() !== parseInt(year))) return false;
      if (type && (r.type || '').toLowerCase() !== type.toLowerCase()) return false;
      if (keyword) {
        const haystack = `${r.title || ''} ${r.type || ''} ${r.uploadedBy || ''}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });

    renderRecords(filtered);
  }

  function wireSearchControls() {
    const searchBtn = document.getElementById('records-search-btn');
    const searchInput = document.getElementById('records-search-input');
    const yearFilter = document.getElementById('year-filter');
    const typeFilter = document.getElementById('type-filter');

    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    if (searchInput) searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') applyFilters(); });
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
  }

  // ── Governance Documents ──────────────────────────────────────
  function categoryMatches(category, key) {
    const c = (category || '').toLowerCase();
    if (key === 'bylaws') return c.includes('by-law') || c.includes('bylaw');
    if (key === 'rules') return c.includes('rule');
    if (key === 'resolutions') return c.includes('resolution');
    return false;
  }

  function wireGovernanceCards(documents) {
    document.querySelectorAll('.governance-card').forEach(card => {
      const key = card.getAttribute('data-governance-category');
      const doc = documents.find(d => categoryMatches(d.category, key));
      const viewBtn = card.querySelector('.governance-view-btn');
      const downloadBtn = card.querySelector('.governance-download-btn');

      if (!doc || !doc.filePath) {
        [viewBtn, downloadBtn].forEach(btn => {
          if (!btn) return;
          btn.disabled = true;
          btn.title = 'No document available yet';
          btn.classList.add('btn-disabled');
        });
        return;
      }

      if (viewBtn) {
        viewBtn.addEventListener('click', () => window.open(doc.filePath, '_blank', 'noopener'));
      }
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = doc.filePath;
          a.download = doc.name || 'document';
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      }
    });
  }

  // ── Archive Section ───────────────────────────────────────────
  function renderArchive(records) {
    const container = document.getElementById('archive-container');
    if (!container) return;

    if (!records.length) {
      container.innerHTML = '<div class="archive-card"><p style="padding:12px;text-align:center;">No archived records yet.</p></div>';
      return;
    }

    const groups = {};
    records.forEach(r => {
      const year = r.date ? new Date(r.date).getFullYear() : 'Undated';
      if (!groups[year]) groups[year] = [];
      groups[year].push(r);
    });

    const years = Object.keys(groups).sort((a, b) => b - a);

    container.innerHTML = years.map(year => {
      const items = groups[year].map(r => {
        const monthName = r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'long' }) : '';
        return `
        <li>
          <a href="#" class="archive-link" data-archive-year="${year}">
            <i class="fas fa-folder"></i>
            <span>${escapeHtml(monthName)} ${escapeHtml(typeLabel(r.type))} - ${escapeHtml(r.title || '')}</span>
            <span class="archive-action">View Records <i class="fas fa-chevron-right"></i></span>
          </a>
        </li>`;
      }).join('');

      return `
      <div class="archive-card">
        <h3 class="archive-year">${escapeHtml(String(year))}</h3>
        <ul class="archive-list">${items}</ul>
      </div>`;
    }).join('');

    container.querySelectorAll('.archive-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const year = link.getAttribute('data-archive-year');
        const yearFilter = document.getElementById('year-filter');
        if (yearFilter) {
          yearFilter.value = year;
          applyFilters();
          document.querySelector('.recent-records-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── Upcoming Meeting Actions ───────────────────────────────────
  function getUpcomingAgenda(records) {
    const now = new Date();
    return records
      .filter(r => r.date && (r.type || '').toLowerCase() === 'agenda' && new Date(r.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }

  function downloadIcs(record) {
    let startDate = record && record.date ? new Date(record.date) : new Date();
    if (isNaN(startDate.getTime())) startDate = new Date();

    const timeText = (record && record.time) || '';
    const timeMatch = timeText.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = (timeMatch[3] || '').toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      startDate.setHours(hours, minutes, 0, 0);
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const toIcsDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const location = (record && record.location) || 'HOA Office, Laguna BelAir 4';
    const title = record ? (record.title || 'Board Meeting') : 'Upcoming Board Meeting';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LagunaBelAir4//MeetingAgendas//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@lagunabelair4`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(startDate)}`,
      `DTEND:${toIcsDate(endDate)}`,
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function wireUpcomingMeeting(records) {
    const viewAgendaBtn = document.getElementById('view-agenda-btn');
    const addToCalendarBtn = document.getElementById('add-to-calendar-btn');
    const dateEl = document.getElementById('upcoming-meeting-date');
    const timeEl = document.getElementById('upcoming-meeting-time');
    const locationEl = document.getElementById('upcoming-meeting-location');
    const upcoming = getUpcomingAgenda(records);

    // MeetingRecord now stores Title/Date/Time/Location/Type/FilePath, so the
    // upcoming meeting card is populated entirely from real data.
    if (upcoming) {
      if (dateEl) dateEl.textContent = formatDate(upcoming.date);
      if (timeEl) timeEl.textContent = upcoming.time || 'To be announced';
      if (locationEl) locationEl.textContent = upcoming.location || 'To be announced';
    } else {
      if (dateEl) dateEl.textContent = 'No upcoming meeting scheduled';
      if (timeEl) timeEl.textContent = '—';
      if (locationEl) locationEl.textContent = '—';
    }

    if (viewAgendaBtn) {
      if (!upcoming || !upcoming.filePath) {
        viewAgendaBtn.disabled = true;
        viewAgendaBtn.title = upcoming ? 'No agenda document uploaded yet' : 'No upcoming meeting scheduled';
      }
      viewAgendaBtn.addEventListener('click', () => {
        if (upcoming && upcoming.filePath) {
          window.open(upcoming.filePath, '_blank', 'noopener');
        } else {
          alert(upcoming ? 'No agenda document has been uploaded for the upcoming meeting yet.' : 'No upcoming meeting is currently scheduled.');
        }
      });
    }

    if (addToCalendarBtn) {
      if (!upcoming) {
        addToCalendarBtn.disabled = true;
        addToCalendarBtn.title = 'No upcoming meeting scheduled';
      } else {
        addToCalendarBtn.addEventListener('click', () => downloadIcs(upcoming));
      }
    }
  }

  // ── Init ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async function () {
    try {
      const [recordsRes, docsRes] = await Promise.all([
        PageCoordinator.api.get('/api/meeting-records'),
        PageCoordinator.api.get('/api/hoa-documents')
      ]);

      allRecords = recordsRes.data || [];
      allDocuments = docsRes.data || [];

      populateYearFilter(allRecords);
      renderRecords(allRecords);
      wireSearchControls();
      wireGovernanceCards(allDocuments);
      renderArchive(allRecords);
      wireUpcomingMeeting(allRecords);
    } catch (err) {
      console.error('Error loading meeting agendas page data:', err);
      const tbody = document.getElementById('meeting-records-body');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 24px;">Unable to load meeting records.</td></tr>';
    }
  });
})();
