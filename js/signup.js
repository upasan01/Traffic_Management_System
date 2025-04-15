document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Validate form
        if (!terms) {
            alert('Please agree to the Terms of Service');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        // Store user data in localStorage
        const userData = {
            name: name,
            email: email,
            password: password
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);

        // Redirect to dashboard
        window.location.href = 'index.html';
    });

    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
}); 