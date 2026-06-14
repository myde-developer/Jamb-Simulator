const API_BASE = 'https://jamb-simulator-api.onrender.com';
let currentExamId = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔵 past-results.html loaded');
    const token = localStorage.getItem('token');
    console.log('🔐 Token exists?', !!token);
    if (!token) {
        showNotLoggedIn();
        return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 Current user:', user);
    loadExamList();
});

function showNotLoggedIn() {
    const container = document.getElementById('app');
    container.innerHTML = `
        <div class="error">
            <p>You need to be logged in to view your past results.</p>
            <button onclick="window.location.href='/auth.html'" class="view-btn" style="margin-top:1rem;">Login</button>
        </div>
    `;
}

async function loadExamList() {
    const container = document.getElementById('app');
    container.innerHTML = '<div class="loading">Loading your past exams...</div>';
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/user/my-exams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const exams = await response.json();
        if (!exams.length) {
            container.innerHTML = `<div class="error"><p>You haven't taken any exams yet.</p><a href="select-subjects.html" class="view-btn">Start an Exam</a></div>`;
            return;
        }
        let html = '<h1>My Past Exams</h1><div class="exam-list">';
        exams.forEach(exam => {
            const date = new Date(exam.completed_at || exam.started_at).toLocaleDateString();
            const score = exam.score ? exam.score.toFixed(2) : 'N/A';
            const total = exam.total_questions || 180;
            const percentage = exam.percentage ? exam.percentage + '%' : 'N/A';
            html += `
                <div class="exam-card">
                    <div class="exam-date">${date}</div>
                    <div class="exam-score">${score}/${total} (${percentage})</div>
                    <button class="view-btn" onclick="viewExamDetails('${exam.id}')">View Details</button>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="error">Failed to load exam list. Please try again later.</div>';
    }
}

window.viewExamDetails = async function(examId) {
    console.log('🔍 View details for exam:', examId);
    const container = document.getElementById('app');
    container.innerHTML = '<div class="loading">Loading exam details...</div>';
    currentExamId = examId;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/progress/exam/${examId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('📡 Details response status:', response.status);
        if (!response.ok) throw new Error('Failed to load exam details');
        const exam = await response.json();
        console.log('📖 Exam details received');
        const date = new Date(exam.completed_at || exam.started_at).toLocaleString();
        const score = exam.score ? exam.score.toFixed(2) : 'N/A';
        const total = exam.total_questions || 180;
        const percentage = exam.percentage ? exam.percentage + '%' : 'N/A';
        let answersHtml = '';
        if (exam.answers && exam.answers.length) {
            exam.answers.forEach((ans, idx) => {
                const isCorrect = ans.is_correct;
                answersHtml += `
                    <div class="answer-item ${isCorrect ? 'correct' : 'incorrect'}">
                        <div class="question-text"><strong>Q${idx+1}:</strong> ${ans.question_text}</div>
                        <div>Your answer: <strong>${ans.user_answer || 'Not answered'}</strong> ${isCorrect ? '<span class="correct-badge">✓ Correct</span>' : '<span class="wrong-badge">✗ Wrong</span>'}</div>
                        <div class="user-answer">Correct answer: ${ans.correct_answer}</div>
                        <div class="explanation">${ans.explanation || 'No explanation available.'}</div>
                    </div>
                `;
            });
        } else {
            answersHtml = '<p>No answer details available.</p>';
        }
        const html = `
            <div class="detail-card">
                <div class="detail-header">
                    <h2>Exam Details</h2>
                    <button class="back-btn" onclick="loadExamList()">← Back to list</button>
                </div>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Score:</strong> ${score}/${total} (${percentage})</p>
                <h3 style="margin-top:1.5rem;">Answers Review</h3>
                <div class="answers-list">${answersHtml}</div>
            </div>
        `;
        container.innerHTML = html;
    } catch (error) {
        console.error('💥 Details error:', error);
        container.innerHTML = '<div class="error">Failed to load exam details. <button class="view-btn" onclick="loadExamList()">Back</button></div>';
    }
};