const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get user's exam history
router.get('/history', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT es.*, 
                    array_agg(s.name) as subject_names
             FROM exam_sessions es
             LEFT JOIN subjects s ON s.id = ANY(es.subjects_selected)
             WHERE es.user_id = $1
             GROUP BY es.id
             ORDER BY es.started_at DESC`,
            [req.user.id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get subject statistics
router.get('/stats/subjects', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.id, s.name,
                    COUNT(DISTINCT ua.id) as total_questions,
                    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_answers
             FROM subjects s
             LEFT JOIN questions q ON q.subject_id = s.id
             LEFT JOIN user_answers ua ON ua.question_id = q.id
             LEFT JOIN exam_sessions es ON es.id = ua.session_id AND es.user_id = $1
             GROUP BY s.id, s.name
             ORDER BY s.name`,
            [req.user.id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subject stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get recent exams
router.get('/recent', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT es.id, es.started_at, es.completed_at, 
                    es.score, es.total_questions,
                    array_agg(s.name) as subjects
             FROM exam_sessions es
             LEFT JOIN subjects s ON s.id = ANY(es.subjects_selected)
             WHERE es.user_id = $1 AND es.completed_at IS NOT NULL
             GROUP BY es.id
             ORDER BY es.completed_at DESC
             LIMIT 5`,
            [req.user.id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recent exams:', error);
        res.status(500).json({ error: 'Failed to fetch recent exams' });
    }
});

module.exports = router;