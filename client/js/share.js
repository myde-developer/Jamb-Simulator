const ShareManager = {
    shareExamResults(examData) {
        const text = this.formatExamMessage(examData);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },
    
    sharePracticeResults(practiceData) {
        const text = this.formatPracticeMessage(practiceData);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },
    
    shareAchievement(achievement) {
        const text = this.formatAchievementMessage(achievement);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },
    
    shareStreak(streakData) {
        const text = this.formatStreakMessage(streakData);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },

    formatExamMessage(examData) {
        const { scores, subjects, date } = examData;
        const totalScore = scores.total || 0;
        const percentage = scores.percentage || 0;
        
        let message = `📚 *JAMB UTME Mock Exam Results*\n`;
        message += `📅 ${new Date(date).toLocaleDateString()}\n\n`;
        message += `🎯 *Total Score: ${totalScore}/400*\n`;
        message += `📊 *Percentage: ${percentage}%*\n\n`;
        message += `*Subject Breakdown:*\n`;
        
        subjects.forEach(subject => {
            const subjectData = scores.subjectScores[subject.name];
            if (subjectData) {
                const subjectScore = subject.name === 'Use of English' 
                    ? (subjectData.correct * 1.67).toFixed(2)
                    : (subjectData.correct * 2.5).toFixed(2);
                message += `📖 ${subject.name}: ${subjectData.correct}/${subjectData.total} (${subjectScore}/100)\n`;
            }
        });
        
        message += `\n🔥 *Study Streak: ${this.getStreak()} days*\n`;
        message += `\n💪 Practice with JAMB Simulator!\n`;
        message += `🔗 ${window.location.origin}`;
        
        return message;
    },

    formatPracticeMessage(practiceData) {
        const { correct, total, accuracy, subject, streak } = practiceData;
        
        let message = `🎯 *JAMB Practice Session Results*\n`;
        message += `📚 *Subject:* ${subject}\n`;
        message += `\n✅ *Correct: ${correct}/${total}*\n`;
        message += `📊 *Accuracy: ${accuracy}%*\n`;
        message += `🔥 *Streak: ${streak} days*\n\n`;
        
        message += `\nPractice with JAMB Simulator!\n`;
        message += `🔗 ${window.location.origin}`;
        
        return message;
    },

    formatAchievementMessage(achievement) {
        return `🏆 *Achievement Unlocked!*\n\n${achievement.emoji} *${achievement.name}*\n📝 ${achievement.description}\n\n🎉 Congratulations!\n🔗 ${window.location.origin}`;
    },

    formatStreakMessage(streakData) {
        const { currentStreak, longestStreak, totalDays } = streakData;
        
        return `🔥 *Study Streak Update*\n\n📅 *Current Streak: ${currentStreak} days*\n👑 *Longest Streak: ${longestStreak} days*\n📚 *Total Study Days: ${totalDays}*\n\n🔗 ${window.location.origin}`;
    },

    getStreak() {
        const streak = localStorage.getItem('studyStreak');
        return streak ? parseInt(streak) : 0;
    },

    copyResults(examData) {
        const text = this.formatExamMessage(examData);
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('✅ Results copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy. Please try again.');
        });
    },

    shareOnTwitter(examData) {
        const text = this.formatExamMessage(examData);
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    },

    shareCustomMessage(title, content) {
        const message = `*${title}*\n\n${content}\n\n🔗 ${window.location.origin}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
};

window.ShareManager = ShareManager;