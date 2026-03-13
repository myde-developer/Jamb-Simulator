// server/config/database.js
// This file runs automatically when your app starts
// It creates all tables if they don't exist

const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false
});

// Function to create all tables
async function createTables() {
    const client = await pool.connect();
    
    try {
        console.log('📦 Setting up database tables...');
        
        // Begin transaction
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
        
        // Create indexes for performance
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
        } else {
            console.log('✅ subjects already exist');
        }
        
        // Create verification function
        await client.query(`
            CREATE OR REPLACE FUNCTION get_question_counts() 
            RETURNS TABLE(subject_name VARCHAR, total_questions BIGINT) AS $func$
            BEGIN
                RETURN QUERY
                SELECT s.name, COUNT(q.id)
                FROM subjects s
                LEFT JOIN questions q ON s.id = q.subject_id
                GROUP BY s.id, s.name
                ORDER BY s.name;
            END;
            $func$ LANGUAGE plpgsql;
        `);
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('🎉 Database setup complete!');
        console.log('📊 You can now add questions via admin panel');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database setup error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Function to check if database is ready
async function checkDatabase() {
    try {
        const result = await pool.query('SELECT 1');
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    pool,
    createTables,
    checkDatabase
};