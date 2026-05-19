/* ========================================
Vehicle & Pet Registration System
Laguna BelAir 4 - Village Website
Updated to work with new header/hero design
======================================== */

// Sample data (simulating database)
let registeredVehicles = [];
let registeredPets = [];

// Auto-filled owner info (from session/login) — no fallback defaults
const ownerInfo = (window.initialOwnerInfo && window.initialOwnerInfo.name)
    ? window.initialOwnerInfo
    : { name: "", address: "" };

// Note: query DOM elements when needed (after DOMContentLoaded) to avoid empty NodeLists
let tabBtns, tabContents, vehicleCategory, guestFields;

// Store pet photo data
let petPhotoData = null;

// ========================================
// INITIALIZATION
// ========================================
async function initRegistrationPage() {
    // Set owner info
    const ownerNameEl = document.getElementById('ownerName');
    const ownerAddressEl = document.getElementById('ownerAddress');
    if (ownerNameEl) ownerNameEl.textContent = ownerInfo.name;
    if (ownerAddressEl) ownerAddressEl.textContent = ownerInfo.address;

    // Set current year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Query DOM elements now that DOM is ready
    tabBtns = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    vehicleCategory = document.getElementById('vehicleCategory');
    guestFields = document.getElementById('guestFields');

    // Setup event listeners (elements are present now)
    setupTabNavigation();
    setupGuestVehicleToggle();
    setupFormSubmissions();
    setupFileUploads();

    // Load registered items from server, fall back to sample data
    await Promise.all([loadVehiclesFromServer(), loadPetsFromServer()]);
    if (registeredVehicles.length === 0) loadSampleData();
    renderVehiclesList();
    renderPetsList();
}

// If DOM already ready, run init immediately, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegistrationPage);
} else {
    initRegistrationPage();
}

// Load sample data for demonstration
function loadSampleData() {
    // Only load if empty
    if (registeredVehicles.length === 0) {
        registeredVehicles.push({
            id: Date.now() + 1,
            type: "sedan",
            category: "owner",
            plateNumber: "ABC 1234",
            color: "Silver",
            brand: "Toyota",
            model: "Vios",
            year: "2022",
            vin: "",
            notes: "",
            guestName: "",
            guestContact: "",
            guestDuration: "",
            guestDurationType: "hours",
            ownerName: ownerInfo.name,
            registeredDate: new Date().toLocaleDateString()
        });
        renderVehiclesList();
    }

// Load from server
async function loadVehiclesFromServer() {
    try {
        const res = await fetch('/api/registrations/vehicles', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Network');
        const data = await res.json();
        registeredVehicles = (data || []).map(adaptVehicle);
    } catch (e) {
        console.warn('Could not load vehicles from server.', e);
    }
}

async function loadPetsFromServer() {
    try {
        const res = await fetch('/api/registrations/pets', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Network');
        const data = await res.json();
        registeredPets = (data || []).map(adaptPet);
    } catch (e) {
        console.warn('Could not load pets from server.', e);
    }
}

function adaptVehicle(s) {
    return {
        id: s.id || s.Id,
        type: s.type || s.Type || '',
        category: s.category || s.Category || '',
        plateNumber: s.plateNumber || s.PlateNumber || '',
        color: s.color || s.Color || '',
        brand: s.brand || s.Brand || '',
        model: s.model || s.Model || '',
        year: s.year || s.Year || '',
        vin: s.vin || s.Vin || '',
        notes: s.notes || s.Notes || '',
        guestName: s.guestName || s.GuestName || '',
        guestContact: s.guestContact || s.GuestContact || '',
        guestDuration: s.guestDuration || s.GuestDuration || '',
        guestDurationType: s.guestDurationType || s.GuestDurationType || 'hours',
        ownerName: s.ownerName || s.OwnerName || '',
        registeredDate: s.registeredDate || s.RegisteredDate || ''
    };


function adaptPet(s) {
    return {
        id: s.id || s.Id,
        type: s.type || s.Type || '',
        breed: s.breed || s.Breed || '',
        name: s.name || s.Name || '',
        color: s.color || s.Color || '',
        age: s.age || s.Age || '',
        gender: s.gender || s.Gender || '',
        vaccinated: s.vaccinated || s.Vaccinated || '',
        microchip: s.microchip || s.Microchip || '',
        neutered: s.neutered || s.Neutered || '',
        temperament: s.temperament || s.Temperament || '',
        notes: s.notes || s.Notes || '',
        photo: s.photo || s.Photo || '',
        ownerName: s.ownerName || s.OwnerName || '',
        registeredDate: s.registeredDate || s.RegisteredDate || ''
    };


// ========================================
// MOBILE DROPDOWN TOGGLE SUPPORT (added)
// ========================================
function setupMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = dropdown.classList.contains('dropdown-open');
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('dropdown-open'));
            if (!isOpen) dropdown.classList.add('dropdown-open');
        });
    });

    document.addEventListener('click', (e) => {
        dropdowns.forEach(d => {
            if (!d.contains(e.target)) d.classList.remove('dropdown-open');
        });
    });
}

