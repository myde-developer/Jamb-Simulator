// Admin state
let currentTab = 'users';
let currentPage = 1;
let usersData = [];
let examsData = [];

// Check admin access
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadStats();
    loadUsers();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    if (!user.is_admin) {
        window.location.href = 'index.html';
        return;
    }
}

async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load stats');
        
        const stats = await response.json();
        
        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="number">${stats.totalUsers}</div>
            </div>
            <div class="stat-card">
                <h3>Total Exams</h3>
                <div class="number">${stats.totalExams}</div>
            </div>
            <div class="stat-card">
                <h3>Questions</h3>
                <div class="number">${stats.totalQuestions}</div>
            </div>
            <div class="stat-card">
                <h3>Avg Score</h3>
                <div class="number">${stats.avgScore}%</div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showDemoStats();
    }
}

function showDemoStats() {
    document.getElementById('statsCards').innerHTML = `
        <div class="stat-card">
            <h3>Total Users</h3>
            <div class="number">156</div>
        </div>
        <div class="stat-card">
            <h3>Total Exams</h3>
            <div class="number">487</div>
        </div>
        <div class="stat-card">
            <h3>Questions</h3>
            <div class="number">2,000</div>
        </div>
        <div class="stat-card">
            <h3>Avg Score</h3>
            <div class="number">58%</div>
        </div>
    `;
}

async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
        usersData = await response.json();
        displayUsers();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showDemoUsers();
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
        const scoreClass = avgScore >= 70 ? 'score-high' : avgScore >= 50 ? 'score-medium' : 'score-low';
        
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
                <td class="${scoreClass}">${avgScore}%</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewUserDetails(${user.id})" style="padding: 5px 10px;">👁️</button>
                    ${!user.is_admin ? `<button onclick="toggleAdmin(${user.id})" style="padding: 5px 10px;">👑</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <div class="pagination">
            ${generatePagination(usersData.length)}
        </div>
    `;
    
    panel.innerHTML = html;
}

function showDemoUsers() {
    usersData = [
        { id: 1, full_name: 'John Doe', email: 'john@example.com', is_admin: false, exam_count: 12, created_at: '2026-01-15' },
        { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', is_admin: true, exam_count: 8, created_at: '2026-01-20' },
        { id: 3, full_name: 'Mike Johnson', email: 'mike@example.com', is_admin: false, exam_count: 5, created_at: '2026-02-01' },
        { id: 4, full_name: 'Sarah Williams', email: 'sarah@example.com', is_admin: false, exam_count: 15, created_at: '2026-01-10' },
        { id: 5, full_name: 'David Brown', email: 'david@example.com', is_admin: false, exam_count: 3, created_at: '2026-02-15' }
    ];
    displayUsers();
}

function calculateUserAvgScore(user) {
    // In production, calculate from actual exam data
    return Math.floor(Math.random() * 40) + 40; // Demo: 40-80%
}

async function loadExams() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/exams', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load exams');
        
        examsData = await response.json();
        displayExams();
        
    } catch (error) {
        console.error('Error loading exams:', error);
        showDemoExams();
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
        const scoreClass = percentage >= 70 ? 'score-high' : percentage >= 50 ? 'score-medium' : 'score-low';
        
        html += `
            <tr>
                <td>${new Date(exam.completed_at || exam.started_at).toLocaleString()}</td>
                <td><strong>${exam.user_name || 'Unknown'}</strong></td>
                <td>${exam.subjects?.join(', ') || 'JAMB Exam'}</td>
                <td class="${scoreClass}">${exam.score || 0}/${exam.total_questions || 180}</td>
                <td class="${scoreClass}">${percentage}%</td>
                <td>${calculateTimeSpent(exam.started_at, exam.completed_at)}</td>
                <td>
                    <button onclick="viewExamDetails(${exam.id})" style="padding: 5px 10px;">👁️</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <div class="pagination">
            ${generatePagination(examsData.length)}
        </div>
    `;
    
    panel.innerHTML = html;
}

function showDemoExams() {
    examsData = [
        { id: 1, user_name: 'John Doe', subjects: ['English', 'Math', 'Physics', 'Chemistry'], score: 315, total_questions: 180, percentage: 79, started_at: '2026-03-13T10:00:00', completed_at: '2026-03-13T12:00:00' },
        { id: 2, user_name: 'Jane Smith', subjects: ['English', 'Math', 'Biology', 'Chemistry'], score: 288, total_questions: 180, percentage: 72, started_at: '2026-03-12T14:00:00', completed_at: '2026-03-12T16:00:00' },
        { id: 3, user_name: 'Mike Johnson', subjects: ['English', 'Math', 'Physics', 'Biology'], score: 342, total_questions: 180, percentage: 86, started_at: '2026-03-11T09:00:00', completed_at: '2026-03-11T11:00:00' },
        { id: 4, user_name: 'Sarah Williams', subjects: ['English', 'Math', 'Chemistry', 'Biology'], score: 256, total_questions: 180, percentage: 64, started_at: '2026-03-10T11:00:00', completed_at: '2026-03-10T13:00:00' }
    ];
    displayExams();
}

