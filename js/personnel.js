/**
 * Personnel Management JavaScript
 * Handles all personnel-related functionality for the application
 */

// Global variables
let currentPage = 1;
let personnelPerPage = 10;
let totalPersonnel = 0;
let totalPages = 0;
let currentFilters = {
    status: '',
    department: '',
    search: ''
};

// Demo data for personnel
let personnelData = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Smith',
        role: 'Traffic Officer',
        status: 'active',
        email: 'john.smith@example.com',
        phone: '+1 234-567-8901',
        last_active: '2024-03-15 14:30:00'
    },
    {
        id: 2,
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'Supervisor',
        status: 'on_leave',
        email: 'sarah.j@example.com',
        phone: '+1 234-567-8902',
        last_active: '2024-03-14 18:45:00'
    },
    {
        id: 3,
        first_name: 'Michael',
        last_name: 'Brown',
        role: 'Traffic Officer',
        status: 'active',
        email: 'michael.b@example.com',
        phone: '+1 234-567-8903',
        last_active: '2024-03-15 10:15:00'
    },
    {
        id: 4,
        first_name: 'Emily',
        last_name: 'Davis',
        role: 'Administrator',
        status: 'active',
        email: 'emily.d@example.com',
        phone: '+1 234-567-8904',
        last_active: '2024-03-15 09:00:00'
    },
    {
        id: 5,
        first_name: 'David',
        last_name: 'Wilson',
        role: 'Traffic Officer',
        status: 'inactive',
        email: 'david.w@example.com',
        phone: '+1 234-567-8905',
        last_active: '2024-03-10 16:20:00'
    }
];

// DOM Elements
const personnelTableBody = document.getElementById('personnelTableBody');
const paginationNumbers = document.getElementById('paginationNumbers');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const startRangeEl = document.getElementById('startRange');
const endRangeEl = document.getElementById('endRange');
const totalPersonnelEl = document.getElementById('totalPersonnel');
const totalPersonnelCountEl = document.getElementById('totalPersonnelCount');
const activePersonnelCountEl = document.getElementById('activePersonnelCount');
const certificationRateEl = document.getElementById('certificationRate');
const avgExperienceEl = document.getElementById('avgExperience');

// Filter Elements
const searchInput = document.getElementById('personnelSearch');
const departmentFilter = document.getElementById('departmentFilter');
const statusFilter = document.getElementById('statusFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Modal Elements
const addPersonnelBtn = document.getElementById('addPersonnelBtn');
const addPersonnelModal = document.getElementById('addPersonnelModal');
const closeAddPersonnelModal = document.getElementById('closeAddPersonnelModal');
const cancelAddPersonnel = document.getElementById('cancelAddPersonnel');
const addPersonnelForm = document.getElementById('addPersonnelForm');
const viewPersonnelModal = document.getElementById('viewPersonnelModal');
const closeViewPersonnelModal = document.getElementById('closeViewPersonnelModal');
const personnelDetailsEl = document.getElementById('personnelDetails');
const deletePersonnelBtn = document.getElementById('deletePersonnel');
const editPersonnelBtn = document.getElementById('editPersonnel');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    addEventListeners();
    
    // Load personnel data
    loadPersonnel();
});

/**
 * Set up all event listeners for the page
 */
