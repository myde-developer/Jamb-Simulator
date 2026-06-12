// server/routes/practice.js – with automatic AI fallback
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Helper: Generate AI questions for a subject/topic/difficulty
async function generateAIQuestions(subjectName, topic, difficulty, countNeeded) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY not set');
    }
    
    let prompt = `Generate ${countNeeded} multiple-choice practice questions for the JAMB ${subjectName} exam.`;
    if (topic && topic !== 'all') prompt += ` Topic: ${topic}.`;
    if (difficulty && difficulty !== 'all') prompt += ` Difficulty level: ${difficulty}.`;
    
    prompt += `
Each question must be in this EXACT JSON format:
{
    "question": "The question text",
    "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
    },
    "correct_answer": "A/B/C/D",
    "explanation": "Brief explanation of why this is correct (2-3 sentences)"
}

Requirements:
- Questions should be similar to actual JAMB exam style.
- Distractors should be plausible but clearly incorrect.
- Focus on high-yield topics that frequently appear in JAMB.
- Each explanation should teach the concept.

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
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
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
    
    // Format to match database question structure
    return questions.slice(0, countNeeded).map((q, idx) => ({
        id: `ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
        question_text: q.question,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        subject: subjectName,
        topic: topic || 'General',
        difficulty: difficulty || 'medium',
        is_ai_generated: true
    }));
}

// GET /api/practice/subjects – public
router.get('/subjects', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, code FROM subjects ORDER BY name');
        res.json({ subjects: result.rows });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// GET /api/practice/topics/:subjectId – public
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
        console.error('Error fetching topics:', error);
        res.json({ topics: [] });
    }
});

// POST /api/practice/questions – public, with AI fallback
router.post('/questions', async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count = 10 } = req.body;
        
        // 1. Get subject name
        const subjectRes = await pool.query('SELECT name FROM subjects WHERE id = $1', [subject_id]);
        if (subjectRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        const subjectName = subjectRes.rows[0].name;
        
        // 2. Fetch available DB questions
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
        
        // 3. If not enough, generate AI questions for the shortfall
        let finalQuestions = [...dbQuestions];
        const remaining = count - dbQuestions.length;
        if (remaining > 0) {
            console.log(`⚠️ Only ${dbQuestions.length} DB questions found. Generating ${remaining} AI questions...`);
            try {
                const aiQuestions = await generateAIQuestions(subjectName, topic, difficulty, remaining);
                finalQuestions.push(...aiQuestions);
            } catch (aiError) {
                console.error('AI generation failed:', aiError);
                // Fallback: return whatever DB questions we have, even if fewer
            }
        }
        
        // 4. Shuffle the final set (mix DB and AI)
        for (let i = finalQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
        }
        
        res.json(finalQuestions);
        
    } catch (error) {
        console.error('Error in practice/questions:', error);
        res.status(500).json({ error: 'Failed to fetch/generate questions' });
    }
});

// Optional: Keep the explicit AI generation endpoint if needed
router.post('/generate', async (req, res) => {
    try {
        const { subject, topic, count, difficulty } = req.body;
        if (!subject || !count) {
            return res.status(400).json({ error: 'Subject and count are required' });
        }
        const aiQuestions = await generateAIQuestions(subject, topic, difficulty, count);
        // Format for frontend (matches existing AI response structure)
        const questions = aiQuestions.map(q => ({
            question: q.question_text,
            options: {
                A: q.option_a,
                B: q.option_b,
                C: q.option_c,
                D: q.option_d
            },
            correct_answer: q.correct_answer,
            explanation: q.explanation
        }));
        res.json({ success: true, count: questions.length, questions });
    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        res.status(500).json({ error: 'Failed to generate questions', details: error.message });
    }
});

module.exports = router;