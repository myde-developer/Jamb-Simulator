// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { allSubjects } = require('../data/all-subjects'); // only used for English

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ========== POST /api/exam/questions – public, no correct answers ==========
router.post('/exam/questions', async (req, res) => {
    try {
        const { subjects } = req.body;
        let allQuestions = [];

        for (const subject of subjects) {
            const targetCount = subject.name === 'Use of English' ? 60 : 40;
            let subjectQuestions = [];

            // ---------- ENGLISH: use static distribution from all-subjects.js ----------
            if (subject.name === 'Use of English') {
                const subjectData = allSubjects[subject.id];
                if (!subjectData || !subjectData.topicDistribution) {
                    console.log(`⚠️ No topic distribution for ${subject.name}, skipping`);
                    continue;
                }
                const topicDistribution = Object.entries(subjectData.topicDistribution)
                    .map(([topic, count]) => ({ topic, count }));

                console.log(`📚 Fetching English questions by static topics...`);
                for (const t of topicDistribution) {
                    let result = await db.query(
                        `SELECT q.*, s.name as subject_name 
                         FROM questions q
                         JOIN subjects s ON s.id = q.subject_id
                         WHERE q.subject_id = $1 AND q.topic = $2
                         ORDER BY RANDOM()
                         LIMIT $3`,
                        [subject.id, t.topic, t.count]
                    );
                    // Fallback logic (same as before) omitted for brevity – keep your existing fallback logic
                    // ...
                    const formatted = result.rows.map(q => ({
                        id: q.id,
                        subject: q.subject_name,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        topic: q.topic,
                        difficulty: q.difficulty
                        // correct_answer and explanation REMOVED
                    }));
                    subjectQuestions.push(...formatted);
                }
            } 
            // ---------- OTHER SUBJECTS: dynamic topics from database ----------
            else {
                const topicsResult = await db.query(
                    `SELECT DISTINCT topic FROM questions WHERE subject_id = $1 AND topic IS NOT NULL ORDER BY topic`,
                    [subject.id]
                );
                const topics = topicsResult.rows.map(row => row.topic);
                if (topics.length === 0) {
                    console.log(`⚠️ No topics found for ${subject.name}, skipping`);
                    continue;
                }

                let perTopic = (topics.length * 2 > targetCount) ? 1 : 2;
                console.log(`   Taking ${perTopic} question(s) from each topic`);

                const selectedIds = new Set();
                for (const topic of topics) {
                    const result = await db.query(
                        `SELECT q.*, s.name as subject_name 
                         FROM questions q
                         JOIN subjects s ON s.id = q.subject_id
                         WHERE q.subject_id = $1 AND q.topic = $2
                         ORDER BY RANDOM()
                         LIMIT $3`,
                        [subject.id, topic, perTopic]
                    );
                    const formatted = result.rows.map(q => ({
                        id: q.id,
                        subject: q.subject_name,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        topic: q.topic,
                        difficulty: q.difficulty
                    }));
                    subjectQuestions.push(...formatted);
                    formatted.forEach(q => selectedIds.add(q.id));
                }

                // Add extra questions evenly if needed
                let needed = targetCount - subjectQuestions.length;
                if (needed > 0 && topics.length > 0) {
                    let idx = 0;
                    while (needed > 0 && idx < topics.length * 10) {
                        const topic = topics[idx % topics.length];
                        const extraResult = await db.query(
                            `SELECT q.*, s.name as subject_name 
                             FROM questions q
                             JOIN subjects s ON s.id = q.subject_id
                             WHERE q.subject_id = $1 AND q.topic = $2
                             AND q.id NOT IN (${selectedIds.size ? Array.from(selectedIds).join(',') : '0'})
                             ORDER BY RANDOM()
                             LIMIT 1`,
                            [subject.id, topic]
                        );
                        if (extraResult.rows.length > 0) {
                            const extra = {
                                id: extraResult.rows[0].id,
                                subject: extraResult.rows[0].subject_name,
                                question_text: extraResult.rows[0].question_text,
                                option_a: extraResult.rows[0].option_a,
                                option_b: extraResult.rows[0].option_b,
                                option_c: extraResult.rows[0].option_c,
                                option_d: extraResult.rows[0].option_d,
                                topic: extraResult.rows[0].topic,
                                difficulty: extraResult.rows[0].difficulty
                            };
                            subjectQuestions.push(extra);
                            selectedIds.add(extra.id);
                            needed--;
                        }
                        idx++;
                    }
                }
                if (subjectQuestions.length < targetCount) {
                    console.warn(`⚠️ Only ${subjectQuestions.length} questions available for ${subject.name} (expected ${targetCount})`);
                }
            }
            allQuestions.push(...subjectQuestions);
        }

        allQuestions = shuffleArray(allQuestions);
        console.log(`✅ Total questions loaded for exam: ${allQuestions.length}`);
        res.json(allQuestions);
    } catch (error) {
        console.error('❌ Error fetching exam questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// ========== POST /api/exam/save – grade exam on server ==========
router.post('/exam/save', auth, async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { examData } = req.body;
        const userId = req.user.id;

        // Generate unique exam ID
        const examId = `EXAM_${Date.now()}_${Math.random().toString(36).substr(2, 12)}_${userId}`;

        await client.query('BEGIN');

        // Insert exam session (subjects_selected, dates, etc.)
        const subjectsSelected = examData.subjects.map(s => s.id);
        const totalQuestions = examData.answers ? Object.keys(examData.answers).length : 0;
        await client.query(
            `INSERT INTO exam_sessions 
             (id, user_id, subjects_selected, started_at, completed_at, total_questions)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [examId, userId, subjectsSelected, examData.date, new Date().toISOString(), totalQuestions]
        );

        // Prepare to compute score
        let totalScore = 0;
        const englishTotal = examData.subjectQuestions ? examData.subjectQuestions['Use of English']?.length || 0 : 0;
        let englishCorrect = 0;
        let otherCorrect = 0;

        // For each answer, fetch correct answer from database and compute is_correct
        for (const [questionId, selectedAnswer] of Object.entries(examData.answers)) {
            const questionRes = await client.query(
                `SELECT correct_answer FROM questions WHERE id = $1`,
                [questionId]
            );
            if (questionRes.rows.length === 0) continue;
            const correctAnswer = questionRes.rows[0].correct_answer;
            const isCorrect = (selectedAnswer === correctAnswer);
            if (isCorrect) {
                // Determine if it's English or other subject
                const subjectRes = await client.query(
                    `SELECT s.name FROM questions q JOIN subjects s ON q.subject_id = s.id WHERE q.id = $1`,
                    [questionId]
                );
                const subjectName = subjectRes.rows[0]?.name;
                if (subjectName === 'Use of English') englishCorrect++;
                else otherCorrect++;
            }
            await client.query(
                `INSERT INTO user_answers 
                 (session_id, question_id, selected_answer, is_correct, answered_at)
                 VALUES ($1, $2, $3, $4, $5)`,
                [examId, questionId, selectedAnswer, isCorrect, new Date().toISOString()]
            );
        }

        // Calculate JAMB score
        const englishScore = englishCorrect * 1.67;
        const otherScore = otherCorrect * 2.5;
        totalScore = englishScore + otherScore;
        const percentage = (totalScore / 400) * 100;

        // Update exam session with computed score
        await client.query(
            `UPDATE exam_sessions SET score = $1, percentage = $2 WHERE id = $3`,
            [totalScore, percentage, examId]
        );

        await client.query('COMMIT');
        res.json({ success: true, sessionId: examId, totalScore, percentage });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving exam:', error);
        res.status(500).json({ error: 'Failed to save exam results' });
    } finally {
        client.release();
    }
});

// ========== GET /api/user/exams – user exam history (unchanged) ==========
router.get('/user/exams', auth, async (req, res) => {
    try {
        const exams = await db.query(
            `SELECT id, started_at, completed_at, score, total_questions, percentage, subjects_selected
             FROM exam_sessions
             WHERE user_id = $1
             ORDER BY started_at DESC`,
            [req.user.id]
        );
        const results = [];
        for (const exam of exams.rows) {
            let subjectNames = [];
            if (exam.subjects_selected && exam.subjects_selected.length) {
                const subjectRes = await db.query(
                    `SELECT name FROM subjects WHERE id = ANY($1::int[]) ORDER BY id`,
                    [exam.subjects_selected]
                );
                subjectNames = subjectRes.rows.map(row => row.name);
            }
            results.push({
                id: exam.id,
                started_at: exam.started_at,
                completed_at: exam.completed_at,
                score: exam.score,
                total_questions: exam.total_questions,
                percentage: exam.percentage,
                subject_names: subjectNames
            });
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching user exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// ========== GET /api/exam/:id – fetch a single exam with answers ==========
router.get('/exam/:id', auth, async (req, res) => {
    try {
        const examId = req.params.id;
        const userId = req.user.id;
        const check = await db.query(
            `SELECT id FROM exam_sessions WHERE id = $1 AND user_id = $2`,
            [examId, userId]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        const result = await db.query(
            `SELECT es.*, 
                    (SELECT array_agg(s.name) FROM subjects s WHERE s.id = ANY(es.subjects_selected)) as subject_names,
                    json_agg(json_build_object(
                        'question_id', q.id,
                        'question_text', q.question_text,
                        'option_a', q.option_a,
                        'option_b', q.option_b,
                        'option_c', q.option_c,
                        'option_d', q.option_d,
                        'user_answer', ua.selected_answer,
                        'correct_answer', q.correct_answer,
                        'is_correct', ua.is_correct,
                        'explanation', q.explanation,
                        'subject', s.name
                    ) ORDER BY q.id) as answers
             FROM exam_sessions es
             LEFT JOIN user_answers ua ON ua.session_id = es.id
             LEFT JOIN questions q ON q.id = ua.question_id
             LEFT JOIN subjects s ON s.id = q.subject_id
             WHERE es.id = $1
             GROUP BY es.id`,
            [examId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exam data not found' });
        }
        const exam = result.rows[0];
        const responseData = {
            id: exam.id,
            date: exam.completed_at || exam.started_at,
            score: exam.score,
            total_questions: exam.total_questions,
            percentage: exam.percentage,
            subjects: exam.subject_names || [],
            answers: exam.answers || []
        };
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ error: 'Failed to fetch exam details' });
    }
});

module.exports = router;