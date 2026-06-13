// js/authUI.js
function updateAuthButtons() {
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const pastResultsBtn = document.getElementById('pastResultsBtn');
    const navPastResults = document.getElementById('navPastResults'); // optional, for navigation menu
    
    if (loginBtn && logoutBtn) {
        if (token) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            if (pastResultsBtn) pastResultsBtn.style.display = 'inline-block';
            if (navPastResults) navPastResults.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            if (pastResultsBtn) pastResultsBtn.style.display = 'none';
            if (navPastResults) navPastResults.style.display = 'none';
        }
    }
}

function logoutUser(e) {
    if (e) e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('You are already logged out');
        return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    sessionStorage.removeItem('pendingExamResults');
    sessionStorage.removeItem('redirectAfterAuth');
    showToast('Logged out successfully');
    window.location.href = '/home.html';
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#1a1a2e';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '50px';
        toast.style.zIndex = '10000';
        toast.style.fontSize = '0.9rem';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtons();
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (loginBtn) loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/auth.html';
    });
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
});