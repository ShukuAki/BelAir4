/**
 * ============================================================
 *  lba4-storage.js  —  Laguna BelAir 4  |  localStorage Bridge
 *  Version: 1.0
 *
 *  PURPOSE:
 *    Acts as a temporary data layer that mimics a REST API.
 *    All reads/writes go through this module so that when the
 *    real Node.js + MySQL backend is ready, only THIS file
 *    needs to change — member pages and dashboards stay the same.
 *
 *  FUTURE BACKEND REPLACEMENT:
 *    Every method is annotated with the API endpoint it should
 *    eventually call.  Replace the localStorage logic inside each
 *    method with a fetch() / axios call to that endpoint.
 *
 *  STORAGE KEYS  (one key per module = one table in MySQL)
 *    lba4_incidents      → incidents table
 *    lba4_reservations   → reservations table
 *    lba4_residents      → users / residents table
 *    lba4_announcements  → announcements table
 *    lba4_ads            → advertisements table
 *    lba4_forums         → forum_posts table
 *    lba4_subscribers    → subscribers table
 *    lba4_keywords       → keyword_bank table
 *
 *  RECORD ID FORMAT:
 *    Each record gets a unique id: `${PREFIX}-${timestamp}-${random}`
 *    e.g.  INC-1708234567890-4f2a
 *    This mirrors how MySQL auto_increment + a prefix column would work.
 * ============================================================
 */

