// server/routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

// ============================================
// DASHBOARD STATS
// ============================================
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

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users with exam counts
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

// Get single user details
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT u.id, u.email, u.full_name, u.is_admin, u.created_at
             FROM users u
             WHERE u.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Make user admin
router.put('/users/:id/make-admin', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('UPDATE users SET is_admin = true WHERE id = $1', [id]);
        
        res.json({ success: true, message: 'User role updated to admin' });
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get user's exam history
router.get('/users/:id/exams', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT es.*, 
                    (SELECT array_agg(s.name) 
                     FROM subjects s 
                     WHERE s.id = ANY(es.subjects_selected)) as subjects
             FROM exam_sessions es
             WHERE es.user_id = $1
             ORDER BY es.started_at DESC`,
            [id]
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching user exams:', error);
        res.status(500).json({ error: 'Failed to fetch user exams' });
    }
});

// ============================================
// EXAM MANAGEMENT
// ============================================

// Get all exams with user details
router.get('/exams', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT es.*, u.full_name as user_name,
                    (SELECT array_agg(s.name) 
                     FROM subjects s 
                     WHERE s.id = ANY(es.subjects_selected)) as subjects
             FROM exam_sessions es
             JOIN users u ON u.id = es.user_id
             ORDER BY es.started_at DESC`
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Get single exam details with answers
router.get('/exams/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT es.*, u.full_name as user_name, u.email,
                    json_agg(json_build_object(
                        'question_id', q.id,
                        'question_text', q.question_text,
                        'user_answer', ua.selected_answer,
                        'correct_answer', q.correct_answer,
                        'is_correct', ua.is_correct,
                        'subject', s.name
                    ) ORDER BY q.id) as answers
             FROM exam_sessions es
             JOIN users u ON u.id = es.user_id
             LEFT JOIN user_answers ua ON ua.session_id = es.id
             LEFT JOIN questions q ON q.id = ua.question_id
             LEFT JOIN subjects s ON s.id = q.subject_id
             WHERE es.id = $1
             GROUP BY es.id, u.full_name, u.email`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ error: 'Failed to fetch exam details' });
    }
});

// ============================================
// SUBJECT PERFORMANCE
// ============================================

router.get('/subject-performance', adminAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                s.id,
                s.name,
                s.code,
                COUNT(DISTINCT q.id) as total_questions,
                COUNT(DISTINCT ua.id) as times_answered,
                COUNT(DISTINCT CASE WHEN ua.is_correct THEN ua.id END) as correct_answers,
                CASE 
                    WHEN COUNT(DISTINCT ua.id) > 0 
                    THEN ROUND((COUNT(DISTINCT CASE WHEN ua.is_correct THEN ua.id END)::numeric / COUNT(DISTINCT ua.id)) * 100)
                    ELSE 0
                END as success_rate
            FROM subjects s
            LEFT JOIN questions q ON q.subject_id = s.id
            LEFT JOIN user_answers ua ON ua.question_id = q.id
            GROUP BY s.id, s.name, s.code
            ORDER BY s.name
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching subject performance:', error);
        res.status(500).json({ error: 'Failed to fetch subject performance' });
    }
});

// ============================================
// QUESTION BANK MANAGEMENT
// ============================================

// Get all questions with subject details
router.get('/questions', adminAuth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT q.*, s.name as subject_name, s.code as subject_code
             FROM questions q
             JOIN subjects s ON s.id = q.subject_id
             ORDER BY q.id ASC`
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
        const result = await db.query(
            `SELECT q.*, s.name as subject_name, s.code as subject_code
             FROM questions q
             JOIN subjects s ON s.id = q.subject_id
             WHERE q.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// Add new question
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

// Update question
router.put('/questions/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
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
        
        const result = await db.query(
            `UPDATE questions 
             SET subject_id = $1, question_text = $2, option_a = $3, option_b = $4, 
                 option_c = $5, option_d = $6, correct_answer = $7, explanation = $8, 
                 topic = $9, difficulty = $10, year = $11
             WHERE id = $12
             RETURNING *`,
            [subject_id, question_text, option_a, option_b, option_c, option_d, 
             correct_answer, explanation, topic, difficulty, year, id]
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

// Delete question with reordering
router.delete('/questions/:id', adminAuth, async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;
        
        await client.query('BEGIN');
        
        // Check if question exists
        const checkResult = await client.query(
            'SELECT id FROM questions WHERE id = $1',
            [id]
        );
        
        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Question not found' });
        }
        
        // Delete the question
        await client.query('DELETE FROM questions WHERE id = $1', [id]);
        
        // Reorder remaining questions
        const remainingQuestions = await client.query(
            'SELECT * FROM questions ORDER BY id'
        );
        
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
        
        // Reset the sequence
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

// ============================================
// DASHBOARD CHARTS DATA
// ============================================

// Get daily exam activity for charts
router.get('/activity/daily', adminAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT DATE(started_at) as date, COUNT(*) as count
            FROM exam_sessions
            WHERE started_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(started_at)
            ORDER BY date DESC
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching daily activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity data' });
    }
});

// Get subject distribution
router.get('/distribution/subjects', adminAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.name, COUNT(q.id) as count
            FROM subjects s
            LEFT JOIN questions q ON q.subject_id = s.id
            GROUP BY s.id, s.name
            ORDER BY s.name
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching subject distribution:', error);
        res.status(500).json({ error: 'Failed to fetch distribution data' });
    }
});

// Get difficulty distribution
router.get('/distribution/difficulty', adminAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT difficulty, COUNT(*) as count
            FROM questions
            WHERE difficulty IS NOT NULL
            GROUP BY difficulty
            ORDER BY 
                CASE difficulty
                    WHEN 'easy' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'hard' THEN 3
                END
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching difficulty distribution:', error);
        res.status(500).json({ error: 'Failed to fetch distribution data' });
    }
});

// ============================================
// SYSTEM HEALTH CHECK
// ============================================

router.get('/health', adminAuth, async (req, res) => {
    try {
        // Check database connection
        await db.query('SELECT 1');
        
        // Get table counts
        const tables = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM exam_sessions) as exams,
                (SELECT COUNT(*) FROM questions) as questions,
                (SELECT COUNT(*) FROM subjects) as subjects,
                (SELECT COUNT(*) FROM user_answers) as answers
        `);
        
        res.json({
            status: 'healthy',
            database: 'connected',
            counts: tables.rows[0]
        });
        
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message 
        });
    }
});

module.exports = router;