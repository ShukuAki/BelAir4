'use strict';
/* ═══════════════════════════════════════════════════════
   COMMUNITY EXCHANGE — advertisements.js
   Laguna BelAir 4 HOA
═══════════════════════════════════════════════════════ */

/* ── State ── */
let POSTS = [];
let activeFilter = 'all';
let searchQuery  = '';
let currentPostId = null;
let selectedImages = []; // { file, url }

/* ── API Integration ── */
async function loadPosts() {
  try {
    const res = await fetch('/api/advertisements');
    const json = await res.json();
    if (json.success) {
      POSTS = json.data.map(ad => ({
        id: ad.id,
        type: ad.type,
        title: ad.title,
        desc: ad.description,
        poster: ad.author || ad.contactName || 'Village Resident',
        date: ad.createdAt,
        image: ad.image,
        price: ad.price,
        availability: ad.availability,
        contact: {
          name: ad.contactName,
          phone: ad.contactPhone,
          email: ad.contactEmail,
          link: ad.contactLink
        }
      }));
      renderFeed();
    } else {
      showToast('Failed to load posts', 'error');
    }
  } catch (err) {
    console.error('Error loading posts:', err);
    showToast('Error loading posts', 'error');
  }
}

/* ════════════════════════════════════════
   RENDERING
════════════════════════════════════════ */
function renderFeed() {
  const feed  = document.getElementById('postFeed');
  const empty = document.getElementById('emptyState');
  const meta  = document.getElementById('resultsCount');

  const filtered = POSTS.filter(p => {
    const matchFilter = activeFilter === 'all' || p.type === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || p.title.toLowerCase().includes(q)
      || p.desc.toLowerCase().includes(q)
      || p.poster.toLowerCase().includes(q)
      || p.type.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  feed.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.add('visible');
    meta.textContent = 'No posts found';
    return;
  }

  empty.classList.remove('visible');
  meta.textContent = `Showing ${filtered.length} post${filtered.length !== 1 ? 's' : ''}${activeFilter !== 'all' ? ' in ' + activeFilter : ''}`;

  filtered.forEach((post, i) => {
    const card = buildCard(post);
    card.style.animationDelay = (i * 0.05) + 's';
    feed.appendChild(card);
  });
}

function buildCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.id = post.id;

  // Thumbnail
  const thumb = document.createElement('div');
  thumb.className = 'post-thumb';
  if (post.image) {
    const img = document.createElement('img');
    img.src = post.image;
    img.alt = post.title;
    img.loading = 'lazy';
    // Fallback to placeholder on error
    img.onerror = () => {
      thumb.innerHTML = '';
      thumb.appendChild(makePlaceholderThumb(post.type));
    };
    thumb.appendChild(img);
  } else {
    thumb.appendChild(makePlaceholderThumb(post.type));
  }

  // Body
  const body = document.createElement('div');
  body.className = 'post-body';

  const topRow = document.createElement('div');
  topRow.className = 'post-top-row';
  topRow.innerHTML = `
    <span class="cat-badge cat-${post.type}">${post.type}</span>
    ${post.price ? `<span class="post-price-tag">${post.price}</span>` : ''}
  `;

  const title = document.createElement('h3');
  title.className = 'post-title';
  title.textContent = post.title;

  const preview = document.createElement('p');
  preview.className = 'post-preview';
  preview.textContent = post.desc;

  const bottomRow = document.createElement('div');
  bottomRow.className = 'post-bottom-row';
  bottomRow.innerHTML = `
    <div class="post-meta-left">
      <span class="post-poster"><i class="fas fa-user-circle"></i>${post.poster}</span>
      <span class="post-date">${formatDate(post.date)}</span>
    </div>
    <div class="post-actions">
      <button class="btn-view" data-id="${post.id}"><i class="fas fa-eye"></i> View</button>
      <button class="btn-icon btn-report-card" data-id="${post.id}" title="Report post"><i class="fas fa-flag"></i></button>
    </div>
  `;

  body.append(topRow, title, preview, bottomRow);
  card.append(thumb, body);

  // Click on card body (not buttons) opens detail
  card.addEventListener('click', e => {
    if (!e.target.closest('button')) openDetail(post.id);
  });

  card.querySelector('.btn-view').addEventListener('click', e => {
    e.stopPropagation();
    openDetail(post.id);
  });

  card.querySelector('.btn-report-card').addEventListener('click', e => {
    e.stopPropagation();
    currentPostId = post.id;
    openModal('reportModal');
  });

  return card;
}

