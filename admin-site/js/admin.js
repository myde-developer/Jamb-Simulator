// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let currentTab = 'users';
let currentPage = 1;
let usersData = [];
let examsData = [];
let questionsData = [];
let currentQuestionPage = 1;
let currentSubjectFilter = 'all';   // declared properly

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    loadStats();
    loadUsers();

    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminFlag = localStorage.getItem('is_admin');
    if (!token || !user.is_admin || adminFlag !== 'true') {
        window.location.href = '/home.html';
        return false;
    }
    return true;
}

// ========== SWITCH TAB (FIXED) ==========
function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;

    // Update active class on main tabs
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim().toLowerCase().includes(tab)) {
            btn.classList.add('active');
        }
    });

    // Load content
    switch (tab) {
        case 'users': loadUsers(); break;
        case 'exams': loadExams(); break;
        case 'subjects': loadSubjectPerformance(); break;
        case 'questions': loadQuestionBank(); break;
        default: break;
    }
}

// ========== STATS ==========
async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load stats');
        const stats = await response.json();

        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card"><h3>Total Users</h3><div class="number">${stats.totalUsers || 0}</div></div>
            <div class="stat-card"><h3>Total Exams</h3><div class="number">${stats.totalExams || 0}</div></div>
            <div class="stat-card"><h3>Questions</h3><div class="number">${stats.totalQuestions || 0}</div></div>
            <div class="stat-card"><h3>Avg Score</h3><div class="number">${stats.avgScore || 0}%</div></div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ========== USERS ==========
async function loadUsers() {
    showLoading('Loading users...');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Failed to load users: ${response.status}`);
        usersData = await response.json();
        if (usersData.length === 0) {
            document.getElementById('adminPanel').innerHTML = '<p class="no-data">No users found</p>';
            return;
        }
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('adminPanel').innerHTML = `
            <div class="error-message"><p>❌ Failed to load users.</p><button onclick="loadUsers()">Retry</button></div>
        `;
    }
}

function displayUsers() {
    const panel = document.getElementById('adminPanel');
    let html = `
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Search users by name or email..." />
            <button onclick="searchUsers()">Search</button>
            <button class="export-btn" onclick="exportData('users')">📥 Export CSV</button>
        </div>
        <div class="table-responsive">
            <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Exams Taken</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
    `;
    const start = (currentPage - 1) * 10;
    const end = start + 10;
    const paginated = usersData.slice(start, end);
    paginated.forEach(user => {
        html += `
            <tr>
                <td>#${user.id}</td>
                <td><strong>${user.full_name || 'N/A'}</strong></td>
                <td>${user.email}</td>
                <td><span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">${user.is_admin ? 'Admin' : 'User'}</span></td>
                <td>${user.exam_count || 0}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewUserDetails(${user.id})" class="action-btn" title="View Details">👁️</button>
                    ${!user.is_admin ? `<button onclick="toggleAdmin(${user.id})" class="action-btn" title="Make Admin">👑</button>` : ''}
                </td>
            </tr>
        `;
    });
    html += `</tbody></table></div>
             <div class="pagination">${generatePagination(usersData.length, 10)}</div>`;
    panel.innerHTML = html;
}

// ========== EXAMS ==========
async function loadExams() {
    showLoading('Loading exams...');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/exams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Failed to load exams: ${response.status}`);
        examsData = await response.json();
        if (examsData.length === 0) {
            document.getElementById('adminPanel').innerHTML = '<p class="no-data">No exam history found</p>';
            return;
        }
        displayExams();
    } catch (error) {
        console.error('Error loading exams:', error);
        document.getElementById('adminPanel').innerHTML = `
            <div class="error-message"><p>❌ Failed to load exams.</p><button onclick="loadExams()">Retry</button></div>
        `;
    }
}

