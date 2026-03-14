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

// Flashcards state
let flashcardState = {
    deck: [],
    currentIndex: 0,
    cards: [],
    results: {
        easy: 0,
        medium: 0,
        hard: 0
    },
    spacedRepetition: {
        1: 1,
        2: 3,
        3: 7,
        4: 14,
        5: 30
    }
};

const topicsBySubject = {
    1: ['The Lekki Headmaster', 'Comprehension', 'Lexis & Structure', 'Oral English'],
    2: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus'],
    3: ['Mechanics', 'Waves', 'Electricity', 'Modern Physics', 'Heat'],
    4: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical'],
    5: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Evolution']
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDecks();
    loadStats();
    displayUserInfo();
    if (window.studyStreak) studyStreak.init();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/auth.html';
}

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) {
        userInfo.textContent = `Hi, ${user.full_name}`;
    }
}

function loadDecks() {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deckList = document.getElementById('deckList');
    
    if (decks.length === 0) {
        deckList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p style="font-size: 3rem; margin-bottom: 20px;">📇</p>
                <h3>No decks yet</h3>
                <p style="color: #666; margin: 20px 0;">Create your first flashcard deck to start learning</p>
                <button class="start-flashcard-btn" onclick="showSetup()">Create Deck</button>
            </div>
        `;
        return;
    }
    
    deckList.innerHTML = decks.map(deck => `
        <div class="deck-item" onclick="selectDeck('${deck.id}')">
            <h3>${deck.name}</h3>
            <p style="color: #666; margin-bottom: 10px;">${deck.subject}</p>
            <div class="deck-stats">
                <span>📇 ${deck.totalCards} cards</span>
                <span>✅ ${deck.mastered} mastered</span>
                <span>📅 ${deck.dueToday} due today</span>
            </div>
        </div>
    `).join('');
}

function loadStats() {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const totalCards = decks.reduce((sum, d) => sum + d.totalCards, 0);
    const masteredCards = decks.reduce((sum, d) => sum + d.mastered, 0);
    const dueToday = decks.reduce((sum, d) => sum + d.dueToday, 0);
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('masteredCards').textContent = masteredCards;
    document.getElementById('dueCards').textContent = dueToday;
}

function showSetup() {
    document.getElementById('decksView').style.display = 'none';
    document.getElementById('setupView').style.display = 'block';
    setupSubjectListener();
}

function setupSubjectListener() {
    const subjectSelect = document.getElementById('subjectSelect');
    subjectSelect.addEventListener('change', function() {
        const topicSelect = document.getElementById('topicSelect');
        topicSelect.innerHTML = '<option value="">Select Topic</option>';
        topicSelect.disabled = !this.value;
        
        if (this.value) {
            const topics = topicsBySubject[this.value] || [];
            topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
        }
    });
}

async function startFlashcards() {
    const subject = document.getElementById('subjectSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const count = document.getElementById('cardCount').value;
    
    if (!subject) {
        alert('Please select a subject');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subject_id: subject,
                topic: topic || null,
                count: count
            })
        });
        
        if (!response.ok) throw new Error('Failed to generate flashcards');
        
        const cards = await response.json();
        
        const deckId = 'deck_' + Date.now();
        const deck = {
            id: deckId,
            name: topic || getSubjectName(subject),
            subject: getSubjectName(subject),
            topic: topic,
            createdAt: new Date().toISOString(),
            totalCards: cards.length,
            mastered: 0,
            dueToday: cards.length,
            cards: cards.map(c => ({
                ...c,
                level: 1,
                lastReviewed: null,
                nextReview: new Date().toISOString(),
                history: []
            }))
        };
        
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        decks.push(deck);
        localStorage.setItem('flashcardDecks', JSON.stringify(decks));
        
        flashcardState.deck = deck;
        flashcardState.cards = deck.cards.filter(c => new Date(c.nextReview) <= new Date());
        flashcardState.currentIndex = 0;
        flashcardState.results = { easy: 0, medium: 0, hard: 0 };
        
        showSession();
        renderFlashcard();
        
    } catch (error) {
        alert('Failed to generate flashcards. Please try again.');
    }
}

function selectDeck(deckId) {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deck = decks.find(d => d.id === deckId);
    
    if (!deck) return;
    
    flashcardState.deck = deck;
    flashcardState.cards = deck.cards.filter(c => new Date(c.nextReview) <= new Date());
    
    if (flashcardState.cards.length === 0) {
        alert('No cards due for review today! Come back tomorrow.');
        return;
    }
    
    flashcardState.currentIndex = 0;
    flashcardState.results = { easy: 0, medium: 0, hard: 0 };
    
    showSession();
    renderFlashcard();
}

function showSession() {
    document.getElementById('decksView').style.display = 'none';
    document.getElementById('setupView').style.display = 'none';
    document.getElementById('sessionView').style.display = 'block';
    document.getElementById('summaryView').style.display = 'none';
}

function renderFlashcard() {
    const card = flashcardState.cards[flashcardState.currentIndex];
    
    document.getElementById('progressSubject').textContent = flashcardState.deck.subject;
    document.getElementById('progressCount').textContent = 
        `${flashcardState.currentIndex + 1}/${flashcardState.cards.length}`;
    document.getElementById('questionText').textContent = card.question_text;
    
    document.getElementById('answerText').classList.remove('show');
    document.getElementById('answerText').textContent = 
        `Correct Answer: ${card.correct_answer}\n\n${card.options[card.correct_answer]}\n\n${card.explanation || ''}`;
}

function flipCard() {
    document.getElementById('answerText').classList.toggle('show');
}

function rateCard(rating) {
    const card = flashcardState.cards[flashcardState.currentIndex];
    
    flashcardState.results[rating]++;
    
    const deckCard = flashcardState.deck.cards.find(c => c.id === card.id);
    
    if (rating === 'easy') {
        deckCard.level = Math.min(deckCard.level + 1, 5);
    } else if (rating === 'hard') {
        deckCard.level = Math.max(deckCard.level - 1, 1);
    }
    
    const daysToAdd = flashcardState.spacedRepetition[deckCard.level];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);
    
    deckCard.lastReviewed = new Date().toISOString();
    deckCard.nextReview = nextReview.toISOString();
    
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deckIndex = decks.findIndex(d => d.id === flashcardState.deck.id);
    decks[deckIndex] = flashcardState.deck;
    localStorage.setItem('flashcardDecks', JSON.stringify(decks));
    
    flashcardState.currentIndex++;
    
    if (flashcardState.currentIndex < flashcardState.cards.length) {
        renderFlashcard();
    } else {
        showSummary();
    }
}

function showSummary() {
    document.getElementById('sessionView').style.display = 'none';
    document.getElementById('summaryView').style.display = 'block';
    
    document.getElementById('masteredCount').textContent = flashcardState.results.easy;
    document.getElementById('reviewCount').textContent = flashcardState.results.medium;
    document.getElementById('struggleCount').textContent = flashcardState.results.hard;
    
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deckIndex = decks.findIndex(d => d.id === flashcardState.deck.id);
    decks[deckIndex].mastered = decks[deckIndex].cards.filter(c => c.level >= 4).length;
    decks[deckIndex].dueToday = decks[deckIndex].cards.filter(c => new Date(c.nextReview) <= new Date()).length;
    localStorage.setItem('flashcardDecks', JSON.stringify(decks));
    
    loadStats();
    if (window.updateFlashcardStats) {
        window.updateFlashcardStats(flashcardState.cards.length);
    }
}

function continueLearning() {
    flashcardState.cards = flashcardState.deck.cards.filter(c => new Date(c.nextReview) <= new Date());
    
    if (flashcardState.cards.length > 0) {
        flashcardState.currentIndex = 0;
        flashcardState.results = { easy: 0, medium: 0, hard: 0 };
        showSession();
        renderFlashcard();
    } else {
        alert('No more cards due for review! Great job! 🎉');
        backToDecks();
    }
}

function backToDecks() {
    document.getElementById('decksView').style.display = 'block';
    document.getElementById('setupView').style.display = 'none';
    document.getElementById('sessionView').style.display = 'none';
    document.getElementById('summaryView').style.display = 'none';
    loadDecks();
}

function getSubjectName(id) {
    const subjects = {
        1: 'Use of English',
        2: 'Mathematics',
        3: 'Physics',
        4: 'Chemistry',
        5: 'Biology'
    };
    return subjects[id] || 'Unknown';
}

window.showSetup = showSetup;
window.startFlashcards = startFlashcards;
window.selectDeck = selectDeck;
window.flipCard = flipCard;
window.rateCard = rateCard;
window.continueLearning = continueLearning;
window.backToDecks = backToDecks;