function makePlaceholderThumb(type) {
  const icons = {
    'Business Ad': 'fa-store',
    'Selling':     'fa-tag',
    'Services':    'fa-hands-helping',
    'Looking For': 'fa-search',
  };
  const div = document.createElement('div');
  div.className = 'post-thumb-placeholder';
  div.innerHTML = `<i class="fas ${icons[type] || 'fa-clipboard'}"></i>`;
  return div;
}

/* ════════════════════════════════════════
   DETAIL MODAL
════════════════════════════════════════ */
function openDetail(id) {
  const post = POSTS.find(p => p.id === id);
  if (!post) return;
  currentPostId = id;

  // Images
  const imgEl = document.getElementById('detailImages');
  imgEl.innerHTML = '';
  if (post.image) {
    const img = document.createElement('img');
    img.src = post.image;
    img.alt = post.title;
    img.onerror = () => imgEl.remove();
    imgEl.appendChild(img);
  }

  // Badge + date
  document.getElementById('detailBadge').textContent = post.type;
  document.getElementById('detailBadge').className = `cat-badge cat-${post.type}`;
  document.getElementById('detailDate').textContent = formatDate(post.date);

  // Title + poster
  document.getElementById('detailTitle').textContent = post.title;
  document.getElementById('detailPoster').textContent = post.poster;

  // Extras
  const extras = document.getElementById('detailExtras');
  extras.innerHTML = '';
  if (post.price) {
    extras.innerHTML += `<span class="detail-extra-chip price"><i class="fas fa-tag"></i> ${post.price}</span>`;
  }
  if (post.availability) {
    extras.innerHTML += `<span class="detail-extra-chip"><i class="fas fa-clock"></i> ${post.availability}</span>`;
  }

  // Description
  document.getElementById('detailDesc').textContent = post.desc;

  // Contact — reset hidden state
  const contactBody = document.getElementById('contactBody');
  const toggleBtn   = document.getElementById('toggleContactBtn');
  contactBody.classList.remove('visible');
  toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Show Contact';

  buildContactItems(post.contact);

  openModal('detailModal');
}

