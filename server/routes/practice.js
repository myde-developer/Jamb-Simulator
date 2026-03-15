// server/routes/practice.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/test', (req, res) => {
    res.json({ message: 'Practice router is working' });
});

router.post('/questions', auth, async (req, res) => {
    try {
        const { subject_id, topic, difficulty, count } = req.body;
        
        if (!subject_id) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }
        
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
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No questions match your criteria' });
        }
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching practice questions:', error);
        res.status(500).json({ error: 'Failed to load questions: ' + error.message });
    }
});

module.exports = router;