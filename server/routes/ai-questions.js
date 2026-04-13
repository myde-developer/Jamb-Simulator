// server/routes/ai-questions.js - Using GROQ API (Free)
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
            hasDiagrams: subject.hasDiagrams || false,
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
            hasDiagrams: subject.hasDiagrams || false,
            minDiagramQuestions: subject.minDiagramQuestions || 0,
            topicDistribution: subject.topicDistribution || null,
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
            topics: subject.topics,
            hasDiagrams: subject.hasDiagrams || false
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Generate questions using GROQ API (Free!)
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, topic, count = 10, difficulty = 'medium', includeDiagrams = false, forceDiagrams = false, examMode = false } = req.body;
        
        console.log(`📝 Generate request: subjectId=${subjectId}, topic=${topic}, count=${count}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        // Try GROQ API first (free)
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (groqApiKey) {
            console.log(`🤖 Generating ${count} AI questions for ${subject.name} using GROQ (free)`);
            
            const prompt = `Generate ${count} high-quality multiple-choice practice questions for the JAMB UTME ${subject.name} exam.
${topic && topic !== 'all' && topic !== 'Select Topic' ? ` Topic: ${topic}.` : ` Cover key concepts from the ${subject.name} syllabus.`}
${difficulty && difficulty !== 'all' ? ` Difficulty level: ${difficulty}.` : ''}

Each question must be in this EXACT JSON format:
{
    "question_text": "The question text",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "A/B/C/D",
    "explanation": "Detailed explanation (2-3 sentences)",
    "topic": "${topic || 'General'}",
    "difficulty": "${difficulty}"
}

Return ONLY a valid JSON array of ${count} questions. No extra text.

Example:
[
    {
        "question_text": "What is the capital of Nigeria?",
        "option_a": "Lagos",
        "option_b": "Abuja",
        "option_c": "Kano",
        "option_d": "Ibadan",
        "correct_answer": "B",
        "explanation": "Abuja became the capital in 1991.",
        "topic": "Geography",
        "difficulty": "easy"
    }
]`;

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
            
            if (response.ok) {
                const data = await response.json();
                const generatedText = data.choices[0].message.content;
                
                console.log(`📥 Received response from GROQ (${generatedText.length} chars)`);
                
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
                const formattedQuestions = [];
                for (let i = 0; i < Math.min(questions.length, count); i++) {
                    const q = questions[i];
                    formattedQuestions.push({
                        id: `ai_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
                        question_text: q.question_text || q.question || 'No question provided',
                        option_a: q.option_a || q.options?.A || 'Option A',
                        option_b: q.option_b || q.options?.B || 'Option B',
                        option_c: q.option_c || q.options?.C || 'Option C',
                        option_d: q.option_d || q.options?.D || 'Option D',
                        correct_answer: q.correct_answer || 'A',
                        explanation: q.explanation || 'No explanation available',
                        subject: subject.name,
                        subject_id: subject.id,
                        topic: q.topic || topic || 'General',
                        difficulty: q.difficulty || difficulty,
                        is_ai_generated: true
                    });
                }
                
                console.log(`✅ Generated ${formattedQuestions.length} questions for ${subject.name} using GROQ`);
                
                return res.json({ 
                    success: true, 
                    count: formattedQuestions.length, 
                    questions: formattedQuestions 
                });
            }
        }
        
        // Fallback to mock questions if no API works
        console.log(`⚠️ No working API. Generating mock questions for ${subject.name}`);
        const mockQuestions = generateMockQuestions(subject.name, count);
        
        res.json({ 
            success: true, 
            count: mockQuestions.length, 
            questions: mockQuestions 
        });
        
    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate questions', 
            details: error.message 
        });
    }
});

// Mock questions generator (fallback)
function generateMockQuestions(subjectName, count) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        questions.push({
            id: `mock_${Date.now()}_${i}`,
            question_text: `Sample ${subjectName} question ${i + 1}: What is the correct answer?`,
            option_a: 'Option A',
            option_b: 'Option B',
            option_c: 'Option C',
            option_d: 'Option D',
            correct_answer: 'A',
            explanation: `This is a sample explanation for ${subjectName} question ${i + 1}.`,
            subject: subjectName,
            topic: 'General',
            difficulty: 'medium',
            is_ai_generated: true
        });
    }
    return questions;
}

module.exports = router;