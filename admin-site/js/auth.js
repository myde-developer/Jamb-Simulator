const API_BASE = 'https://your-backend.onrender.com'; // replace with actual backend URL
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
        if(!data.user.is_admin) throw new Error('Not an admin');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('is_admin', 'true');
        window.location.href = '/admin.html';
    } catch(err) {
        document.getElementById('errorMessage').innerText = err.message;
    }
});