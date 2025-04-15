/**
 * Traffic Management System - Settings Module
 */

// Default settings
const DEFAULT_SETTINGS = {
    // General settings
    systemName: "Traffic Management System",
    defaultView: "dashboard",
    dateFormat: "MM/DD/YYYY",
    autoRefresh: false,
    refreshInterval: 60,
    
    // Appearance settings
    theme: "light",
    sidebarPosition: "left",
    compactMode: false,
    accentColor: "#4f46e5",
    
    // Notification settings
    notificationPreferences: {
        newIncidents: true,
        statusUpdates: true,
        systemAlerts: true
    },
    notificationDuration: 3000,
    emailNotifications: false,
    notificationEmail: "",
    
    // Data settings
    dataRetention: "forever",
    
    // Account settings
    userName: "Demo User",
    userEmail: "traffic.admin@example.com"
};

// Current settings object
let settings = {};

// DOM Elements
const elements = {};

// Initialize settings
document.addEventListener('DOMContentLoaded', function() {
    console.log("Settings page loaded");
    
    // Initialize sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    // Set up settings navigation
    setupNavigation();
    
    // Load settings from localStorage
    loadSettings();
    
    // Populate form fields with loaded settings
    populateSettings();
    
    // Set up storage usage display
    calculateStorageUsage();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up settings navigation tabs
function setupNavigation() {
    // Get all navigation items and panels
    const navItems = document.querySelectorAll('.settings-nav-item');
    const panels = document.querySelectorAll('.settings-panel');
    
    // Add click event to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get target panel id
            const targetPanel = item.getAttribute('data-target');
            
            // Remove active class from all nav items and panels
            navItems.forEach(navItem => navItem.classList.remove('active'));
            panels.forEach(panel => panel.classList.add('hidden'));
            
            // Add active class to current nav item and panel
            item.classList.add('active');
            document.getElementById(`${targetPanel}-settings`).classList.remove('hidden');
        });
    });
}

// Load settings from localStorage
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('trafficSystem_settings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            console.log("Settings loaded from localStorage:", settings);
        } else {
            // If no settings saved, use defaults
            settings = { ...DEFAULT_SETTINGS };
            console.log("No saved settings found, using defaults");
        }
    } catch (error) {
        console.error("Error loading settings:", error);
        // Fallback to defaults on error
        settings = { ...DEFAULT_SETTINGS };
    }
}

// Save settings to localStorage
function saveSettings() {
    try {
        // Get current values from form elements
        collectFormValues();
        
        // Save to localStorage
        localStorage.setItem('trafficSystem_settings', JSON.stringify(settings));
        console.log("Settings saved:", settings);
        
        // Show success notification
        showNotification("Settings saved successfully", "success");
        
        // Apply settings immediately
        applySettings();
        
        return true;
    } catch (error) {
        console.error("Error saving settings:", error);
        showNotification("Error saving settings", "error");
        return false;
    }
}

// Collect form values into settings object
function collectFormValues() {
    // General settings
    settings.systemName = document.getElementById('systemName').value;
    settings.defaultView = document.getElementById('defaultView').value;
    settings.dateFormat = document.getElementById('dateFormat').value;
    settings.autoRefresh = document.getElementById('autoRefresh').checked;
    settings.refreshInterval = parseInt(document.getElementById('refreshInterval').value);
    
    // Appearance settings
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.classList.contains('active')) {
            if (option.querySelector('span').textContent === 'Light') {
                settings.theme = 'light';
            } else if (option.querySelector('span').textContent === 'Dark') {
                settings.theme = 'dark';
            } else if (option.querySelector('span').textContent === 'Blue') {
                settings.theme = 'blue';
            }
        }
    });
    
    settings.sidebarPosition = document.querySelector('input[name="sidebarPosition"]:checked').value;
    settings.compactMode = document.getElementById('compactMode').checked;
    settings.accentColor = document.getElementById('accentColor').value;
    
    // Notification settings
    settings.notificationPreferences = {
        newIncidents: document.getElementById('newIncidents').checked,
        statusUpdates: document.getElementById('statusUpdates').checked,
        systemAlerts: document.getElementById('systemAlerts').checked
    };
    settings.notificationDuration = parseInt(document.getElementById('notificationDuration').value);
    settings.emailNotifications = document.getElementById('emailNotifications').checked;
    settings.notificationEmail = document.getElementById('notificationEmail').value;
    
    // Data settings
    settings.dataRetention = document.getElementById('dataRetention').value;
    
    // Account settings
    settings.userName = document.getElementById('userName').value;
    settings.userEmail = document.getElementById('userEmail').value;
}

