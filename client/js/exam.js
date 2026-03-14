// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

// Exam state
let examState = {
    questions: [],
    currentIndex: 0,
    answers: {},
    timeRemaining: 7200,
    timerInterval: null,
    subjects: [],
    examId: null,
    startTime: null
};

// Calculator state
let examCalculator = {
    currentInput: '',
    previousInput: '',
    operator: null,
    memory: 0,
    shouldReset: false
};

// Initialize
(function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/auth.html');
        return;
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    loadExamData();
    setupEventListeners();
    startTimer();
    displayUserInfo();
});

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) {
        userInfo.textContent = `Welcome, ${user.full_name}`;
    }
}

function loadExamData() {
    const selectedSubjects = JSON.parse(localStorage.getItem('jambSelectedSubjects'));
    
    if (!selectedSubjects || selectedSubjects.length === 0) {
        alert('No subjects selected. Please go back and select subjects.');
        window.location.href = '/home.html';
        return;
    }
    
    examState.subjects = selectedSubjects;
    examState.startTime = new Date().toISOString();
    
    displaySubjectsBadge(selectedSubjects);
    fetchExamQuestions(selectedSubjects);
}

function displaySubjectsBadge(subjects) {
    const badgeContainer = document.getElementById('subjectsBadge');
    if (!badgeContainer) return;
    
    badgeContainer.innerHTML = subjects.map(s => 
        `<span class="subject-tag">${s.code}</span>`
    ).join('');
}

async function fetchExamQuestions(subjects) {
    try {
        document.getElementById('questionContainer').innerHTML = 
            '<div style="text-align: center; padding: 50px;">Loading 180 questions...</div>';
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/exam/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subjects: subjects.map(s => ({ id: s.id, name: s.name }))
            })
        });
        
        if (!response.ok) throw new Error('Failed to fetch questions');
        
        const questions = await response.json();
        examState.questions = questions;
        examState.examId = generateExamId();
        
        renderQuestion(0);
        renderPalette();
        
    } catch (error) {
        document.getElementById('questionContainer').innerHTML = `
            <div style="text-align: center; padding: 50px; color: #e74c3c;">
                ❌ Failed to load questions. Please try again.
                <br><br>
                <button onclick="location.reload()" style="padding: 10px 20px;">Retry</button>
            </div>
        `;
    }
}

function renderQuestion(index) {
    const question = examState.questions[index];
    if (!question) return;
    
    const container = document.getElementById('questionContainer');
    const savedAnswer = examState.answers[question.id];
    
    container.innerHTML = `
        <div class="question-number">Question ${index + 1} of ${examState.questions.length}</div>
        <div class="question-subject">${question.subject}</div>
        <div class="question-text">${question.question}</div>
        <div class="options">
            ${['A', 'B', 'C', 'D'].map(letter => `
                <div class="option ${savedAnswer === letter ? 'selected' : ''}" 
                     onclick="selectAnswer('${question.id}', '${letter}')">
                    <span class="option-letter">${letter}</span>
                    <span class="option-text">${question.options[letter]}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    updateNavButtons();
    updateProgress();
    highlightCurrentInPalette(index);
}

function selectAnswer(questionId, answer) {
    examState.answers[questionId] = answer;
    
    document.querySelectorAll('.option').forEach(opt => {
        const letter = opt.querySelector('.option-letter').textContent;
        if (letter === answer) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    updatePaletteItem(questionId);
}

function renderPalette() {
    const palette = document.getElementById('paletteGrid');
    if (!palette) return;
    
    palette.innerHTML = examState.questions.map((q, index) => {
        const answered = examState.answers[q.id] ? 'answered' : 'unanswered';
        const current = index === examState.currentIndex ? 'current' : '';
        return `
            <div class="palette-item ${answered} ${current}" onclick="jumpToQuestion(${index})">
                ${index + 1}
            </div>
        `;
    }).join('');
}

function updatePaletteItem(questionId) {
    const index = examState.questions.findIndex(q => q.id === questionId);
    const paletteItems = document.querySelectorAll('.palette-item');
    if (paletteItems[index]) {
        paletteItems[index].className = 'palette-item answered';
    }
}

function highlightCurrentInPalette(index) {
    document.querySelectorAll('.palette-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('current');
        } else {
            item.classList.remove('current');
        }
    });
}