// Call after DOM load
document.addEventListener('DOMContentLoaded', setupMobileDropdowns);

// ========================================
// TAB NAVIGATION - SIMPLE & WORKING
// ========================================
function setupTabNavigation() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchToTab(tabId);
        });
    });
}

function switchToTab(tabId) {
    // Update buttons
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        }
    });
    
    // Hide success messages when switching tabs
    document.querySelectorAll('.success-message').forEach(msg => {
        msg.classList.remove('show');
    });
    
    // Show submit buttons again
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.style.display = 'flex';
    });
    
    // Refresh lists if viewing
    if (tabId === 'view') {
        renderVehiclesList();
        renderPetsList();
    }
}

// Make switchToTab available globally
window.switchToTab = switchToTab;

// ========================================
// GUEST VEHICLE TOGGLE
// ========================================
function setupGuestVehicleToggle() {
    if (!vehicleCategory) return;
    vehicleCategory.addEventListener('change', (e) => {
        if (e.target.value === 'guest') {
            guestFields.classList.add('show');
            const guestNameInput = document.getElementById('guestName');
            const guestContactInput = document.getElementById('guestContact');
            if (guestNameInput) guestNameInput.required = true;
            if (guestContactInput) guestContactInput.required = true;
        } else {
            guestFields.classList.remove('show');
            const guestInputs = guestFields.querySelectorAll('input');
            guestInputs.forEach(input => {
                input.required = false;
                input.value = '';
            });
        }
    });
}

