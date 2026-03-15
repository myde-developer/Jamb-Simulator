// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Same SSL fix for db.js
const databaseUrl = process.env.DATABASE_URL;
const connectionString = databaseUrl.includes('?') 
    ? databaseUrl + '&uselibpqcompat=true' 
    : databaseUrl + '?uselibpqcompat=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false,
        mode: 'require'
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};