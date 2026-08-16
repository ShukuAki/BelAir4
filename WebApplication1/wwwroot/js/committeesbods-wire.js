// Committees/BODs Page Wiring Script
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await PageCoordinator.api.get('/api/bod-members');
    const members = response.data || [];
    const container = document.getElementById('bod-members-list') || 
                     document.querySelector('.bod-members-container') ||
                     document.querySelector('main');

    if (!members.length) {
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;"><p>No BOD members found.</p></div>';
      return;
    }

    const html = members.map(member => `
      <div class="bod-card">
        <div class="bod-header">
          <h3>${escapeHtml(member.name)}</h3>
          <span class="position">${escapeHtml(member.position)}</span>
        </div>
        <div class="bod-details">
          <p><strong>Term:</strong> ${escapeHtml(member.term || 'N/A')}</p>
          <p><strong>Contact:</strong> ${escapeHtml(member.email || member.phone || 'N/A')}</p>
          <p>${escapeHtml(member.bio || 'Member of the Board of Directors')}</p>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading BOD members:', err);
  }
});
