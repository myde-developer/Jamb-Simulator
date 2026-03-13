// Exam state
let examState = {
    questions: [],
    currentIndex: 0,
    answers: {},
    timeRemaining: 7200, // 2 hours
    timerInterval: null,
    subjects: [],
    examId: null,
    startTime: null
};

// API Base URL - automatically detects environment
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : ''; // Empty for production (same domain)

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadExamData();
    setupEventListeners();
    startTimer();
    displayUserInfo();
});

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (user.full_name) {
        userInfo.textContent = `Welcome, ${user.full_name}`;
    }
}

function loadExamData() {
    const selectedSubjects = JSON.parse(localStorage.getItem('jambSelectedSubjects')) || [];
    examState.subjects = selectedSubjects;
    examState.startTime = new Date().toISOString();
    
    displaySubjectsBadge(selectedSubjects);
    
    // Try API first, fallback to sample data
    fetchExamQuestions(selectedSubjects);
}

function displaySubjectsBadge(subjects) {
    const badgeContainer = document.getElementById('subjectsBadge');
    badgeContainer.innerHTML = subjects.map(s => 
        `<span class="subject-tag">${s.code}</span>`
    ).join('');
}

async function fetchExamQuestions(subjects) {
    try {
        document.getElementById('questionContainer').innerHTML = 
            '<div style="text-align: center; padding: 50px;">Loading 180 questions from 2,000+ database...</div>';
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/exam/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                subjects: subjects.map(s => ({ id: s.id, name: s.name }))
            })
        });
        
        if (!response.ok) throw new Error('API failed');
        
        const questions = await response.json();
        examState.questions = questions;
        examState.examId = generateExamId();
        
        renderQuestion(0);
        renderPalette();
        
    } catch (error) {
        console.log('Using local questions:', error);
        loadLocalQuestions();
    }
}

function loadLocalQuestions() {
    // Sample questions for demo (in production, these come from DB)
    const questions = [];
    const subjects = examState.subjects;
    
    subjects.forEach(subject => {
        const count = subject.name === 'Use of English' ? 60 : 40;
        for (let i = 1; i <= count; i++) {
            questions.push({
                id: `${subject.id}-${i}`,
                subjectId: subject.id,
                subject: subject.name,
                question: `${subject.name} Question ${i}: This is a sample JAMB-style question to test your knowledge.`,
                options: {
                    A: 'First option',
                    B: 'Second option', 
                    C: 'Third option',
                    D: 'Fourth option'
                },
                correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                explanation: 'This is a sample explanation for the correct answer.'
            });
        }
    });
    
    examState.questions = shuffleArray(questions);
    examState.examId = generateExamId();
    
    renderQuestion(0);
    renderPalette();
}

function renderQuestion(index) {
    const question = examState.questions[index];
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
        if (opt.querySelector('.option-letter').textContent === answer) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    updatePaletteItem(questionId);
    saveAnswerToServer(questionId, answer);
}

async function saveAnswerToServer(questionId, answer) {
    if (!examState.examId) return;
    
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/exam/save-answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                examId: examState.examId,
                questionId: questionId,
                selectedAnswer: answer
            })
        });
    } catch (error) {
        // Silently fail - answers saved locally
    }
}

function renderPalette() {
    const palette = document.getElementById('paletteGrid');
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
    document.getElementById('progressFill').style.width = `${progress}%`;
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
    timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (examState.timeRemaining < 300) {
        timerElement.className = 'timer danger';
    } else if (examState.timeRemaining < 600) {
        timerElement.className = 'timer warning';
    }
}

function setupEventListeners() {
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (examState.currentIndex > 0) {
            examState.currentIndex--;
            renderQuestion(examState.currentIndex);
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (examState.currentIndex < examState.questions.length - 1) {
            examState.currentIndex++;
            renderQuestion(examState.currentIndex);
        }
    });
    
    document.getElementById('submitBtn').addEventListener('click', submitExam);
}

function submitExam() {
    if (Object.keys(examState.answers).length < examState.questions.length) {
        if (!confirm(`You have answered ${Object.keys(examState.answers).length} out of ${examState.questions.length} questions. Submit anyway?`)) {
            return;
        }
    }
    
    clearInterval(examState.timerInterval);
    
    // Calculate JAMB scores
    const results = calculateJAMBScores();
    
    // Save results
    saveExamResults(results);
    
    // Store for results page
    localStorage.setItem('lastExamResults', JSON.stringify({
        questions: examState.questions,
        answers: examState.answers,
        scores: results,
        subjects: examState.subjects,
        date: new Date().toISOString()
    }));
    
    window.location.href = 'results.html';
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

async function saveExamResults(results) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/exam/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                examId: examState.examId,
                subjects: examState.subjects.map(s => s.id),
                score: results.total,
                percentage: results.percentage,
                answers: examState.answers,
                startTime: examState.startTime,
                endTime: new Date().toISOString()
            })
        });
    } catch (error) {
        console.log('Results saved locally');
    }
}

function generateExamId() {
    return 'EXAM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Make functions global for onclick handlers
window.selectAnswer = selectAnswer;
window.jumpToQuestion = jumpToQuestion;