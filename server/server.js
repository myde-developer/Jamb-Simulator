// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createTables } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.get('/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend is working!',
        time: new Date().toISOString()
    });
});

// Initialize database
createTables().catch(console.error);

// API Routes - MAKE SURE THESE ALL EXIST
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));           // Contains exam/questions
app.use('/api/practice', require('./routes/practice'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});