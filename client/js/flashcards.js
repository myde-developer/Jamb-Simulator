// client/js/flashcards.js - AI-Powered for Flashcards Only
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://jamb-simulator-api.onrender.com';

// Complete subjects list - ALL 22 JAMB SUBJECTS
const allSubjectsList = {
    1: { id: 1, name: 'Use of English', code: 'ENG', category: 'compulsory',
        topics: ['The Lekki Headmaster', 'Comprehension', 'Cloze Passage', 'Sentence Interpretation', 'Antonyms', 'Synonyms', 'Sentence Completion', 'Oral English'] },
    2: { id: 2, name: 'Mathematics', code: 'MTH', category: 'science',
        topics: ['Number Bases', 'Indices & Logarithms', 'Sets', 'Polynomials', 'Inequalities', 'Progression', 'Matrices', 'Euclidean Geometry', 'Mensuration', 'Coordinate Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability'] },
    3: { id: 3, name: 'Physics', code: 'PHY', category: 'science',
        topics: ['Measurements & Units', 'Scalars & Vectors', 'Motion', 'Gravitational Field', 'Equilibrium of Forces', 'Work, Energy & Power', 'Friction', 'Simple Machines', 'Elasticity', 'Pressure', 'Heat Energy', 'Waves', 'Light', 'Sound', 'Electricity', 'Magnetism'] },
    4: { id: 4, name: 'Chemistry', code: 'CHM', category: 'science',
        topics: ['Atomic Structure', 'Chemical Combination', 'Gas Laws', 'Water & Solubility', 'Acids & Bases', 'Salts', 'Oxidation & Reduction', 'Electrolysis', 'Organic Chemistry', 'Separation of Mixtures', 'Environmental Pollution'] },
    5: { id: 5, name: 'Biology', code: 'BIO', category: 'science',
        topics: ['Living Organisms', 'Classification', 'Internal Structure of Plants', 'Internal Structure of Mammals', 'Nutrition', 'Transport', 'Respiration', 'Excretion', 'Support & Movement', 'Reproduction', 'Growth', 'Coordination & Control', 'Homeostasis', 'Ecology', 'Genetics', 'Evolution'] },
    6: { id: 6, name: 'Agricultural Science', code: 'AGR', category: 'science',
        topics: ['Basic Concepts', 'Agro-ecology', 'Genetics', 'Crop Production', 'Animal Production', 'Agricultural Economics', 'Soil Science', 'Fisheries & Wildlife', 'Forestry', 'Farm Machinery', 'Crop Protection', 'Animal Health'] },
    7: { id: 7, name: 'Computer Studies', code: 'CSC', category: 'science',
        topics: ['History of Computing', 'Computer Hardware', 'Computer Software', 'Operating Systems', 'Data Processing', 'Number Systems', 'Computer Networks', 'Programming Concepts', 'Database Management', 'Computer Ethics', 'Emerging Technologies'] },
    8: { id: 8, name: 'Literature in English', code: 'LIT', category: 'arts',
        topics: ['Drama', 'Prose', 'Poetry', 'Literary Principles', 'Literary Appreciation', 'African Literature', 'Non-African Literature', 'The Lekki Headmaster', 'Figures of Speech'] },
    9: { id: 9, name: 'Government', code: 'GOV', category: 'arts',
        topics: ['Basic Concepts', 'Forms of Government', 'Arms of Government', 'Political Ideologies', 'Nigerian Constitution', 'Political Parties', 'Electoral Process', 'Public Administration', 'Local Government', 'Foreign Policy', 'International Organizations'] },
    10: { id: 10, name: 'History', code: 'HIS', category: 'arts',
        topics: ['Pre-colonial Nigeria', 'Trans-Saharan Trade', 'European Contact', 'Slave Trade', 'Sokoto Caliphate', 'Yoruba States', 'Benin Kingdom', 'Colonial Conquest', 'Nationalist Movements', 'Nigerian Independence', 'Nigerian Civil War'] },
    11: { id: 11, name: 'Christian Religious Studies', code: 'CRS', category: 'arts',
        topics: ['Sovereignty of God', 'The Covenant', 'Prophetic Mission', 'Faith & Works', 'Sermon on the Mount', 'Parables of Jesus', 'Miracles of Jesus', 'Death & Resurrection', 'Early Church', "Paul's Journeys", 'Christian Living'] },
    12: { id: 12, name: 'Islamic Studies', code: 'IRS', category: 'arts',
        topics: ['Tawhid', 'Prophethood', 'Revealed Books', 'Angels', 'Day of Judgment', 'Quranic Studies', 'Hadith', 'Islamic Law', 'Prayer', 'Fasting', 'Zakat', 'Pilgrimage', 'Islamic History'] },
    13: { id: 13, name: 'French', code: 'FRE', category: 'arts',
        topics: ['Greetings', 'Numbers', 'Family', 'Food', 'Daily Activities', 'Travel', 'Housing', 'Work', 'Health', 'Weather', 'Grammar', 'Culture'] },
    14: { id: 14, name: 'Yoruba', code: 'YRB', category: 'arts',
        topics: ['Alphabet', 'Grammar', 'Culture', 'History', 'Composition', 'Literature'] },
    15: { id: 15, name: 'Igbo', code: 'IGB', category: 'arts',
        topics: ['Alphabet', 'Vocabulary', 'Grammar', 'Culture', 'History', 'Literature'] },
    16: { id: 16, name: 'Hausa', code: 'HAU', category: 'arts',
        topics: ['Alphabet', 'Grammar', 'Culture', 'History', 'Writing', 'Literature'] },
    17: { id: 17, name: 'Music', code: 'MUS', category: 'arts',
        topics: ['Elements of Music', 'Music Notation', 'Scales & Intervals', 'Rhythm & Meter', 'Harmony', 'Musical Instruments', 'African Music', 'Western Music History', 'Music Analysis'] },
    18: { id: 18, name: 'Fine Arts', code: 'ART', category: 'arts',
        topics: ['Drawing', 'Painting', 'Sculpture', 'Printmaking', 'Art History', 'African Art', 'Contemporary Art', 'Color Theory', 'Composition'] },
    19: { id: 19, name: 'Economics', code: 'ECO', category: 'commercial',
        topics: ['Basic Concepts', 'Economic Systems', 'Demand & Supply', 'Elasticity', 'Consumer Behavior', 'Production', 'Cost Concepts', 'Market Structures', 'National Income', 'Money & Banking', 'Inflation', 'International Trade', 'Economic Development'] },
    20: { id: 20, name: 'Commerce', code: 'COM', category: 'commercial',
        topics: ['Meaning of Commerce', 'Occupation', 'Production', 'Trade', 'Aids to Trade', 'Business Units', 'Financing', 'Trade Associations', 'Money & Banking', 'Stock Exchange', 'Business Management', 'Marketing'] },
    21: { id: 21, name: 'Principles of Accounts', code: 'ACC', category: 'commercial',
        topics: ['Bookkeeping', 'Double Entry', 'Books of Entry', 'Ledger Accounts', 'Trial Balance', 'Cash Book', 'Bank Reconciliation', 'Final Accounts', 'Stock Valuation', 'Control Accounts', 'Manufacturing', 'Partnership', 'Company Accounts'] },
    22: { id: 22, name: 'Geography', code: 'GEO', category: 'commercial',
        topics: ['Basic Concepts', 'Earth Structure', 'Rocks & Minerals', 'Landforms', 'Weather & Climate', 'Water Bodies', 'Vegetation & Soils', 'Population Geography', 'Settlement Geography', 'Economic Geography', 'Environmental Issues', 'Map Reading', 'GIS'] }
};

