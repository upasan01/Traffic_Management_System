/**
 * Drivers Management JavaScript
 * Handles all driver-related functionality for the application
 */

// Global variables
let currentPage = 1;
let driversPerPage = 10;
let totalDrivers = 0;
let totalPages = 0;
let currentFilters = {
    status: '',
    license_type: '',
    search: ''
};

// DOM Elements
const driversTableBody = document.getElementById('driversTableBody');
const paginationNumbers = document.getElementById('paginationNumbers');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const startRangeEl = document.getElementById('startRange');
const endRangeEl = document.getElementById('endRange');
const totalDriversEl = document.getElementById('totalDrivers');
const totalDriversCountEl = document.getElementById('totalDriversCount');
const activeDriversCountEl = document.getElementById('activeDriversCount');
const expiringLicenseCountEl = document.getElementById('expiringLicenseCount');
const incidentDriversCountEl = document.getElementById('incidentDriversCount');

// Filter Elements
const searchInput = document.getElementById('driverSearch');
const statusFilter = document.getElementById('statusFilter');
const typeFilter = document.getElementById('typeFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Modal Elements
const addDriverBtn = document.getElementById('addDriverBtn');
const addDriverModal = document.getElementById('addDriverModal');
const closeAddDriverModal = document.getElementById('closeAddDriverModal');
const cancelAddDriver = document.getElementById('cancelAddDriver');
const addDriverForm = document.getElementById('addDriverForm');
const viewDriverModal = document.getElementById('viewDriverModal');
const closeViewDriverModal = document.getElementById('closeViewDriverModal');
const driverDetailsEl = document.getElementById('driverDetails');
const deleteDriverBtn = document.getElementById('deleteDriver');
const editDriverBtn = document.getElementById('editDriver');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Log which elements could not be found (for debugging)
    const requiredElements = {
        'driversTableBody': driversTableBody,
        'paginationNumbers': paginationNumbers,
        'prevPage': prevPageBtn,
        'nextPage': nextPageBtn,
        'driverSearch': searchInput,
        'statusFilter': statusFilter,
        'typeFilter': typeFilter,
        'clearFilters': clearFiltersBtn
    };
    
    const missingElements = Object.entries(requiredElements)
        .filter(([_, element]) => !element)
        .map(([id]) => id);
    
    if (missingElements.length > 0) {
        console.warn('Some elements could not be found:', missingElements);
    }
    
    // Check API status instead of directly loading drivers
    checkApiStatus();
    
    // Add event listeners
    addEventListeners();
});

/**
 * Set up all event listeners for the page
 */
