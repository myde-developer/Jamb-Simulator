const API_BASE = 'https://jamb-simulator-api.onrender.com';
let selectedSubjects = [];

const allSubjects = [
    { id: 1, name: 'Use of English', code: 'ENG', category: 'compulsory', mandatory: true },
    { id: 2, name: 'Mathematics', code: 'MTH', category: 'science' },
    { id: 3, name: 'Physics', code: 'PHY', category: 'science' },
    { id: 4, name: 'Chemistry', code: 'CHM', category: 'science' },
    { id: 5, name: 'Biology', code: 'BIO', category: 'science' },
    { id: 6, name: 'Agricultural Science', code: 'AGR', category: 'science' },
    { id: 7, name: 'Computer Studies', code: 'CSC', category: 'science' },
    { id: 8, name: 'Literature in English', code: 'LIT', category: 'arts' },
    { id: 9, name: 'Government', code: 'GOV', category: 'arts' },
    { id: 10, name: 'History', code: 'HIS', category: 'arts' },
    { id: 11, name: 'Christian Religious Studies', code: 'CRS', category: 'arts' },
    { id: 12, name: 'Islamic Studies', code: 'IRS', category: 'arts' },
    { id: 13, name: 'French', code: 'FRE', category: 'arts' },
    { id: 14, name: 'Yoruba', code: 'YRB', category: 'arts' },
    { id: 15, name: 'Igbo', code: 'IGB', category: 'arts' },
    { id: 16, name: 'Hausa', code: 'HAU', category: 'arts' },
    { id: 17, name: 'Music', code: 'MUS', category: 'arts' },
    { id: 18, name: 'Fine Arts', code: 'ART', category: 'arts' },
    { id: 19, name: 'Economics', code: 'ECO', category: 'commercial' },
    { id: 20, name: 'Commerce', code: 'COM', category: 'commercial' },
    { id: 21, name: 'Principles of Accounts', code: 'ACC', category: 'commercial' },
    { id: 22, name: 'Geography', code: 'GEO', category: 'commercial' }
];

document.addEventListener('DOMContentLoaded', () => {
    renderSubjects();
    setupEventListeners();
    if(window.studyStreak) studyStreak.init();
});

function renderSubjects() {
    const container = document.getElementById('subjectsContainer');
    const categories = {
        compulsory: { title: ' Compulsory', subjects: [] },
        science: { title: ' Sciences', subjects: [] },
        arts: { title: 'Arts', subjects: [] },
        commercial: { title: 'Commercial', subjects: [] }
    };
    allSubjects.forEach(subject => {
        if (subject.category) categories[subject.category].subjects.push(subject);
    });
    let html = '';
    for (const [key, category] of Object.entries(categories)) {
        if (category.subjects.length === 0) continue;
        html += `<div class="category-title">${category.title}</div>`;
        category.subjects.forEach(subject => {
            const isSelected = selectedSubjects.some(s => s.id === subject.id);
            html += `<div class="subject-card ${isSelected ? 'selected' : ''}" data-id="${subject.id}" data-name="${subject.name}" data-code="${subject.code}" data-mandatory="${subject.mandatory || false}"><div class="subject-name">${subject.name}</div><div class="subject-code">${subject.code}</div><div class="check-icon">✓</div></div>`;
        });
    }
    container.innerHTML = html;
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => toggleSubject(card));
    });
}

function toggleSubject(card) {
    const id = parseInt(card.dataset.id);
    const name = card.dataset.name;
    const code = card.dataset.code;
    const isMandatory = card.dataset.mandatory === 'true';
    const existingIndex = selectedSubjects.findIndex(s => s.id === id);
    if (existingIndex !== -1) {
        if (isMandatory) return;
        selectedSubjects.splice(existingIndex, 1);
        card.classList.remove('selected');
    } else {
        if (selectedSubjects.length >= 4 && !isMandatory) {
            alert('You can select only 4 subjects total (including English)');
            return;
        }
        selectedSubjects.push({ id, name, code });
        card.classList.add('selected');
    }
    updateSelectionDisplay();
}

function updateSelectionDisplay() {
    const count = selectedSubjects.length;
    document.getElementById('selectedCount').textContent = count;
    const startBtn = document.getElementById('startExamBtn');
    startBtn.disabled = count !== 4;
}

function setupEventListeners() {
    document.getElementById('startExamBtn')?.addEventListener('click', startExam);
}

function startExam() {
    if (selectedSubjects.length !== 4) {
        alert('Please select exactly 4 subjects');
        return;
    }
    if (!selectedSubjects.some(s => s.name === 'Use of English')) {
        alert('Use of English is compulsory');
        return;
    }
    localStorage.setItem('jambSelectedSubjects', JSON.stringify(selectedSubjects));
    window.location.href = '/exam.html';
}