let flashcardState = {
    deck: null,
    currentIndex: 0,
    cards: [],
    results: { easy: 0, medium: 0, hard: 0 },
    spacedRepetition: { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDecks();
    loadStats();
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
        
        if (response.ok) {
            const data = await response.json();
            renderSubjectSelect(data.subjects);
        } else {
            renderSubjectSelect(Object.values(allSubjectsList));
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
        renderSubjectSelect(Object.values(allSubjectsList));
    }
}

function renderSubjectSelect(subjects) {
    const subjectSelect = document.getElementById('subjectSelect');
    if (!subjectSelect) return;
    
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
    
    let html = '<option value="">Select Subject</option>';
    
    for (const [key, category] of Object.entries(categories)) {
        if (category.subjects.length === 0) continue;
        html += `<optgroup label="${category.title}">`;
        category.subjects.forEach(subject => {
            html += `<option value="${subject.id}">${subject.name}</option>`;
        });
        html += `</optgroup>`;
    }
    
    subjectSelect.innerHTML = html;
    subjectSelect.addEventListener('change', loadTopics);
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect')?.value;
    const topicSelect = document.getElementById('topicSelect');
    
    if (!subjectId || !topicSelect) return;
    
    const subject = allSubjectsList[parseInt(subjectId)];
    if (subject && subject.topics) {
        let options = '<option value="">Select Topic</option>';
        subject.topics.forEach(topic => {
            options += `<option value="${topic}">${topic}</option>`;
        });
        topicSelect.innerHTML = options;
        topicSelect.disabled = false;
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/ai-questions/topics/${subjectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            let options = '<option value="">Select Topic</option>';
            if (data.topics && data.topics.length > 0) {
                data.topics.forEach(topic => {
                    options += `<option value="${topic}">${topic}</option>`;
                });
            }
            topicSelect.innerHTML = options;
            topicSelect.disabled = false;
        }
    } catch (error) {
        console.error('Error loading topics:', error);
        topicSelect.innerHTML = '<option value="">Select Topic</option>';
        topicSelect.disabled = false;
    }
}

function loadDecks() {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const deckList = document.getElementById('deckList');
    
    if (!deckList) return;
    
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
    
    const totalCardsEl = document.getElementById('totalCards');
    const masteredCardsEl = document.getElementById('masteredCards');
    const dueCardsEl = document.getElementById('dueCards');
    
    if (totalCardsEl) totalCardsEl.textContent = totalCards;
    if (masteredCardsEl) masteredCardsEl.textContent = masteredCards;
    if (dueCardsEl) dueCardsEl.textContent = dueToday;
}

function showSetup(editDeckId = null) {
    const decksView = document.getElementById('decksView');
    const setupView = document.getElementById('setupView');
    
    if (decksView) decksView.classList.add('hidden');
    if (setupView) setupView.classList.remove('hidden');
    
    if (editDeckId) {
        const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        const deck = decks.find(d => d.id === editDeckId);
        if (deck) {
            document.getElementById('setupTitle').textContent = 'Edit Deck';
            document.getElementById('deckName').value = deck.name;
            document.getElementById('subjectSelect').value = deck.subject_id;
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
        
        const response = await fetch(`${API_BASE}/api/ai-questions/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subjectId: parseInt(subjectId),
                topic: topic !== 'Select Topic' ? topic : null,
                count: count,
                difficulty: 'medium'
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
            question_text: card.question_text,
            back_text: card.answer_text,
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
                deck.cards = formattedCards;
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
                cards: formattedCards
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
        alert('Failed to generate flashcards: ' + error.message);
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
    const decksView = document.getElementById('decksView');
    const setupView = document.getElementById('setupView');
    const sessionView = document.getElementById('sessionView');
    const summaryView = document.getElementById('summaryView');
    
    if (decksView) decksView.classList.add('hidden');
    if (setupView) setupView.classList.add('hidden');
    if (sessionView) sessionView.classList.remove('hidden');
    if (summaryView) summaryView.classList.add('hidden');
}

function renderFlashcard() {
    const card = flashcardState.cards[flashcardState.currentIndex];
    if (!card) return;
    
    const progressSubject = document.getElementById('progressSubject');
    const progressCount = document.getElementById('progressCount');
    const questionText = document.getElementById('questionText');
    const answerText = document.getElementById('answerText');
    
    if (progressSubject) progressSubject.textContent = flashcardState.deck.subject;
    if (progressCount) progressCount.textContent = `${flashcardState.currentIndex + 1}/${flashcardState.cards.length}`;
    if (questionText) questionText.textContent = card.question_text;
    if (answerText) {
        answerText.classList.remove('show');
        answerText.textContent = card.back_text;
    }
}

function flipCard() {
    const answerText = document.getElementById('answerText');
    if (answerText) answerText.classList.toggle('show');
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
    const sessionView = document.getElementById('sessionView');
    const summaryView = document.getElementById('summaryView');
    
    if (sessionView) sessionView.classList.add('hidden');
    if (summaryView) summaryView.classList.remove('hidden');
    
    const masteredCount = document.getElementById('masteredCount');
    const reviewCount = document.getElementById('reviewCount');
    const struggleCount = document.getElementById('struggleCount');
    
    if (masteredCount) masteredCount.textContent = flashcardState.results.easy;
    if (reviewCount) reviewCount.textContent = flashcardState.results.medium;
    if (struggleCount) struggleCount.textContent = flashcardState.results.hard;
    
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
    const decksView = document.getElementById('decksView');
    const setupView = document.getElementById('setupView');
    const sessionView = document.getElementById('sessionView');
    const summaryView = document.getElementById('summaryView');
    
    if (decksView) decksView.classList.remove('hidden');
    if (setupView) setupView.classList.add('hidden');
    if (sessionView) sessionView.classList.add('hidden');
    if (summaryView) summaryView.classList.add('hidden');
    loadDecks();
}

function getSubjectName(id) {
    const subjects = {
        1: 'Use of English', 2: 'Mathematics', 3: 'Physics', 4: 'Chemistry', 5: 'Biology',
        6: 'Agricultural Science', 7: 'Computer Studies', 8: 'Literature in English',
        9: 'Government', 10: 'History', 11: 'Christian Religious Studies', 12: 'Islamic Studies',
        13: 'French', 14: 'Yoruba', 15: 'Igbo', 16: 'Hausa', 17: 'Music', 18: 'Fine Arts',
        19: 'Economics', 20: 'Commerce', 21: 'Principles of Accounts', 22: 'Geography'
    };
    return subjects[id] || 'Unknown';
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