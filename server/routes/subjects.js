// server/routes/subjects.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Get all subjects
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, description, category, icon 
             FROM subjects 
             ORDER BY 
               CASE category 
                 WHEN 'compulsory' THEN 1
                 WHEN 'science' THEN 2
                 WHEN 'commercial' THEN 3
                 WHEN 'arts' THEN 4
                 ELSE 5
               END,
               name`
        );
        
        res.json({ subjects: result.rows });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Get subject by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid subject ID' });
        }
        
        const result = await pool.query(
            `SELECT id, name, description, category, icon 
             FROM subjects 
             WHERE id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        res.json({ subject: result.rows[0] });
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: 'Failed to fetch subject' });
    }
});

// Get subjects by category
router.get('/category/:category', authenticateToken, async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['compulsory', 'science', 'arts', 'commercial'];
        
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }
        
        const result = await pool.query(
            `SELECT id, name, description, category, icon 
             FROM subjects 
             WHERE category = $1
             ORDER BY name`,
            [category]
        );
        
        res.json({ subjects: result.rows });
    } catch (error) {
        console.error('Error fetching subjects by category:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

module.exports = router;