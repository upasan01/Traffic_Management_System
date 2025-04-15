// Check if user is authenticated
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    }
}

// Function to handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    window.location.href = 'login.html';
} 