// Forms & Documents Page Wiring Script
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await PageCoordinator.api.get('/api/hoa-documents');
    const documents = response.data || [];
    const container = document.getElementById('documents-list') || 
                     document.querySelector('.documents-container') ||
                     document.querySelector('main');

    if (!documents.length) {
      container.innerHTML = '<div style="padding: 40px; text-align: center;"><p>No documents available at this time.</p></div>';
      return;
    }

    const html = documents.map(doc => `
      <div class="document-card">
        <div class="document-icon">
          <i class="fas ${doc.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-alt'}"></i>
        </div>
        <div class="document-info">
          <h4>${escapeHtml(doc.title)}</h4>
          <p>${escapeHtml(doc.description || 'Document')}</p>
          <small>Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString('en-US')}</small>
        </div>
        <div class="document-action">
          <a href="${escapeHtml(doc.url)}" class="download-btn" download>
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading documents:', err);
  }
});
