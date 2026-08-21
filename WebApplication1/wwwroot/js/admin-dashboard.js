// Admin Dashboard API Service
const AdminAPI = {
    baseUrl: '/api/admin',

    // ── Helper Methods ──
    async request(method, endpoint, data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    },

    // ── Staff Management ──
    staff: {
        getAll: () => AdminAPI.request('GET', '/staff'),
        getById: (id) => AdminAPI.request('GET', `/staff/${id}`),
        create: (data) => AdminAPI.request('POST', '/staff', data),
        update: (id, data) => AdminAPI.request('PUT', `/staff/${id}`, data),
        delete: (id) => AdminAPI.request('DELETE', `/staff/${id}`),
    },

    // ── Audit Log ──
    auditLog: {
        getAll: (filters = {}) => {
            let url = '/audit-log';
            const params = new URLSearchParams();
            if (filters.adminUserId) params.append('adminUserId', filters.adminUserId);
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);
            if (params.toString()) url += '?' + params.toString();
            return AdminAPI.request('GET', url);
        },
        getByCategory: (category) => AdminAPI.request('GET', `/audit-log/category/${category}`),
        log: (data) => AdminAPI.request('POST', '/audit-log', data),
    },

    // ── Roles & Permissions ──
    roles: {
        getAll: () => AdminAPI.request('GET', '/roles'),
        getById: (id) => AdminAPI.request('GET', `/roles/${id}`),
        create: (data) => AdminAPI.request('POST', '/roles', data),
        update: (id, data) => AdminAPI.request('PUT', `/roles/${id}`, data),
        delete: (id) => AdminAPI.request('DELETE', `/roles/${id}`),
    },

    permissions: {
        getAll: () => AdminAPI.request('GET', '/permissions'),
    },

    rolePermissions: {
        assignPermission: (roleId, data) => AdminAPI.request('POST', `/roles/${roleId}/permissions`, data),
        removePermission: (roleId, permissionId) => AdminAPI.request('DELETE', `/roles/${roleId}/permissions/${permissionId}`),
    },

    // ── Staff Invitations ──
    invitations: {
        getAll: () => AdminAPI.request('GET', '/invitations'),
        getPending: () => AdminAPI.request('GET', '/invitations/pending'),
        create: (data) => AdminAPI.request('POST', '/invitations', data),
        resend: (id) => AdminAPI.request('PUT', `/invitations/${id}/resend`),
        delete: (id) => AdminAPI.request('DELETE', `/invitations/${id}`),
    },

    // ── Settings ──
    settings: {
        getAll: () => AdminAPI.request('GET', '/settings'),
        getByKey: (key) => AdminAPI.request('GET', `/settings/${key}`),
        create: (data) => AdminAPI.request('POST', '/settings', data),
        update: (id, data) => AdminAPI.request('PUT', `/settings/${id}`, data),
    },

    // ── Ban Management ──
    bans: {
        getAll: () => AdminAPI.request('GET', '/bans'),
        getActive: () => AdminAPI.request('GET', '/bans/active'),
        create: (data) => AdminAPI.request('POST', '/bans', data),
        unban: (id, data) => AdminAPI.request('PUT', `/bans/${id}/unban`, data),
    },

    // ── Backups ──
    backups: {
        getAll: () => AdminAPI.request('GET', '/backups'),
        create: (data) => AdminAPI.request('POST', '/backups', data),
        update: (id, data) => AdminAPI.request('PUT', `/backups/${id}`, data),
    },

    // ── Push Notification Subscribers (note: separate /api endpoint, not /api/admin) ──
    subscribers: {
        getAll: async () => {
            const res = await fetch('/api/subscribers');
            return res.json();
        },
        getStats: async () => {
            const res = await fetch('/api/subscribers/stats');
            return res.json();
        },
        delete: async (id) => {
            const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
            return res.json();
        },
    },

    // ── Residents ──
    residents: {
        getAll: () => AdminAPI.request('GET', '/residents'),
        ban: (id, reason) => AdminAPI.request('POST', `/residents/${id}/ban`, { reason }),
        unban: (id) => AdminAPI.request('POST', `/residents/${id}/unban`, {}),
    },
};

const KeywordAPI = {
    baseUrl: '/api/keywords',
    async request(method, endpoint = '', data = null) {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (data && (method === 'POST' || method === 'PUT')) options.body = JSON.stringify(data);
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    },
    getAll: function () { return this.request('GET'); },
    create: function (data) { return this.request('POST', '', data); },
    update: function (id, data) { return this.request('PUT', `/${id}`, data); },
    delete: function (id) { return this.request('DELETE', `/${id}`); },
};

// ────────────────────────────────────────────────────────────
// Admin Dashboard UI Manager
// ────────────────────────────────────────────────────────────

