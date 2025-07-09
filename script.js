// User data storage (in a real application, this would be a database)
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const successMessage = document.getElementById('successMessage');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Form elements
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');

// Input elements
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');
const agreeTerms = document.getElementById('agreeTerms');

// Social login buttons
const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const googleRegisterBtn = document.getElementById('googleRegister');
const facebookRegisterBtn = document.getElementById('facebookRegister');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (currentUser) {
        showSuccessMessage(`Welcome back, ${currentUser.name}!`);
    }
    
    // Add event listeners
    setupEventListeners();
    
    // Add real-time validation
    setupValidation();
});

// Event listeners setup
function setupEventListeners() {
    // Form switching
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToRegister();
    });
    
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchToLogin();
    });
    
    // Form submissions
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Forgot password
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        handleForgotPassword();
    });
    
    // Social login buttons
    googleLoginBtn.addEventListener('click', () => handleSocialLogin('google', 'login'));
    facebookLoginBtn.addEventListener('click', () => handleSocialLogin('facebook', 'login'));
    googleRegisterBtn.addEventListener('click', () => handleSocialLogin('google', 'register'));
    facebookRegisterBtn.addEventListener('click', () => handleSocialLogin('facebook', 'register'));
}

// Real-time validation setup
function setupValidation() {
    // Password strength indicator
    registerPassword.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
    
    // Confirm password validation
    confirmPassword.addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    // Email validation
    registerEmail.addEventListener('blur', function() {
        validateEmail(this.value, 'register');
    });
    
    loginEmail.addEventListener('blur', function() {
        validateEmail(this.value, 'login');
    });
    
    // Name validation
    registerName.addEventListener('blur', function() {
        validateName(this.value);
    });
}

// Form switching functions
function switchToRegister() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    clearErrors();
    resetForms();
}

function switchToLogin() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearErrors();
    resetForms();
}

function showSuccessMessage(message) {
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    successMessage.classList.remove('hidden');
    
    // Update success message
    const successText = document.getElementById('successText');
    successText.textContent = message;
    
    // Add user avatar if available
    if (currentUser && currentUser.avatar) {
        const existingAvatar = document.querySelector('.user-avatar');
        if (existingAvatar) {
            existingAvatar.remove();
        }
        
        const avatar = document.createElement('img');
        avatar.src = currentUser.avatar;
        avatar.alt = 'User Avatar';
        avatar.className = 'user-avatar';
        
        const welcomeTitle = successMessage.querySelector('h3');
        welcomeTitle.parentNode.insertBefore(avatar, welcomeTitle);
    }
    
    // Add provider badge if user logged in via social
    if (currentUser && currentUser.provider) {
        const existingBadge = document.querySelector('.provider-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        const badge = document.createElement('span');
        badge.className = `provider-badge ${currentUser.provider}`;
        badge.textContent = currentUser.provider;
        
        const welcomeTitle = successMessage.querySelector('h3');
        welcomeTitle.appendChild(badge);
    }
}

// Login handler
function handleLogin(e) {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    // Validate inputs
    if (!validateEmail(email, 'login') || !validatePassword(password, 'login')) {
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    showLoading(submitBtn);
    
    // Simulate API call delay
    setTimeout(() => {
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Login successful
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showSuccessMessage(`Welcome back, ${user.name}!`);
            clearErrors();
        } else {
            // Login failed
            showError('Invalid email or password.', 'login');
        }
        
        hideLoading(submitBtn);
    }, 1000);
}

// Register handler
function handleRegister(e) {
    e.preventDefault();
    
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const confirmPass = confirmPassword.value.trim();
    
    // Validate all inputs
    const isValidName = validateName(name);
    const isValidEmail = validateEmail(email, 'register');
    const isValidPassword = validatePassword(password, 'register');
    const isValidConfirm = validatePasswordMatch();
    const isTermsAgreed = agreeTerms.checked;
    
    if (!isValidName || !isValidEmail || !isValidPassword || !isValidConfirm || !isTermsAgreed) {
        if (!isTermsAgreed) {
            showError('Please agree to the Terms & Conditions.', 'register');
        }
        return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showError('Email already registered. Please use a different email.', 'register');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    showLoading(submitBtn);
    
    // Simulate API call delay
    setTimeout(() => {
        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            registeredAt: new Date().toISOString()
        };
        
        // Add to users array
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login after registration
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showSuccessMessage(`Welcome, ${name}! Your account has been created successfully.`);
        clearErrors();
        hideLoading(submitBtn);
    }, 1000);
}

// Logout handler
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    switchToLogin();
}

// Forgot password handler
function handleForgotPassword() {
    const email = prompt('Please enter your email address:');
    if (email) {
        const user = users.find(u => u.email === email);
        if (user) {
            alert(`Password reset instructions have been sent to ${email}`);
        } else {
            alert('Email not found. Please check your email address.');
        }
    }
}

