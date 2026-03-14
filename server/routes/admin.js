// server/routes/admin.js
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

// ✅ FIXED: Add question route
router.post('/questions', adminAuth, async (req, res) => {
    try {
        const { 
            subject_id, 
            question_text, 
            option_a, 
            option_b, 
            option_c, 
            option_d, 
            correct_answer, 
            explanation, 
            topic, 
            difficulty,
            year 
        } = req.body;
        
        // Validate required fields
        if (!subject_id || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Insert question into database
        const result = await db.query(
            `INSERT INTO questions 
             (subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, year) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
             RETURNING *`,
            [subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, year]
        );
        
        res.status(201).json({ 
            message: 'Question added successfully', 
            question: result.rows[0] 
        });
        
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Failed to add question: ' + error.message });
    }
});

// Get all questions (ordered by ID)
router.get('/questions', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT q.*, s.name as subject_name, s.code as subject_code
             FROM questions q
             JOIN subjects s ON s.id = q.subject_id
             ORDER BY q.id ASC`  // Ensure ascending order
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get single question
router.get('/questions/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM questions WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// Update question
router.put('/questions/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            question_text, 
            option_a, 
            option_b, 
            option_c, 
            option_d, 
            correct_answer, 
            explanation, 
            topic, 
            difficulty,
            year 
        } = req.body;
        
        const result = await db.query(
            `UPDATE questions 
             SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5,
                 correct_answer = $6, explanation = $7, topic = $8, difficulty = $9, year = $10
             WHERE id = $11
             RETURNING *`,
            [question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty, year, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        res.json({ message: 'Question updated successfully', question: result.rows[0] });
        
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

// DELETE question with reordering
router.delete('/questions/:id', adminAuth, async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;
        
        await client.query('BEGIN');
        
        // 1. First, check if question exists
        const checkResult = await client.query(
            'SELECT id FROM questions WHERE id = $1',
            [id]
        );
        
        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Question not found' });
        }
        
        // 2. Delete the question
        await client.query('DELETE FROM questions WHERE id = $1', [id]);
        
        // 3. Reorder all remaining questions to have sequential IDs
        // Get all remaining questions ordered by current ID
        const remainingQuestions = await client.query(
            'SELECT * FROM questions ORDER BY id'
        );
        
        // 4. Update each question's ID to be sequential
        let newId = 1;
        for (const question of remainingQuestions.rows) {
            if (question.id !== newId) {
                await client.query(
                    'UPDATE questions SET id = $1 WHERE id = $2',
                    [newId, question.id]
                );
            }
            newId++;
        }
        
        // 5. Reset the sequence to continue from the max ID
        await client.query(
            'SELECT setval(\'questions_id_seq\', (SELECT COALESCE(MAX(id), 0) FROM questions))'
        );
        
        await client.query('COMMIT');
        
        res.json({ 
            message: 'Question deleted and IDs reordered successfully',
            deletedId: parseInt(id)
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    } finally {
        client.release();
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

module.exports = router;