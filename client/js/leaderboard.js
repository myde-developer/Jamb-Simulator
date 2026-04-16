// client/js/leaderboard.js
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let currentLeaderboardType = 'global';
let leaderboardData = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayUserInfo();
    loadLeaderboard('global');
    loadUserRank();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/auth.html';
}

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) userInfo.textContent = `Hi, ${user.full_name}`;
}

function logout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

async function loadLeaderboard(type, clickEvent) {
    currentLeaderboardType = type;
    
    // Update active tab - FIXED: handle missing event
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the tab with matching data-type
    const activeTab = document.querySelector(`.leaderboard-tab[data-type="${type}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    } else if (clickEvent && clickEvent.target) {
        clickEvent.target.classList.add('active');
    }
    
    // Show loading state
    const leaderboardRows = document.getElementById('leaderboardRows');
    const podiumContainer = document.getElementById('podiumContainer');
    
    if (leaderboardRows) {
        leaderboardRows.innerHTML = '<div class="loading-state">📊 Loading leaderboard...</div>';
    }
    if (podiumContainer) {
        podiumContainer.innerHTML = '';
    }
    
    try {
        const token = localStorage.getItem('token');
        let url = `${API_BASE}/api/leaderboard/${type}`;
        
        const response = await fetch(url, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load leaderboard: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.leaderboard) {
            leaderboardData = data.leaderboard;
            renderLeaderboard(leaderboardData);
        } else {
            throw new Error('Invalid data format');
        }
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError();
    }
}

function renderLeaderboard(data) {
    const leaderboardRows = document.getElementById('leaderboardRows');
    const podiumContainer = document.getElementById('podiumContainer');
    
    if (!leaderboardRows) return;
    
    if (!data || data.length === 0) {
        leaderboardRows.innerHTML = '<div class="loading-state">📭 No data available. Complete an exam to appear on the leaderboard!</div>';
        if (podiumContainer) podiumContainer.innerHTML = '';
        return;
    }
    
    // Render podium (top 3)
    if (podiumContainer) {
        const top3 = data.slice(0, 3);
        let podiumHtml = '<div class="podium">';
        
        // Second place (left)
        if (top3[1]) {
            podiumHtml += `
                <div class="podium-item second">
                    <div class="podium-avatar">🥈</div>
                    <div class="podium-name">${escapeHtml(top3[1].name)}</div>
                    <div class="podium-score">${top3[1].score || 0} pts</div>
                </div>
            `;
        } else {
            podiumHtml += `<div class="podium-item"></div>`;
        }
        
        // First place (center)
        if (top3[0]) {
            podiumHtml += `
                <div class="podium-item first">
                    <div class="podium-avatar">🥇</div>
                    <div class="podium-name">${escapeHtml(top3[0].name)}</div>
                    <div class="podium-score">${top3[0].score || 0} pts</div>
                </div>
            `;
        }
        
        // Third place (right)
        if (top3[2]) {
            podiumHtml += `
                <div class="podium-item third">
                    <div class="podium-avatar">🥉</div>
                    <div class="podium-name">${escapeHtml(top3[2].name)}</div>
                    <div class="podium-score">${top3[2].score || 0} pts</div>
                </div>
            `;
        } else {
            podiumHtml += `<div class="podium-item"></div>`;
        }
        
        podiumHtml += '</div>';
        podiumContainer.innerHTML = podiumHtml;
    }
    
    // Render table rows
    let html = '';
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    data.forEach(user => {
        const isCurrentUser = user.user_id === currentUser.id;
        const rankClass = user.rank === 1 ? 'rank-1' : (user.rank === 2 ? 'rank-2' : (user.rank === 3 ? 'rank-3' : ''));
        
        html += `
            <div class="table-row ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank ${rankClass}">#${user.rank}</div>
                <div class="user-name">
                    <div class="user-avatar">${escapeHtml(user.avatar)}</div>
                    <div>${escapeHtml(user.name)}</div>
                </div>
                <div class="score-value">${user.score || 0}</div>
                <div>${user.exams_taken || 0}</div>
                <div>🏆</div>
            </div>
        `;
    });
    
    leaderboardRows.innerHTML = html;
}

async function loadUserRank() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE}/api/leaderboard/my-rank`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load rank');
        
        const data = await response.json();
        const yourRankDiv = document.getElementById('yourRank');
        
        if (yourRankDiv && data.rank) {
            yourRankDiv.innerHTML = `
                <span class="your-rank-label">🏆 Your Global Rank</span>
                <span class="your-rank-value">#${data.rank}</span>
                <span>Score: ${data.score} points</span>
            `;
        } else if (yourRankDiv) {
            yourRankDiv.innerHTML = `
                <span>📝 Complete an exam to see your rank!</span>
            `;
        }
        
    } catch (error) {
        console.error('Error loading user rank:', error);
    }
}

function searchLeaderboard() {
    const searchTerm = document.getElementById('searchUser')?.value.toLowerCase() || '';
    const filteredData = leaderboardData.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );
    renderLeaderboard(filteredData);
}

function switchLeaderboard(type, event) {
    loadLeaderboard(type, event);
}

function showError() {
    const leaderboardRows = document.getElementById('leaderboardRows');
    const podiumContainer = document.getElementById('podiumContainer');
    
    if (podiumContainer) podiumContainer.innerHTML = '';
    
    if (leaderboardRows) {
        leaderboardRows.innerHTML = `
            <div class="error-state">
                <p>❌ Failed to load leaderboard. Please try again.</p>
                <button onclick="loadLeaderboard('${currentLeaderboardType}')">Try Again</button>
            </div>
        `;
    }
}

function escapeHtml(text) {
    if (!text) return '?';
    const str = String(text);
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Make functions globally available
window.switchLeaderboard = switchLeaderboard;
window.searchLeaderboard = searchLeaderboard;
window.loadLeaderboard = loadLeaderboard;