function addEventListeners() {
    // Handle null elements gracefully
    // Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadPersonnel();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadPersonnel();
            }
        });
    }
    
    // Filters
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentFilters.search = searchInput.value;
            currentPage = 1;
            loadPersonnel();
        }, 500));
    }
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', () => {
            currentFilters.department = departmentFilter.value;
            currentPage = 1;
            loadPersonnel();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilters.status = statusFilter.value;
            currentPage = 1;
            loadPersonnel();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Reset filters
            if (searchInput) searchInput.value = '';
            if (departmentFilter) departmentFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            currentFilters = {
                status: '',
                department: '',
                search: ''
            };
            currentPage = 1;
            loadPersonnel();
        });
    }
    
    // Add Personnel Modal
    if (addPersonnelBtn) {
        addPersonnelBtn.addEventListener('click', () => {
            // Reset form
            if (addPersonnelForm) addPersonnelForm.reset();
            // Show modal
            if (addPersonnelModal) addPersonnelModal.classList.remove('hidden');
        });
    }
    
    if (closeAddPersonnelModal) {
        closeAddPersonnelModal.addEventListener('click', () => {
            if (addPersonnelModal) addPersonnelModal.classList.add('hidden');
        });
    }
    
    if (cancelAddPersonnel) {
        cancelAddPersonnel.addEventListener('click', () => {
            if (addPersonnelModal) addPersonnelModal.classList.add('hidden');
        });
    }
    
    // Add Personnel Form Submission
    if (addPersonnelForm) {
        addPersonnelForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addPersonnel();
        });
    }
    
    // View Personnel Modal
    if (closeViewPersonnelModal) {
        closeViewPersonnelModal.addEventListener('click', () => {
            if (viewPersonnelModal) viewPersonnelModal.classList.add('hidden');
        });
    }
    
    // Delete personnel
    if (deletePersonnelBtn) {
        deletePersonnelBtn.addEventListener('click', () => {
            const personnelId = deletePersonnelBtn.dataset.id;
            if (confirm('Are you sure you want to delete this personnel? This action cannot be undone.')) {
                deletePersonnel(personnelId);
            }
        });
    }
    
    // Edit personnel (switch to edit mode)
    if (editPersonnelBtn) {
        editPersonnelBtn.addEventListener('click', () => {
            const personnelId = editPersonnelBtn.dataset.id;
            if (viewPersonnelModal) viewPersonnelModal.classList.add('hidden');
            
            // Fetch personnel details
            fetch(`api/personnel.php?id=${personnelId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        const personnel = data.data;
                        
                        // Populate add personnel form with current data
                        document.getElementById('firstName').value = personnel.first_name;
                        document.getElementById('lastName').value = personnel.last_name;
                        document.getElementById('employeeId').value = personnel.employee_id;
                        document.getElementById('department').value = personnel.department;
                        document.getElementById('role').value = personnel.role;
                        document.getElementById('joinDate').value = personnel.join_date;
                        document.getElementById('status').value = personnel.status;
                        
                        // Handle certifications (multi-select)
                        const certSelect = document.getElementById('certifications');
                        if (certSelect && personnel.certifications) {
                            const certArray = personnel.certifications.split(',');
                            
                            // Reset all options
                            for (let i = 0; i < certSelect.options.length; i++) {
                                certSelect.options[i].selected = false;
                            }
                            
                            // Select the ones in the data
                            for (let i = 0; i < certSelect.options.length; i++) {
                                if (certArray.includes(certSelect.options[i].value)) {
                                    certSelect.options[i].selected = true;
                                }
                            }
                        }
                        
                        // Change form submit handler to update
                        if (addPersonnelForm) {
                            addPersonnelForm.dataset.mode = 'edit';
                            addPersonnelForm.dataset.id = personnelId;
                        }
                        
                        // Show the add modal (repurposed for edit)
                        if (addPersonnelModal) addPersonnelModal.classList.remove('hidden');
                    }
                })
                .catch(error => {
                    showNotification('Error fetching personnel details', 'error');
                    console.error('Error fetching personnel details:', error);
                });
        });
    }
    
    // Overlay click to close modals
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            if (addPersonnelModal) addPersonnelModal.classList.add('hidden');
            if (viewPersonnelModal) viewPersonnelModal.classList.add('hidden');
        });
    });
}

/**
 * Load personnel data from the API with current filters and pagination
 */
function loadPersonnel() {
    // Check if personnelTableBody exists before attempting to update it
    if (!personnelTableBody) {
        console.error('personnelTableBody element not found');
        return;
    }
    
    // Show loading state
    personnelTableBody.innerHTML = `
        <tr class="animate-pulse">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">Loading personnel data...</td>
        </tr>
    `;
    
    // Build query parameters
    const params = new URLSearchParams({
        page: currentPage,
        limit: personnelPerPage
    });
    
    if (currentFilters.status) {
        params.append('status', currentFilters.status);
    }
    
    if (currentFilters.department) {
        params.append('department', currentFilters.department);
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
            showNotification('The server is taking too long to respond. Using sample data.', 'warning');
            loadSampleData();
        }
    }, 10000); // 10 second timeout
    
    // Fetch personnel from API
    fetch(`api/personnel.php?${params.toString()}`)
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
                renderPersonnel(data.data.personnel);
                updatePagination(data.data.pagination);
                updateStats(data.data.stats);
            } else {
                console.error('API Error:', data.message);
                showNotification(data.message, 'error');
                personnelTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-gray-500">No personnel found: ${data.message}</td>
                    </tr>
                `;
                // Reset pagination if we have an error
                updatePagination({
                    page: 1,
                    limit: personnelPerPage,
                    total: 0,
                    total_pages: 1
                });
            }
        })
        .catch(error => {
            dataLoaded = true;
            clearTimeout(loadingTimeout);
            
            console.error('Fetch Error:', error);
            showNotification(`Error loading personnel: ${error.message}`, 'error');
            
            if (personnelTableBody) {
                personnelTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-red-500">Error loading personnel: ${error.message}</td>
                    </tr>
                `;
            }
            
            // Log more detailed error to console for debugging
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                url: `api/personnel.php?${params.toString()}`
            });
            
            // Reset pagination on error
            updatePagination({
                page: 1,
                limit: personnelPerPage,
                total: 0,
                total_pages: 1
            });
            
            // Generate sample data when API fails
            loadSampleData();
        });
}

/**
 * Generate sample data when API fails
 */
function loadSampleData() {
    console.warn('Using sample personnel data since API is unavailable');
    
    const samplePersonnel = [
        {
            id: 1,
            first_name: 'John',
            last_name: 'Anderson',
            employee_id: 'TC001',
            department: 'traffic',
            role: 'Traffic Controller',
            join_date: '2018-05-15',
            status: 'active',
            certifications: 'traffic_management,leadership',
            experience: '5 years'
        },
        {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            employee_id: 'ER002',
            department: 'emergency',
            role: 'Emergency Responder',
            join_date: '2019-02-10',
            status: 'active',
            certifications: 'emergency_response,first_aid',
            experience: '4 years'
        },
        {
            id: 3,
            first_name: 'Michael',
            last_name: 'Johnson',
            employee_id: 'AD003',
            department: 'admin',
            role: 'Administrator',
            join_date: '2017-11-20',
            status: 'active',
            certifications: 'leadership',
            experience: '5.2 years'
        },
        {
            id: 4,
            first_name: 'Sarah',
            last_name: 'Williams',
            employee_id: 'TC004',
            department: 'traffic',
            role: 'Senior Controller',
            join_date: '2016-08-05',
            status: 'active',
            certifications: 'traffic_management,leadership,first_aid',
            experience: '6.7 years'
        },
        {
            id: 5,
            first_name: 'David',
            last_name: 'Brown',
            employee_id: 'TS005',
            department: 'tech',
            role: 'Systems Analyst',
            join_date: '2020-01-15',
            status: 'training',
            certifications: 'technical',
            experience: '3.3 years'
        }
    ];
    
    const paginationInfo = {
        page: 1,
        limit: 10,
        total: samplePersonnel.length,
        total_pages: 1
    };
    
    const statsInfo = {
        total_personnel: samplePersonnel.length,
        active_personnel: samplePersonnel.filter(person => person.status === 'active').length,
        certification_rate: 94,
        avg_experience: 5.2
    };
    
    showNotification('Using sample data. Connect to a database to see actual data.', 'warning');
    renderPersonnel(samplePersonnel);
    updatePagination(paginationInfo);
    updateStats(statsInfo);
}

/**
 * Render personnel table with the provided data
 * @param {Array} personnel - List of personnel objects
 */
function renderPersonnel(personnel) {
    if (!personnelTableBody) {
        console.error('personnelTableBody element not found');
        return;
    }
    
    if (!personnel || personnel.length === 0) {
        personnelTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">No personnel found</td>
            </tr>
        `;
        return;
    }
    
    // Clear the table
    personnelTableBody.innerHTML = '';
    
    // Add each personnel to the table
    personnel.forEach(person => {
        // Get department display name
        const departmentMap = {
            'traffic': 'Traffic Control',
            'emergency': 'Emergency Response',
            'admin': 'Administration',
            'tech': 'Technical Support'
        };
        
        const departmentDisplay = departmentMap[person.department] || person.department;
        
        // Format status with appropriate styling
        let statusBadgeClass = '';
        
        switch (person.status) {
            case 'active':
                statusBadgeClass = 'bg-green-100 text-green-800';
                break;
            case 'leave':
                statusBadgeClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'training':
                statusBadgeClass = 'bg-blue-100 text-blue-800';
                break;
            case 'inactive':
                statusBadgeClass = 'bg-red-100 text-red-800';
                break;
            default:
                statusBadgeClass = 'bg-gray-100 text-gray-800';
        }
        
        // Format the status display
        const statusDisplay = person.status.charAt(0).toUpperCase() + person.status.slice(1);
        
        // Create a new row
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-lg font-semibold">
                            ${person.first_name.charAt(0)}${person.last_name.charAt(0)}
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${person.first_name} ${person.last_name}</div>
                        <div class="text-sm text-gray-500">${person.role}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${person.employee_id}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${departmentDisplay}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${person.role}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${person.experience}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass}">
                    ${statusDisplay}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 view-btn mr-3" data-id="${person.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="text-indigo-600 hover:text-indigo-900 edit-btn mr-3" data-id="${person.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${person.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Add event listeners to action buttons
        const viewBtn = row.querySelector('.view-btn');
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', () => viewPersonnel(person.id));
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => editPersonnel(person.id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this personnel? This action cannot be undone.')) {
                    deletePersonnel(person.id);
                }
            });
        }
        
        // Add row to table
        personnelTableBody.appendChild(row);
    });
}

