// server/routes/api.js - Complete Exam Questions Route
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.post('/exam/questions', auth, async (req, res) => {
    try {
        const { subjects } = req.body;
        let allQuestions = [];

        for (const subject of subjects) {
            let topicDistribution = [];
            let subjectQuestions = [];

            // ===== ENGLISH LANGUAGE (60 questions) =====
            if (subject.name === 'Use of English') {
                topicDistribution = [
                    { topic: 'The Lekki Headmaster', count: 10 },
                    { topic: 'Comprehension', count: 5 },
                    { topic: 'Cloze Passage', count: 10 },
                    { topic: 'Sentence Interpretation', count: 5 },
                    { topic: 'Antonyms', count: 5 },
                    { topic: 'Synonyms', count: 5 },
                    { topic: 'Sentence Completion', count: 10 },
                    { topic: 'Oral English', count: 10 }
                ];
            }
            
            // ===== MATHEMATICS (40 questions) =====
            else if (subject.name === 'Mathematics') {
                topicDistribution = [
                    { topic: 'Number Bases', count: 2 },
                    { topic: 'Fractions, Decimals, Approximations', count: 2 },
                    { topic: 'Indices, Logarithms and Surds', count: 2 },
                    { topic: 'Sets', count: 2 },
                    { topic: 'Polynomials', count: 4 },
                    { topic: 'Variation', count: 2 },
                    { topic: 'Inequalities', count: 2 },
                    { topic: 'Progression', count: 2 },
                    { topic: 'Binary Operations', count: 1 },
                    { topic: 'Matrices and Determinants', count: 1 },
                    { topic: 'Euclidean Geometry', count: 3 },
                    { topic: 'Mensuration', count: 2 },
                    { topic: 'Loci', count: 1 },
                    { topic: 'Coordinate Geometry', count: 2 },
                    { topic: 'Trigonometry', count: 2 },
                    { topic: 'Differentiation', count: 2 },
                    { topic: 'Application of Differentiation', count: 1 },
                    { topic: 'Integration', count: 2 },
                    { topic: 'Representation of Data', count: 1 },
                    { topic: 'Measures of Location', count: 1 },
                    { topic: 'Measures of Dispersion', count: 1 },
                    { topic: 'Permutation and Combination', count: 1 },
                    { topic: 'Probability', count: 1 }
                ];
            }
            
            // ===== PHYSICS (40 questions) =====
            else if (subject.name === 'Physics') {
                topicDistribution = [
                    { topic: 'Measurements and Units', count: 2 },
                    { topic: 'Scalars and Vectors', count: 2 },
                    { topic: 'Motion', count: 6 },
                    { topic: 'Gravitational Field', count: 2 },
                    { topic: 'Equilibrium of Forces', count: 3 },
                    { topic: 'Work, Energy and Power', count: 4 },
                    { topic: 'Friction', count: 2 },
                    { topic: 'Simple Machines', count: 2 },
                    { topic: 'Elasticity', count: 3 },
                    { topic: 'Pressure', count: 2 },
                    { topic: 'Heat Energy', count: 3 },
                    { topic: 'Waves', count: 3 },
                    { topic: 'Light', count: 3 },
                    { topic: 'Sound', count: 3 }
                ];
            }
            
            // ===== CHEMISTRY (40 questions) =====
            else if (subject.name === 'Chemistry') {
                topicDistribution = [
                    { topic: 'Separation of Mixtures', count: 2 },
                    { topic: 'Chemical Combination', count: 4 },
                    { topic: 'Gas Laws', count: 3 },
                    { topic: 'Atomic Structure', count: 3 },
                    { topic: 'Chemical Bonding', count: 2 },
                    { topic: 'Air', count: 2 },
                    { topic: 'Water', count: 3 },
                    { topic: 'Solubility', count: 3 },
                    { topic: 'Environmental Pollution', count: 2 },
                    { topic: 'Acids and Bases', count: 3 },
                    { topic: 'Salts', count: 2 },
                    { topic: 'Oxidation and Reduction', count: 3 },
                    { topic: 'Electrolysis', count: 3 },
                    { topic: 'Organic Chemistry', count: 5 }
                ];
            }
            
            // ===== BIOLOGY (40 questions) =====
            else if (subject.name === 'Biology') {
                topicDistribution = [
                    { topic: 'Living Organisms', count: 2 },
                    { topic: 'Classification', count: 3 },
                    { topic: 'Internal Structure of Plants', count: 1 },
                    { topic: 'Internal Structure of Mammals', count: 1 },
                    { topic: 'Nutrition', count: 2 },
                    { topic: 'Transport', count: 2 },
                    { topic: 'Respiration', count: 1 },
                    { topic: 'Excretion', count: 1 },
                    { topic: 'Support and Movement', count: 1 },
                    { topic: 'Reproduction', count: 2 },
                    { topic: 'Growth', count: 1 },
                    { topic: 'Coordination and Control', count: 2 },
                    { topic: 'Homeostasis', count: 1 },
                    { topic: 'Factors Affecting Distribution', count: 1 },
                    { topic: 'Symbiotic Interactions', count: 2 },
                    { topic: 'Natural Habitats', count: 1 },
                    { topic: 'Nigerian Biomes', count: 1 },
                    { topic: 'Population Ecology', count: 1 },
                    { topic: 'Soil', count: 1 },
                    { topic: 'Humans and Environment', count: 1 },
                    { topic: 'Variation', count: 2 },
                    { topic: 'Heredity', count: 4 },
                    { topic: 'Sex-linked Characters', count: 2 },
                    { topic: 'Theories of Evolution', count: 2 },
                    { topic: 'Evidence of Evolution', count: 2 }
                ];
            }

            // Fetch questions for each topic
            for (const t of topicDistribution) {
                const result = await db.query(
                    `SELECT q.*, s.name as subject_name 
                     FROM questions q
                     JOIN subjects s ON s.id = q.subject_id
                     WHERE q.subject_id = $1 AND q.topic = $2
                     ORDER BY RANDOM()
                     LIMIT $3`,
                    [subject.id, t.topic, t.count]
                );

                // Format the questions properly
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

                // Add to subject questions
                subjectQuestions = [...subjectQuestions, ...formattedQuestions];
            }

            // Verify we have the correct number of questions for this subject
            const expectedCount = subject.name === 'Use of English' ? 60 : 40;
            console.log(`${subject.name}: Loaded ${subjectQuestions.length} of ${expectedCount} questions`);
            
            // If we don't have enough questions, log a warning
            if (subjectQuestions.length < expectedCount) {
                console.warn(`Warning: Only found ${subjectQuestions.length} questions for ${subject.name}, expected ${expectedCount}`);
            }

            // Add subject questions to all questions
            allQuestions = [...allQuestions, ...subjectQuestions];
        }

        // Shuffle all questions together (optional - you might want to keep them grouped by subject)
        // If you want to keep them grouped by subject for the tabs, comment out the shuffle
        // allQuestions = shuffleArray(allQuestions);
        
        console.log(`Total questions loaded: ${allQuestions.length}`);
        
        res.json(allQuestions);

    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = router;