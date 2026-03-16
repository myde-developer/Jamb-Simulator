// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

// Exam state
let examState = {
    questions: [],
    currentIndex: 0,
    answers: {},
    timeRemaining: 7200,
    timerInterval: null,
    subjects: [],
    examId: null,
    startTime: null,
    currentSubject: 'all',
    subjectRanges: {}
};

// Calculator state with drag functionality
let examCalculator = {
    currentInput: '',
    previousInput: '',
    operator: null,
    memory: 0,
    shouldReset: false
};

// Drag state for calculator
let dragState = {
    isDragging: false,
    currentX: 0,
    currentY: 0,
    initialX: 0,
    initialY: 0,
    xOffset: 0,
    yOffset: 0,
    activated: false
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

    document.getElementById('logoutBtn').addEventListener('click', logout);
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
    renderSubjectTabs(selectedSubjects);
    renderSubjectFilter(selectedSubjects);
    fetchExamQuestions(selectedSubjects);
}

function renderSubjectTabs(subjects) {
    const tabsContainer = document.getElementById('subjectTabs');
    if (!tabsContainer) return;
    
    let tabsHtml = subjects.map((subject, index) => {
        const isEnglish = subject.name === 'Use of English';
        const questionCount = isEnglish ? 60 : 40;
        const displayName = isEnglish ? 'English' : subject.name;
        
        return `
            <button class="subject-tab ${index === 0 ? 'active' : ''}" 
                    onclick="switchSubject('${subject.name}')">
                ${displayName}
                <span class="count-badge">${questionCount}</span>
            </button>
        `;
    }).join('');
    
    tabsContainer.innerHTML = tabsHtml;
}

function renderSubjectFilter(subjects) {
    const filterContainer = document.getElementById('subjectFilter');
    if (!filterContainer) return;
    
    let filterHtml = `<button class="filter-btn active" onclick="filterPalette('all')">All</button>`;
    
    subjects.forEach(subject => {
        const displayName = subject.name === 'Use of English' ? 'English' : subject.name;
        filterHtml += `
            <button class="filter-btn" onclick="filterPalette('${subject.name}')">
                ${displayName}
            </button>
        `;
    });
    
    filterContainer.innerHTML = filterHtml;
}

