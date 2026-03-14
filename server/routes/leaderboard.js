// server/routes/leaderboard.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get global leaderboard
router.get('/global', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                u.id,
                u.full_name as name,
                COUNT(DISTINCT es.id) as exams_taken,
                COALESCE(ROUND(AVG(es.score)::numeric, 2), 0) as avg_score,
                COALESCE(MAX(es.score), 0) as best_score,
                COUNT(DISTINCT ua.id) as total_questions,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_answers,
                COUNT(DISTINCT CASE WHEN DATE(es.completed_at) = CURRENT_DATE THEN es.id END) as today_exams,
                (
                    SELECT COUNT(DISTINCT DATE(completed_at))
                    FROM exam_sessions 
                    WHERE user_id = u.id AND completed_at IS NOT NULL
                ) as study_days,
                (
                    SELECT COUNT(*)
                    FROM user_answers ua2
                    JOIN exam_sessions es2 ON es2.id = ua2.session_id
                    WHERE es2.user_id = u.id AND ua2.is_correct = true
                ) as total_correct
            FROM users u
            LEFT JOIN exam_sessions es ON es.user_id = u.id AND es.completed_at IS NOT NULL
            LEFT JOIN user_answers ua ON ua.session_id = es.id
            GROUP BY u.id, u.full_name
            HAVING COUNT(DISTINCT es.id) > 0
            ORDER BY avg_score DESC, total_correct DESC
            LIMIT 100
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get weekly leaderboard
router.get('/weekly', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                u.id,
                u.full_name as name,
                COUNT(DISTINCT es.id) as exams_taken,
                COALESCE(ROUND(AVG(es.score)::numeric, 2), 0) as avg_score,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as weekly_correct,
                COUNT(ua.id) as weekly_questions
            FROM users u
            LEFT JOIN exam_sessions es ON es.user_id = u.id 
                AND es.completed_at IS NOT NULL
                AND es.completed_at >= NOW() - INTERVAL '7 days'
            LEFT JOIN user_answers ua ON ua.session_id = es.id
            GROUP BY u.id, u.full_name
            HAVING COUNT(DISTINCT es.id) > 0
            ORDER BY weekly_correct DESC, avg_score DESC
            LIMIT 100
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching weekly leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
    }
});

// Get monthly leaderboard
router.get('/monthly', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                u.id,
                u.full_name as name,
                COUNT(DISTINCT es.id) as exams_taken,
                COALESCE(ROUND(AVG(es.score)::numeric, 2), 0) as avg_score,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as monthly_correct,
                COUNT(ua.id) as monthly_questions
            FROM users u
            LEFT JOIN exam_sessions es ON es.user_id = u.id 
                AND es.completed_at IS NOT NULL
                AND EXTRACT(MONTH FROM es.completed_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM es.completed_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            LEFT JOIN user_answers ua ON ua.session_id = es.id
            GROUP BY u.id, u.full_name
            HAVING COUNT(DISTINCT es.id) > 0
            ORDER BY monthly_correct DESC, avg_score DESC
            LIMIT 100
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching monthly leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch monthly leaderboard' });
    }
});

// Get streak leaderboard
router.get('/streak', auth, async (req, res) => {
    try {
        const result = await db.query(`
            WITH daily_activity AS (
                SELECT 
                    user_id,
                    DATE(completed_at) as study_date
                FROM exam_sessions
                WHERE completed_at IS NOT NULL
                GROUP BY user_id, DATE(completed_at)
            ),
            streaks AS (
                SELECT 
                    user_id,
                    study_date,
                    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY study_date) as rn
                FROM daily_activity
            ),
            streak_groups AS (
                SELECT 
                    user_id,
                    study_date,
                    study_date - (rn || ' days')::INTERVAL as group_date
                FROM streaks
            )
            SELECT 
                u.id,
                u.full_name as name,
                COUNT(*) as current_streak,
                MAX(sg.study_date) as last_study
            FROM streak_groups sg
            JOIN users u ON u.id = sg.user_id
            GROUP BY u.id, u.full_name, sg.group_date
            HAVING MAX(sg.study_date) = CURRENT_DATE
            ORDER BY current_streak DESC
            LIMIT 100
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching streak leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch streak leaderboard' });
    }
});

// Get user's rank
router.get('/rank/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const rankResult = await db.query(`
            WITH rankings AS (
                SELECT 
                    u.id,
                    u.full_name,
                    COALESCE(ROUND(AVG(es.score)::numeric, 2), 0) as avg_score,
                    ROW_NUMBER() OVER (ORDER BY AVG(es.score) DESC) as rank
                FROM users u
                LEFT JOIN exam_sessions es ON es.user_id = u.id AND es.completed_at IS NOT NULL
                GROUP BY u.id, u.full_name
                HAVING COUNT(es.id) > 0
            )
            SELECT rank, avg_score
            FROM rankings
            WHERE id = $1
        `, [userId]);
        
        if (rankResult.rows.length === 0) {
            return res.json({ rank: 'N/A', message: 'No exams taken yet' });
        }
        
        res.json(rankResult.rows[0]);
        
    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({ error: 'Failed to fetch rank' });
    }
});

module.exports = router;