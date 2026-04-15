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
    if (e) e.preventDefault();
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

// ============ PDF GENERATION - COMPLETELY REWRITTEN ============

async function exportAsPDF() {
    if (!examResults) {
        showToast('No results to export');
        return;
    }
    
    showToast('Generating PDF...');
    
    try {
        // Create a complete HTML document for the PDF
        const pdfHtml = generatePDFHTML(examResults);
        
        // Create a temporary iframe or div
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.innerHTML = pdfHtml;
        document.body.appendChild(tempContainer);
        
        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // PDF options
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `JAMB_Results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                logging: false,
                backgroundColor: '#ffffff',
                letterRendering: true
            },
            jsPDF: { 
                unit: 'in', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        // Generate PDF
        await html2pdf().set(opt).from(tempContainer).save();
        
        // Clean up
        document.body.removeChild(tempContainer);
        showToast('PDF downloaded successfully! ✓');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showToast('Failed to generate PDF. Please try again.');
    }
}

function generatePDFHTML(results) {
    const totalCorrect = Object.values(results.scores.subjectScores).reduce((sum, s) => sum + s.correct, 0);
    const totalQuestions = Object.values(results.subjectQuestions).reduce((sum, q) => sum + q.length, 0);
    
    // Build subject rows
    let subjectRows = '';
    results.subjects.forEach(subject => {
        const subjectName = subject.name;
        const data = results.scores.subjectScores[subjectName] || { correct: 0, total: 0 };
        const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
        const jambScore = subjectName === 'Use of English' ? (data.correct * 1.67).toFixed(2) : (data.correct * 2.5).toFixed(2);
        
        subjectRows += `
            <tr style="border-bottom: 1px solid #e1e5eb;">
                <td style="padding: 12px 8px;">${subjectName}</td>
                <td style="padding: 12px 8px; text-align: center;">${data.correct}/${data.total}</td>
                <td style="padding: 12px 8px; text-align: center;">${percentage.toFixed(1)}%</td>
                <td style="padding: 12px 8px; text-align: center;">${jambScore}</td>
            </tr>
        `;
    });
    
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>JAMB Exam Results</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                padding: 40px;
                color: #1a1a2e;
                line-height: 1.5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #1a1a2e;
                padding-bottom: 20px;
            }
            .header h1 {
                font-size: 24px;
                margin-bottom: 5px;
                color: #1a1a2e;
            }
            .header p {
                font-size: 12px;
                color: #718096;
            }
            .score-section {
                text-align: center;
                margin-bottom: 30px;
            }
            .score-circle {
                display: inline-block;
                background: #1a1a2e;
                color: white;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
            }
            .score-number {
                font-size: 32px;
                font-weight: bold;
            }
            .score-total {
                font-size: 12px;
            }
            .score-percentage {
                margin-top: 15px;
                font-size: 16px;
                font-weight: 500;
                color: #2d6a4f;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 30px;
            }
            .stat-box {
                background: #f8f9fa;
                padding: 15px;
                text-align: center;
                border-radius: 8px;
            }
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #1a1a2e;
            }
            .stat-label {
                font-size: 11px;
                color: #718096;
                margin-top: 5px;
            }
            .subject-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                border: 1px solid #e1e5eb;
            }
            .subject-table th {
                background: #f8f9fa;
                padding: 12px 8px;
                text-align: left;
                border-bottom: 2px solid #e1e5eb;
                font-size: 13px;
            }
            .subject-table td {
                padding: 10px 8px;
                font-size: 13px;
            }
            .total-row {
                border-top: 2px solid #1a1a2e;
                background: #f8f9fa;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e1e5eb;
                font-size: 10px;
                color: #718096;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>JAMB UTME 2026 Mock Exam</h1>
                <p>${new Date(results.date).toLocaleString()}</p>
            </div>
            
            <div class="score-section">
                <div class="score-circle">
                    <div class="score-number">${results.scores.total}</div>
                    <div class="score-total">/400</div>
                </div>
                <div class="score-percentage">${results.scores.percentage}% Overall</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number">${totalQuestions}</div>
                    <div class="stat-label">Total Questions</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${totalCorrect}</div>
                    <div class="stat-label">Correct Answers</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${totalQuestions - totalCorrect}</div>
                    <div class="stat-label">Incorrect Answers</div>
                </div>
            </div>
            
            <h2 style="font-size: 16px; margin-bottom: 15px;">Performance by Subject</h2>
            <table class="subject-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th style="text-align: center;">Score</th>
                        <th style="text-align: center;">Accuracy</th>
                        <th style="text-align: center;">JAMB Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${subjectRows}
                    <tr class="total-row">
                        <td style="font-weight: bold;">TOTAL</td>
                        <td style="text-align: center; font-weight: bold;">${totalCorrect}/${totalQuestions}</td>
                        <td style="text-align: center; font-weight: bold;">${results.scores.percentage}%</td>
                        <td style="text-align: center; font-weight: bold;">${results.scores.total}/400</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                <p>Generated by JAMB Simulator 2026</p>
                <p>Keep practicing to improve your score!</p>
            </div>
        </div>
    </body>
    </html>`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function goHome() {
    window.location.href = '/home.html';
}

// Global functions
window.toggleReview = toggleReview;
window.filterQuestions = filterQuestions;
window.goHome = goHome;
window.exportAsPDF = exportAsPDF;