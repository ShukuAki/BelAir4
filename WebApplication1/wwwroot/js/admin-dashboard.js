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
};

// ────────────────────────────────────────────────────────────
// Admin Dashboard UI Manager
// ────────────────────────────────────────────────────────────

const AdminDashboard = {
    currentPage: 'overview',
    staffData: [],
    auditLogs: [],
    roles: [],
    invitations: [],
    settings: [],
    residents: [],

    // Initialize dashboard
    init: async function () {
        console.log('Initializing Admin Dashboard...');
        await this.loadInitialData();
        this.setupEventListeners();
    },

    // Load all initial data
    loadInitialData: async function () {
        try {
            // Load staff, audit logs, roles, invitations, settings
            this.staffData = await AdminAPI.staff.getAll();
            this.auditLogs = await AdminAPI.auditLog.getAll();
            this.roles = await AdminAPI.roles.getAll();
            this.invitations = await AdminAPI.invitations.getAll();
            this.settings = await AdminAPI.settings.getAll();

            this.updateOverviewStats();
            this.populateStaffTable();
            this.populateAuditLog();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            alert('Failed to load dashboard data. Please refresh the page.');
        }
    },

    // Update overview statistics
    updateOverviewStats: function () {
        document.getElementById('stat-staff-count').textContent = this.staffData.length;
        document.getElementById('stat-total-residents').textContent = this.residents.length || 347;
        document.getElementById('overview-alert-count').textContent = this.auditLogs.length > 0 ? 3 : 0;
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
    saveSettings: async function () {
        try {
            const settings = [
                { key: 'village.name', value: document.getElementById('setting-village-name')?.value },
                { key: 'hoa.email', value: document.getElementById('setting-hoa-email')?.value },
                { key: 'hoa.phone', value: document.getElementById('setting-hoa-phone')?.value },
                { key: 'ad.fee', value: document.getElementById('setting-ad-fee')?.value },
                { key: 'dues.rate', value: document.getElementById('setting-dues-rate')?.value },
            ];

            for (const setting of settings) {
                if (setting.value) {
                    const existing = this.settings.find(s => s.settingKey === setting.key);
                    if (existing) {
                        await AdminAPI.settings.update(existing.id, {
                            id: existing.id,
                            settingKey: setting.key,
                            settingValue: setting.value,
                        });
                    }
                }
            }

            alert('Settings saved successfully');
        } catch (error) {
            alert('Failed to save settings');
        }
    },

    // ── Backup Actions ──
    runBackup: async function () {
        try {
            const backup = {
                backupId: 'BKP-' + new Date().getTime(),
                backupType: 'Manual',
                filePath: '/backups/manual-backup-' + new Date().getTime() + '.bak',
                fileSizeBytes: 0,
                status: 'Running',
                createdByAdminUserId: 1, // TODO: Get current user
            };

            await AdminAPI.backups.create(backup);
            alert('Backup started');
        } catch (error) {
            alert('Failed to start backup');
        }
    },

    // ── Export Actions ──
    handleExport: async function (e) {
        const dataset = e.target.closest('.export-btn').dataset.dataset;
        const format = e.target.closest('.export-btn').dataset.format;

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

        this.currentPage = pageName;
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
            const severityAttr = row.getAttribute('data-severity');
            row.style.display = severityAttr === severity ? '' : 'none';
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});
