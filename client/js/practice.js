// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

// Practice state
let practiceState = {
    questions: [],
    currentIndex: 0,
    answers: {},
    checked: false,
    subject: null,
    topic: null,
    difficulty: null,
    count: 10,
    results: {
        correct: 0,
        wrong: 0
    },
    streak: 0,
    allTopics: {
        1: [], 2: [], 3: [], 4: [], 5: []
    }
};

// Practice calculator state
let practiceCalculator = {
    currentInput: '',
    previousInput: '',
    operator: null,
    memory: 0
};

// Draggable Calculator state
let dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    currentX: 0,
    currentY: 0,
    modal: null,
    header: null,
    content: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadPracticeStats();
    loadTopicsFromDatabase();
    setupSubjectListener();
    displayUserInfo();
    if (window.studyStreak) studyStreak.init();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }
}

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) {
        userInfo.textContent = `Hi, ${user.full_name}`;
    }
}

// Load topics from database for all subjects
async function loadTopicsFromDatabase() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch topics for each subject (1-5)
        for (let subjectId = 1; subjectId <= 5; subjectId++) {
            const response = await fetch(`${API_BASE}/api/practice/topics/${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const topics = await response.json();
                practiceState.allTopics[subjectId] = topics;
            }
        }
        
        // Update the subject listener to use fetched topics
        setupSubjectListener();
        
    } catch (error) {
        console.error('Error loading topics from database:', error);
        // Fallback to empty topics - user can still practice with "All Topics"
    }
}

function setupSubjectListener() {
    const subjectSelect = document.getElementById('subjectSelect');
    const topicSelect = document.getElementById('topicSelect');
    
    subjectSelect.addEventListener('change', function() {
        const subjectId = this.value;
        
        if (!subjectId) {
            topicSelect.innerHTML = '<option value="">Select Topic</option>';
            topicSelect.disabled = true;
            return;
        }
        
        // Get topics from database (loaded earlier)
        const topics = practiceState.allTopics[subjectId] || [];
        
        // Build topic options
        let options = '<option value="all">All Topics</option>';
        
        if (topics.length > 0) {
            topics.forEach(topic => {
                options += `<option value="${topic}">${topic}</option>`;
            });
        } else {
            options += '<option value="" disabled>No topics available</option>';
        }
        
        topicSelect.innerHTML = options;
        topicSelect.disabled = false;
    });
}

function loadPracticeStats() {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');
    document.getElementById('totalPracticed').textContent = stats.total || 0;
    document.getElementById('correctRate').textContent = 
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) + '%' : '0%';
    document.getElementById('streakCount').textContent = stats.streak || 0;
}

function startPractice() {
    const subject = document.getElementById('subjectSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    const count = parseInt(document.getElementById('questionCount').value);
    
    if (!subject) {
        alert('Please select a subject');
        return;
    }
    
    practiceState.subject = subject;
    practiceState.topic = topic !== 'all' ? topic : null;
    practiceState.difficulty = difficulty !== 'all' ? difficulty : null;
    practiceState.count = count;
    
    loadPracticeQuestions();
}

async function loadPracticeQuestions() {
    try {
        document.getElementById('practiceSetup').style.display = 'none';
        document.getElementById('practiceArea').style.display = 'block';
        document.getElementById('questionText').textContent = 'Loading questions...';
        
        const token = localStorage.getItem('token');
        
        const requestBody = {
            subject_id: practiceState.subject,
            topic: practiceState.topic || null,
            difficulty: practiceState.difficulty,
            count: practiceState.count
        };
        
        console.log('Fetching practice questions:', requestBody);
        
        const response = await fetch(`${API_BASE}/api/practice/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const questions = await response.json();
        
        if (!questions || questions.length === 0) {
            alert('No questions available for this selection. Try different criteria.');
            resetPractice();
            return;
        }
        
        practiceState.questions = questions;
        practiceState.currentIndex = 0;
        practiceState.answers = {};
        practiceState.checked = false;
        practiceState.results = { correct: 0, wrong: 0 };
        
        document.getElementById('totalQuestions').textContent = questions.length;
        renderQuestion();
        
    } catch (error) {
        console.error('Error loading questions:', error);
        alert(`❌ Failed to load questions: ${error.message}`);
        resetPractice();
    }
}

