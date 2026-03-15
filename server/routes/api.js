// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Test route for this router
router.get('/test', (req, res) => {
    res.json({ message: 'API router is working' });
});

// Get random questions for exam
router.post('/exam/questions', auth, async (req, res) => {
    try {
        const { subjects } = req.body;
        
        if (!subjects || !Array.isArray(subjects)) {
            return res.status(400).json({ error: 'Invalid subjects data' });
        }
        
        let allQuestions = [];
        
        for (const subject of subjects) {
            const limit = subject.name === 'Use of English' ? 60 : 40;
            
            const result = await db.query(
                `SELECT q.*, s.name as subject 
                 FROM questions q
                 JOIN subjects s ON s.id = q.subject_id
                 WHERE q.subject_id = $1
                 ORDER BY RANDOM()
                 LIMIT $2`,
                [subject.id, limit]
            );
            
            if (result.rows.length === 0) {
                console.log(`No questions found for subject ID: ${subject.id}`);
            }
            
            allQuestions = [...allQuestions, ...result.rows];
        }
        
        if (allQuestions.length === 0) {
            return res.status(404).json({ error: 'No questions found in database' });
        }
        
        allQuestions = shuffleArray(allQuestions);
        res.json(allQuestions);
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions: ' + error.message });
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