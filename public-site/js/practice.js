// js/practice.js – final version
const API_BASE = 'https://jamb-simulator-api.onrender.com';

let practiceState = {
    questions: [],
    currentIndex: 0,
    answers: {},        // { questionId: selectedAnswer }
    results: null,      // to be filled after grading
    count: 0
};

// Stats (local storage)
let practiceStats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');

document.addEventListener('DOMContentLoaded', () => {
    loadPracticeStats();
    loadSubjects();
    // Remove any old event listeners for check button
    document.getElementById('checkBtn')?.removeEventListener('click', checkAnswer);
    document.getElementById('nextBtn')?.addEventListener('click', nextQuestion);
    document.getElementById('practiceAgain')?.addEventListener('click', practiceAgain);
    document.getElementById('reviewMistakes')?.addEventListener('click', reviewMistakes);
    document.getElementById('sharePracticeResults')?.addEventListener('click', sharePracticeResults);
});

// ========== LOAD SUBJECTS & TOPICS ==========
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
    } catch(e) {
        console.error(e);
        select.innerHTML = '<option value="">Error loading subjects</option>';
    }
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect').value;
    const topicSelect = document.getElementById('topicSelect');
    if(!subjectId) {
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
        if(data.topics && data.topics.length) {
            data.topics.forEach(t => opts += `<option value="${t}">${t}</option>`);
        }
        topicSelect.innerHTML = opts;
        topicSelect.disabled = false;
    } catch(e) {
        console.error(e);
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        topicSelect.disabled = false;
    }
}

function loadPracticeStats() {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');
    document.getElementById('totalPracticed').innerText = stats.total;
    document.getElementById('correctRate').innerText = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) + '%' : '0%';
    document.getElementById('streakCount').innerText = stats.streak;
    practiceStats = stats;
}

async function startPractice() {
    const subjectId = document.getElementById('subjectSelect').value;
    if(!subjectId) return alert('Select a subject');
    const topic = document.getElementById('topicSelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    const count = parseInt(document.getElementById('questionCount').value) || 10;

    try {
        const res = await fetch(`${API_BASE}/api/practice/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject_id: parseInt(subjectId), topic: topic !== 'all' ? topic : null, difficulty: difficulty !== 'all' ? difficulty : null, count })
        });
        let questions = await res.json();
        if(!questions.length) throw new Error('No questions');
        practiceState.questions = questions;
        practiceState.currentIndex = 0;
        practiceState.answers = {};
        practiceState.results = null;

        document.getElementById('practiceSetup').style.display = 'none';
        document.getElementById('practiceArea').style.display = 'block';
        renderQuestion();
    } catch(e) {
        alert('Failed to load questions: '+e.message);
    }
}

function renderQuestion() {
    const q = practiceState.questions[practiceState.currentIndex];
    document.getElementById('currentSubject').innerText = q.subject;
    document.getElementById('progressText').innerText = `Question ${practiceState.currentIndex+1}/${practiceState.questions.length}`;
    document.getElementById('questionText').innerHTML = q.question_text;
    const saved = practiceState.answers[q.id];
    let optsHtml = '';
    for(let l of ['A','B','C','D']) {
        optsHtml += `<div class="practice-option ${saved === l ? 'selected' : ''}" onclick="selectOption('${q.id}','${l}')">
                        <span class="option-letter">${l}</span> ${q[`option_${l.toLowerCase()}`]}
                    </div>`;
    }
    document.getElementById('optionsContainer').innerHTML = optsHtml;
    // No check button – only Next
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('checkBtn').style.display = 'none'; // hide check button
}

function selectOption(qid, letter) {
    practiceState.answers[qid] = letter;
    // Update UI selection highlight
    document.querySelectorAll('.practice-option').forEach(opt => {
        const l = opt.querySelector('.option-letter')?.innerText;
        if(l === letter) opt.classList.add('selected');
        else opt.classList.remove('selected');
    });
}

function nextQuestion() {
    if(practiceState.currentIndex < practiceState.questions.length - 1) {
        practiceState.currentIndex++;
        renderQuestion();
    } else {
        // End of session – grade all answers
        gradeAndShowSummary();
    }
}

async function gradeAndShowSummary() {
    const answersArray = Object.entries(practiceState.answers).map(([qid, ans]) => ({
        questionId: parseInt(qid),
        selectedAnswer: ans
    }));
    if(answersArray.length === 0) {
        // No answers given – prompt user to answer at least one?
        alert('Please answer at least one question before finishing.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/practice/grade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: answersArray })
        });
        const data = await response.json();
        if(data.success) {
            practiceState.results = data.results;
            displayPracticeSummary();
            // Save stats to localStorage
            const correctCount = practiceState.results.filter(r => r.isCorrect).length;
            const total = practiceState.results.length;
            practiceStats.total += total;
            practiceStats.correct += correctCount;
            // Update streak: if all correct in this session, increment; else reset? We'll keep simple: add correct/total
            // For now, just update stats.
            practiceStats.streak = (correctCount === total) ? practiceStats.streak + 1 : 0;
            localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
            loadPracticeStats();
        } else {
            alert('Failed to grade answers. Please try again.');
        }
    } catch(err) {
        console.error(err);
        alert('Network error. Please try again.');
    }
}

function displayPracticeSummary() {
    document.getElementById('practiceArea').style.display = 'none';
    document.getElementById('practiceSummary').style.display = 'block';
    const correct = practiceState.results.filter(r => r.isCorrect).length;
    const total = practiceState.questions.length;
    document.getElementById('summaryCorrect').innerText = correct;
    document.getElementById('summaryWrong').innerText = total - correct;
    const accuracy = Math.round((correct / total) * 100);
    document.getElementById('summaryAccuracy').innerText = accuracy + '%';

    let reviewHtml = '<div class="review-list">';
    practiceState.results.forEach((res, idx) => {
        const q = practiceState.questions.find(q => q.id === res.questionId);
        if(!q) return;
        reviewHtml += `
            <div class="review-item ${res.isCorrect ? 'correct' : 'incorrect'}">
                <div class="review-question"><strong>Q${idx+1}:</strong> ${q.question_text}</div>
                <div class="review-answer">Your answer: ${res.selectedAnswer}</div>
                <div class="review-correct">Correct answer: ${res.correct_answer}</div>
                <div class="review-explanation">Explanation: ${res.explanation}</div>
            </div>
        `;
    });
    reviewHtml += '</div>';
    document.getElementById('reviewQuestions').innerHTML = reviewHtml;
}

function practiceAgain() {
    location.reload();
}
function sharePracticeResults() {
    const text = `I scored ${practiceState.results.filter(r=>r.isCorrect).length}/${practiceState.questions.length} in JAMB practice!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

// Make functions global
window.startPractice = startPractice;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.practiceAgain = practiceAgain;
window.sharePracticeResults = sharePracticeResults;