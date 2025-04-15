document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing login state when arriving at login page
    localStorage.removeItem('isLoggedIn');
    
    // Get the login form
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    // Handle form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const email = document.getElementById('email')?.value?.trim() || '';
        const password = document.getElementById('password')?.value || '';
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Add loading state to button
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing in...';

        try {
            // Validate credentials
            if (email === 'shubhajitbasak45@gmail.com' && password === '123') {
                // Store login status
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                
                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }

                // Show success message
                submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Success!';
                submitButton.classList.remove('bg-blue-600');
                submitButton.classList.add('bg-green-600');

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // Show error message
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;

                const errorMessage = document.createElement('div');
                errorMessage.className = 'mt-4 p-4 bg-red-100 text-red-700 rounded-md';
                errorMessage.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Invalid email or password';
                
                // Remove any existing error message
                const existingError = loginForm.querySelector('.bg-red-100');
                if (existingError) {
                    existingError.remove();
                }
                
                loginForm.appendChild(errorMessage);
            }
        } catch (error) {
            console.error('Login error:', error);
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'mt-4 p-4 bg-red-100 text-red-700 rounded-md';
            errorMessage.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>An error occurred. Please try again.';
            
            const existingError = loginForm.querySelector('.bg-red-100');
            if (existingError) {
                existingError.remove();
            }
            
            loginForm.appendChild(errorMessage);
        }
    });

    // Check for remembered credentials
    try {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const rememberedPassword = localStorage.getItem('rememberedPassword');
        
        if (rememberedEmail && rememberedPassword) {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const rememberMeCheckbox = document.getElementById('rememberMe');
            
            if (emailInput && passwordInput && rememberMeCheckbox) {
                emailInput.value = rememberedEmail;
                passwordInput.value = rememberedPassword;
                rememberMeCheckbox.checked = true;
            }
        }
    } catch (error) {
        console.error('Error loading remembered credentials:', error);
    }
});