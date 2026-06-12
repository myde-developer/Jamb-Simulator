const API_BASE = 'https://jamb-simulator-api.onrender.com';

let examState = {
    questions: [], subjectQuestions: {}, currentSubject: null,
    subjectIndices: {}, answers: {}, timeRemaining: 7200,
    timerInterval: null, subjects: [], examId: null, startTime: null,
    subjectOrder: [], subjectConfigs: {}, isReady: false
};

let examCalculator = { currentInput: '', previousInput: '', operator: null, memory: 0, shouldReset: false, lastResult: null };
let dragState = { isDragging: false, currentX: 0, currentY: 0, initialX: 0, initialY: 0, xOffset: 0, yOffset: 0 };

document.addEventListener('DOMContentLoaded', () => {
    loadExamData();
    setupEventListeners();
});

async function loadExamData() {
    const selectedSubjects = JSON.parse(localStorage.getItem('jambSelectedSubjects'));
    if (!selectedSubjects || selectedSubjects.length === 0) {
        alert('No subjects selected. Please go back and select subjects.');
        window.location.href = '/home.html';
        return;
    }
    examState.subjects = selectedSubjects;
    examState.subjectOrder = selectedSubjects.map(s => s.name);
    examState.startTime = new Date().toISOString();
    selectedSubjects.forEach(subject => examState.subjectIndices[subject.name] = 0);
    examState.currentSubject = selectedSubjects[0].name;
    renderSubjectTabs(selectedSubjects);
    renderSubjectFilter(selectedSubjects);
    await fetchExamQuestions(selectedSubjects);
}

