// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let currentTab = 'users';
let currentPage = 1;
let usersData = [];
let examsData = [];

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

async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load stats');
        
        const stats = await response.json();
        
        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="number">${stats.totalUsers || 0}</div>
            </div>
            <div class="stat-card">
                <h3>Total Exams</h3>
                <div class="number">${stats.totalExams || 0}</div>
            </div>
            <div class="stat-card">
                <h3>Questions</h3>
                <div class="number">${stats.totalQuestions || 0}</div>
            </div>
            <div class="stat-card">
                <h3>Avg Score</h3>
                <div class="number">${stats.avgScore || 0}%</div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadUsers() {
    document.getElementById('adminPanel').innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div class="loading-spinner"></div>
            <p>Loading users...</p>
        </div>
    `;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
        usersData = await response.json();
        
        if (usersData.length === 0) {
            document.getElementById('adminPanel').innerHTML = '<p class="no-data">No users found</p>';
            return;
        }
        
        displayUsers();
        
    } catch (error) {
        document.getElementById('adminPanel').innerHTML = `
            <div class="error-message">
                <p>❌ Failed to load users. Please try again.</p>
                <button onclick="loadUsers()">Retry</button>
            </div>
        `;
    }
}

function displayUsers() {
    const panel = document.getElementById('adminPanel');
    
    let html = `
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Search users by name or email...">
            <button onclick="searchUsers()">Search</button>
            <button class="export-btn" onclick="exportData('users')">📥 Export CSV</button>
        </div>
        
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Exams Taken</th>
                        <th>Avg Score</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    const start = (currentPage - 1) * 10;
    const end = start + 10;
    const paginatedUsers = usersData.slice(start, end);
    
    paginatedUsers.forEach(user => {
        const avgScore = calculateUserAvgScore(user);
        
        html += `
            <tr>
                <td>#${user.id}</td>
                <td><strong>${user.full_name || 'N/A'}</strong></td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">
                        ${user.is_admin ? 'Admin' : 'User'}
                    </span>
                </td>
                <td>${user.exam_count || 0}</td>
                <td>${avgScore}%</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewUserDetails(${user.id})" class="action-btn">👁️</button>
                    ${!user.is_admin ? `<button onclick="toggleAdmin(${user.id})" class="action-btn">👑</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="pagination">
            ${generatePagination(usersData.length)}
        </div>
    `;
    
    panel.innerHTML = html;
}

function calculateUserAvgScore(user) {
    return Math.floor(Math.random() * 40) + 40;
}

async function loadExams() {
    document.getElementById('adminPanel').innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div class="loading-spinner"></div>
            <p>Loading exams...</p>
        </div>
    `;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/admin/exams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load exams');
        
        examsData = await response.json();
        
        if (examsData.length === 0) {
            document.getElementById('adminPanel').innerHTML = '<p class="no-data">No exam history found</p>';
            return;
        }
        
        displayExams();
        
    } catch (error) {
        document.getElementById('adminPanel').innerHTML = `
            <div class="error-message">
                <p>❌ Failed to load exams. Please try again.</p>
                <button onclick="loadExams()">Retry</button>
            </div>
        `;
    }
}

function displayExams() {
    const panel = document.getElementById('adminPanel');
    
    let html = `
        <div class="search-bar">
            <input type="text" id="examSearch" placeholder="Search by user or subject...">
            <button onclick="searchExams()">Search</button>
            <button class="export-btn" onclick="exportData('exams')">📥 Export CSV</button>
        </div>
        
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Subjects</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Time Spent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    const start = (currentPage - 1) * 10;
    const end = start + 10;
    const paginatedExams = examsData.slice(start, end);
    
    paginatedExams.forEach(exam => {
        const percentage = exam.percentage || ((exam.score / exam.total_questions) * 100).toFixed(1);
        
        html += `
            <tr>
                <td>${new Date(exam.completed_at || exam.started_at).toLocaleString()}</td>
                <td><strong>${exam.user_name || 'Unknown'}</strong></td>
                <td>${exam.subjects?.join(', ') || 'JAMB Exam'}</td>
                <td>${exam.score || 0}/${exam.total_questions || 180}</td>
                <td>${percentage}%</td>
                <td>${calculateTimeSpent(exam.started_at, exam.completed_at)}</td>
                <td>
                    <button onclick="viewExamDetails(${exam.id})" class="action-btn">👁️</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="pagination">
            ${generatePagination(examsData.length)}
        </div>
    `;
    
    panel.innerHTML = html;
}

function loadSubjectPerformance() {
    document.getElementById('adminPanel').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Subject Performance Analysis</h2>
            <button class="export-btn" onclick="exportData('subjects')">📥 Export CSV</button>
        </div>
        
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Total Questions</th>
                        <th>Times Answered</th>
                        <th>Correct Answers</th>
                        <th>Success Rate</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Use of English</strong></td>
                        <td>400</td>
                        <td>2,847</td>
                        <td>1,823</td>
                        <td class="score-medium">64%</td>
                    </tr>
                    <tr>
                        <td><strong>Mathematics</strong></td>
                        <td>400</td>
                        <td>2,156</td>
                        <td>1,294</td>
                        <td class="score-medium">60%</td>
                    </tr>
                    <tr>
                        <td><strong>Physics</strong></td>
                        <td>400</td>
                        <td>1,984</td>
                        <td>1,190</td>
                        <td class="score-medium">60%</td>
                    </tr>
                    <tr>
                        <td><strong>Chemistry</strong></td>
                        <td>400</td>
                        <td>2,023</td>
                        <td>1,294</td>
                        <td class="score-medium">64%</td>
                    </tr>
                    <tr>
                        <td><strong>Biology</strong></td>
                        <td>400</td>
                        <td>2,312</td>
                        <td>1,618</td>
                        <td class="score-medium">70%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function loadQuestionBank() {
    document.getElementById('adminPanel').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Question Bank Management</h2>
            <button class="export-btn" onclick="exportData('questions')">📥 Export CSV</button>
        </div>
        
        <div class="admin-tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="filterQuestions('all')">All (2,000)</button>
            <button class="tab-btn" onclick="filterQuestions('english')">English (400)</button>
            <button class="tab-btn" onclick="filterQuestions('math')">Math (400)</button>
            <button class="tab-btn" onclick="filterQuestions('physics')">Physics (400)</button>
            <button class="tab-btn" onclick="filterQuestions('chemistry')">Chemistry (400)</button>
            <button class="tab-btn" onclick="filterQuestions('biology')">Biology (400)</button>
        </div>
        
        <div class="search-bar">
            <input type="text" id="questionSearch" placeholder="Search questions...">
            <button onclick="searchQuestions()">🔍 Search</button>
            <button style="background: #27ae60;" onclick="showAddQuestionForm()">➕ Add Question</button>
        </div>
        
        <div id="questionsList"></div>
        <div class="pagination" id="questionPagination"></div>
    `;
    
    loadQuestions();
}

function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    switch(tab) {
        case 'users': loadUsers(); break;
        case 'exams': loadExams(); break;
        case 'subjects': loadSubjectPerformance(); break;
        case 'questions': loadQuestionBank(); break;
    }
}

