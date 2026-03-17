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

// Topics from your database
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
    console.log('Flashcards page loaded');
    checkAuth();
    loadDecks();
    loadStats();
    displayUserInfo();
    
    // Setup the subject select listener
    setupSubjectListener();
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
    }
}

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfo = document.getElementById('userInfo');
    if (userInfo && user.full_name) {
        userInfo.textContent = `Hi, ${user.full_name}`;
    }
}

function setupSubjectListener() {
    const subjectSelect = document.getElementById('subjectSelect');
    const topicSelect = document.getElementById('topicSelect');
    
    if (!subjectSelect) {
        console.error('Subject select not found!');
        return;
    }
    
    console.log('Setting up subject listener');
    
    subjectSelect.addEventListener('change', function() {
        const subjectId = this.value;
        console.log('Subject changed to:', subjectId);
        
        // Clear and disable topic select
        topicSelect.innerHTML = '<option value="">Select Topic</option>';
        
        if (!subjectId) {
            topicSelect.disabled = true;
            return;
        }
        
        // Get topics for this subject
        const topics = topicsBySubject[parseInt(subjectId)];
        console.log('Topics found:', topics);
        
        if (topics && topics.length > 0) {
            // Sort topics alphabetically
            topics.sort().forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
            topicSelect.disabled = false;
            console.log(`Added ${topics.length} topics`);
        } else {
            topicSelect.disabled = true;
            console.log('No topics found');
        }
    });
    
    // Trigger change event if a subject is already selected
    if (subjectSelect.value) {
        subjectSelect.dispatchEvent(new Event('change'));
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
    
    // Sort decks by most recently accessed
    decks.sort((a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0));
    
    deckList.innerHTML = decks.map(deck => {
        const dueToday = deck.cards?.filter(c => new Date(c.nextReview) <= new Date()).length || 0;
        const mastered = deck.cards?.filter(c => c.level >= 4).length || 0;
        
        return `
            <div class="deck-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: relative;">
                <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 10px;">
                    <button onclick="editDeck('${deck.id}', event)" 
                            style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #3498db;">
                        ✏️
                    </button>
                    <button onclick="deleteDeck('${deck.id}', event)" 
                            style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #e74c3c;">
                        🗑️
                    </button>
                </div>
                <div onclick="selectDeck('${deck.id}')" style="cursor: pointer;">
                    <h3 style="margin-bottom: 10px; padding-right: 60px;">${deck.name}</h3>
                    <p style="color: #666; margin-bottom: 10px;">${deck.subject}</p>
                    ${deck.topic ? `<p style="color: #888; font-size: 0.9rem; margin-bottom: 15px;">Topic: ${deck.topic}</p>` : ''}
                    <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.9rem;">
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
            
            // Trigger change event to load topics
            const event = new Event('change');
            document.getElementById('subjectSelect').dispatchEvent(event);
            
            // Set topic after topics load
            setTimeout(() => {
                if (deck.topic) {
                    document.getElementById('topicSelect').value = deck.topic;
                }
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
    
    if (confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        const filtered = decks.filter(d => d.id !== deckId);
        localStorage.setItem('flashcardDecks', JSON.stringify(filtered));
        loadDecks();
        loadStats();
    }
}

async function startFlashcards() {
    const deckName = document.getElementById('deckName').value;
    const subject = document.getElementById('subjectSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const count = parseInt(document.getElementById('cardCount').value) || 20;
    const editId = document.getElementById('setupView').dataset.editId;
    
    console.log('Starting flashcards with:', { deckName, subject, topic, count, editId });
    
    if (!deckName) {
        alert('Please enter a deck name');
        return;
    }
    
    if (!subject) {
        alert('Please select a subject');
        return;
    }
    
    // Show loading state
    const startBtn = document.querySelector('.start-flashcard-btn');
    const originalText = startBtn.textContent;
    startBtn.textContent = 'Loading...';
    startBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('token');
        
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
        console.log(`Received ${questions.length} questions`);
        
        // Filter by topic if selected
        let filteredQuestions = questions;
        if (topic && topic !== 'Select Topic') {
            filteredQuestions = questions.filter(q => 
                q.topic && q.topic.toLowerCase() === topic.toLowerCase()
            );
            
            // If no exact matches, try partial match
            if (filteredQuestions.length === 0) {
                filteredQuestions = questions.filter(q => 
                    q.topic && q.topic.toLowerCase().includes(topic.toLowerCase())
                );
            }
            
            console.log(`Filtered to ${filteredQuestions.length} questions for topic: ${topic}`);
        }
        
        // Take only requested count
        const selectedQuestions = filteredQuestions.slice(0, count);
        
        if (selectedQuestions.length === 0) {
            alert('No questions found for the selected criteria. Try a different topic or subject.');
            return;
        }
        
        // Get existing decks
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        let deck;
        
        if (editId) {
            // Update existing deck
            deck = decks.find(d => d.id === editId);
            deck.name = deckName;
            deck.subject = getSubjectName(subject);
            deck.subject_id = parseInt(subject);
            deck.topic = topic !== 'Select Topic' ? topic : null;
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
                topic: topic !== 'Select Topic' ? topic : null,
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
        console.error('Error starting flashcards:', error);
        alert('Failed to generate flashcards. Please try again.');
    } finally {
        // Restore button state
        startBtn.textContent = originalText;
        startBtn.disabled = false;
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
        // Option to study all cards if none due
        if (confirm('No cards due for review today. Would you like to review all cards in this deck?')) {
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

// Make functions globally available
window.showSetup = showSetup;
window.startFlashcards = startFlashcards;
window.selectDeck = selectDeck;
window.editDeck = editDeck;
window.deleteDeck = deleteDeck;
window.flipCard = flipCard;
window.rateCard = rateCard;
window.continueLearning = continueLearning;
window.backToDecks = backToDecks;