/**
 * Update pagination controls based on API response
 * @param {Object} pagination - Pagination data from API
 */
function updatePagination(pagination) {
    if (!pagination) return;
    
    totalPersonnel = pagination.total;
    totalPages = pagination.total_pages;
    currentPage = pagination.page;
    
    // Update pagination text
    if (totalPersonnelEl) totalPersonnelEl.textContent = totalPersonnel;
    
    const start = (currentPage - 1) * personnelPerPage + 1;
    const end = Math.min(currentPage * personnelPerPage, totalPersonnel);
    
    if (startRangeEl) startRangeEl.textContent = totalPersonnel > 0 ? start : 0;
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
 * @param {boolean} isActive - Whether this button is for the current page
 * @returns {HTMLElement} Button element
 */
function createPageButton(pageNum, isActive) {
    const button = document.createElement('button');
    button.textContent = pageNum;
    
    if (isActive) {
        button.className = 'px-3 py-1 rounded-md bg-indigo-600 text-white';
    } else {
        button.className = 'px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600';
        button.addEventListener('click', () => {
            currentPage = pageNum;
            loadPersonnel();
        });
    }
    
    return button;
}

/**
 * Update personnel statistics counters
 * @param {Object} stats - Statistics data from API
 */
function updateStats(stats) {
    if (!stats) return;
    
    if (totalPersonnelCountEl) totalPersonnelCountEl.textContent = stats.total_personnel;
    if (activePersonnelCountEl) activePersonnelCountEl.textContent = stats.active_personnel;
    if (certificationRateEl) certificationRateEl.textContent = stats.certification_rate + '%';
    if (avgExperienceEl) avgExperienceEl.textContent = stats.avg_experience + ' yrs';
}

/**
 * View personnel details
 * @param {string|number} id - Personnel ID to view
 */
function viewPersonnel(id) {
    fetch(`api/personnel.php?id=${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const person = data.data;
                
                // Format certifications for display
                const formattedCerts = formatCertifications(person.certifications);
                
                // Format department name
                const departmentMap = {
                    'traffic': 'Traffic Control',
                    'emergency': 'Emergency Response',
                    'admin': 'Administration',
                    'tech': 'Technical Support'
                };
                
                const departmentDisplay = departmentMap[person.department] || person.department;
                
                // Format status with appropriate styling
                let statusBadgeClass = '';
                switch (person.status) {
                    case 'active':
                        statusBadgeClass = 'bg-green-100 text-green-800';
                        break;
                    case 'leave':
                        statusBadgeClass = 'bg-yellow-100 text-yellow-800';
                        break;
                    case 'training':
                        statusBadgeClass = 'bg-blue-100 text-blue-800';
                        break;
                    case 'inactive':
                        statusBadgeClass = 'bg-red-100 text-red-800';
                        break;
                    default:
                        statusBadgeClass = 'bg-gray-100 text-gray-800';
                }
                
                // Format the status display
                const statusDisplay = person.status.charAt(0).toUpperCase() + person.status.slice(1);
                
                // Calculate experience based on join date
                const joinDate = new Date(person.join_date);
                const now = new Date();
                const interval = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 365.25));
                const experience = interval + (interval === 1 ? ' year' : ' years');
                
                // Populate personnel details
                if (personnelDetailsEl) {
                    personnelDetailsEl.innerHTML = `
                        <div class="flex justify-center mb-6">
                            <div class="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-3xl font-semibold">
                                ${person.first_name.charAt(0)}${person.last_name.charAt(0)}
                            </div>
                        </div>
                        <div class="text-center mb-6">
                            <h3 class="text-xl font-bold text-gray-800">${person.first_name} ${person.last_name}</h3>
                            <p class="text-gray-600">${person.role}</p>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="flex flex-col">
                                <span class="text-sm text-gray-500">Employee ID</span>
                                <span class="font-medium">${person.employee_id}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm text-gray-500">Department</span>
                                <span class="font-medium">${departmentDisplay}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm text-gray-500">Join Date</span>
                                <span class="font-medium">${formatDate(person.join_date)}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm text-gray-500">Experience</span>
                                <span class="font-medium">${experience}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm text-gray-500">Status</span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass}">
                                    ${statusDisplay}
                                </span>
                            </div>
                            <div class="flex flex-col md:col-span-2">
                                <span class="text-sm text-gray-500">Certifications</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${formattedCerts}
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // Set up action buttons
                if (deletePersonnelBtn) {
                    deletePersonnelBtn.dataset.id = person.id;
                }
                
                if (editPersonnelBtn) {
                    editPersonnelBtn.dataset.id = person.id;
                }
                
                // Show the modal
                if (viewPersonnelModal) {
                    viewPersonnelModal.classList.remove('hidden');
                }
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            showNotification(`Error fetching personnel details: ${error.message}`, 'error');
            console.error('Error fetching personnel details:', error);
        });
}