const AdminDashboard = {
    currentPage: 'overview',
    staffData: [],
    auditLogs: [],
    roles: [],
    permissionsList: [],
    selectedRoleId: null,
    invitations: [],
    settings: [],
    residents: [],
    keywords: [],
    backups: [],

    // Initialize dashboard
    init: async function () {
        console.log('Initializing Admin Dashboard...');
        await this.loadInitialData();
        await this.loadResidents();
        await this.loadKeywords();
        await this.loadBackups();
        await this.loadSubscriberStats();
        this.updateOverviewStats();
        this.setupEventListeners();
    },

    // Load all initial data
    loadInitialData: async function () {
        try {
            // Load staff, audit logs, roles, invitations, settings
            this.staffData = await AdminAPI.staff.getAll();
            this.auditLogs = await AdminAPI.auditLog.getAll();
            this.roles = await AdminAPI.roles.getAll();
            this.permissionsList = await AdminAPI.permissions.getAll();
            this.invitations = await AdminAPI.invitations.getAll();
            this.settings = await AdminAPI.settings.getAll();

            this.updateOverviewStats();
            this.populateStaffTable();
            this.populateAuditLog();
            this.populateInvitations();
            this.populateRolesList();
            this.populateSettings();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            alert('Failed to load dashboard data. Please refresh the page.');
        }
    },

    // Load residents & banned users
    loadResidents: async function () {
        try {
            const result = await AdminAPI.residents.getAll();
            this.residents = (result && result.success && result.data) ? result.data : [];
        } catch (error) {
            console.error('Failed to load residents:', error);
            this.residents = [];
        }
        this.populateResidentsTable();
        this.populateBannedTable();
        this.updateOverviewStats();
    },

    // Load word bank keywords
    loadKeywords: async function () {
        try {
            const result = await KeywordAPI.getAll();
            this.keywords = (result && result.success && result.data) ? result.data : [];
        } catch (error) {
            console.error('Failed to load keywords:', error);
            this.keywords = [];
        }
        this.populateKeywords();
    },

    // Load backups
    loadBackups: async function () {
        try {
            const result = await AdminAPI.backups.getAll();
            this.backups = (result && result.success && result.data) ? result.data : [];
        } catch (error) {
            console.error('Failed to load backups:', error);
            this.backups = [];
        }
        this.populateBackups();
    },

    populateBackups: function () {
        const tbody = document.getElementById('backup-tbody');
        if (!tbody) return;
        if (!this.backups.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px">No backups found.</td></tr>';
            return;
        }
        tbody.innerHTML = this.backups.slice(0, 10).map(b => {
            const statusClass = b.status === 'Completed' ? 'status-pill sp-approved' : 
                               b.status === 'In Progress' ? 'status-pill sp-pending' : 
                               'status-pill sp-rejected';
            return `
            <tr>
                <td><strong>#${b.id}</strong></td>
                <td>${b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}</td>
                <td>${b.backupType || 'Manual'}</td>
                <td>${b.fileSizeMb ? `${b.fileSizeMb} MB` : '—'}</td>
                <td><span class="${statusClass}">${b.status}</span></td>
                <td>
                    ${b.status === 'Completed' ? `<button class="btn btn-outline btn-sm"><i class="fas fa-download"></i> Download</button>` : ''}
                </td>
            </tr>`;
        }).join('');
    },

    runManualBackup: async function () {
        if (!confirm('Create a manual backup now? This may take a few minutes.')) return;

        try {
            const btn = document.getElementById('mainBackupBtn');
            if (btn) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating backup...';
                btn.disabled = true;

                await AdminAPI.backups.create({
                    backupType: 'Manual',
                    triggeredBy: 'Admin',
                    status: 'In Progress'
                });

                alert('Backup started successfully!');
                await this.loadBackups();

                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Failed to create backup:', error);
            alert('Failed to create backup. Please try again.');
        }
    },

    populateKeywords: function () {
        const tbody = document.getElementById('wordbank-tbody');
        if (!tbody) return;
        if (!this.keywords.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px">No keywords found.</td></tr>';
            return;
        }
        const sevClass = (sev) => {
            const s = (sev || '').toLowerCase();
            if (s === 'high') return 'p-high';
            if (s === 'low') return 'p-low';
            return 'p-medium';
        };
        tbody.innerHTML = this.keywords.map(k => `
            <tr data-severity="${(k.severity || 'medium').toLowerCase()}" data-keyword-id="${k.id}">
                <td><strong>${k.keyword}</strong></td>
                <td>${k.description || '—'}</td>
                <td><span class="priority ${sevClass(k.severity)}">${(k.severity || 'medium')}</span></td>
                <td>${k.category || '—'}</td>
                <td>${k.language || '—'}</td>
                <td>${k.updatedAt ? new Date(k.updatedAt).toLocaleDateString() : '—'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="AdminDashboard.openEditKeyword(${k.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="AdminDashboard.deleteKeyword(${k.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
    },

    addKeyword: async function () {
        const keyword = document.getElementById('kw-word')?.value.trim();
        const description = document.getElementById('kw-description')?.value.trim();
        const severity = document.getElementById('kw-severity')?.value;
        const category = document.getElementById('kw-category')?.value.trim();
        if (!keyword) { alert('Please enter a keyword.'); return; }
        try {
            await KeywordAPI.create({ keyword, description, severity, category, language: 'bilingual', isActive: true });
            await this.loadKeywords();
            closeModal('addKeyword');
        } catch (error) {
            console.error('Failed to add keyword:', error);
            alert('Failed to add keyword.');
        }
    },

    openEditKeyword: function (id) {
        const kw = this.keywords.find(k => k.id === id);
        if (!kw) return;
        document.getElementById('edit-kw-word').value = kw.keyword || '';
        document.getElementById('edit-kw-description').value = kw.description || '';
        document.getElementById('edit-kw-severity').value = (kw.severity || 'medium').toLowerCase();
        document.getElementById('edit-kw-category').value = kw.category || '';
        document.getElementById('edit-kw-id').value = kw.id;
        openModal('editKeyword');
    },

    saveKeywordEdit: async function () {
        const id = parseInt(document.getElementById('edit-kw-id').value);
        const keyword = document.getElementById('edit-kw-word').value.trim();
        const description = document.getElementById('edit-kw-description').value.trim();
        const severity = document.getElementById('edit-kw-severity').value;
        const category = document.getElementById('edit-kw-category').value.trim();
        if (!keyword) { alert('Please enter a keyword.'); return; }
        try {
            await KeywordAPI.update(id, { id, keyword, description, severity, category, language: 'bilingual', isActive: true });
            await this.loadKeywords();
            closeModal('editKeyword');
        } catch (error) {
            console.error('Failed to save keyword:', error);
            alert('Failed to save keyword.');
        }
    },

    deleteKeyword: async function (id) {
        if (!confirm('Delete this keyword?')) return;
        try {
            await KeywordAPI.delete(id);
            await this.loadKeywords();
        } catch (error) {
            console.error('Failed to delete keyword:', error);
            alert('Failed to delete keyword.');
        }
    },

    // ── Backups ──
    loadBackups: async function () {
        try {
            this.backups = await AdminAPI.backups.getAll();
        } catch (error) {
            console.error('Failed to load backups:', error);
            this.backups = [];
        }
        this.populateBackups();
    },

    populateBackups: function () {
        const tbody = document.getElementById('backup-tbody');
        if (!tbody) return;
        if (!this.backups.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px">No backups found.</td></tr>';
            return;
        }
        const formatSize = (bytes) => {
            if (!bytes) return '—';
            const gb = bytes / (1024 * 1024 * 1024);
            return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
        };
        const statusClass = (status) => status === 'Success' ? 'sp-approved' : status === 'Running' ? 'sp-pending' : 'sp-open';
        tbody.innerHTML = [...this.backups]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(b => `
            <tr data-backup-id="${b.id}">
                <td class="mono">${b.backupId}</td>
                <td>${new Date(b.createdAt).toLocaleString()}</td>
                <td>${b.backupType}</td>
                <td>${formatSize(b.fileSizeBytes)}</td>
                <td><span class="status-pill ${statusClass(b.status)}">${b.status}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="AdminDashboard.downloadBackup(${b.id})"><i class="fas fa-download"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="AdminDashboard.restoreBackup(${b.id})"><i class="fas fa-undo"></i> Restore</button>
                </td>
            </tr>`).join('');
    },

    runBackup: async function () {
        try {
            const backupId = `BKP-${Math.floor(1000 + Math.random() * 9000)}`;
            await AdminAPI.backups.create({
                backupId,
                backupType: 'Manual',
                status: 'Success',
                filePath: `/backups/${backupId}.bak`,
                fileSizeBytes: 0,
            });
            await this.loadBackups();
            alert('Manual backup completed successfully.');
        } catch (error) {
            console.error('Failed to run backup:', error);
            alert('Failed to run backup.');
        }
    },

    downloadBackup: function (id) {
        const backup = this.backups.find(b => b.id === id);
        if (!backup || !backup.filePath) { alert('Backup file is not available for download.'); return; }
        window.open(backup.filePath, '_blank');
    },

    restoreBackup: async function (id) {
        const backup = this.backups.find(b => b.id === id);
        if (!backup) return;
        if (!confirm(`Restore system from backup ${backup.backupId}? This action cannot be undone.`)) return;
        try {
            await AdminAPI.backups.update(id, { ...backup, restoredAt: new Date().toISOString() });
            await this.loadBackups();
            alert('Backup restored successfully.');
        } catch (error) {
            console.error('Failed to restore backup:', error);
            alert('Failed to restore backup.');
        }
    },

    populateResidentsTable: function () {
        const tbody = document.getElementById('residents-tbody');
        if (!tbody) return;
        if (!this.residents.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px">No residents found.</td></tr>';
            return;
        }
        const statusPill = (status) => {
            if (status === 'Banned') return '<span class="status-pill sp-open">Banned</span>';
            if (status === 'Verified') return '<span class="status-pill sp-approved">Verified</span>';
            return '<span class="status-pill sp-pending">Pending</span>';
        };
        tbody.innerHTML = this.residents.map(r => `
            <tr data-status="${r.status}" data-id="${r.id}">
                <td><strong>${r.name}</strong></td>
                <td>${r.address ? r.address.split(',')[0] : '—'}</td>
                <td>${r.address || '—'}</td>
                <td>${r.contact || '—'}</td>
                <td>${r.email}</td>
                <td>${r.status === 'Verified' ? 'Yes' : '—'}</td>
                <td>${statusPill(r.status)}</td>
                <td>
                    ${r.status === 'Banned'
                        ? `<button class="btn btn-outline btn-sm" onclick="AdminDashboard.unbanResident(${r.id})"><i class="fas fa-undo"></i> Unban</button>`
                        : `<button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="AdminDashboard.banResident(${r.id}, '${(r.name || '').replace(/'/g, "\\'")}')" title="Ban"><i class="fas fa-ban"></i></button>`}
                </td>
            </tr>`).join('');

        const verified = this.residents.filter(r => r.status === 'Verified').length;
        const pending  = this.residents.filter(r => r.status === 'Pending').length;
        const banned   = this.residents.filter(r => r.status === 'Banned').length;
        const setText = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        setText('stat-verified', verified);
        setText('stat-pending', pending);
        setText('stat-banned-count', banned);
    },

    populateBannedTable: function () {
        const tbody = document.getElementById('banned-tbody');
        if (!tbody) return;
        const banned = this.residents.filter(r => r.status === 'Banned');
        const label = document.getElementById('banned-count-label');
        if (label) label.textContent = `${banned.length} currently banned`;
        if (!banned.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px">No banned users.</td></tr>';
            return;
        }
        tbody.innerHTML = banned.map(r => `
            <tr data-id="${r.id}">
                <td><strong>${r.name}</strong></td>
                <td>${r.banReason || '—'}</td>
                <td>Admin</td>
                <td>—</td>
                <td>—</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="AdminDashboard.unbanResident(${r.id})"><i class="fas fa-undo"></i> Unban</button>
                </td>
            </tr>`).join('');
    },

    banResident: async function (id, name) {
        const reason = prompt(`Reason for banning ${name || 'this account'}:`, 'Admin action');
        if (reason === null) return;
        try {
            await AdminAPI.residents.ban(id, reason);
            await this.loadResidents();
        } catch (error) {
            alert('Failed to ban resident');
        }
    },

    unbanResident: async function (id) {
        if (!confirm('Unban this account?')) return;
        try {
            await AdminAPI.residents.unban(id);
            await this.loadResidents();
        } catch (error) {
            alert('Failed to unban resident');
        }
    },

    // Update overview statistics
    updateOverviewStats: function () {
        document.getElementById('stat-staff-count').textContent = this.staffData.length;
        document.getElementById('stat-total-residents').textContent = this.residents.length;

        const failedLogins = this.auditLogs.filter(l => (l.outcome || '').toLowerCase() !== 'success').length;
        const criticalBackups = (this.backups || []).filter(b => (b.status || '').toLowerCase() === 'failed').length;
        const alertCount = failedLogins + criticalBackups;
        document.getElementById('overview-alert-count').textContent = alertCount;
        this.renderOverviewAlerts(failedLogins, criticalBackups);
        this.renderOverviewMetrics();
        this.renderOverviewRecentActions();
        this.renderOverviewStaffMiniList();
    },

    renderOverviewAlerts: function (failedLogins, criticalBackups) {
        const container = document.getElementById('overview-alerts-list');
        if (!container) return;

        const alerts = [];
        if (criticalBackups > 0) {
            alerts.push(`<div class="alert-item alert-critical">
                <div class="alert-icon"><i class="fas fa-database"></i></div>
                <div class="alert-body"><div class="alert-title">${criticalBackups} failed backup(s) detected</div><div class="alert-meta">Check backup history for details</div></div>
                <div class="alert-actions"><button class="btn btn-outline btn-sm" onclick="showPage('backups',document.querySelector('[onclick*=backups]'))">Manage</button></div>
            </div>`);
        }
        if (failedLogins > 0) {
            alerts.push(`<div class="alert-item alert-warn">
                <div class="alert-icon"><i class="fas fa-user-times"></i></div>
                <div class="alert-body"><div class="alert-title">${failedLogins} unsuccessful audit action(s) logged</div><div class="alert-meta">Review the audit log for anomalies</div></div>
                <div class="alert-actions"><button class="btn btn-outline btn-sm" onclick="showPage('auditlog',document.querySelector('[onclick*=auditlog]'))">Review</button></div>
            </div>`);
        }
        const pendingInvites = (this.invitations || []).filter(i => (i.status || '').toLowerCase() === 'pending').length;
        if (pendingInvites > 0) {
            alerts.push(`<div class="alert-item alert-info">
                <div class="alert-icon"><i class="fas fa-user-plus"></i></div>
                <div class="alert-body"><div class="alert-title">${pendingInvites} pending staff invitation(s)</div><div class="alert-meta">Awaiting acceptance</div></div>
                <div class="alert-actions"><button class="btn btn-primary btn-sm" onclick="showPage('staffaccounts',document.querySelector('[onclick*=staffaccounts]'))">View</button></div>
            </div>`);
        }

        container.innerHTML = alerts.length
            ? alerts.join('')
            : `<div class="alert-item alert-info"><div class="alert-icon"><i class="fas fa-check-circle"></i></div><div class="alert-body"><div class="alert-title">No active system alerts</div><div class="alert-meta">Everything looks healthy</div></div></div>`;
    },

    renderOverviewMetrics: function () {
        const body = document.getElementById('overview-metrics-body');
        if (!body) return;
        const now = new Date();
        const thisMonthLogs = this.auditLogs.filter(l => {
            const d = new Date(l.timestamp);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const totalActions = thisMonthLogs.length;
        const dataExports = thisMonthLogs.filter(l => (l.action || '').toLowerCase().includes('export')).length;
        const approvals = thisMonthLogs.filter(l => (l.action || '').toLowerCase().includes('approv')).length;

        body.innerHTML = `
            <div class="metric-row"><div class="metric-label">Total Audit Actions</div><div class="metric-val">${totalActions}</div></div>
            <div class="metric-row"><div class="metric-label">Data Exported</div><div class="metric-val">${dataExports} file(s)</div></div>
            <div class="metric-row"><div class="metric-label">Approvals Logged</div><div class="metric-val">${approvals}</div></div>
            <div class="metric-row"><div class="metric-label">Total Residents</div><div class="metric-val">${this.residents.length}</div></div>
        `;
    },

    renderOverviewRecentActions: function () {
        const container = document.getElementById('overview-recent-actions');
        if (!container) return;
        const recent = [...this.auditLogs]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        if (!recent.length) {
            container.innerHTML = '<div class="activity-item"><div class="act-dot" style="background:var(--gray-300)"></div><div class="act-body"><p style="color:var(--gray-400);font-size:12px">No recent admin actions</p></div></div>';
            return;
        }
        container.innerHTML = recent.map(log => {
            const time = log.timestamp ? new Date(log.timestamp).toLocaleString() : '';
            const color = (log.outcome || '').toLowerCase() === 'success' ? 'var(--navy)' : 'var(--red)';
            return `<div class="activity-item"><div class="act-dot" style="background:${color}"></div><div class="act-body"><p><strong>${log.adminUser?.name || 'Admin'}</strong> ${log.action || ''} ${log.targetEntity ? `<em>${log.targetEntity}</em>` : ''}</p><div class="act-time">${time}</div></div></div>`;
        }).join('');
    },

    renderOverviewStaffMiniList: function () {
        const container = document.getElementById('overview-staff-mini-list');
        if (!container) return;
        if (!this.staffData.length) {
            container.innerHTML = '<div class="staff-mini-item"><div class="staff-info"><div class="staff-name" style="color:var(--gray-400)">No staff accounts yet</div></div></div>';
            return;
        }
        container.innerHTML = this.staffData.slice(0, 5).map(s => {
            const initials = (s.name || 'ST').split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
            return `<div class="staff-mini-item"><div class="staff-av" style="background:linear-gradient(135deg,#0a4d3c,#1a7a58)">${initials}</div><div class="staff-info"><div class="staff-name">${s.name || 'Staff'}</div><div class="staff-role">${s.role?.name || 'Staff'}</div></div><span class="status-pill sp-resolved">Active</span></div>`;
        }).join('');
    },

    // Populate staff table
    populateStaffTable: function () {
        const tbody = document.getElementById('staff-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Add protected admin
        const adminRow = `
            <tr data-protected="true">
                <td><strong>System Administrator</strong></td>
                <td>admin@lba4.com</td>
                <td><span class="tag tag-navy">Admin</span></td>
                <td>Today, 9:00 AM</td>
                <td><span class="status-pill sp-active">Active</span></td>
                <td><span style="color:var(--gray-400);font-size:12px;font-style:italic">Protected</span></td>
            </tr>
        `;
        tbody.innerHTML += adminRow;

        // Add other staff members
        this.staffData.forEach(staff => {
            const row = `
                <tr data-staff-id="${staff.id}">
                    <td><strong>${staff.name}</strong></td>
                    <td>${staff.email}</td>
                    <td><span class="tag tag-blue">${staff.role?.name || 'Staff'}</span></td>
                    <td>${staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString() : 'Never'}</td>
                    <td><span class="status-pill sp-active">${staff.status}</span></td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="AdminDashboard.openEditStaff(${staff.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="AdminDashboard.removeStaff(${staff.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    },

    // Populate pending invitations
    populateInvitations: function () {
        const tbody = document.getElementById('pending-invites-tbody');
        const countEl = document.getElementById('pending-invites-count');
        if (!tbody) return;
        const pending = (this.invitations || []).filter(inv => !inv.acceptedAt && !inv.cancelledAt);
        if (countEl) countEl.textContent = `(${pending.length})`;
        if (!pending.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px">No pending invitations.</td></tr>';
            return;
        }
        tbody.innerHTML = pending.map(inv => `
            <tr data-invite-id="${inv.id}">
                <td><strong>${inv.emailAddress}</strong></td>
                <td><span class="tag tag-blue">${inv.role?.name || 'Staff'}</span></td>
                <td>${inv.invitedByAdminUser?.name || 'Admin'}</td>
                <td>${inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}</td>
                <td>${inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '—'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="AdminDashboard.resendInvite(this)"><i class="fas fa-redo"></i> Resend</button>
                    <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="AdminDashboard.cancelInvite(this)"><i class="fas fa-times"></i> Cancel</button>
                </td>
            </tr>`).join('');
    },

    // ── Roles & Permissions ──
    populateRolesList: function () {
        const list = document.getElementById('roles-list');
        if (!list) return;
        if (!this.roles.length) {
            list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--gray-400)">No roles found.</div>';
            return;
        }
        list.innerHTML = this.roles.map(role => {
            const userCount = (this.staffData || []).filter(s => s.roleId === role.id || s.role?.id === role.id).length;
            const icon = role.isProtected ? 'fa-crown' : 'fa-user-shield';
            const cls = role.isProtected ? 'rli-admin' : 'rli-staff';
            const actions = role.isProtected
                ? `<span class="role-lock-badge"><i class="fas fa-lock"></i></span>`
                : `<div class="rli-actions">
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();AdminDashboard.openRenameRole(${role.id})" title="Rename"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-outline btn-sm" style="color:var(--red)" onclick="event.stopPropagation();AdminDashboard.deleteRole(${role.id})" title="Delete"><i class="fas fa-trash"></i></button>
                   </div>`;
            return `
            <div class="role-list-item${this.selectedRoleId === role.id ? ' active-role' : ''}" data-role-id="${role.id}" onclick="AdminDashboard.selectRole(${role.id}, this)">
                <div class="rli-icon ${cls}"><i class="fas ${icon}"></i></div>
                <div class="rli-body">
                    <div class="rli-name">${role.name}</div>
                    <div class="rli-desc">${role.description || ''}</div>
                    <div class="rli-count">${userCount} user${userCount === 1 ? '' : 's'}</div>
                </div>
                ${actions}
            </div>`;
        }).join('');

        if (this.selectedRoleId == null && this.roles.length) {
            this.selectRole(this.roles[0].id, list.querySelector('.role-list-item'));
        } else if (this.selectedRoleId != null) {
            this.renderPermissionEditor(this.selectedRoleId);
        }
    },

    selectRole: function (roleId, el) {
        this.selectedRoleId = roleId;
        document.querySelectorAll('#roles-list .role-list-item').forEach(item => item.classList.remove('active-role'));
        if (el) el.classList.add('active-role');
        this.renderPermissionEditor(roleId);
    },

    renderPermissionEditor: function (roleId) {
        const role = this.roles.find(r => r.id === roleId);
        const nameEl = document.getElementById('perm-role-name');
        const body = document.getElementById('perm-editor-body');
        const actions = document.getElementById('perm-editor-actions');
        const notice = document.getElementById('perm-admin-notice');
        if (!role || !body) return;
        if (nameEl) nameEl.textContent = role.name;

        if (role.isProtected) {
            if (actions) actions.style.display = 'none';
            if (notice) notice.style.display = 'block';
            body.innerHTML = (this.permissionsList || []).map(p => `
                <div class="perm-row">
                    <span>${p.resource} — ${p.action}</span>
                    <span class="perm-pill perm-pill-full">Full</span>
                </div>`).join('');
            return;
        }

        if (actions) actions.style.display = 'flex';
        if (notice) notice.style.display = 'none';

        const assigned = {};
        (role.permissions || role.rolePermissions || []).forEach(rp => {
            assigned[rp.permissionId ?? rp.permission?.id] = rp.accessLevel;
        });

        body.innerHTML = (this.permissionsList || []).map(p => {
            const level = assigned[p.id] || 'None';
            return `
            <div class="perm-row" data-permission-id="${p.id}">
                <span>${p.resource} — ${p.action}</span>
                <select class="perm-select">
                    <option value="Full" ${level === 'Full' ? 'selected' : ''}>Full</option>
                    <option value="View" ${level === 'View' ? 'selected' : ''}>View</option>
                    <option value="None" ${level === 'None' ? 'selected' : ''}>None</option>
                </select>
            </div>`;
        }).join('');
    },

    setAllPerms: function (level) {
        const value = level === 'full' ? 'Full' : level === 'view' ? 'View' : 'None';
        document.querySelectorAll('#perm-editor-body .perm-select').forEach(sel => sel.value = value);
    },

    savePermissions: async function () {
        if (this.selectedRoleId == null) return;
        const rows = document.querySelectorAll('#perm-editor-body .perm-row');
        try {
            for (const row of rows) {
                const permissionId = parseInt(row.getAttribute('data-permission-id'));
                const accessLevel = row.querySelector('.perm-select').value;
                await AdminAPI.rolePermissions.assignPermission(this.selectedRoleId, { permissionId, accessLevel });
            }
            this.roles = await AdminAPI.roles.getAll();
            this.populateRolesList();
            alert('Permissions saved successfully.');
        } catch (error) {
            console.error('Failed to save permissions:', error);
            alert('Failed to save permissions.');
        }
    },

    addRole: async function () {
        const name = document.getElementById('add-role-name')?.value.trim();
        const description = document.getElementById('add-role-desc')?.value.trim();
        if (!name) { alert('Please enter a role name.'); return; }
        try {
            await AdminAPI.roles.create({ name, description });
            this.roles = await AdminAPI.roles.getAll();
            this.populateRolesList();
            closeModal('addRole');
        } catch (error) {
            console.error('Failed to create role:', error);
            alert('Failed to create role.');
        }
    },

    openRenameRole: function (roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) return;
        document.getElementById('rename-role-input').value = role.name;
        document.getElementById('rename-role-desc').value = role.description || '';
        document.getElementById('rename-role-id').value = role.id;
        openModal('renameRole');
    },

    saveRoleRename: async function () {
        const id = parseInt(document.getElementById('rename-role-id').value);
        const name = document.getElementById('rename-role-input').value.trim();
        const description = document.getElementById('rename-role-desc').value.trim();
        if (!name) { alert('Please enter a role name.'); return; }
        try {
            await AdminAPI.roles.update(id, { name, description });
            this.roles = await AdminAPI.roles.getAll();
            this.populateRolesList();
            closeModal('renameRole');
        } catch (error) {
            console.error('Failed to rename role:', error);
            alert('Failed to rename role.');
        }
    },

    deleteRole: async function (roleId) {
        if (!confirm('Delete this role? Staff assigned to it will need to be reassigned.')) return;
        try {
            await AdminAPI.roles.delete(roleId);
            if (this.selectedRoleId === roleId) this.selectedRoleId = null;
            this.roles = await AdminAPI.roles.getAll();
            this.populateRolesList();
        } catch (error) {
            console.error('Failed to delete role:', error);
            alert('Failed to delete role.');
        }
    },

    // Populate audit log
    populateAuditLog: function () {
        const tbody = document.getElementById('audit-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.auditLogs.slice(0, 50).forEach(log => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            const row = `
                <tr>
                    <td class="mono">${timestamp}</td>
                    <td><strong>${log.adminUser?.name || 'Admin'}</strong></td>
                    <td><span class="tag tag-navy">${log.adminUser?.role?.name || 'Admin'}</span></td>
                    <td>${log.action}</td>
                    <td>${log.targetEntity}</td>
                    <td class="mono">${log.ipAddress}</td>
                    <td><span class="status-pill sp-approved">${log.outcome}</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    },

    // Setup event listeners
    setupEventListeners: function () {
        // Modal form submissions
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleExport(e));
        });

        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('mainBackupBtn')?.addEventListener('click', () => this.runBackup());
        document.getElementById('exportLogBtn')?.addEventListener('click', () => this.exportAuditLog());
    },

    // ── Staff Management Actions ──
    openEditStaff: async function (staffId) {
        try {
            const staff = await AdminAPI.staff.getById(staffId);
            document.getElementById('edit-staff-name').value = staff.name;
            document.getElementById('edit-staff-email').value = staff.email;
            document.getElementById('edit-staff-role').value = staff.role?.id || '';
            document.getElementById('edit-staff-status').value = staff.status;
            document.getElementById('edit-staff-row-ref').value = staffId;
            openModal('editStaff');
        } catch (error) {
            alert('Failed to load staff details');
        }
    },

    saveStaffEdit: async function () {
        try {
            const id = parseInt(document.getElementById('edit-staff-row-ref').value);
            const data = {
                id: id,
                name: document.getElementById('edit-staff-name').value,
                email: document.getElementById('edit-staff-email').value,
                roleId: parseInt(document.getElementById('edit-staff-role').value),
                status: document.getElementById('edit-staff-status').value,
            };

            await AdminAPI.staff.update(id, data);
            this.staffData = await AdminAPI.staff.getAll();
            this.populateStaffTable();
            closeModal('editStaff');
            alert('Staff member updated successfully');
        } catch (error) {
            alert('Failed to update staff member');
        }
    },

    removeStaff: async function (staffId) {
        if (!confirm('Are you sure you want to remove this staff member?')) return;

        try {
            await AdminAPI.staff.delete(staffId);
            this.staffData = await AdminAPI.staff.getAll();
            this.populateStaffTable();
            alert('Staff member removed successfully');
        } catch (error) {
            alert('Failed to remove staff member');
        }
    },

    // ── Invitation Actions ──
    sendInvite: async function () {
        try {
            const data = {
                fullName: document.getElementById('invite-name').value,
                emailAddress: document.getElementById('invite-email').value,
                roleId: parseInt(document.getElementById('invite-role').value || 2), // Default to Staff role
                invitedByAdminUserId: 1, // TODO: Get from current user
                personalMessage: document.getElementById('invite-msg').value,
            };

            if (!data.fullName || !data.emailAddress) {
                alert('Please fill in all required fields');
                return;
            }

            await AdminAPI.invitations.create(data);
            this.invitations = await AdminAPI.invitations.getAll();
            closeModal('inviteStaff');
            alert('Invitation sent successfully');

            // Clear form
            document.getElementById('invite-name').value = '';
            document.getElementById('invite-email').value = '';
            document.getElementById('invite-msg').value = '';
        } catch (error) {
            alert('Failed to send invitation');
        }
    },

    resendInvite: async function (btn) {
        try {
            const row = btn.closest('tr');
            const email = row.querySelector('td:nth-child(1)').textContent.trim();
            const invitation = this.invitations.find(inv => inv.emailAddress === email);

            if (!invitation) {
                alert('Invitation not found');
                return;
            }

            await AdminAPI.invitations.resend(invitation.id);
            alert('Invitation resent successfully');
        } catch (error) {
            alert('Failed to resend invitation');
        }
    },

    cancelInvite: async function (btn) {
        if (!confirm('Are you sure you want to cancel this invitation?')) return;

        try {
            const row = btn.closest('tr');
            const email = row.querySelector('td:nth-child(1)').textContent.trim();
            const invitation = this.invitations.find(inv => inv.emailAddress === email);

            if (!invitation) {
                alert('Invitation not found');
                return;
            }

            await AdminAPI.invitations.delete(invitation.id);
            this.invitations = await AdminAPI.invitations.getAll();
            location.reload(); // Refresh page to update table
        } catch (error) {
            alert('Failed to cancel invitation');
        }
    },

    // ── Settings Actions ──
    // ── Application Settings ──
    populateSettings: function () {
        const getVal = (key) => this.settings.find(s => s.settingKey === key)?.settingValue;
        const setInput = (id, key) => {
            const val = getVal(key);
            const el = document.getElementById(id);
            if (el && val !== undefined) el.value = val;
        };
        const setToggle = (id, key) => {
            const val = getVal(key);
            const el = document.getElementById(id);
            if (el && val !== undefined) el.checked = val === 'true' || val === true;
        };

        setInput('setting-village-name', 'village.name');
        setInput('setting-hoa-email', 'hoa.email');
        setInput('setting-hoa-phone', 'hoa.phone');
        setInput('setting-ad-fee', 'ad.fee');
        setInput('setting-dues-rate', 'dues.rate');
        setInput('setting-verification-mode', 'verification.mode');

        setToggle('setting-forum-enabled', 'feature.forum.enabled');
        setToggle('setting-marketplace-enabled', 'feature.marketplace.enabled');
        setToggle('setting-incidents-enabled', 'feature.incidents.enabled');
        setToggle('setting-reservations-enabled', 'feature.reservations.enabled');
        setToggle('setting-push-enabled', 'feature.push.enabled');
        setToggle('setting-maintenance-mode', 'security.maintenance-mode');
        setToggle('setting-2fa-required', 'security.2fa-required');
    },

    saveSettings: async function () {
        try {
            const settings = [
                { key: 'village.name', value: document.getElementById('setting-village-name')?.value },
                { key: 'hoa.email', value: document.getElementById('setting-hoa-email')?.value },
                { key: 'hoa.phone', value: document.getElementById('setting-hoa-phone')?.value },
                { key: 'ad.fee', value: document.getElementById('setting-ad-fee')?.value },
                { key: 'dues.rate', value: document.getElementById('setting-dues-rate')?.value },
                { key: 'verification.mode', value: document.getElementById('setting-verification-mode')?.value },
                { key: 'feature.forum.enabled', value: String(!!document.getElementById('setting-forum-enabled')?.checked), category: 'Features' },
                { key: 'feature.marketplace.enabled', value: String(!!document.getElementById('setting-marketplace-enabled')?.checked), category: 'Features' },
                { key: 'feature.incidents.enabled', value: String(!!document.getElementById('setting-incidents-enabled')?.checked), category: 'Features' },
                { key: 'feature.reservations.enabled', value: String(!!document.getElementById('setting-reservations-enabled')?.checked), category: 'Features' },
                { key: 'feature.push.enabled', value: String(!!document.getElementById('setting-push-enabled')?.checked), category: 'Features' },
                { key: 'security.maintenance-mode', value: String(!!document.getElementById('setting-maintenance-mode')?.checked), category: 'Security' },
                { key: 'security.2fa-required', value: String(!!document.getElementById('setting-2fa-required')?.checked), category: 'Security' },
            ];

            for (const setting of settings) {
                if (setting.value === undefined || setting.value === null) continue;
                const existing = this.settings.find(s => s.settingKey === setting.key);
                if (existing) {
                    await AdminAPI.settings.update(existing.id, {
                        id: existing.id,
                        settingKey: setting.key,
                        settingValue: setting.value,
                    });
                } else {
                    await AdminAPI.settings.create({
                        settingKey: setting.key,
                        settingValue: setting.value,
                        settingType: typeof setting.value === 'string' && (setting.value === 'true' || setting.value === 'false') ? 'Bool' : 'String',
                        category: setting.category || 'General',
                    });
                }
            }

            this.settings = await AdminAPI.settings.getAll();
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        }
    },

    // ── Export Actions ──
    handleExport: async function (e) {
        const btn = e.target.closest('.export-btn');
        const dataset = btn.dataset.dataset;
        const format = btn.dataset.format;

        const tbody = document.getElementById('recent-exports-tbody');
        if (tbody) {
            if (tbody.children.length === 1 && tbody.children[0].children.length === 1) {
                tbody.innerHTML = '';
            }
            const fileName = `${dataset.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()}`;
            const row = `<tr><td><strong>${fileName}</strong></td><td>Admin</td><td>${new Date().toLocaleString()}</td><td>—</td></tr>`;
            tbody.innerHTML = row + tbody.innerHTML;
        }

        alert(`Exporting ${dataset} as ${format}...`);
        // TODO: Implement actual export functionality
    },

    exportAuditLog: function () {
        alert('Exporting audit log...');
        // TODO: Implement CSV export
    },

    // ── Page Navigation ──
    showPage: function (pageName, element) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const page = document.getElementById(`page-${pageName}`);
        if (page) {
            page.classList.add('active');
        }

        // Update nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        element?.classList.add('active');

        // Update breadcrumb and title
        document.getElementById('breadcrumb-label').textContent = this.getTitleForPage(pageName);
        document.getElementById('topbar-title').textContent = this.getTitleForPage(pageName);

        if (pageName === 'integrations') this.loadSubscriberStats();
        if (pageName === 'backups') this.loadBackups();

        this.currentPage = pageName;
    },

    loadSubscriberStats: async function () {
        try {
            const result = await AdminAPI.subscribers.getStats();
            if (result.success && result.data) {
                const s = result.data;
                const elCount = document.getElementById('int-subscriber-count');
                const elActive = document.getElementById('int-active-count');
                const elSent = document.getElementById('int-sent-count');
                if (elCount) elCount.textContent = s.totalSubscribers;
                if (elActive) elActive.textContent = s.activeSubscribers;
                if (elSent) elSent.textContent = s.notificationsSent;
            }
        } catch (error) {
            console.error('Failed to load subscriber stats:', error);
        }
    },

    getTitleForPage: function (pageName) {
        const titles = {
            'overview': 'Admin Overview',
            'auditlog': 'Audit Log',
            'staffaccounts': 'Staff Account Management',
            'roles': 'Roles & Permissions',
            'allresidents': 'Residents & Banned',
            'appsettings': 'Application Settings',
            'wordbank': 'Word Bank Configuration',
            'integrations': 'Third-Party Integrations',
            'dataexport': 'Data Export',
            'backups': 'Backup Management',
        };
        return titles[pageName] || 'Admin Panel';
    },
};

