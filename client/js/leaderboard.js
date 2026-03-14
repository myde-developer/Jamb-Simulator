// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let leaderboardState = {
    currentUser: null,
    allUsers: [],
    filteredUsers: [],
    currentView: 'overall',
    searchTerm: ''
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadLeaderboardData();
    if (window.studyStreak) studyStreak.init();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/auth.html';
    
    leaderboardState.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
}

async function loadLeaderboardData() {
    try {
        document.getElementById('leaderboardRows').innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 20px;">Loading leaderboard...</p>
            </div>
        `;
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/leaderboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load leaderboard');
        
        const data = await response.json();
        leaderboardState.allUsers = data.users || generateMockData();
        leaderboardState.filteredUsers = [...leaderboardState.allUsers];
        
        renderLeaderboard();
        
    } catch (error) {
        leaderboardState.allUsers = generateMockData();
        leaderboardState.filteredUsers = [...leaderboardState.allUsers];
        renderLeaderboard();
    }
}

function generateMockData() {
    const names = [
        'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 
        'David Brown', 'Emily Davis', 'James Wilson', 'Lisa Anderson',
        'Robert Taylor', 'Maria Garcia'
    ];
    
    return names.map((name, index) => ({
        id: index + 1,
        name: name,
        avatar: name.charAt(0),
        score: Math.floor(Math.random() * 300) + 200,
        exams: Math.floor(Math.random() * 50) + 10,
        streak: Math.floor(Math.random() * 30),
        badges: Math.floor(Math.random() * 10) + 1,
        weeklyScore: Math.floor(Math.random() * 100) + 50,
        monthlyScore: Math.floor(Math.random() * 200) + 100
    }));
}

function renderLeaderboard() {
    renderPodium();
    renderRows();
    renderYourRank();
}

function renderPodium() {
    const top3 = leaderboardState.filteredUsers
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    
    const podium = document.getElementById('podium');
    
    if (top3.length < 3) {
        podium.innerHTML = '';
        return;
    }
    
    podium.innerHTML = `
        <div class="podium-item second">
            <div class="rank-badge">2</div>
            <div class="podium-name">${top3[1].name}</div>
            <div class="podium-score">${top3[1].score}</div>
            <div class="podium-stats">${top3[1].exams} exams</div>
        </div>
        <div class="podium-item first">
            <div class="rank-badge">🏆 1</div>
            <div class="podium-name">${top3[0].name}</div>
            <div class="podium-score">${top3[0].score}</div>
            <div class="podium-stats">${top3[0].exams} exams</div>
        </div>
        <div class="podium-item third">
            <div class="rank-badge">3</div>
            <div class="podium-name">${top3[2].name}</div>
            <div class="podium-score">${top3[2].score}</div>
            <div class="podium-stats">${top3[2].exams} exams</div>
        </div>
    `;
}

function renderRows() {
    let filtered = [...leaderboardState.filteredUsers];
    
    if (leaderboardState.searchTerm) {
        filtered = filtered.filter(user => 
            user.name.toLowerCase().includes(leaderboardState.searchTerm.toLowerCase())
        );
    }
    
    switch(leaderboardState.currentView) {
        case 'weekly':
            filtered.sort((a, b) => b.weeklyScore - a.weeklyScore);
            break;
        case 'monthly':
            filtered.sort((a, b) => b.monthlyScore - a.monthlyScore);
            break;
        case 'streak':
            filtered.sort((a, b) => b.streak - a.streak);
            break;
        default:
            filtered.sort((a, b) => b.score - a.score);
    }
    
    const rows = document.getElementById('leaderboardRows');
    
    rows.innerHTML = filtered.slice(0, 50).map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.name === leaderboardState.currentUser.full_name;
        const score = getScoreForView(user);
        
        return `
            <div class="table-row ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank ${getRankClass(rank)}">#${rank}</div>
                <div class="user-info">
                    <div class="user-avatar">${user.avatar}</div>
                    <span class="user-name">${user.name}</span>
                </div>
                <div class="score-value">${score}</div>
                <div>${user.exams}</div>
                <div class="badge-icon">${'🏆'.repeat(Math.min(user.badges, 3))} ${user.badges}</div>
            </div>
        `;
    }).join('');
}

function getScoreForView(user) {
    switch(leaderboardState.currentView) {
        case 'weekly': return user.weeklyScore;
        case 'monthly': return user.monthlyScore;
        case 'streak': return user.streak + ' days';
        default: return user.score;
    }
}

function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

function renderYourRank() {
    const userIndex = leaderboardState.filteredUsers
        .sort((a, b) => b.score - a.score)
        .findIndex(u => u.name === leaderboardState.currentUser.full_name);
    
    if (userIndex === -1) {
        document.getElementById('yourRank').style.display = 'none';
        return;
    }
    
    const rank = userIndex + 1;
    const user = leaderboardState.filteredUsers[userIndex];
    
    document.getElementById('yourRank').innerHTML = `
        <span>Your Rank: <strong>#${rank}</strong></span>
        <span>Score: <strong>${user.score}</strong> | Exams: <strong>${user.exams}</strong> | Badges: <strong>${user.badges}</strong></span>
    `;
}

function switchLeaderboard(view) {
    leaderboardState.currentView = view;
    
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderLeaderboard();
}

function searchLeaderboard() {
    leaderboardState.searchTerm = document.getElementById('searchUser').value.toLowerCase();
    renderLeaderboard();
}

window.switchLeaderboard = switchLeaderboard;
window.searchLeaderboard = searchLeaderboard;