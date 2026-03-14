
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
        
        // Create user - include is_admin field
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, is_admin) 
             VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, is_admin`,
            [email, hashedPassword, fullName, isFirstUser]
        );
        
        const user = result.rows[0];
        
        // Generate token - include is_admin in token payload
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                is_admin: user.is_admin  // ← CRITICAL: Include is_admin in token
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // ✅ Send complete user object with is_admin to frontend
        res.json({
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                is_admin: user.is_admin  // ← MUST be here!
            },
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
        
        // Generate token - include is_admin in token payload
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                is_admin: user.is_admin  // ← CRITICAL: Include is_admin in token
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // ✅ Send complete user object with is_admin to frontend
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                is_admin: user.is_admin  // ← MUST be here!
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
        console.error('Check admin error:', error);
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
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, is_admin) 
             VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, is_admin`,
            [email, hashedPassword, fullName, true]
        );
        
        const user = result.rows[0];
        
        res.json({ 
            message: 'Default admin created',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                is_admin: user.is_admin
            }
        });
        
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// ✅ NEW: Verify token route (optional but useful)
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await db.query(
            'SELECT id, email, full_name, is_admin FROM users WHERE id = $1',
            [decoded.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user: result.rows[0] });
        
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;