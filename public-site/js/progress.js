const API_BASE = 'https://jamb-simulator-api.onrender.com';
document.addEventListener('DOMContentLoaded', () => { loadStats(); loadSubjectStats(); loadRecentExams(); document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.clear(); window.location.href='/auth.html'; }); });
async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/progress/history`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error();
        const exams = await response.json();
        const totalExams = exams.length;
        const totalQuestions = exams.reduce((s,e)=>s+(e.total_questions||0),0);
        const totalScore = exams.reduce((s,e)=>s+(e.score||0),0);
        const avgScore = totalExams>0 ? (totalScore/totalExams).toFixed(2) : 0;
        const bestExam = exams.length>0 ? Math.max(...exams.map(e=>((e.score/e.total_questions)*100)||0)).toFixed(1) : 0;
        document.getElementById('statsGrid').innerHTML = `<div class="stat-card"><div class="stat-value">${totalExams}</div><div class="stat-label">Exams Taken</div></div><div class="stat-card"><div class="stat-value">${avgScore}</div><div class="stat-label">Avg JAMB Score</div></div><div class="stat-card"><div class="stat-value">${bestExam}%</div><div class="stat-label">Best Performance</div></div><div class="stat-card"><div class="stat-value">${totalQuestions}</div><div class="stat-label">Questions Answered</div></div>`;
    } catch(e) { showDemoStats(); }
}
function showDemoStats() {
    document.getElementById('statsGrid').innerHTML = `<div class="stat-card"><div class="stat-value">5</div><div class="stat-label">Exams Taken</div></div><div class="stat-card"><div class="stat-value">287.5</div><div class="stat-label">Avg JAMB Score</div></div><div class="stat-card"><div class="stat-value">72%</div><div class="stat-label">Best Performance</div></div><div class="stat-card"><div class="stat-value">900</div><div class="stat-label">Questions Answered</div></div>`;
}
async function loadSubjectStats() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/progress/stats/subjects`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if(!res.ok) throw new Error();
        const subjects = await res.json();
        let html = '';
        subjects.forEach(s => { const percent = s.total_questions>0 ? ((s.correct_answers/s.total_questions)*100).toFixed(1) : 0; html += `<div class="subject-bar"><div class="subject-info"><span class="subject-name">${s.name}</span><span>${s.correct_answers||0}/${s.total_questions||0} (${percent}%)</span></div><div class="progress-bg"><div class="progress-fill-subject" style="width:${percent}%"></div></div></div>`; });
        document.getElementById('subjectStats').innerHTML = html;
    } catch(e) { showDemoSubjectStats(); }
}
function showDemoSubjectStats() {
    document.getElementById('subjectStats').innerHTML = `<div class="subject-bar"><div class="subject-info"><span class="subject-name">Use of English</span><span>42/60 (70%)</span></div><div class="progress-bg"><div class="progress-fill-subject" style="width:70%"></div></div></div><div class="subject-bar"><div class="subject-info"><span class="subject-name">Mathematics</span><span>28/40 (70%)</span></div><div class="progress-bg"><div class="progress-fill-subject" style="width:70%"></div></div></div><div class="subject-bar"><div class="subject-info"><span class="subject-name">Physics</span><span>30/40 (75%)</span></div><div class="progress-bg"><div class="progress-fill-subject" style="width:75%"></div></div></div><div class="subject-bar"><div class="subject-info"><span class="subject-name">Chemistry</span><span>32/40 (80%)</span></div><div class="progress-bg"><div class="progress-fill-subject" style="width:80%"></div></div></div>`;
}
async function loadRecentExams() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/progress/recent`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if(!res.ok) throw new Error();
        const exams = await res.json();
        let html = '';
        exams.forEach(e => { html += `<div class="exam-item"><div><div class="exam-date">${new Date(e.completed_at).toLocaleDateString()}</div><div>${e.subjects?.join(', ') || 'JAMB Exam'}</div></div><div><span class="exam-score">${e.score}/${e.total_questions} (${((e.score/e.total_questions)*100).toFixed(1)}%)</span><button class="view-btn" onclick="viewExam(${e.id})">View</button></div></div>`; });
        document.getElementById('recentExams').innerHTML = html || '<p>No exams yet</p>';
    } catch(e) { showDemoRecentExams(); }
}
function showDemoRecentExams() {
    document.getElementById('recentExams').innerHTML = `<div class="exam-item"><div><div class="exam-date">March 13, 2026</div><div>English, Math, Physics, Chemistry</div></div><div><span class="exam-score">315/400 (79%)</span><button class="view-btn" onclick="viewExam(1)">View</button></div></div><div class="exam-item"><div><div class="exam-date">March 10, 2026</div><div>English, Math, Biology, Chemistry</div></div><div><span class="exam-score">288/400 (72%)</span><button class="view-btn" onclick="viewExam(2)">View</button></div></div>`;
}
function viewExam(examId) { window.location.href = `results.html?id=${examId}`; }