// ────────────────────────────────────────────────────────────
// Modal Helper Functions (Legacy UI support)
// ────────────────────────────────────────────────────────────

function openModal(modalName) {
    const modalElement = document.getElementById(`modal-${modalName}`);
    if (modalElement) {
        modalElement.style.display = 'flex';
    }
}

function closeModal(modalName) {
    const modalElement = document.getElementById(`modal-${modalName}`);
    if (modalElement) {
        modalElement.style.display = 'none';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

async function testNotification() {
    try {
        const result = await AdminAPI.subscribers.getStats();
        const active = result.success ? result.data.activeSubscribers : 0;
        alert(`Test notification queued for ${active} active subscriber(s).`);
    } catch (error) {
        console.error('Failed to send test notification:', error);
        alert('Failed to send test notification.');
    }
}

function saveIntegration() {
    closeModal('manageNotifIntegration');
    alert('Integration configuration saved.');
}


function toggleNotifDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function closeNotifDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

function dismissAlert(alertId, event) {
    event.stopPropagation();
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.remove();
    }
}

function dismissAllAlerts() {
    document.querySelectorAll('.notif-item').forEach(item => {
        item.remove();
    });
}

// Filter functions
function filterResidents(status, element) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');

    const tbody = document.getElementById('residents-tbody');
    if (!tbody) return;

    if (status === 'all') {
        document.querySelectorAll(`#residents-tbody tr`).forEach(row => {
            row.style.display = '';
        });
    } else {
        document.querySelectorAll(`#residents-tbody tr`).forEach(row => {
            const statusAttr = row.getAttribute('data-status');
            row.style.display = statusAttr === status ? '' : 'none';
        });
    }
}

