const API_BASE = 'https://jamb-simulator-api.onrender.com';
let isLogin = true;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        window.location.href = user.is_admin ? '/admin.html' : '/home.html';
        return;
    }
    setupEventListeners();
    createDefaultAdmin();
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
    document.getElementById('toggleText').innerHTML = isLogin ?
        'Don\'t have an account? <a href="#" id="toggleAuth">Register here</a>' :
        'Already have an account? <a href="#" id="toggleAuth">Login here</a>';
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName')?.value;

    if (!email || !password || (!isLogin && !fullName)) {
        showError('Please fill all fields');
        return;
    }

    const url = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
    const body = isLogin ? { email, password } : { email, password, fullName };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // LOGIN
        if (isLogin) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.user.is_admin) localStorage.setItem('is_admin', 'true');

            // Check for pending exam
            const pendingExam = sessionStorage.getItem('pendingExamResults');
            if (pendingExam) {
                const examData = JSON.parse(pendingExam);
                // Save to database
                try {
                    const saveRes = await fetch(`${API_BASE}/api/exam/save`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.token}`
                        },
                        body: JSON.stringify({ examData })
                    });
                    if (saveRes.ok) console.log('✅ Exam saved to database');
                } catch (err) { console.error('Save error:', err); }
                localStorage.setItem('lastExamResults', pendingExam);
                sessionStorage.removeItem('pendingExamResults');
                sessionStorage.removeItem('redirectAfterAuth');
                window.location.href = '/results.html';
                return;
            }
            window.location.href = data.user.is_admin ? '/admin.html' : '/home.html';
        } 
        // REGISTRATION
        else {
            showSuccess('Account created! Please login.');
            setTimeout(() => window.location.href = '/auth.html', 1500);
        }
    } catch (error) {
        showError(error.message);
    }
}

async function createDefaultAdmin() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/check-admin`);
        const data = await res.json();
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
    } catch (e) {}
}

function showError(msg) {
    const errDiv = document.getElementById('errorMessage');
    errDiv.textContent = msg;
    errDiv.style.display = 'block';
    setTimeout(() => errDiv.style.display = 'none', 3000);
}

function showSuccess(msg) {
    const sucDiv = document.getElementById('successMessage');
    sucDiv.textContent = msg;
    sucDiv.style.display = 'block';
    setTimeout(() => sucDiv.style.display = 'none', 3000);
}