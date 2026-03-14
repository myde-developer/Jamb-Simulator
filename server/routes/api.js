// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get random questions for exam
router.post('/exam/questions', auth, async (req, res) => {
    try {
        const { subjects } = req.body;
        
        let allQuestions = [];
        
        for (const subject of subjects) {
            // Determine question count based on subject
            const limit = subject.name === 'Use of English' ? 60 : 40;
            
            // Get random questions from database
            const result = await db.query(
                `SELECT q.*, s.name as subject 
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

// Helper function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = router;