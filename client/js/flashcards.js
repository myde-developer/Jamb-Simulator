// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

// Flashcards state
let flashcardState = {
    deck: null,
    currentIndex: 0,
    cards: [],
    results: { easy: 0, medium: 0, hard: 0 },
    spacedRepetition: { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }
};

// Topics by subject
const topicsBySubject = {
    1: ['The Lekki Headmaster', 'Comprehension', 'Cloze Passage', 'Sentence Interpretation', 'Antonyms', 'Synonyms', 'Sentence Completion', 'Oral English'],
    2: ['Number Bases', 'Fractions & Decimals', 'Indices & Logarithms', 'Sets', 'Polynomials', 'Variation', 'Inequalities', 'Progression', 'Matrices', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability'],
    3: ['Measurements', 'Vectors', 'Motion', 'Gravitation', 'Forces', 'Work & Energy', 'Waves', 'Light', 'Sound', 'Electricity', 'Magnetism', 'Modern Physics'],
    4: ['Atomic Structure', 'Chemical Bonding', 'Stoichiometry', 'Gas Laws', 'Acids & Bases', 'Electrochemistry', 'Organic Chemistry', 'Environmental Chemistry'],
    5: ['Cell Biology', 'Genetics', 'Ecology', 'Human Anatomy', 'Plant Biology', 'Evolution', 'Physiology', 'Taxonomy']
};

// Logout
function logout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
    window.location.href = '/auth.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDecks();
    loadStats();
    displayUserInfo();
    setupSubjectListener();
    
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

function setupSubjectListener() {
    const subjectSelect = document.getElementById('subjectSelect');
    const topicSelect = document.getElementById('topicSelect');
    
    if (!subjectSelect) return;
    
    subjectSelect.addEventListener('change', () => {
        const subjectId = subjectSelect.value;
        topicSelect.innerHTML = '<option value="">Select Topic</option>';
        
        if (!subjectId) {
            topicSelect.disabled = true;
            return;
        }
        
        const topics = topicsBySubject[parseInt(subjectId)] || [];
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
        topicSelect.disabled = false;
    });
}

function loadDecks() {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deckList = document.getElementById('deckList');
    
    if (decks.length === 0) {
        deckList.innerHTML = `
            <div class="empty-state">
                <p>No decks yet. Create your first flashcard deck to start learning.</p>
                <button class="btn btn-primary" onclick="showSetup()">Create Deck</button>
            </div>
        `;
        return;
    }
    
    decks.sort((a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0));
    
    deckList.innerHTML = decks.map(deck => {
        const dueToday = deck.cards?.filter(c => new Date(c.nextReview) <= new Date()).length || 0;
        const mastered = deck.cards?.filter(c => c.level >= 4).length || 0;
        
        return `
            <div class="deck-card">
                <div class="deck-actions">
                    <button onclick="editDeck('${deck.id}', event)" title="Edit">✏️</button>
                    <button onclick="deleteDeck('${deck.id}', event)" title="Delete">🗑️</button>
                </div>
                <div onclick="selectDeck('${deck.id}')">
                    <div class="deck-name">${escapeHtml(deck.name)}</div>
                    <div class="deck-meta">${deck.subject}${deck.topic ? ` · ${deck.topic}` : ''}</div>
                    <div class="deck-stats">
                        <span>📇 ${deck.cards?.length || 0} cards</span>
                        <span>✅ ${mastered} mastered</span>
                        <span>📅 ${dueToday} due</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadStats() {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const totalCards = decks.reduce((sum, d) => sum + (d.cards?.length || 0), 0);
    const masteredCards = decks.reduce((sum, d) => sum + (d.cards?.filter(c => c.level >= 4).length || 0), 0);
    const dueToday = decks.reduce((sum, d) => sum + (d.cards?.filter(c => new Date(c.nextReview) <= new Date()).length || 0), 0);
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('masteredCards').textContent = masteredCards;
    document.getElementById('dueCards').textContent = dueToday;
}

function showSetup(editDeckId = null) {
    document.getElementById('decksView').classList.add('hidden');
    document.getElementById('setupView').classList.remove('hidden');
    
    if (editDeckId) {
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        const deck = decks.find(d => d.id === editDeckId);
        if (deck) {
            document.getElementById('setupTitle').textContent = 'Edit Deck';
            document.getElementById('deckName').value = deck.name;
            document.getElementById('subjectSelect').value = getSubjectId(deck.subject);
            document.getElementById('subjectSelect').dispatchEvent(new Event('change'));
            setTimeout(() => {
                if (deck.topic) document.getElementById('topicSelect').value = deck.topic;
            }, 100);
            document.getElementById('cardCount').value = deck.cards?.length || 20;
            document.getElementById('setupView').dataset.editId = editDeckId;
        }
    } else {
        document.getElementById('setupTitle').textContent = 'Create New Deck';
        document.getElementById('deckName').value = '';
        document.getElementById('subjectSelect').value = '';
        document.getElementById('topicSelect').innerHTML = '<option value="">Select Topic</option>';
        document.getElementById('topicSelect').disabled = true;
        document.getElementById('cardCount').value = 20;
        delete document.getElementById('setupView').dataset.editId;
    }
}

function editDeck(deckId, event) {
    event.stopPropagation();
    showSetup(deckId);
}

function deleteDeck(deckId, event) {
    event.stopPropagation();
    if (confirm('Delete this deck permanently?')) {
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        const filtered = decks.filter(d => d.id !== deckId);
        localStorage.setItem('flashcardDecks', JSON.stringify(filtered));
        loadDecks();
        loadStats();
    }
}

async function startFlashcards() {
    const deckName = document.getElementById('deckName').value.trim();
    const subjectId = document.getElementById('subjectSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const count = parseInt(document.getElementById('cardCount').value) || 20;
    const editId = document.getElementById('setupView').dataset.editId;
    
    if (!deckName) return alert('Please enter a deck name');
    if (!subjectId) return alert('Please select a subject');
    
    const startBtn = document.querySelector('#setupView .btn-primary');
    const originalText = startBtn.textContent;
    startBtn.textContent = 'Generating flashcards...';
    startBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('token');
        const subjectName = getSubjectName(subjectId);
        
        const response = await fetch(`${API_BASE}/api/flashcards/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subject: subjectName,
                topic: topic !== 'Select Topic' ? topic : null,
                count: count
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate flashcards');
        }
        
        const data = await response.json();
        const aiFlashcards = data.flashcards;
        
        if (!aiFlashcards || aiFlashcards.length === 0) {
            throw new Error('No flashcards generated');
        }
        
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        let deck;
        
        const formattedCards = aiFlashcards.map((card, idx) => ({
            id: `${editId || 'deck_' + Date.now() + '_' + idx}`,
            question_text: card.front,
            back_text: card.back,
            level: 1,
            lastReviewed: null,
            nextReview: new Date().toISOString(),
            history: []
        }));
        
        if (editId) {
            deck = decks.find(d => d.id === editId);
            if (deck) {
                deck.name = deckName;
                deck.subject = subjectName;
                deck.subject_id = parseInt(subjectId);
                deck.topic = topic !== 'Select Topic' ? topic : null;
                deck.lastAccessed = new Date().toISOString();
                deck.cards = formattedCards.map((c, idx) => ({ ...c, id: `${editId}_${idx}` }));
            } else {
                throw new Error('Deck not found');
            }
        } else {
            const deckId = 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
            deck = {
                id: deckId,
                name: deckName,
                subject: subjectName,
                subject_id: parseInt(subjectId),
                topic: topic !== 'Select Topic' ? topic : null,
                createdAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                cards: formattedCards.map((c, idx) => ({ ...c, id: `${deckId}_${idx}` }))
            };
            decks.push(deck);
        }
        
        localStorage.setItem('flashcardDecks', JSON.stringify(decks));
        
        flashcardState.deck = deck;
        flashcardState.cards = deck.cards;
        flashcardState.currentIndex = 0;
        flashcardState.results = { easy: 0, medium: 0, hard: 0 };
        
        showSession();
        renderFlashcard();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to generate flashcards: ' + error.message);
    } finally {
        startBtn.textContent = originalText;
        startBtn.disabled = false;
    }
}

function selectDeck(deckId) {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    deck.lastAccessed = new Date().toISOString();
    localStorage.setItem('flashcardDecks', JSON.stringify(decks));
    
    let dueCards = deck.cards.filter(c => new Date(c.nextReview) <= new Date());
    
    if (dueCards.length === 0) {
        if (!confirm('No cards due today. Review all cards?')) return;
        dueCards = deck.cards;
    }
    
    flashcardState.deck = deck;
    flashcardState.cards = dueCards;
    flashcardState.currentIndex = 0;
    flashcardState.results = { easy: 0, medium: 0, hard: 0 };
    
    showSession();
    renderFlashcard();
}

function showSession() {
    document.getElementById('decksView').classList.add('hidden');
    document.getElementById('setupView').classList.add('hidden');
    document.getElementById('sessionView').classList.remove('hidden');
    document.getElementById('summaryView').classList.add('hidden');
}

function renderFlashcard() {
    const card = flashcardState.cards[flashcardState.currentIndex];
    if (!card) return;
    
    document.getElementById('progressSubject').textContent = flashcardState.deck.subject;
    document.getElementById('progressCount').textContent = `${flashcardState.currentIndex + 1}/${flashcardState.cards.length}`;
    document.getElementById('questionText').textContent = card.question_text;
    
    // Show just the answer + explanation (no options!)
    const answerText = card.back_text;
    
    const answerEl = document.getElementById('answerText');
    answerEl.classList.remove('show');
    answerEl.textContent = answerText;
}

function flipCard() {
    document.getElementById('answerText').classList.toggle('show');
}

function rateCard(rating) {
    const card = flashcardState.cards[flashcardState.currentIndex];
    flashcardState.results[rating]++;
    
    const deckCard = flashcardState.deck.cards.find(c => c.id === card.id);
    
    if (rating === 'easy') deckCard.level = Math.min(deckCard.level + 1, 5);
    else if (rating === 'hard') deckCard.level = Math.max(deckCard.level - 1, 1);
    
    const daysToAdd = flashcardState.spacedRepetition[deckCard.level];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);
    
    deckCard.lastReviewed = new Date().toISOString();
    deckCard.nextReview = nextReview.toISOString();
    deckCard.history.push({ date: new Date().toISOString(), rating });
    
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
    document.getElementById('sessionView').classList.add('hidden');
    document.getElementById('summaryView').classList.remove('hidden');
    
    document.getElementById('masteredCount').textContent = flashcardState.results.easy;
    document.getElementById('reviewCount').textContent = flashcardState.results.medium;
    document.getElementById('struggleCount').textContent = flashcardState.results.hard;
    
    loadStats();
}

