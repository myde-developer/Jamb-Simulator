// js/results.js – final version
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let examResults = null;

document.addEventListener('DOMContentLoaded', () => {
    loadResults();
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
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

// ========== LOAD RESULTS ==========
async function loadResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');
    const isAdmin = urlParams.get('admin') === 'true';

    if (examId) {
        // Load a specific exam from the server (past results or admin view)
        await loadPastExam(examId, isAdmin);
    } else {
        // Load the most recent exam from localStorage (new exam flow)
        examResults = JSON.parse(localStorage.getItem('lastExamResults'));
        if (!examResults) {
            window.location.href = '/home.html';
            return;
        }
        displayResults(examResults);
    }
}

async function loadPastExam(examId, isAdmin) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/exam/${examId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load exam');
        const data = await response.json();

        // Transform backend response to match the structure expected by displayResults
        examResults = {
            scores: {
                total: data.score,
                subjectScores: {}
            },
            subjects: data.subjects.map(name => ({ name: name })),
            date: data.completed_at || data.started_at,
            subjectQuestions: {},  // not used for display, but kept for compatibility
            answers: {}
        };

        // Build subjectScores from answers array
        if (data.answers && data.answers.length) {
            data.answers.forEach(ans => {
                const subj = ans.subject;
                if (!examResults.scores.subjectScores[subj]) {
                    examResults.scores.subjectScores[subj] = { correct: 0, total: 0 };
                }
                examResults.scores.subjectScores[subj].total++;
                if (ans.is_correct) examResults.scores.subjectScores[subj].correct++;
                // Store individual answers for review mode
                examResults.answers[ans.question_id] = ans.user_answer;
            });
        }

        displayResults(examResults);

        // Add a back button for admin panel
        if (isAdmin) {
            const container = document.querySelector('.container');
            const backBtn = document.createElement('button');
            backBtn.textContent = '← Back to Admin Panel';
            backBtn.className = 'action-btn home-btn';
            backBtn.style.marginBottom = '1rem';
            backBtn.onclick = () => window.location.href = '/admin.html';
            container.prepend(backBtn);
        }
    } catch (error) {
        console.error('Error loading past exam:', error);
        document.getElementById('resultsHeader').innerHTML = '<div class="error">Failed to load exam details. <a href="past-results.html">Back to Past Results</a></div>';
    }
}

// ========== DISPLAY RESULTS (no percentages, no bars) ==========
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
        const jambScore = subjectName === 'Use of English' ? (data.correct * 1.67).toFixed(2) : (data.correct * 2.5).toFixed(2);
        
        html += `
            <div class="subject-row">
                <div class="subject-name">${subjectName}</div>
                <div class="subject-stats">${data.correct}/${data.total}<br><span style="color: #2d6a4f;">Score: ${jambScore}/100</span></div>
            </div>
        `;
    });
    
    html += `
        <div class="subject-row" style="border-top: 2px solid #1a1a2e; margin-top: 1rem; padding-top: 1rem;">
            <div class="subject-name" style="font-weight: 700;">TOTAL</div>
            <div class="subject-stats"><strong style="font-size: 1.1rem;">${results.scores.total}/400</strong></div>
        </div>
    `;
    breakdown.innerHTML = html;
}

// ========== REVIEW ANSWERS ==========
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

// ========== PDF EXPORT ==========
async function exportAsPDF() {
    if (!examResults) {
        showToast('No results to export');
        return;
    }
    showToast('📄 Generating PDF...');
    try {
        if (typeof html2pdf === 'undefined') {
            showToast('Loading PDF library...');
            await loadHtml2PdfLibrary();
        }
        const pdfHtml = generatePDFHTML(examResults);
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.innerHTML = pdfHtml;
        document.body.appendChild(tempContainer);
        await new Promise(resolve => setTimeout(resolve, 300));
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `JAMB_Results_${getDateString()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: false, backgroundColor: '#ffffff', letterRendering: true, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(tempContainer).save();
        document.body.removeChild(tempContainer);
        showToast('✅ PDF downloaded successfully!');
    } catch (error) {
        console.error(error);
        showToast('❌ Failed to generate PDF: ' + error.message);
        tryFallbackPDF();
    }
}

async function loadHtml2PdfLibrary() {
    return new Promise((resolve, reject) => {
        if (typeof html2pdf !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => setTimeout(resolve, 200);
        script.onerror = () => reject(new Error('Failed to load PDF library'));
        document.head.appendChild(script);
    });
}

function tryFallbackPDF() {
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
    let subjectRows = '';
    if (results.subjects && results.subjects.length > 0) {
        results.subjects.forEach(subject => {
            const subjectName = subject.name || subject;
            const data = results.scores.subjectScores[subjectName] || { correct: 0, total: 0 };
            const jambScore = subjectName === 'Use of English' ? (data.correct * 1.67).toFixed(2) : (data.correct * 2.5).toFixed(2);
            subjectRows += `
                <tr style="border-bottom: 1px solid #e1e5eb;">
                    <td style="padding: 12px 8px;">${escapeHtml(subjectName)}</td>
                    <td style="padding: 12px 8px; text-align: center;">${data.correct}/${data.total}</td>
                    <td style="padding: 12px 8px; text-align: center;">${jambScore}</td>
                </tr>
            `;
        });
    } else {
        subjectRows = `<tr><td colspan="3" style="padding: 20px; text-align: center;">No subject data available</td></tr>`;
    }
    const totalScore = results.scores.total || 0;
    return `<!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>JAMB Exam Results</title><style>
        body{font-family:sans-serif;padding:40px;background:white;}
        .score-circle{text-align:center;margin:20px 0;background:#1a1a2e;color:white;width:120px;height:120px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto;}
        table{width:100%;border-collapse:collapse;margin:20px 0;}
        th,td{border:1px solid #ccc;padding:8px;text-align:left;}
        th{background:#f8f9fa;}
        .footer{text-align:center;margin-top:30px;font-size:12px;color:#718096;}
    </style></head>
    <body>
        <h1 style="text-align:center;">JAMB UTME 2026 Mock Exam</h1>
        <p style="text-align:center;">${escapeHtml(new Date(results.date).toLocaleString())}</p>
        <div class="score-circle"><div style="font-size:32px;font-weight:bold;">${totalScore}</div><div>/400</div></div>
        <h2>Performance by Subject</h2>
        <table><thead><tr><th>Subject</th><th style="text-align:center;">Score</th><th style="text-align:center;">JAMB Score</th></tr></thead><tbody>${subjectRows}</tbody></table>
        <div class="footer"><p>Generated by JAMB Simulator 2026</p><p>Keep practicing!</p></div>
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

// ========== SHAREABLE SCORE CARD ==========
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
    ctx.fillStyle = '#ccc';
    ctx.font = '18px monospace';
    ctx.fillText(new Date(date).toLocaleDateString(), 50, 220);
    let y = 280;
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

// ========== UTILITIES ==========
function goHome() {
    window.location.href = '/home.html';
}

// Make global functions available
window.toggleReview = toggleReview;
window.filterQuestions = filterQuestions;
window.goHome = goHome;
window.exportAsPDF = exportAsPDF;
window.generateShareableCard = generateShareableCard;