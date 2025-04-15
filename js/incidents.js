// Create direct definitions for critical modal functions
window.openIncidentModal = function(incident = null) {
    console.log("Global openIncidentModal called directly");
    
    // Show the modal
    const modal = document.getElementById('incidentModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Animate in
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            setTimeout(() => {
                modalContent.classList.remove('opacity-0', 'translate-y-4');
                modalContent.classList.add('opacity-100', 'translate-y-0');
            }, 10);
        }
        
        // If editing, populate form data
        if (incident) {
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'Edit Incident';
            
            const submitBtn = document.getElementById('submitIncidentBtn');
            if (submitBtn) submitBtn.textContent = 'Update Incident';
            
            // Set editing state
            window.isEditing = true;
            window.currentIncidentId = incident.id;
            
            // Populate form
            const victimName = document.getElementById('victimName');
            const incidentType = document.getElementById('incidentType');
            const locationField = document.getElementById('location');
            const statusField = document.getElementById('status');
            const descriptionField = document.getElementById('description');
            
            if (victimName) victimName.value = incident.victim_name;
            if (incidentType) incidentType.value = incident.type;
            if (locationField) locationField.value = incident.location;
            if (statusField) statusField.value = incident.status;
            if (descriptionField) descriptionField.value = incident.description;
        } else {
            // New incident
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'Add New Incident';
            
            const submitBtn = document.getElementById('submitIncidentBtn');
            if (submitBtn) submitBtn.textContent = 'Add Incident';
            
            // Reset editing state
            window.isEditing = false;
            window.currentIncidentId = null;
            
            // Reset form
            const form = document.getElementById('incidentForm');
            if (form) form.reset();
        }
    } else {
        console.error("Modal element not found!");
    }
};

window.closeIncidentModal = function() {
    console.log("Global closeIncidentModal called directly");
    
    const modal = document.getElementById('incidentModal');
    if (modal) {
        // Animate out
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('opacity-100', 'translate-y-0');
            modalContent.classList.add('opacity-0', 'translate-y-4');
            
            // Hide after animation
            setTimeout(() => {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                
                // Reset form
                const form = document.getElementById('incidentForm');
                if (form) form.reset();
            }, 300);
        } else {
            // No animation, just hide
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
    } else {
        console.error("Modal element not found!");
    }
};

