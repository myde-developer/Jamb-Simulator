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

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadResults();
    if (window.studyStreak) studyStreak.init();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!token) {
        logoutBtn.textContent = 'Login';
        logoutBtn.href = '/auth.html';
    } else {
        logoutBtn.addEventListener('click', logout);
    }
}

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth.html';
}

function loadResults() {
    const examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    
    if (!examResults) {
        window.location.href = '/home.html';
        return;
    }
    
    displayResults(examResults);
    window.reviewData = examResults;
    
    if (window.MotivationalMessages) {
        showMotivation();
    }
}

function displayResults(results) {
    displayHeader(results);
    displaySummaryCards(results);
    displaySubjectBreakdown(results);
}

function displayHeader(results) {
    const header = document.getElementById('resultsHeader');
    header.innerHTML = `
        <h1>JAMB UTME 2026 Mock Exam</h1>
        <p>${new Date(results.date).toLocaleDateString()}</p>
        
        <div class="score-circle">
            <div class="score-number">${results.scores.total}</div>
            <div class="score-total">/400</div>
        </div>
        
        <div class="score-percentage">
            ${results.scores.percentage}% Overall
        </div>
    `;
}

function displaySummaryCards(results) {
    const cards = document.getElementById('summaryCards');
    const totalQuestions = results.questions.length;
    const answeredCount = Object.keys(results.answers).length;
    const correctCount = Object.values(results.scores.subjectScores)
        .reduce((sum, s) => sum + s.correct, 0);
    
    cards.innerHTML = `
        <div class="summary-card">
            <h3>Total Questions</h3>
            <div class="summary-value">${totalQuestions}</div>
            <div>180 Total</div>
        </div>
        <div class="summary-card">
            <h3>Answered</h3>
            <div class="summary-value">${answeredCount}</div>
        </div>
        <div class="summary-card">
            <h3>Correct</h3>
            <div class="summary-value" style="color: #27ae60;">${correctCount}</div>
        </div>
        <div class="summary-card">
            <h3>JAMB Score</h3>
            <div class="summary-value">${results.scores.total}</div>
            <div>/400</div>
        </div>
    `;
}