/**
 * Format certifications for display
 * @param {string} certifications - Comma-separated certification list
 * @returns {string} HTML for certification badges
 */
function formatCertifications(certifications) {
    if (!certifications) return 'None';
    
    const certMap = {
        'traffic_management': { label: 'Traffic Management', class: 'bg-indigo-100 text-indigo-800' },
        'emergency_response': { label: 'Emergency Response', class: 'bg-red-100 text-red-800' },
        'first_aid': { label: 'First Aid', class: 'bg-green-100 text-green-800' },
        'leadership': { label: 'Leadership', class: 'bg-yellow-100 text-yellow-800' },
        'technical': { label: 'Technical Systems', class: 'bg-blue-100 text-blue-800' }
    };
    
    const certArray = certifications.split(',');
    let badges = '';
    
    certArray.forEach(cert => {
        const certInfo = certMap[cert] || { label: cert, class: 'bg-gray-100 text-gray-800' };
        badges += `<span class="px-2 py-1 rounded-full text-xs font-medium ${certInfo.class}">${certInfo.label}</span>`;
    });
    
    return badges || 'None';
}

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Edit personnel - redirects to the edit form
 * @param {string|number} id - Personnel ID to edit
 */
function editPersonnel(id) {
    // This is just a convenience wrapper for the modal editing functionality
    if (editPersonnelBtn) {
        editPersonnelBtn.dataset.id = id;
        editPersonnelBtn.click();
    }
}

