/**
 * Traffic Management System - Notifications Module
 */

// Demo notifications
const demoNotifications = [
    {
        id: 1,
        title: "New Incident Reported",
        message: "A new accident has been reported on Main Street",
        type: "danger",
        time: "5 minutes ago",
        read: false
    },
    {
        id: 2,
        title: "Traffic Alert",
        message: "Heavy congestion detected on Highway 101",
        type: "warning",
        time: "20 minutes ago",
        read: false
    },
    {
        id: 3,
        title: "System Update",
        message: "Traffic Management System has been updated to version 2.1",
        type: "info",
        time: "1 hour ago",
        read: true
    }
];

// Global variables
let notifications = [];
let notificationDropdownVisible = false;

// DOM Elements
let notificationButton;
let notificationDropdown;
let notificationCount;

// Initialize notifications
document.addEventListener('DOMContentLoaded', function() {
    console.log("Notifications module loaded");
    
    // Initialize DOM elements
    notificationButton = document.querySelector('.notification-btn');
    notificationCount = document.querySelector('.notification-count');
    
    // Load notifications from localStorage or use demo data
    loadNotifications();
    
    // Update notification count badge
    updateNotificationCount();
    
    // Set up notification button click handler
    setupNotificationButton();
});

// Load notifications from localStorage or use demo data
function loadNotifications() {
    const savedNotifications = localStorage.getItem('trafficNotifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
    } else {
        notifications = [...demoNotifications];
        saveNotificationsToStorage();
    }
}

// Save notifications to localStorage
function saveNotificationsToStorage() {
    localStorage.setItem('trafficNotifications', JSON.stringify(notifications));
}

// Update notification count in badge
function updateNotificationCount() {
    if (!notificationCount) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    notificationCount.textContent = unreadCount;
    
    // Show/hide badge based on count
    if (unreadCount > 0) {
        notificationCount.classList.remove('hidden');
    } else {
        notificationCount.classList.add('hidden');
    }
}

// Set up notification button click handler
function setupNotificationButton() {
    if (!notificationButton) return;
    
    notificationButton.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Check if dropdown already exists
        const existingDropdown = document.getElementById('notificationDropdown');
        if (existingDropdown) {
            existingDropdown.classList.toggle('hidden');
            notificationDropdownVisible = !existingDropdown.classList.contains('hidden');
            
            if (notificationDropdownVisible) {
                renderNotificationDropdown(existingDropdown);
            }
        } else {
            // Create dropdown if it doesn't exist
            createNotificationDropdown();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown && !dropdown.contains(e.target) && !notificationButton.contains(e.target)) {
            dropdown.classList.add('hidden');
            notificationDropdownVisible = false;
        }
    });
}

// Create notification dropdown
function createNotificationDropdown() {
    // Create dropdown element
    notificationDropdown = document.createElement('div');
    notificationDropdown.id = 'notificationDropdown';
    notificationDropdown.className = 'absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden';
    notificationDropdown.style.top = '100%';
    
    // Position the dropdown relative to the button
    const buttonRect = notificationButton.getBoundingClientRect();
    notificationDropdown.style.right = '0';
    
    // Render dropdown content
    renderNotificationDropdown(notificationDropdown);
    
    // Add dropdown to DOM
    const parentContainer = notificationButton.closest('.relative');
    parentContainer.appendChild(notificationDropdown);
    
    notificationDropdownVisible = true;
}

