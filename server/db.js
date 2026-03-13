// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.NODE_ENV === 'production') {
    // Production: Render database
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    // Development: Local database
    pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'jamb_simulator_2026',
        password: process.env.DB_PASSWORD || 'yourpassword',
        port: process.env.DB_PORT || 5432,
    });
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};