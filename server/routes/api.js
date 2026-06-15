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

// ========== POST /api/exam/questions – public ==========
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
                    // 1. Exact match
                    let result = await db.query(
                        `SELECT q.*, s.name as subject_name 
                         FROM questions q
                         JOIN subjects s ON s.id = q.subject_id
                         WHERE q.subject_id = $1 AND q.topic = $2
                         ORDER BY RANDOM()
                         LIMIT $3`,
                        [subject.id, t.topic, t.count]
                    );
                    // 2. Case‑insensitive partial match
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
                    // 3. Any random question from subject
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
            } 
            // ---------- OTHER SUBJECTS: dynamic topics from database ----------
            else {
                // Get all distinct topics for this subject
                const topicsResult = await db.query(
                    `SELECT DISTINCT topic FROM questions WHERE subject_id = $1 AND topic IS NOT NULL ORDER BY topic`,
                    [subject.id]
                );
                const topics = topicsResult.rows.map(row => row.topic);
                console.log(`📚 Subject ${subject.name} has ${topics.length} distinct topics`);

                if (topics.length === 0) {
                    console.log(`⚠️ No topics found for ${subject.name}, skipping`);
                    continue;
                }

                // Determine how many to take from each topic (2 if possible, otherwise 1)
                let perTopic = 2;
                if (topics.length * 2 > targetCount) {
                    perTopic = 1;
                }
                console.log(`   Taking ${perTopic} question(s) from each topic`);

                const selectedIds = new Set();
                // First pass: take perTopic from each topic
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
                        correct_answer: q.correct_answer,
                        explanation: q.explanation || '',
                        topic: q.topic,
                        difficulty: q.difficulty
                    }));
                    subjectQuestions.push(...formatted);
                    formatted.forEach(q => selectedIds.add(q.id));
                }

                // Second pass: add extra questions evenly (round‑robin) until target reached
                let needed = targetCount - subjectQuestions.length;
                if (needed > 0 && topics.length > 0) {
                    console.log(`   Need ${needed} more questions, distributing evenly...`);
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
                            const q = extraResult.rows[0];
                            const extra = {
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
                            };
                            subjectQuestions.push(extra);
                            selectedIds.add(extra.id);
                            needed--;
                            console.log(`      +1 extra from ${topic}`);
                        }
                        idx++;
                        if (idx > topics.length * 5 && needed > 0) {
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

        // Safety check – should not exist
        const existing = await client.query(
            `SELECT id FROM exam_sessions WHERE id = $1 AND user_id = $2`,
            [examId, userId]
        );
        if (existing.rows.length > 0) {
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
        const exams = await db.query(
            `SELECT id, started_at, completed_at, score, total_questions, percentage, subjects_selected
             FROM exam_sessions
             WHERE user_id = $1
             ORDER BY started_at DESC`,
            [req.user.id]
        );

        // Build result with subject names
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

// GET /api/exam/:id – fetch a single exam by ID (for viewing past results)
router.get('/exam/:id', auth, async (req, res) => {
    try {
        const examId = req.params.id;
        const userId = req.user.id;

        // Verify exam belongs to this user
        const check = await db.query(
            `SELECT id FROM exam_sessions WHERE id = $1 AND user_id = $2`,
            [examId, userId]
        );
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Fetch exam with answers and subject names
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

        // Format the response to match what `results.js` expects
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