// ========================================
// FILE UPLOADS - STORE ACTUAL IMAGE DATA
// ========================================
function setupFileUploads() {
    const petPhotoInput = document.getElementById('petPhoto');
    const petFileNameDisplay = document.getElementById('petFileNameDisplay');
    const petPhotoPreview = document.getElementById('petPhotoPreview');
    
    if (!petPhotoInput) return;
    
    petPhotoInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            const fileName = file.name;
            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            if (petFileNameDisplay) {
                petFileNameDisplay.innerHTML = `<i class="fas fa-file-image"></i> ${fileName} (${fileSize} MB)`;
            }
            
            // Read and store the actual image data
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    petPhotoData = e.target.result; // Store base64 data
                    if (petPhotoPreview) {
                        petPhotoPreview.innerHTML = `<img src="${petPhotoData}" alt="Pet photo preview">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        } else {
            petPhotoData = null;
            if (petFileNameDisplay) petFileNameDisplay.innerHTML = '';
            if (petPhotoPreview) petPhotoPreview.innerHTML = '';
        }
    });
}

// ========================================
// FORM SUBMISSIONS
// ========================================
function setupFormSubmissions() {
    // Vehicle Form
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const vehicleData = {
                id: Date.now(),
                type: document.getElementById('vehicleType')?.value || '',
                category: document.getElementById('vehicleCategory')?.value || '',
                plateNumber: document.getElementById('plateNumber')?.value || '',
                color: document.getElementById('vehicleColor')?.value || '',
                brand: document.getElementById('vehicleBrand')?.value || '',
                model: document.getElementById('vehicleModel')?.value || '',
                year: document.getElementById('vehicleYear')?.value || '',
                vin: document.getElementById('vehicleVIN')?.value || '',
                notes: document.getElementById('vehicleNotes')?.value || '',
                guestName: document.getElementById('guestName')?.value || '',
                guestContact: document.getElementById('guestContact')?.value || '',
                guestDuration: document.getElementById('guestDuration')?.value || '',
                guestDurationType: document.getElementById('guestDurationType')?.value || 'hours',
                ownerName: ownerInfo.name,
                registeredDate: new Date().toLocaleDateString()
            };
            
            registeredVehicles.push(vehicleData);
            // Post to server
            fetch('/api/registrations/vehicles', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: vehicleData.type,
                    category: vehicleData.category,
                    plateNumber: vehicleData.plateNumber,
                    color: vehicleData.color,
                    brand: vehicleData.brand,
                    model: vehicleData.model,
                    year: vehicleData.year,
                    vin: vehicleData.vin,
                    notes: vehicleData.notes,
                    guestName: vehicleData.guestName,
                    guestContact: vehicleData.guestContact,
                    guestDuration: vehicleData.guestDuration,
                    guestDurationType: vehicleData.guestDurationType,
                    ownerName: vehicleData.ownerName,
                    registeredDate: vehicleData.registeredDate
                })
            }).then(async res => {
                if (!res.ok) {
                    console.error('Vehicle save failed', res.status);
                    showNotification('Failed to save vehicle to server', 'error');
                    return;
                }
                const created = await res.json();
                // replace local temp entry id with server id
                const idx = registeredVehicles.findIndex(v => v.id === vehicleData.id);
                if (idx !== -1) registeredVehicles[idx].id = created.id;
            }).catch(err => console.error('Save vehicle exception', err));
            
            // Show success message
            const vehicleSuccess = document.getElementById('vehicleSuccess');
            const vehicleSubmitBtn = document.querySelector('#vehicle-tab .submit-btn');
            if (vehicleSuccess) vehicleSuccess.classList.add('show');
            if (vehicleSubmitBtn) vehicleSubmitBtn.style.display = 'none';
            
            // Reset form after delay
            setTimeout(() => {
                vehicleForm.reset();
                if (vehicleSuccess) vehicleSuccess.classList.remove('show');
                if (vehicleSubmitBtn) vehicleSubmitBtn.style.display = 'flex';
                if (guestFields) guestFields.classList.remove('show');
            }, 3000);
            
            // Update list
            renderVehiclesList();
            
            // Show notification
            showNotification('Vehicle registered successfully!', 'success');
        });
    }
    
    // Pet Form
    const petForm = document.getElementById('petForm');
    if (petForm) {
        petForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const petData = {
                id: Date.now(),
                type: document.getElementById('petType')?.value || '',
                breed: document.getElementById('petBreed')?.value || '',
                name: document.getElementById('petName')?.value || '',
                color: document.getElementById('petColor')?.value || '',
                age: document.getElementById('petAge')?.value || '',
                gender: document.getElementById('petGender')?.value || '',
                vaccinated: document.getElementById('petVaccinated')?.value || '',
                microchip: document.getElementById('petMicrochip')?.value || '',
                neutered: document.getElementById('petNeutered')?.value || '',
                temperament: document.getElementById('petTemperament')?.value || '',
                notes: document.getElementById('petNotes')?.value || '',
                photo: petPhotoData,
                ownerName: ownerInfo.name,
                registeredDate: new Date().toLocaleDateString()
            };
            
            registeredPets.push(petData);
            // Post to server
            fetch('/api/registrations/pets', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: petData.type,
                    breed: petData.breed,
                    name: petData.name,
                    color: petData.color,
                    age: petData.age,
                    gender: petData.gender,
                    vaccinated: petData.vaccinated,
                    microchip: petData.microchip,
                    neutered: petData.neutered,
                    temperament: petData.temperament,
                    notes: petData.notes,
                    photo: petData.photo,
                    ownerName: petData.ownerName,
                    registeredDate: petData.registeredDate
                })
            }).then(async res => {
                if (!res.ok) {
                    console.error('Pet save failed', res.status);
                    showNotification('Failed to save pet to server', 'error');
                    return;
                }
                const created = await res.json();
                const idx = registeredPets.findIndex(p => p.id === petData.id);
                if (idx !== -1) registeredPets[idx].id = created.id;
            }).catch(err => console.error('Save pet exception', err));
            
            // Show success message
            const petSuccess = document.getElementById('petSuccess');
            const petSubmitBtn = document.querySelector('#pet-tab .submit-btn');
            if (petSuccess) petSuccess.classList.add('show');
            if (petSubmitBtn) petSubmitBtn.style.display = 'none';
            
            // Reset form after delay
            setTimeout(() => {
                petForm.reset();
                const petFileNameDisplay = document.getElementById('petFileNameDisplay');
                const petPhotoPreview = document.getElementById('petPhotoPreview');
                if (petFileNameDisplay) petFileNameDisplay.innerHTML = '';
                if (petPhotoPreview) petPhotoPreview.innerHTML = '';
                if (petSuccess) petSuccess.classList.remove('show');
                if (petSubmitBtn) petSubmitBtn.style.display = 'flex';
                petPhotoData = null;
            }, 3000);
            
            // Update list
            renderPetsList();
            
            // Show notification
            showNotification('Pet registered successfully!', 'success');
        });
    }
}

// ========================================
// RENDER VEHICLES LIST
// ========================================
function renderVehiclesList() {
    const vehiclesList = document.getElementById('vehiclesList');
    const vehicleCount = document.getElementById('vehicleCount');
    
    if (!vehiclesList) return;
    if (vehicleCount) vehicleCount.textContent = registeredVehicles.length;
    
    if (registeredVehicles.length === 0) {
        vehiclesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <p>No vehicles registered yet</p>
                <button class="btn-add" onclick="switchToTab('vehicle')">
                    <i class="fas fa-plus"></i> Add Vehicle
                </button>
            </div>
        `;
        return;
    }
    
    vehiclesList.innerHTML = registeredVehicles.map(vehicle => {
        let vehicleIcon = 'car';
        if (vehicle.type === 'motorcycle') vehicleIcon = 'motorcycle';
        else if (vehicle.type === 'truck') vehicleIcon = 'truck';
        else if (vehicle.type === 'van') vehicleIcon = 'shuttle-van';
        
        return `
            <div class="item-card">
                <div class="item-icon">
                    <i class="fas fa-${vehicleIcon}"></i>
                </div>
                <div class="item-details">
                    <h4>${escapeHtml(vehicle.plateNumber)} • ${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</h4>
                    <p>${escapeHtml(vehicle.color)} • ${vehicle.year || 'N/A'} • ${escapeHtml(vehicle.type)}</p>
                    <div class="detail-row">
                        <span class="detail-item"><i class="fas fa-calendar"></i> ${vehicle.registeredDate}</span>
                        ${vehicle.category === 'guest' ? `<span class="guest-badge"><i class="fas fa-user"></i> Guest</span>` : ''}
                        ${vehicle.guestDuration && vehicle.category === 'guest' ? `<span class="duration-badge"><i class="fas fa-clock"></i> ${vehicle.guestDuration} ${vehicle.guestDurationType}</span>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    ${vehicle.category === 'guest' ? `
                    <button class="btn-icon" title="Edit Duration" onclick="editVehicleDuration(${vehicle.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ` : ''}
                    <button class="btn-icon delete" title="Delete" onclick="deleteVehicle(${vehicle.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// RENDER PETS LIST
// ========================================
function renderPetsList() {
    const petsList = document.getElementById('petsList');
    const petCount = document.getElementById('petCount');
    
    if (!petsList) return;
    if (petCount) petCount.textContent = registeredPets.length;
    
    if (registeredPets.length === 0) {
        petsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paw"></i>
                <p>No pets registered yet</p>
                <button class="btn-add" onclick="switchToTab('pet')">
                    <i class="fas fa-plus"></i> Add Pet
                </button>
            </div>
        `;
        return;
    }
    
    petsList.innerHTML = registeredPets.map(pet => {
        let petIcon = 'paw';
        if (pet.type === 'dog') petIcon = 'dog';
        else if (pet.type === 'cat') petIcon = 'cat';
        else if (pet.type === 'bird') petIcon = 'dove';
        else if (pet.type === 'fish') petIcon = 'fish';
        else if (pet.type === 'rabbit') petIcon = 'paw';
        
        return `
            <div class="item-card">
                ${pet.photo ? `
                    <img src="${pet.photo}" alt="${escapeHtml(pet.name)}" class="pet-photo">
                ` : `
                    <div class="item-icon">
                        <i class="fas fa-${petIcon}"></i>
                    </div>
                `}
                <div class="item-details">
                    <h4>${escapeHtml(pet.name)} ${pet.breed ? `(${escapeHtml(pet.breed)})` : ''}</h4>
                    <p>${escapeHtml(pet.color)} • ${pet.age} yrs • ${pet.gender}</p>
                    <div class="detail-row">
                        <span class="detail-item"><i class="fas fa-calendar"></i> ${pet.registeredDate}</span>
                        ${pet.vaccinated === 'yes' ? `<span class="vaccinated-badge"><i class="fas fa-syringe"></i> Vaccinated</span>` : ''}
                        ${pet.vaccinated === 'partial' ? `<span class="partial-vaccinated-badge"><i class="fas fa-syringe"></i> Partial</span>` : ''}
                        ${pet.microchip === 'yes' ? `<span class="vaccinated-badge" style="background: #d1ecf1; color: #0c5460;"><i class="fas fa-microchip"></i> Microchipped</span>` : ''}
                        ${pet.neutered === 'yes' ? `<span class="neutered-badge"><i class="fas fa-notes-medical"></i> Neutered</span>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-icon" title="Update Status" onclick="updatePetStatus(${pet.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" title="Delete" onclick="deletePet(${pet.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// EDIT VEHICLE DURATION
// ========================================
function editVehicleDuration(vehicleId) {
    const vehicle = registeredVehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.category !== 'guest') {
        alert('This feature is only available for guest vehicles');
        return;
    }
    
    const modalHtml = `
        <div class="update-modal" id="durationModal">
            <div class="update-modal-content">
                <div class="update-modal-header">
                    <h3><i class="fas fa-clock"></i> Update Guest Duration</h3>
                    <button class="close-modal" onclick="closeUpdateModal()">&times;</button>
                </div>
                <div class="update-modal-body">
                    <p style="margin-bottom: 20px; font-weight: 600; color: #333;">
                        ${escapeHtml(vehicle.plateNumber)} • ${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}
                    </p>
                    <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
                        Guest: ${escapeHtml(vehicle.guestName || 'N/A')}
                    </p>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Expected Duration</label>
                        <input type="number" id="updateDuration" value="${vehicle.guestDuration || ''}" min="1" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Duration Type</label>
                        <select id="updateDurationType" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
                            <option value="hours" ${vehicle.guestDurationType === 'hours' ? 'selected' : ''}>Hours</option>
                            <option value="days" ${vehicle.guestDurationType === 'days' ? 'selected' : ''}>Days</option>
                        </select>
                    </div>
                </div>
                <div class="update-modal-footer">
                    <button class="btn-cancel" onclick="closeUpdateModal()">Cancel</button>
                    <button class="btn-save" onclick="saveVehicleDuration(${vehicle.id})">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Add modal styles if not present
    addModalStyles();
}

function saveVehicleDuration(vehicleId) {
    const vehicle = registeredVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const durationInput = document.getElementById('updateDuration');
    const durationTypeSelect = document.getElementById('updateDurationType');
    
    if (durationInput) vehicle.guestDuration = durationInput.value;
    if (durationTypeSelect) vehicle.guestDurationType = durationTypeSelect.value;
    
    closeUpdateModal();
    renderVehiclesList();
    showNotification('Guest duration updated successfully!', 'success');
}

// ========================================
// UPDATE PET STATUS
// ========================================
function updatePetStatus(petId) {
    const pet = registeredPets.find(p => p.id === petId);
    if (!pet) return;
    
    const modalHtml = `
        <div class="update-modal" id="petStatusModal">
            <div class="update-modal-content">
                <div class="update-modal-header">
                    <h3><i class="fas fa-edit"></i> Update Pet Status</h3>
                    <button class="close-modal" onclick="closeUpdateModal()">&times;</button>
                </div>
                <div class="update-modal-body">
                    <p style="margin-bottom: 20px; font-weight: 600; color: #333;">
                        ${escapeHtml(pet.name)} ${pet.breed ? `(${escapeHtml(pet.breed)})` : ''}
                    </p>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e0e0e0;">
                            <input type="checkbox" id="updateVaccinated" ${pet.vaccinated === 'yes' ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #0a4d3c;">
                            <div>
                                <div style="font-weight: 600; color: #333;">Vaccinated</div>
                                <div style="font-size: 12px; color: #666;">Pet is up to date with vaccinations</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e0e0e0;">
                            <input type="checkbox" id="updateMicrochip" ${pet.microchip === 'yes' ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #0a4d3c;">
                            <div>
                                <div style="font-weight: 600; color: #333;">Microchipped</div>
                                <div style="font-size: 12px; color: #666;">Pet has a microchip for identification</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e0e0e0;">
                            <input type="checkbox" id="updateNeutered" ${pet.neutered === 'yes' ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #0a4d3c;">
                            <div>
                                <div style="font-weight: 600; color: #333;">Spayed/Neutered</div>
                                <div style="font-size: 12px; color: #666;">Pet has been spayed or neutered</div>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="update-modal-footer">
                    <button class="btn-cancel" onclick="closeUpdateModal()">Cancel</button>
                    <button class="btn-save" onclick="savePetStatus(${pet.id})">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
    addModalStyles();
}

function savePetStatus(petId) {
    const pet = registeredPets.find(p => p.id === petId);
    if (!pet) return;
    
    const vaccinatedCheckbox = document.getElementById('updateVaccinated');
    const microchipCheckbox = document.getElementById('updateMicrochip');
    const neuteredCheckbox = document.getElementById('updateNeutered');
    
    if (vaccinatedCheckbox) pet.vaccinated = vaccinatedCheckbox.checked ? 'yes' : 'no';
    if (microchipCheckbox) pet.microchip = microchipCheckbox.checked ? 'yes' : 'no';
    if (neuteredCheckbox) pet.neutered = neuteredCheckbox.checked ? 'yes' : 'no';
    
    closeUpdateModal();
    renderPetsList();
    showNotification('Pet status updated successfully!', 'success');
}

function closeUpdateModal() {
    const modal = document.querySelector('.update-modal');
    if (modal) modal.remove();
}

function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .update-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        .update-modal-content {
            background: white;
            border-radius: 12px;
            padding: 0;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        }
        .update-modal-header {
            padding: 20px;
            border-bottom: 2px solid #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .update-modal-header h3 {
            color: #0a4d3c;
            font-size: 18px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .close-modal {
            background: none;
            border: none;
            font-size: 28px;
            color: #999;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s;
        }
        .close-modal:hover {
            background: #f5f5f5;
            color: #333;
        }
        .update-modal-body {
            padding: 20px;
        }
        .update-modal-footer {
            padding: 20px;
            border-top: 2px solid #e0e0e0;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .btn-cancel, .btn-save {
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .btn-cancel {
            background: #f5f5f5;
            color: #666;
        }
        .btn-cancel:hover {
            background: #e0e0e0;
        }
        .btn-save {
            background: #0a4d3c;
            color: white;
        }
        .btn-save:hover {
            background: #0d5f4a;
            transform: translateY(-2px);
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// DELETE FUNCTIONS
// ========================================
function deleteVehicle(id) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        registeredVehicles = registeredVehicles.filter(v => v.id !== id);
        renderVehiclesList();
        showNotification('Vehicle deleted successfully!', 'success');
    }
}

function deletePet(id) {
    if (confirm('Are you sure you want to delete this pet?')) {
        registeredPets = registeredPets.filter(p => p.id !== id);
        renderPetsList();
        showNotification('Pet deleted successfully!', 'success');
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#0a4d3c' : '#dc3545'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-family: var(--font-body, 'Outfit', sans-serif);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions available globally
window.deleteVehicle = deleteVehicle;
window.deletePet = deletePet;
window.editVehicleDuration = editVehicleDuration;
window.updatePetStatus = updatePetStatus;
window.closeUpdateModal = closeUpdateModal;
window.saveVehicleDuration = saveVehicleDuration;
window.savePetStatus = savePetStatus;

// Set active nav class
function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-menu a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPath ||
            (currentPath.includes('vehicle-pet-registration') && linkHref === 'vehicle-pet-registration.html') ||
            (currentPath === '/' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}
document.addEventListener('DOMContentLoaded', setActiveNav);

console.log('%c Vehicle & Pet Registration Page Loaded ✓', 'color:#0a4d3c;font-weight:bold');