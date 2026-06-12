// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let isLogin = true;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        redirectBasedOnRole();
        return;
    }
    
    setupEventListeners();
    createDefaultAdmin();
});

function redirectBasedOnRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.is_admin) {
        window.location.href = '/admin.html';
    } else {
        window.location.href = '/home.html';
    }
}

function setupEventListeners() {
    document.getElementById('toggleAuth').addEventListener('click', toggleAuthMode);
    document.getElementById('authForm').addEventListener('submit', handleAuth);
}

function toggleAuthMode(e) {
    e.preventDefault();
    isLogin = !isLogin;
    
    document.getElementById('formTitle').textContent = isLogin ? 'Login' : 'Create Account';
    document.getElementById('formSubtitle').textContent = isLogin ? 
        'Welcome back! Login to continue' : 
        'Sign up to see your exam results!';
    document.getElementById('submitBtn').textContent = isLogin ? 'Login' : 'Register';
    document.getElementById('toggleText').innerHTML = isLogin ?
        'Don\'t have an account? <a href="#" id="toggleAuth">Register here</a>' :
        'Already have an account? <a href="#" id="toggleAuth">Login here</a>';
    
    document.getElementById('nameGroup').style.display = isLogin ? 'none' : 'block';
    document.getElementById('toggleAuth').addEventListener('click', toggleAuthMode);
}

async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName')?.value;
    
    if (!email || !password) {
        showError('Please fill all fields');
        return;
    }
    
    if (!isLogin && !fullName) {
        showError('Full name is required');
        return;
    }
    
    const url = isLogin 
        ? `${API_BASE}/api/auth/login`
        : `${API_BASE}/api/auth/register`;
    
    const body = isLogin 
        ? { email, password }
        : { email, password, fullName };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.is_admin) {
            localStorage.setItem('is_admin', 'true');
        }
        
        showSuccess(data.message);
        
        // ✅ Check for pending exam results
        const urlParams = new URLSearchParams(window.location.search);
        const pendingExam = sessionStorage.getItem('pendingExamResults');
        
        if (urlParams.get('pending') === 'results' && pendingExam) {
            // Move from sessionStorage to localStorage and go to results
            localStorage.setItem('lastExamResults', pendingExam);
            sessionStorage.removeItem('pendingExamResults');
            setTimeout(() => {
                window.location.href = '/results.html';
            }, 1500);
            return;
        }
        
        // ✅ Normal redirect after login/registration (no pending results)
        setTimeout(() => {
            if (data.user.is_admin) {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/home.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Auth error:', error);
        showError(error.message);
    }
}

async function createDefaultAdmin() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/check-admin`);
        const data = await response.json();
        console.log('Admin check:', data);
        
        if (!data.hasAdmin) {
            await fetch(`${API_BASE}/api/auth/create-default-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@jamb.com',
                    password: 'Admin123!',
                    fullName: 'System Administrator'
                })
            });
            console.log('✅ Default admin created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 3000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => successDiv.style.display = 'none', 3000);
}