function displaySubjectBreakdown(results) {
    const breakdown = document.getElementById('subjectBreakdown');
    const subjects = results.subjects;
    
    let html = '<h2>Performance by Subject</h2>';
    
    subjects.forEach(subject => {
        const subjectName = subject.name;
        const data = results.scores.subjectScores[subjectName] || { correct: 0, total: 0 };
        const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
        const jambScore = subjectName === 'Use of English' 
            ? (data.correct * 1.67).toFixed(2)
            : (data.correct * 2.5).toFixed(2);
        
        html += `
            <div class="subject-row">
                <div class="subject-name">
                    ${subjectName}
                    ${subjectName === 'Use of English' 
                        ? '<br><small>60 questions × 1.67 marks</small>' 
                        : '<br><small>40 questions × 2.5 marks</small>'}
                </div>
                <div class="subject-score-bar">
                    <div class="subject-score-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="subject-stats">
                    <strong>${data.correct}/${data.total}</strong> (${percentage.toFixed(1)}%)<br>
                    <span class="jamb-score">JAMB: ${jambScore}/100</span>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="subject-row" style="border-top: 2px solid #667eea; margin-top: 20px; padding-top: 20px;">
            <div class="subject-name" style="font-weight: bold;">TOTAL JAMB SCORE</div>
            <div class="subject-score-bar">
                <div class="subject-score-fill" style="width: ${results.scores.percentage}%"></div>
            </div>
            <div class="subject-stats">
                <strong style="font-size: 1.5rem; color: #667eea;">${results.scores.total}/400</strong>
            </div>
        </div>
    `;
    
    breakdown.innerHTML = html;
}

function showMotivation() {
    const examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    if (!examResults) return;
    
    const correct = Object.values(examResults.scores.subjectScores)
        .reduce((sum, s) => sum + s.correct, 0);
    const total = examResults.questions.length;
    
    const message = MotivationalMessages.getMessage(correct, total, true);
    
    if ((correct / total) * 100 >= 80) {
        createConfetti();
    }
    
    document.getElementById('motivationEmoji').textContent = message.emoji;
    document.getElementById('motivationQuote').textContent = message.quote;
    document.getElementById('motivationMessage').textContent = message.message;
    document.getElementById('motivationModal').style.display = 'flex';
    
    setTimeout(closeMotivation, 5000);
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

function closeMotivation() {
    document.getElementById('motivationModal').style.display = 'none';
}

function toggleReview() {
    const reviewSection = document.getElementById('reviewSection');
    const isHidden = reviewSection.style.display === 'none';
    
    reviewSection.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden && !reviewSection.hasLoaded) {
        loadReviewQuestions();
        reviewSection.hasLoaded = true;
    }
}

function loadReviewQuestions() {
    const data = window.reviewData;
    const container = document.getElementById('reviewQuestions');
    
    let html = '';
    
    data.questions.forEach((q, index) => {
        const userAnswer = data.answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        
        html += `
            <div class="review-question ${isCorrect ? 'correct' : 'incorrect'}" 
                 data-subject="${q.subject}" data-correct="${isCorrect}">
                
                <div class="review-header">
                    <span class="review-subject">${q.subject}</span>
                    <span class="review-status ${isCorrect ? 'status-correct' : 'status-incorrect'}">
                        ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                </div>
                
                <div class="review-question-text">
                    <strong>Question ${index + 1}:</strong> ${q.question}
                </div>
                
                <div class="review-options">
                    ${['A', 'B', 'C', 'D'].map(letter => {
                        const isUserChoice = userAnswer === letter;
                        const isCorrectChoice = q.correctAnswer === letter;
                        let optionClass = '';
                        
                        if (isCorrectChoice) optionClass = 'correct-answer';
                        else if (isUserChoice && !isCorrect) optionClass = 'wrong-answer';
                        
                        return `
                            <div class="review-option ${optionClass}">
                                <strong>${letter}:</strong> ${q.options[letter]}
                                ${isCorrectChoice ? ' ✓ (Correct Answer)' : ''}
                                ${isUserChoice && !isCorrectChoice ? ' (Your Answer)' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="explanation-box">
                    <h4>Explanation:</h4>
                    <p>${q.explanation || 'The correct answer is ' + q.correctAnswer + '.'}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterQuestions(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const questions = document.querySelectorAll('.review-question');
    
    questions.forEach(q => {
        const subject = q.dataset.subject;
        const isCorrect = q.dataset.correct === 'true';
        
        switch(filter) {
            case 'all': q.style.display = 'block'; break;
            case 'correct': q.style.display = isCorrect ? 'block' : 'none'; break;
            case 'incorrect': q.style.display = !isCorrect ? 'block' : 'none'; break;
            case 'english': q.style.display = subject === 'Use of English' ? 'block' : 'none'; break;
        }
    });
}

function shareResults() {
    const data = window.reviewData;
    const text = `📚 JAMB UTME 2026 Mock Exam\nScore: ${data.scores.total}/400 (${data.scores.percentage}%)\n\nPractice with JAMB Simulator!`;
    
    if (navigator.share) {
        navigator.share({ title: 'My JAMB Mock Exam Results', text });
    } else {
        prompt('Copy to share:', text);
    }
}

function showShareOptions() {
    const examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    if (!examResults) return;
    
    document.getElementById('sharePreview').textContent = ShareManager.formatExamMessage(examResults);
    document.getElementById('shareModal').style.display = 'flex';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function shareOnWhatsApp() {
    const examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    ShareManager.shareExamResults(examResults);
    closeShareModal();
}

function copyResults() {
    const examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    ShareManager.copyResults(examResults);
    closeShareModal();
}

function shareOnTwitter() {
    const examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    ShareManager.shareOnTwitter(examResults);
    closeShareModal();
}

function shareAsImage() {
    const examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    ShareManager.shareCustomMessage('My JAMB Results', ShareManager.formatExamMessage(examResults));
    closeShareModal();
}

function goHome() {
    window.location.href = '/home.html';
}

window.toggleReview = toggleReview;
window.filterQuestions = filterQuestions;
window.shareResults = shareResults;
window.goHome = goHome;
window.closeMotivation = closeMotivation;
window.showShareOptions = showShareOptions;
window.closeShareModal = closeShareModal;
window.shareOnWhatsApp = shareOnWhatsApp;
window.copyResults = copyResults;
window.shareOnTwitter = shareOnTwitter;
window.shareAsImage = shareAsImage;