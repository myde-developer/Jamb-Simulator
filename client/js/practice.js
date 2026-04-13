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

document.addEventListener('DOMContentLoaded', () => {
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
            compulsory: { title: 'Compulsory', subjects: [] },
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
        
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect').value;
    const topicSelect = document.getElementById('topicSelect');
    
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
        data.topics.forEach(topic => {
            options += `<option value="${topic}">${topic}</option>`;
        });
        
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
    document.getElementById('totalPracticed').textContent = stats.total || 0;
    document.getElementById('correctRate').textContent = 
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) + '%' : '0%';
    document.getElementById('streakCount').textContent = stats.streak || 0;
}

function startPractice() {
    const subjectId = document.getElementById('subjectSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    const count = parseInt(document.getElementById('questionCount').value);
    
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
        document.getElementById('practiceSetup').style.display = 'none';
        document.getElementById('practiceArea').style.display = 'block';
        document.getElementById('questionText').textContent = 'Generating questions...';
        
        const token = localStorage.getItem('token');
        
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
        
        document.getElementById('totalQuestions').textContent = practiceState.questions.length;
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
    
    document.getElementById('currentSubject').textContent = question.subject;
    document.getElementById('currentTopic').innerHTML = question.topic || 'General';
    document.getElementById('currentDifficulty').textContent = question.difficulty || 'medium';
    document.getElementById('progressText').textContent = `Question ${practiceState.currentIndex + 1}/${practiceState.questions.length}`;
    
    let questionHtml = question.question_text;
    if (question.diagram_url) {
        questionHtml += `
            <div style="margin: 20px 0; text-align: center;">
                <img src="${question.diagram_url}" alt="Diagram" style="max-width: 100%; border-radius: 8px; border: 1px solid #e1e5eb;">
            </div>
        `;
    }
    document.getElementById('questionText').innerHTML = questionHtml;
    
    const options = {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d
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
    
    const correctAnswer = question.correct_answer;
    const isCorrect = selectedAnswer === correctAnswer;
    
    document.querySelectorAll('.practice-option').forEach(opt => {
        const letter = opt.querySelector('.option-letter').textContent;
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
    
    feedbackMessage.innerHTML = isCorrect ? 
        '<div class="feedback-correct">✓ Correct! Well done!</div>' :
        `<div class="feedback-wrong">✗ Wrong. The correct answer is: ${correctAnswer}. ${correctAnswerText}</div>`;
    
    explanation.textContent = question.explanation || 'No explanation available.';
    feedbackBox.classList.add('show');
    
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('checkBtn').disabled = true;
    document.getElementById('streakCount').textContent = practiceState.streak;
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

window.startPractice = startPractice;
window.selectOption = selectOption;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.practiceAgain = practiceAgain;
window.reviewMistakes = reviewMistakes;
window.sharePracticeResults = sharePracticeResults;
window.logout = logout;