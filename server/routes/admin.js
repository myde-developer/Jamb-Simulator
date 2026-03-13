const express = require('express');
const router = express.Router();
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const usersResult = await db.query('SELECT COUNT(*) FROM users');
        const examsResult = await db.query('SELECT COUNT(*) FROM exam_sessions');
        const questionsResult = await db.query('SELECT COUNT(*) FROM questions');
        const avgResult = await db.query(
            'SELECT AVG(percentage) as avg_score FROM exam_sessions WHERE percentage IS NOT NULL'
        );
        
        res.json({
            totalUsers: parseInt(usersResult.rows[0].count),
            totalExams: parseInt(examsResult.rows[0].count),
            totalQuestions: parseInt(questionsResult.rows[0].count),
            avgScore: Math.round(avgResult.rows[0].avg_score || 0)
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.email, u.full_name, u.is_admin, u.created_at,
                    COUNT(DISTINCT es.id) as exam_count
             FROM users u
             LEFT JOIN exam_sessions es ON es.user_id = u.id
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get all exams
router.get('/exams', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT es.*, u.full_name as user_name,
                    array_agg(s.name) as subjects
             FROM exam_sessions es
             JOIN users u ON u.id = es.user_id
             LEFT JOIN subjects s ON s.id = ANY(es.subjects_selected)
             GROUP BY es.id, u.full_name
             ORDER BY es.started_at DESC`
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Get subject performance
router.get('/subject-performance', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.id, s.name, s.code,
                    COUNT(q.id) as total_questions,
                    COUNT(ua.id) as times_answered,
                    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_answers
             FROM subjects s
             LEFT JOIN questions q ON q.subject_id = s.id
             LEFT JOIN user_answers ua ON ua.question_id = q.id
             GROUP BY s.id, s.name, s.code
             ORDER BY s.name`
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching subject performance:', error);
        res.status(500).json({ error: 'Failed to fetch subject performance' });
    }
});

// Get all questions
router.get('/questions', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT q.*, s.name as subject_name, s.code as subject_code
             FROM questions q
             JOIN subjects s ON s.id = q.subject_id
             ORDER BY q.id`
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Add question
router.post('/questions', adminAuth, async (req, res) => {
    try {
        const { subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty } = req.body;
        
        const result = await db.query(
            `INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty]
        );
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Failed to add question' });
    }
});

// Update question
router.put('/questions/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty } = req.body;
        
        await db.query(
            `UPDATE questions 
             SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5,
                 correct_answer = $6, explanation = $7, topic = $8, difficulty = $9
             WHERE id = $10`,
            [question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, id]
        );
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

// Delete question
router.delete('/questions/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM questions WHERE id = $1', [id]);
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

// Make user admin
router.put('/users/:id/make-admin', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('UPDATE users SET is_admin = true WHERE id = $1', [id]);
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Export data
router.get('/export/:type', adminAuth, async (req, res) => {
    try {
        const { type } = req.params;
        let data;
        
        switch(type) {
            case 'users':
                data = await db.query('SELECT id, email, full_name, is_admin, created_at FROM users');
                break;
            case 'exams':
                data = await db.query(
                    'SELECT es.*, u.email FROM exam_sessions es JOIN users u ON u.id = es.user_id'
                );
                break;
            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }
        
        res.json(data.rows);
        
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

module.exports = router;