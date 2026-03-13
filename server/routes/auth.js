const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        
        // Check if user exists
        const existingUser = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Check if this is the first user (make them admin)
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const isFirstUser = parseInt(userCount.rows[0].count) === 0;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, is_admin) 
             VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, is_admin`,
            [email, hashedPassword, fullName, isFirstUser]
        );
        
        const user = result.rows[0];
        
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Registration successful',
            user,
            token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                is_admin: user.is_admin
            },
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Check if admin exists
router.get('/check-admin', async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) FROM users WHERE is_admin = true');
        const hasAdmin = parseInt(result.rows[0].count) > 0;
        res.json({ hasAdmin });
    } catch (error) {
        res.status(500).json({ error: 'Check failed' });
    }
});

// Create default admin (for first setup)
router.post('/create-default-admin', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        
        // Check if any admin exists
        const adminCheck = await db.query('SELECT COUNT(*) FROM users WHERE is_admin = true');
        if (parseInt(adminCheck.rows[0].count) > 0) {
            return res.status(400).json({ error: 'Admin already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create admin
        await db.query(
            `INSERT INTO users (email, password_hash, full_name, is_admin) 
             VALUES ($1, $2, $3, $4)`,
            [email, hashedPassword, fullName, true]
        );
        
        res.json({ message: 'Default admin created' });
        
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

module.exports = router;