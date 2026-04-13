const express = require('express');
const router = express.Router();
const db = require('../db'); // Import database connection
const auth = require('../middleware/auth'); // Import auth middleware

router.post('/questions', auth, async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count } = req.body;
        
        let query = `
            SELECT q.*, s.name as subject_name
            FROM questions q
            JOIN subjects s ON s.id = q.subject_id
            WHERE q.subject_id = $1
        `;
        const params = [subject_id];
        let paramIndex = 2;
        
        if (topic && topic !== 'null' && topic !== '') {
            query += ` AND q.topic ILIKE $${paramIndex}`;
            params.push(`%${topic}%`);
            paramIndex++;
        }
        
        if (difficulty && difficulty !== 'all' && difficulty !== 'null') {
            query += ` AND q.difficulty = $${paramIndex}`;
            params.push(difficulty);
            paramIndex++;
        }
        
        query += ` ORDER BY RANDOM() LIMIT $${paramIndex}`;
        params.push(count || 10);
        
        const result = await db.query(query, params);
        
        // Format questions for frontend
        const formattedQuestions = result.rows.map(q => ({
            id: q.id,
            subject: q.subject_name,
            question: q.question_text,
            options: {
                A: q.option_a,
                B: q.option_b,
                C: q.option_c,
                D: q.option_d
            },
            correctAnswer: q.correct_answer,
            explanation: q.explanation || '',
            topic: q.topic,
            difficulty: q.difficulty
        }));
        
        res.json(formattedQuestions);
        
    } catch (error) {
        console.error('Error fetching practice questions:', error);
        res.status(500).json({ error: 'Failed to load questions: ' + error.message });
    }
});

// Get distinct topics for a subject (from database)
router.get('/topics/:subjectId', auth, async (req, res) => {
    try {
        const { subjectId } = req.params;
        
        const result = await db.query(
            `SELECT DISTINCT topic 
             FROM questions 
             WHERE subject_id = $1 AND topic IS NOT NULL AND topic != ''
             ORDER BY topic`,
            [subjectId]
        );
        
        res.json(result.rows.map(row => row.topic));
        
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to load topics' });
    }
});

// Get difficulty levels (optional)
router.get('/difficulties', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT DISTINCT difficulty 
             FROM questions 
             WHERE difficulty IS NOT NULL
             ORDER BY 
                CASE difficulty 
                    WHEN 'easy' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'hard' THEN 3 
                END`
        );
        
        res.json(result.rows.map(row => row.difficulty));
        
    } catch (error) {
        console.error('Error fetching difficulties:', error);
        res.status(500).json({ error: 'Failed to load difficulties' });
    }

// Add this to server/routes/practice.js

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
        
        // Build the prompt for JAMB-style questions
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
- Distractors (wrong options) should be plausible but clearly incorrect
- Include a mix of easy, medium, and hard questions
- Focus on high-yield topics that frequently appear in JAMB
- Each explanation should teach the concept, not just state the answer

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
        "explanation": "Abuja became the capital of Nigeria in 1991, replacing Lagos. It was chosen for its central location and planned infrastructure."
    }
]

Generate ${count} questions now. Return ONLY the JSON array.`;

        console.log(`🤖 Generating ${count} AI questions for ${subject}${topic ? ` - ${topic}` : ''}`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API returned ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }
        
        // Extract JSON array
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
        
        // Validate each question has required fields
        questions = questions.slice(0, count).map(q => ({
            question: q.question || q.text || 'No question provided',
            options: {
                A: q.options?.A || q.option_a || 'Option A',
                B: q.options?.B || q.option_b || 'Option B',
                C: q.options?.C || q.option_c || 'Option C',
                D: q.options?.D || q.option_d || 'Option D'
            },
            correct_answer: q.correct_answer || q.correctAnswer || 'A',
            explanation: q.explanation || 'No explanation available'
        }));
        
        console.log(`✅ Successfully generated ${questions.length} AI questions`);
        
        res.json({ success: true, count: questions.length, questions: questions });
        
    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        res.status(500).json({ error: 'Failed to generate questions', details: error.message });
    }
});

module.exports = router;