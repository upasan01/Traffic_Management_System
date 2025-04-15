// Chart configurations
const chartConfigs = {
    typeChart: {
        type: 'doughnut',
        data: {
            labels: ['Accidents', 'Traffic Jams', 'Road Blocks', 'Weather'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Incident Types Distribution',
                    font: {
                        size: 16,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            cutout: '70%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    },
    statusChart: {
        type: 'bar',
        data: {
            labels: ['Active', 'Pending', 'Resolved'],
            datasets: [{
                label: 'Incidents by Status',
                data: [15, 8, 12],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Incidents by Status',
                    font: {
                        size: 16,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    },
    hourlyChart: {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Incidents per Hour',
                data: [5, 3, 8, 12, 9, 6],
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Hourly Incident Distribution',
                    font: {
                        size: 16,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    },
    trafficFlowChart: {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Vehicle Flow',
                data: [120, 80, 350, 280, 400, 250],
                borderColor: 'rgba(79, 70, 229, 1)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Pedestrian Flow',
                data: [50, 30, 150, 120, 180, 100],
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    },
    incidentDistributionChart: {
        type: 'bar',
        data: {
            labels: ['Accidents', 'Traffic Jams', 'Road Blocks', 'Weather'],
            datasets: [{
                label: 'Severity Level',
                data: [3, 2, 1, 2],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Severity Level'
                    }
                }
            }
        }
    },
    peakHoursChart: {
        type: 'radar',
        data: {
            labels: ['Morning', 'Noon', 'Evening', 'Night'],
            datasets: [{
                label: 'Traffic Volume',
                data: [85, 65, 90, 40],
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                pointBackgroundColor: 'rgba(79, 70, 229, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    },
    weatherImpactChart: {
        type: 'bar',
        data: {
            labels: ['Sunny', 'Rainy', 'Cloudy', 'Foggy'],
            datasets: [{
                label: 'Incidents',
                data: [5, 12, 8, 15],
                backgroundColor: [
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(156, 163, 175, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    },
    responseTimeChart: {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Average Response Time',
                data: [12, 10, 9, 8, 7, 6],
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Minutes'
                    }
                }
            }
        }
    }
};

// Initialize all charts
function initializeCharts() {
    // Initialize existing charts
    new Chart(document.getElementById('typeChart'), chartConfigs.typeChart);
    new Chart(document.getElementById('statusChart'), chartConfigs.statusChart);
    new Chart(document.getElementById('hourlyChart'), chartConfigs.hourlyChart);
    
    // Initialize new charts
    new Chart(document.getElementById('trafficFlowChart'), chartConfigs.trafficFlowChart);
    new Chart(document.getElementById('incidentDistributionChart'), chartConfigs.incidentDistributionChart);
    new Chart(document.getElementById('peakHoursChart'), chartConfigs.peakHoursChart);
    new Chart(document.getElementById('weatherImpactChart'), chartConfigs.weatherImpactChart);
    new Chart(document.getElementById('responseTimeChart'), chartConfigs.responseTimeChart);
}

// Demo data for overview cards
const demoOverviewData = {
    totalIncidents: 35,
    activeIncidents: 15,
    resolvedIncidents: 12,
    averageResponseTime: '45 min'
};

// Update overview cards
function updateOverviewCards() {
    document.getElementById('totalIncidents').textContent = demoOverviewData.totalIncidents;
    document.getElementById('activeIncidents').textContent = demoOverviewData.activeIncidents;
    document.getElementById('resolvedIncidents').textContent = demoOverviewData.resolvedIncidents;
    document.getElementById('averageResponseTime').textContent = demoOverviewData.averageResponseTime;
}

// Add hover effects to cards
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.bg-white');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
    });
}

// Update metrics based on time range
function updateMetrics(timeRange) {
    const metrics = {
        day: {
            trafficVolume: '12,456',
            avgSpeed: '45 km/h',
            congestionLevel: 'Medium',
            responseTime: '8.5 min'
        },
        week: {
            trafficVolume: '85,192',
            avgSpeed: '42 km/h',
            congestionLevel: 'High',
            responseTime: '9.2 min'
        },
        month: {
            trafficVolume: '365,789',
            avgSpeed: '40 km/h',
            congestionLevel: 'Medium',
            responseTime: '10.5 min'
        },
        year: {
            trafficVolume: '4,389,456',
            avgSpeed: '38 km/h',
            congestionLevel: 'High',
            responseTime: '12.3 min'
        }
    };

    const data = metrics[timeRange];
    document.getElementById('trafficVolume').textContent = data.trafficVolume;
    document.getElementById('avgSpeed').textContent = data.avgSpeed;
    document.getElementById('congestionLevel').textContent = data.congestionLevel;
    document.getElementById('responseTime').textContent = data.responseTime;
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateOverviewCards();
    addCardHoverEffects();
    
    // Time range selector
    const timeRangeSelect = document.getElementById('timeRange');
    timeRangeSelect.addEventListener('change', (e) => {
        updateMetrics(e.target.value);
    });
    
    // Export button
    document.querySelector('.btn-primary').addEventListener('click', () => {
        // Simulate export functionality
        alert('Exporting analytics data...');
    });
    
    // Chart type toggles
    document.querySelectorAll('.chart-container button').forEach(button => {
        button.addEventListener('click', (e) => {
            const container = e.target.closest('.chart-container');
            container.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('bg-indigo-100', 'text-indigo-600');
                btn.classList.add('bg-gray-100', 'text-gray-600');
            });
            e.target.classList.remove('bg-gray-100', 'text-gray-600');
            e.target.classList.add('bg-indigo-100', 'text-indigo-600');
        });
    });
    
    // Update data every 30 seconds
    setInterval(() => {
        updateOverviewCards();
    }, 30000);

    // Load analytics data
    loadAnalyticsData();

    // Export button functionality
    const exportButton = document.getElementById('exportReport');
    if (exportButton) {
        exportButton.addEventListener('click', exportReport);
    }
});

function loadAnalyticsData() {
    // Check if API is available
    fetch('api/analytics.php?action=status')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                loadAnalyticsFromAPI();
            } else {
                loadFallbackData();
            }
        })
        .catch(() => {
            loadFallbackData();
        });
}

function loadAnalyticsFromAPI() {
    fetch('api/analytics.php?action=get')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateAnalyticsUI(data.data);
            } else {
                loadFallbackData();
            }
        })
        .catch(() => {
            loadFallbackData();
        });
}

function loadFallbackData() {
    console.log('Loading fallback analytics data');
    
    // Demo data
    const demoData = {
        traffic_flow: {
            current: 85,
            previous: 78,
            trend: 'up'
        },
        incident_stats: {
            total: 24,
            resolved: 18,
            pending: 6
        },
        driver_stats: {
            total: 156,
            active: 142,
            suspended: 14
        },
        peak_hours: {
            morning: '8:00 AM - 10:00 AM',
            evening: '5:00 PM - 7:00 PM'
        },
        recent_incidents: [
            {
                id: 1,
                type: 'Accident',
                location: 'Main Street',
                severity: 'High',
                status: 'Resolved',
                timestamp: '2024-03-15 14:30'
            },
            {
                id: 2,
                type: 'Traffic Jam',
                location: 'Highway 101',
                severity: 'Medium',
                status: 'Pending',
                timestamp: '2024-03-15 15:45'
            }
        ]
    };

    updateAnalyticsUI(demoData);
}

function updateAnalyticsUI(data) {
    // Update traffic flow
    const flowElement = document.getElementById('trafficFlow');
    if (flowElement) {
        flowElement.textContent = `${data.traffic_flow.current}%`;
        const trendElement = flowElement.nextElementSibling;
        if (trendElement) {
            trendElement.className = `flex items-center text-sm ${
                data.traffic_flow.trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`;
            trendElement.innerHTML = `
                <i class="fas fa-${data.traffic_flow.trend === 'up' ? 'arrow-up' : 'arrow-down'} mr-1"></i>
                ${Math.abs(data.traffic_flow.current - data.traffic_flow.previous)}%
            `;
        }
    }

    // Update incident stats
    const incidentElement = document.getElementById('incidentStats');
    if (incidentElement) {
        incidentElement.innerHTML = `
            <div class="text-2xl font-bold">${data.incident_stats.total}</div>
            <div class="text-sm text-gray-500">Total Incidents</div>
            <div class="mt-2">
                <span class="text-green-500">${data.incident_stats.resolved} Resolved</span>
                <span class="mx-2">|</span>
                <span class="text-yellow-500">${data.incident_stats.pending} Pending</span>
            </div>
        `;
    }

    // Update driver stats
    const driverElement = document.getElementById('driverStats');
    if (driverElement) {
        driverElement.innerHTML = `
            <div class="text-2xl font-bold">${data.driver_stats.total}</div>
            <div class="text-sm text-gray-500">Total Drivers</div>
            <div class="mt-2">
                <span class="text-green-500">${data.driver_stats.active} Active</span>
                <span class="mx-2">|</span>
                <span class="text-red-500">${data.driver_stats.suspended} Suspended</span>
            </div>
        `;
    }

    // Update peak hours
    const peakElement = document.getElementById('peakHours');
    if (peakElement) {
        peakElement.innerHTML = `
            <div class="mb-2">
                <span class="font-semibold">Morning:</span> ${data.peak_hours.morning}
            </div>
            <div>
                <span class="font-semibold">Evening:</span> ${data.peak_hours.evening}
            </div>
        `;
    }

    // Update recent incidents
    const incidentsElement = document.getElementById('recentIncidents');
    if (incidentsElement) {
        incidentsElement.innerHTML = data.recent_incidents.map(incident => `
            <div class="border-b border-gray-200 py-3">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="font-semibold">${incident.type}</span>
                        <span class="text-sm text-gray-500 ml-2">${incident.location}</span>
                    </div>
                    <span class="px-2 py-1 text-xs rounded ${
                        incident.severity === 'High' ? 'bg-red-100 text-red-800' :
                        incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }">
                        ${incident.severity}
                    </span>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                    ${new Date(incident.timestamp).toLocaleString()}
                </div>
            </div>
        `).join('');
    }
}

function exportReport() {
    // Get current date for filename
    const date = new Date();
    const filename = `traffic_report_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.pdf`;

    // Create PDF content
    const content = `
        Traffic Management System Report
        Generated on: ${date.toLocaleString()}
        
        Traffic Flow: ${document.getElementById('trafficFlow').textContent}
        
        Incident Statistics:
        - Total Incidents: ${document.querySelector('#incidentStats .text-2xl').textContent}
        - Resolved: ${document.querySelector('#incidentStats .text-green-500').textContent.split(' ')[0]}
        - Pending: ${document.querySelector('#incidentStats .text-yellow-500').textContent.split(' ')[0]}
        
        Driver Statistics:
        - Total Drivers: ${document.querySelector('#driverStats .text-2xl').textContent}
        - Active: ${document.querySelector('#driverStats .text-green-500').textContent.split(' ')[0]}
        - Suspended: ${document.querySelector('#driverStats .text-red-500').textContent.split(' ')[0]}
        
        Peak Hours:
        ${document.getElementById('peakHours').textContent.trim()}
        
        Recent Incidents:
        ${Array.from(document.querySelectorAll('#recentIncidents > div')).map(div => div.textContent.trim()).join('\n')}
    `;

    // Create blob and download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    const exportButton = document.getElementById('exportReport');
    if (exportButton) {
        const originalText = exportButton.innerHTML;
        exportButton.innerHTML = '<i class="fas fa-check mr-2"></i>Report Exported';
        exportButton.classList.remove('bg-indigo-600');
        exportButton.classList.add('bg-green-500');
        
        setTimeout(() => {
            exportButton.innerHTML = originalText;
            exportButton.classList.remove('bg-green-500');
            exportButton.classList.add('bg-indigo-600');
        }, 2000);
    }
} 