// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { allSubjects } = require('../data/all-subjects');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ========== POST /api/exam/questions – public ==========
router.post('/exam/questions', async (req, res) => {
    try {
        const { subjects } = req.body;
        let allQuestions = [];

        for (const subject of subjects) {
            let subjectQuestions = [];
            const targetCount = subject.name === 'Use of English' ? 60 : 40;

            if (subject.name === 'Use of English') {
                // English: static topic distribution from all-subjects.js
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
                    if (result.rows.length < t.count) {
                        const remaining = t.count - result.rows.length;
                        const additional = await db.query(
                            `SELECT q.*, s.name as subject_name 
                             FROM questions q
                             JOIN subjects s ON s.id = q.subject_id
                             WHERE q.subject_id = $1 AND q.topic ILIKE $2
                             AND q.id NOT IN (${result.rows.map(r => r.id).join(',') || 0})
                             ORDER BY RANDOM()
                             LIMIT $3`,
                            [subject.id, `%${t.topic}%`, remaining]
                        );
                        result.rows = [...result.rows, ...additional.rows];
                    }
                    if (result.rows.length < t.count) {
                        const remaining = t.count - result.rows.length;
                        const random = await db.query(
                            `SELECT q.*, s.name as subject_name 
                             FROM questions q
                             JOIN subjects s ON s.id = q.subject_id
                             WHERE q.subject_id = $1 
                             AND q.id NOT IN (${result.rows.map(r => r.id).join(',') || 0})
                             ORDER BY RANDOM()
                             LIMIT $2`,
                            [subject.id, remaining]
                        );
                        result.rows = [...result.rows, ...random.rows];
                    }
                    const formatted = result.rows.map(q => ({
                        id: q.id,
                        subject: q.subject_name,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer,
                        explanation: q.explanation || '',
                        topic: q.topic,
                        difficulty: q.difficulty
                    }));
                    subjectQuestions.push(...formatted);
                    console.log(`   ✅ ${t.topic}: loaded ${formatted.length} questions`);
                }
            } else {
                // Other subjects: dynamic topics from database
                const topicsResult = await db.query(
                    `SELECT DISTINCT topic FROM questions WHERE subject_id = $1 AND topic IS NOT NULL ORDER BY topic`,
                    [subject.id]
                );
                const topics = topicsResult.rows.map(row => row.topic);
                console.log(`📚 Subject ${subject.name} has ${topics.length} distinct topics`);

                const selectedIds = new Set();
                // First pass: take 2 from each topic
                for (const topic of topics) {
                    const result = await db.query(
                        `SELECT q.*, s.name as subject_name 
                         FROM questions q
                         JOIN subjects s ON s.id = q.subject_id
                         WHERE q.subject_id = $1 AND q.topic = $2
                         ORDER BY RANDOM()
                         LIMIT $3`,
                        [subject.id, topic, 2]
                    );
                    const formatted = result.rows.map(q => ({
                        id: q.id,
                        subject: q.subject_name,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer,
                        explanation: q.explanation || '',
                        topic: q.topic,
                        difficulty: q.difficulty
                    }));
                    subjectQuestions.push(...formatted);
                    formatted.forEach(q => selectedIds.add(q.id));
                    console.log(`   ✅ ${topic}: took ${formatted.length} questions (first pass)`);
                }

                // Second pass: add extra questions evenly (one at a time) until target reached
                let neededRemaining = targetCount - subjectQuestions.length;
                if (neededRemaining > 0 && topics.length > 0) {
                    console.log(`   Need ${neededRemaining} more questions, distributing evenly...`);
                    let topicIndex = 0;
                    while (neededRemaining > 0 && topicIndex < topics.length * 10) {
                        const topic = topics[topicIndex % topics.length];
                        const extraResult = await db.query(
                            `SELECT q.*, s.name as subject_name 
                             FROM questions q
                             JOIN subjects s ON s.id = q.subject_id
                             WHERE q.subject_id = $1 AND q.topic = $2
                             AND q.id NOT IN (${selectedIds.size ? Array.from(selectedIds).join(',') : '0'})
                             ORDER BY RANDOM()
                             LIMIT $3`,
                            [subject.id, topic, 1]
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
                                correct_answer: extraResult.rows[0].correct_answer,
                                explanation: extraResult.rows[0].explanation || '',
                                topic: extraResult.rows[0].topic,
                                difficulty: extraResult.rows[0].difficulty
                            };
                            subjectQuestions.push(extra);
                            selectedIds.add(extra.id);
                            neededRemaining--;
                            console.log(`      +1 extra from ${topic}`);
                        }
                        topicIndex++;
                        if (topicIndex > topics.length * 5 && neededRemaining > 0) {
                            console.warn(`   No more questions available for ${subject.name}, stopping.`);
                            break;
                        }
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

// ========== POST /api/exam/save – save exam results after user login ==========
router.post('/exam/save', auth, async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { examData } = req.body;
        const userId = req.user.id;

        // Generate a completely new unique exam ID (ignore frontend ID to avoid duplicates)
        const examId = `EXAM_${Date.now()}_${Math.random().toString(36).substr(2, 12)}_${userId}`;

        // Check if this session already exists (should not, but safety)
        const existing = await client.query(
            `SELECT id FROM exam_sessions WHERE id = $1 AND user_id = $2`,
            [examId, userId]
        );
        if (existing.rows.length > 0) {
            // Already saved (unlikely), just return success
            return res.json({ success: true, message: 'Exam already saved', sessionId: examId });
        }

        await client.query('BEGIN');

        const subjectsSelected = examData.subjects.map(s => s.id);
        const totalQuestions = Object.values(examData.subjectQuestions).reduce((sum, arr) => sum + arr.length, 0);

        await client.query(
            `INSERT INTO exam_sessions 
             (id, user_id, subjects_selected, started_at, completed_at, score, total_questions, percentage)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                examId,
                userId,
                subjectsSelected,
                examData.date,
                new Date().toISOString(),
                examData.scores.total,
                totalQuestions,
                examData.scores.percentage
            ]
        );

        // Insert each answer
        for (const [questionId, answer] of Object.entries(examData.answers)) {
            // Find correct answer from subjectQuestions
            let correctAnswer = null;
            for (const subject in examData.subjectQuestions) {
                const q = examData.subjectQuestions[subject].find(q => q.id == questionId);
                if (q) {
                    correctAnswer = q.correct_answer;
                    break;
                }
            }
            const isCorrect = (answer === correctAnswer);
            await client.query(
                `INSERT INTO user_answers 
                 (session_id, question_id, selected_answer, is_correct, answered_at)
                 VALUES ($1, $2, $3, $4, $5)`,
                [examId, questionId, answer, isCorrect, new Date().toISOString()]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, sessionId: examId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving exam:', error);
        res.status(500).json({ error: 'Failed to save exam results' });
    } finally {
        client.release();
    }
});

// ========== GET /api/user/exams – get current user's exam history (with subject names) ==========
router.get('/user/exams', auth, async (req, res) => {
    try {
        // First get the basic exam data
        const exams = await db.query(
            `SELECT id, started_at, completed_at, score, total_questions, percentage, subjects_selected
             FROM exam_sessions
             WHERE user_id = $1
             ORDER BY started_at DESC`,
            [req.user.id]
        );

        // For each exam, fetch subject names from the subjects table using the IDs in subjects_selected
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

module.exports = router;