/**
 * Add or update personnel
 */
function addPersonnel() {
    if (!addPersonnelForm) {
        console.error('Add personnel form not found');
        return;
    }
    
    const isEditMode = addPersonnelForm.dataset.mode === 'edit';
    const personnelId = isEditMode ? addPersonnelForm.dataset.id : null;
    
    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const employeeId = document.getElementById('employeeId').value.trim();
    const department = document.getElementById('department').value;
    const role = document.getElementById('role').value.trim();
    const joinDate = document.getElementById('joinDate').value;
    const status = document.getElementById('status').value;
    
    // Get certifications (multi-select)
    const certSelect = document.getElementById('certifications');
    let certifications = '';
    
    if (certSelect) {
        const selectedCerts = [];
        for (let i = 0; i < certSelect.options.length; i++) {
            if (certSelect.options[i].selected) {
                selectedCerts.push(certSelect.options[i].value);
            }
        }
        certifications = selectedCerts.join(',');
    }
    
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
    
    if (!employeeId) {
        showNotification('Employee ID is required', 'error');
        document.getElementById('employeeId').focus();
        return;
    }
    
    if (!role) {
        showNotification('Role is required', 'error');
        document.getElementById('role').focus();
        return;
    }
    
    if (!joinDate) {
        showNotification('Join date is required', 'error');
        document.getElementById('joinDate').focus();
        return;
    }
    
    // Prepare data object
    const personnelData = {
        first_name: firstName,
        last_name: lastName,
        employee_id: employeeId,
        department: department,
        role: role,
        join_date: joinDate,
        status: status,
        certifications: certifications
    };
    
    if (isEditMode) {
        personnelData.id = personnelId;
    }
    
    // Show loading state
    const submitBtn = addPersonnelForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
    
    // API request configuration
    const requestConfig = {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(personnelData)
    };
    
    // Log the request data for debugging
    console.log('Sending personnel data:', {
        url: 'api/personnel.php',
        method: requestConfig.method,
        data: personnelData
    });
    
    // Send request to API
    fetch('api/personnel.php', requestConfig)
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
                if (addPersonnelModal) addPersonnelModal.classList.add('hidden');
                addPersonnelForm.reset();
                addPersonnelForm.dataset.mode = '';
                addPersonnelForm.dataset.id = '';
                
                // Reload personnel list
                loadPersonnel();
            } else {
                // API returned an error
                const errorMsg = data.message || 'Unknown error occurred';
                showNotification(`Error: ${errorMsg}`, 'error');
                console.error('API Error:', data);
                
                // If it's a duplicate employee ID error, focus on that field
                if (errorMsg.includes('employee ID already exists')) {
                    document.getElementById('employeeId').focus();
                }
            }
        })
        .catch((error) => {
            // Network errors or parse errors
            console.error('Error saving personnel:', error);
            
            // Determine type of error and provide helpful message
            let errorMsg = 'Error saving personnel. ';
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMsg += 'Network connection issue. Please check your internet connection.';
            } else if (error.name === 'SyntaxError') {
                errorMsg += 'Server returned invalid data.';
            } else {
                errorMsg += error.message;
            }
            
            showNotification(errorMsg, 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
}

/**
 * Delete personnel
 * @param {string|number} id - Personnel ID to delete
 */
function deletePersonnel(id) {
    fetch(`api/personnel.php?id=${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                showNotification('Personnel deleted successfully', 'success');
                if (viewPersonnelModal) viewPersonnelModal.classList.add('hidden');
                loadPersonnel();
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            showNotification(`Error deleting personnel: ${error.message}`, 'error');
            console.error('Error deleting personnel:', error);
        });
}

/**
 * Utility function to create debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce delay in milliseconds
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
 * Show a notification to the user
 * @param {string} message - Message to show
 * @param {string} type - Type of notification (success, error, warning)
 */
function showNotification(message, type = 'info') {
    // Check if notifications.js is included
    if (typeof createNotification === 'function') {
        createNotification(message, type);
        return;
    }
    
    // Fallback to alert
    if (type === 'error') {
        alert(`Error: ${message}`);
    } else {
        alert(message);
    }
} 