function buildContactItems(contact) {
  const container = document.getElementById('contactItems');
  container.innerHTML = '';

  const entries = [
    { icon: 'fa-user',     label: 'Name',  value: contact.name,  type: 'text' },
    { icon: 'fa-phone',    label: 'Phone', value: contact.phone, type: 'phone' },
    { icon: 'fa-envelope', label: 'Email', value: contact.email, type: 'email' },
    { icon: 'fa-link',     label: 'Link',  value: contact.link,  type: 'link' }
  ];

  entries.forEach(({ icon, label, value, type }) => {
    if (!value) return;

    const row = document.createElement('div');
    row.className = 'contact-item-row';

    let displayHTML = '';
    if (type === 'email') {
      displayHTML = `<a href="mailto:${value}">${value}</a>`;
    } else if (type === 'link') {
      displayHTML = `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    } else if (type === 'phone') {
      displayHTML = `<a href="tel:${value}">${value}</a>`;
    } else {
      displayHTML = value;
    }

    row.innerHTML = `
      <div class="contact-item-icon"><i class="fas ${icon}"></i></div>
      <div class="contact-item-text">${displayHTML}</div>
      ${type !== 'link' ? `<button class="btn-copy" data-copy="${value}"><i class="fas fa-copy"></i> Copy</button>` : ''}
    `;

    container.appendChild(row);
  });

  // Copy button logic
  container.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        showToast('Could not copy — please copy manually.', 'error');
      });
    });
  });
}

/* ════════════════════════════════════════
   CREATE POST FORM
════════════════════════════════════════ */
function initCreateForm() {
  const form       = document.getElementById('createForm');
  const typeSelect = document.getElementById('postType');
  const titleInput = document.getElementById('postTitle');
  const descInput  = document.getElementById('postDesc');
  const imgInput   = document.getElementById('postImages');

  // Show/hide conditional fields based on type
  typeSelect.addEventListener('change', () => {
    const v = typeSelect.value;
    toggleField('field-price',        v === 'Selling');
    toggleField('field-availability', v === 'Services' || v === 'Business Ad');
  });

  // Char counters
  titleInput.addEventListener('input', () => {
    document.getElementById('titleCount').textContent = `${titleInput.value.length} / 80`;
  });
  descInput.addEventListener('input', () => {
    document.getElementById('descCount').textContent = `${descInput.value.length} / 600`;
  });

  // Image previews (max 3)
  imgInput.addEventListener('change', () => {
    const files = Array.from(imgInput.files).slice(0, 3);
    selectedImages = [];
    const previewContainer = document.getElementById('imagePreviews');
    previewContainer.innerHTML = '';

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) { showToast(`"${file.name}" is too large (max 5MB).`, 'error'); return; }

      const url = URL.createObjectURL(file);
      selectedImages.push({ file, url });

      const wrap = document.createElement('div');
      wrap.className = 'preview-wrap';
      wrap.innerHTML = `
        <img src="${url}" alt="Preview">
        <button type="button" class="preview-remove" data-url="${url}"><i class="fas fa-times"></i></button>
      `;
      wrap.querySelector('.preview-remove').addEventListener('click', () => {
        selectedImages = selectedImages.filter(i => i.url !== url);
        URL.revokeObjectURL(url);
        wrap.remove();
      });
      previewContainer.appendChild(wrap);
    });

    // Reset so same file can be re-selected
    imgInput.value = '';
  });

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateCreateForm()) return;
    submitPost();
  });
}

function toggleField(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('visible', show);
  if (!show) {
    const input = el.querySelector('input');
    if (input) input.value = '';
  }
}

function validateCreateForm() {
  let valid = true;

  const clearErr = id => { document.getElementById(id).textContent = ''; };
  const setErr   = (id, msg) => { document.getElementById(id).textContent = msg; valid = false; };

  clearErr('err-postType');
  clearErr('err-postTitle');
  clearErr('err-postDesc');
  clearErr('err-contact');

  const type  = document.getElementById('postType').value;
  const title = document.getElementById('postTitle').value.trim();
  const desc  = document.getElementById('postDesc').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const name  = document.getElementById('contactName').value.trim();
  const link  = document.getElementById('contactLink').value.trim();

  if (!type)  setErr('err-postType',  'Please select a post type.');
  if (!title) setErr('err-postTitle', 'Please enter a title.');
  else if (title.length < 5) setErr('err-postTitle', 'Title is too short (min 5 chars).');

  if (!desc)  setErr('err-postDesc',  'Please enter a description.');
  else if (desc.length < 10) setErr('err-postDesc', 'Description is too short (min 10 chars).');

  if (!phone && !email && !name && !link) {
    setErr('err-contact', 'Please provide at least one contact detail.');
  }

  return valid;
}

async function submitPost() {
  const newPost = {
    type:        document.getElementById('postType').value,
    title:       document.getElementById('postTitle').value.trim(),
    description: document.getElementById('postDesc').value.trim(),
    author:      document.getElementById('contactName').value.trim() || 'Village Resident',
    contactName: document.getElementById('contactName').value.trim(),
    contactPhone: document.getElementById('contactPhone').value.trim(),
    contactEmail: document.getElementById('contactEmail').value.trim(),
    contactLink: document.getElementById('contactLink').value.trim(),
    price:       document.getElementById('postPrice').value.trim() || null,
    availability:document.getElementById('postAvailability').value.trim() || null,
    image:       selectedImages.length ? selectedImages[0].url : null
  };

  try {
    const res = await fetch('/api/advertisements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    });
    const json = await res.json();
    if (json.success) {
      closeModal('createModal');
      resetCreateForm();
      showToast('Your post has been submitted for review!', 'success');
      // Don't add to local feed yet - it needs approval
    } else {
      showToast('Failed to submit post: ' + (json.error || 'Unknown error'), 'error');
    }
  } catch (err) {
    console.error('Error submitting post:', err);
    showToast('Error submitting post', 'error');
  }
}

function resetCreateForm() {
  document.getElementById('createForm').reset();
  document.getElementById('imagePreviews').innerHTML = '';
  document.getElementById('titleCount').textContent = '0 / 80';
  document.getElementById('descCount').textContent  = '0 / 600';
  selectedImages = [];
  ['field-price', 'field-availability'].forEach(id => {
    document.getElementById(id).classList.remove('visible');
  });
  ['err-postType', 'err-postTitle', 'err-postDesc', 'err-contact'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

/* ════════════════════════════════════════
   MODAL MANAGEMENT
════════════════════════════════════════ */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  // Only restore scroll if no other modal is open
  if (!document.querySelector('.modal-overlay.open')) {
    document.body.style.overflow = '';
  }
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };

  toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${msg}`;
  toast.className = `toast toast-${type} visible`;

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3500);
}

/* ════════════════════════════════════════
   UTILITIES
════════════════════════════════════════ */
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // ── Nav dropdown support (mobile / touch) ──
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('dropdown-open');
      dropdowns.forEach(d => d.classList.remove('dropdown-open'));
      if (!isOpen) dropdown.classList.add('dropdown-open');
    });
  });
  document.addEventListener('click', e => {
    dropdowns.forEach(d => {
      if (!d.contains(e.target)) d.classList.remove('dropdown-open');
    });
  });

  // Initial render - load from API
  loadPosts();

  // Filter tabs
  document.getElementById('filterTabs').addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('.filter-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    activeFilter = tab.dataset.filter;
    renderFeed();
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    searchClear.classList.toggle('visible', searchQuery.length > 0);
    renderFeed();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    renderFeed();
  });

  // Open create modal
  ['openCreateModal', 'openCreateFromEmpty'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      resetCreateForm();
      openModal('createModal');
    });
  });

  // Close create modal
  ['closeCreateModal', 'cancelCreate'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => closeModal('createModal'));
  });

  // Close detail modal
  document.getElementById('closeDetailModal')?.addEventListener('click', () => closeModal('detailModal'));

  // Detail → report button
  document.getElementById('detailReportBtn')?.addEventListener('click', () => {
    closeModal('detailModal');
    openModal('reportModal');
  });

  // Show/hide contact toggle
  document.getElementById('toggleContactBtn')?.addEventListener('click', () => {
    const body = document.getElementById('contactBody');
    const btn  = document.getElementById('toggleContactBtn');
    const isVisible = body.classList.toggle('visible');
    btn.innerHTML = isVisible
      ? '<i class="fas fa-eye-slash"></i> Hide Contact'
      : '<i class="fas fa-eye"></i> Show Contact';
  });

  // Report modal
  ['closeReportModal', 'cancelReport'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => closeModal('reportModal'));
  });
  document.getElementById('submitReport')?.addEventListener('click', () => {
    const reason = document.getElementById('reportReason').value;
    const errEl  = document.getElementById('err-reportReason');
    if (!reason) {
      errEl.textContent = 'Please select a reason.';
      return;
    }
    errEl.textContent = '';
    closeModal('reportModal');
    showToast('Report submitted. Thank you.', 'info');
    document.getElementById('reportReason').value = '';
    document.getElementById('reportDetails').value = '';
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Close modals on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal-overlay.open');
      if (open) closeModal(open.id);
    }
  });

  // Init create form interactions
  initCreateForm();
});