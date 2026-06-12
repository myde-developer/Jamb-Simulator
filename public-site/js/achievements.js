// Achievement definitions
const ACHIEVEMENTS = [
    {
        id: 'streak_7',
        name: '🔥 Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        category: 'streak',
        points: 50,
        condition: (stats) => stats.maxStreak >= 7
    },
    {
        id: 'streak_30',
        name: '⚡ Dedicated Scholar',
        description: 'Achieve a 30-day study streak',
        icon: '⚡',
        category: 'streak',
        points: 200,
        condition: (stats) => stats.maxStreak >= 30
    },
    {
        id: 'streak_100',
        name: '👑 Legendary Streak',
        description: 'Maintain a 100-day study streak',
        icon: '👑',
        category: 'streak',
        points: 500,
        condition: (stats) => stats.maxStreak >= 100
    },
    {
        id: 'practice_100',
        name: '🎯 Practice Makes Perfect',
        description: 'Complete 100 practice questions',
        icon: '🎯',
        category: 'practice',
        points: 50,
        condition: (stats) => stats.totalQuestions >= 100
    },
    {
        id: 'practice_1000',
        name: '📚 Knowledge Seeker',
        description: 'Complete 1,000 practice questions',
        icon: '📚',
        category: 'practice',
        points: 200,
        condition: (stats) => stats.totalQuestions >= 1000
    },
    {
        id: 'exam_first',
        name: '📝 First Steps',
        description: 'Complete your first mock exam',
        icon: '📝',
        category: 'exams',
        points: 30,
        condition: (stats) => stats.totalExams >= 1
    },
    {
        id: 'exam_10',
        name: '🎓 Exam Veteran',
        description: 'Complete 10 mock exams',
        icon: '🎓',
        category: 'exams',
        points: 100,
        condition: (stats) => stats.totalExams >= 10
    },
    {
        id: 'perfect_english',
        name: '📖 English Expert',
        description: 'Score 100% in an English exam',
        icon: '📖',
        category: 'mastery',
        points: 150,
        condition: (stats) => stats.perfectScores?.english || false
    },
    {
        id: 'perfect_math',
        name: '🧮 Math Genius',
        description: 'Score 100% in a Mathematics exam',
        icon: '🧮',
        category: 'mastery',
        points: 150,
        condition: (stats) => stats.perfectScores?.math || false
    },
    {
        id: 'flashcard_100',
        name: '📇 Flashcard Novice',
        description: 'Create 100 flashcards',
        icon: '📇',
        category: 'mastery',
        points: 50,
        condition: (stats) => stats.flashcards >= 100
    }
];
function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

class AchievementManager {
    constructor() {
        this.achievements = ACHIEVEMENTS;
        this.unlocked = this.loadUnlocked();
        this.stats = this.loadStats();
    }

    loadUnlocked() {
        return JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('achievementStats') || JSON.stringify({
            maxStreak: 0,
            totalQuestions: 0,
            totalExams: 0,
            highestScore: 0,
            perfectScores: {},
            flashcards: 0
        }));
    }

    saveStats() {
        localStorage.setItem('achievementStats', JSON.stringify(this.stats));
    }

    checkAllAchievements() {
        const newlyUnlocked = [];
        
        this.achievements.forEach(achievement => {
            if (!this.isUnlocked(achievement.id) && achievement.condition(this.stats)) {
                this.unlockAchievement(achievement);
                newlyUnlocked.push(achievement);
            }
        });
        
        return newlyUnlocked;
    }

    unlockAchievement(achievement) {
        if (this.isUnlocked(achievement.id)) return;
        
        this.unlocked.push({
            id: achievement.id,
            unlockedAt: new Date().toISOString()
        });
        
        localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlocked));
        this.showUnlockNotification(achievement);
        this.addToRecent(achievement);
    }

    isUnlocked(achievementId) {
        return this.unlocked.some(u => u.id === achievementId);
    }

    getUnlockDate(achievementId) {
        const unlock = this.unlocked.find(u => u.id === achievementId);
        return unlock ? unlock.unlockedAt : null;
    }

    showUnlockNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-icon">${achievement.icon}</div>
            <div class="achievement-notification-content">
                <div class="achievement-notification-title">Achievement Unlocked! 🎉</div>
                <div class="achievement-notification-name">${achievement.name}</div>
                <div class="achievement-notification-desc">${achievement.description}</div>
                <div class="achievement-notification-points">+${achievement.points} points</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    addToRecent(achievement) {
        const recent = JSON.parse(localStorage.getItem('recentUnlocks') || '[]');
        recent.unshift({
            ...achievement,
            unlockedAt: new Date().toISOString()
        });
        
        if (recent.length > 10) recent.pop();
        localStorage.setItem('recentUnlocks', JSON.stringify(recent));
    }

    getProgress(achievement) {
        if (achievement.id.startsWith('streak')) {
            const target = parseInt(achievement.id.split('_')[1]);
            return Math.min(100, (this.stats.maxStreak / target) * 100);
        }
        if (achievement.id.startsWith('practice')) {
            const target = parseInt(achievement.id.split('_')[1]);
            return Math.min(100, (this.stats.totalQuestions / target) * 100);
        }
        if (achievement.id.startsWith('exam')) {
            const target = achievement.id === 'exam_first' ? 1 : 
                          achievement.id === 'exam_10' ? 10 : 100;
            return Math.min(100, (this.stats.totalExams / target) * 100);
        }
        return 100;
    }

    getTotalPoints() {
        return this.unlocked.reduce((sum, u) => {
            const achievement = this.achievements.find(a => a.id === u.id);
            return sum + (achievement ? achievement.points : 0);
        }, 0);
    }

    updateStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
        this.saveStats();
        return this.checkAllAchievements();
    }
}

