// server/routes/practice.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Helper: Convert plain-text matrices to LaTeX
function convertMatrixToLatexInText(text) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\[\[\s*([^\]]+)\]\](?:\s*,\s*\[\s*([^\]]+)\]\])*/g, (match) => {
        const innerMatches = match.match(/\[\s*([^\]]+)\s*\]/g);
        if (!innerMatches || innerMatches.length < 2) return match; // not a matrix
        const rows = innerMatches.map(row => {
            return row.replace(/^\[\s*|\s*\]$/g, '').split(',').map(s => s.trim()).join(' & ');
        });
        return `\\(\\begin{bmatrix} ${rows.join(' \\\\ ')} \\end{bmatrix}\\)`;
    });
}

// Helper: Generate AI questions (internal, keeps correct_answer for check endpoint)
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
    let jsonString = jsonMatch[0];
    jsonString = jsonString
        .replace(/\\/g, '\\\\')
        .replace(/[\u0000-\u001F]+/g, ' ')
        .replace(/,(\s*[}\]])/g, '$1');

    let questions;
    try {
        questions = JSON.parse(jsonString);
    } catch (parseError) {
        console.error('JSON parse failed after cleaning:', jsonString);
        throw new Error('Invalid JSON from AI');
    }
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('No valid questions generated');

    // Store correct_answer and explanation internally (not sent to frontend)
    return questions.slice(0, countNeeded).map((q, idx) => ({
        id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
        question_text: convertMatrixToLatexInText(q.question || 'No question provided'),
        option_a: convertMatrixToLatexInText(q.options?.A || 'Option A'),
        option_b: convertMatrixToLatexInText(q.options?.B || 'Option B'),
        option_c: convertMatrixToLatexInText(q.options?.C || 'Option C'),
        option_d: convertMatrixToLatexInText(q.options?.D || 'Option D'),
        correct_answer: q.correct_answer || 'A',
        explanation: convertMatrixToLatexInText(q.explanation || 'No explanation available.'),
        subject: subjectName,
        topic: topic || 'General',
        difficulty: difficulty || 'medium',
        is_ai_generated: true
    }));
}

// ========== PUBLIC ROUTES ==========

// GET /api/practice/subjects
router.get('/subjects', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, code FROM subjects ORDER BY name');
        res.json({ subjects: result.rows });
    } catch (error) {
        console.error('Subjects error:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// GET /api/practice/topics/:subjectId
router.get('/topics/:subjectId', async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        const result = await pool.query(
            `SELECT DISTINCT topic FROM questions WHERE subject_id = $1 AND topic IS NOT NULL ORDER BY topic`,
            [subjectId]
        );
        const topics = result.rows.map(row => row.topic);
        res.json({ topics });
    } catch (error) {
        console.error('Topics error:', error);
        res.json({ topics: [] });
    }
});

// POST /api/practice/questions – returns questions WITHOUT correct_answer/explanation, but with matrix conversion
router.post('/questions', async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count = 10 } = req.body;

        const subjectRes = await pool.query('SELECT name FROM subjects WHERE id = $1', [subject_id]);
        if (subjectRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        const subjectName = subjectRes.rows[0].name;

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

        const dbResult = await pool.query(query, params);
        let dbQuestions = dbResult.rows.map(row => ({
            id: row.id,
            question_text: convertMatrixToLatexInText(row.question_text),
            option_a: convertMatrixToLatexInText(row.option_a),
            option_b: convertMatrixToLatexInText(row.option_b),
            option_c: convertMatrixToLatexInText(row.option_c),
            option_d: convertMatrixToLatexInText(row.option_d),
            subject: row.subject_name,
            topic: row.topic,
            difficulty: row.difficulty,
            is_ai_generated: false
        }));

        let finalQuestions = [...dbQuestions];
        const remaining = count - dbQuestions.length;
        if (remaining > 0) {
            console.log(`⚠️ Only ${dbQuestions.length} DB questions found. Generating ${remaining} AI questions...`);
            try {
                const aiQuestions = await generateAIQuestions(subjectName, topic, difficulty, remaining);
                // AI questions already have matrix conversion; strip correct_answer/explanation before sending
                const cleanedAi = aiQuestions.map(q => ({
                    id: q.id,
                    question_text: q.question_text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    subject: q.subject,
                    topic: q.topic,
                    difficulty: q.difficulty,
                    is_ai_generated: true
                }));
                finalQuestions.push(...cleanedAi);
            } catch (aiError) {
                console.error('AI generation failed:', aiError.message);
            }
        }

        for (let i = finalQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
        }

        res.json(finalQuestions);
    } catch (error) {
        console.error('Practice questions error:', error);
        res.status(500).json({ error: 'Failed to fetch/generate questions' });
    }
});

// POST /api/practice/check – returns isCorrect, correctAnswer (letter), and explanation
router.post('/check', async (req, res) => {
    try {
        const { questionId, selectedAnswer } = req.body;
        if (!questionId || !selectedAnswer) {
            return res.status(400).json({ error: 'Missing questionId or selectedAnswer' });
        }

        const result = await pool.query(
            `SELECT correct_answer, explanation FROM questions WHERE id = $1`,
            [questionId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        const { correct_answer, explanation } = result.rows[0];
        const isCorrect = (selectedAnswer === correct_answer);

        res.json({
            isCorrect,
            correctAnswer: correct_answer,   // now included
            explanation: explanation || 'No explanation available.'
        });
    } catch (error) {
        console.error('Check answer error:', error);
        res.status(500).json({ error: 'Failed to check answer' });
    }
});

// POST /api/practice/generate – dedicated AI endpoint (optional)
router.post('/generate', async (req, res) => {
    try {
        const { subject, topic, count = 10, difficulty = 'medium' } = req.body;
        if (!subject) return res.status(400).json({ error: 'Subject is required' });
        const aiQuestions = await generateAIQuestions(subject, topic, difficulty, count);
        const cleaned = aiQuestions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            is_ai_generated: true
        }));
        res.json({ success: true, count: cleaned.length, questions: cleaned });
    } catch (error) {
        console.error('AI generation error:', error.message);
        res.status(500).json({ error: 'Failed to generate questions', details: error.message });
    }
});

module.exports = router;