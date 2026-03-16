// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createTables, checkDatabase } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend is working!',
        time: new Date().toISOString()
    });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes - with error handling for missing routes
const setupRoutes = () => {
    try {
        app.use('/api/auth', require('./routes/auth'));
        console.log('✅ Auth routes loaded');
    } catch (error) {
        console.warn('⚠️ Auth routes not found:', error.message);
    }
    
    try {
        app.use('/api', require('./routes/api'));
        console.log('✅ API routes loaded');
    } catch (error) {
        console.warn('⚠️ API routes not found:', error.message);
    }
    
    try {
        app.use('/api/practice', require('./routes/practice'));
        console.log('✅ Practice routes loaded');
    } catch (error) {
        console.warn('⚠️ Practice routes not found:', error.message);
    }
    
    try {
        app.use('/api/leaderboard', require('./routes/leaderboard'));
        console.log('✅ Leaderboard routes loaded');
    } catch (error) {
        console.warn('⚠️ Leaderboard routes not found:', error.message);
    }
    
    try {
        app.use('/api/progress', require('./routes/progress'));
        console.log('✅ Progress routes loaded');
    } catch (error) {
        console.warn('⚠️ Progress routes not found:', error.message);
    }
    
    try {
        app.use('/api/admin', require('./routes/admin'));
        console.log('✅ Admin routes loaded');
    } catch (error) {
        console.warn('⚠️ Admin routes not found:', error.message);
    }
};

const PORT = process.env.PORT || 5000;

// Initialize database and then start server
async function startServer() {
    try {
        console.log('🚀 Starting JAMB Simulator API...');
        console.log(`📝 Node version: ${process.version}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        
        // Check database connection
        console.log('🔌 Checking database connection...');
        const isConnected = await checkDatabase();
        if (!isConnected) {
            console.error('❌ Database connection failed');
            console.log('💡 Make sure DATABASE_URL environment variable is set');
            process.exit(1);
        }
        console.log('✅ Database connected successfully');
        
        // Create tables and insert questions
        console.log('🗄️ Setting up database tables...');
        await createTables();
        console.log('✅ Database setup complete');
        
        // Setup routes
        console.log('🛣️ Setting up routes...');
        setupRoutes();
        
        // Start server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🌍 Health check: http://localhost:${PORT}/health`);
            console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    process.exit(1);
});

startServer();