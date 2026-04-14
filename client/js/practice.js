// client/js/practice.js
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

let practiceState = {
    questions: [],
    currentIndex: 0,
    answers: {},
    checked: false,
    subject: null,
    subjectName: null,
    topic: null,
    difficulty: null,
    count: 10,
    results: { correct: 0, wrong: 0 },
    streak: 0
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Practice page loaded');
    checkAuth();
    loadPracticeStats();
    loadSubjects();
    displayUserInfo();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/auth.html';
}

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) userInfo.textContent = `Hi, ${user.full_name}`;
}

function logout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

async function loadSubjects() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/ai-questions/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load subjects');
        
        const data = await response.json();
        const subjects = data.subjects;
        
        const categories = {
            compulsory: { title: '📖 Compulsory', subjects: [] },
            science: { title: '🔬 Sciences', subjects: [] },
            arts: { title: '🎭 Arts & Humanities', subjects: [] },
            commercial: { title: '📊 Commercial & Social Sciences', subjects: [] }
        };
        
        subjects.forEach(subject => {
            if (categories[subject.category]) {
                categories[subject.category].subjects.push(subject);
            }
        });
        
        const subjectSelect = document.getElementById('subjectSelect');
        if (!subjectSelect) {
            console.error('Subject select element not found');
            return;
        }
        
        let html = '<option value="">Select Subject</option>';
        
        for (const [key, category] of Object.entries(categories)) {
            if (category.subjects.length === 0) continue;
            html += `<optgroup label="${category.title}">`;
            category.subjects.forEach(subject => {
                html += `<option value="${subject.id}">${subject.name}${subject.hasDiagrams ? ' 📐' : ''}</option>`;
            });
            html += `</optgroup>`;
        }
        
        subjectSelect.innerHTML = html;
        subjectSelect.addEventListener('change', loadTopics);
        
        console.log('Subjects loaded successfully');
        
    } catch (error) {
        console.error('Error loading subjects:', error);
        const subjectSelect = document.getElementById('subjectSelect');
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">Error loading subjects. Please refresh.</option>';
        }
    }
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect')?.value;
    const topicSelect = document.getElementById('topicSelect');
    
    if (!subjectId || !topicSelect) return;
    
    if (!subjectId) {
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        topicSelect.disabled = true;
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/ai-questions/topics/${subjectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load topics');
        
        const data = await response.json();
        
        let options = '<option value="all">All Topics</option>';
        if (data.topics && data.topics.length > 0) {
            data.topics.forEach(topic => {
                options += `<option value="${topic}">${topic}</option>`;
            });
        }
        
        topicSelect.innerHTML = options;
        topicSelect.disabled = false;
        
    } catch (error) {
        console.error('Error loading topics:', error);
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        topicSelect.disabled = false;
    }
}

function loadPracticeStats() {
    const stats = JSON.parse(localStorage.getItem('practiceStats') || '{"total":0,"correct":0,"streak":0}');
    
    const totalPracticed = document.getElementById('totalPracticed');
    const correctRate = document.getElementById('correctRate');
    const streakCount = document.getElementById('streakCount');
    
    if (totalPracticed) totalPracticed.textContent = stats.total || 0;
    if (correctRate) correctRate.textContent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) + '%' : '0%';
    if (streakCount) streakCount.textContent = stats.streak || 0;
}

