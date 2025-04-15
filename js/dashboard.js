document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Demo data
    const demoData = {
        totalDrivers: 42,
        activeIncidents: 5,
        onDutyPersonnel: 12,
        todayIncidents: 8,
        recentActivity: [
            {
                type: 'incident',
                title: 'New Incident Reported',
                description: 'Traffic accident at Main Street',
                time: '10 minutes ago',
                icon: 'exclamation-triangle',
                color: 'red'
            },
            {
                type: 'driver',
                title: 'New Driver Registered',
                description: 'John Doe registered as new driver',
                time: '30 minutes ago',
                icon: 'user',
                color: 'blue'
            },
            {
                type: 'personnel',
                title: 'Personnel Status Update',
                description: 'Sarah Johnson started her shift',
                time: '1 hour ago',
                icon: 'users',
                color: 'green'
            },
            {
                type: 'incident',
                title: 'Incident Resolved',
                description: 'Traffic congestion cleared at Park Avenue',
                time: '2 hours ago',
                icon: 'check-circle',
                color: 'green'
            }
        ]
    };

    // Update stats
    document.getElementById('totalDrivers').textContent = demoData.totalDrivers;
    document.getElementById('activeIncidents').textContent = demoData.activeIncidents;
    document.getElementById('onDutyPersonnel').textContent = demoData.onDutyPersonnel;
    document.getElementById('todayIncidents').textContent = demoData.todayIncidents;

    // Update recent activity
    const recentActivityContainer = document.getElementById('recentActivity');
    demoData.recentActivity.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'flex items-start';
        activityItem.innerHTML = `
            <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-10 w-10 rounded-full bg-${activity.color}-100">
                    <i class="fas fa-${activity.icon} text-${activity.color}-600"></i>
                </div>
            </div>
            <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${activity.title}</div>
                <div class="text-sm text-gray-500">${activity.description}</div>
                <div class="mt-1 text-xs text-gray-400">${activity.time}</div>
            </div>
        `;
        recentActivityContainer.appendChild(activityItem);
    });
}); 