function displayExams() {
    const panel = document.getElementById('adminPanel');
    let html = `
        <div class="search-bar">
            <input type="text" id="examSearch" placeholder="Search by user or subject..." />
            <button onclick="searchExams()">Search</button>
            <button class="export-btn" onclick="exportData('exams')">📥 Export CSV</button>
        </div>
        <div class="table-responsive">
            <table>
                <thead><tr><th>Date</th><th>User</th><th>Subjects</th><th>Score</th><th>Percentage</th><th>Actions</th></tr></thead>
                <tbody>
    `;
    const start = (currentPage - 1) * 10;
    const paginated = examsData.slice(start, start + 10);
    for (const exam of paginated) {
        const date = new Date(exam.completed_at || exam.started_at).toLocaleString();
        const user = exam.user_name || 'Unknown';
        const subjects = exam.subjects ? exam.subjects.join(', ') : 'JAMB Exam';
        const score = exam.score || 0;
        const total = exam.total_questions || 180;
        const percentage = exam.percentage ? exam.percentage.toFixed(1) : ((score / total) * 100).toFixed(1);
        const percentClass = percentage >= 70 ? 'score-high' : (percentage >= 50 ? 'score-medium' : 'score-low');
        html += `
            <tr>
                <td>${date}</td>
                <td><strong>${escapeHtml(user)}</strong></td>
                <td>${escapeHtml(subjects)}</td>
                <td>${score}/${total}</td>
                <td class="${percentClass}">${percentage}%</td>
                <td><button class="action-btn" onclick="viewExamDetails('${exam.id}')">👁️ View</button></td>
            </tr>
        `;
    }
    html += `</tbody></table></div>
             <div class="pagination">${generatePagination(examsData.length, 10)}</div>`;
    panel.innerHTML = html;
}

// View exam details – open in new tab or show alert (you can later build a modal)
window.viewExamDetails = async function (examId) {
    // For now, open a results page or show alert
    window.open(`/results.html?admin=true&id=${examId}`, '_blank');
};

// ========== SUBJECT PERFORMANCE ==========
async function loadSubjectPerformance() {
    showLoading('Loading subject performance...');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/subject-performance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load subject performance');
        const data = await response.json();
        displaySubjectPerformance(data);
    } catch (error) {
        console.warn('Using mock subject data:', error);
        const mockData = [
            { name: 'Use of English', total_questions: 400, times_answered: 1250, correct_answers: 850, success_rate: 68 },
            { name: 'Mathematics', total_questions: 400, times_answered: 980, correct_answers: 620, success_rate: 63 },
            { name: 'Physics', total_questions: 400, times_answered: 750, correct_answers: 480, success_rate: 64 },
            { name: 'Chemistry', total_questions: 400, times_answered: 820, correct_answers: 510, success_rate: 62 },
            { name: 'Biology', total_questions: 400, times_answered: 1100, correct_answers: 780, success_rate: 71 }
        ];
        displaySubjectPerformance(mockData);
    }
}

function displaySubjectPerformance(data) {
    const panel = document.getElementById('adminPanel');
    let html = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Subject Performance Analysis</h2>
            <button class="export-btn" onclick="exportData('subjects')">📥 Export CSV</button>
        </div>
        <div class="table-responsive">
            <table>
                <thead><tr><th>Subject</th><th>Total Questions</th><th>Times Answered</th><th>Correct Answers</th><th>Success Rate</th></tr></thead>
                <tbody>
    `;
    data.forEach(subject => {
        const rate = subject.success_rate || (subject.times_answered > 0 ? Math.round((subject.correct_answers / subject.times_answered) * 100) : 0);
        const rateClass = rate >= 70 ? 'score-high' : (rate >= 50 ? 'score-medium' : 'score-low');
        html += `
            <tr>
                <td><strong>${subject.name}</strong></td>
                <td>${subject.total_questions || 400}</td>
                <td>${(subject.times_answered || 0).toLocaleString()}</td>
                <td>${(subject.correct_answers || 0).toLocaleString()}</td>
                <td class="${rateClass}">${rate}%</td>
            </tr>
        `;
    });
    html += `</tbody></table></div>`;
    panel.innerHTML = html;
}

// ========== QUESTION BANK ==========
function loadQuestionBank() {
    document.getElementById('adminPanel').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Question Bank Management</h2>
            <button class="export-btn" onclick="exportData('questions')">📥 Export CSV</button>
        </div>
        <div class="admin-tabs" style="margin-bottom: 20px;" id="subjectFilters">
            <button class="tab-btn active" onclick="filterBySubject('all', event)">All</button>
        </div>
        <div class="search-bar">
            <input type="text" id="questionSearch" placeholder="Search questions..." />
            <button onclick="searchQuestions()">🔍 Search</button>
            <button style="background: #27ae60;" onclick="showAddQuestionForm()">➕ Add Question</button>
        </div>
        <div id="questionsList"></div>
        <div class="pagination-container"><div class="pagination" id="questionPagination"></div></div>
    `;
    loadSubjectFilters();
    loadQuestions();
}

