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
    deck: null,
    currentIndex: 0,
    cards: [],
    results: {
        easy: 0,
        medium: 0,
        hard: 0
    },
    spacedRepetition: {
        1: 1,  // Level 1: review after 1 day
        2: 3,  // Level 2: review after 3 days
        3: 7,  // Level 3: review after 7 days
        4: 14, // Level 4: review after 14 days
        5: 30  // Level 5: review after 30 days
    }
};

// Topics from your database (extracted from your JSON files)
const topicsBySubject = {
    1: [ // Use of English
        'The Lekki Headmaster',
        'Comprehension',
        'Cloze Passage',
        'Sentence Interpretation',
        'Antonyms',
        'Synonyms',
        'Sentence Completion',
        'Oral English'
    ],
    2: [ // Mathematics
        'Number Bases',
        'Fractions, Decimals, Approximations',
        'Indices, Logarithms and Surds',
        'Sets',
        'Polynomials',
        'Variation',
        'Inequalities',
        'Progression',
        'Binary Operations',
        'Matrices and Determinants',
        'Euclidean Geometry',
        'Mensuration',
        'Loci',
        'Coordinate Geometry',
        'Trigonometry',
        'Differentiation',
        'Application of Differentiation',
        'Integration',
        'Measures of Location',
        'Measures of Dispersion',
        'Permutation and Combination',
        'Probability'
    ],
    3: [ // Physics
        'Measurements and Units',
        'Scalars and Vectors',
        'Motion',
        'Gravitational Field',
        'Equilibrium of Forces',
        'Work, Energy and Power',
        'Friction',
        'Simple Machines',
        'Elasticity',
        'Pressure',
        'Heat Energy',
        'Waves',
        'Light',
        'Sound'
    ],
    4: [ // Chemistry
        'Separation of Mixtures',
        'Chemical Combination',
        'Gas Laws',
        'Atomic Structure',
        'Water',
        'Solubility',
        'Environmental Pollution',
        'Acids and Bases',
        'Salts',
        'Oxidation and Reduction',
        'Electrolysis',
        'Organic Chemistry'
    ],
    5: [ // Biology
        'Living Organisms',
        'Classification',
        'Internal Structure of Plants',
        'Internal Structure of Mammals',
        'Nutrition',
        'Transport',
        'Respiration',
        'Excretion',
        'Support and Movement',
        'Reproduction',
        'Growth',
        'Coordination and Control',
        'Homeostasis',
        'Factors Affecting Distribution',
        'Symbiotic Interactions',
        'Natural Habitats',
        'Nigerian Biomes',
        'Population Ecology',
        'Soil',
        'Humans and Environment',
        'Variation',
        'Heredity',
        'Sex-linked Characters',
        'Theories of Evolution',
        'Evidence of Evolution'
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDecks();
    loadStats();
    displayUserInfo();
    if (window.studyStreak) studyStreak.init();

    document.getElementById('logoutBtn').addEventListener('click', logout);
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
    
    // Sort decks by most recently reviewed
    decks.sort((a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0));
    
    deckList.innerHTML = decks.map(deck => {
        const dueToday = deck.cards?.filter(c => new Date(c.nextReview) <= new Date()).length || 0;
        const mastered = deck.cards?.filter(c => c.level >= 4).length || 0;
        
        return `
        <div class="deck-card">
            <div class="deck-header">
                <h3>${deck.name}</h3>
                <button class="delete-deck-btn" onclick="deleteDeck('${deck.id}', event)">🗑️</button>
            </div>
            <p style="color: #666; margin-bottom: 10px;">${deck.subject}</p>
            ${deck.topic ? `<p style="color: #888; font-size: 0.9rem;">Topic: ${deck.topic}</p>` : ''}
            <div class="deck-stats">
                <span>📇 ${deck.cards?.length || 0} cards</span>
                <span>✅ ${mastered} mastered</span>
                <span>📅 ${dueToday} due</span>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="start-flashcard-btn" style="flex: 2;" onclick="selectDeck('${deck.id}')">Study Now</button>
                <button class="secondary-btn" style="flex: 1;" onclick="editDeck('${deck.id}')">✏️</button>
            </div>
        </div>
    `}).join('');
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
    document.getElementById('decksView').style.display = 'none';
    document.getElementById('setupView').style.display = 'block';
    
    // Store edit mode
    if (editDeckId) {
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        const deck = decks.find(d => d.id === editDeckId);
        if (deck) {
            document.getElementById('setupTitle').textContent = 'Edit Deck';
            document.getElementById('deckName').value = deck.name;
            document.getElementById('subjectSelect').value = getSubjectId(deck.subject);
            setupSubjectListener();
            
            // Set topic after subject topics load
            setTimeout(() => {
                document.getElementById('topicSelect').value = deck.topic || '';
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
    
    setupSubjectListener();
}

function setupSubjectListener() {
    const subjectSelect = document.getElementById('subjectSelect');
    const topicSelect = document.getElementById('topicSelect');
    
    if (!subjectSelect || !topicSelect) {
        console.error('Subject or topic select not found');
        return;
    }
    
    subjectSelect.addEventListener('change', function() {
        const subjectId = this.value;
        console.log('Subject selected:', subjectId);
        
        // Clear existing options
        topicSelect.innerHTML = '<option value="">All Topics</option>';
        
        if (!subjectId) {
            topicSelect.disabled = true;
            return;
        }
        
        const topics = topicsBySubject[parseInt(subjectId)] || [];
        
        if (topics.length > 0) {
            topics.sort().forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
            topicSelect.disabled = false;
        } else {
            topicSelect.disabled = true;
        }
    });
}

async function startFlashcards() {
    const deckName = document.getElementById('deckName').value;
    const subject = document.getElementById('subjectSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const count = parseInt(document.getElementById('cardCount').value) || 20;
    const editId = document.getElementById('setupView').dataset.editId;
    
    if (!deckName) {
        alert('Please enter a deck name');
        return;
    }
    
    if (!subject) {
        alert('Please select a subject');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        // Fetch questions from exam endpoint
        const response = await fetch(`${API_BASE}/api/exam/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subjects: [{ id: parseInt(subject), name: getSubjectName(subject) }]
            })
        });
        
        if (!response.ok) throw new Error('Failed to fetch questions');
        
        const questions = await response.json();
        
        // Filter by topic if specified
        let filteredQuestions = questions;
        if (topic) {
            filteredQuestions = questions.filter(q => 
                q.topic && q.topic.toLowerCase() === topic.toLowerCase()
            );
            
            // If no exact matches, try partial match
            if (filteredQuestions.length === 0) {
                filteredQuestions = questions.filter(q => 
                    q.topic && q.topic.toLowerCase().includes(topic.toLowerCase())
                );
            }
        }
        
        // Take only the requested count
        const selectedQuestions = filteredQuestions.slice(0, count);
        
        if (selectedQuestions.length === 0) {
            alert('No questions found for the selected criteria. Try a different topic or subject.');
            return;
        }
        
        // Create or update deck
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        let deck;
        
        if (editId) {
            // Update existing deck
            deck = decks.find(d => d.id === editId);
            deck.name = deckName;
            deck.topic = topic || null;
            deck.lastAccessed = new Date().toISOString();
            
            // Update cards (keep existing mastered cards if possible)
            const existingCards = deck.cards || [];
            deck.cards = selectedQuestions.map((q, index) => {
                const existingCard = existingCards.find(c => c.question_text === q.question_text);
                return {
                    id: `${editId}_${index}`,
                    question_text: q.question_text,
                    options: {
                        A: q.option_a,
                        B: q.option_b,
                        C: q.option_c,
                        D: q.option_d
                    },
                    correct_answer: q.correct_answer,
                    explanation: q.explanation || 'No explanation available',
                    topic: q.topic,
                    level: existingCard?.level || 1,
                    lastReviewed: existingCard?.lastReviewed || null,
                    nextReview: existingCard?.nextReview || new Date().toISOString(),
                    history: existingCard?.history || []
                };
            });
            
        } else {
            // Create new deck
            const deckId = 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            deck = {
                id: deckId,
                name: deckName,
                subject: getSubjectName(subject),
                subject_id: parseInt(subject),
                topic: topic || null,
                createdAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                cards: selectedQuestions.map((q, index) => ({
                    id: `${deckId}_${index}`,
                    question_text: q.question_text,
                    options: {
                        A: q.option_a,
                        B: q.option_b,
                        C: q.option_c,
                        D: q.option_d
                    },
                    correct_answer: q.correct_answer,
                    explanation: q.explanation || 'No explanation available',
                    topic: q.topic,
                    level: 1,
                    lastReviewed: null,
                    nextReview: new Date().toISOString(),
                    history: []
                }))
            };
            decks.push(deck);
        }
        
        localStorage.setItem('flashcardDecks', JSON.stringify(decks));
        
        // Start session
        flashcardState.deck = deck;
        flashcardState.cards = deck.cards;
        flashcardState.currentIndex = 0;
        flashcardState.results = { easy: 0, medium: 0, hard: 0 };
        
        showSession();
        renderFlashcard();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate flashcards. Please try again.');
    }
}

function selectDeck(deckId) {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deck = decks.find(d => d.id === deckId);
    
    if (!deck) return;
    
    // Update last accessed
    deck.lastAccessed = new Date().toISOString();
    localStorage.setItem('flashcardDecks', JSON.stringify(decks));
    
    flashcardState.deck = deck;
    flashcardState.cards = deck.cards.filter(c => new Date(c.nextReview) <= new Date());
    
    if (flashcardState.cards.length === 0) {
        alert('No cards due for review today! Come back tomorrow or study all cards.');
        // Option to study all cards
        if (confirm('No due cards. Would you like to review all cards in this deck?')) {
            flashcardState.cards = deck.cards;
        } else {
            return;
        }
    }
    
    flashcardState.currentIndex = 0;
    flashcardState.results = { easy: 0, medium: 0, hard: 0 };
    
    showSession();
    renderFlashcard();
}

function editDeck(deckId) {
    showSetup(deckId);
}

function deleteDeck(deckId, event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this deck?')) {
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        const filtered = decks.filter(d => d.id !== deckId);
        localStorage.setItem('flashcardDecks', JSON.stringify(filtered));
        loadDecks();
        loadStats();
    }
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
    
    // Format options nicely
    const optionsText = `
A: ${card.options.A}
B: ${card.options.B}
C: ${card.options.C}
D: ${card.options.D}

Correct Answer: ${card.correct_answer}
${card.explanation ? '\n' + card.explanation : ''}
    `;
    
    document.getElementById('answerText').classList.remove('show');
    document.getElementById('answerText').textContent = optionsText;
}

function flipCard() {
    document.getElementById('answerText').classList.toggle('show');
}

function rateCard(rating) {
    const card = flashcardState.cards[flashcardState.currentIndex];
    
    flashcardState.results[rating]++;
    
    // Find card in deck
    const deckCard = flashcardState.deck.cards.find(c => c.id === card.id);
    
    // Update level based on rating
    if (rating === 'easy') {
        deckCard.level = Math.min(deckCard.level + 1, 5);
    } else if (rating === 'hard') {
        deckCard.level = Math.max(deckCard.level - 1, 1);
    }
    // 'medium' keeps same level
    
    // Calculate next review date
    const daysToAdd = flashcardState.spacedRepetition[deckCard.level];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);
    
    // Update card
    deckCard.lastReviewed = new Date().toISOString();
    deckCard.nextReview = nextReview.toISOString();
    deckCard.history.push({
        date: new Date().toISOString(),
        rating: rating
    });
    
    // Save to localStorage
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
    
    // Update deck stats
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deckIndex = decks.findIndex(d => d.id === flashcardState.deck.id);
    if (deckIndex !== -1) {
        decks[deckIndex] = flashcardState.deck;
        localStorage.setItem('flashcardDecks', JSON.stringify(decks));
    }
    
    loadStats();
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

function getSubjectId(name) {
    const subjects = {
        'Use of English': 1,
        'Mathematics': 2,
        'Physics': 3,
        'Chemistry': 4,
        'Biology': 5
    };
    return subjects[name] || 1;
}

// Export functions to global scope
window.showSetup = showSetup;
window.startFlashcards = startFlashcards;
window.selectDeck = selectDeck;
window.editDeck = editDeck;
window.deleteDeck = deleteDeck;
window.flipCard = flipCard;
window.rateCard = rateCard;
window.continueLearning = continueLearning;
window.backToDecks = backToDecks;