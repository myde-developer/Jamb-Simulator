// client/js/results.js
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let examResults = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadResults();
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/auth.html';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) userInfo.textContent = `Hi, ${user.full_name}`;
}

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

function loadResults() {
    examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    if (!examResults) {
        window.location.href = '/home.html';
        return;
    }
    displayResults(examResults);
}

function displayResults(results) {
    displayHeader(results);
    displaySummaryCards(results);
    displaySubjectBreakdown(results);
}

function displayHeader(results) {
    const header = document.getElementById('resultsHeader');
    header.innerHTML = `
        <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem;">JAMB UTME 2026 Mock Exam</h1>
        <p style="color: #718096; font-size: 0.875rem;">${new Date(results.date).toLocaleString()}</p>
        <div class="score-circle">
            <div class="score-number">${results.scores.total}</div>
            <div style="font-size: 0.75rem;">/400</div>
        </div>
        <div class="score-percentage">${results.scores.percentage}% Overall</div>
    `;
}

function displaySummaryCards(results) {
    const cards = document.getElementById('summaryCards');
    const totalQuestions = Object.values(results.subjectQuestions).reduce((sum, q) => sum + q.length, 0);
    const answeredCount = Object.keys(results.answers).length;
    const correctCount = Object.values(results.scores.subjectScores).reduce((sum, s) => sum + s.correct, 0);
    
    cards.innerHTML = `
        <div class="summary-card"><h3>Total Questions</h3><div class="summary-value">${totalQuestions}</div></div>
        <div class="summary-card"><h3>Answered</h3><div class="summary-value">${answeredCount}</div></div>
        <div class="summary-card"><h3>Correct</h3><div class="summary-value" style="color: #2d6a4f;">${correctCount}</div></div>
        <div class="summary-card"><h3>JAMB Score</h3><div class="summary-value">${results.scores.total}</div></div>
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
        const jambScore = subjectName === 'Use of English' ? (data.correct * 1.67).toFixed(2) : (data.correct * 2.5).toFixed(2);
        
        html += `
            <div class="subject-row">
                <div class="subject-name">${subjectName}</div>
                <div class="subject-score-bar"><div class="subject-score-fill" style="width: ${percentage}%"></div></div>
                <div class="subject-stats">${data.correct}/${data.total} (${percentage.toFixed(1)}%)<br><span style="color: #2d6a4f;">Score: ${jambScore}/100</span></div>
            </div>
        `;
    });
    
    html += `
        <div class="subject-row" style="border-top: 2px solid #1a1a2e; margin-top: 1rem; padding-top: 1rem;">
            <div class="subject-name" style="font-weight: 700;">TOTAL</div>
            <div class="subject-score-bar"><div class="subject-score-fill" style="width: ${results.scores.percentage}%"></div></div>
            <div class="subject-stats"><strong style="font-size: 1.1rem;">${results.scores.total}/400</strong></div>
        </div>
    `;
    breakdown.innerHTML = html;
}

function toggleReview() {
    const reviewSection = document.getElementById('reviewSection');
    const isHidden = reviewSection.style.display === 'none' || !reviewSection.style.display;
    reviewSection.style.display = isHidden ? 'block' : 'none';
    if (isHidden && !reviewSection.hasLoaded) {
        loadReviewQuestions();
        reviewSection.hasLoaded = true;
    }
}

function loadReviewQuestions() {
    const data = examResults;
    const container = document.getElementById('reviewQuestions');
    let allQuestions = [];
    
    Object.keys(data.subjectQuestions).forEach(subject => {
        data.subjectQuestions[subject].forEach(q => {
            allQuestions.push({ ...q, subject: subject });
        });
    });
    
    let html = '';
    allQuestions.forEach((q, index) => {
        const userAnswer = data.answers[q.id];
        const isCorrect = userAnswer === q.correct_answer;
        const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
        
        html += `
            <div class="review-question ${isCorrect ? 'correct' : 'incorrect'}" data-subject="${q.subject}" data-correct="${isCorrect}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                    <span style="font-size: 0.75rem; background: #f0f0f5; padding: 0.25rem 0.75rem; border-radius: 20px;">${q.subject}</span>
                    <span class="review-status ${isCorrect ? 'status-correct' : 'status-incorrect'}">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                </div>
                <div style="margin-bottom: 0.75rem;"><strong>Q${index + 1}:</strong> ${q.question_text}</div>
                <div>
                    ${['A', 'B', 'C', 'D'].map(letter => {
                        const isUserChoice = userAnswer === letter;
                        const isCorrectChoice = q.correct_answer === letter;
                        let style = '';
                        if (isCorrectChoice) style = 'background: #e6f4ea; border-left: 3px solid #2d6a4f;';
                        else if (isUserChoice && !isCorrect) style = 'background: #fee8e8; border-left: 3px solid #c92a2a;';
                        return `<div style="padding: 0.5rem; margin: 0.25rem 0; border-radius: 6px; ${style}"><strong>${letter}:</strong> ${options[letter]} ${isCorrectChoice ? ' ✓ (Correct)' : ''} ${isUserChoice && !isCorrectChoice ? ' (Your answer)' : ''}</div>`;
                    }).join('')}
                </div>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 0.75rem; margin-top: 0.75rem;"><strong>Explanation:</strong><br>${q.explanation || 'The correct answer is ' + q.correct_answer + '.'}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function filterQuestions(filter) {
    const btn = event.target;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const questions = document.querySelectorAll('.review-question');
    questions.forEach(q => {
        const isCorrect = q.dataset.correct === 'true';
        if (filter === 'all') q.style.display = 'block';
        else if (filter === 'correct') q.style.display = isCorrect ? 'block' : 'none';
        else if (filter === 'incorrect') q.style.display = !isCorrect ? 'block' : 'none';
    });
}