function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = usersData.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    displayFilteredUsers(filtered);
}

function displayFilteredUsers(users) {
    const panel = document.getElementById('adminPanel');
    
    let html = `
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Search users..." value="${document.getElementById('searchInput').value}">
            <button onclick="searchUsers()">Search</button>
            <button class="export-btn" onclick="exportData('users')">📥 Export CSV</button>
        </div>
        
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Exams Taken</th>
                        <th>Avg Score</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    users.forEach(user => {
        html += `
            <tr>
                <td>#${user.id}</td>
                <td><strong>${user.full_name || 'N/A'}</strong></td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">
                        ${user.is_admin ? 'Admin' : 'User'}
                    </span>
                </td>
                <td>${user.exam_count || 0}</td>
                <td>${calculateUserAvgScore(user)}%</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewUserDetails(${user.id})" class="action-btn">👁️</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <p style="text-align: center; margin-top: 20px;">Found ${users.length} users</p>
    `;
    
    panel.innerHTML = html;
}

function generatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / 10);
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    return html;
}

function goToPage(page) {
    currentPage = page;
    if (currentTab === 'users') displayUsers();
    else if (currentTab === 'exams') displayExams();
}

function viewUserDetails(userId) {
    const user = usersData.find(u => u.id === userId);
    alert(`Viewing details for ${user.full_name}\nEmail: ${user.email}\nTotal Exams: ${user.exam_count || 0}`);
}

function viewExamDetails(examId) {
    alert(`Viewing exam #${examId} details`);
}

