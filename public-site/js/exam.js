// client/js/exam.js – FULLY ANONYMOUS (no authentication)
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

// Exam state
let examState = {
    questions: [],
    subjectQuestions: {},
    currentSubject: null,
    subjectIndices: {},
    answers: {},
    timeRemaining: 7200,
    timerInterval: null,
    subjects: [],
    examId: null,
    startTime: null,
    subjectOrder: [],
    subjectConfigs: {},
    isReady: false
};

// Calculator state (unchanged)
let examCalculator = {
    currentInput: '',
    previousInput: '',
    operator: null,
    memory: 0,
    shouldReset: false,
    lastResult: null
};

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

// NO AUTH CHECK – removed the IIFE that redirected to login

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
    
    selectedSubjects.forEach(subject => {
        examState.subjectIndices[subject.name] = 0;
    });
    
    examState.currentSubject = selectedSubjects[0].name;
    
    // Removed loadSubjectConfigs – not needed
    displaySubjectsBadge(selectedSubjects);
    renderSubjectTabs(selectedSubjects);
    renderSubjectFilter(selectedSubjects);
    fetchExamQuestions(selectedSubjects);
}

function renderSubjectTabs(subjects) {
    const tabsContainer = document.getElementById('subjectTabs');
    if (!tabsContainer) return;
    
    let tabsHtml = subjects.map((subject, index) => {
        const config = examState.subjectConfigs[subject.name];
        const questionCount = config?.totalQuestions || (subject.name === 'Use of English' ? 60 : 40);
        const displayName = subject.name === 'Use of English' ? 'English' : subject.name;
        const isActive = index === 0 ? 'active' : '';
        const diagramIcon = config?.hasDiagrams ? ' 📐' : '';
        
        return `
            <button class="subject-tab ${isActive}" onclick="switchSubject('${subject.name}')">
                ${displayName}${diagramIcon}
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
        filterHtml += `<button class="filter-btn" onclick="filterPalette('${subject.name}')">${displayName}</button>`;
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
    
    renderSubjectQuestion(subjectName);
    renderPalette();
}

function renderSubjectQuestion(subjectName) {
    const subjectQuestions = examState.subjectQuestions[subjectName];
    if (!subjectQuestions || subjectQuestions.length === 0) return;
    
    const currentIndex = examState.subjectIndices[subjectName];
    const question = subjectQuestions[currentIndex];
    renderQuestion(question, subjectName, currentIndex + 1, subjectQuestions.length);
}

function displaySubjectsBadge(subjects) {
    const badgeContainer = document.getElementById('subjectsBadge');
    if (!badgeContainer) return;
    badgeContainer.innerHTML = subjects.map(s => 
        `<span class="subject-tag">${s.code || s.name.substring(0, 3).toUpperCase()}</span>`
    ).join('');
}

function randomizeQuestionOptions(question) {
    const optionLetters = ['A', 'B', 'C', 'D'];
    const originalCorrectLetter = question.correct_answer;
    
    const originalOptions = {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d
    };
    
    const correctText = originalOptions[originalCorrectLetter];
    
    const shuffledLetters = [...optionLetters];
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
    }
    
    const newOptions = {};
    shuffledLetters.forEach((newLetter, idx) => {
        const originalLetter = optionLetters[idx];
        newOptions[newLetter] = originalOptions[originalLetter];
    });
    
    let newCorrectLetter = '';
    for (const [letter, text] of Object.entries(newOptions)) {
        if (text === correctText) {
            newCorrectLetter = letter;
            break;
        }
    }
    
    return {
        ...question,
        option_a: newOptions.A,
        option_b: newOptions.B,
        option_c: newOptions.C,
        option_d: newOptions.D,
        correct_answer: newCorrectLetter
    };
}

async function fetchExamQuestions(subjects) {
    try {
        document.getElementById('questionContainer').innerHTML = 
            '<div style="text-align: center; padding: 50px;">Loading questions...</div>';
        
        // NO AUTHENTICATION – removed Authorization header
        const response = await fetch(`${API_BASE}/api/exam/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subjects: subjects.map(s => ({ id: s.id, name: s.name }))
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        
        let questions = await response.json();
        
        if (!questions || questions.length === 0) {
            throw new Error('No questions available');
        }
        
        // Randomize options for each question
        const randomizedQuestions = questions.map(q => randomizeQuestionOptions(q));
        
        // Organize by subject
        examState.subjectQuestions = {};
        subjects.forEach(subject => {
            const subjectQuestions = randomizedQuestions.filter(q => q.subject === subject.name);
            const targetCount = subject.name === 'Use of English' ? 60 : 40;
            
            if (subjectQuestions.length >= targetCount) {
                examState.subjectQuestions[subject.name] = subjectQuestions.slice(0, targetCount);
            } else {
                examState.subjectQuestions[subject.name] = subjectQuestions;
                console.warn(`${subject.name}: Only ${subjectQuestions.length}/${targetCount} questions available`);
            }
        });
        
        examState.questions = randomizedQuestions;
        examState.examId = generateExamId();
        
        const firstSubject = subjects[0].name;
        renderSubjectQuestion(firstSubject);
        renderPalette();
        
        examState.isReady = true;
        startTimer();
        
        console.log('✅ Exam fully loaded');
        
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionContainer').innerHTML = `
            <div style="text-align: center; padding: 50px; color: #e74c3c;">
                ❌ Failed to load questions: ${error.message}
                <br><br>
                <button onclick="location.reload()" style="padding: 10px 20px;">Retry</button>
            </div>
        `;
    }
}

function renderQuestion(question, subjectName, questionNumber, totalQuestions) {
    if (!question) return;
    
    const container = document.getElementById('questionContainer');
    const savedAnswer = examState.answers[question.id];
    
    const options = {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d
    };
    
    const questionHtml = question.question_text;
    
    container.innerHTML = `
        <div class="question-number">Question ${questionNumber} of ${totalQuestions}</div>
        <div class="question-subject">${subjectName}</div>
        <div class="question-text">${questionHtml}</div>
        <div class="options">
            ${['A', 'B', 'C', 'D'].map(letter => `
                <div class="option ${savedAnswer === letter ? 'selected' : ''}" onclick="selectAnswer('${question.id}', '${letter}')">
                    <span class="option-letter">${letter}</span>
                    <span class="option-text">${options[letter]}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    updateNavButtons(subjectName);
    updateProgress();
    highlightCurrentInPalette(question.id);
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
    
    const allQuestions = [];
    
    Object.keys(examState.subjectQuestions).forEach(subject => {
        examState.subjectQuestions[subject].forEach((q, index) => {
            allQuestions.push({
                ...q,
                subjectDisplay: subject === 'Use of English' ? 'ENG' : 
                               subject === 'Mathematics' ? 'MTH' :
                               subject === 'Physics' ? 'PHY' :
                               subject === 'Chemistry' ? 'CHM' :
                               subject === 'Biology' ? 'BIO' : subject.substring(0, 3).toUpperCase(),
                subjectName: subject,
                subjectIndex: index + 1
            });
        });
    });
    
    let displayQuestions = allQuestions;
    if (examState.currentSubject && examState.currentSubject !== 'all') {
        displayQuestions = allQuestions.filter(q => q.subjectName === examState.currentSubject);
    }
    
    palette.innerHTML = displayQuestions.map((q, idx) => {
        const answered = examState.answers[q.id] ? 'answered' : 'unanswered';
        const isCurrent = examState.currentSubject === q.subjectName && 
                         examState.subjectIndices[q.subjectName] === q.subjectIndex - 1;
        const current = isCurrent ? 'current' : '';
        
        return `
            <div class="palette-item ${answered} ${current}" onclick="jumpToQuestion('${q.subjectName}', ${q.subjectIndex - 1})"
                 data-subject="${q.subjectDisplay}" title="${q.subjectName} - Question ${q.subjectIndex}">
                ${q.subjectDisplay} ${q.subjectIndex}
            </div>
        `;
    }).join('');
}

function updatePaletteItem(questionId) {
    let targetSubject = null;
    let targetIndex = -1;
    
    for (const subject in examState.subjectQuestions) {
        const index = examState.subjectQuestions[subject].findIndex(q => q.id === questionId);
        if (index !== -1) {
            targetSubject = subject;
            targetIndex = index;
            break;
        }
    }
    
    if (targetSubject === null) return;
    
    const paletteItems = document.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
        const itemText = item.textContent.trim();
        const subjectCode = targetSubject === 'Use of English' ? 'ENG' :
                           targetSubject === 'Mathematics' ? 'MTH' :
                           targetSubject === 'Physics' ? 'PHY' :
                           targetSubject === 'Chemistry' ? 'CHM' :
                           targetSubject === 'Biology' ? 'BIO' : targetSubject.substring(0, 3).toUpperCase();
        
        if (itemText === `${subjectCode} ${targetIndex + 1}`) {
            item.className = 'palette-item answered';
            if (examState.currentSubject === targetSubject && examState.subjectIndices[targetSubject] === targetIndex) {
                item.classList.add('current');
            }
        }
    });
}

function highlightCurrentInPalette(questionId) {
    let targetSubject = null;
    let targetIndex = -1;
    
    for (const subject in examState.subjectQuestions) {
        const index = examState.subjectQuestions[subject].findIndex(q => q.id === questionId);
        if (index !== -1) {
            targetSubject = subject;
            targetIndex = index;
            break;
        }
    }
    
    if (targetSubject === null) return;
    
    const paletteItems = document.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
        const itemText = item.textContent.trim();
        const subjectCode = targetSubject === 'Use of English' ? 'ENG' :
                           targetSubject === 'Mathematics' ? 'MTH' :
                           targetSubject === 'Physics' ? 'PHY' :
                           targetSubject === 'Chemistry' ? 'CHM' :
                           targetSubject === 'Biology' ? 'BIO' : targetSubject.substring(0, 3).toUpperCase();
        
        if (itemText === `${subjectCode} ${targetIndex + 1}`) {
            item.classList.add('current');
        } else {
            item.classList.remove('current');
        }
    });
}

function jumpToQuestion(subjectName, index) {
    examState.currentSubject = subjectName;
    examState.subjectIndices[subjectName] = index;
    
    document.querySelectorAll('.subject-tab').forEach((tab, i) => {
        const tabSubject = examState.subjects[i].name;
        if (tabSubject === subjectName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    renderSubjectQuestion(subjectName);
}

function updateNavButtons(subjectName) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!prevBtn || !nextBtn || !submitBtn) return;
    
    const currentIndex = examState.subjectIndices[subjectName];
    const totalQuestions = examState.subjectQuestions[subjectName].length;
    
    prevBtn.disabled = currentIndex === 0;
    
    const isLastSubject = subjectName === examState.subjectOrder[examState.subjectOrder.length - 1];
    const isLastQuestion = currentIndex === totalQuestions - 1;
    
    if (isLastSubject && isLastQuestion) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function nextQuestion() {
    const currentSubject = examState.currentSubject;
    const currentIndex = examState.subjectIndices[currentSubject];
    const subjectQuestions = examState.subjectQuestions[currentSubject];
    
    if (currentIndex < subjectQuestions.length - 1) {
        examState.subjectIndices[currentSubject] = currentIndex + 1;
        renderSubjectQuestion(currentSubject);
    } else {
        const currentSubjectIndex = examState.subjectOrder.indexOf(currentSubject);
        if (currentSubjectIndex < examState.subjectOrder.length - 1) {
            const nextSubject = examState.subjectOrder[currentSubjectIndex + 1];
            examState.currentSubject = nextSubject;
            examState.subjectIndices[nextSubject] = 0;
            
            document.querySelectorAll('.subject-tab').forEach((tab, i) => {
                const tabSubject = examState.subjects[i].name;
                if (tabSubject === nextSubject) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            renderSubjectQuestion(nextSubject);
        }
    }
    renderPalette();
}

function prevQuestion() {
    const currentSubject = examState.currentSubject;
    const currentIndex = examState.subjectIndices[currentSubject];
    
    if (currentIndex > 0) {
        examState.subjectIndices[currentSubject] = currentIndex - 1;
        renderSubjectQuestion(currentSubject);
    } else {
        const currentSubjectIndex = examState.subjectOrder.indexOf(currentSubject);
        if (currentSubjectIndex > 0) {
            const prevSubject = examState.subjectOrder[currentSubjectIndex - 1];
            const prevSubjectQuestions = examState.subjectQuestions[prevSubject];
            
            examState.currentSubject = prevSubject;
            examState.subjectIndices[prevSubject] = prevSubjectQuestions.length - 1;
            
            document.querySelectorAll('.subject-tab').forEach((tab, i) => {
                const tabSubject = examState.subjects[i].name;
                if (tabSubject === prevSubject) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            renderSubjectQuestion(prevSubject);
        }
    }
    renderPalette();
}

function updateProgress() {
    const answeredCount = Object.keys(examState.answers).length;
    const totalQuestions = Object.values(examState.subjectQuestions).reduce((sum, q) => sum + q.length, 0);
    const progress = (answeredCount / totalQuestions) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = `${progress}%`;
}

function startTimer() {
    if (!examState.isReady) {
        console.log('⏳ Timer waiting for exam to be ready...');
        return;
    }
    if (examState.timerInterval) {
        console.log('⚠️ Timer already running');
        return;
    }
    
    console.log('⏰ STARTING TIMER NOW!');
    
    examState.timerInterval = setInterval(() => {
        if (examState.timeRemaining <= 0) {
            clearInterval(examState.timerInterval);
            submitExam();
            return;
        }
        examState.timeRemaining--;
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
    document.getElementById('prevBtn')?.addEventListener('click', prevQuestion);
    document.getElementById('nextBtn')?.addEventListener('click', nextQuestion);
    document.getElementById('submitBtn')?.addEventListener('click', submitExam);
}

function submitExam() {
    const totalQuestions = Object.values(examState.subjectQuestions).reduce((sum, q) => sum + q.length, 0);
    const answeredCount = Object.keys(examState.answers).length;
    
    if (answeredCount < totalQuestions) {
        if (!confirm(`You have answered ${answeredCount} out of ${totalQuestions} questions. Submit anyway?`)) return;
    }
    
    if (examState.timerInterval) clearInterval(examState.timerInterval);
    
    const results = calculateJAMBScores();
    const examData = {
        subjectQuestions: examState.subjectQuestions,
        answers: examState.answers,
        scores: results,
        subjects: examState.subjects,
        date: new Date().toISOString(),
        examId: examState.examId
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        localStorage.setItem('lastExamResults', JSON.stringify(examData));
        window.location.href = '/results.html';
        return;
    }
    
    sessionStorage.setItem('pendingExamResults', JSON.stringify(examData));
    sessionStorage.setItem('redirectAfterAuth', 'results');
    window.location.href = '/auth.html';
}

function calculateJAMBScores() {
    let englishCorrect = 0, englishTotal = 0, otherCorrect = 0, otherTotal = 0;
    const subjectScores = {};
    
    Object.keys(examState.subjectQuestions).forEach(subject => {
        subjectScores[subject] = { correct: 0, total: examState.subjectQuestions[subject].length };
        
        examState.subjectQuestions[subject].forEach(q => {
            const correctAnswer = q.correct_answer || q.correctAnswer;
            const isCorrect = examState.answers[q.id] === correctAnswer;
            
            if (isCorrect) {
                subjectScores[subject].correct++;
                if (subject === 'Use of English') englishCorrect++;
                else otherCorrect++;
            }
        });
        
        if (subject === 'Use of English') englishTotal = examState.subjectQuestions[subject].length;
        else otherTotal += examState.subjectQuestions[subject].length;
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

function filterPalette(subject) {
    examState.currentSubject = subject === 'all' ? null : subject;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnSubject = btn.textContent.trim();
        if ((subject === 'all' && btnSubject === 'All') || (subject !== 'all' && btnSubject === subject)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderPalette();
}

function renderCalculator() {
    const container = document.getElementById('examCalculator');
    if (!container) return;
    
    container.innerHTML = `
        <div class="calc-display">
            <div class="calc-expression" id="calcExpression"></div>
            <div class="calc-result" id="calcResult">0</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
            <button class="calc-btn operator" onclick="calculatorMemory('clear'); event.stopPropagation();">MC</button>
            <button class="calc-btn operator" onclick="calculatorMemory('recall'); event.stopPropagation();">MR</button>
            <button class="calc-btn operator" onclick="calculatorMemory('add'); event.stopPropagation();">M+</button>
            <button class="calc-btn operator" onclick="calculatorMemory('subtract'); event.stopPropagation();">M-</button>
        </div>
        <div class="calc-grid">
            <button class="calc-btn clear" onclick="calculatorClear(); event.stopPropagation();">C</button>
            <button class="calc-btn operator" onclick="calculatorAppend('%'); event.stopPropagation();">%</button>
            <button class="calc-btn operator" onclick="calculatorOperator('/'); event.stopPropagation();">÷</button>
            <button class="calc-btn operator" onclick="calculatorBackspace(); event.stopPropagation();">⌫</button>
            <button class="calc-btn number" onclick="calculatorAppend('7'); event.stopPropagation();">7</button>
            <button class="calc-btn number" onclick="calculatorAppend('8'); event.stopPropagation();">8</button>
            <button class="calc-btn number" onclick="calculatorAppend('9'); event.stopPropagation();">9</button>
            <button class="calc-btn operator" onclick="calculatorOperator('*'); event.stopPropagation();">×</button>
            <button class="calc-btn number" onclick="calculatorAppend('4'); event.stopPropagation();">4</button>
            <button class="calc-btn number" onclick="calculatorAppend('5'); event.stopPropagation();">5</button>
            <button class="calc-btn number" onclick="calculatorAppend('6'); event.stopPropagation();">6</button>
            <button class="calc-btn operator" onclick="calculatorOperator('-'); event.stopPropagation();">−</button>
            <button class="calc-btn number" onclick="calculatorAppend('1'); event.stopPropagation();">1</button>
            <button class="calc-btn number" onclick="calculatorAppend('2'); event.stopPropagation();">2</button>
            <button class="calc-btn number" onclick="calculatorAppend('3'); event.stopPropagation();">3</button>
            <button class="calc-btn operator" onclick="calculatorOperator('+'); event.stopPropagation();">+</button>
            <button class="calc-btn number" onclick="calculatorAppend('0'); event.stopPropagation();">0</button>
            <button class="calc-btn number" onclick="calculatorAppend('.'); event.stopPropagation();">.</button>
            <button class="calc-btn equals" onclick="calculatorCalculate(); event.stopPropagation();" style="grid-column: span 2;">=</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px;">
            <button class="calc-btn operator" onclick="calculatorScientific('sqrt'); event.stopPropagation();">√</button>
            <button class="calc-btn operator" onclick="calculatorScientific('square'); event.stopPropagation();">x²</button>
            <button class="calc-btn operator" onclick="calculatorScientific('sin'); event.stopPropagation();">sin</button>
            <button class="calc-btn operator" onclick="calculatorScientific('cos'); event.stopPropagation();">cos</button>
        </div>
    `;
    updateCalculatorDisplay();
}

function calculatorAppend(value) {
    if (examCalculator.shouldReset) {
        examCalculator.currentInput = '';
        examCalculator.shouldReset = false;
    }
    if (value === '.') {
        if (examCalculator.currentInput.includes('.')) return;
        if (examCalculator.currentInput === '') examCalculator.currentInput = '0.';
    }
    examCalculator.currentInput += value;
    updateCalculatorDisplay();
}

function calculatorOperator(op) {
    if (examCalculator.operator && examCalculator.previousInput !== '' && examCalculator.currentInput !== '') calculatorCalculate();
    examCalculator.operator = op;
    if (examCalculator.currentInput !== '') {
        examCalculator.previousInput = examCalculator.currentInput;
        examCalculator.currentInput = '';
    } else if (examCalculator.lastResult !== null) examCalculator.previousInput = examCalculator.lastResult.toString();
    examCalculator.shouldReset = false;
    updateCalculatorDisplay();
}

function calculatorCalculate() {
    if (!examCalculator.operator || examCalculator.previousInput === '') return;
    
    let currentValue;
    if (examCalculator.currentInput === '') {
        if (examCalculator.lastResult !== null) currentValue = examCalculator.lastResult;
        else currentValue = parseFloat(examCalculator.previousInput);
    } else currentValue = parseFloat(examCalculator.currentInput);
    
    const prevValue = parseFloat(examCalculator.previousInput);
    if (isNaN(prevValue) || isNaN(currentValue)) {
        alert('Invalid input');
        calculatorClear();
        return;
    }
    
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
    if (examCalculator.currentInput === '') {
        if (examCalculator.lastResult !== null) examCalculator.currentInput = examCalculator.lastResult.toString();
        else return;
    }
    
    let value = parseFloat(examCalculator.currentInput);
    if (isNaN(value)) return;
    
    let result;
    switch(func) {
        case 'sqrt': if (value < 0) { alert('Cannot calculate square root of negative number'); return; } result = Math.sqrt(value); break;
        case 'square': result = Math.pow(value, 2); break;
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
    let currentValue;
    if (examCalculator.currentInput !== '') currentValue = parseFloat(examCalculator.currentInput);
    else if (examCalculator.lastResult !== null) currentValue = examCalculator.lastResult;
    else currentValue = 0;
    if (isNaN(currentValue)) currentValue = 0;
    
    switch(action) {
        case 'clear': examCalculator.memory = 0; break;
        case 'recall': examCalculator.currentInput = examCalculator.memory.toString(); examCalculator.shouldReset = true; examCalculator.operator = null; examCalculator.previousInput = ''; updateCalculatorDisplay(); break;
        case 'add': examCalculator.memory += currentValue; break;
        case 'subtract': examCalculator.memory -= currentValue; break;
    }
}

function calculatorClear() {
    examCalculator.currentInput = '';
    examCalculator.previousInput = '';
    examCalculator.operator = null;
    examCalculator.shouldReset = false;
    updateCalculatorDisplay();
}

function calculatorBackspace() {
    if (examCalculator.shouldReset) return;
    examCalculator.currentInput = examCalculator.currentInput.slice(0, -1);
    updateCalculatorDisplay();
}

function updateCalculatorDisplay() {
    const expression = document.getElementById('calcExpression');
    const result = document.getElementById('calcResult');
    
    if (expression) {
        if (examCalculator.operator && examCalculator.previousInput) expression.textContent = `${examCalculator.previousInput} ${examCalculator.operator}`;
        else expression.textContent = '';
    }
    
    if (result) {
        if (examCalculator.currentInput === '') {
            if (examCalculator.lastResult !== null && !examCalculator.operator) result.textContent = examCalculator.lastResult;
            else result.textContent = '0';
        } else result.textContent = examCalculator.currentInput;
    }
}

function toggleCalculator(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const modal = document.getElementById('calculatorModal');
    const btn = document.getElementById('calculatorToggle');
    if (!modal) return;
    
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'block';
        if (btn) btn.innerHTML = '<span>🧮</span> <span class="btn-text">Hide Calculator</span>';
        renderCalculator();
        setTimeout(() => initDraggableCalculator(), 50);
    } else {
        modal.style.display = 'none';
        if (btn) btn.innerHTML = '<span>🧮</span> <span class="btn-text">Calculator</span>';
        dragState.isDragging = false;
    }
}

function handleModalClick(event) {
    if (event.target === document.getElementById('calculatorModal')) toggleCalculator(event);
}

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

function dragMouseDown(e) {
    e.preventDefault(); e.stopPropagation();
    const content = document.getElementById('calculatorContent');
    if (!content) return;
    const transform = window.getComputedStyle(content).transform;
    const matrix = new DOMMatrix(transform);
    dragState.xOffset = matrix.m41;
    dragState.yOffset = matrix.m42;
    dragState.initialX = e.clientX - dragState.xOffset;
    dragState.initialY = e.clientY - dragState.yOffset;
    dragState.isDragging = true;
    document.addEventListener('mousemove', dragMouseMove);
    document.addEventListener('mouseup', dragMouseUp);
    content.style.cursor = 'grabbing';
    content.style.transition = 'none';
}

function dragTouchStart(e) {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches[0];
    const content = document.getElementById('calculatorContent');
    if (!content) return;
    const transform = window.getComputedStyle(content).transform;
    const matrix = new DOMMatrix(transform);
    dragState.xOffset = matrix.m41;
    dragState.yOffset = matrix.m42;
    dragState.initialX = touch.clientX - dragState.xOffset;
    dragState.initialY = touch.clientY - dragState.yOffset;
    dragState.isDragging = true;
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
    setTranslate(dragState.currentX, dragState.currentY, document.getElementById('calculatorContent'));
}

function dragTouchMove(e) {
    if (!dragState.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    dragState.currentX = touch.clientX - dragState.initialX;
    dragState.currentY = touch.clientY - dragState.initialY;
    setTranslate(dragState.currentX, dragState.currentY, document.getElementById('calculatorContent'));
}

function dragMouseUp(e) {
    dragState.isDragging = false;
    document.removeEventListener('mousemove', dragMouseMove);
    document.removeEventListener('mouseup', dragMouseUp);
    const content = document.getElementById('calculatorContent');
    if (content) { content.style.cursor = 'grab'; content.style.transition = 'box-shadow 0.2s'; }
}

function dragTouchEnd(e) {
    dragState.isDragging = false;
    document.removeEventListener('touchmove', dragTouchMove);
    document.removeEventListener('touchend', dragTouchEnd);
    document.removeEventListener('touchcancel', dragTouchEnd);
    const content = document.getElementById('calculatorContent');
    if (content) { content.style.cursor = 'grab'; content.style.transition = 'box-shadow 0.2s'; }
}

function setTranslate(xPos, yPos, el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    xPos = Math.min(Math.max(xPos, 10), maxX - 10);
    yPos = Math.min(Math.max(yPos, 10), maxY - 10);
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

// Make functions global
window.selectAnswer = selectAnswer;
window.jumpToQuestion = jumpToQuestion;
window.toggleCalculator = toggleCalculator;
window.handleModalClick = handleModalClick;
window.calculatorAppend = calculatorAppend;
window.calculatorOperator = calculatorOperator;
window.calculatorCalculate = calculatorCalculate;
window.calculatorClear = calculatorClear;
window.calculatorBackspace = calculatorBackspace;
window.calculatorMemory = calculatorMemory;
window.calculatorScientific = calculatorScientific;
window.switchSubject = switchSubject;
window.filterPalette = filterPalette;
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;