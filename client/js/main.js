// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com'; // Your backend URL

// JAMB Subjects Data - Only 5 Subjects
const jambSubjects = [
    { id: 1, name: "Use of English", code: "ENG", compulsory: true },
    { id: 2, name: "Mathematics", code: "MTH", compulsory: false },
    { id: 3, name: "Physics", code: "PHY", compulsory: false },
    { id: 4, name: "Chemistry", code: "CHM", compulsory: false },
    { id: 5, name: "Biology", code: "BIO", compulsory: false }
];

// State
let selectedSubjects = [];

// Check auth status - REDIRECT TO LOGIN IF NOT AUTHENTICATED
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    // If not logged in, redirect to auth page
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }
    
    checkAuth();
    loadSubjects();
    checkAdminAccess();
    
    document.getElementById('startExamBtn').addEventListener('click', startExam);
    document.getElementById('authLink').addEventListener('click', handleAuthClick);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authLink = document.getElementById('authLink');
    
    if (token && user) {
        authLink.textContent = `Hi, ${user.full_name || 'User'}`;
        authLink.href = '/progress.html';
    }
}

function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminLink = document.getElementById('adminLink');
    
    if (user.is_admin) {
        adminLink.style.display = 'block';
    }
}

function handleAuthClick(e) {
    e.preventDefault();
    // Logout functionality
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth.html';
}

function loadSubjects() {
    const container = document.getElementById('subjectsContainer');
    container.innerHTML = '';
    
    jambSubjects.forEach(subject => {
        const card = createSubjectCard(subject);
        container.appendChild(card);
    });
    
    // Auto-select English
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
    document.getElementById('selectedCount').textContent = selectedSubjects.length;
}

function updateStartButton() {
    const startBtn = document.getElementById('startExamBtn');
    startBtn.disabled = selectedSubjects.length !== 4;
}

function startExam() {
    if (selectedSubjects.length !== 4) {
        alert('Please select exactly 4 subjects');
        return;
    }
    
    // Verify English is included
    if (!selectedSubjects.find(s => s.compulsory)) {
        alert('English is compulsory!');
        return;
    }
    
    localStorage.setItem('jambSelectedSubjects', JSON.stringify(selectedSubjects));
    window.location.href = '/exam.html';
}