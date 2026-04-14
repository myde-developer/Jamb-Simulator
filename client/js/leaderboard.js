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

async function loadLeaderboard(type) {
    currentLeaderboardType = type;
    
    // Update active tab
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Show loading state
    const leaderboardRows = document.getElementById('leaderboardRows');
    if (leaderboardRows) {
        leaderboardRows.innerHTML = '<div style="text-align: center; padding: 40px;">Loading leaderboard...</div>';
    }
    
    try {
        const token = localStorage.getItem('token');
        let url = `${API_BASE}/api/leaderboard/${type}`;
        
        const response = await fetch(url, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
            throw new Error('Failed to load leaderboard');
        }
        
        const data = await response.json();
        
        if (data.success && data.leaderboard) {
            leaderboardData = data.leaderboard;
            renderLeaderboard(leaderboardData, type);
        } else {
            throw new Error('Invalid data format');
        }
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError();
    }
}

function renderLeaderboard(data, type) {
    const leaderboardRows = document.getElementById('leaderboardRows');
    const podium = document.getElementById('podium');
    
    if (!leaderboardRows) return;
    
    if (!data || data.length === 0) {
        leaderboardRows.innerHTML = '<div style="text-align: center; padding: 40px;">No data available. Complete an exam to appear on the leaderboard!</div>';
        return;
    }
    
    // Render podium (top 3)
    if (podium && type !== 'streak') {
        const top3 = data.slice(0, 3);
        podium.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: flex-end; gap: 20px; margin: 30px 0; flex-wrap: wrap;">
                ${top3[1] ? `
                <div style="text-align: center; width: 120px;">
                    <div style="background: #bdc3c7; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <span style="font-size: 2rem;">🥈</span>
                    </div>
                    <div style="margin-top: 10px; font-weight: 600;">${escapeHtml(top3[1].name)}</div>
                    <div style="color: #e67e22; font-size: 0.875rem;">${top3[1].score || 0} pts</div>
                </div>
                ` : '<div style="width: 120px;"></div>'}
                
                ${top3[0] ? `
                <div style="text-align: center; width: 140px;">
                    <div style="background: #f1c40f; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <span style="font-size: 3rem;">🥇</span>
                    </div>
                    <div style="margin-top: 10px; font-weight: 600;">${escapeHtml(top3[0].name)}</div>
                    <div style="color: #f1c40f; font-size: 0.875rem;">${top3[0].score || 0} pts</div>
                </div>
                ` : ''}
                
                ${top3[2] ? `
                <div style="text-align: center; width: 120px;">
                    <div style="background: #e67e22; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <span style="font-size: 2rem;">🥉</span>
                    </div>
                    <div style="margin-top: 10px; font-weight: 600;">${escapeHtml(top3[2].name)}</div>
                    <div style="color: #e67e22; font-size: 0.875rem;">${top3[2].score || 0} pts</div>
                </div>
                ` : '<div style="width: 120px;"></div>'}
            </div>
        `;
    } else if (podium) {
        podium.innerHTML = '';
    }
    
    // Render table rows
    let html = '<div class="table-header" style="display: grid; grid-template-columns: 80px 1fr 100px 80px 80px; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; font-weight: 600;">';
    if (type === 'streak') {
        html += '<div>Rank</div><div>User</div><div>Streak</div><div></div><div></div>';
    } else {
        html += '<div>Rank</div><div>User</div><div>Score</div><div>Exams</div><div></div>';
    }
    html += '</div>';
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    data.forEach(user => {
        const isCurrentUser = user.user_id === currentUser.id;
        const rowClass = isCurrentUser ? 'background: #fff3e0; border-left: 4px solid #e74c3c;' : '';
        
        if (type === 'streak') {
            html += `
                <div style="display: grid; grid-template-columns: 80px 1fr 100px 80px 80px; padding: 12px; border-bottom: 1px solid #e1e5eb; ${rowClass}">
                    <div style="font-weight: 600;">#${user.rank}</div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; background: #1a1a2e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">${escapeHtml(user.avatar)}</div>
                        <div>${escapeHtml(user.name)}</div>
                    </div>
                    <div>🔥 ${user.streak} days</div>
                    <div>-</div>
                    <div>🏆</div>
                </div>
            `;
        } else {
            html += `
                <div style="display: grid; grid-template-columns: 80px 1fr 100px 80px 80px; padding: 12px; border-bottom: 1px solid #e1e5eb; ${rowClass}">
                    <div style="font-weight: 600;">#${user.rank}</div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; background: #1a1a2e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">${escapeHtml(user.avatar)}</div>
                        <div>${escapeHtml(user.name)}</div>
                    </div>
                    <div style="font-weight: 600; color: #2d6a4f;">${user.score || 0}</div>
                    <div>${user.exams_taken || 0}</div>
                    <div>🏆</div>
                </div>
            `;
        }
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
                <div style="background: #1a1a2e; color: white; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <span>Your Rank</span>
                    <span style="font-weight: 700; font-size: 1.25rem;">#${data.rank}</span>
                    <span>Score: ${data.score} points</span>
                </div>
            `;
        } else if (yourRankDiv) {
            yourRankDiv.innerHTML = `
                <div style="background: #f0f0f5; padding: 15px; border-radius: 12px; text-align: center;">
                    Complete an exam to see your rank!
                </div>
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
    renderLeaderboard(filteredData, currentLeaderboardType);
}

function switchLeaderboard(type) {
    currentLeaderboardType = type;
    loadLeaderboard(type);
}

function showError() {
    const leaderboardRows = document.getElementById('leaderboardRows');
    if (leaderboardRows) {
        leaderboardRows.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: #e74c3c; margin-bottom: 20px;">Failed to load leaderboard. Please try again.</p>
                <button onclick="loadLeaderboard('${currentLeaderboardType}')" style="padding: 10px 20px; background: #1a1a2e; color: white; border: none; border-radius: 8px; cursor: pointer;">Try Again</button>
            </div>
        `;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

window.switchLeaderboard = switchLeaderboard;
window.searchLeaderboard = searchLeaderboard;
window.loadLeaderboard = loadLeaderboard;