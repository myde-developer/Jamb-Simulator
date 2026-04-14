// server/routes/api.js - Complete Exam Questions Route (ALL 22 SUBJECTS)
// Using topic distributions from all-subjects.js
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

            // ===== 1. USE OF ENGLISH (60 questions) =====
            if (subject.name === 'Use of English') {
                topicDistribution = [
                    { topic: 'The Lekki Headmaster', count: 10 },
                    { topic: 'Comprehension', count: 10 },
                    { topic: 'Cloze Passage', count: 10 },
                    { topic: 'Sentence Interpretation', count: 10 },
                    { topic: 'Antonyms & Synonyms', count: 10 },
                    { topic: 'Sentence Completion', count: 5 },
                    { topic: 'Oral English', count: 5 }
                ];
            }
            
            // ===== 2. MATHEMATICS (40 questions) =====
            else if (subject.name === 'Mathematics') {
                topicDistribution = [
                    { topic: 'Number Bases', count: 2 },
                    { topic: 'Indices & Logarithms', count: 2 },
                    { topic: 'Sets', count: 2 },
                    { topic: 'Polynomials', count: 3 },
                    { topic: 'Inequalities', count: 2 },
                    { topic: 'Progression', count: 2 },
                    { topic: 'Matrices', count: 2 },
                    { topic: 'Euclidean Geometry', count: 4 },
                    { topic: 'Mensuration', count: 4 },
                    { topic: 'Coordinate Geometry', count: 3 },
                    { topic: 'Trigonometry', count: 4 },
                    { topic: 'Calculus', count: 4 },
                    { topic: 'Statistics', count: 3 },
                    { topic: 'Probability', count: 3 }
                ];
            }
            
            // ===== 3. PHYSICS (40 questions) =====
            else if (subject.name === 'Physics') {
                topicDistribution = [
                    { topic: 'Measurements & Units', count: 2 },
                    { topic: 'Scalars & Vectors', count: 2 },
                    { topic: 'Motion', count: 4 },
                    { topic: 'Gravitational Field', count: 2 },
                    { topic: 'Equilibrium of Forces', count: 3 },
                    { topic: 'Work, Energy & Power', count: 2 },
                    { topic: 'Friction', count: 2 },
                    { topic: 'Simple Machines', count: 2 },
                    { topic: 'Elasticity', count: 2 },
                    { topic: 'Pressure', count: 2 },
                    { topic: 'Heat Energy', count: 2 },
                    { topic: 'Waves', count: 3 },
                    { topic: 'Light', count: 4 },
                    { topic: 'Sound', count: 2 },
                    { topic: 'Electricity', count: 4 },
                    { topic: 'Magnetism', count: 2 }
                ];
            }
            
            // ===== 4. CHEMISTRY (40 questions) =====
            else if (subject.name === 'Chemistry') {
                topicDistribution = [
                    { topic: 'Atomic Structure', count: 3 },
                    { topic: 'Chemical Combination', count: 3 },
                    { topic: 'Gas Laws', count: 2 },
                    { topic: 'Water & Solubility', count: 2 },
                    { topic: 'Acids & Bases', count: 3 },
                    { topic: 'Salts', count: 2 },
                    { topic: 'Oxidation & Reduction', count: 3 },
                    { topic: 'Electrolysis', count: 3 },
                    { topic: 'Organic Chemistry', count: 4 },
                    { topic: 'Separation of Mixtures', count: 2 },
                    { topic: 'Environmental Pollution', count: 2 },
                    { topic: 'Chemical Kinetics', count: 2 },
                    { topic: 'Thermochemistry', count: 2 },
                    { topic: 'Nuclear Chemistry', count: 1 },
                    { topic: 'Qualitative Analysis', count: 2 },
                    { topic: 'Stoichiometry', count: 2 }
                ];
            }
            
            // ===== 5. BIOLOGY (40 questions) =====
            else if (subject.name === 'Biology') {
                topicDistribution = [
                    { topic: 'Living Organisms', count: 2 },
                    { topic: 'Classification', count: 2 },
                    { topic: 'Internal Structure of Plants', count: 3 },
                    { topic: 'Internal Structure of Mammals', count: 3 },
                    { topic: 'Nutrition', count: 3 },
                    { topic: 'Transport', count: 2 },
                    { topic: 'Respiration', count: 2 },
                    { topic: 'Excretion', count: 2 },
                    { topic: 'Support & Movement', count: 2 },
                    { topic: 'Reproduction', count: 3 },
                    { topic: 'Growth', count: 2 },
                    { topic: 'Coordination & Control', count: 2 },
                    { topic: 'Homeostasis', count: 2 },
                    { topic: 'Ecology', count: 4 },
                    { topic: 'Genetics', count: 3 },
                    { topic: 'Evolution', count: 2 },
                    { topic: 'Cell Biology', count: 2 }
                ];
            }
            
            // ===== 6. AGRICULTURAL SCIENCE (40 questions) =====
            else if (subject.name === 'Agricultural Science') {
                topicDistribution = [
                    { topic: 'Basic Concepts', count: 3 },
                    { topic: 'Agro-ecology', count: 3 },
                    { topic: 'Genetics', count: 2 },
                    { topic: 'Crop Production', count: 5 },
                    { topic: 'Animal Production', count: 5 },
                    { topic: 'Agricultural Economics', count: 4 },
                    { topic: 'Soil Science', count: 3 },
                    { topic: 'Fisheries & Wildlife', count: 2 },
                    { topic: 'Forestry', count: 2 },
                    { topic: 'Farm Machinery', count: 2 },
                    { topic: 'Crop Protection', count: 3 },
                    { topic: 'Animal Health', count: 2 },
                    { topic: 'Agricultural Extension', count: 2 },
                    { topic: 'Farm Inputs', count: 2 }
                ];
            }
            
            // ===== 7. COMPUTER STUDIES (40 questions) =====
            else if (subject.name === 'Computer Studies') {
                topicDistribution = [
                    { topic: 'History of Computing', count: 2 },
                    { topic: 'Computer Hardware', count: 4 },
                    { topic: 'Computer Software', count: 3 },
                    { topic: 'Operating Systems', count: 3 },
                    { topic: 'Data Processing', count: 3 },
                    { topic: 'Number Systems', count: 4 },
                    { topic: 'Computer Networks', count: 4 },
                    { topic: 'Programming Concepts', count: 5 },
                    { topic: 'Database Management', count: 3 },
                    { topic: 'Computer Ethics', count: 2 },
                    { topic: 'Emerging Technologies', count: 2 },
                    { topic: 'Internet & Web Technologies', count: 2 },
                    { topic: 'Multimedia', count: 1 },
                    { topic: 'Security', count: 2 }
                ];
            }
            
            // ===== 8. LITERATURE IN ENGLISH (40 questions) =====
            else if (subject.name === 'Literature in English') {
                topicDistribution = [
                    { topic: 'Drama', count: 6 },
                    { topic: 'Prose', count: 6 },
                    { topic: 'Poetry', count: 5 },
                    { topic: 'Literary Principles', count: 4 },
                    { topic: 'Literary Appreciation', count: 5 },
                    { topic: 'African Literature', count: 5 },
                    { topic: 'Non-African Literature', count: 4 },
                    { topic: 'Figures of Speech', count: 3 },
                    { topic: 'Literary Criticism', count: 2 }
                ];
            }
            
            // ===== 9. GOVERNMENT (40 questions) =====
            else if (subject.name === 'Government') {
                topicDistribution = [
                    { topic: 'Basic Concepts', count: 3 },
                    { topic: 'Forms of Government', count: 3 },
                    { topic: 'Arms of Government', count: 3 },
                    { topic: 'Political Ideologies', count: 2 },
                    { topic: 'Nigerian Constitution', count: 3 },
                    { topic: 'Political Parties', count: 3 },
                    { topic: 'Electoral Process', count: 3 },
                    { topic: 'Public Administration', count: 3 },
                    { topic: 'Local Government', count: 3 },
                    { topic: 'Foreign Policy', count: 3 },
                    { topic: 'International Organizations', count: 3 },
                    { topic: 'Decolonization', count: 2 },
                    { topic: 'Public Corporations', count: 2 },
                    { topic: 'Nigerian Federalism', count: 3 }
                ];
            }
            
            // ===== 10. HISTORY (40 questions) =====
            else if (subject.name === 'History') {
                topicDistribution = [
                    { topic: 'Pre-colonial Nigeria', count: 4 },
                    { topic: 'Trans-Saharan Trade', count: 3 },
                    { topic: 'European Contact', count: 3 },
                    { topic: 'Slave Trade', count: 3 },
                    { topic: 'Sokoto Caliphate', count: 3 },
                    { topic: 'Yoruba States', count: 3 },
                    { topic: 'Benin Kingdom', count: 3 },
                    { topic: 'Igbo Systems', count: 2 },
                    { topic: 'Colonial Conquest', count: 3 },
                    { topic: 'Nationalist Movements', count: 4 },
                    { topic: 'Nigerian Independence', count: 3 },
                    { topic: 'Military Rule', count: 3 },
                    { topic: 'Nigerian Civil War', count: 3 },
                    { topic: 'Foreign Policy', count: 2 },
                    { topic: 'ECOWAS', count: 2 }
                ];
            }
            
            // ===== 11. CHRISTIAN RELIGIOUS STUDIES (40 questions) =====
            else if (subject.name === 'Christian Religious Studies') {
                topicDistribution = [
                    { topic: 'Sovereignty of God', count: 3 },
                    { topic: 'Leadership & Authority', count: 3 },
                    { topic: 'The Covenant', count: 3 },
                    { topic: 'Prophetic Mission', count: 3 },
                    { topic: 'Faith & Works', count: 3 },
                    { topic: 'Justice & Fairness', count: 2 },
                    { topic: 'Sermon on the Mount', count: 3 },
                    { topic: 'Parables of Jesus', count: 4 },
                    { topic: 'Miracles of Jesus', count: 4 },
                    { topic: 'Death & Resurrection', count: 3 },
                    { topic: 'Early Church', count: 3 },
                    { topic: "Paul's Journeys", count: 3 },
                    { topic: 'Christian Living', count: 2 },
                    { topic: 'Social Justice', count: 2 },
                    { topic: 'Religious Tolerance', count: 2 }
                ];
            }
            
            // ===== 12. ISLAMIC STUDIES (40 questions) =====
            else if (subject.name === 'Islamic Studies') {
                topicDistribution = [
                    { topic: 'Tawhid', count: 4 },
                    { topic: 'Prophethood', count: 4 },
                    { topic: 'Revealed Books', count: 3 },
                    { topic: 'Angels', count: 2 },
                    { topic: 'Day of Judgment', count: 2 },
                    { topic: 'Quranic Studies', count: 5 },
                    { topic: 'Hadith', count: 4 },
                    { topic: 'Islamic Law', count: 3 },
                    { topic: 'Prayer', count: 3 },
                    { topic: 'Fasting', count: 2 },
                    { topic: 'Zakat', count: 2 },
                    { topic: 'Pilgrimage', count: 2 },
                    { topic: 'Islamic History', count: 3 },
                    { topic: 'Islamic Ethics', count: 2 }
                ];
            }
            
            // ===== 13. FRENCH (40 questions) =====
            else if (subject.name === 'French') {
                topicDistribution = [
                    { topic: 'Greetings', count: 4 },
                    { topic: 'Numbers', count: 3 },
                    { topic: 'Family', count: 3 },
                    { topic: 'Food', count: 3 },
                    { topic: 'Daily Activities', count: 4 },
                    { topic: 'Travel', count: 3 },
                    { topic: 'Housing', count: 3 },
                    { topic: 'Work', count: 3 },
                    { topic: 'Health', count: 3 },
                    { topic: 'Weather', count: 3 },
                    { topic: 'Grammar', count: 5 },
                    { topic: 'Culture', count: 3 }
                ];
            }
            
            // ===== 14. YORUBA (40 questions) =====
            else if (subject.name === 'Yoruba') {
                topicDistribution = [
                    { topic: 'Alphabet', count: 8 },
                    { topic: 'Grammar', count: 8 },
                    { topic: 'Culture', count: 8 },
                    { topic: 'History', count: 8 },
                    { topic: 'Composition', count: 8 }
                ];
            }
            
            // ===== 15. IGBO (40 questions) =====
            else if (subject.name === 'Igbo') {
                topicDistribution = [
                    { topic: 'Alphabet', count: 8 },
                    { topic: 'Vocabulary', count: 8 },
                    { topic: 'Grammar', count: 8 },
                    { topic: 'Culture', count: 8 },
                    { topic: 'History', count: 8 }
                ];
            }
            
            // ===== 16. HAUSA (40 questions) =====
            else if (subject.name === 'Hausa') {
                topicDistribution = [
                    { topic: 'Alphabet', count: 8 },
                    { topic: 'Grammar', count: 8 },
                    { topic: 'Culture', count: 8 },
                    { topic: 'History', count: 8 },
                    { topic: 'Writing', count: 8 }
                ];
            }
            
            // ===== 17. MUSIC (40 questions) =====
            else if (subject.name === 'Music') {
                topicDistribution = [
                    { topic: 'Elements of Music', count: 5 },
                    { topic: 'Music Notation', count: 5 },
                    { topic: 'Scales & Intervals', count: 5 },
                    { topic: 'Rhythm & Meter', count: 4 },
                    { topic: 'Harmony', count: 4 },
                    { topic: 'Musical Instruments', count: 5 },
                    { topic: 'African Music', count: 4 },
                    { topic: 'Western Music History', count: 4 },
                    { topic: 'Music Analysis', count: 4 }
                ];
            }
            
            // ===== 18. FINE ARTS (40 questions) =====
            else if (subject.name === 'Fine Arts') {
                topicDistribution = [
                    { topic: 'Drawing', count: 5 },
                    { topic: 'Painting', count: 5 },
                    { topic: 'Sculpture', count: 5 },
                    { topic: 'Printmaking', count: 4 },
                    { topic: 'Art History', count: 5 },
                    { topic: 'African Art', count: 5 },
                    { topic: 'Contemporary Art', count: 4 },
                    { topic: 'Color Theory', count: 4 },
                    { topic: 'Composition', count: 3 }
                ];
            }
            
            // ===== 19. ECONOMICS (40 questions) =====
            else if (subject.name === 'Economics') {
                topicDistribution = [
                    { topic: 'Basic Concepts', count: 3 },
                    { topic: 'Economic Systems', count: 3 },
                    { topic: 'Demand & Supply', count: 4 },
                    { topic: 'Elasticity', count: 2 },
                    { topic: 'Consumer Behavior', count: 2 },
                    { topic: 'Production', count: 3 },
                    { topic: 'Cost Concepts', count: 2 },
                    { topic: 'Market Structures', count: 3 },
                    { topic: 'National Income', count: 3 },
                    { topic: 'Money & Banking', count: 3 },
                    { topic: 'Inflation', count: 2 },
                    { topic: 'International Trade', count: 3 },
                    { topic: 'Economic Development', count: 3 },
                    { topic: 'Public Finance', count: 2 },
                    { topic: 'Population', count: 2 }
                ];
            }
            
            // ===== 20. COMMERCE (40 questions) =====
            else if (subject.name === 'Commerce') {
                topicDistribution = [
                    { topic: 'Meaning of Commerce', count: 3 },
                    { topic: 'Occupation', count: 2 },
                    { topic: 'Production', count: 3 },
                    { topic: 'Trade', count: 4 },
                    { topic: 'Aids to Trade', count: 4 },
                    { topic: 'Business Units', count: 4 },
                    { topic: 'Financing', count: 3 },
                    { topic: 'Trade Associations', count: 2 },
                    { topic: 'Money & Banking', count: 3 },
                    { topic: 'Stock Exchange', count: 3 },
                    { topic: 'Business Management', count: 3 },
                    { topic: 'Marketing', count: 3 },
                    { topic: 'Legal Aspects', count: 2 },
                    { topic: 'Commodity Exchange', count: 2 }
                ];
            }
            
            // ===== 21. PRINCIPLES OF ACCOUNTS (40 questions) =====
            else if (subject.name === 'Principles of Accounts') {
                topicDistribution = [
                    { topic: 'Bookkeeping', count: 3 },
                    { topic: 'Double Entry', count: 4 },
                    { topic: 'Books of Entry', count: 3 },
                    { topic: 'Ledger Accounts', count: 4 },
                    { topic: 'Trial Balance', count: 3 },
                    { topic: 'Cash Book', count: 3 },
                    { topic: 'Bank Reconciliation', count: 3 },
                    { topic: 'Final Accounts', count: 4 },
                    { topic: 'Stock Valuation', count: 2 },
                    { topic: 'Control Accounts', count: 2 },
                    { topic: 'Manufacturing', count: 2 },
                    { topic: 'Partnership', count: 3 },
                    { topic: 'Company Accounts', count: 2 },
                    { topic: 'Public Sector', count: 1 },
                    { topic: 'Accounting Software', count: 1 }
                ];
            }
            
            // ===== 22. GEOGRAPHY (40 questions) =====
            else if (subject.name === 'Geography') {
                topicDistribution = [
                    { topic: 'Basic Concepts', count: 3 },
                    { topic: 'Earth Structure', count: 2 },
                    { topic: 'Rocks & Minerals', count: 2 },
                    { topic: 'Landforms', count: 3 },
                    { topic: 'Weather & Climate', count: 4 },
                    { topic: 'Water Bodies', count: 2 },
                    { topic: 'Vegetation & Soils', count: 3 },
                    { topic: 'Population Geography', count: 3 },
                    { topic: 'Settlement Geography', count: 3 },
                    { topic: 'Economic Geography', count: 4 },
                    { topic: 'Transportation', count: 2 },
                    { topic: 'Environmental Issues', count: 3 },
                    { topic: 'Map Reading', count: 3 },
                    { topic: 'GIS', count: 2 },
                    { topic: 'Regional Geography', count: 2 }
                ];
            }

            // If no distribution found, skip this subject
            if (topicDistribution.length === 0) {
                console.log(`⚠️ No topic distribution found for ${subject.name}, skipping...`);
                continue;
            }

            console.log(`📚 Fetching ${subject.name} questions by topic...`);
            
            // Verify total adds up correctly
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

                // If not enough found, try case-insensitive partial match
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

                // If still not enough, get any questions from this subject
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
                console.log(`   ✅ ${t.topic}: loaded ${formattedQuestions.length} questions`);
            }

            // Verify we have the correct number of questions for this subject
            const expectedCount = subject.name === 'Use of English' ? 60 : 40;
            console.log(`📊 ${subject.name}: Loaded ${subjectQuestions.length} of ${expectedCount} questions`);
            
            // If we don't have enough questions, log a warning
            if (subjectQuestions.length < expectedCount) {
                console.warn(`⚠️ Warning: Only found ${subjectQuestions.length} questions for ${subject.name}, expected ${expectedCount}`);
                
                // Try to fill with any remaining questions
                if (subjectQuestions.length < expectedCount) {
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
            }

            // Add subject questions to all questions
            allQuestions = [...allQuestions, ...subjectQuestions];
        }

        // Shuffle all questions for better exam experience
        allQuestions = shuffleArray(allQuestions);
        
        console.log(`✅ Total questions loaded for exam: ${allQuestions.length}`);
        
        res.json(allQuestions);

    } catch (error) {
        console.error('❌ Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
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