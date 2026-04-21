/* ═══════════════════════════════════════════════════════════
   USAP TAYO PARA SA HOA — forums.js
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // ─────────────────────────────────────────
  // SAMPLE DATA
  // ─────────────────────────────────────────
  const POSTS = [
    {
      id: 1,
      title: 'Kailan mag-aayos ng street lights sa Block 7?',
      category: 'Concerns',
      status: 'Under Review',
      desc: 'Mayroon kaming tatlong street lights na patay na sa Block 7, lalo na yung malapit sa kanto ng Mahogany at Acacia Street. Delikado po ito sa gabi, lalo na para sa mga nagpapalakad at nagbibike. Sana maaksyunan na po ito ng HOA.',
      author: 'Maria Santos',
      date: 'Mar 10, 2026',
      helpful: 8,
      replies: [
        { name: 'HOA Admin',   isStaff: true,  date: 'Mar 11, 2026', text: 'Salamat sa inyong concern, Mrs. Santos. Naka-iskedyul na po ang maintenance team para sa Martes. Mababalik na ang ilaw sa loob ng 2-3 araw.' },
        { name: 'Pedro Reyes', isStaff: false, date: 'Mar 11, 2026', text: 'Pareho po kaming apektado dito. Maganda na may tugon agad ang HOA!' }
      ],
      image: null,
      location: 'Block 7, Mahogany & Acacia St.'
    },
    {
      id: 2,
      title: 'Maaari bang dagdagan ang oras ng pool sa weekend?',
      category: 'Suggestions',
      status: 'Answered',
      desc: 'Maraming residente ang nagtatrabaho sa weekdays kaya hindi namin magagamit ang pool. Maganda sana kung papalawain ang oras hanggang 8pm tuwing Sabado at Linggo. Maraming pamilya ang makikinabang dito, lalo na ang mga bata.',
      author: 'Carlo Mendoza',
      date: 'Mar 8, 2026',
      helpful: 15,
      replies: [
        { name: 'HOA Board',    isStaff: true,  date: 'Mar 9, 2026', text: 'Napag-usapan na po ito sa aming huling pulong. Simula Abril, magiging 7am–7pm ang pool hours tuwing Sabado at Linggo. Salamat sa mungkahi!' },
        { name: 'Liza Cruz',    isStaff: false, date: 'Mar 9, 2026', text: 'Ang galing! Salamat sa pakikinig ng HOA sa ating mga mungkahi.' },
        { name: 'Carlo Mendoza',isStaff: false, date: 'Mar 9, 2026', text: 'Maraming salamat sa mabilis na tugon at aksyon!' }
      ],
      image: null,
      location: 'Clubhouse Area'
    },
    {
      id: 3,
      title: 'May nagtitinda ba ng Tupperware o Avon dito sa subdivision?',
      category: 'Community Help',
      status: 'Open',
      desc: "Naghahanap ako ng residente na nagbebenta ng Tupperware o Avon products dito sa loob ng subdivision. Mas gusto ko sana kung may kakilala tayo na residente para suportahan ang isa't isa. Kung mayroon, paki-message po sa akin.",
      author: 'Nena Villanueva',
      date: 'Mar 7, 2026',
      helpful: 3,
      replies: [
        { name: 'Joy Aquino', isStaff: false, date: 'Mar 7, 2026', text: 'Hi Nena! Nagbe-benta ako ng Avon. Block 5 po ako, pwede tayong mag-usap! 😊' }
      ],
      image: null,
      location: null
    },
    {
      id: 4,
      title: 'Paano mag-register para sa amenity reservation online?',
      category: 'Questions',
      status: 'Resolved',
      desc: 'Baguhan pa lang po ako dito sa LBA4. Hindi ko pa alam kung paano mag-reserve ng basketball court at function hall online. May step-by-step guide ba? Naghahanap na rin ako sa website pero hindi ko mahanap ang exact na form.',
      author: 'Rodel Flores',
      date: 'Mar 5, 2026',
      helpful: 11,
      replies: [
        { name: 'HOA Secretary', isStaff: true,  date: 'Mar 5, 2026', text: 'Welcome po sa LBA4, Mr. Flores! Pumunta po kayo sa reserve.html sa aming website. Mag-log in, piliin ang amenity, at piliin ang petsa. May form na lalabas para sa confirmation. Kung may problema pa, bisitahin kami sa office sa Lunes–Biyernes, 8am–5pm.' },
        { name: 'Rodel Flores',  isStaff: false, date: 'Mar 6, 2026', text: 'Nahanap ko na po! Salamat sa mabilis na tulong, HOA Secretary!' }
      ],
      image: null,
      location: null
    },
    {
      id: 5,
      title: 'Mungkahi: Magdagdag ng bike lane sa loob ng subdivision',
      category: 'Suggestions',
      status: 'Under Review',
      desc: 'Marami na po kaming mga residente na gumagamit ng bisikleta para sa aming pang-araw-araw na buhay. Dahil dito, mahalagang may dedicated na bike lane tayo para sa kaligtasan ng lahat — lalo na ng mga bata. Mungkahi ko ang isang one-way bike lane sa pangunahing daan ng Phase 3.',
      author: 'Ben Aguilar',
      date: 'Mar 3, 2026',
      helpful: 22,
      replies: [
        { name: 'Ana Torres', isStaff: false, date: 'Mar 4, 2026', text: 'Sang-ayon ako dito! Delikado nga talaga sa ngayon, walang clear na landas para sa mga nagbibike.' },
        { name: 'HOA Admin',  isStaff: true,  date: 'Mar 4, 2026', text: 'Napansin namin ang inyong mungkahi. Isasali namin ito sa agenda ng susunod na board meeting sa Marso 20. Abangan ang anunsyo.' }
      ],
      image: null,
      location: 'Phase 3 Main Road'
    },
    {
      id: 6,
      title: 'Sino ang nagmamay-ari ng asong walang tali sa Gate 3?',
      category: 'Concerns',
      status: 'Open',
      desc: 'Paulit-ulit na may mabangis na aso na walang tali sa bandang Gate 3, lalo na sa umaga. Noong Martes ay muntik na niyang kagatin ang aking anak. Pakiusap po sa may-ari na itali o ikulong ang aso. Kung walang makapag-claim, sana maaksyunan ng HOA.',
      author: 'Grace Lim',
      date: 'Mar 2, 2026',
      helpful: 5,
      replies: [],
      image: null,
      location: 'Near Gate 3'
    }
  ];

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

    POSTS.unshift({
      id: POSTS.length + 1, title, category: cat, status: 'Open', desc,
      author: 'You', date: todayStr(), helpful: 0, replies: [], image: img, location: loc || null
    });
    closeCreate();
    renderPosts();
    renderStats();
    showToast('Your discussion has been posted successfully!');
  });

  replySubmitBtn.addEventListener('click', () => {
    const text = replyInput.value.trim();
    if (!text) return;
    const p = POSTS.find(x => x.id === currentPostId);
    if (!p) return;
    p.replies.push({ name: 'You', isStaff: false, date: todayStr(), text });
    renderReplies(p);
    replyInput.value = '';
    renderStats();
    showToast('Reply posted!');
  });

  // ─────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────
  if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
  renderPosts();
  renderStats();
});