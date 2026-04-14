// server/routes/leaderboard.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// NO AUTHENTICATION NEEDED FOR VIEWING LEADERBOARD
// But we'll still verify token for user-specific data

// Helper to verify token (optional, for user-specific data)
const getUserIdFromToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return null;
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// Get global leaderboard - PUBLIC (no auth required)
router.get('/global', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.full_name,
                COALESCE(SUM(e.score), 0) as total_score,
                COUNT(e.id) as exams_taken
            FROM users u
            LEFT JOIN exam_sessions e ON u.id = e.user_id AND e.completed_at IS NOT NULL
            GROUP BY u.id, u.full_name
            HAVING COALESCE(SUM(e.score), 0) > 0
            ORDER BY total_score DESC
            LIMIT 100
        `);
        
        const leaderboard = result.rows.map((row, index) => ({
            rank: index + 1,
            user_id: row.id,
            name: row.full_name || 'Anonymous User',
            score: Math.round(row.total_score),
            exams_taken: parseInt(row.exams_taken),
            avatar: row.full_name ? row.full_name.charAt(0).toUpperCase() : 'U'
        }));
        
        res.json({ success: true, leaderboard });
        
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// Get weekly leaderboard - PUBLIC
router.get('/weekly', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.full_name,
                COALESCE(SUM(e.score), 0) as total_score,
                COUNT(e.id) as exams_taken
            FROM users u
            LEFT JOIN exam_sessions e ON u.id = e.user_id 
                AND e.completed_at IS NOT NULL
                AND e.completed_at > NOW() - INTERVAL '7 days'
            GROUP BY u.id, u.full_name
            HAVING COALESCE(SUM(e.score), 0) > 0
            ORDER BY total_score DESC
            LIMIT 100
        `);
        
        const leaderboard = result.rows.map((row, index) => ({
            rank: index + 1,
            user_id: row.id,
            name: row.full_name || 'Anonymous User',
            score: Math.round(row.total_score),
            exams_taken: parseInt(row.exams_taken),
            avatar: row.full_name ? row.full_name.charAt(0).toUpperCase() : 'U'
        }));
        
        res.json({ success: true, leaderboard });
        
    } catch (error) {
        console.error('Error fetching weekly leaderboard:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// Get monthly leaderboard - PUBLIC
router.get('/monthly', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.full_name,
                COALESCE(SUM(e.score), 0) as total_score,
                COUNT(e.id) as exams_taken
            FROM users u
            LEFT JOIN exam_sessions e ON u.id = e.user_id 
                AND e.completed_at IS NOT NULL
                AND e.completed_at > NOW() - INTERVAL '30 days'
            GROUP BY u.id, u.full_name
            HAVING COALESCE(SUM(e.score), 0) > 0
            ORDER BY total_score DESC
            LIMIT 100
        `);
        
        const leaderboard = result.rows.map((row, index) => ({
            rank: index + 1,
            user_id: row.id,
            name: row.full_name || 'Anonymous User',
            score: Math.round(row.total_score),
            exams_taken: parseInt(row.exams_taken),
            avatar: row.full_name ? row.full_name.charAt(0).toUpperCase() : 'U'
        }));
        
        res.json({ success: true, leaderboard });
        
    } catch (error) {
        console.error('Error fetching monthly leaderboard:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// Get streak leaderboard - PUBLIC
router.get('/streak', async (req, res) => {
    try {
        // For now, return based on exam count as streak
        const result = await pool.query(`
            SELECT 
                u.id,
                u.full_name,
                COUNT(e.id) as streak
            FROM users u
            LEFT JOIN exam_sessions e ON u.id = e.user_id AND e.completed_at IS NOT NULL
            GROUP BY u.id, u.full_name
            HAVING COUNT(e.id) > 0
            ORDER BY streak DESC
            LIMIT 100
        `);
        
        const leaderboard = result.rows.map((row, index) => ({
            rank: index + 1,
            user_id: row.id,
            name: row.full_name || 'Anonymous User',
            streak: parseInt(row.streak),
            avatar: row.full_name ? row.full_name.charAt(0).toUpperCase() : 'U'
        }));
        
        res.json({ success: true, leaderboard });
        
    } catch (error) {
        console.error('Error fetching streak leaderboard:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// Get current user's rank - Requires auth (optional)
router.get('/my-rank', async (req, res) => {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
        return res.json({ success: true, rank: null, score: 0 });
    }
    
    try {
        const result = await pool.query(`
            WITH ranked_users AS (
                SELECT 
                    u.id,
                    COALESCE(SUM(e.score), 0) as total_score,
                    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(e.score), 0) DESC) as rank
                FROM users u
                LEFT JOIN exam_sessions e ON u.id = e.user_id AND e.completed_at IS NOT NULL
                GROUP BY u.id
            )
            SELECT * FROM ranked_users WHERE id = $1
        `, [userId]);
        
        if (result.rows.length > 0) {
            res.json({ 
                success: true, 
                rank: result.rows[0].rank,
                score: Math.round(result.rows[0].total_score)
            });
        } else {
            res.json({ success: true, rank: null, score: 0 });
        }
        
    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.json({ success: true, rank: null, score: 0 });
    }
});

module.exports = router;