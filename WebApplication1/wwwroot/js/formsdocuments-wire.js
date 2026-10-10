// Forms & Documents Page Wiring Script
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await PageCoordinator.api.get('/api/hoa-documents');
    const documents = (response && (response.data || response)) || [];
    const container = document.getElementById('documents-list') || 
                     document.querySelector('.documents-container') ||
                     document.querySelector('main');

    if (!documents.length) {
      container.innerHTML = '<div style="padding: 40px; text-align: center;"><p>No documents available at this time.</p></div>';
      return;
    }

    // Render as a single category list to match site's styles
    const items = documents.map(doc => `
      <a class="doc-item" href="/api/hoa-documents/${doc.id}/download" target="_blank" rel="noopener noreferrer">
        <div class="doc-info">
          <i class="fas ${doc.name && doc.name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} doc-icon"></i>
          <span class="doc-name">${escapeHtml(doc.name || 'Document')}</span>
        </div>
        <span class="doc-size">${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-US') : ''}</span>
        <i class="fas fa-download doc-download"></i>
      </a>
    `).join('');

    const html = `
      <div class="doc-category">
        <h2 class="category-title"><i class="fas fa-folder-open"></i> Available Documents</h2>
        <div class="doc-list">
          ${items}
        </div>
      </div>`;

    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading documents:', err);
  }
});
