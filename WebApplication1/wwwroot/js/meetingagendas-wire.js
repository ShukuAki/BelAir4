// Meeting Agendas Page Wiring Script
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await PageCoordinator.api.get('/api/meeting-records');
    const records = response.data || [];
    const container = document.getElementById('meetings-list') || 
                     document.querySelector('.meetings-container') ||
                     document.querySelector('main');

    if (!records.length) {
      container.innerHTML = '<div style="padding: 40px; text-align: center;"><p>No meeting records available.</p></div>';
      return;
    }

    const html = records.map(record => `
      <div class="meeting-card">
        <div class="meeting-header">
          <h3>${escapeHtml(record.title)}</h3>
          <span class="date">${new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="meeting-details">
          <p><strong>Time:</strong> ${escapeHtml(record.time || 'TBD')}</p>
          <p><strong>Location:</strong> ${escapeHtml(record.location || 'TBD')}</p>
          <p>${escapeHtml(record.description || 'Meeting agenda and details to follow.')}</p>
          ${record.documentUrl ? `<a href="${record.documentUrl}" class="download-btn" download>
            <i class="fas fa-download"></i> Download Agenda
          </a>` : ''}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading meeting records:', err);
  }
});
