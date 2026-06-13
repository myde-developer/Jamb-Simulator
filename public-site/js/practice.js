const API_BASE = 'https://jamb-simulator-api.onrender.com';
let practiceState = { questions: [], currentIndex: 0, answers: {}, checked: false, results: { correct: 0, wrong: 0 }, streak: 0 };
document.addEventListener('DOMContentLoaded', () => { loadPracticeStats(); loadSubjects(); 
});
async function loadSubjects() {
    try {
        const res = await fetch(`${API_BASE}/api/practice/subjects`);  // changed from /api/ai-questions/subjects
        const data = await res.json();
        const subjects = data.subjects;
        const select = document.getElementById('subjectSelect');
        select.innerHTML = '<option value="">Select Subject</option>';
        subjects.forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
        select.addEventListener('change', loadTopics);
    } catch(e) { console.error(e); }
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect').value;
    const topicSelect = document.getElementById('topicSelect');
    if(!subjectId) {
        topicSelect.disabled = true;
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/practice/topics/${subjectId}`);  // already exists, no change needed
        const data = await res.json();
        let opts = '<option value="all">All Topics</option>';
        if(data.topics) data.topics.forEach(t => opts += `<option value="${t}">${t}</option>`);
        topicSelect.innerHTML = opts;
        topicSelect.disabled = false;
    } catch(e) {
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        topicSelect.disabled = false;
    }
}
function loadPracticeStats() {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');
    document.getElementById('totalPracticed').innerText = stats.total;
    document.getElementById('correctRate').innerText = stats.total>0 ? Math.round((stats.correct/stats.total)*100)+'%' : '0%';
    document.getElementById('streakCount').innerText = stats.streak;
}
async function startPractice() {
    const subjectId = document.getElementById('subjectSelect').value;
    if(!subjectId) return alert('Select a subject');
    const topic = document.getElementById('topicSelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    const count = parseInt(document.getElementById('questionCount').value);
    try {
        const res = await fetch(`${API_BASE}/api/practice/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject_id: parseInt(subjectId), topic: topic !== 'all' ? topic : null, difficulty: difficulty !== 'all' ? difficulty : null, count })
        });
        let questions = await res.json();
        if(!questions.length) throw new Error('No questions');
        practiceState.questions = questions.map(q => randomizeOptions(q));
        practiceState.currentIndex = 0;
        practiceState.answers = {};
        practiceState.checked = false;
        practiceState.results = { correct:0, wrong:0 };
        document.getElementById('practiceSetup').style.display = 'none';
        document.getElementById('practiceArea').style.display = 'block';
        renderQuestion();
    } catch(e) { alert('Failed to load questions: '+e.message); }
}
function randomizeOptions(q) {
    const letters = ['A','B','C','D'];
    const original = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    const correctText = original[q.correct_answer];
    const shuffled = [...letters];
    for(let i=shuffled.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; }
    const newOpts = {};
    shuffled.forEach((l,idx)=> { newOpts[l] = original[letters[idx]]; });
    let newCorrect='';
    for(let [l,txt] of Object.entries(newOpts)) if(txt===correctText) newCorrect=l;
    return { ...q, option_a: newOpts.A, option_b: newOpts.B, option_c: newOpts.C, option_d: newOpts.D, correct_answer: newCorrect };
}
function renderQuestion() {
    const q = practiceState.questions[practiceState.currentIndex];
    document.getElementById('currentSubject').innerText = q.subject;
    document.getElementById('progressText').innerText = `Question ${practiceState.currentIndex+1}/${practiceState.questions.length}`;
    document.getElementById('questionText').innerHTML = q.question_text;
    const saved = practiceState.answers[q.id];
    let optsHtml = '';
    for(let l of ['A','B','C','D']) {
        optsHtml += `<div class="practice-option ${saved===l?'selected':''}" onclick="selectOption('${q.id}','${l}')"><span class="option-letter">${l}</span> ${q[`option_${l.toLowerCase()}`]}</div>`;
    }
    document.getElementById('optionsContainer').innerHTML = optsHtml;
    document.getElementById('feedbackBox').classList.remove('show');
    document.getElementById('checkBtn').disabled = !!saved;
    document.getElementById('nextBtn').disabled = true;
}
function selectOption(qid, letter) {
    if(practiceState.checked) return;
    practiceState.answers[qid] = letter;
    document.querySelectorAll('.practice-option').forEach(opt => { if(opt.querySelector('.option-letter')?.innerText===letter) opt.classList.add('selected'); else opt.classList.remove('selected'); });
    document.getElementById('checkBtn').disabled = false;
}
function checkAnswer() {
    const q = practiceState.questions[practiceState.currentIndex];
    const selected = practiceState.answers[q.id];
    if(!selected) return alert('Select an answer');
    practiceState.checked = true;
    const isCorrect = selected === q.correct_answer;
    document.querySelectorAll('.practice-option').forEach(opt => {
        const l = opt.querySelector('.option-letter')?.innerText;
        if(l === q.correct_answer) opt.classList.add('correct');
        else if(l === selected && !isCorrect) opt.classList.add('wrong');
    });
    if(isCorrect) { practiceState.results.correct++; practiceState.streak++; }
    else { practiceState.results.wrong++; practiceState.streak=0; showEncouragement(); }
    const fb = document.getElementById('feedbackBox');
    document.getElementById('feedbackMessage').innerHTML = isCorrect ? '<div class="feedback-correct">✓ Correct!</div>' : `<div class="feedback-wrong">✗ Wrong. Correct: ${q.correct_answer}. ${q[`option_${q.correct_answer.toLowerCase()}`]}</div>`;
    document.getElementById('explanation').innerText = q.explanation || 'No explanation';
    fb.classList.add('show');
    document.getElementById('checkBtn').disabled = true;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('streakCount').innerText = practiceState.streak;
}
function nextQuestion() {
    if(practiceState.currentIndex < practiceState.questions.length-1) {
        practiceState.currentIndex++;
        practiceState.checked = false;
        renderQuestion();
    } else showSummary();
}
function showSummary() {
    document.getElementById('practiceArea').style.display = 'none';
    document.getElementById('practiceSummary').style.display = 'block';
    const correct = practiceState.results.correct;
    const total = practiceState.questions.length;
    document.getElementById('summaryCorrect').innerText = correct;
    document.getElementById('summaryWrong').innerText = practiceState.results.wrong;
    const acc = Math.round((correct/total)*100);
    document.getElementById('summaryAccuracy').innerText = acc+'%';
    document.getElementById('motivationalMessage').innerHTML = acc>=80 ? 'Excellent!' : acc>=50 ? 'Good effort!' : 'Keep practicing!';
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
function reviewMistakes() { alert('Review feature coming soon'); }
function sharePracticeResults() { const text = `I scored ${practiceState.results.correct}/${practiceState.questions.length} in JAMB practice!`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`); }
function showEncouragement() { /* optional */ }
window.startPractice = startPractice; window.selectOption = selectOption; window.checkAnswer = checkAnswer; window.nextQuestion = nextQuestion; window.practiceAgain = practiceAgain; window.reviewMistakes = reviewMistakes; window.sharePracticeResults = sharePracticeResults;