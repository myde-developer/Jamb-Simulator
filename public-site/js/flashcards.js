const API_BASE = 'https://jamb-simulator-api.onrender.com';
let flashcardState = { deck: null, currentIndex: 0, cards: [], results: { easy:0, medium:0, hard:0 }, spacedRepetition: {1:1,2:3,3:7,4:14,5:30} };
document.addEventListener('DOMContentLoaded', () => { loadDecks(); loadStats(); loadSubjects(); document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.clear(); window.location.href='/auth.html'; }); });
async function loadSubjects() {
    try {
        const res = await fetch(`${API_BASE}/api/practice/subjects`);   // changed from /api/ai-questions/subjects
        const data = await res.json();
        const subjects = data.subjects;
        const select = document.getElementById('subjectSelect');
        select.innerHTML = '<option value="">Select Subject</option>';
        subjects.forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
        select.addEventListener('change', loadTopics);
    } catch(e) { console.error(e); }
}

async function loadTopics() {
    const subjectId = document.getElementById('subjectSelect').value;
    const topicSelect = document.getElementById('topicSelect');
    if(!subjectId) {
        topicSelect.disabled = true;
        topicSelect.innerHTML = '<option value="">Select Topic</option>';
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/practice/topics/${subjectId}`);  // same as practice
        const data = await res.json();
        let opts = '<option value="">Select Topic</option>';
        if(data.topics) data.topics.forEach(t => opts += `<option value="${t}">${t}</option>`);
        topicSelect.innerHTML = opts;
        topicSelect.disabled = false;
    } catch(e) {
        topicSelect.innerHTML = '<option value="">Select Topic</option>';
        topicSelect.disabled = false;
    }
}
function loadDecks() {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const container = document.getElementById('deckList');
    if(!decks.length) { container.innerHTML = '<div class="empty-state"><p>No decks yet. Create your first deck.</p><button class="btn btn-primary" onclick="showSetup()">Create Deck</button></div>'; return; }
    container.innerHTML = decks.map(deck => `<div class="deck-card"><div class="deck-actions"><button onclick="editDeck('${deck.id}', event)">✏️</button><button onclick="deleteDeck('${deck.id}', event)">🗑️</button></div><div onclick="selectDeck('${deck.id}')"><div class="deck-name">${escapeHtml(deck.name)}</div><div class="deck-meta">${deck.subject}${deck.topic?` · ${deck.topic}`:''}</div><div class="deck-stats"><span>📇 ${deck.cards?.length||0} cards</span><span>✅ ${deck.cards?.filter(c=>c.level>=4).length||0} mastered</span><span>📅 ${deck.cards?.filter(c=>new Date(c.nextReview)<=new Date()).length||0} due</span></div></div></div>`).join('');
}
function loadStats() {
    const decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
    const total = decks.reduce((s,d)=>s+(d.cards?.length||0),0);
    const mastered = decks.reduce((s,d)=>s+(d.cards?.filter(c=>c.level>=4).length||0),0);
    const due = decks.reduce((s,d)=>s+(d.cards?.filter(c=>new Date(c.nextReview)<=new Date()).length||0),0);
    document.getElementById('totalCards').innerText = total;
    document.getElementById('masteredCards').innerText = mastered;
    document.getElementById('dueCards').innerText = due;
}
function showSetup(editId=null) {
    document.getElementById('decksView').classList.add('hidden');
    document.getElementById('setupView').classList.remove('hidden');
    if(editId) {
        const decks = JSON.parse(localStorage.getItem('flashcardDecks')||'[]');
        const deck = decks.find(d=>d.id===editId);
        if(deck) {
            document.getElementById('setupTitle').innerText = 'Edit Deck';
            document.getElementById('deckName').value = deck.name;
            document.getElementById('subjectSelect').value = deck.subject_id;
            document.getElementById('subjectSelect').dispatchEvent(new Event('change'));
            setTimeout(()=>{ if(deck.topic) document.getElementById('topicSelect').value = deck.topic; },100);
            document.getElementById('cardCount').value = deck.cards?.length||20;
            document.getElementById('setupView').dataset.editId = editId;
        }
    } else {
        document.getElementById('setupTitle').innerText = 'Create New Deck';
        document.getElementById('deckName').value = '';
        document.getElementById('subjectSelect').value = '';
        document.getElementById('topicSelect').innerHTML = '<option value="">Select Topic</option>';
        document.getElementById('topicSelect').disabled = true;
        document.getElementById('cardCount').value = 20;
        delete document.getElementById('setupView').dataset.editId;
    }
}
function editDeck(deckId, e) { e.stopPropagation(); showSetup(deckId); }
function deleteDeck(deckId, e) { e.stopPropagation(); if(confirm('Delete deck?')){ let decks = JSON.parse(localStorage.getItem('flashcardDecks')||'[]'); decks = decks.filter(d=>d.id!==deckId); localStorage.setItem('flashcardDecks',JSON.stringify(decks)); loadDecks(); loadStats(); } }
async function startFlashcards() {
    const deckName = document.getElementById('deckName').value.trim();
    const subjectId = document.getElementById('subjectSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const count = parseInt(document.getElementById('cardCount').value) || 20;
    const editId = document.getElementById('setupView').dataset.editId;
    if(!deckName || !subjectId) return alert('Enter deck name and subject');
    const btn = document.querySelector('#setupView .btn-primary');
    const orig = btn.innerText;
    btn.innerText = 'Generating...';
    btn.disabled = true;
    try {
        const subjectName = getSubjectName(parseInt(subjectId));
        const res = await fetch(`${API_BASE}/api/flashcards/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: subjectName, topic: topic !== 'Select Topic' ? topic : null, count })
        });
        if(!res.ok) throw new Error('Generation failed');
        const data = await res.json();
        const aiCards = data.flashcards;
        const formatted = aiCards.map((card,i) => ({ id: `flash_${Date.now()}_${i}`, question_text: card.front, back_text: card.back, level:1, lastReviewed:null, nextReview:new Date().toISOString(), history:[] }));
        let decks = JSON.parse(localStorage.getItem('flashcardDecks')||'[]');
        if(editId) {
            const idx = decks.findIndex(d=>d.id===editId);
            if(idx!==-1) decks[idx] = { ...decks[idx], name: deckName, subject: subjectName, subject_id: parseInt(subjectId), topic: topic!=='Select Topic'?topic:null, lastAccessed: new Date().toISOString(), cards: formatted };
        } else {
            decks.push({ id: 'deck_'+Date.now(), name: deckName, subject: subjectName, subject_id: parseInt(subjectId), topic: topic!=='Select Topic'?topic:null, createdAt: new Date().toISOString(), lastAccessed: new Date().toISOString(), cards: formatted });
        }
        localStorage.setItem('flashcardDecks', JSON.stringify(decks));
        const deck = decks.find(d=>d.id=== (editId || decks[decks.length-1].id));
        flashcardState.deck = deck;
        flashcardState.cards = deck.cards;
        flashcardState.currentIndex = 0;
        flashcardState.results = { easy:0, medium:0, hard:0 };
        document.getElementById('decksView').classList.add('hidden');
        document.getElementById('setupView').classList.add('hidden');
        document.getElementById('sessionView').classList.remove('hidden');
        renderFlashcard();
    } catch(e) { alert('Failed: '+e.message); } finally { btn.innerText = orig; btn.disabled = false; }
}
function selectDeck(deckId) {
    let decks = JSON.parse(localStorage.getItem('flashcardDecks')||'[]');
    let deck = decks.find(d=>d.id===deckId);
    if(!deck) return;
    deck.lastAccessed = new Date().toISOString();
    localStorage.setItem('flashcardDecks', JSON.stringify(decks));
    let due = deck.cards.filter(c=>new Date(c.nextReview)<=new Date());
    if(due.length===0) { if(!confirm('No cards due. Review all?')) return; due = deck.cards; }
    flashcardState.deck = deck;
    flashcardState.cards = due;
    flashcardState.currentIndex = 0;
    flashcardState.results = { easy:0, medium:0, hard:0 };
    document.getElementById('decksView').classList.add('hidden');
    document.getElementById('sessionView').classList.remove('hidden');
    renderFlashcard();
}
function renderFlashcard() {
    const card = flashcardState.cards[flashcardState.currentIndex];
    if(!card) return;
    document.getElementById('progressSubject').innerText = flashcardState.deck.subject;
    document.getElementById('progressCount').innerText = `${flashcardState.currentIndex+1}/${flashcardState.cards.length}`;
    document.getElementById('questionText').innerText = card.question_text;
    document.getElementById('answerText').innerText = card.back_text;
    document.getElementById('answerText').classList.remove('show');
}
function flipCard() { document.getElementById('answerText').classList.toggle('show'); }
function rateCard(rating) {
    const card = flashcardState.cards[flashcardState.currentIndex];
    flashcardState.results[rating]++;
    const deckCard = flashcardState.deck.cards.find(c=>c.id===card.id);
    if(rating==='easy') deckCard.level = Math.min(deckCard.level+1,5);
    else if(rating==='hard') deckCard.level = Math.max(deckCard.level-1,1);
    const days = flashcardState.spacedRepetition[deckCard.level];
    const next = new Date(); next.setDate(next.getDate()+days);
    deckCard.lastReviewed = new Date().toISOString();
    deckCard.nextReview = next.toISOString();
    deckCard.history.push({ date: new Date().toISOString(), rating });
    const decks = JSON.parse(localStorage.getItem('flashcardDecks')||'[]');
    const idx = decks.findIndex(d=>d.id===flashcardState.deck.id);
    decks[idx] = flashcardState.deck;
    localStorage.setItem('flashcardDecks', JSON.stringify(decks));
    flashcardState.currentIndex++;
    if(flashcardState.currentIndex < flashcardState.cards.length) renderFlashcard();
    else showSummary();
}
function showSummary() {
    document.getElementById('sessionView').classList.add('hidden');
    document.getElementById('summaryView').classList.remove('hidden');
    document.getElementById('masteredCount').innerText = flashcardState.results.easy;
    document.getElementById('reviewCount').innerText = flashcardState.results.medium;
    document.getElementById('struggleCount').innerText = flashcardState.results.hard;
    loadStats();
}
function continueLearning() {
    const due = flashcardState.deck.cards.filter(c=>new Date(c.nextReview)<=new Date());
    if(due.length) {
        flashcardState.cards = due;
        flashcardState.currentIndex = 0;
        flashcardState.results = { easy:0, medium:0, hard:0 };
        document.getElementById('summaryView').classList.add('hidden');
        document.getElementById('sessionView').classList.remove('hidden');
        renderFlashcard();
    } else { alert('No more due! Great job!'); backToDecks(); }
}
function backToDecks() {
    document.getElementById('decksView').classList.remove('hidden');
    document.getElementById('setupView').classList.add('hidden');
    document.getElementById('sessionView').classList.add('hidden');
    document.getElementById('summaryView').classList.add('hidden');
    loadDecks();
}
function getSubjectName(id) { const map={1:'Use of English',2:'Mathematics',3:'Physics',4:'Chemistry',5:'Biology',6:'Agricultural Science',7:'Computer Studies',8:'Literature in English',9:'Government',10:'History',11:'Christian Religious Studies',12:'Islamic Studies',13:'French',14:'Yoruba',15:'Igbo',16:'Hausa',17:'Music',18:'Fine Arts',19:'Economics',20:'Commerce',21:'Principles of Accounts',22:'Geography'}; return map[id]||'Unknown'; }
function escapeHtml(s) { return s.replace(/[&<>]/g, function(m){ if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }
window.showSetup = showSetup; window.startFlashcards = startFlashcards; window.selectDeck = selectDeck; window.editDeck = editDeck; window.deleteDeck = deleteDeck; window.flipCard = flipCard; window.rateCard = rateCard; window.continueLearning = continueLearning; window.backToDecks = backToDecks;