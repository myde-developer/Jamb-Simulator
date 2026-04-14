// server/routes/ai-questions.js - GROQ VERSION (FLASHCARDS ONLY)
const express = require('express');
const router = express.Router();
const { allSubjects } = require('../data/all-subjects');

// Helper function for delays (to avoid rate limits)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Get all subjects (for flashcards)
router.get('/subjects', authenticateToken, (req, res) => {
    try {
        const subjects = Object.values(allSubjects).map(subject => ({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            category: subject.category,
            totalQuestions: subject.totalQuestions
        }));
        res.json({ subjects });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Get subject details
router.get('/subject/:subjectId', authenticateToken, (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        const subject = allSubjects[subjectId];
        
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        res.json({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            category: subject.category,
            totalQuestions: subject.totalQuestions,
            duration: subject.duration,
            topics: subject.topics
        });
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: 'Failed to fetch subject' });
    }
});

// Get topics for a subject
router.get('/topics/:subjectId', authenticateToken, (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        const subject = allSubjects[subjectId];
        
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        res.json({ 
            subjectId: subject.id,
            subjectName: subject.name,
            topics: subject.topics
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Generate flashcards using GROQ (only for flashcards)
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, topic, count = 10, difficulty = 'medium' } = req.body;
        
        console.log(`\n📝 Generating ${count} flashcards for subject ${subjectId}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            console.error('❌ GROQ_API_KEY not set');
            return res.status(500).json({ error: 'AI service not configured. Please add GROQ_API_KEY.' });
        }
        
        const topicText = topic && topic !== 'Select Topic' ? ` Topic: ${topic}.` : '';
        const difficultyDesc = difficulty === 'hard' ? 'challenging' : difficulty === 'easy' ? 'basic' : 'standard';
        
        const prompt = `Generate ${count} flashcards for JAMB UTME ${subject.name}.${topicText}
Difficulty: ${difficultyDesc}

Each flashcard must be in this exact JSON format:
{
    "question_text": "The question or prompt",
    "answer_text": "The complete answer with explanation (2-3 sentences)"
}

Requirements:
- Questions should test key concepts from ${subject.name}
- Answers should be informative and educational
- Focus on important facts, definitions, and principles
- Make it suitable for spaced repetition learning

Return ONLY a JSON array of ${count} flashcards. No other text.

Example:
[
    {
        "question_text": "What is the function of the mitochondria?",
        "answer_text": "The mitochondria produces energy (ATP) for the cell through cellular respiration. It is often called the 'powerhouse of the cell' because it converts glucose and oxygen into usable energy."
    }
]`;

        console.log('🤖 Generating flashcards with GROQ...');
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4096
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ GROQ API error: ${response.status} - ${errorText}`);
            throw new Error(`GROQ API returned ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.choices[0].message.content;
        
        // Extract JSON array
        let flashcards = [];
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            flashcards = JSON.parse(jsonMatch[0]);
        } else {
            flashcards = JSON.parse(generatedText);
        }
        
        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error('No valid flashcards generated');
        }
        
        // Format flashcards
        const formattedFlashcards = flashcards.slice(0, count).map((card, i) => ({
            id: `flash_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
            question_text: card.question_text || `Question ${i + 1}`,
            answer_text: card.answer_text || 'No answer provided',
            topic: topic || 'General',
            difficulty: difficulty,
            is_ai_generated: true
        }));
        
        console.log(`✅ Generated ${formattedFlashcards.length} flashcards for ${subject.name}`);
        
        res.json({ 
            success: true, 
            count: formattedFlashcards.length, 
            flashcards: formattedFlashcards 
        });
        
    } catch (error) {
        console.error('❌ Error generating flashcards:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate flashcards', 
            details: error.message 
        });
    }
});

// Test endpoint
router.get('/test', authenticateToken, (req, res) => {
    const groqApiKey = process.env.GROQ_API_KEY;
    res.json({ 
        status: groqApiKey ? 'GROQ_API_KEY is set' : 'GROQ_API_KEY not set',
        message: 'GROQ API ready for flashcards'
    });
});

module.exports = router;