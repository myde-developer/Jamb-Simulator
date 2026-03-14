// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let leaderboardState = {
    currentUser: null,
    allUsers: [],
    filteredUsers: [],
    currentView: 'global',
    searchTerm: ''
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadLeaderboardData('global');
    setupEventListeners();
    if (window.studyStreak) studyStreak.init();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }
    leaderboardState.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
}

function setupEventListeners() {
    document.getElementById('searchUser')?.addEventListener('keyup', searchLeaderboard);
}

async function loadLeaderboardData(view = 'global') {
    try {
        showLoading();
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/leaderboard/${view}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load leaderboard');
        
        const users = await response.json();
        
        leaderboardState.allUsers = users.map((user, index) => ({
            id: user.id,
            name: user.name,
            avatar: user.name.charAt(0).toUpperCase(),
            score: user.avg_score || 0,
            exams: user.exams_taken || 0,
            streak: user.current_streak || 0,
            badges: Math.floor(user.total_correct / 100) || 0, // 1 badge per 100 correct answers
            weeklyScore: user.weekly_correct || 0,
            monthlyScore: user.monthly_correct || 0,
            rank: index + 1
        }));
        
        leaderboardState.filteredUsers = [...leaderboardState.allUsers];
        renderLeaderboard();
        
        // Load current user's rank
        loadUserRank();
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError('Failed to load leaderboard. Please try again.');
    }
}

function showLoading() {
    document.getElementById('leaderboardRows').innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 20px;">Loading leaderboard...</p>
        </div>
    `;
}

function showError(message) {
    document.getElementById('leaderboardRows').innerHTML = `
        <div style="text-align: center; padding: 50px; color: #e74c3c;">
            <p style="font-size: 3rem; margin-bottom: 20px;">📊</p>
            <h3>${message}</h3>
            <button onclick="loadLeaderboardData('${leaderboardState.currentView}')" 
                    style="margin-top: 20px; padding: 10px 30px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🔄 Try Again
            </button>
        </div>
    `;
}

async function loadUserRank() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/leaderboard/rank/${leaderboardState.currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load rank');
        
        const data = await response.json();
        
        document.getElementById('yourRank').innerHTML = `
            <span>Your Rank: <strong>#${data.rank || 'N/A'}</strong></span>
            <span>Average Score: <strong>${data.avg_score || 0}</strong></span>
        `;
        document.getElementById('yourRank').style.display = 'flex';
        
    } catch (error) {
        console.error('Error loading rank:', error);
        document.getElementById('yourRank').style.display = 'none';
    }
}

function renderLeaderboard() {
    renderPodium();
    renderRows();
}

function renderPodium() {
    const podium = document.getElementById('podium');
    
    if (leaderboardState.filteredUsers.length < 3) {
        podium.innerHTML = '';
        return;
    }
    
    const top3 = leaderboardState.filteredUsers.slice(0, 3);
    
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
    const rowsContainer = document.getElementById('leaderboardRows');
    
    if (leaderboardState.filteredUsers.length === 0) {
        rowsContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <p style="font-size: 3rem; margin-bottom: 20px;">📊</p>
                <h3>No leaderboard data yet</h3>
                <p style="color: #666; margin-top: 10px;">Complete exams to appear on the leaderboard!</p>
            </div>
        `;
        return;
    }
    
    let filtered = [...leaderboardState.filteredUsers];
    
    if (leaderboardState.searchTerm) {
        filtered = filtered.filter(user => 
            user.name.toLowerCase().includes(leaderboardState.searchTerm.toLowerCase())
        );
    }
    
    rowsContainer.innerHTML = filtered.map((user, index) => {
        const isCurrentUser = user.name === leaderboardState.currentUser?.full_name;
        const rank = index + 1;
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
                <div class="badge-icon">${getBadgeDisplay(user.badges)}</div>
            </div>
        `;
    }).join('');
}

function getScoreForView(user) {
    switch(leaderboardState.currentView) {
        case 'weekly':
            return user.weeklyScore;
        case 'monthly':
            return user.monthlyScore;
        case 'streak':
            return user.streak + ' days';
        default:
            return user.score;
    }
}

function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

function getBadgeDisplay(count) {
    if (!count) return '0';
    const emojiCount = Math.min(count, 3);
    return '🏆'.repeat(emojiCount) + ' ' + count;
}

async function switchLeaderboard(view) {
    leaderboardState.currentView = view;
    
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    await loadLeaderboardData(view);
}

function searchLeaderboard() {
    leaderboardState.searchTerm = document.getElementById('searchUser').value.toLowerCase();
    renderRows();
}

// Make functions global
window.switchLeaderboard = switchLeaderboard;
window.searchLeaderboard = searchLeaderboard;