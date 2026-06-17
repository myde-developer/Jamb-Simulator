// client/js/practice.js – final version with MathJax re-render
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
    const select = document.getElementById('subjectSelect');
    select.innerHTML = '<option value="">Loading subjects...</option>';
    try {
        const res = await fetch(`${API_BASE}/api/practice/subjects`);
        const data = await res.json();
        const subjects = data.subjects;
        select.innerHTML = '<option value="">Select Subject</option>';
        subjects.forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
        select.addEventListener('change', loadTopics);
    } catch (e) {
        console.error(e);
        select.innerHTML = '<option value="">Error loading subjects. Refresh page.</option>';
    }
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect').value;
    const topicSelect = document.getElementById('topicSelect');
    if (!subjectId) {
        topicSelect.disabled = true;
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        return;
    }
    topicSelect.disabled = true;
    topicSelect.innerHTML = '<option value="all">Loading topics...</option>';
    try {
        const res = await fetch(`${API_BASE}/api/practice/topics/${subjectId}`);
        const data = await res.json();
        let opts = '<option value="all">All Topics</option>';
        if (data.topics && data.topics.length) {
            data.topics.forEach(t => opts += `<option value="${t}">${t}</option>`);
        } else {
            opts += '<option disabled>No topics available</option>';
        }
        topicSelect.innerHTML = opts;
        topicSelect.disabled = false;
    } catch (e) {
        console.error(e);
        topicSelect.innerHTML = '<option value="all">All Topics</option><option disabled>Error loading topics</option>';
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
        practiceState.questions = questions.map(q => randomizeOptions(q));
        practiceState.currentIndex = 0;
        practiceState.answers = {};
        practiceState.checked = false;
        practiceState.results = { correct: 0, wrong: 0 };

        document.getElementById('practiceSetup').style.display = 'none';
        document.getElementById('practiceArea').style.display = 'block';
        renderQuestion();
    } catch (e) {
        alert('Failed to load questions: ' + e.message);
    }
}

function randomizeOptions(q) {
    const letters = ['A', 'B', 'C', 'D'];
    const original = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    const correctText = original[q.correct_answer];
    const shuffled = [...letters];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const newOpts = {};
    shuffled.forEach((l, idx) => { newOpts[l] = original[letters[idx]]; });
    let newCorrect = '';
    for (let [l, txt] of Object.entries(newOpts)) if (txt === correctText) newCorrect = l;
    return { ...q, option_a: newOpts.A, option_b: newOpts.B, option_c: newOpts.C, option_d: newOpts.D, correct_answer: newCorrect };
}

// ========== RENDER QUESTION ==========
function renderQuestion() {
    const q = practiceState.questions[practiceState.currentIndex];
    document.getElementById('currentSubject').innerText = q.subject;
    document.getElementById('progressText').innerText = `Question ${practiceState.currentIndex + 1}/${practiceState.questions.length}`;
    
    // Set question text as innerHTML (contains LaTeX)
    document.getElementById('questionText').innerHTML = q.question_text;

    const saved = practiceState.answers[q.id];
    let optsHtml = '';
    for (let l of ['A', 'B', 'C', 'D']) {
        const optText = q[`option_${l.toLowerCase()}`] || '';
        optsHtml += `<div class="practice-option ${saved === l ? 'selected' : ''}" onclick="selectOption('${q.id}','${l}')">
            <span class="option-letter">${l}</span> ${optText}
        </div>`;
    }
    document.getElementById('optionsContainer').innerHTML = optsHtml;

    // Reset feedback
    document.getElementById('feedbackBox').classList.remove('show');
    document.getElementById('checkBtn').disabled = !!saved;
    document.getElementById('nextBtn').disabled = true;

    // Trigger MathJax to re-render the new LaTeX content
    renderMath();
}

// ========== MATHJAX RENDER ==========
function renderMath() {
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch(err => console.warn('MathJax error:', err));
    } else {
        // If MathJax is still loading, wait for it
        if (window.MathJax) {
            MathJax.typesetPromise().catch(err => console.warn('MathJax error:', err));
        } else {
            // Fallback: try again after a short delay
            setTimeout(() => {
                if (window.MathJax && MathJax.typesetPromise) {
                    MathJax.typesetPromise().catch(err => console.warn('MathJax error:', err));
                }
            }, 500);
        }
    }
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

// ========== CHECK ANSWER ==========
async function checkAnswer() {
    const q = practiceState.questions[practiceState.currentIndex];
    const selected = practiceState.answers[q.id];
    if (!selected) return alert('Select an answer');
    practiceState.checked = true;
    document.getElementById('checkBtn').disabled = true;

    try {
        const res = await fetch(`${API_BASE}/api/practice/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId: q.id, selectedAnswer: selected })
        });
        const data = await res.json();
        const isCorrect = data.isCorrect;
        const correctAnswer = data.correctAnswer;
        const explanation = data.explanation || 'No explanation available.';

        // Visual feedback
        document.querySelectorAll('.practice-option').forEach(opt => {
            const letter = opt.querySelector('.option-letter')?.innerText;
            if (letter === correctAnswer) opt.classList.add('correct');
            else if (letter === selected && !isCorrect) opt.classList.add('wrong');
        });

        if (isCorrect) {
            practiceState.results.correct++;
            practiceState.streak++;
        } else {
            practiceState.results.wrong++;
            practiceState.streak = 0;
            showEncouragement();
        }

        const fb = document.getElementById('feedbackBox');
        document.getElementById('feedbackMessage').innerHTML = isCorrect
            ? '<div class="feedback-correct">✓ Correct!</div>'
            : `<div class="feedback-wrong">✗ Wrong. Correct answer is ${correctAnswer}.</div>`;
        document.getElementById('explanation').innerHTML = explanation; // may contain LaTeX
        fb.classList.add('show');
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('streakCount').innerText = practiceState.streak;

        // Re-render MathJax for the explanation if it contains LaTeX
        renderMath();

    } catch (err) {
        console.error(err);
        alert('Failed to check answer. Please try again.');
        document.getElementById('checkBtn').disabled = false;
    }
}

function nextQuestion() {
    if (practiceState.currentIndex < practiceState.questions.length - 1) {
        practiceState.currentIndex++;
        practiceState.checked = false;
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
    document.getElementById('summaryCorrect').innerText = correct;
    document.getElementById('summaryWrong').innerText = practiceState.results.wrong;
    const acc = Math.round((correct / total) * 100);
    document.getElementById('summaryAccuracy').innerText = acc + '%';
    document.getElementById('motivationalMessage').innerHTML = acc >= 80 ? 'Excellent!' : acc >= 50 ? 'Good effort!' : 'Keep practicing!';
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

function practiceAgain() { location.reload(); }
function sharePracticeResults() {
    const text = `I scored ${practiceState.results.correct}/${practiceState.questions.length} in JAMB practice!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}
function showEncouragement() { /* optional */ }

// Global exports
window.startPractice = startPractice;
window.selectOption = selectOption;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.practiceAgain = practiceAgain;
window.sharePracticeResults = sharePracticeResults;