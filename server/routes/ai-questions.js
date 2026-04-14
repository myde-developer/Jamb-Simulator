// server/routes/ai-questions.js - CLOUDFLARE WORKERS AI VERSION
// 10,000 FREE requests/day! No cold starts! Super fast!
const express = require('express');
const router = express.Router();
const { allSubjects } = require('../data/all-subjects');

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

// Generate mock questions (fallback)
function generateMockQuestions(subject, count, difficulty = 'medium') {
    const questions = [];
    const topics = subject?.topics || ['General'];
    
    for (let i = 0; i < count; i++) {
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        questions.push({
            question_text: `${subject?.name || 'Subject'} - ${randomTopic}: Practice question ${i + 1}. What is the correct answer?`,
            option_a: 'Option A (Correct answer)',
            option_b: 'Option B (Incorrect)',
            option_c: 'Option C (Incorrect)',
            option_d: 'Option D (Incorrect)',
            correct_answer: 'A',
            explanation: `The correct answer is A. This is a practice question for ${subject?.name || 'Subject'} - ${randomTopic}.`,
            topic: randomTopic,
            difficulty: difficulty
        });
    }
    return questions;
}

// Generate questions using Cloudflare Workers AI
async function generateWithCloudflare(subject, count, difficulty, apiToken, accountId) {
    const difficultyDesc = difficulty === 'hard' ? 'Hard - challenging' : 
                           difficulty === 'easy' ? 'Easy - basic' : 'Medium - standard';
    
    const prompt = `Generate ${count} multiple-choice questions for JAMB UTME ${subject.name}.
Difficulty: ${difficultyDesc}

Each question must be in this exact JSON format:
{
    "question_text": "the question",
    "option_a": "first option",
    "option_b": "second option",
    "option_c": "third option",
    "option_d": "fourth option",
    "correct_answer": "A/B/C/D",
    "explanation": "brief explanation"
}

Return ONLY a JSON array of ${count} questions. No other text.`;

    // Using Llama 3.1 8B (great quality, fast)
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 4096,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cloudflare error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    const generatedText = data.result?.response || '';
    
    // Extract JSON array
    let questions = [];
    const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
    } else {
        const start = generatedText.indexOf('[');
        const end = generatedText.lastIndexOf(']') + 1;
        if (start !== -1 && end !== -1) {
            const jsonStr = generatedText.substring(start, end);
            questions = JSON.parse(jsonStr);
        }
    }
    
    return questions;
}

// Main generate endpoint
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, count = 10, difficulty = 'medium' } = req.body;
        
        console.log(`\n📝 Generating ${count} questions for subject ${subjectId}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        
        if (!apiToken || !accountId) {
            console.log('⚠️ Cloudflare credentials not set, using mock questions');
            const mockQuestions = generateMockQuestions(subject, count, difficulty);
            const formattedMocks = mockQuestions.map((q, i) => ({
                id: `mock_${Date.now()}_${i}`,
                ...q,
                subject: subject.name,
                subject_id: subject.id,
                is_ai_generated: false
            }));
            return res.json({ success: true, count: formattedMocks.length, questions: formattedMocks });
        }
        
        console.log('🤖 Generating with Cloudflare Workers AI (10,000 FREE requests/day!)');
        console.log('   Model: Llama 3.1 8B (No cold starts, global network)');
        
        let questions;
        try {
            questions = await generateWithCloudflare(subject, count, difficulty, apiToken, accountId);
        } catch (apiError) {
            console.log('⚠️ Cloudflare error, falling back to mock questions:', apiError.message);
            const mockQuestions = generateMockQuestions(subject, count, difficulty);
            const formattedMocks = mockQuestions.map((q, i) => ({
                id: `mock_${Date.now()}_${i}`,
                ...q,
                subject: subject.name,
                subject_id: subject.id,
                is_ai_generated: false
            }));
            return res.json({ success: true, count: formattedMocks.length, questions: formattedMocks });
        }
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('No valid questions generated');
        }
        
        // Format questions
        const formattedQuestions = questions.slice(0, count).map((q, i) => ({
            id: `ai_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
            question_text: q.question_text || `Practice question ${i + 1}`,
            option_a: q.option_a || 'Option A',
            option_b: q.option_b || 'Option B',
            option_c: q.option_c || 'Option C',
            option_d: q.option_d || 'Option D',
            correct_answer: q.correct_answer || 'A',
            explanation: q.explanation || 'No explanation available',
            subject: subject.name,
            subject_id: subject.id,
            topic: subject.topics?.[Math.floor(Math.random() * subject.topics.length)] || 'General',
            difficulty: difficulty,
            is_ai_generated: true
        }));
        
        console.log(`✅ Generated ${formattedQuestions.length} questions using Cloudflare Workers AI!`);
        
        res.json({ 
            success: true, 
            count: formattedQuestions.length, 
            questions: formattedQuestions 
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        const subject = allSubjects[parseInt(req.body.subjectId)];
        const mockQuestions = generateMockQuestions(subject, req.body.count || 10, req.body.difficulty || 'medium');
        const formattedMocks = mockQuestions.map((q, i) => ({
            id: `mock_${Date.now()}_${i}`,
            ...q,
            subject: subject?.name || 'Subject',
            subject_id: parseInt(req.body.subjectId),
            is_ai_generated: false
        }));
        res.json({ success: true, count: formattedMocks.length, questions: formattedMocks });
    }
});

// Test endpoint
router.get('/test', authenticateToken, (req, res) => {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    
    res.json({ 
        status: (apiToken && accountId) ? 'Cloudflare AI is configured' : 'Cloudflare AI not configured',
        hasToken: !!apiToken,
        hasAccountId: !!accountId,
        message: (apiToken && accountId) ? 'Ready to generate questions! (10,000 free/day)' : 'Using mock questions'
    });
});

module.exports = router;