function addEventListeners() {
    // Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadDrivers();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadDrivers();
            }
        });
    }
    
    // Filters
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentFilters.search = searchInput.value;
            currentPage = 1;
            loadDrivers();
        }, 500));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilters.status = statusFilter.value;
            currentPage = 1;
            loadDrivers();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            currentFilters.license_type = typeFilter.value;
            currentPage = 1;
            loadDrivers();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Reset filters
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (typeFilter) typeFilter.value = '';
            currentFilters = {
                status: '',
                license_type: '',
                search: ''
            };
            currentPage = 1;
            loadDrivers();
        });
    } else {
        console.error('Clear filters button not found in the document');
    }
    
    // Add Driver Modal
    if (addDriverBtn) {
        addDriverBtn.addEventListener('click', () => {
            // Reset form
            addDriverForm.reset();
            // Show modal
            addDriverModal.classList.remove('hidden');
        });
    }
    
    if (closeAddDriverModal) {
        closeAddDriverModal.addEventListener('click', () => {
            addDriverModal.classList.add('hidden');
        });
    }
    
    if (cancelAddDriver) {
        cancelAddDriver.addEventListener('click', () => {
            addDriverModal.classList.add('hidden');
        });
    }
    
    // Add Driver Form Submission
    if (addDriverForm) {
        addDriverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addDriver();
        });
    }
    
    // View Driver Modal
    if (closeViewDriverModal) {
        closeViewDriverModal.addEventListener('click', () => {
            viewDriverModal.classList.add('hidden');
        });
    }
    
    // Delete driver
    if (deleteDriverBtn) {
        deleteDriverBtn.addEventListener('click', () => {
            const driverId = deleteDriverBtn.dataset.id;
            if (confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
                deleteDriver(driverId);
            }
        });
    }
    
    // Edit driver (switch to edit mode)
    if (editDriverBtn) {
        editDriverBtn.addEventListener('click', () => {
            const driverId = editDriverBtn.dataset.id;
            viewDriverModal.classList.add('hidden');
            
            // Fetch driver details
            fetch(`api/drivers.php?id=${driverId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const driver = data.data;
                        
                        // Populate add driver form with current data
                        document.getElementById('firstName').value = driver.first_name;
                        document.getElementById('lastName').value = driver.last_name;
                        document.getElementById('licenseNumber').value = driver.license_number;
                        document.getElementById('licenseType').value = driver.license_type;
                        document.getElementById('expiryDate').value = driver.expiry_date;
                        document.getElementById('status').value = driver.status;
                        
                        // Change form submit handler to update
                        addDriverForm.dataset.mode = 'edit';
                        addDriverForm.dataset.id = driverId;
                        
                        // Show the add modal (repurposed for edit)
                        addDriverModal.classList.remove('hidden');
                    }
                })
                .catch(error => {
                    showNotification('Error fetching driver details', 'error');
                    console.error('Error fetching driver details:', error);
                });
        });
    }
    
    // Overlay click to close modals
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            if (addDriverModal) addDriverModal.classList.add('hidden');
            if (viewDriverModal) viewDriverModal.classList.add('hidden');
        });
    });
}

/**
 * Load drivers from the API with current filters and pagination
 */
function loadDrivers() {
    // Check if driversTableBody exists before attempting to update it
    if (!driversTableBody) {
        console.error('driversTableBody element not found');
        return;
    }
    
    // Show loading state
    driversTableBody.innerHTML = `
        <tr class="animate-pulse">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">Loading drivers data...</td>
        </tr>
    `;
    
    // Build query parameters
    const params = new URLSearchParams({
        page: currentPage,
        limit: driversPerPage
    });
    
    if (currentFilters.status) {
        params.append('status', currentFilters.status);
    }
    
    if (currentFilters.license_type) {
        params.append('license_type', currentFilters.license_type);
    }
    
    if (currentFilters.search) {
        params.append('search', currentFilters.search);
    }
    
    // Add a flag to prevent continuous loading attempts
    let dataLoaded = false;
    
    // Set a timeout to ensure we don't show loading forever
    const loadingTimeout = setTimeout(() => {
        if (!dataLoaded) {
            console.error('API request timed out');
            showNotification('The server is taking too long to respond. Using fallback data.', 'warning');
            loadFallbackData();
        }
    }, 10000); // 10 second timeout
    
    // Fetch drivers from API
    fetch(`api/drivers.php?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            dataLoaded = true;
            clearTimeout(loadingTimeout);
            
            if (data.status === 'success') {
                renderDrivers(data.data.drivers);
                updatePagination(data.data.pagination);
                updateStats(data.data.stats);
            } else {
                console.error('API Error:', data.message);
                showNotification(data.message, 'error');
                driversTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-gray-500">No drivers found: ${data.message}</td>
                    </tr>
                `;
                // Reset pagination if we have an error
                updatePagination({
                    page: 1,
                    limit: driversPerPage,
                    total: 0,
                    total_pages: 1
                });
            }
        })
        .catch(error => {
            dataLoaded = true;
            clearTimeout(loadingTimeout);
            
            console.error('Fetch Error:', error);
            showNotification(`Error loading drivers: ${error.message}`, 'error');
            
            if (driversTableBody) {
                driversTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-red-500">Error loading drivers: ${error.message}</td>
                    </tr>
                `;
            }
            
            // Log more detailed error to console for debugging
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                url: `api/drivers.php?${params.toString()}`
            });
            
            // Reset pagination on error
            updatePagination({
                page: 1,
                limit: driversPerPage,
                total: 0,
                total_pages: 1
            });
            
            // Generate fallback sample data when API fails
            loadFallbackData();
        });
}

/**
 * Render drivers table with the provided data
 * @param {Array} drivers - List of driver objects
 */
