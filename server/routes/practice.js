// server/routes/practice.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get practice questions with topic filtering
router.post('/questions', auth, async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count } = req.body;
        
        let query = `
            SELECT q.*, s.name as subject, s.code as subject_code
            FROM questions q
            JOIN subjects s ON s.id = q.subject_id
            WHERE q.subject_id = $1
        `;
        const params = [subject_id];
        let paramIndex = 2;
        
        if (topic && topic !== 'null' && topic !== '' && topic !== 'all') {
            query += ` AND q.topic = $${paramIndex}`;
            params.push(topic);
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
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching practice questions:', error);
        res.status(500).json({ error: 'Failed to load questions' });
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
});

module.exports = router;