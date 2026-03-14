// server/routes/practice.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get practice questions
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
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching practice questions:', error);
        res.status(500).json({ error: 'Failed to load questions' });
    }
});

module.exports = router;