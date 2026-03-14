// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

// Leaderboard state
let leaderboardState = {
    currentUser: null,
    allUsers: [],
    filteredUsers: [],
    currentView: 'overall',
    searchTerm: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadLeaderboardData();
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

// Load real leaderboard data from API
async function loadLeaderboardData() {
    try {
        // Show loading state
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
        
        // Use real data from API only
        if (data.users && data.users.length > 0) {
            leaderboardState.allUsers = data.users;
        } else {
            leaderboardState.allUsers = [];
        }
        
        leaderboardState.filteredUsers = [...leaderboardState.allUsers];
        renderLeaderboard();
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        
        // ❌ NO MOCK DATA - show empty state
        leaderboardState.allUsers = [];
        leaderboardState.filteredUsers = [];
        renderLeaderboard();
        
        // Show empty state message
        document.getElementById('leaderboardRows').innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <p style="font-size: 3rem; margin-bottom: 20px;">📊</p>
                <h3>No leaderboard data yet</h3>
                <p style="color: #999; margin-top: 10px;">Complete exams to appear on the leaderboard!</p>
                <button onclick="loadLeaderboardData()" style="margin-top: 20px; padding: 10px 30px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Try Again
                </button>
            </div>
        `;
        
        // Hide podium and your rank
        document.getElementById('podium').innerHTML = '';
        document.getElementById('yourRank').style.display = 'none';
    }
}

// Render complete leaderboard
function renderLeaderboard() {
    renderPodium();
    renderRows();
    renderYourRank();
}

// Render top 3 users on podium
function renderPodium() {
    const podium = document.getElementById('podium');
    
    if (leaderboardState.filteredUsers.length < 3) {
        podium.innerHTML = '';
        return;
    }
    
    const top3 = leaderboardState.filteredUsers
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    
    podium.innerHTML = `
        <div class="podium-item second">
            <div class="rank-badge">2</div>
            <div class="podium-name">${top3[1].name}</div>
            <div class="podium-score">${top3[1].score}</div>
            <div class="podium-stats">${top3[1].exams || 0} exams</div>
        </div>
        <div class="podium-item first">
            <div class="rank-badge">🏆 1</div>
            <div class="podium-name">${top3[0].name}</div>
            <div class="podium-score">${top3[0].score}</div>
            <div class="podium-stats">${top3[0].exams || 0} exams</div>
        </div>
        <div class="podium-item third">
            <div class="rank-badge">3</div>
            <div class="podium-name">${top3[2].name}</div>
            <div class="podium-score">${top3[2].score}</div>
            <div class="podium-stats">${top3[2].exams || 0} exams</div>
        </div>
    `;
}

// Render leaderboard table rows
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
    
    // Apply search filter
    if (leaderboardState.searchTerm) {
        filtered = filtered.filter(user => 
            user.name.toLowerCase().includes(leaderboardState.searchTerm.toLowerCase())
        );
    }
    
    // Sort based on current view
    switch(leaderboardState.currentView) {
        case 'weekly':
            filtered.sort((a, b) => (b.weeklyScore || 0) - (a.weeklyScore || 0));
            break;
        case 'monthly':
            filtered.sort((a, b) => (b.monthlyScore || 0) - (a.monthlyScore || 0));
            break;
        case 'streak':
            filtered.sort((a, b) => (b.streak || 0) - (a.streak || 0));
            break;
        default: // overall
            filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    
    rowsContainer.innerHTML = filtered.slice(0, 50).map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.name === leaderboardState.currentUser?.full_name;
        const score = getScoreForView(user);
        
        return `
            <div class="table-row ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank ${getRankClass(rank)}">#${rank}</div>
                <div class="user-info">
                    <div class="user-avatar">${user.avatar || user.name.charAt(0)}</div>
                    <span class="user-name">${user.name}</span>
                </div>
                <div class="score-value">${score}</div>
                <div>${user.exams || 0}</div>
                <div class="badge-icon">${getBadgeDisplay(user.badges || 0)}</div>
            </div>
        `;
    }).join('');
}

// Get score based on current view
function getScoreForView(user) {
    switch(leaderboardState.currentView) {
        case 'weekly':
            return user.weeklyScore || 0;
        case 'monthly':
            return user.monthlyScore || 0;
        case 'streak':
            return (user.streak || 0) + ' days';
        default:
            return user.score || 0;
    }
}

// Get rank CSS class
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

// Get badge display with emojis
function getBadgeDisplay(count) {
    if (!count) return '0';
    const emojiCount = Math.min(count, 3);
    return '🏆'.repeat(emojiCount) + ' ' + count;
}

// Render current user's rank
function renderYourRank() {
    const yourRankDiv = document.getElementById('yourRank');
    
    if (!leaderboardState.currentUser || leaderboardState.filteredUsers.length === 0) {
        yourRankDiv.style.display = 'none';
        return;
    }
    
    const sorted = [...leaderboardState.filteredUsers].sort((a, b) => (b.score || 0) - (a.score || 0));
    const userIndex = sorted.findIndex(u => u.name === leaderboardState.currentUser.full_name);
    
    if (userIndex === -1) {
        yourRankDiv.style.display = 'none';
        return;
    }
    
    const rank = userIndex + 1;
    const user = sorted[userIndex];
    
    yourRankDiv.innerHTML = `
        <span>Your Rank: <strong>#${rank}</strong></span>
        <span>Score: <strong>${user.score || 0}</strong> | Exams: <strong>${user.exams || 0}</strong> | Badges: <strong>${user.badges || 0}</strong></span>
    `;
    yourRankDiv.style.display = 'flex';
}

// Switch leaderboard view
function switchLeaderboard(view) {
    leaderboardState.currentView = view;
    
    // Update active tab
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderLeaderboard();
}

// Search leaderboard
function searchLeaderboard() {
    leaderboardState.searchTerm = document.getElementById('searchUser').value.toLowerCase();
    renderLeaderboard();
}

// Refresh leaderboard (for retry button)
function refreshLeaderboard() {
    loadLeaderboardData();
}

// Make functions global
window.switchLeaderboard = switchLeaderboard;
window.searchLeaderboard = searchLeaderboard;
window.refreshLeaderboard = refreshLeaderboard;