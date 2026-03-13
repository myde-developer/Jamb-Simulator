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

// IMPORTANT: Only serve static files in development
// In production, frontend comes from separate Static Site
if (process.env.NODE_ENV !== 'production') {
    // Only serve frontend locally for development
    app.use(express.static(path.join(__dirname, '../client')));
    
    // Serve index.html for root route in development
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });
}

// API Routes - THESE ALWAYS WORK
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint - WHAT YOUR BACKEND SHOULD SHOW
app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        // In production, return JSON to confirm backend is running
        res.json({
            status: 'success',
            message: 'JAMB Simulator API is running',
            endpoints: {
                auth: '/api/auth',
                exam: '/api/exam/questions',
                progress: '/api/progress',
                admin: '/api/admin'
            },
            documentation: 'Frontend is available at https://jamb-simulator-frontend.onrender.com'
        });
    }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${process.env.NODE_ENV === 'production' ? 'Separate Static Site' : 'Served from /client'}`);
});