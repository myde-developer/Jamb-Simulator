// server/config/database.js
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
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
        await client.query('BEGIN');
        
        // ============================================
        // CREATE TABLES
        // ============================================
        
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
        
        // ============================================
        // INSERT SUBJECTS
        // ============================================
        
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

     // ============================================
// INSERT QUESTIONS FROM JSON FILE
// ============================================

// ALWAYS clear existing questions first
console.log('🗑️ Clearing existing questions...');
await client.query(`DELETE FROM questions;`);
await client.query(`ALTER SEQUENCE questions_id_seq RESTART WITH 1;`);
console.log('✅ Cleared existing questions');

console.log('📝 Loading questions from JSON file...');

try {
    // Read questions from JSON file
    const questionsFilePath = path.join(__dirname, '../data/questions.json');
    const questionsData = await fs.readFile(questionsFilePath, 'utf8');
    const questions = JSON.parse(questionsData);
    
    console.log(`✅ Loaded ${questions.length} questions from JSON file`);
    
    // Insert questions in batches to avoid overwhelming the database
    const BATCH_SIZE = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const batch = questions.slice(i, i + BATCH_SIZE);
        
        // Build parameterized query for this batch
        const values = [];
        const placeholders = [];
        
        batch.forEach((q, index) => {
            const base = index * 10; // 10 fields per question
            placeholders.push(`($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}, $${base+9}, $${base+10})`);
            values.push(
                q.subject_id,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                q.explanation || null,
                q.topic || null,
                q.difficulty || 'medium'
            );
        });
        
        const query = `
            INSERT INTO questions 
            (subject_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty) 
            VALUES ${placeholders.join(', ')}
        `;
        
        await client.query(query, values);
        insertedCount += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(questions.length/BATCH_SIZE)} (${insertedCount}/${questions.length} questions)`);
    }
    
    console.log(`🎉 Successfully inserted ${insertedCount} questions!`);
    
} catch (error) {
    console.error('❌ Error loading questions from JSON file:', error.message);
    console.log('💡 Tip: Make sure the questions.json file exists in server/data/ directory');
    throw error;
}
        
        // ============================================
        // CREATE VERIFICATION FUNCTION
        // ============================================
        
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
        
        await client.query('COMMIT');
        
        console.log('🎉 Database setup complete!');
        console.log('📊 You can now use practice and exam modes!');
        
        // Display question counts by subject
        const counts = await client.query(`
            SELECT s.name, COUNT(q.id) as count 
            FROM subjects s 
            LEFT JOIN questions q ON s.id = q.subject_id 
            GROUP BY s.id, s.name 
            ORDER BY s.name
        `);
        
        console.log('\n📊 Question Summary:');
        counts.rows.forEach(row => {
            console.log(`   ${row.name}: ${row.count} questions`);
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database setup error:', error);
        throw error;
    } finally {
        client.release();
    }
}

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
    checkDatabase,
    query: (text, params) => pool.query(text, params)
};