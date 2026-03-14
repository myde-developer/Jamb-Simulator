const MotivationalMessages = {
    messages: {
        excellent: [
            { quote: "🌟 Excellent work! You're on fire!", message: "Your dedication is paying off. Keep this momentum going!", emoji: "🏆" },
            { quote: "🎯 Outstanding performance!", message: "You're mastering these concepts. JAMB success is within reach!", emoji: "👑" },
            { quote: "🚀 You're soaring high!", message: "This is champion-level performance. Nothing can stop you now!", emoji: "⭐" }
        ],
        
        good: [
            { quote: "👍 Good job! Keep pushing!", message: "You're making solid progress. A little more practice and you'll be excellent!", emoji: "💪" },
            { quote: "📈 You're improving!", message: "Every question you answer brings you closer to your goal.", emoji: "📊" },
            { quote: "🌱 Growing stronger!", message: "Rome wasn't built in a day. Keep learning, keep growing.", emoji: "🌿" }
        ],
        
        average: [
            { quote: "🌅 Every master was once a beginner", message: "Don't be discouraged. Every question you answer is a step forward.", emoji: "🌄" },
            { quote: "🔄 Keep going, keep growing", message: "Success is the sum of small efforts, repeated day in and day out.", emoji: "🔄" },
            { quote: "💪 You've got this!", message: "Challenges are what make us stronger. Keep pushing!", emoji: "💪" }
        ],
        
        needsWork: [
            { quote: "🌱 Every expert was once a beginner", message: "Don't give up! The path to success is paved with challenges.", emoji: "🌱" },
            { quote: "💫 This is just the beginning", message: "Use this as motivation to study harder. You can do this!", emoji: "💫" },
            { quote: "🎯 Focus on progress, not perfection", message: "Small steps every day lead to big results.", emoji: "🎯" }
        ],
        
        fromLekkiHeadmaster: [
            { quote: "🏫 Like Mr. Bepo, never give up on your dreams", message: "In 'The Lekki Headmaster', Bepo showed that persistence pays off. Keep going!", emoji: "📚" },
            { quote: "🇳🇬 Stay and make a difference", message: "Just as Bepo chose to stay and transform his school, choose to stay and transform your future.", emoji: "🏆" },
            { quote: "💪 True strength is choosing to fight", message: "Bepo faced many challenges but never wavered. Neither will you!", emoji: "⚔️" }
        ]
    },

    getMessage(score, total, includeLekki = true) {
        const percentage = (score / total) * 100;
        let category;
        
        if (percentage >= 80) category = 'excellent';
        else if (percentage >= 65) category = 'good';
        else if (percentage >= 50) category = 'average';
        else category = 'needsWork';
        
        if (includeLekki && Math.random() < 0.3) {
            const lekkiMessages = this.messages.fromLekkiHeadmaster;
            return lekkiMessages[Math.floor(Math.random() * lekkiMessages.length)];
        }
        
        const categoryMessages = this.messages[category];
        return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
    },

    getDailyMotivation() {
        const today = new Date().toDateString();
        const lastMessage = localStorage.getItem('lastDailyMessage');
        
        if (lastMessage && lastMessage.includes(today)) {
            return JSON.parse(localStorage.getItem('dailyMessage'));
        }
        
        const allMessages = [
            ...this.messages.excellent,
            ...this.messages.good,
            ...this.messages.average,
            ...this.messages.needsWork,
            ...this.messages.fromLekkiHeadmaster
        ];
        
        const message = allMessages[Math.floor(Math.random() * allMessages.length)];
        
        localStorage.setItem('lastDailyMessage', today);
        localStorage.setItem('dailyMessage', JSON.stringify(message));
        
        return message;
    },

    getStreakMessage(streak) {
        if (streak >= 30) {
            return { quote: "👑 30 DAYS! You're unstoppable!", message: "A month of dedication shows incredible commitment. Keep shining!", emoji: "👑" };
        } else if (streak >= 14) {
            return { quote: "🔥 Two weeks of excellence!", message: "Your consistency is building a powerful habit. Amazing work!", emoji: "🔥" };
        } else if (streak >= 7) {
            return { quote: "🌟 One week strong!", message: "You've built a great habit. Keep the momentum going!", emoji: "🌟" };
        }
        return null;
    },

    getEncouragement() {
        const encouragements = [
            { quote: "💪 Mistakes are proof you're trying", message: "Every wrong answer brings you closer to the right one.", emoji: "💪" },
            { quote: "🎯 Focus on the next question", message: "Don't dwell on mistakes. Learn and move forward.", emoji: "🎯" },
            { quote: "🌱 Growing through challenges", message: "This is where real learning happens.", emoji: "🌱" },
            { quote: "📚 Review and retry", message: "Understanding your mistakes is key to improvement.", emoji: "📚" }
        ];
        
        return encouragements[Math.floor(Math.random() * encouragements.length)];
    }
};

window.MotivationalMessages = MotivationalMessages;