const achievementManager = new AchievementManager();

document.addEventListener('DOMContentLoaded', () => {
    loadAchievements();
    loadRecentUnlocks();
    updateStats();
    if (window.studyStreak) studyStreak.init();

 document.getElementById('logoutBtn').addEventListener('click', logout);
});

function loadAchievements(category = 'all') {
    const grid = document.getElementById('achievementsGrid');
    const filtered = category === 'all' 
        ? achievementManager.achievements 
        : achievementManager.achievements.filter(a => a.category === category);
    
    grid.innerHTML = filtered.map(achievement => {
        const isUnlocked = achievementManager.isUnlocked(achievement.id);
        const unlockDate = achievementManager.getUnlockDate(achievement.id);
        const progress = achievementManager.getProgress(achievement);
        
        return `
            <div class="achievement-card ${isUnlocked ? '' : 'locked'}">
                <div class="achievement-badge">${isUnlocked ? '✅' : '🔒'}</div>
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                
                ${!isUnlocked ? `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${Math.round(progress)}% complete</div>
                    </div>
                ` : ''}
                
                ${unlockDate ? `
                    <div class="unlocked-date">
                        Unlocked: ${new Date(unlockDate).toLocaleDateString()}
                    </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 10px; color: #f39c12;">
                    +${achievement.points} pts
                </div>
            </div>
        `;
    }).join('');
}

function loadRecentUnlocks() {
    const recent = JSON.parse(localStorage.getItem('recentUnlocks') || '[]');
    const container = document.getElementById('recentUnlocks');
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No achievements unlocked yet. Keep studying!</p>';
        return;
    }
    
    container.innerHTML = recent.map(item => `
        <div class="unlock-item">
            <div class="unlock-icon">${item.icon}</div>
            <div class="unlock-info">
                <div class="unlock-name">${item.name}</div>
                <div class="unlock-time">${new Date(item.unlockedAt).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalAchievements').textContent = achievementManager.achievements.length;
    document.getElementById('unlockedCount').textContent = achievementManager.unlocked.length;
    document.getElementById('pointsEarned').textContent = achievementManager.getTotalPoints();
}

function filterAchievements(category) {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    loadAchievements(category);
}

function updatePracticeStats(correct, total) {
    const stats = achievementManager.stats;
    stats.totalQuestions += total;
    
    const currentStreak = parseInt(localStorage.getItem('studyStreak') || '0');
    stats.maxStreak = Math.max(stats.maxStreak, currentStreak);
    
    achievementManager.updateStats(stats);
}

function updateExamStats(score, subjectScores) {
    const stats = achievementManager.stats;
    stats.totalExams++;
    stats.highestScore = Math.max(stats.highestScore, score);
    
    Object.entries(subjectScores).forEach(([subject, data]) => {
        if (data.correct === data.total) {
            const subjectKey = subject.toLowerCase().replace('use of ', '');
            if (subjectKey.includes('english')) stats.perfectScores.english = true;
            if (subjectKey.includes('math')) stats.perfectScores.math = true;
        }
    });
    
    achievementManager.updateStats(stats);
}

function updateShareStats() {
    const stats = achievementManager.stats;
    stats.shares = (stats.shares || 0) + 1;
    achievementManager.updateStats(stats);
}

function updateFlashcardStats(count) {
    const stats = achievementManager.stats;
    stats.flashcards = (stats.flashcards || 0) + count;
    achievementManager.updateStats(stats);
}

window.filterAchievements = filterAchievements;
window.updatePracticeStats = updatePracticeStats;
window.updateExamStats = updateExamStats;
window.updateShareStats = updateShareStats;
window.updateFlashcardStats = updateFlashcardStats;