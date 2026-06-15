const API_BASE = 'https://jamb-simulator-api.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('app').innerHTML = '<div class="error">You need to log in to view past results. <a href="/auth.html">Login</a></div>';
        return;
    }
    loadExamList();
});

async function loadExamList() {
    const container = document.getElementById('app');
    container.innerHTML = '<div class="loading">Loading your past exams...</div>';
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/user/exams`, {
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
            const score = exam.score !== undefined && exam.score !== null ? parseFloat(exam.score).toFixed(2) : 'N/A';
            const total = exam.total_questions || 180;
            const percentage = exam.percentage !== undefined && exam.percentage !== null ? exam.percentage + '%' : 'N/A';
            const subjects = exam.subject_names ? exam.subject_names.join(', ') : 'JAMB Exam';
            html += `
                <div class="exam-card">
                    <div class="exam-date">📅 ${date}</div>
                    <div class="exam-score">Score: ${score}/${total} (${percentage})</div>
                    <div class="exam-subjects">Subjects: ${subjects}</div>
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
    const container = document.getElementById('app');
    container.innerHTML = '<div class="loading">Loading exam details...</div>';
    try {
        const token = localStorage.getItem('token');
        // You need an endpoint to fetch a single exam with answers. We'll create it if missing.
        const response = await fetch(`${API_BASE}/api/progress/exam/${examId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load details');
        const exam = await response.json();
        // Render details (same as before)
        const date = new Date(exam.completed_at || exam.started_at).toLocaleString();
        const score = exam.score ? exam.score.toFixed(2) : 'N/A';
        const total = exam.total_questions || 180;
        const percentage = exam.percentage ? exam.percentage + '%' : 'N/A';
        let answersHtml = '<ul>';
        if (exam.answers && exam.answers.length) {
            exam.answers.forEach((ans, idx) => {
                answersHtml += `<li><strong>Q${idx+1}:</strong> ${ans.question_text}<br>Your answer: ${ans.user_answer || 'Not answered'} (${ans.is_correct ? '✓' : '✗'})<br>Correct: ${ans.correct_answer}<br>${ans.explanation || ''}</li>`;
            });
        } else {
            answersHtml = '<p>No answer details.</p>';
        }
        answersHtml += '</ul>';
        container.innerHTML = `
            <div class="detail-card">
                <button onclick="loadExamList()">← Back to list</button>
                <h2>Exam Details</h2>
                <p>Date: ${date}</p>
                <p>Score: ${score}/${total} (${percentage})</p>
                <h3>Answers</h3>
                ${answersHtml}
            </div>
        `;
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="error">Failed to load details. <button onclick="loadExamList()">Back</button></div>';
    }
};