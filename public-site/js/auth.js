const API_BASE = 'https://jamb-simulator-api.onrender.com';
let isLogin = true;
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) { window.location.href = '/home.html'; return; }
    setupEventListeners();
});
function setupEventListeners() {
    document.getElementById('toggleAuth').addEventListener('click', toggleAuthMode);
    document.getElementById('authForm').addEventListener('submit', handleAuth);
}
function toggleAuthMode(e) {
    e.preventDefault();
    isLogin = !isLogin;
    document.getElementById('formTitle').textContent = isLogin ? 'Login' : 'Create Account';
    document.getElementById('formSubtitle').textContent = isLogin ? 'Welcome back!' : 'Sign up to see your exam results!';
    document.getElementById('submitBtn').textContent = isLogin ? 'Login' : 'Register';
    document.getElementById('nameGroup').style.display = isLogin ? 'none' : 'block';
    document.getElementById('toggleText').innerHTML = isLogin ? 'Don\'t have an account? <a href="#" id="toggleAuth">Register here</a>' : 'Already have an account? <a href="#" id="toggleAuth">Login here</a>';
    document.getElementById('toggleAuth').addEventListener('click', toggleAuthMode);
}
async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName')?.value;
    if (!email || !password || (!isLogin && !fullName)) { showError('Please fill all fields'); return; }
    const url = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
    const body = isLogin ? { email, password } : { email, password, fullName };
    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Authentication failed');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pending') === 'results') {
            const pending = sessionStorage.getItem('pendingExamResults');
            if (pending) { localStorage.setItem('lastExamResults', pending); sessionStorage.removeItem('pendingExamResults'); window.location.href = '/results.html'; return; }
        }
        window.location.href = '/home.html';
    } catch (error) { showError(error.message); }
}
function showError(msg) { const errDiv = document.getElementById('errorMessage'); errDiv.textContent = msg; errDiv.style.display = 'block'; setTimeout(() => errDiv.style.display = 'none', 3000); }