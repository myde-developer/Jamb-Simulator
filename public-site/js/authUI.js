// js/authUI.js – shared authentication UI logic

function updateLogoutButtonVisibility() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    const token = localStorage.getItem('token');
    if (token) {
        logoutBtn.style.display = 'inline-block';
    } else {
        logoutBtn.style.display = 'none';
    }
}

function logoutUser(e) {
    if (e) e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('You are already logged out');
        return;
    }
    // Clear only authentication data – keep exam results
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    // Clear pending exam flags so next user doesn't see old pending results
    sessionStorage.removeItem('pendingExamResults');
    sessionStorage.removeItem('redirectAfterAuth');
    showToast('Logged out successfully');
    // Redirect to home page; logout button will be hidden by updateLogoutButtonVisibility on page load
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
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Initialize visibility on every page load
document.addEventListener('DOMContentLoaded', () => {
    updateLogoutButtonVisibility();
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
});