// Social login handler
function handleSocialLogin(provider, action) {
    const button = document.getElementById(provider + (action === 'login' ? 'Login' : 'Register'));
    
    // Show loading state
    showSocialLoading(button);
    
    // Simulate OAuth flow
    setTimeout(() => {
        // Generate mock user data based on provider
        const mockUserData = generateMockSocialUser(provider);
        
        // Check if user exists (for login) or create new user (for register)
        let user = users.find(u => u.email === mockUserData.email);
        
        if (action === 'login') {
            if (user) {
                // Login successful
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showSuccessMessage(`Welcome back, ${user.name}!`);
            } else {
                // User doesn't exist, suggest registration
                showError(`No account found with this ${provider} account. Please register first.`, 'login');
            }
        } else {
            // Register action
            if (user) {
                // User already exists, log them in
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showSuccessMessage(`Welcome back, ${user.name}!`);
            } else {
                // Create new user
                const newUser = {
                    id: Date.now(),
                    name: mockUserData.name,
                    email: mockUserData.email,
                    password: null, // No password for social login
                    provider: provider,
                    avatar: mockUserData.avatar,
                    registeredAt: new Date().toISOString()
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                // Auto-login after registration
                currentUser = newUser;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                showSuccessMessage(`Welcome, ${newUser.name}! Your account has been created using ${provider}.`);
            }
        }
        
        hideSocialLoading(button);
        clearErrors();
    }, 2000);
}

// Generate mock social user data
function generateMockSocialUser(provider) {
    const mockUsers = {
        google: {
            name: 'John Google',
            email: 'john.google@gmail.com',
            avatar: 'https://via.placeholder.com/150/4285f4/ffffff?text=G'
        },
        facebook: {
            name: 'John Facebook',
            email: 'john.facebook@gmail.com',
            avatar: 'https://via.placeholder.com/150/1877f2/ffffff?text=F'
        }
    };
    
    return mockUsers[provider] || mockUsers.google;
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    
    if (!strengthBar) {
        // Create strength indicator if it doesn't exist
        const strengthContainer = document.createElement('div');
        strengthContainer.className = 'password-strength';
        strengthContainer.innerHTML = '<div class="strength-bar"></div>';
        registerPassword.parentNode.appendChild(strengthContainer);
    }
    
    const bar = document.querySelector('.strength-bar');
    let strength = 0;
    
    // Check password criteria
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    
    // Update strength bar
    bar.className = 'strength-bar';
    if (strength <= 2) {
        bar.classList.add('weak');
    } else if (strength <= 4) {
        bar.classList.add('medium');
    } else {
        bar.classList.add('strong');
    }
}

// Error handling
function showError(message, form) {
    // Remove existing error messages
    clearErrors();
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    
    // Insert error message
    const targetForm = form === 'login' ? loginFormElement : registerFormElement;
    targetForm.insertBefore(errorDiv, targetForm.firstChild);
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    // Remove error classes from inputs
    const errorInputs = document.querySelectorAll('input.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

// Loading state functions
function showLoading(button) {
    button.disabled = true;
    button.classList.add('loading');
    button.textContent = '';
}

function hideLoading(button) {
    button.disabled = false;
    button.classList.remove('loading');
    button.textContent = button.closest('#loginFormElement') ? 'Login' : 'Register';
}

function showSocialLoading(button) {
    button.disabled = true;
    button.classList.add('loading');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    button.setAttribute('data-original-text', originalText);
}

function hideSocialLoading(button) {
    button.disabled = false;
    button.classList.remove('loading');
    const originalText = button.getAttribute('data-original-text');
    button.innerHTML = originalText;
    button.removeAttribute('data-original-text');
}

// Reset forms
function resetForms() {
    loginFormElement.reset();
    registerFormElement.reset();
    
    // Remove password strength indicator
    const strengthIndicator = document.querySelector('.password-strength');
    if (strengthIndicator) {
        strengthIndicator.remove();
    }
}

// Additional utility functions
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Export user data (for demo purposes)
function exportUserData() {
    const data = {
        users: users,
        currentUser: currentUser,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Clear all data (for demo purposes)
function clearAllData() {
    if (confirm('Are you sure you want to clear all user data? This action cannot be undone.')) {
        localStorage.removeItem('users');
        localStorage.removeItem('currentUser');
        users = [];
        currentUser = null;
        switchToLogin();
        alert('All data has been cleared.');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Press Enter to submit active form
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const form = e.target.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Press Escape to clear errors
    if (e.key === 'Escape') {
        clearErrors();
    }
});

// Add some demo users for testing (remove in production)
if (users.length === 0) {
    users = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            registeredAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'password456',
            registeredAt: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Google User',
            email: 'john.google@gmail.com',
            password: null,
            provider: 'google',
            avatar: 'https://via.placeholder.com/150/4285f4/ffffff?text=G',
            registeredAt: new Date().toISOString()
        },
        {
            id: 4,
            name: 'Facebook User',
            email: 'john.facebook@gmail.com',
            password: null,
            provider: 'facebook',
            avatar: 'https://via.placeholder.com/150/1877f2/ffffff?text=F',
            registeredAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('users', JSON.stringify(users));
}