function switchSubject(subjectName) {
    examState.currentSubject = subjectName;
    
    document.querySelectorAll('.subject-tab').forEach((tab, index) => {
        const tabSubject = examState.subjects[index].name;
        if (tabSubject === subjectName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    const firstIndex = examState.questions.findIndex(q => q.subject === subjectName);
    if (firstIndex !== -1) {
        examState.currentIndex = firstIndex;
        renderQuestion(firstIndex);
        updateNavButtons();
        highlightCurrentInPalette(firstIndex);
    }
    
    renderPalette();
}

function filterPalette(subject) {
    examState.currentSubject = subject;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnSubject = btn.textContent.trim();
        if ((subject === 'all' && btnSubject === 'All') || 
            (subject !== 'all' && btnSubject === subject)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderPalette();
}

function displaySubjectsBadge(subjects) {
    const badgeContainer = document.getElementById('subjectsBadge');
    if (!badgeContainer) return;
    
    badgeContainer.innerHTML = subjects.map(s => 
        `<span class="subject-tag">${s.code || s.name.substring(0, 3).toUpperCase()}</span>`
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
        
        calculateSubjectRanges();
        
        renderQuestion(0);
        renderPalette();
        
    } catch (error) {
        console.error('Full error object:', error);
        
        if (error.response) {
            error.response.text().then(text => {
                console.error('Response body:', text);
            });
        }
        
        document.getElementById('questionContainer').innerHTML = `
            <div style="text-align: center; padding: 50px; color: #e74c3c;">
                ❌ Failed to load questions: ${error.message}
                <br><br>
                <button onclick="location.reload()" style="padding: 10px 20px;">Retry</button>
            </div>
        `;
    }
}

function calculateSubjectRanges() {
    const ranges = {};
    examState.subjects.forEach(subject => {
        ranges[subject.name] = {
            start: examState.questions.findIndex(q => q.subject === subject.name),
            end: examState.questions.findLastIndex(q => q.subject === subject.name),
            count: examState.questions.filter(q => q.subject === subject.name).length
        };
    });
    examState.subjectRanges = ranges;
}

function renderQuestion(index) {
    const question = examState.questions[index];
    if (!question) return;
    
    const container = document.getElementById('questionContainer');
    const savedAnswer = examState.answers[question.id];
    
    const options = {
        A: question.option_a || question.options?.A || 'Option A',
        B: question.option_b || question.options?.B || 'Option B',
        C: question.option_c || question.options?.C || 'Option C',
        D: question.option_d || question.options?.D || 'Option D'
    };
    
    container.innerHTML = `
        <div class="question-number">Question ${index + 1} of ${examState.questions.length}</div>
        <div class="question-subject">${question.subject || 'Unknown'}</div>
        <div class="question-text">${question.question_text || question.question || ''}</div>
        <div class="options">
            ${['A', 'B', 'C', 'D'].map(letter => `
                <div class="option ${savedAnswer === letter ? 'selected' : ''}" 
                     onclick="selectAnswer('${question.id}', '${letter}')">
                    <span class="option-letter">${letter}</span>
                    <span class="option-text">${options[letter]}</span>
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
    
    let filteredQuestions = examState.questions;
    if (examState.currentSubject !== 'all') {
        filteredQuestions = examState.questions.filter(q => q.subject === examState.currentSubject);
    }
    
    palette.innerHTML = filteredQuestions.map((q, idx) => {
        const originalIndex = examState.questions.findIndex(question => question.id === q.id);
        const answered = examState.answers[q.id] ? 'answered' : 'unanswered';
        const current = originalIndex === examState.currentIndex ? 'current' : '';
        const subjectShort = q.subject === 'Use of English' ? 'ENG' : 
                            q.subject === 'Mathematics' ? 'MTH' :
                            q.subject === 'Physics' ? 'PHY' :
                            q.subject === 'Chemistry' ? 'CHM' :
                            q.subject === 'Biology' ? 'BIO' : 'SUB';
        
        return `
            <div class="palette-item ${answered} ${current}" 
                 onclick="jumpToQuestion(${originalIndex})"
                 data-subject="${subjectShort}"
                 title="${q.subject} - Question ${originalIndex + 1}">
                ${originalIndex + 1}
            </div>
        `;
    }).join('');
}

function updatePaletteItem(questionId) {
    const index = examState.questions.findIndex(q => q.id === questionId);
    const paletteItems = document.querySelectorAll('.palette-item');
    
    paletteItems.forEach(item => {
        if (item.textContent.trim() === (index + 1).toString()) {
            item.className = 'palette-item answered';
            if (index === examState.currentIndex) {
                item.classList.add('current');
            }
        }
    });
}

function highlightCurrentInPalette(index) {
    document.querySelectorAll('.palette-item').forEach((item, i) => {
        const itemNumber = parseInt(item.textContent.trim());
        if (itemNumber === index + 1) {
            item.classList.add('current');
        } else {
            item.classList.remove('current');
        }
    });
}

function jumpToQuestion(index) {
    examState.currentIndex = index;
    renderQuestion(index);
    
    const question = examState.questions[index];
    if (question) {
        document.querySelectorAll('.subject-tab').forEach((tab, i) => {
            const tabSubject = examState.subjects[i].name;
            if (tabSubject === question.subject) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
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
        
        const correctAnswer = q.correct_answer || q.correctAnswer;
        const isCorrect = examState.answers[q.id] === correctAnswer;
        
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

// Draggable Calculator Functions
function initDraggableCalculator() {
    const modal = document.getElementById('calculatorModal');
    const content = document.getElementById('calculatorContent');
    const header = document.getElementById('calculatorHeader');
    
    if (!modal || !content || !header) return;
    
    // Remove any existing listeners
    header.removeEventListener('mousedown', dragMouseDown);
    header.removeEventListener('touchstart', dragTouchStart);
    document.removeEventListener('mousemove', dragMouseMove);
    document.removeEventListener('mouseup', dragMouseUp);
    document.removeEventListener('touchmove', dragTouchMove);
    document.removeEventListener('touchend', dragTouchEnd);
    
    // Add new listeners
    header.addEventListener('mousedown', dragMouseDown);
    header.addEventListener('touchstart', dragTouchStart, { passive: false });
}

function dragMouseDown(e) {
    e.preventDefault();
    const content = document.getElementById('calculatorContent');
    if (!content) return;
    
    dragState.initialX = e.clientX - dragState.xOffset;
    dragState.initialY = e.clientY - dragState.yOffset;
    dragState.isDragging = true;
    dragState.activated = true;
    
    document.addEventListener('mousemove', dragMouseMove);
    document.addEventListener('mouseup', dragMouseUp);
    
    content.style.cursor = 'grabbing';
    content.style.transition = 'none';
}

function dragTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const content = document.getElementById('calculatorContent');
    if (!content) return;
    
    dragState.initialX = touch.clientX - dragState.xOffset;
    dragState.initialY = touch.clientY - dragState.yOffset;
    dragState.isDragging = true;
    dragState.activated = true;
    
    document.addEventListener('touchmove', dragTouchMove, { passive: false });
    document.addEventListener('touchend', dragTouchEnd);
    document.addEventListener('touchcancel', dragTouchEnd);
    
    content.style.cursor = 'grabbing';
    content.style.transition = 'none';
}

function dragMouseMove(e) {
    if (!dragState.isDragging) return;
    e.preventDefault();
    
    dragState.currentX = e.clientX - dragState.initialX;
    dragState.currentY = e.clientY - dragState.initialY;
    
    dragState.xOffset = dragState.currentX;
    dragState.yOffset = dragState.currentY;
    
    setTranslate(dragState.currentX, dragState.currentY, document.getElementById('calculatorContent'));
}

function dragTouchMove(e) {
    if (!dragState.isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    dragState.currentX = touch.clientX - dragState.initialX;
    dragState.currentY = touch.clientY - dragState.initialY;
    
    dragState.xOffset = dragState.currentX;
    dragState.yOffset = dragState.currentY;
    
    setTranslate(dragState.currentX, dragState.currentY, document.getElementById('calculatorContent'));
}

function dragMouseUp(e) {
    dragState.isDragging = false;
    dragState.activated = false;
    
    document.removeEventListener('mousemove', dragMouseMove);
    document.removeEventListener('mouseup', dragMouseUp);
    
    const content = document.getElementById('calculatorContent');
    if (content) {
        content.style.cursor = 'grab';
        content.style.transition = 'box-shadow 0.2s';
    }
}

function dragTouchEnd(e) {
    dragState.isDragging = false;
    dragState.activated = false;
    
    document.removeEventListener('touchmove', dragTouchMove);
    document.removeEventListener('touchend', dragTouchEnd);
    document.removeEventListener('touchcancel', dragTouchEnd);
    
    const content = document.getElementById('calculatorContent');
    if (content) {
        content.style.cursor = 'grab';
        content.style.transition = 'box-shadow 0.2s';
    }
}

function setTranslate(xPos, yPos, el) {
    if (!el) return;
    
    // Add bounds checking to keep calculator on screen
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    
    xPos = Math.min(Math.max(xPos, 10), maxX - 10);
    yPos = Math.min(Math.max(yPos, 10), maxY - 10);
    
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

// Updated toggleCalculator function with drag initialization
function toggleCalculator() {
    const modal = document.getElementById('calculatorModal');
    const btn = document.getElementById('calculatorToggle');
    const content = document.getElementById('calculatorContent');
    
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'block';
        btn.innerHTML = '<span>🧮</span> <span class="btn-text">Hide Calculator</span>';
        renderCalculator();
        
        // Reset position
        if (content) {
            content.style.transform = 'none';
            dragState.xOffset = 0;
            dragState.yOffset = 0;
        }
        
        // Initialize draggable
        setTimeout(() => {
            initDraggableCalculator();
        }, 100);
    } else {
        modal.style.display = 'none';
        btn.innerHTML = '<span>🧮</span> <span class="btn-text">Calculator</span>';
        
        // Reset drag state
        dragState.isDragging = false;
        dragState.xOffset = 0;
        dragState.yOffset = 0;
        if (content) {
            content.style.transform = 'none';
        }
    }
}

function renderCalculator() {
    const container = document.getElementById('examCalculator');
    
    container.innerHTML = `
        <div class="calc-display">
            <div class="calc-expression" id="calcExpression"></div>
            <div class="calc-result" id="calcResult">0</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
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
            <button class="calc-btn equals" onclick="calculatorCalculate()">=</button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px;">
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

// Make functions globally available
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
window.switchSubject = switchSubject;
window.filterPalette = filterPalette;