async function exportAsPDF() {
    if (!examResults) return;
    showToast('Generating PDF...');
    try {
        const pdfBlob = await generateExamPDF(examResults);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `JAMB_Results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('PDF downloaded successfully!');
    } catch (error) {
        console.error('PDF error:', error);
        showToast('Failed to generate PDF');
    }
}

async function generateExamPDF(results) {
    const totalCorrect = Object.values(results.scores.subjectScores).reduce((sum, s) => sum + s.correct, 0);
    const totalQuestions = Object.values(results.subjectQuestions).reduce((sum, q) => sum + q.length, 0);
    
    let subjectRows = '';
    results.subjects.forEach(subject => {
        const data = results.scores.subjectScores[subject.name] || { correct: 0, total: 0 };
        const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
        const jambScore = subject.name === 'Use of English' ? (data.correct * 1.67).toFixed(2) : (data.correct * 2.5).toFixed(2);
        subjectRows += `<tr><td style="padding: 8px; border-bottom: 1px solid #e1e5eb;">${subject.name}</td><td style="padding: 8px; text-align: center;">${data.correct}/${data.total}</td><td style="padding: 8px; text-align: center;">${percentage.toFixed(1)}%</td><td style="padding: 8px; text-align: center;">${jambScore}</td></tr>`;
    });
    
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px;">
                <h1 style="color: #1a1a2e; margin-bottom: 5px; font-size: 24px;">JAMB UTME 2026 Mock Exam</h1>
                <p style="color: #718096; font-size: 12px;">${new Date(results.date).toLocaleString()}</p>
            </div>
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background: #1a1a2e; color: white; width: 120px; height: 120px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="font-size: 28px; font-weight: bold;">${results.scores.total}</div>
                    <div style="font-size: 11px;">/400</div>
                </div>
                <div style="margin-top: 15px; font-size: 18px; font-weight: 500; color: #2d6a4f;">${results.scores.percentage}% Overall</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px;"><div style="font-size: 24px; font-weight: bold;">${totalQuestions}</div><div style="font-size: 11px;">Total Questions</div></div>
                <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px;"><div style="font-size: 24px; font-weight: bold; color: #2d6a4f;">${totalCorrect}</div><div style="font-size: 11px;">Correct</div></div>
                <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px;"><div style="font-size: 24px; font-weight: bold; color: #c92a2a;">${totalQuestions - totalCorrect}</div><div style="font-size: 11px;">Incorrect</div></div>
            </div>
            <div><h2 style="font-size: 16px; margin-bottom: 15px;">Performance by Subject</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #f8f9fa;"><th style="padding: 10px; text-align: left;">Subject</th><th style="padding: 10px;">Score</th><th style="padding: 10px;">Accuracy</th><th style="padding: 10px;">JAMB Score</th></tr></thead>
                <tbody>${subjectRows}</tbody>
            </table></div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5eb; font-size: 10px; color: #718096;">
                <p>Generated by JAMB Simulator 2026</p>
                <p>Keep practicing to improve your score!</p>
            </div>
        </div>
    `;
    
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);
    
    const opt = { margin: [0.5, 0.5, 0.5, 0.5], image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, logging: false }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
    const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
    document.body.removeChild(element);
    return pdf;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function goHome() { window.location.href = '/home.html'; }

window.toggleReview = toggleReview;
window.filterQuestions = filterQuestions;
window.goHome = goHome;
window.exportAsPDF = exportAsPDF;