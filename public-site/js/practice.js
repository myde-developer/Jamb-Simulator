
const API_BASE = 'https://jamb-simulator-api.onrender.com';

let practiceState = {
    questions: [],
    currentIndex: 0,
    answers: {},
    checked: false,
    results: { correct: 0, wrong: 0 },
    streak: 0
};

document.addEventListener('DOMContentLoaded', () => {
    loadPracticeStats();
    loadSubjects();
});

// ========== SUBJECTS & TOPICS ==========
async function loadSubjects() {
    try {
        const res = await fetch(`${API_BASE}/api/practice/subjects`);
        const data = await res.json();
        const subjects = data.subjects;
        const select = document.getElementById('subjectSelect');
        select.innerHTML = '<option value="">Select Subject</option>';
        subjects.forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
        select.addEventListener('change', loadTopics);
    } catch (e) { console.error(e); }
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect').value;
    const topicSelect = document.getElementById('topicSelect');
    if (!subjectId) {
        topicSelect.disabled = true;
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/practice/topics/${subjectId}`);
        const data = await res.json();
        let opts = '<option value="all">All Topics</option>';
        if (data.topics) {
            data.topics.forEach(t => opts += `<option value="${t}">${t}</option>`);
        }
        topicSelect.innerHTML = opts;
        topicSelect.disabled = false;
    } catch (e) {
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        topicSelect.disabled = false;
    }
}

function loadPracticeStats() {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');
    document.getElementById('totalPracticed').innerText = stats.total;
    document.getElementById('correctRate').innerText = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) + '%' : '0%';
    document.getElementById('streakCount').innerText = stats.streak;
}

// ========== START PRACTICE ==========
async function startPractice() {
    const subjectId = document.getElementById('subjectSelect').value;
    if (!subjectId) return alert('Select a subject');
    const topic = document.getElementById('topicSelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    const count = parseInt(document.getElementById('questionCount').value);

    try {
        const res = await fetch(`${API_BASE}/api/practice/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject_id: parseInt(subjectId),
                topic: topic !== 'all' ? topic : null,
                difficulty: difficulty !== 'all' ? difficulty : null,
                count
            })
        });
        let questions = await res.json();
        if (!questions.length) throw new Error('No questions');
        practiceState.questions = questions;
        practiceState.currentIndex = 0;
        practiceState.answers = {};
        practiceState.checked = false;
        practiceState.results = { correct: 0, wrong: 0 };
        practiceState.streak = 0;

        document.getElementById('practiceSetup').style.display = 'none';
        document.getElementById('practiceArea').style.display = 'block';
        renderQuestion();
    } catch (e) {
        alert('Failed to load questions: ' + e.message);
    }
}

// ========== RENDER QUESTION ==========
function renderQuestion() {
    const q = practiceState.questions[practiceState.currentIndex];
    document.getElementById('currentSubject').innerText = q.subject;
    document.getElementById('progressText').innerText = `Question ${practiceState.currentIndex + 1}/${practiceState.questions.length}`;
    document.getElementById('questionText').innerHTML = q.question_text;

    const saved = practiceState.answers[q.id];
    let optsHtml = '';
    ['A', 'B', 'C', 'D'].forEach(letter => {
        const optText = q[`option_${letter.toLowerCase()}`];
        optsHtml += `<div class="practice-option ${saved === letter ? 'selected' : ''}" onclick="selectOption('${q.id}','${letter}')">
            <span class="option-letter">${letter}</span> ${optText}
        </div>`;
    });
    document.getElementById('optionsContainer').innerHTML = optsHtml;
    document.getElementById('feedbackBox').classList.remove('show');
    document.getElementById('checkBtn').disabled = false;
    document.getElementById('nextBtn').disabled = true;
    practiceState.checked = false;
}

function selectOption(qid, letter) {
    if (practiceState.checked) return;
    practiceState.answers[qid] = letter;
    document.querySelectorAll('.practice-option').forEach(opt => {
        const l = opt.querySelector('.option-letter')?.innerText;
        if (l === letter) opt.classList.add('selected');
        else opt.classList.remove('selected');
    });
    document.getElementById('checkBtn').disabled = false;
}

