document.addEventListener('DOMContentLoaded', () => {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            mainContent.classList.toggle('lg:ml-64');
        });
    }

    // Set active state for current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#sidebar nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.endsWith(linkPath)) {
            link.classList.add('bg-gray-700');
            link.classList.remove('text-gray-300');
            link.classList.add('text-white');
        } else {
            link.classList.remove('bg-gray-700');
            link.classList.add('text-gray-300');
            link.classList.remove('text-white');
        }
    });

    // Sign out functionality
    const signOutButton = document.getElementById('signOutButton');
    if (signOutButton) {
        signOutButton.addEventListener('click', () => {
            // Clear user session
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            
            // Show success message
            const originalText = signOutButton.innerHTML;
            signOutButton.innerHTML = '<i class="fas fa-check mr-2"></i>Signed Out';
            signOutButton.classList.remove('text-red-600');
            signOutButton.classList.add('text-green-600');
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }

    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
        window.location.href = 'login.html';
    }

    // Update user email in sidebar if logged in
    const userEmail = localStorage.getItem('userEmail');
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement && userEmail) {
        userEmailElement.textContent = userEmail;
    }
}); 