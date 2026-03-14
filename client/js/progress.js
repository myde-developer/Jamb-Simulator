// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadStats();
    loadSubjectStats();
    loadRecentExams();
    if (window.studyStreak) studyStreak.init();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/auth.html';
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth.html';
}

async function loadStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/api/progress/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load');
        
        const exams = await response.json();
        
        const totalExams = exams.length;
        const totalQuestions = exams.reduce((sum, e) => sum + (e.total_questions || 0), 0);
        const totalScore = exams.reduce((sum, e) => sum + (e.score || 0), 0);
        const avgScore = totalExams > 0 ? (totalScore / totalExams).toFixed(2) : 0;
        const bestExam = exams.length > 0 
            ? Math.max(...exams.map(e => ((e.score / e.total_questions) * 100) || 0)).toFixed(1)
            : 0;
        
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalExams}</div>
                <div class="stat-label">Exams Taken</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgScore}</div>
                <div class="stat-label">Avg JAMB Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${bestExam}%</div>
                <div class="stat-label">Best Performance</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalQuestions}</div>
                <div class="stat-label">Questions Answered</div>
            </div>
        `;
        
    } catch (error) {
        showDemoStats();
    }
}

function showDemoStats() {
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-value">5</div>
            <div class="stat-label">Exams Taken</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">287.5</div>
            <div class="stat-label">Avg JAMB Score</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">72%</div>
            <div class="stat-label">Best Performance</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">900</div>
            <div class="stat-label">Questions Answered</div>
        </div>
    `;
}

async function loadSubjectStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/api/progress/stats/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load');
        
        const subjects = await response.json();
        
        let html = '';
        subjects.forEach(subject => {
            const percentage = subject.total_questions > 0 
                ? ((subject.correct_answers / subject.total_questions) * 100).toFixed(1)
                : 0;
            
            html += `
                <div class="subject-bar">
                    <div class="subject-info">
                        <span class="subject-name">${subject.name}</span>
                        <span>${subject.correct_answers || 0}/${subject.total_questions || 0} (${percentage}%)</span>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-fill-subject" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('subjectStats').innerHTML = html;
        
    } catch (error) {
        showDemoSubjectStats();
    }
}

function showDemoSubjectStats() {
    document.getElementById('subjectStats').innerHTML = `
        <div class="subject-bar">
            <div class="subject-info">
                <span class="subject-name">Use of English</span>
                <span>42/60 (70%)</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill-subject" style="width: 70%"></div>
            </div>
        </div>
        <div class="subject-bar">
            <div class="subject-info">
                <span class="subject-name">Mathematics</span>
                <span>28/40 (70%)</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill-subject" style="width: 70%"></div>
            </div>
        </div>
        <div class="subject-bar">
            <div class="subject-info">
                <span class="subject-name">Physics</span>
                <span>30/40 (75%)</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill-subject" style="width: 75%"></div>
            </div>
        </div>
        <div class="subject-bar">
            <div class="subject-info">
                <span class="subject-name">Chemistry</span>
                <span>32/40 (80%)</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill-subject" style="width: 80%"></div>
            </div>
        </div>
    `;
}

async function loadRecentExams() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/api/progress/recent`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load');
        
        const exams = await response.json();
        
        let html = '';
        exams.forEach(exam => {
            const date = new Date(exam.completed_at).toLocaleDateString();
            const percentage = ((exam.score / exam.total_questions) * 100).toFixed(1);
            
            html += `
                <div class="exam-item">
                    <div>
                        <div class="exam-date">${date}</div>
                        <div>${exam.subjects?.join(', ') || 'JAMB Exam'}</div>
                    </div>
                    <div>
                        <span class="exam-score">${exam.score}/${exam.total_questions} (${percentage}%)</span>
                        <button class="view-btn" onclick="viewExam(${exam.id})">View</button>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('recentExams').innerHTML = html || '<p>No exams yet</p>';
        
    } catch (error) {
        showDemoRecentExams();
    }
}

function showDemoRecentExams() {
    document.getElementById('recentExams').innerHTML = `
        <div class="exam-item">
            <div>
                <div class="exam-date">March 13, 2026</div>
                <div>English, Math, Physics, Chemistry</div>
            </div>
            <div>
                <span class="exam-score">315/400 (79%)</span>
                <button class="view-btn" onclick="viewExam(1)">View</button>
            </div>
        </div>
        <div class="exam-item">
            <div>
                <div class="exam-date">March 10, 2026</div>
                <div>English, Math, Biology, Chemistry</div>
            </div>
            <div>
                <span class="exam-score">288/400 (72%)</span>
                <button class="view-btn" onclick="viewExam(2)">View</button>
            </div>
        </div>
    `;
}

function viewExam(examId) {
    window.location.href = `results.html?id=${examId}`;
}