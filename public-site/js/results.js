// client/js/results.js
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let examResults = null;

document.addEventListener('DOMContentLoaded', () => {
    loadResults();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Add share button listener if present
    const shareBtn = document.getElementById('shareScoreBtn');
    if (shareBtn) shareBtn.addEventListener('click', generateShareableCard);
});

function logout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

function loadResults() {
    // First try to get from localStorage
    examResults = JSON.parse(localStorage.getItem('lastExamResults'));
    
    // Fallback: if not found, check sessionStorage (in case move failed)
    if (!examResults) {
        const pending = sessionStorage.getItem('pendingExamResults');
        if (pending) {
            console.log('Results found in sessionStorage, moving to localStorage');
            examResults = JSON.parse(pending);
            localStorage.setItem('lastExamResults', pending);
            sessionStorage.removeItem('pendingExamResults');
            sessionStorage.removeItem('redirectAfterAuth');
        }
    }
    
    if (!examResults) {
        console.log('No exam results found. Redirecting.');
        const token = localStorage.getItem('token');
        if (token) {
            window.location.href = '/home.html';
        } else {
            window.location.href = '/auth.html';
        }
        return;
    }
    
    console.log('Displaying results');
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
// ============ PDF GENERATION - FIXED VERSION ============

async function exportAsPDF() {
    if (!examResults) {
        showToast('No results to export');
        return;
    }
    
    showToast('📄 Generating PDF...');
    
    try {
        // Check if html2pdf is loaded
        if (typeof html2pdf === 'undefined') {
            showToast('Loading PDF library...');
            await loadHtml2PdfLibrary();
        }
        
        // Create a complete HTML document for the PDF
        const pdfHtml = generatePDFHTML(examResults);
        
        // Create a temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.innerHTML = pdfHtml;
        document.body.appendChild(tempContainer);
        
        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // PDF options
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `JAMB_Results_${getDateString()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                logging: false,
                backgroundColor: '#ffffff',
                letterRendering: true,
                useCORS: true
            },
            jsPDF: { 
                unit: 'in', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        // Generate and download PDF
        await html2pdf().set(opt).from(tempContainer).save();
        
        // Clean up
        document.body.removeChild(tempContainer);
        showToast('✅ PDF downloaded successfully!');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showToast('❌ Failed to generate PDF: ' + error.message);
        
        // Try fallback method
        tryFallbackPDF();
    }
}

async function loadHtml2PdfLibrary() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (typeof html2pdf !== 'undefined') {
            resolve();
            return;
        }
        
        // Load html2pdf bundle
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
            // Wait a bit for initialization
            setTimeout(resolve, 200);
        };
        script.onerror = () => reject(new Error('Failed to load PDF library'));
        document.head.appendChild(script);
    });
}

function tryFallbackPDF() {
    // Fallback: Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const pdfHtml = generatePDFHTML(examResults);
        printWindow.document.write(pdfHtml);
        printWindow.document.close();
        printWindow.print();
        showToast('📄 Print dialog opened. Save as PDF from print dialog.');
    } else {
        showToast('❌ Please allow popups or try again.');
    }
}

function getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
}

function generatePDFHTML(results) {
    const totalCorrect = Object.values(results.scores.subjectScores).reduce((sum, s) => sum + (s.correct || 0), 0);
    const totalQuestions = Object.values(results.subjectQuestions).reduce((sum, q) => sum + (q.length || 0), 0);
    
    // Build subject rows
    let subjectRows = '';
    if (results.subjects && results.subjects.length > 0) {
        results.subjects.forEach(subject => {
            const subjectName = subject.name || subject;
            const data = results.scores.subjectScores[subjectName] || { correct: 0, total: 0 };
            const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            const jambScore = subjectName === 'Use of English' 
                ? (data.correct * 1.67).toFixed(2) 
                : (data.correct * 2.5).toFixed(2);
            
            subjectRows += `
                <tr style="border-bottom: 1px solid #e1e5eb;">
                    <td style="padding: 12px 8px;">${escapeHtml(subjectName)}</td>
                    <td style="padding: 12px 8px; text-align: center;">${data.correct}/${data.total}</td>
                    <td style="padding: 12px 8px; text-align: center;">${percentage.toFixed(1)}%</td>
                    <td style="padding: 12px 8px; text-align: center;">${jambScore}</td>
                </tr>
            `;
        });
    } else {
        subjectRows = `
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center;">No subject data available</td>
            </tr>
        `;
    }
    
    const totalPercentage = results.scores.percentage || ((totalCorrect / totalQuestions) * 100).toFixed(1);
    const totalScore = results.scores.total || 0;
    
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
                background: white;
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
                font-size: 18px;
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
            h2 {
                font-size: 16px;
                margin-bottom: 15px;
                color: #1a1a2e;
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
                font-weight: 600;
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
            .total-row td {
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
            @media print {
                body {
                    padding: 0;
                }
                .stats-grid {
                    break-inside: avoid;
                }
                .subject-table {
                    break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>JAMB UTME 2026 Mock Exam</h1>
                <p>${escapeHtml(new Date(results.date).toLocaleString())}</p>
            </div>
            
            <div class="score-section">
                <div class="score-circle">
                    <div class="score-number">${totalScore}</div>
                    <div class="score-total">/400</div>
                </div>
                <div class="score-percentage">${totalPercentage}% Overall</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number">${totalQuestions}</div>
                    <div class="stat-label">Total Questions</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" style="color: #2d6a4f;">${totalCorrect}</div>
                    <div class="stat-label">Correct Answers</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number" style="color: #c92a2a;">${totalQuestions - totalCorrect}</div>
                    <div class="stat-label">Incorrect Answers</div>
                </div>
            </div>
            
            <h2>Performance by Subject</h2>
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
                        <td style="text-align: center; font-weight: bold;">${totalPercentage}%</td>
                        <td style="text-align: center; font-weight: bold;">${totalScore}/400</td>
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

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============ SHAREABLE SCORE CARD ============
async function generateShareableCard() {
    const { scores, subjects, date } = examResults;
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.fillText('JAMB UTME 2026', 50, 80);
    ctx.fillStyle = 'white';
    ctx.font = '24px "Segoe UI"';
    ctx.fillText(`Total Score: ${scores.total} / 400`, 50, 160);
    ctx.font = '20px "Segoe UI"';
    ctx.fillText(`Percentage: ${scores.percentage}%`, 50, 210);
    ctx.fillStyle = '#ccc';
    ctx.font = '18px monospace';
    ctx.fillText(new Date(date).toLocaleDateString(), 50, 270);
    let y = 330;
    ctx.font = '18px "Segoe UI"';
    subjects.forEach(sub => {
        const data = scores.subjectScores[sub.name];
        if (data) {
            const subScore = sub.name === 'Use of English' ? (data.correct * 1.67).toFixed(2) : (data.correct * 2.5).toFixed(2);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillText(`${sub.name}: ${data.correct}/${data.total} (${subScore}/100)`, 50, y);
            y += 35;
        }
    });
    ctx.fillStyle = '#f1c40f';
    ctx.font = '16px "Segoe UI"';
    ctx.fillText('JAMB Simulator 2026 – Keep practicing!', 50, canvas.height - 50);
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'jamb_scorecard.png';
    a.href = image;
    a.click();
    if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        navigator.share({ title: 'My JAMB Score', files: [new File([blob], 'score.png', { type: 'image/png' })] });
    }
}

function goHome() {
    window.location.href = '/home.html';
}

// Global functions
window.toggleReview = toggleReview;
window.filterQuestions = filterQuestions;
window.goHome = goHome;
window.exportAsPDF = exportAsPDF;
window.generateShareableCard = generateShareableCard;