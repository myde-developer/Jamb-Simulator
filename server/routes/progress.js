// server/routes/progress.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get user's exam history (list)
router.get('/history', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT es.id, es.started_at, es.completed_at, es.score, 
                    es.total_questions, es.percentage,
                    (SELECT array_agg(s.name) 
                     FROM subjects s 
                     WHERE s.id = ANY(es.subjects_selected)) as subject_names
             FROM exam_sessions es
             WHERE es.user_id = $1
             ORDER BY es.started_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching exam history:', error);
        res.status(500).json({ error: 'Failed to fetch exam history' });
    }
});

// Get full details of a specific exam (for the authenticated user)
router.get('/exam/:id', auth, async (req, res) => {
    try {
        const examId = req.params.id;
        const userId = req.user.id;

        // Verify exam belongs to this user
        const examCheck = await db.query(
            `SELECT id FROM exam_sessions WHERE id = $1 AND user_id = $2`,
            [examId, userId]
        );
        if (examCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        const result = await db.query(
            `SELECT es.*, 
                    json_agg(json_build_object(
                        'question_id', q.id,
                        'question_text', q.question_text,
                        'option_a', q.option_a,
                        'option_b', q.option_b,
                        'option_c', q.option_c,
                        'option_d', q.option_d,
                        'user_answer', ua.selected_answer,
                        'correct_answer', q.correct_answer,
                        'is_correct', ua.is_correct,
                        'explanation', q.explanation,
                        'subject', s.name
                    ) ORDER BY q.id) as answers
             FROM exam_sessions es
             LEFT JOIN user_answers ua ON ua.session_id = es.id
             LEFT JOIN questions q ON q.id = ua.question_id
             LEFT JOIN subjects s ON s.id = q.subject_id
             WHERE es.id = $1
             GROUP BY es.id`,
            [examId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exam data not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ error: 'Failed to fetch exam details' });
    }
});

// Get subject statistics (original – kept as is)
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

// Get recent exams (original – kept as is)
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