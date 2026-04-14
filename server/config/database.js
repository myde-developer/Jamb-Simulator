// server/config/database.js
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Fix SSL configuration for Render
const databaseUrl = process.env.DATABASE_URL;

const connectionString = databaseUrl.includes('?') 
    ? databaseUrl + '&uselibpqcompat=true' 
    : databaseUrl + '?uselibpqcompat=true';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
        mode: 'require'
    }
});

// ========================
// CHECK DATABASE
// ========================
async function checkDatabase() {
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return false;
    }
}

// ========================
// MAIN SETUP FUNCTION
// ========================
async function createTables() {
    const client = await pool.connect();
    
    try {
        console.log('📦 Setting up database tables...');
        await client.query('BEGIN');

        // ========================
        // TABLES
        // ========================
        await client.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(10) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer VARCHAR(1) CHECK (correct_answer IN ('A','B','C','D')),
                explanation TEXT,
                topic VARCHAR(100),
                difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

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

        console.log('✅ Tables ready');

        // ========================
        // INDEXES
        // ========================
        await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);`);

        console.log('✅ Indexes ready');

        // ========================
        // INSERT SUBJECTS
        // ========================
        await client.query(`
            INSERT INTO subjects (id, name, code) VALUES
            (1, 'Use of English', 'ENG'),
            (2, 'Mathematics', 'MTH'),
            (3, 'Physics', 'PHY'),
            (4, 'Chemistry', 'CHM'),
            (5, 'Biology', 'BIO'),
            (6, 'Agricultural Science', 'AGR'),
            (7, 'Computer Studies', 'CSC'),
            (8, 'Literature in English', 'LIT'),
            (9, 'Government', 'GOV'),
            (10, 'History', 'HIS'),
            (11, 'Christian Religious Studies', 'CRS'),
            (12, 'Islamic Studies', 'IRS'),
            (13, 'French', 'FRE'),
            (14, 'Yoruba', 'YRB'),
            (15, 'Igbo', 'IGB'),
            (16, 'Hausa', 'HAU'),
            (17, 'Music', 'MUS'),
            (18, 'Fine Arts', 'ART'),
            (19, 'Economics', 'ECO'),
            (20, 'Commerce', 'COM'),
            (21, 'Principles of Accounts', 'ACC'),
            (22, 'Geography', 'GEO')
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('✅ Subjects ensured');

        // ========================
        // CLEAR QUESTIONS
        // ========================
        await client.query(`DELETE FROM questions;`);
        await client.query(`ALTER SEQUENCE questions_id_seq RESTART WITH 1;`);
        console.log('✅ Questions cleared');

        // ========================
        // LOAD QUESTIONS
        // ========================
        console.log('📝 Loading questions...');

        const questionsFilePath = path.join(__dirname, '../data/questions.json');
        const questionsData = await fs.readFile(questionsFilePath, 'utf8');
        const questions = JSON.parse(questionsData);

        console.log(`✅ Loaded ${questions.length} questions`);

        const BATCH_SIZE = 100;
        let inserted = 0;

        for (let i = 0; i < questions.length; i += BATCH_SIZE) {
            const batch = questions.slice(i, i + BATCH_SIZE);

            const values = [];
            const placeholders = [];

            batch.forEach((q, index) => {
                const base = index * 10;

                placeholders.push(`($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10})`);

                // ✅ FIXED ANSWER SANITIZATION
                let answer = (q.correct_answer || '').trim().toUpperCase();

                if (answer.length > 1) {
                    const match = answer.match(/[ABCD]$/);
                    answer = match ? match[0] : '';
                }

                if (!['A','B','C','D'].includes(answer)) {
                    console.warn(`❌ Invalid answer: ${q.correct_answer}`);
                    answer = 'A';
                }

                values.push(
                    q.subject_id,
                    q.question_text,
                    q.option_a,
                    q.option_b,
                    q.option_c,
                    q.option_d,
                    answer, // ✅ FIX APPLIED HERE
                    q.explanation || null,
                    q.topic || null,
                    q.difficulty || 'medium'
                );
            });

            const query = `
                INSERT INTO questions 
                (subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty)
                VALUES ${placeholders.join(',')}
            `;

            await client.query(query, values);
            inserted += batch.length;

            console.log(`✅ Batch ${Math.floor(i/BATCH_SIZE)+1} inserted (${inserted}/${questions.length})`);
        }

        console.log(`🎉 Inserted ${inserted} questions`);

        await client.query('COMMIT');

        console.log('🎉 Database setup complete!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database error:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    createTables,
    checkDatabase,
    query: (text, params) => pool.query(text, params)
};