function renderQuestion() {
    const question = practiceState.questions[practiceState.currentIndex];
    if (!question) return;
    
    document.getElementById('currentSubject').textContent = question.subject || 'Unknown';
    document.getElementById('currentTopic').textContent = question.topic || 'General';
    document.getElementById('currentDifficulty').textContent = question.difficulty || 'medium';
    document.getElementById('currentQuestionNum').textContent = practiceState.currentIndex + 1;
    document.getElementById('totalQuestions').textContent = practiceState.questions.length;
    document.getElementById('questionText').textContent = question.question_text || question.question;
    
    // Handle both database format and frontend format
    const options = {
        A: question.option_a || question.options?.A || 'Option A',
        B: question.option_b || question.options?.B || 'Option B',
        C: question.option_c || question.options?.C || 'Option C',
        D: question.option_d || question.options?.D || 'Option D'
    };
    
    const savedAnswer = practiceState.answers[question.id];
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = ['A', 'B', 'C', 'D'].map(letter => `
        <div class="practice-option ${savedAnswer === letter ? 'selected' : ''}" 
             onclick="selectOption('${question.id}', '${letter}')">
            <span class="option-letter">${letter}</span>
            <span>${options[letter]}</span>
        </div>
    `).join('');
    
    document.getElementById('feedbackBox').classList.remove('show');
    document.getElementById('checkBtn').disabled = !!savedAnswer;
    document.getElementById('nextBtn').disabled = true;
}