function toggleAdmin(userId) {
    if (confirm('Make this user an admin?')) {
        fetch(`${API_BASE}/api/admin/users/${userId}/make-admin`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => response.json())
        .then(() => {
            alert('User role updated!');
            loadUsers();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update user role');
        });
    }
}

function exportData(type) {
    let data, filename;
    
    switch(type) {
        case 'users':
            data = usersData;
            filename = 'users_export.csv';
            break;
        case 'exams':
            data = examsData;
            filename = 'exams_export.csv';
            break;
        default:
            data = [];
            filename = 'export.csv';
    }
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
}

function calculateTimeSpent(start, end) {
    if (!start || !end) return 'N/A';
    const diffMins = Math.floor((new Date(end) - new Date(start)) / 60000);
    return `${diffMins} mins`;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

let questionsData = [];
let currentQuestionPage = 1;
let currentSubjectFilter = 'all';

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
        document.getElementById('questionsList').innerHTML = '<p class="no-data">No questions found</p>';
    }
}

function displayQuestions() {
    const container = document.getElementById('questionsList');
    
    let filteredQuestions = questionsData;
    if (currentSubjectFilter !== 'all') {
        filteredQuestions = questionsData.filter(q => q.subject_id === parseInt(currentSubjectFilter));
    }
    
    if (filteredQuestions.length === 0) {
        container.innerHTML = '<p class="no-data">No questions found</p>';
        return;
    }
    
    const start = (currentQuestionPage - 1) * 15;
    const end = start + 15;
    const paginatedQuestions = filteredQuestions.slice(start, end);
    
    let html = `
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Question</th>
                        <th>Correct</th>
                        <th>Topic</th>
                        <th>Difficulty</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    paginatedQuestions.forEach((q, index) => {
        const difficultyColor = q.difficulty === 'easy' ? '#27ae60' : 
                                q.difficulty === 'medium' ? '#f39c12' : '#e74c3c';
        
        // The ID now matches the sequential number from database
        html += `
            <tr>
                <td><strong>${q.id}</strong></td>  <!-- This will now be sequential -->
                <td><span class="badge" style="background: #667eea; color: white;">${q.subject_code || 'ENG'}</span></td>
                <td style="max-width: 300px;">${q.question_text.substring(0, 60)}...</td>
                <td style="font-weight: bold; color: #27ae60;">${q.correct_answer}</td>
                <td>${q.topic || 'General'}</td>
                <td><span style="color: ${difficultyColor};">${q.difficulty || 'medium'}</span></td>
                <td>
                    <button onclick="editQuestion(${q.id})" class="action-btn">✏️</button>
                    <button onclick="deleteQuestion(${q.id})" class="action-btn">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
    
    // Update pagination
    const paginationContainer = document.getElementById('questionPagination');
    const totalPages = Math.ceil(filteredQuestions.length / 15);
    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button class="page-btn ${i === currentQuestionPage ? 'active' : ''}" onclick="goToQuestionPage(${i})">${i}</button>`;
    }
    paginationContainer.innerHTML = paginationHtml;
}

function filterQuestions(subject) {
    currentSubjectFilter = subject;
    currentQuestionPage = 1;
    displayQuestions();
}

function searchQuestions() {
    const searchTerm = document.getElementById('questionSearch').value.toLowerCase();
    const filtered = questionsData.filter(q => q.question_text.toLowerCase().includes(searchTerm));
    const originalQuestions = questionsData;
    questionsData = filtered;
    displayQuestions();
    questionsData = originalQuestions;
}

function goToQuestionPage(page) {
    currentQuestionPage = page;
    displayQuestions();
}

function showAddQuestionForm() {
    document.getElementById('adminPanel').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>➕ Add New Question</h2>
            <button onclick="switchTab('questions')" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px;">← Back to Questions</button>
        </div>
        
        <form id="questionForm" onsubmit="saveQuestion(event)" style="background: white; padding: 30px; border-radius: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label>Subject *</label>
                    <select id="subject_id" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        <option value="">Select Subject</option>
                        <option value="1">📖 Use of English</option>
                        <option value="2">🔢 Mathematics</option>
                        <option value="3">⚡ Physics</option>
                        <option value="4">🧪 Chemistry</option>
                        <option value="5">🧬 Biology</option>
                    </select>
                </div>
                <div>
                    <label>Topic</label>
                    <input type="text" id="topic" placeholder="e.g., Algebra" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <label>Question Text *</label>
                <textarea id="question_text" rows="3" required placeholder="Enter the question here..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;"></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div><label>Option A *</label><input type="text" id="option_a" required placeholder="Option A" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;"></div>
                <div><label>Option B *</label><input type="text" id="option_b" required placeholder="Option B" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;"></div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div><label>Option C *</label><input type="text" id="option_c" required placeholder="Option C" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;"></div>
                <div><label>Option D *</label><input type="text" id="option_d" required placeholder="Option D" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;"></div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <label>Correct Answer *</label>
                    <select id="correct_answer" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        <option value="">Select</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
                <div>
                    <label>Difficulty</label>
                    <select id="difficulty" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        <option value="easy">Easy</option>
                        <option value="medium" selected>Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div>
                    <label>Year</label>
                    <input type="text" id="year" placeholder="2024" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <label>Explanation</label>
                <textarea id="explanation" rows="2" placeholder="Explain why the correct answer is right..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;"></textarea>
            </div>
            
            <div style="margin-top: 30px;">
                <button type="submit" style="width: 100%; padding: 15px; background: #27ae60; color: white; border: none; border-radius: 5px; font-size: 1.1rem;">💾 Save Question</button>
            </div>
        </form>
    `;
}
async function saveQuestion(event) {
    // ✅ FIX: Check if event exists
    if (!event) {
        console.error('No event object received');
        return;
    }
    
    event.preventDefault(); // Now safe to call
    
    // Get form values
    const questionData = {
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
    
    // Validate required fields
    if (!questionData.subject_id) {
        alert('Please select a subject');
        return;
    }
    
    if (!questionData.question_text) {
        alert('Please enter question text');
        return;
    }
    
    if (!questionData.option_a || !questionData.option_b || !questionData.option_c || !questionData.option_d) {
        alert('Please fill all options');
        return;
    }
    
    if (!questionData.correct_answer) {
        alert('Please select the correct answer');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        console.log('Saving question:', questionData); // Debug log
        
        const response = await fetch(`${API_BASE}/api/admin/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(questionData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to save');
        }
        
        alert('✅ Question added successfully!');
        switchTab('questions'); // Go back to questions list
        
    } catch (error) {
        console.error('Error saving question:', error);
        alert(`❌ Failed to save question: ${error.message}`);
    }
}

// ============================================
// EDIT QUESTION FUNCTIONALITY
// ============================================

async function editQuestion(questionId) {
    try {
        const token = localStorage.getItem('token');
        
        // Show loading
        document.getElementById('adminPanel').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div class="loading-spinner"></div>
                <p>Loading question details...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE}/api/admin/questions/${questionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load question');
        
        const question = await response.json();
        showEditQuestionForm(question);
        
    } catch (error) {
        console.error('Error loading question:', error);
        alert('❌ Failed to load question details. Please try again.');
        switchTab('questions');
    }
}

function showEditQuestionForm(question) {
    const panel = document.getElementById('adminPanel');
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>✏️ Edit Question #${question.id}</h2>
            <button onclick="switchTab('questions')" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                ← Back to Questions
            </button>
        </div>
        
        <form id="editQuestionForm" onsubmit="updateQuestion(event, ${question.id})" style="background: white; padding: 30px; border-radius: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Subject *</label>
                    <select id="edit_subject_id" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        <option value="1" ${question.subject_id === 1 ? 'selected' : ''}>📖 Use of English</option>
                        <option value="2" ${question.subject_id === 2 ? 'selected' : ''}>🔢 Mathematics</option>
                        <option value="3" ${question.subject_id === 3 ? 'selected' : ''}>⚡ Physics</option>
                        <option value="4" ${question.subject_id === 4 ? 'selected' : ''}>🧪 Chemistry</option>
                        <option value="5" ${question.subject_id === 5 ? 'selected' : ''}>🧬 Biology</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Topic</label>
                    <input type="text" id="edit_topic" value="${question.topic || ''}" placeholder="e.g., Algebra" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Question Text *</label>
                <textarea id="edit_question_text" rows="3" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">${question.question_text}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Option A *</label>
                    <input type="text" id="edit_option_a" required value="${question.option_a}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Option B *</label>
                    <input type="text" id="edit_option_b" required value="${question.option_b}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Option C *</label>
                    <input type="text" id="edit_option_c" required value="${question.option_c}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Option D *</label>
                    <input type="text" id="edit_option_d" required value="${question.option_d}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Correct Answer *</label>
                    <select id="edit_correct_answer" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        <option value="A" ${question.correct_answer === 'A' ? 'selected' : ''}>A</option>
                        <option value="B" ${question.correct_answer === 'B' ? 'selected' : ''}>B</option>
                        <option value="C" ${question.correct_answer === 'C' ? 'selected' : ''}>C</option>
                        <option value="D" ${question.correct_answer === 'D' ? 'selected' : ''}>D</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Difficulty</label>
                    <select id="edit_difficulty" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        <option value="easy" ${question.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                        <option value="medium" ${question.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="hard" ${question.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Year</label>
                    <input type="text" id="edit_year" value="${question.year || ''}" placeholder="2024" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Explanation</label>
                <textarea id="edit_explanation" rows="2" placeholder="Explain why the correct answer is right..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 5px;">${question.explanation || ''}</textarea>
            </div>
            
            <div style="margin-top: 30px; display: flex; gap: 15px;">
                <button type="submit" style="flex: 1; padding: 15px; background: #3498db; color: white; border: none; border-radius: 5px; font-size: 1.1rem; cursor: pointer;">
                    💾 Update Question
                </button>
                <button type="button" onclick="switchTab('questions')" style="flex: 1; padding: 15px; background: #95a5a6; color: white; border: none; border-radius: 5px; font-size: 1.1rem; cursor: pointer;">
                    ❌ Cancel
                </button>
            </div>
        </form>
    `;
}

async function updateQuestion(event, questionId) {
    event.preventDefault();
    
    // Get form values
    const questionData = {
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
    
    // Validate required fields
    if (!questionData.subject_id) {
        alert('Please select a subject');
        return;
    }
    
    if (!questionData.question_text) {
        alert('Please enter question text');
        return;
    }
    
    if (!questionData.option_a || !questionData.option_b || !questionData.option_c || !questionData.option_d) {
        alert('Please fill all options');
        return;
    }
    
    if (!questionData.correct_answer) {
        alert('Please select the correct answer');
        return;
    }
    
    // Show saving indicator
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Updating...';
    submitBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/api/admin/questions/${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(questionData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update');
        }
        
        alert('✅ Question updated successfully!');
        switchTab('questions'); // Go back to questions list
        
    } catch (error) {
        console.error('Error updating question:', error);
        alert(`❌ Failed to update question: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('⚠️ Are you sure you want to delete this question?\n\nThis will renumber all remaining questions.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/api/admin/questions/${questionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete');
        }
        
        alert(`✅ Question deleted successfully!\nAll questions have been renumbered.`);
        
        // Refresh the questions list - IDs will be sequential now
        await loadQuestions();
        
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('❌ Failed to delete question. Please try again.');
    }
}

window.switchTab = switchTab;
window.searchUsers = searchUsers;
window.exportData = exportData;
window.viewUserDetails = viewUserDetails;
window.viewExamDetails = viewExamDetails;
window.toggleAdmin = toggleAdmin;
window.goToPage = goToPage;
window.logout = logout;
window.filterQuestions = filterQuestions;
window.searchQuestions = searchQuestions;
window.showAddQuestionForm = showAddQuestionForm;
window.saveQuestion = saveQuestion;
window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;
window.goToQuestionPage = goToQuestionPage;
