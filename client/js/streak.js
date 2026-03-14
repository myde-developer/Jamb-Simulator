class StudyStreak {
    constructor() {
        this.streakKey = 'studyStreak';
        this.lastActiveKey = 'lastActiveDate';
        this.totalDaysKey = 'totalStudyDays';
    }

    init() {
        const streak = this.getStreak();
        this.updateDisplay(streak);
        this.checkAndUpdateStreak();
    }

    getStreak() {
        const streak = localStorage.getItem(this.streakKey);
        return streak ? parseInt(streak) : 0;
    }

    getLastActive() {
        return localStorage.getItem(this.lastActiveKey);
    }

    getTotalDays() {
        const total = localStorage.getItem(this.totalDaysKey);
        return total ? parseInt(total) : 0;
    }

    checkAndUpdateStreak() {
        const today = new Date().toDateString();
        const lastActive = this.getLastActive();
        
        if (!lastActive) {
            this.startNewStreak(today);
            return;
        }

        const lastDate = new Date(lastActive);
        const currentDate = new Date(today);
        const timeDiff = currentDate - lastDate;
        const dayDiff = timeDiff / (1000 * 3600 * 24);

        if (dayDiff === 1) {
            this.incrementStreak(today);
        } else if (dayDiff > 1) {
            this.resetStreak(today);
        }
    }

    startNewStreak(today) {
        localStorage.setItem(this.streakKey, '1');
        localStorage.setItem(this.lastActiveKey, today);
        this.incrementTotalDays();
        this.showStreakNotification('🎉 You started your study streak!');
    }

    incrementStreak(today) {
        const newStreak = this.getStreak() + 1;
        localStorage.setItem(this.streakKey, newStreak.toString());
        localStorage.setItem(this.lastActiveKey, today);
        this.incrementTotalDays();
        this.checkMilestones(newStreak);
    }

    resetStreak(today) {
        const oldStreak = this.getStreak();
        localStorage.setItem(this.streakKey, '1');
        localStorage.setItem(this.lastActiveKey, today);
        this.incrementTotalDays();
        
        if (oldStreak > 1) {
            this.showStreakNotification(`😢 Streak reset! You had a ${oldStreak}-day streak. Start a new one!`);
        }
    }

    incrementTotalDays() {
        const total = this.getTotalDays() + 1;
        localStorage.setItem(this.totalDaysKey, total.toString());
    }

    checkMilestones(streak) {
        const milestones = [7, 30, 50, 100];
        
        if (milestones.includes(streak)) {
            let message = '';
            let emoji = '';
            
            switch(streak) {
                case 7:
                    message = '🌟 One week streak! You\'re on fire!';
                    emoji = '🔥';
                    break;
                case 30:
                    message = '🎯 30 days! You\'re a dedicated scholar!';
                    emoji = '📚';
                    break;
                case 50:
                    message = '🏆 50 days! Halfway to a century!';
                    emoji = '💪';
                    break;
                case 100:
                    message = '👑 100 DAYS! You\'re a JAMB champion!';
                    emoji = '👑';
                    break;
            }
            
            this.showStreakNotification(`${emoji} ${message}`);
            this.unlockAchievement(streak);
        }
    }

    unlockAchievement(days) {
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        
        const newAchievement = {
            id: `streak_${days}`,
            name: `${days} Day Streak`,
            description: `Studied for ${days} consecutive days!`,
            icon: this.getStreakIcon(days),
            unlockedAt: new Date().toISOString()
        };
        
        achievements.push(newAchievement);
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }

    getStreakIcon(days) {
        if (days >= 100) return '👑';
        if (days >= 50) return '🏆';
        if (days >= 30) return '🎯';
        if (days >= 7) return '🔥';
        return '⭐';
    }

    showStreakNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'streak-notification';
        notification.innerHTML = `<div class="streak-notification-content">${message}</div>`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateDisplay(streak) {
        const streakElements = document.querySelectorAll('.streak-display');
        streakElements.forEach(el => {
            el.innerHTML = this.getStreakHTML(streak);
        });
    }

    getStreakHTML(streak) {
        const icon = this.getStreakIcon(streak);
        return `
            <div class="streak-counter">
                <span class="streak-icon">${icon}</span>
                <span class="streak-number">${streak}</span>
                <span class="streak-label">day streak</span>
            </div>
        `;
    }

    getStreakData() {
        return {
            currentStreak: this.getStreak(),
            totalDays: this.getTotalDays(),
            lastActive: this.getLastActive(),
            icon: this.getStreakIcon(this.getStreak())
        };
    }
}

const studyStreak = new StudyStreak();
window.studyStreak = studyStreak;