// Demo data
const demoIncidents = [
    {
        id: 1,
        victim_name: "John Smith",
        type: "Accident",
        location: "Main St & 5th Ave",
        status: "Active",
        description: "Two-vehicle collision with minor injuries",
        created_at: "2023-06-15 08:30:45"
    },
    {
        id: 2,
        victim_name: "Mary Johnson",
        type: "Traffic Jam",
        location: "Highway 101, Mile 24",
        status: "Pending",
// Initialize page on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded - initializing incidents page');
    
    // Load data
    try {
        const savedIncidents = localStorage.getItem('trafficIncidents');
        if (savedIncidents) {
            window.incidents = JSON.parse(savedIncidents);
            console.log('Loaded incidents from localStorage:', window.incidents.length);
        } 
        
        if (!window.incidents || window.incidents.length === 0) {
            console.log('No saved incidents, using demo data');
            window.incidents = [...demoIncidents];
            localStorage.setItem('trafficIncidents', JSON.stringify(window.incidents));
        }
    } catch (e) {
        console.error('Error loading incidents:', e);
        window.incidents = [...demoIncidents];
    }
    
    // Render incidents table
    if (typeof window.renderIncidents === 'function') {
        window.renderIncidents(window.incidents);
    } else {
        console.error('renderIncidents function not found!');
        // Fallback rendering logic
        const tableBody = document.getElementById('incidentsTableBody');
        if (tableBody && window.incidents) {
            tableBody.innerHTML = '';
            window.incidents.forEach(incident => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${incident.victim_name}</td>
                    <td>${incident.type}</td>
                    <td>${incident.location}</td>
                    <td>${incident.status}</td>
                    <td>${incident.description}</td>
                    <td>${incident.created_at}</td>
                    <td>
                        <button onclick="window.editIncident(${incident.id})">Edit</button>
                        <button onclick="window.deleteIncident(${incident.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
    
    // Add form submit handler
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            console.log('Form submitted');
            
            // Get form data
            const formData = new FormData(incidentForm);
            const incidentData = {
                victim_name: formData.get('victimName'),
                type: formData.get('incidentType'),
                location: formData.get('location'),
                status: formData.get('status'),
                description: formData.get('description')
            };
            
            if (window.isEditing && window.currentIncidentId) {
                // Update existing incident
                const index = window.incidents.findIndex(inc => inc.id === window.currentIncidentId);
                if (index !== -1) {
                    incidentData.id = window.currentIncidentId;
                    incidentData.created_at = window.incidents[index].created_at;
                    window.incidents[index] = incidentData;
                    alert('Incident updated successfully!');
                }
            } else {
                // Add new incident
                const newId = window.incidents.length > 0 ? 
                    Math.max(...window.incidents.map(inc => inc.id)) + 1 : 1;
                
                const newIncident = {
                    ...incidentData,
                    id: newId,
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                };
                
                window.incidents.unshift(newIncident);
                alert('New incident added successfully!');
            }
            
            // Save to localStorage
            localStorage.setItem('trafficIncidents', JSON.stringify(window.incidents));
            
            // Close modal
            window.closeIncidentModal();
            
            // Render updated table
            if (typeof window.renderIncidents === 'function') {
                window.renderIncidents(window.incidents);
            }
            
            // Update counters
            updateCounters();
        });
    }
    
    // Update counters initially
    updateCounters();
    
    function updateCounters() {
        const totalCounter = document.getElementById('totalIncidentsCount');
        if (totalCounter) totalCounter.textContent = window.incidents.length;
        
        const activeCounter = document.getElementById('activeIncidentsCount');
        if (activeCounter) {
            const activeCount = window.incidents.filter(inc => inc.status === 'Active').length;
            activeCounter.textContent = activeCount;
        }
        
        const resolvedCounter = document.getElementById('resolvedIncidentsCount');
        if (resolvedCounter) {
            const resolvedCount = window.incidents.filter(inc => inc.status === 'Resolved').length;
            resolvedCounter.textContent = resolvedCount;
        }
    }
    
    // Setup additional functions if needed
    window.resetIncidents = function() {
        if (confirm('Are you sure you want to reset to default data?')) {
            window.incidents = [...demoIncidents];
            localStorage.setItem('trafficIncidents', JSON.stringify(window.incidents));
            if (typeof window.renderIncidents === 'function') {
                window.renderIncidents(window.incidents);
            }
            updateCounters();
            alert('Reset to default data complete');
        }
    };
    
    window.clearAllIncidents = function() {
        if (confirm('Are you sure you want to clear all incidents?')) {
            window.incidents = [];
            localStorage.setItem('trafficIncidents', JSON.stringify(window.incidents));
            if (typeof window.renderIncidents === 'function') {
                window.renderIncidents(window.incidents);
            }
            updateCounters();
            alert('All incidents cleared');
        }
    };
    
    window.exportIncidentsToCSV = function() {
        let csvContent = "ID,Victim Name,Type,Location,Status,Description,Created At\n";
        
        window.incidents.forEach(incident => {
            csvContent += `${incident.id},"${incident.victim_name}","${incident.type}","${incident.location}","${incident.status}","${incident.description}","${incident.created_at}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'incidents.csv');
        a.click();
        
        alert('Incidents exported to CSV');
    };
});

// Setup global functions to ensure they're accessible from HTML buttons
window.openIncidentModal = openIncidentModal;
window.closeIncidentModal = closeIncidentModal;
window.editIncident = editIncident;
window.deleteIncident = deleteIncident;
window.resetIncidents = resetToDefaultData;
window.clearAllIncidents = clearAllIncidents;
window.exportIncidentsToCSV = exportIncidentsToCSV;
window.updateDashboardCounters = updateDashboardCounters;
window.renderIncidents = renderIncidents;

// Make sure openIncidentModal is available after page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Incidents page initialized, global functions exposed');
    // Check if openIncidentModal is exposed correctly
    if (typeof window.openIncidentModal === 'function') {
        console.log('openIncidentModal successfully exposed to global scope');
    }
});

// Add a direct DOM content loaded handler for extra safety
document.addEventListener('DOMContentLoaded', function() {
    console.log('EXTRA SAFETY: Setting up direct global incident handlers');
    
    // Ensure critical handlers are definitely available
    if (typeof window.openIncidentModal !== 'function') {
        window.openIncidentModal = function(incident = null) {
            console.log("Emergency fallback openIncidentModal called");
            
            // Get the modal directly
            const modal = document.getElementById('incidentModal');
            if (!modal) {
                console.error("No incident modal found");
                return;
            }
            
            // Show modal
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Find and animate the content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                setTimeout(() => {
                    modalContent.classList.remove('opacity-0', 'translate-y-4');
                    modalContent.classList.add('opacity-100', 'translate-y-0');
                }, 10);
            }
        };
    }
    
    if (typeof window.closeIncidentModal !== 'function') {
        window.closeIncidentModal = function() {
            console.log("Emergency fallback closeIncidentModal called");
            
            const modal = document.getElementById('incidentModal');
            if (!modal) {
                return;
            }
            
            // Hide modal
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        };
    }
    
    // Connect event listeners directly to the buttons for absolute certainty
    const addButtons = document.querySelectorAll('#addIncidentBtn, #headerAddIncidentBtn');
    addButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                console.log('Direct click handler for add button');
                try {
                    const modal = document.getElementById('incidentModal');
                    if (modal) {
                        modal.classList.remove('hidden');
                        modal.classList.add('flex');
                        console.log('Modal opened via direct handler');
                        
                        // Find and animate content
                        const modalContent = modal.querySelector('.modal-content');
                        if (modalContent) {
                            setTimeout(() => {
                                modalContent.classList.remove('opacity-0', 'translate-y-4');
                                modalContent.classList.add('opacity-100', 'translate-y-0');
                            }, 10);
                        }
                    } else {
                        console.error('Modal element not found!');
                    }
                } catch (e) {
                    console.error('Error in direct click handler:', e);
                }
            });
            console.log('Direct click handler added to button:', button.id);
        }
    });
    
    // Add direct handlers for closing modal
    const closeButtons = document.querySelectorAll('#closeModalBtn, #cancelBtn');
    closeButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                console.log('Direct click handler for close button');
                try {
                    const modal = document.getElementById('incidentModal');
                    if (modal) {
                        // Animate out if possible
                        const modalContent = modal.querySelector('.modal-content');
                        if (modalContent) {
                            modalContent.classList.add('opacity-0', 'translate-y-4');
                            setTimeout(() => {
                                modal.classList.add('hidden');
                                modal.classList.remove('flex');
                            }, 300);
                        } else {
                            modal.classList.add('hidden');
                            modal.classList.remove('flex');
                        }
                        console.log('Modal closed via direct handler');
                    }
                } catch (e) {
                    console.error('Error in direct close handler:', e);
                }
            });
        }
    });
    
    // Handle click outside modal to close
    const modal = document.getElementById('incidentModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                try {
                    // Similar animation
                    const modalContent = modal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.classList.add('opacity-0', 'translate-y-4');
                        setTimeout(() => {
                            modal.classList.add('hidden');
                            modal.classList.remove('flex');
                        }, 300);
                    } else {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                    }
                } catch (e) {
                    console.error('Error handling click outside modal:', e);
                }
            }
        });
    }
});