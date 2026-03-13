// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database setup
const { createTables, checkDatabase } = require('./config/database');
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../')));

// Database setup - runs when server starts
async function initializeDatabase() {
    try {
        // Check if database is connected
        const isConnected = await checkDatabase();
        if (!isConnected) {
            console.error('❌ Cannot connect to database');
            process.exit(1);
        }
        
        // Create all tables automatically
        await createTables();
        
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
}

// Initialize database before starting server
initializeDatabase();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 JAMB Simulator running on port ${PORT}`);
    console.log(`📚 Database: ${process.env.NODE_ENV === 'production' ? 'Render PostgreSQL' : 'Local'}`);
    console.log(`📝 Add questions via admin panel at /admin.html`);
});