// ========== CHECK ANSWER =========
async function checkAnswer() {
    const q = practiceState.questions[practiceState.currentIndex];
    const selected = practiceState.answers[q.id];
    if (!selected) return alert('Select an answer');
    practiceState.checked = true;
    document.getElementById('checkBtn').disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/practice/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId: q.id, selectedAnswer: selected })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Check failed');

        const { isCorrect, correct_answer, explanation } = data;

        // Visual feedback on options
        document.querySelectorAll('.practice-option').forEach(opt => {
            const letter = opt.querySelector('.option-letter')?.innerText;
            if (letter === correct_answer) {
                opt.classList.add('correct');
            } else if (letter === selected && !isCorrect) {
                opt.classList.add('wrong');
            }
        });

        // Update results
        if (isCorrect) {
            practiceState.results.correct++;
            practiceState.streak++;
        } else {
            practiceState.results.wrong++;
            practiceState.streak = 0;
            // Show encouragement from motivation.js
            showEncouragement();
        }

        // Show feedback
        const fb = document.getElementById('feedbackBox');
        document.getElementById('feedbackMessage').innerHTML = isCorrect
            ? `<div class="feedback-correct">✓ Correct! The correct answer is ${correct_answer}.</div>`
            : `<div class="feedback-wrong">✗ Wrong. The correct answer is ${correct_answer}.</div>`;
        document.getElementById('explanation').innerText = explanation || 'No explanation available.';
        fb.classList.add('show');
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('streakCount').innerText = practiceState.streak;

    } catch (err) {
        console.error(err);
        alert('Failed to check answer. Please try again.');
        practiceState.checked = false;
        document.getElementById('checkBtn').disabled = false;
    }
}

// ========== ENCOURAGEMENT =========
function showEncouragement() {
    if (typeof MotivationalMessages !== 'undefined' && MotivationalMessages.getEncouragement) {
        const msg = MotivationalMessages.getEncouragement();
        if (msg) {
            const toast = document.createElement('div');
            toast.className = 'encouragement-toast';
            toast.innerHTML = `
                <div class="toast-emoji">${msg.emoji || '💪'}</div>
                <div class="toast-text">
                    <div class="toast-quote">${msg.quote}</div>
                    <div class="toast-message">${msg.message}</div>
                </div>
            `;
            toast.style.cssText = `
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: #1a1a2e; color: white; padding: 12px 24px;
                border-radius: 50px; font-size: 0.9rem; z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                display: flex; align-items: center; gap: 12px;
                animation: slideUp 0.3s ease;
            `;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(20px)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// ========== NEXT QUESTION ==========
function nextQuestion() {
    if (practiceState.currentIndex < practiceState.questions.length - 1) {
        practiceState.currentIndex++;
        renderQuestion();
    } else {
        showSummary();
    }
}

// ========== SUMMARY ==========
function showSummary() {
    document.getElementById('practiceArea').style.display = 'none';
    document.getElementById('practiceSummary').style.display = 'block';
    const correct = practiceState.results.correct;
    const total = practiceState.questions.length;
    const wrong = practiceState.results.wrong;
    const acc = Math.round((correct / total) * 100);

    document.getElementById('summaryCorrect').innerText = correct;
    document.getElementById('summaryWrong').innerText = wrong;
    document.getElementById('summaryAccuracy').innerText = acc + '%';

    // Motivational message (from motivation.js)
    if (typeof MotivationalMessages !== 'undefined') {
        const msg = MotivationalMessages.getMessage(correct, total);
        document.getElementById('motivationalMessage').innerHTML = `
            <div style="font-size:1.5rem;">${msg.emoji}</div>
            <div><strong>${msg.quote}</strong> ${msg.message}</div>
        `;
    } else {
        document.getElementById('motivationalMessage').innerHTML = acc >= 80 ? 'Excellent!' : acc >= 50 ? 'Good effort!' : 'Keep practicing!';
    }

    saveStats(correct, total);
}

function saveStats(correct, total) {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');
    stats.total += total;
    stats.correct += correct;
    stats.streak = practiceState.streak;
    localStorage.setItem('practiceStats', JSON.stringify(stats));
    loadPracticeStats();
}

// ========== UTILITY FUNCTIONS ==========
function practiceAgain() { location.reload(); }
function sharePracticeResults() {
    const text = `I scored ${practiceState.results.correct}/${practiceState.questions.length} in JAMB practice!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

// Make functions global
window.startPractice = startPractice;
window.selectOption = selectOption;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.practiceAgain = practiceAgain;
window.reviewMistakes = reviewMistakes;
window.sharePracticeResults = sharePracticeResults;