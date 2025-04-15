// Traffic Heat Map Implementation
document.addEventListener('DOMContentLoaded', () => {
    // Initialize heat map once DOM is loaded
    initializeHeatMap();
});

function initializeHeatMap() {
    const heatMapContainer = document.getElementById('heatMap');
    
    // Clear placeholder content
    heatMapContainer.innerHTML = '';
    
    // Create map wrapper
    const mapWrapper = document.createElement('div');
    mapWrapper.className = 'relative w-full h-full rounded-lg overflow-hidden';
    heatMapContainer.appendChild(mapWrapper);
    
    // Add map image background
    const mapImage = document.createElement('img');
    mapImage.src = 'images/city-map.jpg';
    mapImage.className = 'w-full h-full object-cover';
    mapImage.alt = 'City Map';
    mapImage.onerror = function() {
        // Fallback if image doesn't exist
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YxZjVmOSIvPjxwYXRoIGQ9Ik0xMDAgMTAwaDYwMHY0MDBIMTAweiIgZmlsbD0iI2UyZThmMCIvPjxwYXRoIGQ9Ik0xNTAgMTUwaDUwMHYzMDBIMTUweiIgZmlsbD0iI2NiZDVlMSIvPjxwYXRoIGQ9Ik00MDAgMTAwdjQwMCIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjEwIi8+PHBhdGggZD0iTTEwMCAzMDBoNjAwIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMTAiLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjUwIiBmaWxsPSIjNjQ3NDhiIi8+PC9zdmc+';
    };
    mapWrapper.appendChild(mapImage);
    
    // Add heat overlay container
    const heatOverlay = document.createElement('div');
    heatOverlay.className = 'absolute inset-0';
    mapWrapper.appendChild(heatOverlay);
    
    // Create traffic hotspots (simulation)
    createHotspot(heatOverlay, 30, 40, 'high');
    createHotspot(heatOverlay, 70, 30, 'medium');
    createHotspot(heatOverlay, 50, 60, 'high');
    createHotspot(heatOverlay, 20, 70, 'low');
    createHotspot(heatOverlay, 80, 50, 'medium');
    createHotspot(heatOverlay, 40, 20, 'low');
    
    // Add legend
    addHeatMapLegend(heatMapContainer);
    
    // Add tooltip functionality
    addToolTips(heatOverlay);
}

function createHotspot(container, xPercent, yPercent, intensity) {
    const hotspot = document.createElement('div');
    
    // Set position and size based on intensity
    let size, color;
    switch(intensity) {
        case 'high':
            size = 120;
            color = 'rgba(239, 68, 68, 0.7)'; // Red
            break;
        case 'medium':
            size = 100;
            color = 'rgba(245, 158, 11, 0.7)'; // Orange
            break;
        case 'low':
            size = 80;
            color = 'rgba(16, 185, 129, 0.7)'; // Green
            break;
    }
    
    // Apply styles
    hotspot.className = 'absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse';
    hotspot.style.width = `${size}px`;
    hotspot.style.height = `${size}px`;
    hotspot.style.left = `${xPercent}%`;
    hotspot.style.top = `${yPercent}%`;
    hotspot.style.background = `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`;
    
    // Set data attributes for tooltips
    hotspot.dataset.intensity = intensity;
    hotspot.dataset.location = getLocationName(xPercent, yPercent);
    hotspot.dataset.congestion = getCongestionLevel(intensity);
    
    container.appendChild(hotspot);
}

function addHeatMapLegend(container) {
    const legend = document.createElement('div');
    legend.className = 'absolute bottom-4 right-4 bg-white bg-opacity-80 p-3 rounded-lg shadow-md z-10 flex flex-col gap-2';
    
    const legendTitle = document.createElement('div');
    legendTitle.className = 'text-sm font-semibold';
    legendTitle.textContent = 'Traffic Congestion';
    legend.appendChild(legendTitle);
    
    const intensities = [
        { label: 'High', color: 'bg-red-500' },
        { label: 'Medium', color: 'bg-yellow-500' },
        { label: 'Low', color: 'bg-green-500' }
    ];
    
    intensities.forEach(intensity => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-2';
        
        const indicator = document.createElement('div');
        indicator.className = `w-3 h-3 rounded-full ${intensity.color}`;
        
        const label = document.createElement('span');
        label.className = 'text-xs text-gray-800';
        label.textContent = intensity.label;
        
        item.appendChild(indicator);
        item.appendChild(label);
        legend.appendChild(item);
    });
    
    container.appendChild(legend);
}

function addToolTips(container) {
    const hotspots = container.querySelectorAll('div');
    
    hotspots.forEach(hotspot => {
        hotspot.addEventListener('mouseenter', (e) => {
            createTooltip(e.target);
        });
        
        hotspot.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.heat-map-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

function createTooltip(element) {
    // Remove any existing tooltips
    const existingTooltip = document.querySelector('.heat-map-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'heat-map-tooltip absolute z-20 bg-white p-3 rounded-lg shadow-lg text-sm';
    tooltip.style.left = element.style.left;
    tooltip.style.top = `calc(${element.style.top} - 80px)`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.minWidth = '180px';
    
    // Add content
    const location = document.createElement('div');
    location.className = 'font-semibold text-gray-800';
    location.textContent = element.dataset.location;
    
    const congestion = document.createElement('div');
    congestion.className = 'text-xs mt-1';
    congestion.textContent = `Congestion: ${element.dataset.congestion}`;
    
    const intensityClass = element.dataset.intensity === 'high' ? 'text-red-500' : 
                          element.dataset.intensity === 'medium' ? 'text-yellow-500' : 'text-green-500';
    congestion.classList.add(intensityClass);
    
    tooltip.appendChild(location);
    tooltip.appendChild(congestion);
    
    // Add arrow
    const arrow = document.createElement('div');
    arrow.className = 'absolute w-4 h-4 bg-white transform rotate-45';
    arrow.style.left = '50%';
    arrow.style.bottom = '-8px';
    arrow.style.marginLeft = '-8px';
    tooltip.appendChild(arrow);
    
    // Add to container
    element.parentNode.parentNode.appendChild(tooltip);
}

// Helper functions for demo data
function getLocationName(x, y) {
    const locations = [
        'Downtown',
        'Westside',
        'Northgate',
        'Central District',
        'Harbor View',
        'Riverside',
        'Eastlake',
        'South Point',
        'Industrial Zone',
        'University Area'
    ];
    
    // Use coordinates to deterministically select a location
    const index = Math.floor((x * y) % locations.length);
    return locations[index];
}

function getCongestionLevel(intensity) {
    switch(intensity) {
        case 'high':
            return 'Severe (80-100%)';
        case 'medium':
            return 'Moderate (40-80%)';
        case 'low':
            return 'Light (0-40%)';
    }
} 