// server/routes/ai-questions.js - SIMPLE VERSION
const express = require('express');
const router = express.Router();
const { allSubjects } = require('../data/all-subjects');

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

// Get all subjects
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

// Generate questions - SIMPLE AND DIRECT
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, count = 10, difficulty = 'medium' } = req.body;
        
        console.log(`\n📝 Generating ${count} questions for subject ${subjectId}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            console.log('⚠️ No API key, using mock questions');
            const mockQuestions = [];
            for (let i = 0; i < count; i++) {
                mockQuestions.push({
                    question_text: `${subject.name} practice question ${i + 1}: What is the correct answer?`,
                    option_a: 'Option A (Correct)',
                    option_b: 'Option B',
                    option_c: 'Option C',
                    option_d: 'Option D',
                    correct_answer: 'A',
                    explanation: `Practice question for ${subject.name}. The correct answer is A.`,
                    topic: 'General',
                    difficulty: difficulty
                });
            }
            
            const formattedMocks = mockQuestions.map((q, i) => ({
                id: `mock_${Date.now()}_${i}`,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                subject: subject.name,
                subject_id: subject.id,
                topic: q.topic,
                difficulty: q.difficulty,
                is_ai_generated: true
            }));
            
            return res.json({ success: true, count: formattedMocks.length, questions: formattedMocks });
        }
        
        // Generate all questions at once in a single API call
        const prompt = `Generate ${count} multiple-choice questions for JAMB ${subject.name}.
Difficulty: ${difficulty === 'hard' ? 'Hard' : difficulty === 'easy' ? 'Easy' : 'Medium'}

Return a JSON array of ${count} questions. Each question must have:
{
    "question_text": "the question",
    "option_a": "option A",
    "option_b": "option B",
    "option_c": "option C",
    "option_d": "option D",
    "correct_answer": "A/B/C/D",
    "explanation": "explanation here"
}

Return ONLY the JSON array. No other text.`;

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
                max_tokens: 8192
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.choices[0].message.content;
        
        // Extract JSON array
        let questions = [];
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0]);
        } else {
            questions = JSON.parse(generatedText);
        }
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('No valid questions generated');
        }
        
        // Format questions
        const formattedQuestions = questions.slice(0, count).map((q, i) => ({
            id: `ai_${Date.now()}_${i}`,
            question_text: q.question_text || `Question ${i + 1}`,
            option_a: q.option_a || 'Option A',
            option_b: q.option_b || 'Option B',
            option_c: q.option_c || 'Option C',
            option_d: q.option_d || 'Option D',
            correct_answer: q.correct_answer || 'A',
            explanation: q.explanation || 'No explanation',
            subject: subject.name,
            subject_id: subject.id,
            topic: 'General',
            difficulty: difficulty,
            is_ai_generated: true
        }));
        
        console.log(`✅ Generated ${formattedQuestions.length} questions for ${subject.name}`);
        
        res.json({ success: true, count: formattedQuestions.length, questions: formattedQuestions });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Return mock questions on error
        const subject = allSubjects[parseInt(req.body.subjectId)];
        const mockQuestions = [];
        for (let i = 0; i < (req.body.count || 10); i++) {
            mockQuestions.push({
                id: `mock_${Date.now()}_${i}`,
                question_text: `${subject?.name || 'Subject'} practice question ${i + 1}: What is the correct answer?`,
                option_a: 'Option A (Correct)',
                option_b: 'Option B',
                option_c: 'Option C',
                option_d: 'Option D',
                correct_answer: 'A',
                explanation: 'Practice question. The correct answer is A.',
                subject: subject?.name || 'Subject',
                subject_id: parseInt(req.body.subjectId),
                topic: 'General',
                difficulty: req.body.difficulty || 'medium',
                is_ai_generated: true
            });
        }
        res.json({ success: true, count: mockQuestions.length, questions: mockQuestions });
    }
});

// Test endpoint
router.get('/test', authenticateToken, async (req, res) => {
    const groqApiKey = process.env.GROQ_API_KEY;
    res.json({ 
        status: groqApiKey ? 'GROQ_API_KEY is set' : 'GROQ_API_KEY not set',
        message: 'Simple generation - one API call for all questions'
    });
});

module.exports = router;