const LBA4Storage = (() => {

  /* ── helpers ── */
  const PREFIX = {
    incidents:     'INC',
    reservations:  'RSV',
    residents:     'USR',
    announcements: 'ANN',
    ads:           'AD',
    forums:        'FRM',
    subscribers:   'SUB',
    keywords:      'KW'
  };

  /** Generate a human-readable unique ID  */
  function genId(module) {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${PREFIX[module] || 'REC'}-${Date.now()}-${rand}`;
  }

  /** Format a Date to a readable string  */
  function formatDate(d = new Date()) {
    return d.toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  /** Low-level read from localStorage  */
  function readAll(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  /** Low-level write to localStorage  */
  function writeAll(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch a custom event so open dashboard tabs can react
    window.dispatchEvent(new CustomEvent('lba4:update', { detail: { module: key } }));
  }

  /** Find index of record by id  */
  function findIdx(arr, id) {
    return arr.findIndex(r => r.id === id);
  }


  /* ══════════════════════════════════════════════════════════
     INCIDENTS
     Future API: POST /api/incidents   GET /api/incidents
  ══════════════════════════════════════════════════════════ */
  const incidents = {
    KEY: 'lba4_incidents',

    /**
     * Save a new incident report from the member page.
     * @param {Object} data - Form fields from report-concerns.html
     * @returns {Object} The saved record (with id, status, timestamps)
     *
     * BACKEND REPLACEMENT:
     *   return await fetch('/api/incidents', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(data)
     *   }).then(r => r.json());
     */
    submit(data) {
      const all = readAll(this.KEY);
      const record = {
        id:               genId('incidents'),
        refNumber:        `INC-${String(all.length + 1).padStart(3, '0')}`,
        // Core fields from form
        concernType:      data.concernType      || 'other',
        category:         data.category         || mapCategoryFromType(data.concernType),
        description:      data.description      || '',
        address:          data.address          || '',
        street:           data.street           || '',
        additionalLocation: data.additionalLocation || '',
        // Handle both coordinate formats: new (lat/lng separate) and legacy (coordinates object)
        latitude:         data.latitude         || (data.coordinates?.lat) || null,
        longitude:        data.longitude        || (data.coordinates?.lng) || null,
        coordinates:      data.coordinates      || (data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : null),
        locationMethod:   data.locationMethod   || 'address',
        attachments:      data.attachments      || [],
        // Reporter info
        reporterName:     data.reporterName     || 'Anonymous',
        reporterContact:  data.reporterContact  || '',
        // Auto-assigned by system
        priority:         autoPriority(data.description, data.concernType),
        status:           'open',
        mapApproved:      false,   // staff must approve before showing on heatmap
        // Staff fields (filled later by dashboard)
        assignedTo:       '',
        staffNotes:       '',
        resolvedAt:       null,
        // Timestamps
        submittedAt:      formatDate(),
        updatedAt:        formatDate(),
        // Keywords detected
        detectedKeywords: detectKeywords(data.description)
      };
      all.unshift(record);          // newest first
      writeAll(this.KEY, all);
      return record;
    },

    /** Get all incidents (staff dashboard) */
    getAll() {
      // BACKEND: return fetch('/api/incidents').then(r => r.json());
      return readAll(this.KEY);
    },

    /** Get by status filter */
    getByStatus(status) {
      return this.getAll().filter(r => r.status === status);
    },

    /** Update status / notes (staff action) */
    update(id, changes) {
      // BACKEND: return fetch(`/api/incidents/${id}`, { method:'PATCH', body:JSON.stringify(changes) }).then(r=>r.json());
      const all = readAll(this.KEY);
      const idx = findIdx(all, id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...changes, updatedAt: formatDate() };
      if (changes.status === 'resolved') all[idx].resolvedAt = formatDate();
      writeAll(this.KEY, all);
      return all[idx];
    },

    /** Delete a record */
    remove(id) {
      // BACKEND: return fetch(`/api/incidents/${id}`, { method:'DELETE' });
      const all = readAll(this.KEY).filter(r => r.id !== id);
      writeAll(this.KEY, all);
    },

    /** Stats for dashboard overview cards */
    stats() {
      const all = this.getAll();
      return {
        total:    all.length,
        open:     all.filter(r => r.status === 'open').length,
        progress: all.filter(r => r.status === 'progress').length,
        resolved: all.filter(r => r.status === 'resolved').length,
        critical: all.filter(r => r.priority === 'critical').length,
        high:     all.filter(r => r.priority === 'high').length,
        today:    all.filter(r => r.submittedAt.includes(
                    new Date().toLocaleString('en-PH',{month:'short',day:'2-digit'})
                  )).length
      };
    }
  };


  /* ══════════════════════════════════════════════════════════
     RESERVATIONS
     Future API: POST /api/reservations   GET /api/reservations
  ══════════════════════════════════════════════════════════ */
  const reservations = {
    KEY: 'lba4_reservations',

    submit(data) {
      // BACKEND: return fetch('/api/reservations', { method:'POST', body:JSON.stringify(data) }).then(r=>r.json());
      const all = readAll(this.KEY);
      const record = {
        id:           genId('reservations'),
        refNumber:    `RSV-${String(all.length + 1).padStart(3, '0')}`,
        amenity:      data.amenity      || '',
        date:         data.date         || '',
        startTime:    data.startTime    || '',
        endTime:      data.endTime      || '',
        purpose:      data.purpose      || '',
        guestCount:   data.guestCount   || 1,
        residentName: data.residentName || '',
        contactNo:    data.contactNo    || '',
        email:        data.email        || '',
        unitBlock:    data.unitBlock    || '',
        notes:        data.notes        || '',
        status:       'pending',
        submittedAt:  formatDate(),
        updatedAt:    formatDate(),
        approvedBy:   '',
        rejectedReason: ''
      };
      all.unshift(record);
      writeAll(this.KEY, all);
      return record;
    },

    getAll()           { return readAll(this.KEY); },
    getByStatus(s)     { return this.getAll().filter(r => r.status === s); },
    update(id, changes) {
      const all = readAll(this.KEY);
      const idx = findIdx(all, id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...changes, updatedAt: formatDate() };
      writeAll(this.KEY, all);
      return all[idx];
    },
    remove(id) {
      writeAll(this.KEY, readAll(this.KEY).filter(r => r.id !== id));
    },
    stats() {
      const all = this.getAll();
      return {
        total:    all.length,
        pending:  all.filter(r => r.status === 'pending').length,
        approved: all.filter(r => r.status === 'approved').length,
        rejected: all.filter(r => r.status === 'rejected').length
      };
    }
  };


  /* ══════════════════════════════════════════════════════════
     RESIDENTS (Registration / Verification)
     Future API: POST /api/register   GET /api/residents
  ══════════════════════════════════════════════════════════ */
  const residents = {
    KEY: 'lba4_residents',

    submit(data) {
      // BACKEND: return fetch('/api/register', { method:'POST', body:JSON.stringify(data) }).then(r=>r.json());
      const all = readAll(this.KEY);
      const record = {
        id:            genId('residents'),
        firstName:     data.firstName    || '',
        lastName:      data.lastName     || '',
        email:         data.email        || '',
        contactNo:     data.contactNo    || '',
        unitBlock:     data.unitBlock    || '',
        houseNo:       data.houseNo      || '',
        submittedDocs: data.submittedDocs || [],
        status:        'pending',   // pending → verified | rejected
        verifiedBy:    '',
        submittedAt:   formatDate(),
        updatedAt:     formatDate()
      };
      all.unshift(record);
      writeAll(this.KEY, all);
      return record;
    },

    getAll()           { return readAll(this.KEY); },
    getPending()       { return this.getAll().filter(r => r.status === 'pending'); },
    update(id, changes) {
      const all = readAll(this.KEY);
      const idx = findIdx(all, id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...changes, updatedAt: formatDate() };
      writeAll(this.KEY, all);
      return all[idx];
    },
    stats() {
      const all = this.getAll();
      return {
        total:    all.length,
        pending:  all.filter(r => r.status === 'pending').length,
        verified: all.filter(r => r.status === 'verified').length
      };
    }
  };


  /* ══════════════════════════════════════════════════════════
     ANNOUNCEMENTS
     Future API: GET /api/announcements   POST /api/announcements
  ══════════════════════════════════════════════════════════ */
  const announcements = {
    KEY: 'lba4_announcements',

    submit(data) {
      const all = readAll(this.KEY);
      const record = {
        id:          genId('announcements'),
        title:       data.title       || '',
        body:        data.body        || '',
        category:    data.category    || 'General',
        postedBy:    data.postedBy    || 'Staff',
        visibleUntil: data.visibleUntil || '',
        status:      'published',
        submittedAt: formatDate(),
        updatedAt:   formatDate()
      };
      all.unshift(record);
      writeAll(this.KEY, all);
      return record;
    },

    getAll()    { return readAll(this.KEY); },
    getPublished() { return this.getAll().filter(r => r.status === 'published'); },
    update(id, changes) {
      const all = readAll(this.KEY);
      const idx = findIdx(all, id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...changes, updatedAt: formatDate() };
      writeAll(this.KEY, all);
      return all[idx];
    },
    remove(id) { writeAll(this.KEY, readAll(this.KEY).filter(r => r.id !== id)); }
  };


  /* ══════════════════════════════════════════════════════════
     ADVERTISEMENTS
  ══════════════════════════════════════════════════════════ */
  const ads = {
    KEY: 'lba4_ads',

    submit(data) {
      const all = readAll(this.KEY);
      const record = {
        id:           genId('ads'),
        title:        data.title        || '',
        description:  data.description  || '',
        category:     data.category     || '',
        price:        data.price        || '',
        contactInfo:  data.contactInfo  || '',
        sellerName:   data.sellerName   || '',
        sellerUnit:   data.sellerUnit   || '',
        paymentProof: data.paymentProof || '',
        status:       'pending',    // pending → approved | rejected
        submittedAt:  formatDate(),
        updatedAt:    formatDate()
      };
      all.unshift(record);
      writeAll(this.KEY, all);
      return record;
    },

    getAll()       { return readAll(this.KEY); },
    getPending()   { return this.getAll().filter(r => r.status === 'pending'); },
    update(id, ch) {
      const all = readAll(this.KEY);
      const idx = findIdx(all, id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...ch, updatedAt: formatDate() };
      writeAll(this.KEY, all);
      return all[idx];
    },
    stats() {
      const all = this.getAll();
      return { total: all.length, pending: all.filter(r=>r.status==='pending').length };
    }
  };


  /* ══════════════════════════════════════════════════════════
     FORUMS
  ══════════════════════════════════════════════════════════ */
  const forums = {
    KEY: 'lba4_forums',

    submit(data) {
      const all = readAll(this.KEY);
      const record = {
        id:          genId('forums'),
        title:       data.title       || '',
        body:        data.body        || '',
        category:    data.category    || 'General',
        authorName:  data.authorName  || 'Anonymous',
        authorUnit:  data.authorUnit  || '',
        flagged:     false,
        flagReason:  '',
        status:      'active',
        replies:     0,
        submittedAt: formatDate(),
        updatedAt:   formatDate()
      };
      all.unshift(record);
      writeAll(this.KEY, all);
      return record;
    },

    getAll()    { return readAll(this.KEY); },
    getFlagged(){ return this.getAll().filter(r => r.flagged); },
    update(id, ch) {
      const all = readAll(this.KEY);
      const idx = findIdx(all, id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...ch, updatedAt: formatDate() };
      writeAll(this.KEY, all);
      return all[idx];
    },
    remove(id) { writeAll(this.KEY, readAll(this.KEY).filter(r => r.id !== id)); }
  };


  /* ══════════════════════════════════════════════════════════
     SUBSCRIBERS
  ══════════════════════════════════════════════════════════ */
  const subscribers = {
    KEY: 'lba4_subscribers',

    submit(data) {
      const all = readAll(this.KEY);
      // Prevent duplicate email
      if (all.find(r => r.email === data.email)) return { duplicate: true };
      const record = {
        id:          genId('subscribers'),
        name:        data.name        || '',
        email:       data.email       || '',
        phone:       data.phone       || '',
        type:        data.type        || 'Email',
        status:      'active',
        submittedAt: formatDate()
      };
      all.push(record);
      writeAll(this.KEY, all);
      return record;
    },

    getAll()   { return readAll(this.KEY); },
    getActive(){ return this.getAll().filter(r => r.status === 'active'); },
    remove(id) { writeAll(this.KEY, readAll(this.KEY).filter(r => r.id !== id)); }
  };


  /* ══════════════════════════════════════════════════════════
     AUTO-PRIORITY ENGINE — 3-Level HOA System
     High / Medium / Low  (no emergency/life-threat levels)
     Based on: impact, urgency, scope within subdivision
  ══════════════════════════════════════════════════════════ */
  const KEYWORD_BANK = {
    high: [
      // Security / safety threats
      'suspicious','break-in','intruder','nakawan','theft','robbery','banta',
      'aggressive','away','nag-aaway','disturbance','violence','threatening',
      // Major infrastructure
      'water main','malaking tubig','tubig','water leak','major leak','flood','baha',
      'sunog','fire','apoy','emergency','nasunog',
      // Physical hazards
      'exposed wiring','electrical hazard','puno','fallen tree','bumagsak','tree blocking',
      'open gate','damaged gate','gate broken','gate bukas','gate 1','gate 2',
      // Injury
      'injury','injured','naaksidente','aksidente','collision','bangga','drowning','nalunod'
    ],
    medium: [
      // Noise & disturbance
      'noise','ingay','maingay','loud','malakas',
      // Parking
      'parking','illegal parking','nakapark',
      // Lighting & roads
      'streetlight','ilaw','sira na ilaw','pothole','potholes','kalsada','road damage',
      'minor road','broken streetlight',
      // Gate & infrastructure (non-emergency)
      'gate malfunction','gate stuck','gate issue','drainage','drain','tubig sa kalsada',
      // Speeding
      'speeding','mabilis','speed','overspeeding',
      // General maintenance
      'maintenance','sira','broken','gripo','faucet','kuryente','electricity','light'
    ],
    low: [
      // Landscaping
      'grass','trimming','mowing','putol','damo','halaman','pruning',
      // Cleanliness
      'cleanliness','clean','basura','trash','garbage','kalat','dirty','malinis',
      'smell','stench','amoy',
      // Requests / feedback
      'suggestion','request','tanong','reklamo','feedback','improvement','comment',
      'minor repair','fix','repaint','painting',
      // Pets (non-aggressive)
      'pet','pets','aso','cat','pusa','alaga','stray pet'
    ]
  };

  function autoPriority(description = '', concernType = '') {
    const text = (description + ' ' + concernType).toLowerCase();
    // Type-based overrides first
    if (concernType === 'security') return 'high';
    if (['cleanliness','rule-violation','other'].includes(concernType)) return 'low';
    if (concernType === 'noise' || concernType === 'parking') return 'medium';
    // Keyword scan — high first, then medium, then low
    for (const level of ['high', 'medium', 'low']) {
      for (const kw of KEYWORD_BANK[level]) {
        if (text.includes(kw)) return level;
      }
    }
    return 'medium'; // default
  }

  function detectKeywords(description = '') {
    const text = description.toLowerCase();
    const found = [];
    for (const [level, words] of Object.entries(KEYWORD_BANK)) {
      for (const kw of words) {
        if (text.includes(kw)) found.push({ word: kw, level });
      }
    }
    return found;
  }

  function mapCategoryFromType(type) {
    const map = {
      noise: 'Noise & Disturbance', parking: 'Parking', security: 'Security',
      maintenance: 'Maintenance', cleanliness: 'Cleanliness',
      pet: 'Pets', 'rule-violation': 'Rule Violation', other: 'General'
    };
    return map[type] || 'General';
  }


  /* ══════════════════════════════════════════════════════════
     UTILITY — clear all data (for development/reset)
  ══════════════════════════════════════════════════════════ */
  function clearAll() {
    Object.values(PREFIX).forEach(p => {
      const key = `lba4_${Object.keys(PREFIX).find(k => PREFIX[k] === p)}`;
      localStorage.removeItem(key);
    });
    console.warn('[LBA4Storage] All localStorage data cleared.');
  }

  function exportAll() {
    const out = {};
    ['incidents','reservations','residents','announcements','ads','forums','subscribers']
      .forEach(k => { out[k] = readAll(`lba4_${k}`); });
    return out;
  }




  /* ══════════════════════════════════════════════════════════
     MAP ITEMS  (unified community map entries)
     Three categories: Incident, Project, Landmark
     Storage key: lba4_map_items
     
     Statuses by category:
       Incident  → pending | in-progress | resolved
       Concern   → pending | in-progress | resolved
       Project   → planned | ongoing | completed
       Landmark  → (no status — always visible if active)
     
     Extra fields:
       icon        → FontAwesome class (Landmarks only, e.g. fa-building)
       beforeImage → base64 or URL — state before
       afterImage  → base64 or URL — state after
  ══════════════════════════════════════════════════════════ */
  const DEFAULT_MAP_ITEMS = [
    { id:'mi-d1', category:'Landmark', name:'HOA Office',       description:'Main homeowners association office', status:'', icon:'fa-building',         lat:14.2690, lng:121.0683, active:true, createdAt:'' },
    { id:'mi-d2', category:'Landmark', name:'Clubhouse',        description:'Community clubhouse for events',     status:'', icon:'fa-home',             lat:14.2688, lng:121.0680, active:true, createdAt:'' },
    { id:'mi-d3', category:'Landmark', name:'Gate 1 (Main)',    description:'Main entrance / exit gate',          status:'', icon:'fa-door-open',        lat:14.2685, lng:121.0690, active:true, createdAt:'' },
    { id:'mi-d4', category:'Landmark', name:'Basketball Court', description:'Outdoor basketball / covered court', status:'', icon:'fa-basketball-ball',   lat:14.2692, lng:121.0675, active:true, createdAt:'' }
  ];

  const mapItems = {
    KEY: 'lba4_map_items',

    getAll() {
      try {
        const stored = JSON.parse(localStorage.getItem(this.KEY) || 'null');
        if (!stored) {
          localStorage.setItem(this.KEY, JSON.stringify(DEFAULT_MAP_ITEMS));
          return DEFAULT_MAP_ITEMS;
        }
        return stored;
      } catch { return DEFAULT_MAP_ITEMS; }
    },

    getByCategory(cat) {
      return this.getAll().filter(r => r.category === cat && r.active !== false);
    },

    add(data) {
      const all = this.getAll();
      const record = {
        id:          'mi-' + Date.now(),
        category:    data.category    || 'Landmark',
        name:        data.name        || '',
        description: data.description || '',
        status:      data.status      || '',
        icon:        data.icon        || '',
        beforeImage: data.beforeImage || '',
        afterImage:  data.afterImage  || '',
        lat:         parseFloat(data.lat) || 0,
        lng:         parseFloat(data.lng) || 0,
        active:      data.active !== false,
        createdAt:   formatDate()
      };
      all.unshift(record);
      localStorage.setItem(this.KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lba4:mapitems:update'));
      return record;
    },

    update(id, changes) {
      const all = this.getAll();
      const idx = all.findIndex(r => r.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...changes, updatedAt: formatDate() };
      localStorage.setItem(this.KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lba4:mapitems:update'));
      return all[idx];
    },

    remove(id) {
      const all = this.getAll().filter(r => r.id !== id);
      localStorage.setItem(this.KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lba4:mapitems:update'));
    }
  };

  /* ══════════════════════════════════════════════════════════
     LANDMARKS  (community map pins — staff-managed)
     Storage key: lba4_landmarks
  ══════════════════════════════════════════════════════════ */
  const DEFAULT_LANDMARKS = [
    { id:'lm-default-1', name:'HOA Office',      type:'Admin',   description:'Main homeowners association office', lat:14.2690, lng:121.0683, active:true, createdAt:'' },
    { id:'lm-default-2', name:'Clubhouse',        type:'Amenity', description:'Community clubhouse for events',     lat:14.2688, lng:121.0680, active:true, createdAt:'' },
    { id:'lm-default-3', name:'Gate 1 (Main)',    type:'Gate',    description:'Main entrance / exit gate',          lat:14.2685, lng:121.0690, active:true, createdAt:'' },
    { id:'lm-default-4', name:'Basketball Court', type:'Amenity', description:'Outdoor basketball court',           lat:14.2692, lng:121.0675, active:true, createdAt:'' }
  ];

  const landmarks = {
    KEY: 'lba4_landmarks',

    getAll() {
      // FUTURE BACKEND: return fetch('/api/landmarks').then(r=>r.json());
      try {
        const stored = JSON.parse(localStorage.getItem(this.KEY) || 'null');
        if (!stored) {
          localStorage.setItem(this.KEY, JSON.stringify(DEFAULT_LANDMARKS));
          return DEFAULT_LANDMARKS;
        }
        return stored;
      } catch { return DEFAULT_LANDMARKS; }
    },

    add(data) {
      // FUTURE BACKEND: fetch('/api/landmarks',{method:'POST',body:JSON.stringify(data)})
      const all = this.getAll();
      const record = {
        id:          'lm-' + Date.now(),
        name:        data.name        || '',
        type:        data.type        || 'Amenity',
        description: data.description || '',
        lat:         parseFloat(data.lat) || 0,
        lng:         parseFloat(data.lng) || 0,
        active:      data.active !== false,
        createdAt:   formatDate()
      };
      all.unshift(record);
      localStorage.setItem(this.KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lba4:landmarks:update'));
      return record;
    },

    update(id, changes) {
      // FUTURE BACKEND: fetch(`/api/landmarks/${id}`,{method:'PATCH',body:JSON.stringify(changes)})
      const all = this.getAll();
      const idx = all.findIndex(r => r.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...changes, updatedAt: formatDate() };
      localStorage.setItem(this.KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lba4:landmarks:update'));
      return all[idx];
    },

    remove(id) {
      // FUTURE BACKEND: fetch(`/api/landmarks/${id}`,{method:'DELETE'})
      const all = this.getAll().filter(r => r.id !== id);
      localStorage.setItem(this.KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lba4:landmarks:update'));
    }
  };

  /* ── Public API ── */
  return {
    incidents,
    reservations,
    residents,
    announcements,
    ads,
    forums,
    subscribers,
    utils:     { clearAll, exportAll, formatDate, autoPriority },
    landmarks: landmarks,
    mapItems:  mapItems
  };

})();

// Make available globally
window.LBA4Storage = LBA4Storage;