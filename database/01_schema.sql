
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) CHECK (correct_answer IN ('A','B','C','D')),
    explanation TEXT,
    year VARCHAR(4),
    topic VARCHAR(100),
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam sessions table
CREATE TABLE exam_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subjects_selected INTEGER[] NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    total_questions INTEGER
);

-- User answers table
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer CHAR(1),
    is_correct BOOLEAN,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_exam_sessions_user ON exam_sessions(user_id);
CREATE INDEX idx_user_answers_session ON user_answers(session_id);

-- Insert subjects
INSERT INTO subjects (name, code) VALUES
('Use of English','ENG'),
('Mathematics','MTH'),
('Physics','PHY'),
('Chemistry','CHM'),
('Biology','BIO');

-- Verification function
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