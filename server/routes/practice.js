// server/routes/practice.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// In-memory cache to temporarily store AI questions' hidden details safely on the server
const aiMemoryCache = new Map();

// Clean up memory cache every 30 minutes to prevent RAM usage build-up
setInterval(() => {
    const expiryTime = Date.now() - (2 * 60 * 60 * 1000); // 2 hours lifetime
    for (const [id, data] of aiMemoryCache.entries()) {
        if (data.timestamp < expiryTime) aiMemoryCache.delete(id);
    }
}, 30 * 60 * 1000);

// Helper: Convert plain-text matrices to LaTeX (for AI‑generated questions)
function convertMatrixToLatexInText(text) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\[\[([^\]]+)\],\s*\[([^\]]+)\]\]/g, (match, row1, row2) => {
        const cleanRow1 = row1.split(',').map(s => s.trim()).join(' & ');
        const cleanRow2 = row2.split(',').map(s => s.trim()).join(' & ');
        return `\\(\\begin{bmatrix} ${cleanRow1} \\\\ ${cleanRow2} \\end{bmatrix}\\)`;
    });
}

// Helper: Generate AI questions (answers are cached here, not sent to user)
async function generateAIQuestions(subjectName, topic, difficulty, countNeeded) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set');

    let prompt = `Generate ${countNeeded} multiple-choice practice questions for JAMB ${subjectName} exam.`;
    if (topic && topic !== 'all') prompt += ` Topic: ${topic}.`;
    if (difficulty && difficulty !== 'all') prompt += ` Difficulty: ${difficulty}.`;

    prompt += `
Each question must be in this JSON format:
{
    "question": "text",
    "options": { "A": "opt1", "B": "opt2", "C": "opt3", "D": "opt4" },
    "correct_answer": "A/B/C/D",
    "explanation": "explanation (2-3 sentences)"
}
Return ONLY a valid JSON array of ${countNeeded} questions. No extra text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096
        })
    });
    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    let generatedText = data.choices[0].message.content;

    let jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in AI response');
    
    let questions = JSON.parse(jsonMatch[0]);

    return questions.slice(0, countNeeded).map((q, idx) => ({
        id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
        question_text: convertMatrixToLatexInText(q.question || 'No question provided'),
        option_a: convertMatrixToLatexInText(q.options?.A || 'Option A'),
        option_b: convertMatrixToLatexInText(q.options?.B || 'Option B'),
        option_c: convertMatrixToLatexInText(q.options?.C || 'Option C'),
        option_d: convertMatrixToLatexInText(q.options?.D || 'Option D'),
        subject: subjectName,
        topic: topic || 'General',
        difficulty: difficulty || 'medium',
        is_ai_generated: true,
        // Kept hidden internally
        correct_answer: (q.correct_answer || 'A').trim().toUpperCase(),
        explanation: convertMatrixToLatexInText(q.explanation || 'No explanation available.')
    }));
}

// ========== PUBLIC ROUTES ==========

router.get('/subjects', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, code FROM subjects ORDER BY name');
        res.json({ subjects: result.rows });
    } catch (error) { res.status(500).json({ error: 'Failed to fetch subjects' }); }
});

router.get('/topics/:subjectId', async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        const result = await pool.query(`SELECT DISTINCT topic FROM questions WHERE subject_id = $1 AND topic IS NOT NULL`, [subjectId]);
        res.json({ topics: result.rows.map(row => row.topic) });
    } catch (error) { res.json({ topics: [] }); }
});

// 1. LOAD QUESTIONS (Without answers or explanations)
router.post('/questions', async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count = 10 } = req.body;

        const subjectRes = await pool.query('SELECT name FROM subjects WHERE id = $1', [subject_id]);
        if (subjectRes.rows.length === 0) return res.status(400).json({ error: 'Invalid subject' });
        const subjectName = subjectRes.rows[0].name;

        let query = `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.topic, q.difficulty 
                     FROM questions q WHERE q.subject_id = $1`;
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

        const dbResult = await pool.query(query, params);
        let finalQuestions = dbResult.rows.map(row => ({
            id: String(row.id),
            question_text: row.question_text,
            option_a: row.option_a,
            option_b: row.option_b,
            option_c: row.option_c,
            option_d: row.option_d,
            is_ai_generated: false
        }));

        const remaining = count - finalQuestions.length;
        if (remaining > 0) {
            try {
                const aiQuestions = await generateAIQuestions(subjectName, topic, difficulty, remaining);
                aiQuestions.forEach(q => {
                    // Save the secret answer parts to server memory
                    aiMemoryCache.set(q.id, {
                        correct_answer: q.correct_answer,
                        explanation: q.explanation,
                        timestamp: Date.now()
                    });
                    // Strip answer values before returning to user
                    finalQuestions.push({
                        id: q.id,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        is_ai_generated: true
                    });
                });
            } catch (err) { console.error('AI fallback failed:', err.message); }
        }

        res.json(finalQuestions);
    } catch (error) { res.status(500).json({ error: 'Server error loading questions' }); }
});

// 2. CHECK ANSWER ON-DEMAND (Fetches answer + explanation for one question ID)
router.post('/check', async (req, res) => {
    try {
        const { questionId, selectedAnswer } = req.body;
        if (!questionId || !selectedAnswer) return res.status(400).json({ error: 'Missing parameters' });

        let correctAnswer = 'A';
        let explanation = 'No explanation available.';

        if (typeof questionId === 'string' && questionId.startsWith('ai_')) {
            const cached = aiMemoryCache.get(questionId);
            if (cached) {
                correctAnswer = cached.correct_answer;
                explanation = cached.explanation;
            }
        } else {
            const dbResult = await pool.query('SELECT correct_answer, explanation FROM questions WHERE id = $1', [parseInt(questionId, 10)]);
            if (dbResult.rows.length > 0) {
                correctAnswer = dbResult.rows[0].correct_answer;
                explanation = dbResult.rows[0].explanation;
            }
        }

        res.json({
            success: true,
            isCorrect: selectedAnswer.trim().toUpperCase() === correctAnswer,
            correct_answer: correctAnswer,
            explanation
        });
    } catch (error) { res.status(500).json({ error: 'Server error checking answer' }); }
});

module.exports = router;