// Render notification dropdown content
function renderNotificationDropdown(dropdown) {
    // Mark all as read when opening dropdown
    markAllNotificationsAsRead();
    
    // Notification dropdown header
    let content = `
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div class="flex justify-between items-center">
                <h3 class="text-sm font-semibold text-gray-700">Notifications</h3>
                <button id="clearAllNotifications" class="text-xs text-indigo-600 hover:text-indigo-800">
                    Clear All
                </button>
            </div>
        </div>
    `;
    
    // Notification items
    if (notifications.length > 0) {
        content += '<div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">';
        notifications.forEach(notification => {
            const typeClass = getNotificationTypeClass(notification.type);
            content += `
                <div class="px-4 py-3 hover:bg-gray-50 transition-colors duration-150 flex items-start">
                    <div class="flex-shrink-0 mr-3">
                        <div class="w-8 h-8 rounded-full ${typeClass} flex items-center justify-center">
                            <i class="fas ${getNotificationTypeIcon(notification.type)} text-white"></i>
                        </div>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                        <p class="text-sm text-gray-600">${notification.message}</p>
                        <p class="text-xs text-gray-500 mt-1">${notification.time}</p>
                    </div>
                    <button class="delete-notification text-gray-400 hover:text-gray-600" data-id="${notification.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        content += '</div>';
    } else {
        content += `
            <div class="px-4 py-6 text-center text-gray-500">
                <i class="fas fa-bell-slash text-2xl mb-2"></i>
                <p>No notifications</p>
            </div>
        `;
    }
    
    // Set dropdown content
    dropdown.innerHTML = content;
    
    // Add event listeners to dropdown elements
    addDropdownEventListeners(dropdown);
}

// Get notification type class for styling
function getNotificationTypeClass(type) {
    switch(type) {
        case 'danger':
            return 'bg-red-500';
        case 'warning':
            return 'bg-yellow-500';
        case 'success':
            return 'bg-green-500';
        case 'info':
        default:
            return 'bg-blue-500';
    }
}

// Get notification type icon
function getNotificationTypeIcon(type) {
    switch(type) {
        case 'danger':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'success':
            return 'fa-check-circle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

// Add event listeners to dropdown elements
function addDropdownEventListeners(dropdown) {
    // Clear all notifications
    const clearAllBtn = dropdown.querySelector('#clearAllNotifications');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            notifications = [];
            saveNotificationsToStorage();
            renderNotificationDropdown(dropdown);
            updateNotificationCount();
        });
    }
    
    // Delete individual notification
    const deleteButtons = dropdown.querySelectorAll('.delete-notification');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationId = parseInt(this.getAttribute('data-id'));
            deleteNotification(notificationId);
            renderNotificationDropdown(dropdown);
        });
    });
}

// Delete a notification by id
function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveNotificationsToStorage();
    updateNotificationCount();
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    let hasUnread = false;
    
    notifications.forEach(notification => {
        if (!notification.read) {
            notification.read = true;
            hasUnread = true;
        }
    });
    
    if (hasUnread) {
        saveNotificationsToStorage();
        updateNotificationCount();
    }
}

// Create and show a new notification
function addNotification(title, message, type = 'info') {
    const notification = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        time: 'Just now',
        read: false
    };
    
    notifications.unshift(notification);
    
    // Keep only the most recent 10 notifications
    if (notifications.length > 10) {
        notifications.pop();
    }
    
    saveNotificationsToStorage();
    updateNotificationCount();
    
    // Show toast notification
    showToast(notification);
}

// Show toast notification
function showToast(notification) {
    // Create notification element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 w-80 px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-500 ease-in-out translate-x-full`;
    
    // Set notification style based on type
    const typeClass = getToastTypeClass(notification.type);
    toast.classList.add(...typeClass.split(' '));
    
    // Add content
    toast.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas ${getNotificationTypeIcon(notification.type)} mr-2"></i>
            </div>
            <div class="ml-3 w-0 flex-1">
                <p class="font-medium">${notification.title}</p>
                <p class="mt-1 text-sm">${notification.message}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
                <button class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Add close button functionality
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 500);
    });
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
        toast.classList.add('translate-x-0');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 500);
        }
    }, 5000);
}

// Get toast type classes
function getToastTypeClass(type) {
    switch(type) {
        case 'danger':
            return 'bg-red-100 text-red-800 border-l-4 border-red-500';
        case 'warning':
            return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
        case 'success':
            return 'bg-green-100 text-green-800 border-l-4 border-green-500';
        case 'info':
        default:
            return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
    }
}

// Expose functions to global scope
window.addNotification = addNotification; 