function filterKeywords(severity, element) {
    document.querySelectorAll('#wb-chips .chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');

    if (severity === 'all') {
        document.querySelectorAll(`#wordbank-tbody tr`).forEach(row => {
            row.style.display = '';
        });
    } else {
        document.querySelectorAll(`#wordbank-tbody tr`).forEach(row => {
            const severityAttr = (row.getAttribute('data-severity') || '').toLowerCase();
            row.style.display = severityAttr === severity.toLowerCase() ? '' : 'none';
        });
    }
}

// Navigation function
function showPage(page, navElement) {
    // Update current page
    AdminDashboard.currentPage = page;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (navElement && navElement.classList) {
        navElement.classList.add('active');
    }

    // Update topbar title
    const titles = {
        'overview': 'Admin Overview',
        'auditlog': 'Audit Log',
        'staffaccounts': 'Staff Accounts',
        'roles': 'Roles & Permissions',
        'allresidents': 'Residents & Banned',
        'appsettings': 'App Settings',
        'wordbank': 'Word Bank Config',
        'integrations': 'Integrations',
        'dataexport': 'Data Export',
        'backups': 'Backups'
    };
    const titleEl = document.getElementById('topbar-title');
    const breadcrumbEl = document.getElementById('breadcrumb-label');
    if (titleEl) titleEl.textContent = titles[page] || 'Admin Panel';
    if (breadcrumbEl) breadcrumbEl.textContent = titles[page] || 'Admin Panel';
}

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// Residents page helper functions (legacy onclick support)
function exportResidents() {
    alert('Resident export is not yet implemented on the backend.');
}
function addResident() {
    alert('Adding residents manually is not yet supported. Residents self-register via the registration flow.');
    closeModal('addResident');
}
function editResident() {
    alert('Resident editing is not yet supported from the admin panel.');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();

    // Wire up main backup button
    const backupBtn = document.getElementById('mainBackupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', () => AdminDashboard.runManualBackup());
    }

    // Wire up export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const dataset = this.getAttribute('data-dataset');
            const format = this.getAttribute('data-format');

            if (!dataset || !format) return;

            const datasetMap = {
                'Resident Directory': 'residents',
                'Incident Reports': 'incidents',
                'Audit Log': 'auditlog',
                'Staff Activity': 'staff'
            };

            const datasetKey = datasetMap[dataset] || dataset.toLowerCase();
            const exportFormat = format === 'ALL' ? 'CSV' : format;

            try {
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
                this.disabled = true;

                // Download file
                const response = await fetch(`/api/admin/export/${datasetKey}?format=${exportFormat}`);
                if (!response.ok) throw new Error('Export failed');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${datasetKey}_${new Date().toISOString().split('T')[0]}.${exportFormat.toLowerCase()}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Add to recent exports table
                const tbody = document.getElementById('recent-exports-tbody');
                if (tbody) {
                    if (tbody.querySelector('td[colspan]')) {
                        tbody.innerHTML = '';
                    }
                    const row = tbody.insertRow(0);
                    row.innerHTML = `
                        <td><i class="fas fa-file-csv"></i> ${dataset}.${exportFormat.toLowerCase()}</td>
                        <td>Current Admin</td>
                        <td>${new Date().toLocaleString()}</td>
                        <td>${(blob.size / 1024).toFixed(1)} KB</td>
                    `;
                }

                // Restore button
                this.innerHTML = originalText;
                this.disabled = false;
            } catch (error) {
                console.error('Export failed:', error);
                alert('Failed to export data. Please try again.');
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    });
});
