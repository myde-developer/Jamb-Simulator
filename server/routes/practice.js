// server/routes/practice.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
// allSubjects is only used for the exam's English distribution – not for practice topics
// const { allSubjects } = require('../data/all-subjects'); // optional, not used for practice

// Helper: Convert plain-text matrices to LaTeX (for AI‑generated questions)
function convertMatrixToLatexInText(text) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\[\[([^\]]+)\],\s*\[([^\]]+)\]\]/g, (match, row1, row2) => {
        const cleanRow1 = row1.split(',').map(s => s.trim()).join(' & ');
        const cleanRow2 = row2.split(',').map(s => s.trim()).join(' & ');
        return `\\(\\begin{bmatrix} ${cleanRow1} \\\\ ${cleanRow2} \\end{bmatrix}\\)`;
    });
}

// Helper: Generate AI questions using GROQ with matrix conversion
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

    // Extract JSON array
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

    // Format and convert matrices
    return questions.slice(0, countNeeded).map((q, idx) => {
        let questionText = convertMatrixToLatexInText(q.question || 'No question provided');
        let optA = convertMatrixToLatexInText(q.options?.A || 'Option A');
        let optB = convertMatrixToLatexInText(q.options?.B || 'Option B');
        let optC = convertMatrixToLatexInText(q.options?.C || 'Option C');
        let optD = convertMatrixToLatexInText(q.options?.D || 'Option D');
        let explanation = convertMatrixToLatexInText(q.explanation || 'No explanation available.');
        return {
            id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
            question_text: questionText,
            option_a: optA,
            option_b: optB,
            option_c: optC,
            option_d: optD,
            correct_answer: q.correct_answer || 'A',
            explanation: explanation,
            subject: subjectName,
            topic: topic || 'General',
            difficulty: difficulty || 'medium',
            is_ai_generated: true
        };
    });
}

// ========== PUBLIC ROUTES ==========

// GET /api/practice/subjects – from database (fast)
router.get('/subjects', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, code FROM subjects ORDER BY name');
        res.json({ subjects: result.rows });
    } catch (error) {
        console.error('Subjects error:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// GET /api/practice/topics/:subjectId – from database (distinct topics from questions)
router.get('/topics/:subjectId', async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        // This query is fast with an index on (subject_id, topic)
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

// POST /api/practice/questions – database + AI fallback (with matrix conversion)
router.post('/questions', async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count = 10 } = req.body;

        const subjectRes = await pool.query('SELECT name FROM subjects WHERE id = $1', [subject_id]);
        if (subjectRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        const subjectName = subjectRes.rows[0].name;

        // Build query for database questions
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
            question_text: row.question_text,
            option_a: row.option_a,
            option_b: row.option_b,
            option_c: row.option_c,
            option_d: row.option_d,
            correct_answer: row.correct_answer,
            explanation: row.explanation,
            subject: row.subject_name,
            topic: row.topic,
            difficulty: row.difficulty,
            is_ai_generated: false
        }));

        // If not enough, generate AI questions for the shortfall
        let finalQuestions = [...dbQuestions];
        const remaining = count - dbQuestions.length;
        if (remaining > 0) {
            console.log(`⚠️ Only ${dbQuestions.length} DB questions found. Generating ${remaining} AI questions...`);
            try {
                const aiQuestions = await generateAIQuestions(subjectName, topic, difficulty, remaining);
                finalQuestions.push(...aiQuestions);
            } catch (aiError) {
                console.error('AI generation failed:', aiError.message);
                // fallback – return whatever DB questions we have
            }
        }

        // Shuffle final set
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

// POST /api/practice/generate – dedicated AI endpoint (optional)
router.post('/generate', async (req, res) => {
    try {
        const { subject, topic, count = 10, difficulty = 'medium' } = req.body;
        if (!subject) return res.status(400).json({ error: 'Subject is required' });
        const aiQuestions = await generateAIQuestions(subject, topic, difficulty, count);
        res.json({ success: true, count: aiQuestions.length, questions: aiQuestions });
    } catch (error) {
        console.error('AI generation error:', error.message);
        res.status(500).json({ error: 'Failed to generate questions', details: error.message });
    }
});

module.exports = router;