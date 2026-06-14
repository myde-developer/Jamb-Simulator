// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { allSubjects } = require('../data/all-subjects'); // ✅ load static topics

router.post('/exam/questions', async (req, res) => {
    try {
        const { subjects } = req.body;
        let allQuestions = [];

        for (const subject of subjects) {
            let topicDistribution = [];
            let subjectQuestions = [];

            // ✅ Get topic distribution from all-subjects.js
            const subjectData = allSubjects[subject.id];
            if (!subjectData || !subjectData.topicDistribution) {
                console.log(`⚠️ No topic distribution found for ${subject.name}, skipping...`);
                continue;
            }

            // Convert object to array of {topic, count}
            topicDistribution = Object.entries(subjectData.topicDistribution).map(([topic, count]) => ({ topic, count }));

            console.log(`📚 Fetching ${subject.name} questions by topic...`);
            const totalNeeded = topicDistribution.reduce((sum, t) => sum + t.count, 0);
            console.log(`   Total questions needed: ${totalNeeded}`);

            // Fetch questions for each topic with flexible matching
            for (const t of topicDistribution) {
                // First try exact match
                let result = await db.query(
                    `SELECT q.*, s.name as subject_name 
                     FROM questions q
                     JOIN subjects s ON s.id = q.subject_id
                     WHERE q.subject_id = $1 AND q.topic = $2
                     ORDER BY RANDOM()
                     LIMIT $3`,
                    [subject.id, t.topic, t.count]
                );

                // If not enough, try case‑insensitive partial match
                if (result.rows.length < t.count) {
                    const remaining = t.count - result.rows.length;
                    console.log(`   ${t.topic}: found ${result.rows.length}, need ${remaining} more`);

                    const additional = await db.query(
                        `SELECT q.*, s.name as subject_name 
                         FROM questions q
                         JOIN subjects s ON s.id = q.subject_id
                         WHERE q.subject_id = $1 
                         AND q.topic ILIKE $2
                         AND q.id NOT IN (${result.rows.map(r => r.id).join(',') || 0})
                         ORDER BY RANDOM()
                         LIMIT $3`,
                        [subject.id, `%${t.topic}%`, remaining]
                    );

                    result.rows = [...result.rows, ...additional.rows];
                }

                // If still not enough, get any random questions from this subject
                if (result.rows.length < t.count) {
                    const remaining = t.count - result.rows.length;
                    console.log(`   ${t.topic}: still need ${remaining}, using random questions`);

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

                // Format the questions
                const formattedQuestions = result.rows.map(q => ({
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

                subjectQuestions = [...subjectQuestions, ...formattedQuestions];
                console.log(`   ✅ ${t.topic}: loaded ${formattedQuestions.length} questions`);
            }

            // Verify we have the correct number of questions for this subject
            const expectedCount = subject.name === 'Use of English' ? 60 : 40;
            console.log(`📊 ${subject.name}: Loaded ${subjectQuestions.length} of ${expectedCount} questions`);

            // Fill missing questions with random picks if needed
            if (subjectQuestions.length < expectedCount) {
                console.warn(`⚠️ Warning: Only found ${subjectQuestions.length} questions for ${subject.name}, expected ${expectedCount}`);
                const remaining = expectedCount - subjectQuestions.length;
                console.log(`   Attempting to fill ${remaining} missing questions with random picks...`);

                const fillResult = await db.query(
                    `SELECT q.*, s.name as subject_name 
                     FROM questions q
                     JOIN subjects s ON s.id = q.subject_id
                     WHERE q.subject_id = $1 
                     AND q.id NOT IN (${subjectQuestions.map(q => q.id).join(',') || 0})
                     ORDER BY RANDOM()
                     LIMIT $2`,
                    [subject.id, remaining]
                );

                const fillQuestions = fillResult.rows.map(q => ({
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

                subjectQuestions = [...subjectQuestions, ...fillQuestions];
                console.log(`   ✅ Added ${fillQuestions.length} random questions`);
            }

            allQuestions = [...allQuestions, ...subjectQuestions];
        }

        // Shuffle all questions
        allQuestions = shuffleArray(allQuestions);
        console.log(`✅ Total questions loaded for exam: ${allQuestions.length}`);
        res.json(allQuestions);

    } catch (error) {
        console.error('❌ Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

router.post('/exam/save', auth, async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { examData } = req.body;
        const userId = req.user.id;

        // Generate a new unique examId (ignore the one from frontend)
        const examId = `EXAM_${Date.now()}_${Math.random().toString(36).substr(2, 8)}_${userId}`;

        // Check if exam already exists for this user (optional but safe)
        const existing = await client.query(
            `SELECT id FROM exam_sessions WHERE id = $1 AND user_id = $2`,
            [examData.examId, userId]
        );
        if (existing.rows.length > 0) {
            // Already saved, return success without inserting duplicate
            return res.json({ success: true, message: 'Exam already saved', sessionId: examData.examId });
        }

        await client.query('BEGIN');

        const subjectsSelected = examData.subjects.map(s => s.id);
        const totalQuestions = Object.values(examData.subjectQuestions).reduce((sum, arr) => sum + arr.length, 0);

        const sessionResult = await client.query(
            `INSERT INTO exam_sessions 
             (id, user_id, subjects_selected, started_at, completed_at, score, total_questions, percentage)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
                examId,   // use new unique ID
                userId,
                subjectsSelected,
                examData.date,
                new Date().toISOString(),
                examData.scores.total,
                totalQuestions,
                examData.scores.percentage
            ]
        );

        const sessionId = sessionResult.rows[0].id;

        // Insert answers
        for (const [questionId, answer] of Object.entries(examData.answers)) {
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
                [sessionId, questionId, answer, isCorrect, new Date().toISOString()]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, sessionId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving exam:', error);
        res.status(500).json({ error: 'Failed to save exam results' });
    } finally {
        client.release();
    }
});

// Get current user's exam history (simplified, no subject names)
router.get('/user/my-exams', auth, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, started_at, completed_at, score, total_questions, percentage
             FROM exam_sessions
             WHERE user_id = $1
             ORDER BY started_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = router;