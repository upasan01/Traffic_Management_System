/**
 * Traffic Management System - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication on all pages except login and signup
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'login.html';
        }
    }

    // Handle logout
    const logoutLinks = document.querySelectorAll('[data-logout]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            window.location.href = 'login.html';
        });
    });

    // Update user profile information
    const userEmail = localStorage.getItem('userEmail');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    const profileElements = document.querySelectorAll('[data-profile]');
    profileElements.forEach(element => {
        const field = element.getAttribute('data-profile');
        if (field === 'name' && userData.name) {
            element.textContent = userData.name;
        } else if (field === 'email' && userEmail) {
            element.textContent = userEmail;
        }
    });

    // Handle sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // Handle user menu
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }

    // Initialize other common functionality
    initializeCommonFunctionality();
});

/**
 * Initialize other common functionality used across all pages
 */
function initializeCommonFunctionality() {
    // Add any additional common functionality here
    
    // Example: Initialize tooltips if needed
    initTooltips();
    
    // Example: Handle dropdown toggling
    handleDropdowns();
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipElement = document.createElement('div');
            
            tooltipElement.className = 'absolute bg-gray-800 text-white px-2 py-1 rounded text-xs z-50';
            tooltipElement.textContent = tooltipText;
            tooltipElement.style.bottom = '100%';
            tooltipElement.style.left = '50%';
            tooltipElement.style.transform = 'translateX(-50%)';
            tooltipElement.style.marginBottom = '5px';
            tooltipElement.style.whiteSpace = 'nowrap';
            tooltipElement.style.animation = 'fadeIn 0.2s ease-in-out';
            
            this.style.position = 'relative';
            this.appendChild(tooltipElement);
        });
        
        tooltip.addEventListener('mouseleave', function() {
            const tooltipElement = this.querySelector('div');
            if (tooltipElement) {
                tooltipElement.remove();
            }
        });
    });
}

/**
 * Handle dropdowns throughout the application
 */
function handleDropdowns() {
    const dropdownButtons = document.querySelectorAll('.dropdown-button');
    
    dropdownButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const dropdownContent = this.nextElementSibling;
            if (dropdownContent) {
                dropdownContent.classList.toggle('hidden');
            }
        });
    });
    
    // Close all dropdowns when clicking outside
    document.addEventListener('click', function() {
        const dropdownContents = document.querySelectorAll('.dropdown-content');
        dropdownContents.forEach(content => {
            if (!content.classList.contains('hidden')) {
                content.classList.add('hidden');
            }
        });
    });
}

// Initialize the map
let map;
let markers = [];

function initMap() {
    // Default center (you can change this to your city's coordinates)
    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi coordinates
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 12
    });

    // Add traffic layer
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    // Load initial data
    loadTrafficData();
    loadIncidents();
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

// Load traffic data
async function loadTrafficData() {
    try {
        const response = await fetch('api/traffic.php');
        const data = await response.json();
        
        updateTrafficStats(data);
        updateTrafficFlow(data.flow);
    } catch (error) {
        console.error('Error loading traffic data:', error);
    }
}

// Update traffic statistics
function updateTrafficStats(data) {
    document.querySelector('.text-blue-600').textContent = data.totalVehicles;
    document.querySelector('.text-red-600').textContent = data.incidents;
}

// Update traffic flow indicator
function updateTrafficFlow(flow) {
    const flowElement = document.querySelector('.text-green-600');
    flowElement.textContent = flow;
    
    // Add appropriate class based on flow
    flowElement.className = 'text-3xl font-bold';
    if (flow === 'Normal') {
        flowElement.classList.add('text-green-600');
    } else if (flow === 'Slow') {
        flowElement.classList.add('text-yellow-600');
    } else {
        flowElement.classList.add('text-red-600');
    }
}

// Load incidents
async function loadIncidents() {
    try {
        const response = await fetch('api/incidents.php');
        const data = await response.json();
        
        updateIncidentsTable(data);
    } catch (error) {
        console.error('Error loading incidents:', error);
    }
}

// Update incidents table
function updateIncidentsTable(incidents) {
    const tableBody = document.getElementById('incidentsTable');
    tableBody.innerHTML = '';

    incidents.forEach(incident => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors duration-200';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${incident.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${incident.location}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${incident.type}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                    incident.status === 'Active' ? 'bg-red-100 text-red-800' : 
                    incident.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                    'bg-yellow-100 text-yellow-800'
                }">
                    ${incident.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(incident.time).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Refresh data every 30 seconds
setInterval(() => {
    loadTrafficData();
    loadIncidents();
}, 30000);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTrafficData();
    loadIncidents();
}); 