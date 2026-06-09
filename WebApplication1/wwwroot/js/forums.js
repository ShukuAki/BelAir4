/* ═══════════════════════════════════════════════════════════
   USAP TAYO PARA SA HOA — forums.js
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // ─────────────────────────────────────────
  // POSTS (will be fetched from server). If fetch fails, fallback to embedded sample.
  // ─────────────────────────────────────────
  let POSTS = [];

  

  // Track voted and reported posts
  const votedPosts      = new Set();
  const reportedPosts   = new Set();   // stores post id
  const reportedReplies = new Set();   // stores "postId-replyIndex"
  let reportTargetId    = null;        // post id being reported
  let reportTargetReply = null;        // "postId-replyIndex" being reported, or null

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  let activeCategory = 'All';
  let activeStatus   = '';
  let activeSort     = 'newest';
  let searchQuery    = '';
  let currentPostId  = null;
  let forumBlocked   = false;   // true when current user is banned/timed-out
  let forumBlockMsg  = '';

  // ─────────────────────────────────────────
  // DOM REFERENCES
  // ─────────────────────────────────────────
  const postsGrid       = document.getElementById('postsGrid');
  const emptyState      = document.getElementById('emptyState');
  const resultCount     = document.getElementById('resultCount');
  const searchInput     = document.getElementById('searchInput');
  const statusFilter    = document.getElementById('statusFilter');
  const sortFilter      = document.getElementById('sortFilter');
  const chips           = document.querySelectorAll('.chip');

  const detailOverlay      = document.getElementById('detailOverlay');
  const closeDetailBtn     = document.getElementById('closeDetailBtn');
  const detailHelpfulBtn   = document.getElementById('detailHelpfulBtn');
  const detailHelpfulCount = document.getElementById('detailHelpfulCount');

  const createOverlay   = document.getElementById('createOverlay');
  const openCreateBtn   = document.getElementById('openCreateBtn');
  const closeCreateBtn  = document.getElementById('closeCreateBtn');
  const cancelCreateBtn = document.getElementById('cancelCreateBtn');
  const submitPostBtn   = document.getElementById('submitPostBtn');

  const reportOverlay    = document.getElementById('reportOverlay');
  const closeReportBtn   = document.getElementById('closeReportBtn');
  const cancelReportBtn  = document.getElementById('cancelReportBtn');
  const submitReportBtn  = document.getElementById('submitReportBtn');
  const reportNote       = document.getElementById('reportNote');

  const uploadArea    = document.getElementById('uploadArea');
  const fileInput     = document.getElementById('fileInput');
  const uploadPreview = document.getElementById('uploadPreview');
  const previewImg    = document.getElementById('previewImg');
  const removeImgBtn  = document.getElementById('removeImg');

  const replySubmitBtn = document.getElementById('replySubmitBtn');
  const replyInput     = document.getElementById('replyInput');

  const toast      = document.getElementById('toast');
  const toastMsg   = document.getElementById('toastMsg');
  const currentYearEl = document.getElementById('current-year');

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────
  function catClass(cat) {
    return { Questions: 'question', Concerns: 'concern', Suggestions: 'suggest', 'Community Help': 'help' }[cat] || 'question';
  }
  function catIcon(cat) {
    return { Questions: 'fa-question-circle', Concerns: 'fa-exclamation-circle', Suggestions: 'fa-lightbulb', 'Community Help': 'fa-hands-helping' }[cat] || 'fa-tag';
  }
  function statusClass(s) {
    return { Answered: 'answered', 'Under Review': 'review', Resolved: 'resolved', Open: 'open' }[s] || 'open';
  }
  function statusIcon(s) {
    return { Answered: 'fa-check-circle', 'Under Review': 'fa-clock', Resolved: 'fa-check-double', Open: 'fa-circle' }[s] || 'fa-circle';
  }
  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
  function avatarBg(name) {
    const colors = ['#0a4d3c','#065f46','#0e6650','#138a6a','#2563eb','#7e22ce','#c2410c'];
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
    return colors[Math.abs(h) % colors.length];
  }
  function todayStr() {
    const now    = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
  function isUnanswered(p) {
    return p.status === 'Open' && p.replies.length === 0;
  }
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─────────────────────────────────────────
  // FILTERING & SORTING
  // ─────────────────────────────────────────
  function getFiltered() {
    let list = [...POSTS];
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (activeStatus)             list = list.filter(p => p.status === activeStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)  ||
        p.author.toLowerCase().includes(q)
      );
    }
    if      (activeSort === 'newest')  list.sort((a, b) => b.id - a.id);
    else if (activeSort === 'oldest')  list.sort((a, b) => a.id - b.id);
    else if (activeSort === 'active')  list.sort((a, b) => b.replies.length - a.replies.length);
    else if (activeSort === 'helpful') list.sort((a, b) => b.helpful - a.helpful);
    return list;
  }

  // ─────────────────────────────────────────
  // RENDER POSTS
  // ─────────────────────────────────────────
  function renderPosts() {
    const list = getFiltered();
    resultCount.textContent = list.length;

    if (!list.length) {
      postsGrid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    postsGrid.innerHTML = list.map(p => `
      <article
        class="post-card"
        data-cat="${p.category}"
        data-id="${p.id}"
        role="button" tabindex="0"
        aria-label="Open discussion: ${p.title}"
      >
        <div class="card-top">
          <div class="card-badges">
            <span class="status-badge status-${statusClass(p.status)}">
              <i class="fas ${statusIcon(p.status)}"></i> ${p.status}
            </span>
            <span class="cat-tag cat-tag-${catClass(p.category)}">
              <i class="fas ${catIcon(p.category)}"></i> ${p.category}
            </span>
          </div>
        </div>

        <h3 class="card-title">${escapeHtml(p.title)}</h3>
        <p class="card-preview">${escapeHtml(p.desc)}</p>

        ${p.location ? `<div class="card-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(p.location)}</div>` : ''}

        <div class="card-footer">
          <div class="card-author">
            <div class="avatar-sm" style="background:${avatarBg(p.author)}">${initials(p.author)}</div>
            <div>
              <div class="card-author-name">${escapeHtml(p.author)}</div>
              <div class="card-date">${p.date}</div>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="card-action-btn btn-helpful-card ${votedPosts.has(p.id) ? 'active' : ''}"
              data-id="${p.id}"
              aria-label="Mark as helpful"
            >
              <i class="fas fa-thumbs-up"></i> ${p.helpful}
            </button>
            <button
              class="card-action-btn btn-replies-card"
              data-id="${p.id}"
              aria-label="View replies"
            >
              <i class="fas fa-comment-alt"></i> ${p.replies.length}
            </button>
            <button
              class="btn-report-card ${reportedPosts.has(p.id) ? 'reported' : ''}"
              data-id="${p.id}"
              aria-label="${reportedPosts.has(p.id) ? 'Already reported' : 'Report this discussion'}"
              title="${reportedPosts.has(p.id) ? 'Already reported' : 'Report this discussion'}"
            >
              <i class="fas fa-flag"></i> ${reportedPosts.has(p.id) ? 'Reported' : 'Report'}
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Card click → open detail
    postsGrid.querySelectorAll('.post-card').forEach(card => {
      const openFn = () => openDetail(+card.dataset.id);
      card.addEventListener('click', e => {
        if (e.target.closest('.card-action-btn') || e.target.closest('.btn-report-card')) return;
        openFn();
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFn(); }
      });
    });

    // Helpful button
    postsGrid.querySelectorAll('.btn-helpful-card').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = +btn.dataset.id;
        const p  = POSTS.find(x => x.id === id);
        if (!p) return;
        if (votedPosts.has(id)) {
          votedPosts.delete(id);
          p.helpful = Math.max(0, p.helpful - 1);
        } else {
          votedPosts.add(id);
          p.helpful += 1;
        }
        renderPosts();
      });
    });

    // Replies button
    postsGrid.querySelectorAll('.btn-replies-card').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDetail(+btn.dataset.id);
      });
    });

    // Report button
    postsGrid.querySelectorAll('.btn-report-card').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = +btn.dataset.id;
        if (reportedPosts.has(id)) return;
        openReport(id);
      });
    });
  }

  // ─────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────
  function renderStats() {
    const totalReplies = POSTS.reduce((s, p) => s + p.replies.length, 0);
    const resolved     = POSTS.filter(p => p.status === 'Resolved' || p.status === 'Answered').length;
    const unanswered   = POSTS.filter(isUnanswered).length;
    animateNum('stat-posts',      POSTS.length);
    animateNum('stat-replies',    totalReplies);
    animateNum('stat-resolved',   resolved);
    animateNum('stat-unanswered', unanswered);
  }

  function animateNum(id, target) {
    const el  = document.getElementById(id);
    if (!el) return;
    let cur   = 0;
    const step = Math.ceil(target / 24) || 1;
    const t   = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(t);
    }, 50);
  }

  // ─────────────────────────────────────────
  // DETAIL MODAL
  // ─────────────────────────────────────────
  function openDetail(id) {
    const p = POSTS.find(x => x.id === id);
    if (!p) return;
    currentPostId = id;

    document.getElementById('detailMeta').innerHTML = `
      <span class="status-badge status-${statusClass(p.status)}">
        <i class="fas ${statusIcon(p.status)}"></i> ${p.status}
      </span>
      <span class="cat-tag cat-tag-${catClass(p.category)}">
        <i class="fas ${catIcon(p.category)}"></i> ${p.category}
      </span>
    `;

    document.getElementById('detailTitle').textContent = p.title;
    document.getElementById('detailInfo').innerHTML = `
      <span><i class="fas fa-user-circle"></i> ${escapeHtml(p.author)}</span>
      <span><i class="fas fa-calendar"></i> ${p.date}</span>
      <span><i class="fas fa-comment-alt"></i> ${p.replies.length} ${p.replies.length === 1 ? 'reply' : 'replies'}</span>
      <span><i class="fas fa-thumbs-up"></i> ${p.helpful} helpful</span>
    `;

    const img = document.getElementById('detailImg');
    if (p.image) { img.src = p.image; img.style.display = 'block'; }
    else img.style.display = 'none';

    const locEl   = document.getElementById('detailLocation');
    const locText = document.getElementById('detailLocationText');
    if (p.location) { locText.textContent = p.location; locEl.style.display = 'inline-flex'; }
    else locEl.style.display = 'none';

    document.getElementById('detailDesc').textContent = p.desc;

    detailHelpfulCount.textContent = p.helpful;
    detailHelpfulBtn.classList.toggle('voted', votedPosts.has(id));

    renderReplies(p);
    replyInput.value = '';

    detailOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function renderReplies(p) {
    const thread = document.getElementById('replyThread');
    document.getElementById('replyCountBadge').textContent = p.replies.length;

    if (!p.replies.length) {
      thread.innerHTML = '<p style="color:#9ca3af;font-size:13px;text-align:center;padding:16px 0">No replies yet. Be the first to respond!</p>';
      return;
    }
    thread.innerHTML = p.replies.map((r, idx) => {
      const replyKey    = `${p.id}-${idx}`;
      const isReported  = reportedReplies.has(replyKey);
      return `
      <div class="reply-item ${r.isStaff ? 'staff-reply' : ''}">
        <div class="reply-avatar ${r.isStaff ? 'staff-avatar' : ''}"
             style="${!r.isStaff ? `background:${avatarBg(r.name)}` : ''}">
          ${initials(r.name)}
        </div>
        <div class="reply-content">
          <div class="reply-header">
            <span class="reply-name">${escapeHtml(r.name)}</span>
            ${r.isStaff ? '<span class="staff-badge"><i class="fas fa-shield-alt"></i> HOA Staff</span>' : ''}
            <span class="reply-date">${r.date}</span>
            <button
              class="btn-report-reply ${isReported ? 'reported' : ''}"
              data-reply-key="${replyKey}"
              title="${isReported ? 'Already reported' : 'Report this reply'}"
              ${isReported ? 'disabled' : ''}
            >
              <i class="fas fa-flag"></i>${isReported ? ' Reported' : ''}
            </button>
          </div>
          <p class="reply-text">${escapeHtml(r.text)}</p>
        </div>
      </div>`;
    }).join('');

    // Attach report listeners to reply buttons
    thread.querySelectorAll('.btn-report-reply:not(.reported)').forEach(btn => {
      btn.addEventListener('click', () => openReport(null, btn.dataset.replyKey));
    });
  }

  function closeDetail() {
    detailOverlay.classList.remove('open');
    document.body.style.overflow = '';
    currentPostId = null;
  }

  detailHelpfulBtn.addEventListener('click', () => {
    const p = POSTS.find(x => x.id === currentPostId);
    if (!p) return;
    if (votedPosts.has(p.id)) {
      votedPosts.delete(p.id);
      p.helpful = Math.max(0, p.helpful - 1);
      detailHelpfulBtn.classList.remove('voted');
    } else {
      votedPosts.add(p.id);
      p.helpful += 1;
      detailHelpfulBtn.classList.add('voted');
      showToast('Marked as helpful!');
    }
    detailHelpfulCount.textContent = p.helpful;
    const infoEl = document.getElementById('detailInfo');
    if (infoEl) {
      infoEl.querySelectorAll('span').forEach(s => {
        if (s.innerHTML.includes('fa-thumbs-up'))
          s.innerHTML = `<i class="fas fa-thumbs-up"></i> ${p.helpful} helpful`;
      });
    }
  });

  // ─────────────────────────────────────────
  // CREATE MODAL
  // ─────────────────────────────────────────
  function openCreate() {
    if (forumBlocked) { showToast(forumBlockMsg || 'You are restricted from posting in the forums.'); return; }
    createOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCreate() {
    createOverlay.classList.remove('open');
    document.body.style.overflow = '';
    resetCreateForm();
  }
  function resetCreateForm() {
    document.getElementById('formTitle').value    = '';
    document.getElementById('formCategory').value = '';
    document.getElementById('formLocation').value = '';
    document.getElementById('formDesc').value     = '';
    previewImg.src              = '';
    uploadPreview.style.display = 'none';
    uploadArea.style.display    = '';
    fileInput.value             = '';
  }

  // ─────────────────────────────────────────
  // REPORT MODAL
  // ─────────────────────────────────────────
  function openReport(postId, replyKey = null) {
    reportTargetId    = postId;
    reportTargetReply = replyKey;
    document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false);
    reportNote.value = '';
    submitReportBtn.disabled = true;
    reportOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeReport() {
    reportOverlay.classList.remove('open');
    document.body.style.overflow = '';
    reportTargetId    = null;
    reportTargetReply = null;
  }

  // Enable submit only when a reason is chosen
  document.querySelectorAll('input[name="reportReason"]').forEach(radio => {
    radio.addEventListener('change', () => {
      submitReportBtn.disabled = false;
    });
  });

  submitReportBtn.addEventListener('click', () => {
    if (reportTargetReply) {
      reportedReplies.add(reportTargetReply);
      // Re-render replies so the button flips to "Reported"
      const [postId] = reportTargetReply.split('-');
      const p = POSTS.find(x => x.id === +postId);
      if (p) renderReplies(p);
    } else if (reportTargetId) {
      reportedPosts.add(reportTargetId);
      renderPosts();
    }
    closeReport();
    showToast('Report submitted. Thank you for keeping the community safe!');
  });

  closeReportBtn.addEventListener('click',  closeReport);
  cancelReportBtn.addEventListener('click', closeReport);
  reportOverlay.addEventListener('click', e => { if (e.target === reportOverlay) closeReport(); });

  // ─────────────────────────────────────────
  // IMAGE UPLOAD
  // ─────────────────────────────────────────
  function handleFile(file) {
    const reader  = new FileReader();
    reader.onload = e => {
      previewImg.src              = e.target.result;
      uploadPreview.style.display = 'block';
      uploadArea.style.display    = 'none';
    };
    reader.readAsDataURL(file);
  }

  // ─────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat;
      renderPosts();
    });
  });

  searchInput.addEventListener('input',   () => { searchQuery  = searchInput.value.trim(); renderPosts(); });
  statusFilter.addEventListener('change', () => { activeStatus = statusFilter.value;       renderPosts(); });
  sortFilter.addEventListener('change',   () => { activeSort   = sortFilter.value;          renderPosts(); });

  openCreateBtn.addEventListener('click',   openCreate);
  closeCreateBtn.addEventListener('click',  closeCreate);
  cancelCreateBtn.addEventListener('click', closeCreate);
  closeDetailBtn.addEventListener('click',  closeDetail);

  detailOverlay.addEventListener('click', e => { if (e.target === detailOverlay) closeDetail(); });
  createOverlay.addEventListener('click', e => { if (e.target === createOverlay) closeCreate(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDetail(); closeCreate(); closeReport(); }
  });

  uploadArea.addEventListener('click',    () => fileInput.click());
  uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.style.borderColor = '#0a4d3c'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
  removeImgBtn.addEventListener('click', () => {
    previewImg.src = ''; uploadPreview.style.display = 'none';
    uploadArea.style.display = ''; fileInput.value = '';
  });

  submitPostBtn.addEventListener('click', () => {
    const title = document.getElementById('formTitle').value.trim();
    const cat   = document.getElementById('formCategory').value;
    const desc  = document.getElementById('formDesc').value.trim();
    if (!title || !cat || !desc) { showToast('Please fill in all required fields.'); return; }

    const loc = document.getElementById('formLocation').value.trim();
    const img = (previewImg.src && previewImg.src !== window.location.href) ? previewImg.src : null;

    (async () => {
      try {
        const res = await fetch('/api/forums/posts', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category: cat, status: 'Open', description: desc, author: 'You', date: todayStr(), helpful: 0, image: img, location: loc || null })
        });
        if (res.status === 403) {
          let msg = 'You are restricted from posting in the forums.';
          try { const j = await res.json(); if (j.error) msg = j.error; } catch (_) {}
          forumBlocked = true; forumBlockMsg = msg;
          renderForumNotice(); applyBlockToControls();
          closeCreate();
          showToast(msg);
          return;
        }
        if (!res.ok) {
          const text = await res.text();
          console.error('Create post failed:', res.status, text);
          showToast('Failed to post discussion.');
          return;
        }
        const created = await res.json();
        // prepend created post and re-render
        POSTS.unshift({
          id: created.id,
          title: created.title,
          category: created.category,
          status: created.status,
          desc: created.description,
          author: created.author,
          date: created.date,
          helpful: created.helpful,
          replies: created.replies || [],
          image: created.image,
          location: created.location
        });
        closeCreate();
        renderPosts();
        renderStats();
        showToast('Your discussion has been posted successfully!');
      } catch (err) {
        console.error('Create post exception', err);
        showToast('Failed to post discussion.');
      }
    })();
  });

  replySubmitBtn.addEventListener('click', () => {
    const text = replyInput.value.trim();
    if (!text) return;
    const p = POSTS.find(x => x.id === currentPostId);
    if (!p) return;

    // Post reply to server
    fetch(`/api/forums/posts/${currentPostId}/replies`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'You', isStaff: false, date: todayStr(), text })
    }).then(async r => {
      if (r.status === 403) {
        let msg = 'You are restricted from replying in the forums.';
        try { const j = await r.json(); if (j.error) msg = j.error; } catch (_) {}
        forumBlocked = true; forumBlockMsg = msg;
        renderForumNotice(); applyBlockToControls();
        showToast(msg);
        throw new Error('blocked');
      }
      if (!r.ok) throw new Error('Failed');
      // append locally
      p.replies.push({ name: 'You', isStaff: false, date: todayStr(), text });
      renderReplies(p);
      replyInput.value = '';
      renderStats();
      showToast('Reply posted!');
    }).catch(err => {
      if (err && err.message === 'blocked') return;
      showToast('Failed to post reply.');
    });
  });

  // ─────────────────────────────────────────
  // FORUM STANDING (ban / timeout notice)
  // ─────────────────────────────────────────
  function renderForumNotice() {
    let banner = document.getElementById('forumNoticeBanner');
    if (!forumBlocked) { if (banner) banner.remove(); return; }

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'forumNoticeBanner';
      banner.style.cssText = 'max-width:1100px;margin:16px auto;padding:14px 18px;border-radius:10px;background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500';
      const anchor = postsGrid?.parentElement || document.querySelector('main') || document.body;
      anchor.insertBefore(banner, anchor.firstChild);
    }
    banner.innerHTML = `<i class="fas fa-ban" style="font-size:20px"></i><span>${escapeHtml(forumBlockMsg || 'You are currently restricted from posting in the forums.')}</span>`;
  }

  function applyBlockToControls() {
    if (openCreateBtn) {
      openCreateBtn.disabled = forumBlocked;
      openCreateBtn.title = forumBlocked ? (forumBlockMsg || 'You are restricted from posting') : '';
      openCreateBtn.style.opacity = forumBlocked ? '0.5' : '';
      openCreateBtn.style.cursor = forumBlocked ? 'not-allowed' : '';
    }
    if (replySubmitBtn) {
      replySubmitBtn.disabled = forumBlocked;
      replySubmitBtn.style.opacity = forumBlocked ? '0.5' : '';
    }
    if (replyInput) {
      replyInput.disabled = forumBlocked;
      if (forumBlocked) replyInput.placeholder = forumBlockMsg || 'You are restricted from replying.';
    }
  }

  async function checkForumStatus() {
    try {
      const res = await fetch('/api/forums/my-status', { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = await res.json();
      forumBlocked = !!data.blocked;
      forumBlockMsg = data.message || '';
    } catch (e) {
      forumBlocked = false;
      forumBlockMsg = '';
    }
    renderForumNotice();
    applyBlockToControls();
  }

  // ─────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────
  async function loadPosts() {
    try {
      const res = await fetch('/api/forums/posts', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Network');
      const data = await res.json();
      // adapt server shape to client expected fields
      POSTS = data.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        status: p.status,
        desc: p.description,
        author: p.author,
        date: p.date,
        helpful: p.helpful,
        replies: (p.replies || []).map(r => ({ name: r.name, isStaff: r.isStaff, date: r.date, text: r.text })),
        image: p.image,
        location: p.location
      }));
    } catch (e) {
      // If server fetch fails, show empty list and log.
      POSTS = [];
      console.warn('Could not load posts from server.', e);
    }
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
    renderPosts();
    renderStats();
    checkForumStatus();
  }

  loadPosts();
});