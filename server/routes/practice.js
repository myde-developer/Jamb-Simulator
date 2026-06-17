// server/routes/practice.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 💡 FIX: In-memory cache to temporarily store AI questions' hidden details
const aiMemoryCache = new Map();

// Automatically clean up memory every 15 minutes to prevent leak build-ups
setInterval(() => {
    const expiryTime = Date.now() - (60 * 60 * 1000); // 1 hour lifetime
    for (const [id, data] of aiMemoryCache.entries()) {
        if (data.timestamp < expiryTime) {
            aiMemoryCache.delete(id);
        }
    }
}, 15 * 60 * 1000);

// Helper: Convert plain-text matrices to LaTeX (for AI‑generated questions)
function convertMatrixToLatexInText(text) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\[\[([^\]]+)\],\s*\[([^\]]+)\]\]/g, (match, row1, row2) => {
        const cleanRow1 = row1.split(',').map(s => s.trim()).join(' & ');
        const cleanRow2 = row2.split(',').map(s => s.trim()).join(' & ');
        return `\\(\\begin{bmatrix} ${cleanRow1} \\\\ ${cleanRow2} \\end{bmatrix}\\)`;
    });
}

// Helper: Generate AI questions (internal – answers are kept but not sent to frontend)
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
        // Internal fields
        correct_answer: (q.correct_answer || 'A').trim().toUpperCase(),
        explanation: convertMatrixToLatexInText(q.explanation || 'No explanation available.')
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

// POST /api/practice/questions – returns questions WITHOUT correct_answer or explanation
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
            id: String(row.id), // Normalize IDs to string type
            question_text: row.question_text,
            option_a: row.option_a,
            option_b: row.option_b,
            option_c: row.option_c,
            option_d: row.option_d,
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
                
                // 💡 FIX: Secure answers and explanations locally in server memory before discarding them from client payload
                aiQuestions.forEach(q => {
                    aiMemoryCache.set(q.id, {
                        correct_answer: q.correct_answer,
                        explanation: q.explanation,
                        timestamp: Date.now()
                    });
                });

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

// =======================================================
// ⚡ NEW ENDPOINT: POST /api/practice/check
// Evaluates single answers securely and on-demand
// =======================================================
router.post('/check', async (req, res) => {
    try {
        const { questionId, selectedAnswer } = req.body;
        if (!questionId || !selectedAnswer) {
            return res.status(400).json({ error: 'Missing questionId or selectedAnswer parameters.' });
        }

        let correctAnswer = 'A';
        let explanation = 'No explanation available.';
        const cleanUserAnswer = selectedAnswer.trim().toUpperCase();

        // Router checks ID structure to process either Local DB or Cache queries
        if (typeof questionId === 'string' && questionId.startsWith('ai_')) {
            const cachedQuestion = aiMemoryCache.get(questionId);
            if (cachedQuestion) {
                correctAnswer = cachedQuestion.correct_answer;
                explanation = cachedQuestion.explanation;
            }
        } else {
            const dbId = parseInt(questionId, 10);
            if (!isNaN(dbId)) {
                const dbResult = await pool.query(
                    `SELECT correct_answer, explanation FROM questions WHERE id = $1`,
                    [dbId]
                );
                if (dbResult.rows.length > 0) {
                    correctAnswer = dbResult.rows[0].correct_answer;
                    explanation = dbResult.rows[0].explanation;
                }
            }
        }

        const isCorrect = (cleanUserAnswer === correctAnswer);

        res.json({
            success: true,
            isCorrect,
            correct_answer: correctAnswer,
            explanation
        });
    } catch (error) {
        console.error('Check answer error:', error);
        res.status(500).json({ error: 'Server error processing assessment evaluation' });
    }
});

// POST /api/practice/grade – grade all answers at once and return results
router.post('/grade', async (req, res) => {
    try {
        const { answers } = req.body; 
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        const results = [];
        for (const { questionId, selectedAnswer } of answers) {
            let correct_answer = 'A';
            let explanation = 'No explanation available.';

            if (typeof questionId === 'string' && questionId.startsWith('ai_')) {
                const cached = aiMemoryCache.get(questionId);
                if (cached) {
                    correct_answer = cached.correct_answer;
                    explanation = cached.explanation;
                }
            } else {
                const dbId = parseInt(questionId, 10);
                if (!isNaN(dbId)) {
                    let dbResult = await pool.query(
                        `SELECT correct_answer, explanation FROM questions WHERE id = $1`,
                        [dbId]
                    );
                    if (dbResult.rows.length > 0) {
                        correct_answer = dbResult.rows[0].correct_answer;
                        explanation = dbResult.rows[0].explanation;
                    }
                }
            }
            results.push({
                questionId,
                selectedAnswer,
                correct_answer,
                explanation,
                isCorrect: (selectedAnswer === correct_answer)
            });
        }
        res.json({ success: true, results });
    } catch (error) {
        console.error('Grading error:', error);
        res.status(500).json({ error: 'Failed to grade answers' });
    }
});

module.exports = router;
