// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createTables } = require('./config/database');  // ← This imports the function

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ADD THIS LINE - Initialize database when server starts
createTables().catch(console.error);

// IMPORTANT: Only serve static files in development
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '../client')));
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
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

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Frontend: ${process.env.NODE_ENV === 'production' ? 'Separate Static Site' : 'Served from /client'}`);
});