function filterBySubject(subjectId, event) {
    if (event) {
        document.querySelectorAll('#subjectFilters .tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
    currentSubjectFilter = subjectId;
    currentQuestionPage = 1;
    displayQuestions();
}

async function loadSubjectFilters() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const subjects = await response.json();
        const container = document.getElementById('subjectFilters');
        if (!container) return;
        container.innerHTML = '<button class="tab-btn active" onclick="filterBySubject(\'all\', event)">All</button>';
        subjects.forEach(subject => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn';
            btn.textContent = subject.name;
            btn.onclick = (e) => filterBySubject(subject.id, e);
            container.appendChild(btn);
        });
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

async function loadQuestions() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load questions');
        questionsData = await response.json();
        displayQuestions();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionsList').innerHTML = '<p class="no-data">No questions found. Try adding some.</p>';
    }
}

function displayQuestions() {
    const container = document.getElementById('questionsList');
    if (!container) return;

    let filtered = questionsData;
    if (currentSubjectFilter !== 'all') {
        filtered = questionsData.filter(q => q.subject_id === parseInt(currentSubjectFilter));
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No questions found</p>';
        document.getElementById('questionPagination').innerHTML = '';
        return;
    }

    const start = (currentQuestionPage - 1) * 15;
    const end = start + 15;
    const paginated = filtered.slice(start, end);

    let html = `
        <div class="table-responsive">
            <table>
                <thead><tr><th>ID</th><th>Subject</th><th>Question</th><th>Correct</th><th>Topic</th><th>Difficulty</th><th>Actions</th></tr></thead>
                <tbody>
    `;
    paginated.forEach(q => {
        const diffColor = q.difficulty === 'easy' ? '#27ae60' : q.difficulty === 'medium' ? '#f39c12' : '#e74c3c';
        html += `
            <tr>
                <td><strong>${q.id}</strong></td>
                <td><span class="badge" style="background:#667eea;color:#fff;">${q.subject_code || 'ENG'}</span></td>
                <td style="max-width:300px;">${(q.question_text || '').substring(0, 60)}${q.question_text?.length > 60 ? '...' : ''}</td>
                <td style="font-weight:bold;color:#27ae60;">${q.correct_answer}</td>
                <td>${q.topic || 'General'}</td>
                <td><span style="color:${diffColor};">${q.difficulty || 'medium'}</span></td>
                <td>
                    <button onclick="editQuestion(${q.id})" class="action-btn" title="Edit">✏️</button>
                    <button onclick="deleteQuestion(${q.id})" class="action-btn" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;

    // Pagination for questions
    const totalPages = Math.ceil(filtered.length / 15);
    let pagHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        pagHtml += `<button class="page-btn ${i === currentQuestionPage ? 'active' : ''}" onclick="goToQuestionPage(${i})">${i}</button>`;
    }
    document.getElementById('questionPagination').innerHTML = pagHtml;
}

function searchQuestions() {
    const term = document.getElementById('questionSearch').value.toLowerCase();
    const filtered = questionsData.filter(q =>
        q.question_text?.toLowerCase().includes(term) ||
        q.topic?.toLowerCase().includes(term)
    );
    // Temporarily replace for display
    const original = questionsData;
    questionsData = filtered;
    displayQuestions();
    questionsData = original;
}

function goToQuestionPage(page) {
    currentQuestionPage = page;
    displayQuestions();
}

// ========== USER DETAILS (with modal) ==========
window.viewUserDetails = async function (userId) {
    const modal = document.getElementById('userModal');
    const content = document.getElementById('userDetailsContent');
    if (!modal || !content) return;

    modal.style.display = 'flex';
    content.innerHTML = `
        <div style="text-align:center;padding:2rem;">
            <div class="loading-spinner"></div>
            <p>Loading user records...</p>
        </div>
    `;

    try {
        const token = localStorage.getItem('token');
        // Profile
        const profileRes = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profile = await profileRes.json();

        // Exams
        const examsRes = await fetch(`${API_BASE}/api/admin/users/${userId}/exams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const exams = await examsRes.json();

        const joinDate = new Date(profile.created_at).toLocaleDateString('en-NG', { dateStyle: 'medium' });

        let historyRows = '';
        if (Array.isArray(exams) && exams.length) {
            exams.forEach((exam, idx) => {
                const date = new Date(exam.started_at).toLocaleString();
                const subjects = Array.isArray(exam.subjects) ? exam.subjects.join(', ') : 'JAMB Mock';
                const pct = Math.round(exam.percentage);
                const badgeClass = pct >= 75 ? 'badge-admin' : (pct >= 50 ? 'badge-user' : '');
                historyRows += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${subjects}</td>
                        <td>${exam.score || 0}/${exam.total_questions || 180}</td>
                        <td><span class="badge ${badgeClass}">${pct}%</span></td>
                        <td>${date}</td>
                        <td><button class="action-btn" onclick="viewExamDetails('${exam.id}')">View</button></td>
                    </tr>
                `;
            });
        } else {
            historyRows = `<tr><td colspan="6" style="text-align:center;color:#7f8c8d;padding:20px;">No exam sessions yet.</td></tr>`;
        }

        content.innerHTML = `
            <div style="border-bottom:1px solid #eee;padding-bottom:15px;margin-bottom:20px;">
                <h3>${profile.full_name || 'N/A'}</h3>
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Registered:</strong> ${joinDate}</p>
                <p><strong>Role:</strong> ${profile.is_admin ? '<span style="background:#e74c3c;color:#fff;padding:2px 8px;border-radius:4px;">Admin</span>' : 'Student'}</p>
            </div>
            <h4>Exam History (${Array.isArray(exams) ? exams.length : 0})</h4>
            <div class="table-responsive" style="max-height:350px;overflow-y:auto;border:1px solid #eee;border-radius:6px;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr><th>#</th><th>Subjects</th><th>Score</th><th>%</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>${historyRows}</tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error('Error loading user details:', error);
        content.innerHTML = `
            <div style="color:#e74c3c;text-align:center;padding:20px;">
                ❌ Failed to load user details.<br/>
                <small>${error.message}</small>
            </div>
        `;
    }
};

// ========== TOGGLE ADMIN ==========
async function toggleAdmin(userId) {
    if (!confirm('Make this user an admin?')) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/users/${userId}/make-admin`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to update');
        alert('User role updated!');
        loadUsers();
    } catch (error) {
        console.error(error);
        alert('Failed to update user role');
    }
}

// ========== ADD/EDIT/DELETE QUESTIONS ==========
function showAddQuestionForm() {
    document.getElementById('adminPanel').innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
            <h2>➕ Add New Question</h2>
            <button onclick="switchTab('questions')" style="padding:10px 20px;background:#95a5a6;color:#fff;border:none;border-radius:5px;">← Back</button>
        </div>
        <form id="questionForm" onsubmit="saveQuestion(event)" style="background:#fff;padding:30px;border-radius:10px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div><label>Subject *</label><select id="subject_id" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">
                    <option value="">Select</option><option value="1">English</option><option value="2">Mathematics</option>
                    <option value="3">Physics</option><option value="4">Chemistry</option><option value="5">Biology</option>
                </select></div>
                <div><label>Topic</label><input type="text" id="topic" placeholder="e.g., Algebra" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="margin-top:20px;"><label>Question Text *</label><textarea id="question_text" rows="3" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;"></textarea></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
                <div><label>Option A *</label><input type="text" id="option_a" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
                <div><label>Option B *</label><input type="text" id="option_b" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
                <div><label>Option C *</label><input type="text" id="option_c" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
                <div><label>Option D *</label><input type="text" id="option_d" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:20px;">
                <div><label>Correct Answer *</label><select id="correct_answer" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">
                    <option value="">Select</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select></div>
                <div><label>Difficulty</label><select id="difficulty" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">
                    <option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option>
                </select></div>
                <div><label>Year</label><input type="text" id="year" placeholder="2024" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="margin-top:20px;"><label>Explanation</label><textarea id="explanation" rows="2" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;"></textarea></div>
            <div style="margin-top:30px;"><button type="submit" style="width:100%;padding:15px;background:#27ae60;color:#fff;border:none;border-radius:5px;font-size:1.1rem;">💾 Save Question</button></div>
        </form>
    `;
}

async function saveQuestion(event) {
    event.preventDefault();
    const data = {
        subject_id: parseInt(document.getElementById('subject_id').value),
        question_text: document.getElementById('question_text').value,
        option_a: document.getElementById('option_a').value,
        option_b: document.getElementById('option_b').value,
        option_c: document.getElementById('option_c').value,
        option_d: document.getElementById('option_d').value,
        correct_answer: document.getElementById('correct_answer').value,
        explanation: document.getElementById('explanation').value,
        topic: document.getElementById('topic').value || 'General',
        difficulty: document.getElementById('difficulty').value,
        year: document.getElementById('year').value || new Date().getFullYear().toString()
    };
    if (!data.subject_id || !data.question_text || !data.option_a || !data.option_b || !data.option_c || !data.option_d || !data.correct_answer) {
        alert('Please fill all required fields.');
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to save');
        alert('✅ Question added successfully!');
        switchTab('questions');
    } catch (error) {
        console.error(error);
        alert(`❌ ${error.message}`);
    }
}

async function editQuestion(questionId) {
    try {
        const token = localStorage.getItem('token');
        showLoading('Loading question...');
        const response = await fetch(`${API_BASE}/api/admin/questions/${questionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load');
        const q = await response.json();
        showEditQuestionForm(q);
    } catch (error) {
        console.error(error);
        alert('❌ Could not load question details.');
        switchTab('questions');
    }
}

function showEditQuestionForm(q) {
    const panel = document.getElementById('adminPanel');
    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
            <h2>✏️ Edit Question #${q.id}</h2>
            <button onclick="switchTab('questions')" style="padding:10px 20px;background:#95a5a6;color:#fff;border:none;border-radius:5px;">← Back</button>
        </div>
        <form id="editQuestionForm" onsubmit="updateQuestion(event, ${q.id})" style="background:#fff;padding:30px;border-radius:10px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div><label>Subject *</label><select id="edit_subject_id" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">
                    <option value="1" ${q.subject_id===1?'selected':''}>English</option>
                    <option value="2" ${q.subject_id===2?'selected':''}>Mathematics</option>
                    <option value="3" ${q.subject_id===3?'selected':''}>Physics</option>
                    <option value="4" ${q.subject_id===4?'selected':''}>Chemistry</option>
                    <option value="5" ${q.subject_id===5?'selected':''}>Biology</option>
                </select></div>
                <div><label>Topic</label><input type="text" id="edit_topic" value="${q.topic||''}" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="margin-top:20px;"><label>Question Text *</label><textarea id="edit_question_text" rows="3" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">${q.question_text}</textarea></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
                <div><label>Option A *</label><input type="text" id="edit_option_a" required value="${q.option_a}" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
                <div><label>Option B *</label><input type="text" id="edit_option_b" required value="${q.option_b}" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
                <div><label>Option C *</label><input type="text" id="edit_option_c" required value="${q.option_c}" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
                <div><label>Option D *</label><input type="text" id="edit_option_d" required value="${q.option_d}" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:20px;">
                <div><label>Correct Answer *</label><select id="edit_correct_answer" required style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">
                    <option value="A" ${q.correct_answer==='A'?'selected':''}>A</option>
                    <option value="B" ${q.correct_answer==='B'?'selected':''}>B</option>
                    <option value="C" ${q.correct_answer==='C'?'selected':''}>C</option>
                    <option value="D" ${q.correct_answer==='D'?'selected':''}>D</option>
                </select></div>
                <div><label>Difficulty</label><select id="edit_difficulty" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">
                    <option value="easy" ${q.difficulty==='easy'?'selected':''}>Easy</option>
                    <option value="medium" ${q.difficulty==='medium'?'selected':''}>Medium</option>
                    <option value="hard" ${q.difficulty==='hard'?'selected':''}>Hard</option>
                </select></div>
                <div><label>Year</label><input type="text" id="edit_year" value="${q.year||''}" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;" /></div>
            </div>
            <div style="margin-top:20px;"><label>Explanation</label><textarea id="edit_explanation" rows="2" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;">${q.explanation||''}</textarea></div>
            <div style="margin-top:30px;display:flex;gap:15px;">
                <button type="submit" style="flex:1;padding:15px;background:#3498db;color:#fff;border:none;border-radius:5px;font-size:1.1rem;">💾 Update</button>
                <button type="button" onclick="switchTab('questions')" style="flex:1;padding:15px;background:#95a5a6;color:#fff;border:none;border-radius:5px;font-size:1.1rem;">❌ Cancel</button>
            </div>
        </form>
    `;
}

async function updateQuestion(event, questionId) {
    event.preventDefault();
    const data = {
        subject_id: parseInt(document.getElementById('edit_subject_id').value),
        question_text: document.getElementById('edit_question_text').value,
        option_a: document.getElementById('edit_option_a').value,
        option_b: document.getElementById('edit_option_b').value,
        option_c: document.getElementById('edit_option_c').value,
        option_d: document.getElementById('edit_option_d').value,
        correct_answer: document.getElementById('edit_correct_answer').value,
        explanation: document.getElementById('edit_explanation').value,
        topic: document.getElementById('edit_topic').value || 'General',
        difficulty: document.getElementById('edit_difficulty').value,
        year: document.getElementById('edit_year').value || new Date().getFullYear().toString()
    };
    if (!data.subject_id || !data.question_text || !data.option_a || !data.option_b || !data.option_c || !data.option_d || !data.correct_answer) {
        alert('Please fill all required fields.');
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/questions/${questionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to update');
        alert('✅ Question updated!');
        switchTab('questions');
    } catch (error) {
        console.error(error);
        alert(`❌ ${error.message}`);
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('⚠️ Delete this question? IDs will be renumbered.')) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/questions/${questionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to delete');
        alert('✅ Question deleted.');
        loadQuestions();
    } catch (error) {
        console.error(error);
        alert('❌ Failed to delete.');
    }
}

// ========== EXPORT ==========
function exportData(type) {
    let data, filename;
    switch (type) {
        case 'users': data = usersData; filename = 'users.csv'; break;
        case 'exams': data = examsData; filename = 'exams.csv'; break;
        case 'questions': data = questionsData; filename = 'questions.csv'; break;
        case 'subjects':
            // Fetch actual subject performance or use mock
            data = [
                { subject: 'English', questions: 400, correct: 0, rate: '0%' },
                { subject: 'Mathematics', questions: 400, correct: 0, rate: '0%' },
                { subject: 'Physics', questions: 400, correct: 0, rate: '0%' },
                { subject: 'Chemistry', questions: 400, correct: 0, rate: '0%' },
                { subject: 'Biology', questions: 400, correct: 0, rate: '0%' }
            ];
            filename = 'subjects.csv';
            break;
        default: return;
    }
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
}

// ========== UTILITY ==========
function showLoading(message) {
    document.getElementById('adminPanel').innerHTML = `
        <div style="text-align:center;padding:3rem;">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

function generatePagination(totalItems, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return '';
    let html = '';
    html += `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;
    if (currentPage > 3) {
        html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (currentPage > 4) html += `<span class="page-dots">...</span>`;
    }
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) html += `<span class="page-dots">...</span>`;
        html += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    return html;
}

function changePage(page) {
    if (page < 1) return;
    let totalItems = 0;
    if (currentTab === 'users') totalItems = usersData.length;
    else if (currentTab === 'exams') totalItems = examsData.length;
    else if (currentTab === 'questions') {
        const filtered = currentSubjectFilter !== 'all' ? questionsData.filter(q => q.subject_id === parseInt(currentSubjectFilter)) : questionsData;
        totalItems = filtered.length;
        goToQuestionPage(page);
        return;
    } else return;
    const totalPages = Math.ceil(totalItems / 10);
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    currentPage = page;
    if (currentTab === 'users') displayUsers();
    else if (currentTab === 'exams') displayExams();
}

function searchUsers() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = usersData.filter(u => u.full_name?.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    const original = usersData;
    usersData = filtered;
    displayUsers();
    usersData = original;
}

function searchExams() {
    const term = document.getElementById('examSearch').value.toLowerCase();
    const filtered = examsData.filter(e => e.user_name?.toLowerCase().includes(term) || e.subjects?.some(s => s.toLowerCase().includes(term)));
    const original = examsData;
    examsData = filtered;
    displayExams();
    examsData = original;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

// ========== ESCAPE HTML ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// Expose functions to global
window.switchTab = switchTab;
window.loadUsers = loadUsers;
window.loadExams = loadExams;
window.loadSubjectPerformance = loadSubjectPerformance;
window.loadQuestionBank = loadQuestionBank;
window.viewUserDetails = viewUserDetails;
window.toggleAdmin = toggleAdmin;
window.exportData = exportData;
window.changePage = changePage;
window.searchUsers = searchUsers;
window.searchExams = searchExams;
window.showAddQuestionForm = showAddQuestionForm;
window.saveQuestion = saveQuestion;
window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;
window.filterBySubject = filterBySubject;
window.goToQuestionPage = goToQuestionPage;
window.searchQuestions = searchQuestions;
window.logout = logout;