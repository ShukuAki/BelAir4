/*
  PAGE COORDINATOR - Shared utility for inter-page communication
  This file provides a unified pattern for all pages to:
  1. Authenticate & get session data
  2. Fetch data from APIs
  3. Render data consistently
  4. Handle form submissions
  5. Navigate between pages
*/

(function() {
  'use strict';

  window.PageCoordinator = {
    // Session & Auth
    getSession: function() {
      return {
        username: sessionStorage.getItem('username') || localStorage.getItem('username'),
        userType: parseInt(sessionStorage.getItem('userType') || localStorage.getItem('userType') || '0'),
        userId: sessionStorage.getItem('userId') || localStorage.getItem('userId')
      };
    },

    isAuthenticated: function() {
      const s = this.getSession();
      return s.userId && s.userType > 0;
    },

    isStaff: function() {
      return this.getSession().userType >= 2;
    },

    isAdmin: function() {
      return this.getSession().userType >= 3;
    },

    // API Calls
    api: {
      get: async function(endpoint) {
        try {
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          return await res.json();
        } catch (err) {
          console.error(`GET ${endpoint} failed:`, err);
          throw err;
        }
      },

      post: async function(endpoint, data) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          return await res.json();
        } catch (err) {
          console.error(`POST ${endpoint} failed:`, err);
          throw err;
        }
      },

      put: async function(endpoint, data) {
        try {
          const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          return await res.json();
        } catch (err) {
          console.error(`PUT ${endpoint} failed:`, err);
          throw err;
        }
      },

      delete: async function(endpoint) {
        try {
          const res = await fetch(endpoint, { method: 'DELETE' });
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          return await res.json();
        } catch (err) {
          console.error(`DELETE ${endpoint} failed:`, err);
          throw err;
        }
      }
    },

    // Toast notifications
    showToast: function(message, type = 'info') {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        padding: 14px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    },

    // Page navigation
    goTo: function(pageName) {
      const pages = {
        'dashboard': '/Home/staffdashboard',
        'admin': '/Home/admindashboard',
        'announcements': '/Home/announcement',
        'forums': '/Home/forums',
        'calendar': '/Home/calendars',
        'reserve': '/Home/reserve',
        'incidents': '/Home/reportconcerns',
        'committees': '/Home/committeesbods',
        'meetings': '/Home/meetingagendas',
        'documents': '/Home/formsdocuments',
        'contacts': '/Home/contacts',
        'map': '/Home/communitymap',
        'ads': '/Home/advertisements',
        'register': '/Home/vehiclepetregistration'
      };
      if (pages[pageName]) {
        window.location.href = pages[pageName];
      }
    },

    // Data rendering helpers
    render: {
      // Render a list of items in a container
      list: function(container, items, template) {
        if (!container) return;
        container.innerHTML = items.map(template).join('');
      },

      // Render a single item with fallback
      single: function(container, item, template) {
        if (!container) return;
        container.innerHTML = item ? template(item) : '<div style="padding:20px;color:var(--gray-400)"><i class="fas fa-inbox"></i> No data</div>';
      },

      // Render with error handling
      async data(container, endpoint, template, errorMsg = 'Failed to load data') {
        if (!container) return;
        container.innerHTML = '<div style="padding:20px;text-align:center"><i class="fas fa-spinner fa-spin"></i></div>';
        try {
          const result = await this.api.get(endpoint);
          const data = result.data || result;
          if (Array.isArray(data)) {
            PageCoordinator.render.list(container, data, template);
          } else {
            PageCoordinator.render.single(container, data, template);
          }
        } catch (err) {
          container.innerHTML = `<div style="padding:20px;color:var(--red)"><i class="fas fa-exclamation-triangle"></i> ${errorMsg}</div>`;
        }
      }
    },

    // Common templates
    templates: {
      announcementCard: (ann) => `
        <div style="padding:16px;border:1px solid var(--gray-200);border-radius:6px;margin-bottom:12px">
          <div style="font-weight:700;font-size:15px;margin-bottom:4px">${escapeHtml(ann.title)}</div>
          <div style="font-size:12px;color:var(--gray-600);margin-bottom:8px">${new Date(ann.postedAt).toLocaleDateString('en-PH')}</div>
          <div style="font-size:14px;line-height:1.5">${escapeHtml(ann.body?.substring(0, 200) || '')}${ann.body?.length > 200 ? '...' : ''}</div>
        </div>
      `,

      eventCard: (event) => `
        <div style="padding:16px;border:1px solid var(--gray-200);border-radius:6px;margin-bottom:12px">
          <div style="font-weight:700;font-size:15px;margin-bottom:4px">${escapeHtml(event.title)}</div>
          <div style="font-size:13px;color:var(--gray-600);margin-bottom:6px">
            <i class="fas fa-calendar"></i> ${escapeHtml(event.date)} ${event.time ? ' @ ' + escapeHtml(event.time) : ''}
          </div>
          <div style="font-size:13px;color:var(--gray-600)">${event.location ? '📍 ' + escapeHtml(event.location) : ''}</div>
        </div>
      `,

      reservationRow: (res) => `
        <tr>
          <td>${escapeHtml(res.residentName)}</td>
          <td>${escapeHtml(res.amenity)}</td>
          <td>${escapeHtml(res.date)} ${res.startTime}</td>
          <td>${escapeHtml(res.purpose)}</td>
          <td><span style="padding:4px 8px;background:var(--gray-100);border-radius:4px;font-size:11px">${escapeHtml(res.status || 'pending')}</span></td>
        </tr>
      `,

      incidentRow: (incident) => `
        <tr>
          <td>${escapeHtml(incident.reference || incident.id)}</td>
          <td>${escapeHtml(incident.description?.substring(0, 50) || '')}</td>
          <td>${escapeHtml(incident.category)}</td>
          <td><span style="padding:4px 8px;background:var(--gray-100);border-radius:4px;font-size:11px">${escapeHtml(incident.priority || 'medium')}</span></td>
          <td>${escapeHtml(incident.status || 'open')}</td>
        </tr>
      `
    }
  };

  // Helper: Escape HTML to prevent XSS
  window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Auto-redirect unauthenticated users
  document.addEventListener('DOMContentLoaded', function() {
    // Skip redirect on auth pages
    const currentPage = window.location.pathname;
    const authPages = ['/home/login', '/home/register', '/home/forgotpassword', '/home/index', '/'];
    const isAuthPage = authPages.some(p => currentPage.toLowerCase().includes(p));

    if (!isAuthPage && !PageCoordinator.isAuthenticated()) {
      window.location.href = '/Home/login';
    }
  });
})();