// Populate form fields with current settings
function populateSettings() {
    // General settings
    document.getElementById('systemName').value = settings.systemName || DEFAULT_SETTINGS.systemName;
    document.getElementById('defaultView').value = settings.defaultView || DEFAULT_SETTINGS.defaultView;
    document.getElementById('dateFormat').value = settings.dateFormat || DEFAULT_SETTINGS.dateFormat;
    document.getElementById('autoRefresh').checked = settings.autoRefresh || DEFAULT_SETTINGS.autoRefresh;
    document.getElementById('refreshInterval').value = settings.refreshInterval || DEFAULT_SETTINGS.refreshInterval;
    
    // Appearance settings
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        const themeName = option.querySelector('span').textContent.toLowerCase();
        if (themeName === (settings.theme || DEFAULT_SETTINGS.theme)) {
            option.classList.add('active');
            option.querySelector('i').classList.remove('opacity-0');
        } else {
            option.classList.remove('active');
            option.querySelector('i').classList.add('opacity-0');
        }
    });
    
    document.querySelector(`input[name="sidebarPosition"][value="${settings.sidebarPosition || DEFAULT_SETTINGS.sidebarPosition}"]`).checked = true;
    document.getElementById('compactMode').checked = settings.compactMode || DEFAULT_SETTINGS.compactMode;
    
    const accentColor = settings.accentColor || DEFAULT_SETTINGS.accentColor;
    document.getElementById('accentColor').value = accentColor;
    document.getElementById('accentColorHex').value = accentColor;
    
    // Notification settings
    const notificationPrefs = settings.notificationPreferences || DEFAULT_SETTINGS.notificationPreferences;
    document.getElementById('newIncidents').checked = notificationPrefs.newIncidents;
    document.getElementById('statusUpdates').checked = notificationPrefs.statusUpdates;
    document.getElementById('systemAlerts').checked = notificationPrefs.systemAlerts;
    
    const notificationDuration = settings.notificationDuration || DEFAULT_SETTINGS.notificationDuration;
    document.getElementById('notificationDuration').value = notificationDuration;
    document.getElementById('durationText').textContent = `${notificationDuration / 1000} seconds`;
    
    document.getElementById('emailNotifications').checked = settings.emailNotifications || DEFAULT_SETTINGS.emailNotifications;
    document.getElementById('notificationEmail').value = settings.notificationEmail || DEFAULT_SETTINGS.notificationEmail;
    toggleEmailInput();
    
    // Data settings
    document.getElementById('dataRetention').value = settings.dataRetention || DEFAULT_SETTINGS.dataRetention;
    
    // Account settings
    document.getElementById('userName').value = settings.userName || DEFAULT_SETTINGS.userName;
    document.getElementById('userEmail').value = settings.userEmail || DEFAULT_SETTINGS.userEmail;
}

// Set up all event listeners
function setupEventListeners() {
    // Save settings button
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    
    // Theme options
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            themeOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.querySelector('i').classList.add('opacity-0');
            });
            
            // Add active class to clicked option
            option.classList.add('active');
            option.querySelector('i').classList.remove('opacity-0');
        });
    });
    
    // Notification duration slider
    const durationSlider = document.getElementById('notificationDuration');
    if (durationSlider) {
        durationSlider.addEventListener('input', () => {
            const value = durationSlider.value;
            document.getElementById('durationText').textContent = `${value / 1000} seconds`;
        });
    }
    
    // Email notifications toggle
    const emailToggle = document.getElementById('emailNotifications');
    if (emailToggle) {
        emailToggle.addEventListener('change', toggleEmailInput);
    }
    
    // Accent color change
    const colorPicker = document.getElementById('accentColor');
    const colorHex = document.getElementById('accentColorHex');
    
    if (colorPicker && colorHex) {
        colorPicker.addEventListener('input', () => {
            colorHex.value = colorPicker.value;
        });
        
        colorHex.addEventListener('input', () => {
            // Validate hex color format
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (hexRegex.test(colorHex.value)) {
                colorPicker.value = colorHex.value;
            }
        });
    }
    
    // Reset color button
    const resetColorBtn = document.getElementById('resetColorBtn');
    if (resetColorBtn) {
        resetColorBtn.addEventListener('click', () => {
            colorPicker.value = DEFAULT_SETTINGS.accentColor;
            colorHex.value = DEFAULT_SETTINGS.accentColor;
        });
    }
    
    // Data management buttons
    setupDataManagementListeners();
}

// Toggle email input visibility based on checkbox
function toggleEmailInput() {
    const emailToggle = document.getElementById('emailNotifications');
    const emailContainer = document.getElementById('emailInputContainer');
    
    if (emailToggle && emailContainer) {
        emailContainer.style.display = emailToggle.checked ? 'block' : 'none';
    }
}