function continueLearning() {
    const dueCards = flashcardState.deck.cards.filter(c => new Date(c.nextReview) <= new Date());
    
    if (dueCards.length > 0) {
        flashcardState.cards = dueCards;
        flashcardState.currentIndex = 0;
        flashcardState.results = { easy: 0, medium: 0, hard: 0 };
        showSession();
        renderFlashcard();
    } else {
        alert('No more cards due! Great job! 🎉');
        backToDecks();
    }
}

function backToDecks() {
    document.getElementById('decksView').classList.remove('hidden');
    document.getElementById('setupView').classList.add('hidden');
    document.getElementById('sessionView').classList.add('hidden');
    document.getElementById('summaryView').classList.add('hidden');
    loadDecks();
}

function getSubjectName(id) {
    const subjects = { 1: 'Use of English', 2: 'Mathematics', 3: 'Physics', 4: 'Chemistry', 5: 'Biology' };
    return subjects[id] || 'Unknown';
}

function getSubjectId(name) {
    const subjects = { 'Use of English': 1, 'Mathematics': 2, 'Physics': 3, 'Chemistry': 4, 'Biology': 5 };
    return subjects[name] || 1;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Global functions
window.showSetup = showSetup;
window.startFlashcards = startFlashcards;
window.selectDeck = selectDeck;
window.editDeck = editDeck;
window.deleteDeck = deleteDeck;
window.flipCard = flipCard;
window.rateCard = rateCard;
window.continueLearning = continueLearning;
window.backToDecks = backToDecks;
window.logout = logout;