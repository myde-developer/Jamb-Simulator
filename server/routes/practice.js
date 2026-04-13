// server/routes/practice.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Get topics for a subject (from database)
router.get('/topics/:subjectId', authenticateToken, async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        
        // Query distinct topics from questions table
        const result = await pool.query(
            `SELECT DISTINCT topic FROM questions WHERE subject_id = $1 AND topic IS NOT NULL ORDER BY topic`,
            [subjectId]
        );
        
        const topics = result.rows.map(row => row.topic);
        res.json({ topics });
        
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.json({ topics: [] });
    }
});

// Get practice questions from database
router.post('/questions', authenticateToken, async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count = 10 } = req.body;
        
        let query = `
            SELECT q.*, s.name as subject_name 
            FROM questions q
            JOIN subjects s ON q.subject_id = s.id
            WHERE q.subject_id = $1
        `;
        const params = [subject_id];
        let paramIndex = 2;
        
        if (topic && topic !== 'all') {
            query += ` AND q.topic = $${paramIndex}`;
            params.push(topic);
            paramIndex++;
        }
        
        if (difficulty && difficulty !== 'all') {
            query += ` AND q.difficulty = $${paramIndex}`;
            params.push(difficulty);
            paramIndex++;
        }
        
        query += ` ORDER BY RANDOM() LIMIT $${paramIndex}`;
        params.push(count);
        
        const result = await pool.query(query, params);
        
        // Format questions to match frontend expected structure
        const questions = result.rows.map(row => ({
            id: row.id,
            question_text: row.question_text,
            option_a: row.option_a,
            option_b: row.option_b,
            option_c: row.option_c,
            option_d: row.option_d,
            correct_answer: row.correct_answer,
            explanation: row.explanation,
            subject: row.subject_name,
            topic: row.topic,
            difficulty: row.difficulty
        }));
        
        res.json(questions);
        
    } catch (error) {
        console.error('Error fetching practice questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Generate practice questions using AI
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subject, topic, count, difficulty } = req.body;
        
        if (!subject || !count) {
            return res.status(400).json({ error: 'Subject and count are required' });
        }
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'AI service not configured' });
        }
        
        let prompt = `Generate ${count} multiple-choice practice questions for JAMB (Joint Admissions and Matriculation Board) ${subject} exam.`;
        
        if (topic && topic !== 'all') {
            prompt += ` Topic: ${topic}.`;
        }
        
        if (difficulty && difficulty !== 'all') {
            prompt += ` Difficulty level: ${difficulty}.`;
        }
        
        prompt += `

Each question must be in this EXACT JSON format:
{
    "question": "The question text",
    "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
    },
    "correct_answer": "A/B/C/D",
    "explanation": "Brief explanation of why this is correct (2-3 sentences)"
}

Requirements:
- Questions should be similar to actual JAMB exam style
- Distractors should be plausible but clearly incorrect
- Focus on high-yield topics that frequently appear in JAMB
- Each explanation should teach the concept

Return ONLY a valid JSON array of ${count} questions. No extra text.

Example:
[
    {
        "question": "What is the capital of Nigeria?",
        "options": {
            "A": "Lagos",
            "B": "Abuja",
            "C": "Kano",
            "D": "Ibadan"
        },
        "correct_answer": "B",
        "explanation": "Abuja became the capital of Nigeria in 1991, replacing Lagos."
    }
]

Generate ${count} questions now. Return ONLY the JSON array.`;

        console.log(`🤖 Generating ${count} AI questions for ${subject}`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API returned ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }
        
        let questions = [];
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0]);
        } else {
            questions = JSON.parse(generatedText);
        }
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('No questions generated');
        }
        
        questions = questions.slice(0, count).map(q => ({
            question: q.question || 'No question provided',
            options: {
                A: q.options?.A || 'Option A',
                B: q.options?.B || 'Option B',
                C: q.options?.C || 'Option C',
                D: q.options?.D || 'Option D'
            },
            correct_answer: q.correct_answer || 'A',
            explanation: q.explanation || 'No explanation available'
        }));
        
        console.log(`✅ Generated ${questions.length} AI questions`);
        
        res.json({ success: true, count: questions.length, questions: questions });
        
    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        res.status(500).json({ error: 'Failed to generate questions', details: error.message });
    }
});

module.exports = router;