function renderDrivers(drivers) {
    if (!drivers || drivers.length === 0) {
        driversTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">No drivers found</td>
            </tr>
        `;
        return;
    }
    
    // Clear the table
    driversTableBody.innerHTML = '';
    
    // Add each driver to the table
    drivers.forEach(driver => {
        // Format expiry date
        const expiryDate = new Date(driver.expiry_date);
        const formattedDate = expiryDate.toLocaleDateString();
        
        // Check if license is expiring soon (within 30 days)
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        const isExpiringSoon = expiryDate <= thirtyDaysFromNow && expiryDate >= today;
        const isExpired = expiryDate < today;
        
        // Create status badge
        let statusBadge = '';
        switch (driver.status) {
            case 'active':
                statusBadge = '<span class="badge badge-success">Active</span>';
                break;
            case 'inactive':
                statusBadge = '<span class="badge badge-info">Inactive</span>';
                break;
            case 'suspended':
                statusBadge = '<span class="badge badge-danger">Suspended</span>';
                break;
            default:
                statusBadge = '<span class="badge">' + driver.status + '</span>';
        }
        
        // Create row
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full" src="https://ui-avatars.com/api/?name=${driver.first_name}+${driver.last_name}&background=random" alt="${driver.first_name} ${driver.last_name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${driver.first_name} ${driver.last_name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${driver.license_number}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Class ${driver.license_type}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm ${isExpired ? 'text-red-600 font-semibold' : isExpiringSoon ? 'text-yellow-600 font-semibold' : 'text-gray-900'}">${formattedDate}</div>
                ${isExpired ? '<div class="text-xs text-red-500">Expired</div>' : isExpiringSoon ? '<div class="text-xs text-yellow-500">Expiring soon</div>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${driver.violations > 0 
                    ? `<span class="text-red-600 font-semibold">${driver.violations}</span>` 
                    : driver.violations}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="view-driver-btn text-indigo-600 hover:text-indigo-900 mr-3" data-id="${driver.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="edit-driver-btn text-blue-600 hover:text-blue-900 mr-3" data-id="${driver.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-driver-btn text-red-600 hover:text-red-900" data-id="${driver.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        driversTableBody.appendChild(row);
    });
    
    // Add event listeners to the newly created buttons
    document.querySelectorAll('.view-driver-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            viewDriver(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.edit-driver-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const driverId = btn.dataset.id;
            
            // Fetch driver details
            fetch(`api/drivers.php?id=${driverId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const driver = data.data;
                        
                        // Populate add driver form with current data
                        document.getElementById('firstName').value = driver.first_name;
                        document.getElementById('lastName').value = driver.last_name;
                        document.getElementById('licenseNumber').value = driver.license_number;
                        document.getElementById('licenseType').value = driver.license_type;
                        document.getElementById('expiryDate').value = driver.expiry_date;
                        document.getElementById('status').value = driver.status;
                        
                        // Change form submit handler to update
                        addDriverForm.dataset.mode = 'edit';
                        addDriverForm.dataset.id = driverId;
                        
                        // Show the add modal (repurposed for edit)
                        addDriverModal.classList.remove('hidden');
                    }
                })
                .catch(error => {
                    showNotification('Error fetching driver details', 'error');
                    console.error('Error fetching driver details:', error);
                });
        });
    });
    
    document.querySelectorAll('.delete-driver-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const driverId = btn.dataset.id;
            if (confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
                deleteDriver(driverId);
            }
        });
    });
}

/**
 * Update pagination controls based on API response
 * @param {Object} pagination - Pagination data from API
 */