function jumpToQuestion(index) {
    examState.currentIndex = index;
    renderQuestion(index);
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!prevBtn || !nextBtn || !submitBtn) return;
    
    prevBtn.disabled = examState.currentIndex === 0;
    
    if (examState.currentIndex === examState.questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function updateProgress() {
    const answeredCount = Object.keys(examState.answers).length;
    const progress = (answeredCount / examState.questions.length) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
}

function startTimer() {
    examState.timerInterval = setInterval(() => {
        examState.timeRemaining--;
        
        if (examState.timeRemaining <= 0) {
            submitExam();
            return;
        }
        
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(examState.timeRemaining / 3600);
    const minutes = Math.floor((examState.timeRemaining % 3600) / 60);
    const seconds = examState.timeRemaining % 60;
    
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (examState.timeRemaining < 300) {
        timerElement.className = 'timer danger';
    } else if (examState.timeRemaining < 600) {
        timerElement.className = 'timer warning';
    }
}

function setupEventListeners() {
    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (examState.currentIndex > 0) {
            examState.currentIndex--;
            renderQuestion(examState.currentIndex);
        }
    });
    
    document.getElementById('nextBtn')?.addEventListener('click', () => {
        if (examState.currentIndex < examState.questions.length - 1) {
            examState.currentIndex++;
            renderQuestion(examState.currentIndex);
        }
    });
    
    document.getElementById('submitBtn')?.addEventListener('click', submitExam);
}

function submitExam() {
    if (Object.keys(examState.answers).length < examState.questions.length) {
        if (!confirm(`You have answered ${Object.keys(examState.answers).length} out of ${examState.questions.length} questions. Submit anyway?`)) {
            return;
        }
    }
    
    clearInterval(examState.timerInterval);
    
    const results = calculateJAMBScores();
    
    localStorage.setItem('lastExamResults', JSON.stringify({
        questions: examState.questions,
        answers: examState.answers,
        scores: results,
        subjects: examState.subjects,
        date: new Date().toISOString()
    }));
    
    window.location.href = '/results.html';
}

function calculateJAMBScores() {
    let englishCorrect = 0;
    let englishTotal = 0;
    let otherCorrect = 0;
    let otherTotal = 0;
    const subjectScores = {};
    
    examState.questions.forEach(q => {
        if (!subjectScores[q.subject]) {
            subjectScores[q.subject] = { correct: 0, total: 0 };
        }
        
        subjectScores[q.subject].total++;
        
        const isCorrect = examState.answers[q.id] === q.correctAnswer;
        if (isCorrect) {
            subjectScores[q.subject].correct++;
            
            if (q.subject === 'Use of English') {
                englishCorrect++;
                englishTotal++;
            } else {
                otherCorrect++;
                otherTotal++;
            }
        } else {
            if (q.subject === 'Use of English') {
                englishTotal++;
            } else {
                otherTotal++;
            }
        }
    });
    
    const englishScore = englishCorrect * 1.67;
    const otherScore = otherCorrect * 2.5;
    const totalScore = englishScore + otherScore;
    
    return {
        subjectScores,
        english: { correct: englishCorrect, total: englishTotal, score: englishScore },
        other: { correct: otherCorrect, total: otherTotal, score: otherScore },
        total: Math.round(totalScore * 100) / 100,
        percentage: Math.round((totalScore / 400) * 100)
    };
}

function generateExamId() {
    return 'EXAM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Calculator functions
function toggleCalculator() {
    const modal = document.getElementById('calculatorModal');
    const btn = document.getElementById('calculatorToggle');
    
    if (modal.style.display === 'none') {
        modal.style.display = 'block';
        btn.textContent = '🧮 Hide Calculator';
        renderCalculator();
    } else {
        modal.style.display = 'none';
        btn.textContent = '🧮 Show Calculator';
    }
}

function renderCalculator() {
    const container = document.getElementById('examCalculator');
    
    container.innerHTML = `
        <div class="calc-display">
            <div class="calc-expression" id="calcExpression"></div>
            <div class="calc-result" id="calcResult">0</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px;">
            <button class="calc-btn operator" onclick="calculatorMemory('clear')">MC</button>
            <button class="calc-btn operator" onclick="calculatorMemory('recall')">MR</button>
            <button class="calc-btn operator" onclick="calculatorMemory('add')">M+</button>
            <button class="calc-btn operator" onclick="calculatorMemory('subtract')">M-</button>
        </div>
        
        <div class="calc-grid">
            <button class="calc-btn clear" onclick="calculatorClear()">C</button>
            <button class="calc-btn operator" onclick="calculatorAppend('%')">%</button>
            <button class="calc-btn operator" onclick="calculatorAppend('/')">÷</button>
            <button class="calc-btn operator" onclick="calculatorBackspace()">⌫</button>
            
            <button class="calc-btn number" onclick="calculatorAppend('7')">7</button>
            <button class="calc-btn number" onclick="calculatorAppend('8')">8</button>
            <button class="calc-btn number" onclick="calculatorAppend('9')">9</button>
            <button class="calc-btn operator" onclick="calculatorAppend('*')">×</button>
            
            <button class="calc-btn number" onclick="calculatorAppend('4')">4</button>
            <button class="calc-btn number" onclick="calculatorAppend('5')">5</button>
            <button class="calc-btn number" onclick="calculatorAppend('6')">6</button>
            <button class="calc-btn operator" onclick="calculatorAppend('-')">−</button>
            
            <button class="calc-btn number" onclick="calculatorAppend('1')">1</button>
            <button class="calc-btn number" onclick="calculatorAppend('2')">2</button>
            <button class="calc-btn number" onclick="calculatorAppend('3')">3</button>
            <button class="calc-btn operator" onclick="calculatorAppend('+')">+</button>
            
            <button class="calc-btn number" onclick="calculatorAppend('0')">0</button>
            <button class="calc-btn number" onclick="calculatorAppend('.')">.</button>
            <button class="calc-btn equals" colspan="2" onclick="calculatorCalculate()">=</button>
        </div>
        
        <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <button class="calc-btn operator" onclick="calculatorScientific('sqrt')">√</button>
            <button class="calc-btn operator" onclick="calculatorScientific('square')">x²</button>
            <button class="calc-btn operator" onclick="calculatorScientific('sin')">sin</button>
            <button class="calc-btn operator" onclick="calculatorScientific('cos')">cos</button>
        </div>
    `;
    
    updateCalculatorDisplay();
}

function calculatorAppend(value) {
    if (value === '.' && examCalculator.currentInput.includes('.')) return;
    examCalculator.currentInput += value;
    updateCalculatorDisplay();
}

function calculatorOperator(op) {
    if (examCalculator.previousInput !== '' && examCalculator.currentInput !== '') {
        calculatorCalculate();
    }
    examCalculator.operator = op;
    if (examCalculator.currentInput !== '') {
        examCalculator.previousInput = examCalculator.currentInput;
        examCalculator.currentInput = '';
    }
    updateCalculatorDisplay();
}

function calculatorCalculate() {
    if (!examCalculator.operator || examCalculator.previousInput === '' || examCalculator.currentInput === '') return;
    
    let result;
    const prev = parseFloat(examCalculator.previousInput);
    const curr = parseFloat(examCalculator.currentInput);
    
    switch(examCalculator.operator) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '/': 
            if (curr === 0) {
                alert('Cannot divide by zero!');
                return;
            }
            result = prev / curr; 
            break;
        case '%': result = prev % curr; break;
        default: return;
    }
    
    examCalculator.currentInput = result.toString();
    examCalculator.operator = null;
    examCalculator.previousInput = '';
    updateCalculatorDisplay();
}

function calculatorScientific(func) {
    if (examCalculator.currentInput === '') return;
    
    let value = parseFloat(examCalculator.currentInput);
    let result;
    
    switch(func) {
        case 'sqrt': result = Math.sqrt(value); break;
        case 'square': result = Math.pow(value, 2); break;
        case 'sin': result = Math.sin(value * Math.PI / 180); break;
        case 'cos': result = Math.cos(value * Math.PI / 180); break;
        default: return;
    }
    
    examCalculator.currentInput = result.toString();
    updateCalculatorDisplay();
}

function calculatorMemory(action) {
    switch(action) {
        case 'clear': examCalculator.memory = 0; break;
        case 'recall': 
            examCalculator.currentInput = examCalculator.memory.toString();
            break;
        case 'add': 
            if (examCalculator.currentInput !== '') {
                examCalculator.memory += parseFloat(examCalculator.currentInput);
            }
            break;
        case 'subtract':
            if (examCalculator.currentInput !== '') {
                examCalculator.memory -= parseFloat(examCalculator.currentInput);
            }
            break;
    }
    updateCalculatorDisplay();
}

function calculatorClear() {
    examCalculator.currentInput = '';
    examCalculator.previousInput = '';
    examCalculator.operator = null;
    updateCalculatorDisplay();
}

function calculatorBackspace() {
    examCalculator.currentInput = examCalculator.currentInput.slice(0, -1);
    updateCalculatorDisplay();
}

function updateCalculatorDisplay() {
    const expression = document.getElementById('calcExpression');
    const result = document.getElementById('calcResult');
    
    if (expression) {
        if (examCalculator.operator && examCalculator.previousInput) {
            expression.textContent = `${examCalculator.previousInput} ${examCalculator.operator}`;
        } else {
            expression.textContent = '';
        }
    }
    if (result) {
        result.textContent = examCalculator.currentInput || '0';
    }
}

window.selectAnswer = selectAnswer;
window.jumpToQuestion = jumpToQuestion;
window.toggleCalculator = toggleCalculator;
window.calculatorAppend = calculatorAppend;
window.calculatorOperator = calculatorOperator;
window.calculatorCalculate = calculatorCalculate;
window.calculatorClear = calculatorClear;
window.calculatorBackspace = calculatorBackspace;
window.calculatorMemory = calculatorMemory;
window.calculatorScientific = calculatorScientific;