async function fetchExamQuestions(subjects) {
    try {
        const response = await fetch(`${API_BASE}/api/exam/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjects: subjects.map(s => ({ id: s.id, name: s.name })) })
        });
        if (!response.ok) throw new Error('Failed to fetch questions');
        let questions = await response.json();
        questions = questions.map(q => randomizeQuestionOptions(q));
        examState.subjectQuestions = {};
        subjects.forEach(subject => {
            const subjectQuestions = questions.filter(q => q.subject === subject.name);
            const targetCount = subject.name === 'Use of English' ? 60 : 40;
            examState.subjectQuestions[subject.name] = subjectQuestions.slice(0, targetCount);
        });
        examState.questions = questions;
        examState.examId = 'EXAM_' + Date.now();
        document.getElementById('skeletonLoader').style.display = 'none';
        document.getElementById('questionContainer').style.display = 'block';
        renderSubjectQuestion(examState.currentSubject);
        renderPalette();
        examState.isReady = true;
        startTimer();
    } catch (error) {
        document.getElementById('skeletonLoader').innerHTML = `<div class="error-message">❌ Failed to load questions. <button onclick="location.reload()">Retry</button></div>`;
    }
}

function randomizeQuestionOptions(question) {
    const letters = ['A','B','C','D'];
    const original = { A: question.option_a, B: question.option_b, C: question.option_c, D: question.option_d };
    const correctText = original[question.correct_answer];
    const shuffled = [...letters];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const newOpts = {};
    shuffled.forEach((newLetter, idx) => { newOpts[newLetter] = original[letters[idx]]; });
    let newCorrect = '';
    for (let [l, txt] of Object.entries(newOpts)) if (txt === correctText) newCorrect = l;
    return { ...question, option_a: newOpts.A, option_b: newOpts.B, option_c: newOpts.C, option_d: newOpts.D, correct_answer: newCorrect };
}

function renderSubjectTabs(subjects) {
    const container = document.getElementById('subjectTabs');
    container.innerHTML = subjects.map((s, i) => `<button class="subject-tab ${i===0?'active':''}" onclick="switchSubject('${s.name}')">${s.name}</button>`).join('');
}
function renderSubjectFilter(subjects) {
    const container = document.getElementById('subjectFilter');
    container.innerHTML = `<button class="filter-btn active" onclick="filterPalette('all')">All</button>` + subjects.map(s => `<button class="filter-btn" onclick="filterPalette('${s.name}')">${s.name}</button>`).join('');
}
function renderSubjectQuestion(subjectName) {
    const questions = examState.subjectQuestions[subjectName];
    if (!questions) return;
    const idx = examState.subjectIndices[subjectName];
    renderQuestion(questions[idx], subjectName, idx+1, questions.length);
}
function renderQuestion(q, subject, num, total) {
    const container = document.getElementById('questionContainer');
    const saved = examState.answers[q.id];
    container.innerHTML = `
        <div class="question-number" style="color:var(--gray-600); margin-bottom:10px;">Question ${num} of ${total}</div>
        <div class="question-subject" style="display:inline-block; background:var(--gray-100); padding:4px 12px; border-radius:20px; margin-bottom:15px;">${subject}</div>
        <div class="question-text">${q.question_text}</div>
        <div class="options">
            ${['A','B','C','D'].map(l => `
                <div class="option ${saved===l?'selected':''}" onclick="selectAnswer('${q.id}','${l}')">
                    <span class="option-letter">${l}</span>
                    <span class="option-text">${q[`option_${l.toLowerCase()}`]}</span>
                </div>
            `).join('')}
        </div>
    `;
    updateNavButtons(subject);
    updateProgress();
    highlightCurrentInPalette(q.id);
}
function selectAnswer(qid, letter) {
    examState.answers[qid] = letter;
    document.querySelectorAll('.option').forEach(opt => {
        const l = opt.querySelector('.option-letter')?.textContent;
        if (l === letter) opt.classList.add('selected');
        else opt.classList.remove('selected');
    });
    updatePaletteItem(qid);
}
function renderPalette() {
    const all = [];
    for (let sub in examState.subjectQuestions) {
        examState.subjectQuestions[sub].forEach((q, i) => {
            all.push({ ...q, subjectDisplay: sub.substring(0,3).toUpperCase(), subjectName: sub, idx: i+1 });
        });
    }
    let display = all;
    if (examState.currentSubject && examState.currentSubject !== 'all') {
        display = all.filter(q => q.subjectName === examState.currentSubject);
    }
    const grid = document.getElementById('paletteGrid');
    grid.innerHTML = display.map(q => {
        const answered = examState.answers[q.id] ? 'answered' : 'unanswered';
        const isCurrent = examState.currentSubject === q.subjectName && examState.subjectIndices[q.subjectName] === q.idx-1;
        return `<div class="palette-item ${answered} ${isCurrent?'current':''}" onclick="jumpToQuestion('${q.subjectName}',${q.idx-1})" title="${q.subjectName} Q${q.idx}">${q.subjectDisplay} ${q.idx}</div>`;
    }).join('');
}
function updatePaletteItem(qid) {
    for (let sub in examState.subjectQuestions) {
        const idx = examState.subjectQuestions[sub].findIndex(q => q.id === qid);
        if (idx !== -1) {
            const items = document.querySelectorAll('.palette-item');
            for (let item of items) {
                if (item.textContent.trim().endsWith(` ${idx+1}`)) item.classList.add('answered');
            }
            break;
        }
    }
}
function highlightCurrentInPalette(qid) {
    for (let sub in examState.subjectQuestions) {
        const idx = examState.subjectQuestions[sub].findIndex(q => q.id === qid);
        if (idx !== -1) {
            const items = document.querySelectorAll('.palette-item');
            items.forEach(item => {
                if (item.textContent.trim().endsWith(` ${idx+1}`)) item.classList.add('current');
                else item.classList.remove('current');
            });
            break;
        }
    }
}
function jumpToQuestion(subject, index) {
    examState.currentSubject = subject;
    examState.subjectIndices[subject] = index;
    renderSubjectQuestion(subject);
    renderPalette();
}
function updateNavButtons(subject) {
    const idx = examState.subjectIndices[subject];
    const total = examState.subjectQuestions[subject].length;
    const isLastSubject = subject === examState.subjectOrder[examState.subjectOrder.length-1];
    const isLast = idx === total-1;
    document.getElementById('prevBtn').disabled = idx === 0;
    if (isLastSubject && isLast) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'block';
    } else {
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'none';
    }
}
function nextQuestion() {
    let sub = examState.currentSubject;
    let idx = examState.subjectIndices[sub];
    if (idx < examState.subjectQuestions[sub].length-1) {
        examState.subjectIndices[sub] = idx+1;
        renderSubjectQuestion(sub);
    } else {
        let subIdx = examState.subjectOrder.indexOf(sub);
        if (subIdx < examState.subjectOrder.length-1) {
            let nextSub = examState.subjectOrder[subIdx+1];
            examState.currentSubject = nextSub;
            examState.subjectIndices[nextSub] = 0;
            renderSubjectQuestion(nextSub);
            document.querySelectorAll('.subject-tab').forEach((tab,i) => { if(examState.subjects[i].name===nextSub) tab.classList.add('active'); else tab.classList.remove('active'); });
        }
    }
    renderPalette();
}
function prevQuestion() {
    let sub = examState.currentSubject;
    let idx = examState.subjectIndices[sub];
    if (idx > 0) {
        examState.subjectIndices[sub] = idx-1;
        renderSubjectQuestion(sub);
    } else {
        let subIdx = examState.subjectOrder.indexOf(sub);
        if (subIdx > 0) {
            let prevSub = examState.subjectOrder[subIdx-1];
            examState.currentSubject = prevSub;
            examState.subjectIndices[prevSub] = examState.subjectQuestions[prevSub].length-1;
            renderSubjectQuestion(prevSub);
            document.querySelectorAll('.subject-tab').forEach((tab,i) => { if(examState.subjects[i].name===prevSub) tab.classList.add('active'); else tab.classList.remove('active'); });
        }
    }
    renderPalette();
}
function updateProgress() {
    const total = Object.values(examState.subjectQuestions).reduce((s,a)=>s+a.length,0);
    const answered = Object.keys(examState.answers).length;
    document.getElementById('progressFill').style.width = (answered/total*100)+'%';
}
function startTimer() {
    if (!examState.isReady || examState.timerInterval) return;
    examState.timerInterval = setInterval(() => {
        if (examState.timeRemaining <= 0) { clearInterval(examState.timerInterval); submitExam(); return; }
        examState.timeRemaining--;
        const h = Math.floor(examState.timeRemaining/3600);
        const m = Math.floor((examState.timeRemaining%3600)/60);
        const s = examState.timeRemaining%60;
        const timerEl = document.getElementById('timer');
        timerEl.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        if (examState.timeRemaining < 300) timerEl.className = 'timer danger';
        else if (examState.timeRemaining < 600) timerEl.className = 'timer warning';
        else timerEl.className = 'timer';
    }, 1000);
}
function submitExam() {
    const total = Object.values(examState.subjectQuestions).reduce((s,a)=>s+a.length,0);
    const answered = Object.keys(examState.answers).length;
    if (answered < total && !confirm(`You answered ${answered}/${total}. Submit anyway?`)) return;
    if (examState.timerInterval) clearInterval(examState.timerInterval);
    const results = calculateScores();
    sessionStorage.setItem('pendingExamResults', JSON.stringify({
        subjectQuestions: examState.subjectQuestions,
        answers: examState.answers,
        scores: results,
        subjects: examState.subjects,
        date: new Date().toISOString(),
        examId: examState.examId
    }));
    window.location.href = '/auth.html?pending=results';
}
function calculateScores() {
    let scores = { subjectScores: {}, total: 0, percentage: 0 };
    for (let sub in examState.subjectQuestions) {
        let correct = 0;
        examState.subjectQuestions[sub].forEach(q => { if (examState.answers[q.id] === q.correct_answer) correct++; });
        scores.subjectScores[sub] = { correct, total: examState.subjectQuestions[sub].length };
        if (sub === 'Use of English') scores.total += correct * 1.67;
        else scores.total += correct * 2.5;
    }
    scores.percentage = Math.round((scores.total/400)*100);
    return scores;
}
function setupEventListeners() {
    document.getElementById('prevBtn').addEventListener('click', prevQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitBtn').addEventListener('click', submitExam);
}
function renderCalculator() {
    const container = document.getElementById('examCalculator');
    if (!container) return;
    container.innerHTML = `
        <div class="calc-display"><div class="calc-expression" id="calcExpression"></div><div class="calc-result" id="calcResult">0</div></div>
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-bottom:8px;">
            <button class="calc-btn operator" onclick="calculatorMemory('clear')">MC</button><button class="calc-btn operator" onclick="calculatorMemory('recall')">MR</button>
            <button class="calc-btn operator" onclick="calculatorMemory('add')">M+</button><button class="calc-btn operator" onclick="calculatorMemory('subtract')">M-</button>
        </div>
        <div class="calc-grid">
            <button class="calc-btn clear" onclick="calculatorClear()">C</button><button class="calc-btn operator" onclick="calculatorAppend('%')">%</button>
            <button class="calc-btn operator" onclick="calculatorOperator('/')">÷</button><button class="calc-btn operator" onclick="calculatorBackspace()">⌫</button>
            <button class="calc-btn number" onclick="calculatorAppend('7')">7</button><button class="calc-btn number" onclick="calculatorAppend('8')">8</button>
            <button class="calc-btn number" onclick="calculatorAppend('9')">9</button><button class="calc-btn operator" onclick="calculatorOperator('*')">×</button>
            <button class="calc-btn number" onclick="calculatorAppend('4')">4</button><button class="calc-btn number" onclick="calculatorAppend('5')">5</button>
            <button class="calc-btn number" onclick="calculatorAppend('6')">6</button><button class="calc-btn operator" onclick="calculatorOperator('-')">−</button>
            <button class="calc-btn number" onclick="calculatorAppend('1')">1</button><button class="calc-btn number" onclick="calculatorAppend('2')">2</button>
            <button class="calc-btn number" onclick="calculatorAppend('3')">3</button><button class="calc-btn operator" onclick="calculatorOperator('+')">+</button>
            <button class="calc-btn number" onclick="calculatorAppend('0')">0</button><button class="calc-btn number" onclick="calculatorAppend('.')">.</button>
            <button class="calc-btn equals" onclick="calculatorCalculate()" style="grid-column:span 2;">=</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:12px;">
            <button class="calc-btn operator" onclick="calculatorScientific('sqrt')">√</button><button class="calc-btn operator" onclick="calculatorScientific('square')">x²</button>
            <button class="calc-btn operator" onclick="calculatorScientific('sin')">sin</button><button class="calc-btn operator" onclick="calculatorScientific('cos')">cos</button>
        </div>
    `;
    updateCalculatorDisplay();
}
function calculatorAppend(value) {
    if (examCalculator.shouldReset) { examCalculator.currentInput = ''; examCalculator.shouldReset = false; }
    if (value === '.') { if (examCalculator.currentInput.includes('.')) return; if (examCalculator.currentInput === '') examCalculator.currentInput = '0.'; }
    examCalculator.currentInput += value;
    updateCalculatorDisplay();
}
function calculatorOperator(op) {
    if (examCalculator.operator && examCalculator.previousInput !== '' && examCalculator.currentInput !== '') calculatorCalculate();
    examCalculator.operator = op;
    if (examCalculator.currentInput !== '') { examCalculator.previousInput = examCalculator.currentInput; examCalculator.currentInput = ''; }
    else if (examCalculator.lastResult !== null) examCalculator.previousInput = examCalculator.lastResult.toString();
    examCalculator.shouldReset = false;
    updateCalculatorDisplay();
}
function calculatorCalculate() {
    if (!examCalculator.operator || examCalculator.previousInput === '') return;
    let currentValue = (examCalculator.currentInput === '') ? (examCalculator.lastResult !== null ? examCalculator.lastResult : parseFloat(examCalculator.previousInput)) : parseFloat(examCalculator.currentInput);
    const prevValue = parseFloat(examCalculator.previousInput);
    if (isNaN(prevValue) || isNaN(currentValue)) { alert('Invalid input'); calculatorClear(); return; }
    let result;
    switch(examCalculator.operator) {
        case '+': result = prevValue + currentValue; break;
        case '-': result = prevValue - currentValue; break;
        case '*': result = prevValue * currentValue; break;
        case '/': if (currentValue === 0) { alert('Cannot divide by zero!'); return; } result = prevValue / currentValue; break;
        case '%': result = prevValue % currentValue; break;
        default: return;
    }
    result = Math.round(result * 100000000) / 100000000;
    examCalculator.currentInput = result.toString();
    examCalculator.lastResult = result;
    examCalculator.operator = null;
    examCalculator.previousInput = '';
    examCalculator.shouldReset = true;
    updateCalculatorDisplay();
}
function calculatorScientific(func) {
    if (examCalculator.currentInput === '') { if (examCalculator.lastResult !== null) examCalculator.currentInput = examCalculator.lastResult.toString(); else return; }
    let value = parseFloat(examCalculator.currentInput);
    if (isNaN(value)) return;
    let result;
    switch(func) {
        case 'sqrt': if (value < 0) { alert('Cannot sqrt negative'); return; } result = Math.sqrt(value); break;
        case 'square': result = Math.pow(value,2); break;
        case 'sin': result = Math.sin(value * Math.PI / 180); break;
        case 'cos': result = Math.cos(value * Math.PI / 180); break;
        default: return;
    }
    result = Math.round(result * 100000000) / 100000000;
    examCalculator.currentInput = result.toString();
    examCalculator.lastResult = result;
    examCalculator.shouldReset = true;
    examCalculator.operator = null;
    examCalculator.previousInput = '';
    updateCalculatorDisplay();
}
function calculatorMemory(action) {
    let currentValue = (examCalculator.currentInput !== '') ? parseFloat(examCalculator.currentInput) : (examCalculator.lastResult !== null ? examCalculator.lastResult : 0);
    if (isNaN(currentValue)) currentValue = 0;
    switch(action) {
        case 'clear': examCalculator.memory = 0; break;
        case 'recall': examCalculator.currentInput = examCalculator.memory.toString(); examCalculator.shouldReset = true; examCalculator.operator = null; examCalculator.previousInput = ''; updateCalculatorDisplay(); break;
        case 'add': examCalculator.memory += currentValue; break;
        case 'subtract': examCalculator.memory -= currentValue; break;
    }
}

function calculatorClear() { examCalculator.currentInput = ''; examCalculator.previousInput = ''; examCalculator.operator = null; examCalculator.shouldReset = false; updateCalculatorDisplay(); }
function calculatorBackspace() { if (examCalculator.shouldReset) return; examCalculator.currentInput = examCalculator.currentInput.slice(0,-1); updateCalculatorDisplay(); }
function updateCalculatorDisplay() {
    const expr = document.getElementById('calcExpression');
    const res = document.getElementById('calcResult');
    if (expr) { if (examCalculator.operator && examCalculator.previousInput) expr.textContent = `${examCalculator.previousInput} ${examCalculator.operator}`; else expr.textContent = ''; }
    if (res) { if (examCalculator.currentInput === '') res.textContent = (examCalculator.lastResult !== null && !examCalculator.operator) ? examCalculator.lastResult : '0'; else res.textContent = examCalculator.currentInput; }
}
function toggleCalculator(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const modal = document.getElementById('calculatorModal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'block';
        renderCalculator();
        setTimeout(() => initDraggableCalculator(), 50);
    } else { modal.style.display = 'none'; }
}
function handleModalClick(event) { if (event.target === document.getElementById('calculatorModal')) toggleCalculator(event); }
function initDraggableCalculator() {
    const content = document.getElementById('calculatorContent');
    const header = document.getElementById('calculatorHeader');
    if (!content || !header) return;
    content.style.transform = 'translate(-50%, -50%)';
    dragState.xOffset = 0; dragState.yOffset = 0;
    header.removeEventListener('mousedown', dragMouseDown);
    header.removeEventListener('touchstart', dragTouchStart);
    header.addEventListener('mousedown', dragMouseDown);
    header.addEventListener('touchstart', dragTouchStart, { passive: false });
}
function dragMouseDown(e) { e.preventDefault(); e.stopPropagation(); const content = document.getElementById('calculatorContent'); const transform = window.getComputedStyle(content).transform; const matrix = new DOMMatrix(transform); dragState.xOffset = matrix.m41; dragState.yOffset = matrix.m42; dragState.initialX = e.clientX - dragState.xOffset; dragState.initialY = e.clientY - dragState.yOffset; dragState.isDragging = true; document.addEventListener('mousemove', dragMouseMove); document.addEventListener('mouseup', dragMouseUp); content.style.cursor = 'grabbing'; content.style.transition = 'none'; }
function dragTouchStart(e) { e.preventDefault(); e.stopPropagation(); const touch = e.touches[0]; const content = document.getElementById('calculatorContent'); const transform = window.getComputedStyle(content).transform; const matrix = new DOMMatrix(transform); dragState.xOffset = matrix.m41; dragState.yOffset = matrix.m42; dragState.initialX = touch.clientX - dragState.xOffset; dragState.initialY = touch.clientY - dragState.yOffset; dragState.isDragging = true; document.addEventListener('touchmove', dragTouchMove, { passive: false }); document.addEventListener('touchend', dragTouchEnd); document.addEventListener('touchcancel', dragTouchEnd); content.style.cursor = 'grabbing'; content.style.transition = 'none'; }
function dragMouseMove(e) { if (!dragState.isDragging) return; e.preventDefault(); dragState.currentX = e.clientX - dragState.initialX; dragState.currentY = e.clientY - dragState.initialY; setTranslate(dragState.currentX, dragState.currentY, document.getElementById('calculatorContent')); }
function dragTouchMove(e) { if (!dragState.isDragging) return; e.preventDefault(); const touch = e.touches[0]; dragState.currentX = touch.clientX - dragState.initialX; dragState.currentY = touch.clientY - dragState.initialY; setTranslate(dragState.currentX, dragState.currentY, document.getElementById('calculatorContent')); }
function dragMouseUp(e) { dragState.isDragging = false; document.removeEventListener('mousemove', dragMouseMove); document.removeEventListener('mouseup', dragMouseUp); const content = document.getElementById('calculatorContent'); if (content) { content.style.cursor = 'grab'; content.style.transition = 'box-shadow 0.2s'; } }
function dragTouchEnd(e) { dragState.isDragging = false; document.removeEventListener('touchmove', dragTouchMove); document.removeEventListener('touchend', dragTouchEnd); document.removeEventListener('touchcancel', dragTouchEnd); const content = document.getElementById('calculatorContent'); if (content) { content.style.cursor = 'grab'; content.style.transition = 'box-shadow 0.2s'; } }
function setTranslate(xPos, yPos, el) { if (!el) return; const rect = el.getBoundingClientRect(); const maxX = window.innerWidth - rect.width; const maxY = window.innerHeight - rect.height; xPos = Math.min(Math.max(xPos, 10), maxX - 10); yPos = Math.min(Math.max(yPos, 10), maxY - 10); el.style.transform = `translate(${xPos}px, ${yPos}px)`; }

window.selectAnswer = selectAnswer; window.jumpToQuestion = jumpToQuestion; window.toggleCalculator = toggleCalculator; window.handleModalClick = handleModalClick;
window.calculatorAppend = calculatorAppend; window.calculatorOperator = calculatorOperator; window.calculatorCalculate = calculatorCalculate;
window.calculatorClear = calculatorClear; window.calculatorBackspace = calculatorBackspace; window.calculatorMemory = calculatorMemory;
window.calculatorScientific = calculatorScientific; window.switchSubject = (name) => { examState.currentSubject = name; renderSubjectQuestion(name); renderPalette(); };
window.filterPalette = (sub) => { examState.currentSubject = sub === 'all' ? null : sub; renderPalette(); };