function startPractice() {
    const subjectId = document.getElementById('subjectSelect')?.value;
    const topic = document.getElementById('topicSelect')?.value;
    const difficulty = document.getElementById('difficultySelect')?.value;
    const count = parseInt(document.getElementById('questionCount')?.value || 10);
    
    if (!subjectId) {
        alert('Please select a subject');
        return;
    }
    
    practiceState.subject = subjectId;
    practiceState.topic = topic !== 'all' ? topic : null;
    practiceState.difficulty = difficulty !== 'all' ? difficulty : null;
    practiceState.count = count;
    
    loadPracticeQuestions();
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

async function loadPracticeQuestions() {
    try {
        // Hide setup, show practice area
        const practiceSetup = document.getElementById('practiceSetup');
        const practiceArea = document.getElementById('practiceArea');
        const questionText = document.getElementById('questionText');
        
        if (practiceSetup) practiceSetup.style.display = 'none';
        if (practiceArea) practiceArea.style.display = 'block';
        if (questionText) questionText.textContent = 'Generating questions...';
        
        const token = localStorage.getItem('token');
        
        console.log('Generating questions for:', {
            subjectId: parseInt(practiceState.subject),
            topic: practiceState.topic,
            count: practiceState.count,
            difficulty: practiceState.difficulty || 'medium'
        });
        
        const response = await fetch(`${API_BASE}/api/ai-questions/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subjectId: parseInt(practiceState.subject),
                topic: practiceState.topic,
                count: practiceState.count,
                difficulty: practiceState.difficulty || 'medium',
                includeDiagrams: true
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate questions');
        }
        
        const data = await response.json();
        let questions = data.questions;
        
        if (!questions || questions.length === 0) {
            throw new Error('No questions generated');
        }
        
        questions = questions.map(q => randomizeQuestionOptions(q));
        
        practiceState.questions = questions;
        practiceState.currentIndex = 0;
        practiceState.answers = {};
        practiceState.checked = false;
        practiceState.results = { correct: 0, wrong: 0 };
        
        const totalQuestionsEl = document.getElementById('totalQuestions');
        if (totalQuestionsEl) totalQuestionsEl.textContent = practiceState.questions.length;
        
        renderQuestion();
        
    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to generate questions: ${error.message}`);
        resetPractice();
    }
}

function renderQuestion() {
    const question = practiceState.questions[practiceState.currentIndex];
    if (!question) return;
    
    const currentSubject = document.getElementById('currentSubject');
    const currentTopic = document.getElementById('currentTopic');
    const currentDifficulty = document.getElementById('currentDifficulty');
    const progressText = document.getElementById('progressText');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    
    if (currentSubject) currentSubject.textContent = question.subject;
    if (currentTopic) currentTopic.innerHTML = question.topic || 'General';
    if (currentDifficulty) currentDifficulty.textContent = question.difficulty || 'medium';
    if (progressText) progressText.textContent = `Question ${practiceState.currentIndex + 1}/${practiceState.questions.length}`;
    
    // Display question with diagram if available
    let questionHtml = question.question_text;
    if (questionText) questionText.innerHTML = questionHtml;
    
    const options = {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d
    };
    
    const savedAnswer = practiceState.answers[question.id];
    
    if (optionsContainer) {
        optionsContainer.innerHTML = ['A', 'B', 'C', 'D'].map(letter => `
            <div class="practice-option ${savedAnswer === letter ? 'selected' : ''}" 
                 onclick="selectOption('${question.id}', '${letter}')">
                <span class="option-letter">${letter}</span>
                <span>${options[letter]}</span>
            </div>
        `).join('');
    }
    
    const feedbackBox = document.getElementById('feedbackBox');
    const checkBtn = document.getElementById('checkBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (feedbackBox) feedbackBox.classList.remove('show');
    if (checkBtn) checkBtn.disabled = !!savedAnswer;
    if (nextBtn) nextBtn.disabled = true;
}

function selectOption(questionId, letter) {
    if (practiceState.checked) return;
    
    practiceState.answers[questionId] = letter;
    
    document.querySelectorAll('.practice-option').forEach(opt => {
        const optLetter = opt.querySelector('.option-letter')?.textContent;
        if (optLetter === letter) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) checkBtn.disabled = false;
}

function checkAnswer() {
    const question = practiceState.questions[practiceState.currentIndex];
    const selectedAnswer = practiceState.answers[question.id];
    
    if (!selectedAnswer) {
        alert('Please select an answer first');
        return;
    }
    
    practiceState.checked = true;
    
    const correctAnswer = question.correct_answer;
    const isCorrect = selectedAnswer === correctAnswer;
    
    document.querySelectorAll('.practice-option').forEach(opt => {
        const letter = opt.querySelector('.option-letter')?.textContent;
        if (letter === correctAnswer) {
            opt.classList.add('correct');
        } else if (letter === selectedAnswer && !isCorrect) {
            opt.classList.add('wrong');
        }
    });
    
    if (isCorrect) {
        practiceState.results.correct++;
        practiceState.streak++;
    } else {
        practiceState.results.wrong++;
        practiceState.streak = 0;
        showEncouragement();
    }
    
    const feedbackBox = document.getElementById('feedbackBox');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const explanation = document.getElementById('explanation');
    
    const correctAnswerText = question[`option_${correctAnswer.toLowerCase()}`];
    
    if (feedbackMessage) {
        feedbackMessage.innerHTML = isCorrect ? 
            '<div class="feedback-correct">✓ Correct! Well done!</div>' :
            `<div class="feedback-wrong">✗ Wrong. The correct answer is: ${correctAnswer}. ${correctAnswerText}</div>`;
    }
    
    if (explanation) explanation.textContent = question.explanation || 'No explanation available.';
    if (feedbackBox) feedbackBox.classList.add('show');
    
    const nextBtn = document.getElementById('nextBtn');
    const checkBtn = document.getElementById('checkBtn');
    const streakCount = document.getElementById('streakCount');
    
    if (nextBtn) nextBtn.disabled = false;
    if (checkBtn) checkBtn.disabled = true;
    if (streakCount) streakCount.textContent = practiceState.streak;
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
    const practiceArea = document.getElementById('practiceArea');
    const practiceSummary = document.getElementById('practiceSummary');
    
    if (practiceArea) practiceArea.style.display = 'none';
    if (practiceSummary) practiceSummary.style.display = 'block';
    
    const total = practiceState.questions.length;
    const correct = practiceState.results.correct;
    const wrong = practiceState.results.wrong;
    const accuracy = Math.round((correct / total) * 100);
    
    const summaryCorrect = document.getElementById('summaryCorrect');
    const summaryWrong = document.getElementById('summaryWrong');
    const summaryAccuracy = document.getElementById('summaryAccuracy');
    
    if (summaryCorrect) summaryCorrect.textContent = correct;
    if (summaryWrong) summaryWrong.textContent = wrong;
    if (summaryAccuracy) summaryAccuracy.textContent = accuracy + '%';
    
    savePracticeStats();
    showMotivationalMessage(accuracy, correct, total);
}

function showMotivationalMessage(accuracy, correct, total) {
    const messageDiv = document.getElementById('motivationalMessage');
    if (!messageDiv) return;
    
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
        <div style="font-size: 2rem; margin-bottom: 10px;">${emoji}</div>
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
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 1000;
        border-left: 3px solid #e6a017;
    `;
    popup.innerHTML = `
        <div style="font-size: 1.5rem;">${msg.emoji}</div>
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
    
    // Update the stats display
    loadPracticeStats();
}

function resetPractice() {
    const practiceSetup = document.getElementById('practiceSetup');
    const practiceArea = document.getElementById('practiceArea');
    const practiceSummary = document.getElementById('practiceSummary');
    
    if (practiceSetup) practiceSetup.style.display = 'block';
    if (practiceArea) practiceArea.style.display = 'none';
    if (practiceSummary) practiceSummary.style.display = 'none';
}

function practiceAgain() {
    resetPractice();
    startPractice();
}

function reviewMistakes() {
    const wrongQuestions = practiceState.questions.filter((q) => {
        return practiceState.answers[q.id] !== q.correct_answer;
    });
    localStorage.setItem('reviewQuestions', JSON.stringify(wrongQuestions));
    window.location.href = '/review.html';
}

function sharePracticeResults() {
    const correct = practiceState.results.correct;
    const total = practiceState.questions.length;
    const accuracy = Math.round((correct / total) * 100);
    
    const text = `📚 JAMB Practice Results\n✓ Correct: ${correct}\n✗ Wrong: ${practiceState.results.wrong}\n📊 Accuracy: ${accuracy}%\n🔥 Streak: ${practiceState.streak}\n\nPractice with JAMB Simulator!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// Global functions
window.startPractice = startPractice;
window.selectOption = selectOption;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.practiceAgain = practiceAgain;
window.reviewMistakes = reviewMistakes;
window.sharePracticeResults = sharePracticeResults;
window.logout = logout;