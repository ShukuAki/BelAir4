/* ═══════════════════════════════════════════════════════════
   USER DASHBOARD SCRIPT
   ═══════════════════════════════════════════════════════════ */

// Global state
const UserDashboard = {
    currentPage: 'overview',
    data: {
        stats: null,
        posts: [],
        reports: [],
        reservations: [],
        advertisements: [],
        vehicles: [],
        pets: [],
        profile: null
    }
};

// API Helper
async function apiRequest(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        const statsResponse = await apiRequest('/api/user/stats');
        if (statsResponse.success) {
            UserDashboard.data.stats = statsResponse;
            updateStatsCards(statsResponse);
            updateSummary(statsResponse);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard statistics');
    }
}

// Update stats cards
function updateStatsCards(stats) {
    document.getElementById('stat-posts').textContent = stats.totalPosts || 0;
    document.getElementById('stat-reports').textContent = stats.totalReports || 0;
    document.getElementById('stat-reservations').textContent = stats.pendingReservations || 0;
    document.getElementById('stat-ads').textContent = stats.activeAds || 0;
    document.getElementById('stat-vehicles').textContent = stats.totalVehicles || 0;
    document.getElementById('stat-pets').textContent = stats.totalPets || 0;
}

// Update summary section
function updateSummary(stats) {
    const summaryContent = document.getElementById('summaryContent');

    const statusBadge = getStatusBadge(stats.registrationStatus);

    summaryContent.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            <div>
                <h4 style="margin: 0 0 0.5rem; color: var(--user-text);">Registration Status</h4>
                <span class="user-badge ${statusBadge.class}">${stats.registrationStatus || 'Unknown'}</span>
            </div>
            <div>
                <h4 style="margin: 0 0 0.5rem; color: var(--user-text);">Community Activity</h4>
                <p style="margin: 0; color: var(--user-text-light);">
                    You have <strong>${stats.totalPosts || 0}</strong> forum posts and 
                    <strong>${stats.totalReports || 0}</strong> reports filed.
                </p>
            </div>
            <div>
                <h4 style="margin: 0 0 0.5rem; color: var(--user-text);">Registrations</h4>
                <p style="margin: 0; color: var(--user-text-light);">
                    <strong>${stats.totalVehicles || 0}</strong> vehicles and 
                    <strong>${stats.totalPets || 0}</strong> pets registered.
                </p>
            </div>
        </div>
    `;
}

// Get status badge class
function getStatusBadge(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'approved') return { class: 'success', text: 'Approved' };
    if (statusLower === 'pending') return { class: 'warning', text: 'Pending' };
    if (statusLower === 'rejected') return { class: 'danger', text: 'Rejected' };
    return { class: 'info', text: status || 'Unknown' };
}

// Load posts
async function loadPosts() {
    try {
        const response = await apiRequest('/api/user/posts');
        if (response.success) {
            UserDashboard.data.posts = response.data || [];
            renderPosts(UserDashboard.data.posts);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('postsContent').innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Posts</h3>
                <p>Failed to load your forum posts. Please try again later.</p>
            </div>
        `;
    }
}

