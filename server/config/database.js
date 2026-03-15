// server/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Fix SSL configuration for Render
const databaseUrl = process.env.DATABASE_URL;

// Add the recommended SSL parameters
const connectionString = databaseUrl.includes('?') 
    ? databaseUrl + '&uselibpqcompat=true' 
    : databaseUrl + '?uselibpqcompat=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false,  // Still needed for self-signed certs
        mode: 'require'              // Explicitly set SSL mode
    }
});

async function createTables() {
    const client = await pool.connect();
    
    try {
        console.log('📦 Setting up database tables...');
        console.log('🔌 Connected to database with SSL');
        
        await client.query('BEGIN');
        
        // Create subjects table
        await client.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(10) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ subjects table ready');
        
        // Create questions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
                explanation TEXT,
                year VARCHAR(4),
                topic VARCHAR(100),
                difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ questions table ready');
        
        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ users table ready');
        
        // Create exam sessions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS exam_sessions (
                id VARCHAR(50) PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                subjects_selected INTEGER[] NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                score DECIMAL(5,2),
                percentage DECIMAL(5,2),
                total_questions INTEGER
            );
        `);
        console.log('✅ exam_sessions table ready');
        
        // Create user answers table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_answers (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(50) REFERENCES exam_sessions(id) ON DELETE CASCADE,
                question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
                selected_answer CHAR(1),
                is_correct BOOLEAN,
                answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ user_answers table ready');
        
        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON exam_sessions(user_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_user_answers_session ON user_answers(session_id);`);
        console.log('✅ indexes created');
        
        // Insert subjects if they don't exist
        const subjectCheck = await client.query(`SELECT COUNT(*) FROM subjects`);
        if (parseInt(subjectCheck.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO subjects (name, code) VALUES
                ('Use of English', 'ENG'),
                ('Mathematics', 'MTH'),
                ('Physics', 'PHY'),
                ('Chemistry', 'CHM'),
                ('Biology', 'BIO');
            `);
            console.log('✅ 5 subjects inserted');
        }
        
        await client.query('COMMIT');
        console.log('🎉 Database setup complete!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database setup error:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    createTables,
    query: (text, params) => pool.query(text, params)
};