function updatePagination(pagination) {
    if (!pagination) return;
    
    totalDrivers = pagination.total;
    totalPages = pagination.total_pages;
    currentPage = pagination.page;
    
    // Update pagination text
    if (totalDriversEl) totalDriversEl.textContent = totalDrivers;
    
    const start = (currentPage - 1) * driversPerPage + 1;
    const end = Math.min(currentPage * driversPerPage, totalDrivers);
    
    if (startRangeEl) startRangeEl.textContent = totalDrivers > 0 ? start : 0;
    if (endRangeEl) endRangeEl.textContent = end;
    
    // Disable/enable previous/next buttons
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
        
        if (prevPageBtn.disabled) {
            prevPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            prevPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
        
        if (nextPageBtn.disabled) {
            nextPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            nextPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    // Update pagination numbers if element exists
    if (paginationNumbers) {
        renderPaginationNumbers(pagination);
    }
}

/**
 * Render pagination number buttons
 * @param {Object} pagination - Pagination data
 */
function renderPaginationNumbers(pagination) {
    if (!paginationNumbers) {
        console.warn('Pagination numbers element not found');
        return;
    }
    
    paginationNumbers.innerHTML = '';
    
    if (pagination.total_pages <= 1) return;
    
    // Determine range of pages to show
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(pagination.total_pages, startPage + 2);
    
    if (endPage - startPage < 2) {
        if (startPage === 1) {
            endPage = Math.min(3, pagination.total_pages);
        } else {
            startPage = Math.max(1, endPage - 2);
        }
    }
    
    // Add first page button if not already included
    if (startPage > 1) {
        const pageBtn = createPageButton(1, currentPage === 1);
        paginationNumbers.appendChild(pageBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1';
            ellipsis.textContent = '...';
            paginationNumbers.appendChild(ellipsis);
        }
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i, currentPage === i);
        paginationNumbers.appendChild(pageBtn);
    }
    
    // Add last page button if not already included
    if (endPage < pagination.total_pages) {
        if (endPage < pagination.total_pages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1';
            ellipsis.textContent = '...';
            paginationNumbers.appendChild(ellipsis);
        }
        
        const pageBtn = createPageButton(pagination.total_pages, currentPage === pagination.total_pages);
        paginationNumbers.appendChild(pageBtn);
    }
}

/**
 * Create a pagination button element
 * @param {number} pageNum - Page number
 * @param {boolean} isActive - Whether the button is active
 * @returns {HTMLButtonElement} Button element
 */
function createPageButton(pageNum, isActive) {
    const button = document.createElement('button');
    button.textContent = pageNum;
    button.className = isActive
        ? 'px-3 py-1 rounded-md bg-indigo-600 text-white'
        : 'px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600';
    
    if (!isActive) {
        button.addEventListener('click', () => {
            currentPage = pageNum;
            loadDrivers();
        });
    }
    
    return button;
}

/**
 * Update driver statistics counters
 * @param {Object} stats - Statistics data from API
 */
function updateStats(stats) {
    if (!stats) return;
    
    if (totalDriversCountEl) totalDriversCountEl.textContent = stats.total_drivers;
    if (activeDriversCountEl) activeDriversCountEl.textContent = stats.active_drivers;
    if (expiringLicenseCountEl) expiringLicenseCountEl.textContent = stats.expiring_licenses;
    if (incidentDriversCountEl) incidentDriversCountEl.textContent = stats.incident_involved;
}

/**
 * View driver details in modal
 * @param {string} driverId - The ID of the driver to view
 */
function viewDriver(driverId) {
    fetch(`api/drivers.php?id=${driverId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const driver = data.data;
                
                // Format expiry date
                const expiryDate = new Date(driver.expiry_date);
                const formattedDate = expiryDate.toLocaleDateString();
                
                // Check if license is expiring soon (within 30 days)
                const today = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(today.getDate() + 30);
                const isExpiringSoon = expiryDate <= thirtyDaysFromNow && expiryDate >= today;
                const isExpired = expiryDate < today;
                
                // Create status badge
                let statusBadge = '';
                switch (driver.status) {
                    case 'active':
                        statusBadge = '<span class="badge badge-success">Active</span>';
                        break;
                    case 'inactive':
                        statusBadge = '<span class="badge badge-info">Inactive</span>';
                        break;
                    case 'suspended':
                        statusBadge = '<span class="badge badge-danger">Suspended</span>';
                        break;
                    default:
                        statusBadge = '<span class="badge">' + driver.status + '</span>';
                }
                
                // Populate driver details
                driverDetailsEl.innerHTML = `
                    <div class="flex items-center mb-6">
                        <div class="flex-shrink-0 h-20 w-20">
                            <img class="h-20 w-20 rounded-full" src="https://ui-avatars.com/api/?name=${driver.first_name}+${driver.last_name}&background=random&size=120" alt="${driver.first_name} ${driver.last_name}">
                        </div>
                        <div class="ml-6">
                            <h2 class="text-2xl font-bold">${driver.first_name} ${driver.last_name}</h2>
                            <div class="mt-1">${statusBadge}</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">License Number</h3>
                            <p class="mt-1 text-base">${driver.license_number}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">License Type</h3>
                            <p class="mt-1 text-base">Class ${driver.license_type}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Expiry Date</h3>
                            <p class="mt-1 text-base ${isExpired ? 'text-red-600 font-semibold' : isExpiringSoon ? 'text-yellow-600 font-semibold' : ''}">
                                ${formattedDate}
                                ${isExpired ? '<span class="text-xs text-red-500 ml-2">Expired</span>' : isExpiringSoon ? '<span class="text-xs text-yellow-500 ml-2">Expiring soon</span>' : ''}
                            </p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Violations</h3>
                            <p class="mt-1 text-base ${driver.violations > 0 ? 'text-red-600 font-semibold' : ''}">${driver.violations}</p>
                        </div>
                    </div>
                `;
                
                // Set button IDs
                deleteDriverBtn.dataset.id = driver.id;
                editDriverBtn.dataset.id = driver.id;
                
                // Show modal
                viewDriverModal.classList.remove('hidden');
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Error loading driver details', 'error');
            console.error('Error loading driver details:', error);
        });
}

/**
 * Add a new driver or update existing one
 */
function addDriver() {
    const isEditMode = addDriverForm.dataset.mode === 'edit';
    const driverId = isEditMode ? addDriverForm.dataset.id : null;
    
    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const licenseNumber = document.getElementById('licenseNumber').value.trim();
    const licenseType = document.getElementById('licenseType').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const status = document.getElementById('status').value;
    
    // Basic form validation
    if (!firstName) {
        showNotification('First name is required', 'error');
        document.getElementById('firstName').focus();
        return;
    }
    
    if (!lastName) {
        showNotification('Last name is required', 'error');
        document.getElementById('lastName').focus();
        return;
    }
    
    if (!licenseNumber) {
        showNotification('License number is required', 'error');
        document.getElementById('licenseNumber').focus();
        return;
    }
    
    if (!expiryDate) {
        showNotification('Expiry date is required', 'error');
        document.getElementById('expiryDate').focus();
        return;
    }
    
    // License number format validation (basic pattern)
    const licensePattern = /^[A-Z0-9]{6,12}$/i;
    if (!licensePattern.test(licenseNumber)) {
        showNotification('License number should be 6-12 alphanumeric characters', 'warning');
        // Continue anyway - this is just a warning
    }
    
    // Prepare data object
    const driverData = {
        first_name: firstName,
        last_name: lastName,
        license_number: licenseNumber,
        license_type: licenseType,
        expiry_date: expiryDate,
        status: status,
        violations: isEditMode ? undefined : 0
    };
    
    if (isEditMode) {
        driverData.id = driverId;
    }
    
    // Show loading state
    const submitBtn = addDriverForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
    
    // API request configuration
    const requestConfig = {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(driverData)
    };
    
    // Log the request data for debugging
    console.log('Sending driver data:', {
        url: 'api/drivers.php',
        method: requestConfig.method,
        data: driverData
    });
    
    // Send request to API
    fetch('api/drivers.php', requestConfig)
        .then(response => {
            if (!response.ok) {
                // Handle HTTP errors like 404, 500, etc.
                const statusText = response.statusText || `Error ${response.status}`;
                throw new Error(`HTTP error: ${statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API response:', data);
            if (data.status === 'success') {
                showNotification(data.message, 'success');
                addDriverModal.classList.add('hidden');
                addDriverForm.reset();
                addDriverForm.dataset.mode = '';
                addDriverForm.dataset.id = '';
                
                // Reload drivers list
                loadDrivers();
            } else {
                // API returned an error
                const errorMsg = data.message || 'Unknown error occurred';
                showNotification(`Error: ${errorMsg}`, 'error');
                console.error('API Error:', data);
                
                // If it's a duplicate license number error, focus on that field
                if (errorMsg.includes('license number already exists')) {
                    document.getElementById('licenseNumber').focus();
                }
            }
        })
        .catch((error) => {
            // Network errors or parse errors
            console.error('Error saving driver:', error);
            
            // Determine type of error and provide helpful message
            let errorMsg = 'Error saving driver. ';
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMsg += 'Network connection issue. Please check your internet connection.';
                // Try using fallback data if we're in a new driver situation (not edit)
                if (!isEditMode) {
                    setTimeout(() => {
                        loadFallbackData();
                    }, 500);
                }
            } else if (error.name === 'SyntaxError') {
                errorMsg += 'Server returned invalid data.';
            } else {
                errorMsg += error.message;
            }
            
            showNotification(errorMsg, 'error');
            
            // Check database connection
            const setupLink = document.createElement('a');
            setupLink.href = 'setup_drivers.php';
            setupLink.innerHTML = 'Run database setup';
            setupLink.className = 'bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded mt-2 inline-block';
            
            // Add setup link to modal
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-600 mb-4 p-2 bg-red-100 rounded';
            errorDiv.innerHTML = `
                <p class="mb-2"><i class="fas fa-exclamation-triangle mr-2"></i>Database connection issue detected.</p>
                <p class="mb-2">Please run the database setup to fix this issue:</p>
            `;
            errorDiv.appendChild(setupLink);
            
            // Only add if not already present
            if (!document.getElementById('db-error-message')) {
                errorDiv.id = 'db-error-message';
                const formContainer = addDriverForm.parentNode;
                formContainer.insertBefore(errorDiv, addDriverForm);
            }
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
}

/**
 * Delete a driver
 * @param {string} driverId - The ID of the driver to delete
 */
function deleteDriver(driverId) {
    fetch(`api/drivers.php?id=${driverId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Driver deleted successfully', 'success');
                viewDriverModal.classList.add('hidden');
                loadDrivers();
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Error deleting driver', 'error');
            console.error('Error deleting driver:', error);
        });
}

/**
 * Show a notification toast
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Check if the notifications module is available
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Simple alert fallback
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate fallback sample data when API fails
 * This is only for demo purposes - in production, always fix API issues instead
 */
function loadFallbackData() {
    console.log('Loading fallback demo data...');
    
    const demoDrivers = [
        {
            id: 1,
            first_name: 'John',
            last_name: 'Smith',
            license_number: 'DL123456',
            license_type: 'A',
            expiry_date: '2024-12-31',
            status: 'active',
            violations: 0,
            last_incident: null
        },
        {
            id: 2,
            first_name: 'Sarah',
            last_name: 'Johnson',
            license_number: 'DL789012',
            license_type: 'B',
            expiry_date: '2024-10-15',
            status: 'active',
            violations: 1,
            last_incident: '2023-11-20'
        },
        {
            id: 3,
            first_name: 'Michael',
            last_name: 'Brown',
            license_number: 'DL345678',
            license_type: 'C',
            expiry_date: '2024-08-22',
            status: 'suspended',
            violations: 3,
            last_incident: '2024-01-15'
        },
        {
            id: 4,
            first_name: 'Emily',
            last_name: 'Davis',
            license_number: 'DL901234',
            license_type: 'B',
            expiry_date: '2025-03-10',
            status: 'active',
            violations: 0,
            last_incident: null
        },
        {
            id: 5,
            first_name: 'David',
            last_name: 'Wilson',
            license_number: 'DL567890',
            license_type: 'A',
            expiry_date: '2024-06-30',
            status: 'inactive',
            violations: 2,
            last_incident: '2023-09-05'
        }
    ];

    const stats = {
        total: demoDrivers.length,
        active: demoDrivers.filter(d => d.status === 'active').length,
        expiring_soon: 2,
        incident_involved: demoDrivers.filter(d => d.last_incident !== null).length
    };

    // Update stats
    updateStats(stats);

    // Calculate pagination
    totalDrivers = demoDrivers.length;
    totalPages = Math.ceil(totalDrivers / driversPerPage);
    
    // Get current page data
    const startIndex = (currentPage - 1) * driversPerPage;
    const endIndex = startIndex + driversPerPage;
    const currentPageDrivers = demoDrivers.slice(startIndex, endIndex);

    // Render drivers
    renderDrivers(currentPageDrivers);

    // Update pagination
    updatePagination({
        current_page: currentPage,
        total_pages: totalPages,
        total_items: totalDrivers,
        per_page: driversPerPage
    });

    return true;
}

/**
 * Check API status
 * Tests if the driver API is functioning correctly
 */
function checkApiStatus() {
    fetch('api/drivers.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                loadDrivers();
            } else {
                loadFallbackData();
            }
        })
        .catch(error => {
            console.warn('API not available, loading demo data:', error);
            loadFallbackData();
        });
} 