// Render posts
function renderPosts(posts) {
    const container = document.getElementById('postsContent');

    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-comments"></i>
                <h3>No Posts Yet</h3>
                <p>You haven't created any forum posts yet.</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Replies</th>
                    <th>Created</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${posts.map(post => `
                    <tr>
                        <td><strong>${escapeHtml(post.title || 'Untitled')}</strong></td>
                        <td>${escapeHtml(post.category || 'General')}</td>
                        <td><span class="user-badge ${getPriorityBadge(post.priority)}">${escapeHtml(post.priority || 'Normal')}</span></td>
                        <td>${post.replyCount || 0}</td>
                        <td>${formatDate(post.createdAt)}</td>
                        <td><span class="user-badge ${post.isClosed ? 'danger' : 'success'}">${post.isClosed ? 'Closed' : 'Open'}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Get priority badge
function getPriorityBadge(priority) {
    const p = (priority || '').toLowerCase();
    if (p === 'urgent') return 'danger';
    if (p === 'high') return 'warning';
    if (p === 'low') return 'info';
    return 'success';
}

// Load reports
async function loadReports() {
    try {
        const response = await apiRequest('/api/user/reports');
        if (response.success) {
            UserDashboard.data.reports = response.data || [];
            renderReports(UserDashboard.data.reports);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('reportsContent').innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Reports</h3>
                <p>Failed to load your reports. Please try again later.</p>
            </div>
        `;
    }
}

// Render reports
function renderReports(reports) {
    const container = document.getElementById('reportsContent');

    if (!reports || reports.length === 0) {
        container.innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>No Reports Filed</h3>
                <p>You haven't filed any concern reports yet.</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Report Type</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Submitted</th>
                </tr>
            </thead>
            <tbody>
                ${reports.map(report => `
                    <tr>
                        <td><strong>${escapeHtml(report.reportType || 'General')}</strong></td>
                        <td>${escapeHtml((report.description || '').substring(0, 60))}${report.description && report.description.length > 60 ? '...' : ''}</td>
                        <td>${escapeHtml(report.location || 'N/A')}</td>
                        <td><span class="user-badge ${getReportStatusBadge(report.status)}">${escapeHtml(report.status || 'Pending')}</span></td>
                        <td>${formatDate(report.timestamp)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Get report status badge
function getReportStatusBadge(status) {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return 'success';
    if (s === 'in progress') return 'warning';
    if (s === 'pending') return 'info';
    return 'info';
}

// Load reservations
async function loadReservations() {
    try {
        const response = await apiRequest('/api/user/reservations');
        if (response.success) {
            UserDashboard.data.reservations = response.data || [];
            renderReservations(UserDashboard.data.reservations);
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
        document.getElementById('reservationsContent').innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Reservations</h3>
                <p>Failed to load your reservations. Please try again later.</p>
            </div>
        `;
    }
}

// Render reservations
function renderReservations(reservations) {
    const container = document.getElementById('reservationsContent');

    if (!reservations || reservations.length === 0) {
        container.innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3>No Reservations</h3>
                <p>You haven't made any facility reservations yet.</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Facility</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map(res => `
                    <tr>
                        <td><strong>${escapeHtml(res.facility || 'N/A')}</strong></td>
                        <td>${formatDate(res.date)}</td>
                        <td>${escapeHtml(res.time || 'N/A')}</td>
                        <td>${escapeHtml((res.purpose || '').substring(0, 40))}${res.purpose && res.purpose.length > 40 ? '...' : ''}</td>
                        <td><span class="user-badge ${getReservationStatusBadge(res.status)}">${escapeHtml(res.status || 'Pending')}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Get reservation status badge
function getReservationStatusBadge(status) {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'rejected') return 'danger';
    return 'info';
}

// Load advertisements
async function loadAdvertisements() {
    try {
        const response = await apiRequest('/api/user/advertisements');
        if (response.success) {
            UserDashboard.data.advertisements = response.data || [];
            renderAdvertisements(UserDashboard.data.advertisements);
        }
    } catch (error) {
        console.error('Error loading advertisements:', error);
        document.getElementById('advertisementsContent').innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Ads</h3>
                <p>Failed to load your advertisements. Please try again later.</p>
            </div>
        `;
    }
}

// Render advertisements
function renderAdvertisements(ads) {
    const container = document.getElementById('advertisementsContent');

    if (!ads || ads.length === 0) {
        container.innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-bullhorn"></i>
                <h3>No Advertisements</h3>
                <p>You haven't posted any advertisements yet.</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Posted</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${ads.map(ad => `
                    <tr>
                        <td><strong>${escapeHtml(ad.title || 'Untitled')}</strong></td>
                        <td>${escapeHtml(ad.type || 'General')}</td>
                        <td>${ad.price ? '₱' + ad.price : 'N/A'}</td>
                        <td>${formatDate(ad.createdAt)}</td>
                        <td><span class="user-badge ${getAdStatusBadge(ad.status)}">${escapeHtml(ad.status || 'Pending')}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Get ad status badge
function getAdStatusBadge(status) {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'rejected') return 'danger';
    return 'info';
}

// Load vehicles
async function loadVehicles() {
    try {
        const response = await apiRequest('/api/user/vehicles');
        if (response.success) {
            UserDashboard.data.vehicles = response.data || [];
            renderVehicles(UserDashboard.data.vehicles);
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        document.getElementById('vehiclesContent').innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Vehicles</h3>
                <p>Failed to load your vehicles. Please try again later.</p>
            </div>
        `;
    }
}

// Render vehicles
function renderVehicles(vehicles) {
    const container = document.getElementById('vehiclesContent');

    if (!vehicles || vehicles.length === 0) {
        container.innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-car"></i>
                <h3>No Vehicles Registered</h3>
                <p>You haven't registered any vehicles yet.</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Make/Model</th>
                    <th>Plate Number</th>
                    <th>Color</th>
                    <th>Type</th>
                    <th>Registered</th>
                </tr>
            </thead>
            <tbody>
                ${vehicles.map(vehicle => `
                    <tr>
                        <td><strong>${escapeHtml(vehicle.make || '')} ${escapeHtml(vehicle.model || '')}</strong></td>
                        <td>${escapeHtml(vehicle.plateNumber || 'N/A')}</td>
                        <td>${escapeHtml(vehicle.color || 'N/A')}</td>
                        <td>${escapeHtml(vehicle.vehicleType || 'N/A')}</td>
                        <td>${formatDate(vehicle.registeredAt)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Load pets
async function loadPets() {
    try {
        const response = await apiRequest('/api/user/pets');
        if (response.success) {
            UserDashboard.data.pets = response.data || [];
            renderPets(UserDashboard.data.pets);
        }
    } catch (error) {
        console.error('Error loading pets:', error);
        document.getElementById('petsContent').innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Pets</h3>
                <p>Failed to load your pets. Please try again later.</p>
            </div>
        `;
    }
}

// Render pets
function renderPets(pets) {
    const container = document.getElementById('petsContent');

    if (!pets || pets.length === 0) {
        container.innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-paw"></i>
                <h3>No Pets Registered</h3>
                <p>You haven't registered any pets yet.</p>
            </div>
        `;
        return;
    }

    const table = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Breed</th>
                    <th>Age</th>
                    <th>Registered</th>
                </tr>
            </thead>
            <tbody>
                ${pets.map(pet => `
                    <tr>
                        <td><strong>${escapeHtml(pet.name || 'Unnamed')}</strong></td>
                        <td>${escapeHtml(pet.petType || 'N/A')}</td>
                        <td>${escapeHtml(pet.breed || 'N/A')}</td>
                        <td>${pet.age ? pet.age + ' years' : 'N/A'}</td>
                        <td>${formatDate(pet.registeredAt)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Load profile
async function loadProfile() {
    try {
        const response = await apiRequest('/api/user/profile');
        if (response.success) {
            UserDashboard.data.profile = response;
            renderProfile(response);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileContent').innerHTML = `
            <div class="user-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Profile</h3>
                <p>Failed to load your profile. Please try again later.</p>
            </div>
        `;
    }
}

// Render profile
function renderProfile(data) {
    const container = document.getElementById('profileContent');

    const initials = (data.username || 'U').substring(0, 2).toUpperCase();
    const isBanned = data.isBanned;
    const registration = data.registration;

    let profileHTML = `
        <div class="user-profile-card">
            <div class="user-profile-header">
                <div class="user-profile-avatar">${initials}</div>
                <div class="user-profile-info">
                    <h2>${escapeHtml(data.username || 'User')}</h2>
                    <p>${registration ? escapeHtml(registration.email || '') : 'No email on file'}</p>
                </div>
            </div>
    `;

    if (isBanned) {
        profileHTML += `
            <div style="background: rgba(245, 101, 101, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <strong style="color: var(--user-danger);">⚠ Account Status: Banned</strong>
                <p style="margin: 0.5rem 0 0; opacity: 0.9;">
                    Reason: ${escapeHtml(data.banReason || 'No reason provided')}<br>
                    ${data.bannedUntil ? 'Until: ' + formatDate(data.bannedUntil) : 'Permanent ban'}
                </p>
            </div>
        `;
    }

    profileHTML += `</div>`;

    if (registration) {
        profileHTML += `
            <div class="user-content-card">
                <div class="user-content-card-header">
                    <h3 class="user-content-card-title">Registration Details</h3>
                </div>
                <table class="user-table">
                    <tbody>
                        <tr>
                            <td><strong>Full Name</strong></td>
                            <td>${escapeHtml(registration.fullName || 'N/A')}</td>
                        </tr>
                        <tr>
                            <td><strong>Email</strong></td>
                            <td>${escapeHtml(registration.email || 'N/A')}</td>
                        </tr>
                        <tr>
                            <td><strong>Mobile</strong></td>
                            <td>${escapeHtml(registration.mobile || 'N/A')}</td>
                        </tr>
                        <tr>
                            <td><strong>Address</strong></td>
                            <td>${escapeHtml(registration.address || 'N/A')}</td>
                        </tr>
                        <tr>
                            <td><strong>Resident Type</strong></td>
                            <td>${escapeHtml(registration.residentType || 'N/A')}</td>
                        </tr>
                        <tr>
                            <td><strong>Status</strong></td>
                            <td><span class="user-badge ${getStatusBadge(registration.status).class}">${escapeHtml(registration.status || 'Unknown')}</span></td>
                        </tr>
                        <tr>
                            <td><strong>Submitted</strong></td>
                            <td>${formatDate(registration.submittedAt)}</td>
                        </tr>
                        ${registration.reviewedAt ? `
                            <tr>
                                <td><strong>Reviewed</strong></td>
                                <td>${formatDate(registration.reviewedAt)} by ${escapeHtml(registration.reviewedBy || 'N/A')}</td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        profileHTML += `
            <div class="user-content-card">
                <div class="user-empty-state">
                    <i class="fas fa-user-times"></i>
                    <h3>No Registration Found</h3>
                    <p>You don't have a registration record on file.</p>
                </div>
            </div>
        `;
    }

    container.innerHTML = profileHTML;
}

// Page Navigation
function showPage(pageName) {
    // Update active nav item
    document.querySelectorAll('.user-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });

    // Show correct page
    document.querySelectorAll('.user-page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    UserDashboard.currentPage = pageName;

    // Load data if needed
    switch(pageName) {
        case 'posts':
            if (UserDashboard.data.posts.length === 0) loadPosts();
            break;
        case 'reports':
            if (UserDashboard.data.reports.length === 0) loadReports();
            break;
        case 'reservations':
            if (UserDashboard.data.reservations.length === 0) loadReservations();
            break;
        case 'advertisements':
            if (UserDashboard.data.advertisements.length === 0) loadAdvertisements();
            break;
        case 'vehicles':
            if (UserDashboard.data.vehicles.length === 0) loadVehicles();
            break;
        case 'pets':
            if (UserDashboard.data.pets.length === 0) loadPets();
            break;
        case 'profile':
            if (!UserDashboard.data.profile) loadProfile();
            break;
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('userSidebar');
    const mainContent = document.getElementById('mainContent');

    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('expanded');
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function showError(message) {
    console.error(message);
    // You can implement a toast/notification system here
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadDashboardData();

    // Navigation
    document.querySelectorAll('.user-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            if (page) showPage(page);
        });
    });

    // Toggle sidebar
    document.getElementById('toggleSidebar')?.addEventListener('click', toggleSidebar);

    // Mobile: close sidebar when clicking outside
    if (window.innerWidth <= 768) {
        document.getElementById('mainContent')?.addEventListener('click', () => {
            const sidebar = document.getElementById('userSidebar');
            if (sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
    }
});
