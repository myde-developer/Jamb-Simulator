const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get all subjects
router.get('/subjects', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, code FROM subjects ORDER BY name'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Get random questions for exam
router.post('/exam/questions', async (req, res) => {
    try {
        const { subjects } = req.body;
        
        let allQuestions = [];
        
        for (const subject of subjects) {
            // Determine question count based on subject
            const limit = subject.name === 'Use of English' ? 60 : 40;
            
            // Get random questions from database
            const result = await db.query(
                `SELECT q.*, s.name as subject_name 
                 FROM questions q
                 JOIN subjects s ON s.id = q.subject_id
                 WHERE q.subject_id = $1
                 ORDER BY RANDOM()
                 LIMIT $2`,
                [subject.id, limit]
            );
            
            allQuestions = [...allQuestions, ...result.rows];
        }
        
        // Shuffle all questions
        allQuestions = shuffleArray(allQuestions);
        
        res.json(allQuestions);
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Save exam session
router.post('/exam/session', auth, async (req, res) => {
    try {
        const { examId, subjects, totalQuestions } = req.body;
        
        await db.query(
            `INSERT INTO exam_sessions (id, user_id, subjects_selected, total_questions, started_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [examId, req.user.id, subjects, totalQuestions]
        );
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error saving session:', error);
        res.status(500).json({ error: 'Failed to save session' });
    }
});

// Save answer
router.post('/exam/save-answer', auth, async (req, res) => {
    try {
        const { examId, questionId, selectedAnswer } = req.body;
        
        // Get question to check correctness
        const questionResult = await db.query(
            'SELECT correct_answer FROM questions WHERE id = $1',
            [questionId]
        );
        
        const isCorrect = questionResult.rows[0]?.correct_answer === selectedAnswer;
        
        await db.query(
            `INSERT INTO user_answers (session_id, question_id, selected_answer, is_correct, answered_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [examId, questionId, selectedAnswer, isCorrect]
        );
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error saving answer:', error);
        res.status(500).json({ error: 'Failed to save answer' });
    }
});

// Complete exam
router.post('/exam/complete', auth, async (req, res) => {
    try {
        const { examId, score, percentage } = req.body;
        
        await db.query(
            `UPDATE exam_sessions 
             SET completed_at = NOW(), score = $2, percentage = $3
             WHERE id = $1 AND user_id = $4`,
            [examId, score, percentage, req.user.id]
        );
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error completing exam:', error);
        res.status(500).json({ error: 'Failed to complete exam' });
    }
});

// Helper function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = router;