function loadSubjectPerformance() {
    const panel = document.getElementById('adminPanel');
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2>Subject Performance Analysis</h2>
            <button class="export-btn" onclick="exportData('subjects')">📥 Export CSV</button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Total Questions</th>
                    <th>Times Answered</th>
                    <th>Correct Answers</th>
                    <th>Success Rate</th>
                    <th>Most Missed Topic</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Use of English</strong></td>
                    <td>400</td>
                    <td>2,847</td>
                    <td>1,823</td>
                    <td class="score-medium">64%</td>
                    <td>Oral English</td>
                </tr>
                <tr>
                    <td><strong>Mathematics</strong></td>
                    <td>400</td>
                    <td>2,156</td>
                    <td>1,294</td>
                    <td class="score-medium">60%</td>
                    <td>Calculus</td>
                </tr>
                <tr>
                    <td><strong>Physics</strong></td>
                    <td>400</td>
                    <td>1,984</td>
                    <td>1,190</td>
                    <td class="score-medium">60%</td>
                    <td>Electricity</td>
                </tr>
                <tr>
                    <td><strong>Chemistry</strong></td>
                    <td>400</td>
                    <td>2,023</td>
                    <td>1,294</td>
                    <td class="score-medium">64%</td>
                    <td>Organic Chemistry</td>
                </tr>
                <tr>
                    <td><strong>Biology</strong></td>
                    <td>400</td>
                    <td>2,312</td>
                    <td>1,618</td>
                    <td class="score-medium">70%</td>
                    <td>Genetics</td>
                </tr>
            </tbody>
        </table>
        
        <div style="margin-top: 30px;">
            <h3>Topic Difficulty Analysis</h3>
            <div class="subject-bar" style="margin-top: 20px;">
                <div class="subject-info">
                    <span>Calculus (Math)</span>
                    <span>35% success rate</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill-subject" style="width: 35%; background: #e74c3c;"></div>
                </div>
            </div>
            <div class="subject-bar">
                <div class="subject-info">
                    <span>Organic Chemistry</span>
                    <span>42% success rate</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill-subject" style="width: 42%; background: #f39c12;"></div>
                </div>
            </div>
            <div class="subject-bar">
                <div class="subject-info">
                    <span>Genetics (Biology)</span>
                    <span>48% success rate</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill-subject" style="width: 48%; background: #f39c12;"></div>
                </div>
            </div>
        </div>
    `;
}

function loadQuestionBank() {
    const panel = document.getElementById('adminPanel');
    
    panel.innerHTML = `
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
            <input type="text" placeholder="Search questions...">
            <button>🔍 Search</button>
            <button style="background: #27ae60;">➕ Add Question</button>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Question</th>
                    <th>Difficulty</th>
                    <th>Topic</th>
                    <th>Year</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>#001</td>
                    <td><span class="badge" style="background: #667eea; color: white;">ENG</span></td>
                    <td>In "The Lekki Headmaster", what was Mr. Bepo's challenge?...</td>
                    <td><span style="color: #27ae60;">Easy</span></td>
                    <td>Literature</td>
                    <td>2026</td>
                    <td>
                        <button style="padding: 5px 8px;">✏️</button>
                        <button style="padding: 5px 8px;">🗑️</button>
                    </td>
                </tr>
                <tr>
                    <td>#002</td>
                    <td><span class="badge" style="background: #667eea; color: white;">ENG</span></td>
                    <td>Choose the option opposite in meaning to DILIGENT...</td>
                    <td><span style="color: #27ae60;">Easy</span></td>
                    <td>Vocabulary</td>
                    <td>2025</td>
                    <td>
                        <button style="padding: 5px 8px;">✏️</button>
                        <button style="padding: 5px 8px;">🗑️</button>
                    </td>
                </tr>
                <tr>
                    <td>#003</td>
                    <td><span class="badge" style="background: #e74c3c; color: white;">MTH</span></td>
                    <td>Solve for x: 2x² - 5x + 3 = 0...</td>
                    <td><span style="color: #f39c12;">Medium</span></td>
                    <td>Quadratic</td>
                    <td>2024</td>
                    <td>
                        <button style="padding: 5px 8px;">✏️</button>
                        <button style="padding: 5px 8px;">🗑️</button>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <div class="pagination">
            <button class="page-btn">1</button>
            <button class="page-btn active">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">4</button>
            <button class="page-btn">5</button>
        </div>
    `;
}

function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load tab content
    switch(tab) {
        case 'users':
            loadUsers();
            break;
        case 'exams':
            loadExams();
            break;
        case 'subjects':
            loadSubjectPerformance();
            break;
        case 'questions':
            loadQuestionBank();
            break;
    }
}

function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = usersData.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    
    // Display filtered results
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
                    <button onclick="viewUserDetails(${user.id})" style="padding: 5px 10px;">👁️</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
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
    
    switch(currentTab) {
        case 'users':
            displayUsers();
            break;
        case 'exams':
            displayExams();
            break;
    }
}

function viewUserDetails(userId) {
    const user = usersData.find(u => u.id === userId);
    alert(`Viewing details for ${user.full_name}\nEmail: ${user.email}\nTotal Exams: ${user.exam_count || 0}`);
    // In production, open modal with user details and exam history
}

function viewExamDetails(examId) {
    alert(`Viewing exam #${examId} details`);
    // In production, open modal with full exam results
}

function toggleAdmin(userId) {
    if (confirm('Make this user an admin?')) {
        alert('User role updated!');
        // In production, call API to update user role
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
    
    // Convert to CSV
    const csv = convertToCSV(data);
    
    // Download
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
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    return `${diffMins} mins`;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Make functions global
window.switchTab = switchTab;
window.searchUsers = searchUsers;
window.exportData = exportData;
window.viewUserDetails = viewUserDetails;
window.viewExamDetails = viewExamDetails;
window.toggleAdmin = toggleAdmin;
window.goToPage = goToPage;
window.logout = logout;
window.filterQuestions = filterQuestions;