// Set up data management event listeners
function setupDataManagementListeners() {
    // Export all data
    const exportBtn = document.getElementById('exportAllDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAllData);
    }
    
    // Import data
    const importBtn = document.getElementById('importDataBtn');
    const importInput = document.getElementById('importFileInput');
    
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });
        
        importInput.addEventListener('change', importData);
    }
    
    // Reset all data
    const resetBtn = document.getElementById('resetAllDataBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllData);
    }
}

// Calculate and display storage usage
function calculateStorageUsage() {
    const storageUsage = document.getElementById('storageUsage');
    const storageBar = document.getElementById('storageUsageBar');
    
    if (!storageUsage || !storageBar) return;
    
    // Get total storage size in bytes
    let totalSize = 0;
    
    try {
        // Measure all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += key.length + value.length;
        }
        
        // Convert to KB or MB for display
        let sizeText = "";
        let percentUsed = 0;
        
        // Assume 5MB max localStorage size (common browser limit)
        const maxSize = 5 * 1024 * 1024;
        
        if (totalSize < 1024) {
            sizeText = `${totalSize} B`;
        } else if (totalSize < 1024 * 1024) {
            sizeText = `${(totalSize / 1024).toFixed(1)} KB`;
        } else {
            sizeText = `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
        }
        
        percentUsed = Math.min(100, Math.round((totalSize / maxSize) * 100));
        
        // Update display
        storageUsage.textContent = `${sizeText} / 5 MB`;
        storageBar.style.width = `${percentUsed}%`;
        
        // Change color based on usage
        if (percentUsed > 80) {
            storageBar.classList.add('bg-red-600');
            storageBar.classList.remove('bg-indigo-600', 'bg-yellow-500');
        } else if (percentUsed > 60) {
            storageBar.classList.add('bg-yellow-500');
            storageBar.classList.remove('bg-indigo-600', 'bg-red-600');
        } else {
            storageBar.classList.add('bg-indigo-600');
            storageBar.classList.remove('bg-yellow-500', 'bg-red-600');
        }
        
    } catch (error) {
        console.error("Error calculating storage usage:", error);
        storageUsage.textContent = "Unable to calculate";
    }
}

// Export all data from localStorage
function exportAllData() {
    try {
        // Collect all localStorage data
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        
        // Create data blob
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `traffic_system_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        showNotification("Data exported successfully", "success");
    } catch (error) {
        console.error("Error exporting data:", error);
        showNotification("Error exporting data", "error");
    }
}

// Import data from file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Confirm before overwriting data
    if (!confirm("This will replace all your current data. Are you sure you want to continue?")) {
        event.target.value = ""; // Clear the file input
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate the imported data format
            if (typeof data !== 'object') {
                throw new Error("Invalid data format");
            }
            
            // Clear existing localStorage
            localStorage.clear();
            
            // Import new data
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }
            
            // Reload settings and update display
            loadSettings();
            populateSettings();
            calculateStorageUsage();
            
            showNotification("Data imported successfully. Refreshing page...", "success");
            
            // Reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error("Error importing data:", error);
            showNotification("Error importing data: Invalid format", "error");
        }
    };
    
    reader.onerror = function() {
        showNotification("Error reading file", "error");
    };
    
    reader.readAsText(file);
    
    // Clear the file input
    event.target.value = "";
}

// Reset all data
function resetAllData() {
    if (!confirm("WARNING: This will delete ALL your data and reset the system to default settings. This action cannot be undone.\n\nAre you absolutely sure you want to continue?")) {
        return;
    }
    
    try {
        // Clear localStorage
        localStorage.clear();
        
        // Set up default settings
        localStorage.setItem('trafficSystem_settings', JSON.stringify(DEFAULT_SETTINGS));
        
        // Show notification
        showNotification("All data has been reset. Refreshing page...", "success");
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error("Error resetting data:", error);
        showNotification("Error resetting data", "error");
    }
}

// Apply settings changes immediately
function applySettings() {
    // Apply theme and other visual settings immediately
    // In a real app, this would apply CSS variables or other changes
    console.log("Applying settings immediately");
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-500 ease-in-out translate-x-full`;
    
    // Set notification style based on type
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-100', 'text-green-800', 'border-l-4', 'border-green-500');
            break;
        case 'error':
            notification.classList.add('bg-red-100', 'text-red-800', 'border-l-4', 'border-red-500');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-100', 'text-yellow-800', 'border-l-4', 'border-yellow-500');
            break;
        default:
            notification.classList.add('bg-blue-100', 'text-blue-800', 'border-l-4', 'border-blue-500');
    }
    
    // Add content
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            </div>
            <div>${message}</div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    // Set notification duration from settings or use default
    const duration = settings.notificationDuration || DEFAULT_SETTINGS.notificationDuration;
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, duration);
} 