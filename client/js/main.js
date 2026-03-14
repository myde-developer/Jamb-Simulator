// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

// JAMB Subjects Data
const jambSubjects = [
    { id: 1, name: "Use of English", code: "ENG", compulsory: true },
    { id: 2, name: "Mathematics", code: "MTH", compulsory: false },
    { id: 3, name: "Physics", code: "PHY", compulsory: false },
    { id: 4, name: "Chemistry", code: "CHM", compulsory: false },
    { id: 5, name: "Biology", code: "BIO", compulsory: false }
];

let selectedSubjects = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSubjects();
    checkAdminAccess();
    displayUserInfo();
    
    document.getElementById('startExamBtn').addEventListener('click', startExam);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }
}

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) {
        userInfo.textContent = `Hi, ${user.full_name}`;
    }
}

function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminLink = document.getElementById('adminLink');
    if (adminLink && user.is_admin) {
        adminLink.style.display = 'block';
        adminLink.href = '/admin.html';
    }
}

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

function loadSubjects() {
    const container = document.getElementById('subjectsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    jambSubjects.forEach(subject => {
        const card = createSubjectCard(subject);
        container.appendChild(card);
    });
    
    const english = jambSubjects.find(s => s.compulsory);
    selectedSubjects.push(english);
    updateSelectionCount();
}

function createSubjectCard(subject) {
    const card = document.createElement('div');
    card.className = `subject-card ${subject.compulsory ? 'english' : ''}`;
    card.dataset.id = subject.id;
    card.dataset.name = subject.name;
    
    card.innerHTML = `
        <div class="subject-name">${subject.name}</div>
        <div class="subject-code">${subject.code}</div>
        <span class="check-icon">✓</span>
    `;
    
    if (subject.compulsory) {
        card.classList.add('selected', 'disabled');
    } else {
        card.addEventListener('click', () => toggleSubject(subject, card));
    }
    
    return card;
}

function toggleSubject(subject, card) {
    const isSelected = selectedSubjects.some(s => s.id === subject.id);
    
    if (isSelected) {
        selectedSubjects = selectedSubjects.filter(s => s.id !== subject.id);
        card.classList.remove('selected');
    } else {
        if (selectedSubjects.length >= 4) {
            alert('You can only select 4 subjects total (English + 3 others)');
            return;
        }
        selectedSubjects.push(subject);
        card.classList.add('selected');
    }
    
    updateSelectionCount();
    updateStartButton();
}

function updateSelectionCount() {
    const countEl = document.getElementById('selectedCount');
    if (countEl) countEl.textContent = selectedSubjects.length;
}

function updateStartButton() {
    const startBtn = document.getElementById('startExamBtn');
    if (startBtn) startBtn.disabled = selectedSubjects.length !== 4;
}

function startExam() {
    if (selectedSubjects.length !== 4) {
        alert('Please select exactly 4 subjects');
        return;
    }
    
    if (!selectedSubjects.find(s => s.compulsory)) {
        alert('English is compulsory!');
        return;
    }
    
    localStorage.setItem('jambSelectedSubjects', JSON.stringify(selectedSubjects));
    window.location.href = '/exam.html';
}