function selectOption(questionId, letter) {
    if (practiceState.checked) return;
    
    practiceState.answers[questionId] = letter;
    
    document.querySelectorAll('.practice-option').forEach(opt => {
        const optLetter = opt.querySelector('.option-letter').textContent;
        if (optLetter === letter) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    document.getElementById('checkBtn').disabled = false;
}

function checkAnswer() {
    const question = practiceState.questions[practiceState.currentIndex];
    const selectedAnswer = practiceState.answers[question.id];
    
    if (!selectedAnswer) {
        alert('Please select an answer first');
        return;
    }
    
    practiceState.checked = true;
    
    // Get correct answer from either format
    const correctAnswer = question.correct_answer || question.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Update option styling
    document.querySelectorAll('.practice-option').forEach(opt => {
        const letter = opt.querySelector('.option-letter').textContent;
        if (letter === correctAnswer) {
            opt.classList.add('correct');
        } else if (letter === selectedAnswer && !isCorrect) {
            opt.classList.add('wrong');
        }
    });
    
    // Update results
    if (isCorrect) {
        practiceState.results.correct++;
        practiceState.streak++;
        if (window.studyStreak) window.studyStreak.checkAndUpdateStreak();
    } else {
        practiceState.results.wrong++;
        practiceState.streak = 0;
        showEncouragement();
    }
    
    // Show feedback
    const feedbackBox = document.getElementById('feedbackBox');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const explanation = document.getElementById('explanation');
    
    feedbackMessage.innerHTML = isCorrect ? 
        '<div class="feedback-correct">✅ Correct! Well done!</div>' :
        `<div class="feedback-wrong">❌ Wrong. The correct answer is ${correctAnswer}.</div>`;
    
    explanation.textContent = question.explanation || 'No explanation available.';
    feedbackBox.classList.add('show');
    
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('checkBtn').disabled = true;
    
    if (window.studyStreak) {
        document.getElementById('streakCount').textContent = practiceState.streak;
    }
}

function nextQuestion() {
    if (practiceState.currentIndex < practiceState.questions.length - 1) {
        practiceState.currentIndex++;
        practiceState.checked = false;
        renderQuestion();
    } else {
        showPracticeSummary();
    }
}

function showPracticeSummary() {
    document.getElementById('practiceArea').style.display = 'none';
    document.getElementById('practiceSummary').style.display = 'block';
    
    const total = practiceState.questions.length;
    const correct = practiceState.results.correct;
    const wrong = practiceState.results.wrong;
    const accuracy = Math.round((correct / total) * 100);
    
    document.getElementById('summaryCorrect').textContent = correct;
    document.getElementById('summaryWrong').textContent = wrong;
    document.getElementById('summaryAccuracy').textContent = accuracy + '%';
    
    savePracticeStats();
    showMotivationalMessage(accuracy, correct, total);
}

function showMotivationalMessage(accuracy, correct, total) {
    const messageDiv = document.getElementById('motivationalMessage');
    let message = '', emoji = '';
    
    if (accuracy >= 90) {
        message = "Excellent! You're a champion! 🌟";
        emoji = "🏆";
    } else if (accuracy >= 70) {
        message = "Great job! Keep it up! 💪";
        emoji = "🎯";
    } else if (accuracy >= 50) {
        message = "Good effort! Practice more! 📚";
        emoji = "📝";
    } else {
        message = "Don't give up! You'll get better! 🌱";
        emoji = "💫";
    }
    
    messageDiv.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 10px;">${emoji}</div>
        <h3 style="color: #333; margin-bottom: 10px;">${message}</h3>
        <p style="color: #666;">You got ${correct} out of ${total} correct!</p>
    `;
}

function showEncouragement() {
    const encouragements = [
        { emoji: '💪', quote: "Keep going!", message: "Every mistake is a learning opportunity." },
        { emoji: '🎯', quote: "Focus!", message: "You'll get the next one right." },
        { emoji: '🌱', quote: "Growing!", message: "This is how we learn and improve." },
        { emoji: '📚', quote: "Keep studying!", message: "Success comes with practice." }
    ];
    
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    const popup = document.createElement('div');
    popup.className = 'encouragement-popup';
    popup.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s;
        text-align: center;
    `;
    popup.innerHTML = `
        <div style="font-size: 2rem;">${msg.emoji}</div>
        <h4 style="margin: 5px 0; color: #333;">${msg.quote}</h4>
        <p style="margin: 0; color: #666;">${msg.message}</p>
    `;
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

function savePracticeStats() {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');
    stats.total += practiceState.questions.length;
    stats.correct += practiceState.results.correct;
    stats.streak = practiceState.streak;
    localStorage.setItem('practiceStats', JSON.stringify(stats));
    
    // Update achievement stats if available
    if (window.updatePracticeStats) {
        window.updatePracticeStats(practiceState.results.correct, practiceState.questions.length);
    }
}

function resetPractice() {
    document.getElementById('practiceSetup').style.display = 'flex';
    document.getElementById('practiceArea').style.display = 'none';
    document.getElementById('practiceSummary').style.display = 'none';
}

function practiceAgain() {
    resetPractice();
    startPractice();
}

function reviewMistakes() {
    const wrongQuestions = practiceState.questions.filter((q, index) => {
        return practiceState.answers[q.id] !== q.correct_answer;
    });
    localStorage.setItem('reviewQuestions', JSON.stringify(wrongQuestions));
    window.location.href = '/review.html';
}

function sharePracticeResults() {
    const correct = practiceState.results.correct;
    const total = practiceState.questions.length;
    const accuracy = Math.round((correct / total) * 100);
    
    const text = `📚 JAMB Practice Results\n✅ Correct: ${correct}\n❌ Wrong: ${practiceState.results.wrong}\n📊 Accuracy: ${accuracy}%\n🔥 Streak: ${practiceState.streak}\n\nPractice with JAMB Simulator!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    if (window.updateShareStats) window.updateShareStats();
}

// ============ FIXED CALCULATOR FUNCTIONS ============

// Toggle calculator modal
function togglePracticeCalculator() {
    const modal = document.getElementById('practiceCalculatorModal');
    const btn = document.getElementById('practiceCalculatorToggle');
    
    if (modal.style.display === 'none' || !modal.style.display) {
        modal.style.display = 'block';
        btn.textContent = '🧮 Hide Calculator';
        
        // Reset calculator position
        const content = modal.querySelector('.calculator-modal-content');
        if (content) {
            content.style.transform = '';
            content.style.top = '';
            content.style.left = '';
        }
        
        renderPracticeCalculator();
        
        // Make draggable after rendering
        setTimeout(() => {
            makeCalculatorDraggable();
        }, 100);
    } else {
        modal.style.display = 'none';
        btn.textContent = '🧮 Show Calculator';
        
        // Reset position when closing
        const content = modal.querySelector('.calculator-modal-content');
        if (content) {
            content.style.transform = '';
            content.style.top = '';
            content.style.left = '';
        }
    }
}

// Close calculator modal
function closePracticeCalculator() {
    const modal = document.getElementById('practiceCalculatorModal');
    const btn = document.getElementById('practiceCalculatorToggle');
    
    modal.style.display = 'none';
    btn.textContent = '🧮 Show Calculator';
    
    // Reset position
    const content = modal.querySelector('.calculator-modal-content');
    if (content) {
        content.style.transform = '';
        content.style.top = '';
        content.style.left = '';
    }
}

// Render calculator
function renderPracticeCalculator() {
    const container = document.getElementById('practiceCalculator');
    
    container.innerHTML = `
        <div class="calc-display">
            <div class="calc-expression" id="practiceCalcExpression"></div>
            <div class="calc-result" id="practiceCalcResult">0</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px;">
            <button class="calc-btn operator" onclick="practiceCalculatorMemory('clear')">MC</button>
            <button class="calc-btn operator" onclick="practiceCalculatorMemory('recall')">MR</button>
            <button class="calc-btn operator" onclick="practiceCalculatorMemory('add')">M+</button>
            <button class="calc-btn operator" onclick="practiceCalculatorMemory('subtract')">M-</button>
        </div>
        
        <div class="calc-grid">
            <button class="calc-btn clear" onclick="practiceCalculatorClear()">C</button>
            <button class="calc-btn operator" onclick="practiceCalculatorAppend('%')">%</button>
            <button class="calc-btn operator" onclick="practiceCalculatorAppend('/')">÷</button>
            <button class="calc-btn operator" onclick="practiceCalculatorBackspace()">⌫</button>
            
            <button class="calc-btn number" onclick="practiceCalculatorAppend('7')">7</button>
            <button class="calc-btn number" onclick="practiceCalculatorAppend('8')">8</button>
            <button class="calc-btn number" onclick="practiceCalculatorAppend('9')">9</button>
            <button class="calc-btn operator" onclick="practiceCalculatorSetOperator('*')">×</button>
            
            <button class="calc-btn number" onclick="practiceCalculatorAppend('4')">4</button>
            <button class="calc-btn number" onclick="practiceCalculatorAppend('5')">5</button>
            <button class="calc-btn number" onclick="practiceCalculatorAppend('6')">6</button>
            <button class="calc-btn operator" onclick="practiceCalculatorSetOperator('-')">−</button>
            
            <button class="calc-btn number" onclick="practiceCalculatorAppend('1')">1</button>
            <button class="calc-btn number" onclick="practiceCalculatorAppend('2')">2</button>
            <button class="calc-btn number" onclick="practiceCalculatorAppend('3')">3</button>
            <button class="calc-btn operator" onclick="practiceCalculatorSetOperator('+')">+</button>
            
            <button class="calc-btn number" onclick="practiceCalculatorAppend('0')">0</button>
            <button class="calc-btn number" onclick="practiceCalculatorAppend('.')">.</button>
            <button class="calc-btn equals" onclick="practiceCalculatorCalculate()" style="grid-column: span 2;">=</button>
        </div>
        
        <div style="margin-top: 15px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <button class="calc-btn operator" onclick="practiceCalculatorScientific('sqrt')">√</button>
            <button class="calc-btn operator" onclick="practiceCalculatorScientific('square')">x²</button>
            <button class="calc-btn operator" onclick="practiceCalculatorScientific('sin')">sin</button>
            <button class="calc-btn operator" onclick="practiceCalculatorScientific('cos')">cos</button>
        </div>
    `;
    
    updatePracticeCalculatorDisplay();
}

// FIXED: Calculate function - Now works properly!
function practiceCalculatorCalculate() {
    // Case 1: We have an operator and both inputs
    if (practiceCalculator.operator && practiceCalculator.previousInput !== '' && practiceCalculator.currentInput !== '') {
        let result;
        const prev = parseFloat(practiceCalculator.previousInput);
        const curr = parseFloat(practiceCalculator.currentInput);
        
        if (isNaN(prev) || isNaN(curr)) return;
        
        switch(practiceCalculator.operator) {
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
        
        // Store result and clear operator
        practiceCalculator.currentInput = result.toString();
        practiceCalculator.operator = null;
        practiceCalculator.previousInput = '';
        updatePracticeCalculatorDisplay();
        
        // Add haptic feedback
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([10, 10, 10]);
        }
    }
    // Case 2: Only one number entered - just show it
    else if (practiceCalculator.currentInput !== '') {
        updatePracticeCalculatorDisplay();
    }
}

// FIXED: Set operator
function practiceCalculatorSetOperator(op) {
    // If we have both previous and current, calculate first
    if (practiceCalculator.previousInput !== '' && practiceCalculator.currentInput !== '' && practiceCalculator.operator) {
        practiceCalculatorCalculate();
    }
    
    // Store current as previous and set operator
    if (practiceCalculator.currentInput !== '') {
        practiceCalculator.operator = op;
        practiceCalculator.previousInput = practiceCalculator.currentInput;
        practiceCalculator.currentInput = '';
    } else if (practiceCalculator.previousInput !== '' && practiceCalculator.operator) {
        // Just change operator if we have previous
        practiceCalculator.operator = op;
    }
    
    updatePracticeCalculatorDisplay();
}

// Append number or decimal
function practiceCalculatorAppend(value) {
    // Don't add multiple decimals
    if (value === '.' && practiceCalculator.currentInput.includes('.')) return;
    
    // Limit length to prevent overflow
    if (practiceCalculator.currentInput.length < 15) {
        practiceCalculator.currentInput += value;
    }
    
    updatePracticeCalculatorDisplay();
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(5);
    }
}

// Backspace function
function practiceCalculatorBackspace() {
    practiceCalculator.currentInput = practiceCalculator.currentInput.slice(0, -1);
    updatePracticeCalculatorDisplay();
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(3);
    }
}

// Clear function
function practiceCalculatorClear() {
    practiceCalculator.currentInput = '';
    practiceCalculator.previousInput = '';
    practiceCalculator.operator = null;
    updatePracticeCalculatorDisplay();
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(5);
    }
}

// Scientific functions
function practiceCalculatorScientific(func) {
    if (practiceCalculator.currentInput === '') return;
    
    let value = parseFloat(practiceCalculator.currentInput);
    if (isNaN(value)) return;
    
    let result;
    
    switch(func) {
        case 'sqrt': 
            if (value < 0) {
                alert('Cannot calculate square root of negative number');
                return;
            }
            result = Math.sqrt(value); 
            break;
        case 'square': result = Math.pow(value, 2); break;
        case 'sin': result = Math.sin(value * Math.PI / 180); break;
        case 'cos': result = Math.cos(value * Math.PI / 180); break;
        default: return;
    }
    
    practiceCalculator.currentInput = result.toString();
    practiceCalculator.operator = null;
    practiceCalculator.previousInput = '';
    updatePracticeCalculatorDisplay();
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
    }
}

// Memory functions
function practiceCalculatorMemory(action) {
    switch(action) {
        case 'clear': 
            practiceCalculator.memory = 0; 
            break;
        case 'recall': 
            practiceCalculator.currentInput = practiceCalculator.memory.toString();
            practiceCalculator.operator = null;
            practiceCalculator.previousInput = '';
            break;
        case 'add': 
            if (practiceCalculator.currentInput !== '') {
                practiceCalculator.memory += parseFloat(practiceCalculator.currentInput) || 0;
            }
            break;
        case 'subtract':
            if (practiceCalculator.currentInput !== '') {
                practiceCalculator.memory -= parseFloat(practiceCalculator.currentInput) || 0;
            }
            break;
    }
    updatePracticeCalculatorDisplay();
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(8);
    }
}

// Update display
function updatePracticeCalculatorDisplay() {
    const expression = document.getElementById('practiceCalcExpression');
    const result = document.getElementById('practiceCalcResult');
    
    if (expression) {
        if (practiceCalculator.previousInput && practiceCalculator.operator) {
            expression.textContent = `${practiceCalculator.previousInput} ${practiceCalculator.operator}`;
        } else if (practiceCalculator.previousInput) {
            expression.textContent = practiceCalculator.previousInput;
        } else {
            expression.textContent = '';
        }
    }
    
    if (result) {
        result.textContent = practiceCalculator.currentInput || '0';
    }
}

function makeCalculatorDraggable() {
    const modal = document.getElementById('practiceCalculatorModal');
    const header = modal?.querySelector('.calculator-modal-header');
    const content = modal?.querySelector('.calculator-modal-content');
    
    if (!header || !content || !modal) return;
    
    // Reset any existing transforms on open
    if (modal.style.display === 'block') {
        content.style.transform = '';
        content.style.top = '';
        content.style.left = '';
    }
    
    dragState.modal = modal;
    dragState.header = header;
    dragState.content = content;
    
    // Remove existing listeners
    header.removeEventListener('mousedown', startDrag);
    header.removeEventListener('touchstart', startDrag);
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
    
    // Add new listeners
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });
}

function startDrag(e) {
    // Don't drag if clicking the close button
    if (e.target.classList.contains('close-btn')) {
        // Let the close button work normally
        return;
    }
    
    e.preventDefault();
    
    const modal = document.getElementById('practiceCalculatorModal');
    const content = modal.querySelector('.calculator-modal-content');
    
    // Store initial positions
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    
    // Get current transform
    const transform = content.style.transform;
    let currentX = 0, currentY = 0;
    
    if (transform && transform !== 'none') {
        const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
        if (match) {
            currentX = parseFloat(match[1]) || 0;
            currentY = parseFloat(match[2]) || 0;
        }
    }
    
    dragState.isDragging = true;
    dragState.startX = clientX;
    dragState.startY = clientY;
    dragState.offsetX = currentX;
    dragState.offsetY = currentY;
    
    modal.classList.add('dragging');
    content.style.cursor = 'grabbing';
    content.style.transition = 'none';
    content.style.userSelect = 'none';
    
    // Add class for mobile
    if (window.innerWidth <= 768) {
        content.classList.add('dragging-mobile');
    }
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
    if (!dragState.isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    
    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;
    
    const newX = dragState.offsetX + deltaX;
    const newY = dragState.offsetY + deltaY;
    
    // Apply transform
    const content = dragState.content;
    content.style.transform = `translate(${newX}px, ${newY}px)`;
}

function stopDrag() {
    if (!dragState.isDragging) return;
    
    dragState.isDragging = false;
    
    const modal = document.getElementById('practiceCalculatorModal');
    const content = modal.querySelector('.calculator-modal-content');
    
    modal.classList.remove('dragging');
    content.style.cursor = '';
    content.style.transition = 'transform 0.1s ease';
    content.style.userSelect = '';
    content.classList.remove('dragging-mobile');
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
}

// Test function to verify calculator is working
function testCalculator() {
    console.log('✅ Calculator functions loaded successfully');
    console.log('- Calculate function:', typeof practiceCalculatorCalculate);
    console.log('- Set Operator function:', typeof practiceCalculatorSetOperator);
    console.log('- Append function:', typeof practiceCalculatorAppend);
}

// Run test on load
setTimeout(testCalculator, 1000);

// ============ MAKE ALL FUNCTIONS GLOBAL ============
window.startPractice = startPractice;
window.selectOption = selectOption;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.practiceAgain = practiceAgain;
window.reviewMistakes = reviewMistakes;
window.sharePracticeResults = sharePracticeResults;
window.togglePracticeCalculator = togglePracticeCalculator;
window.closePracticeCalculator = closePracticeCalculator;
window.renderPracticeCalculator = renderPracticeCalculator;
window.practiceCalculatorAppend = practiceCalculatorAppend;
window.practiceCalculatorSetOperator = practiceCalculatorSetOperator;
window.practiceCalculatorCalculate = practiceCalculatorCalculate;
window.practiceCalculatorClear = practiceCalculatorClear;
window.practiceCalculatorBackspace = practiceCalculatorBackspace;
window.practiceCalculatorMemory = practiceCalculatorMemory;
window.practiceCalculatorScientific = practiceCalculatorScientific;
window.makeCalculatorDraggable = makeCalculatorDraggable;
window.updatePracticeCalculatorDisplay = updatePracticeCalculatorDisplay;
window.testCalculator = testCalculator;