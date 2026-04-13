// server/routes/ai-questions.js - FINAL VERSION
// Generates HIGH-QUALITY multiple-choice questions for JAMB using GROQ API
const express = require('express');
const router = express.Router();
const { allSubjects } = require('../data/all-subjects');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Get all subjects
router.get('/subjects', authenticateToken, (req, res) => {
    try {
        const subjects = Object.values(allSubjects).map(subject => ({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            category: subject.category,
            hasDiagrams: subject.hasDiagrams || false,
            totalQuestions: subject.totalQuestions
        }));
        res.json({ subjects });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Get subject details
router.get('/subject/:subjectId', authenticateToken, (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        const subject = allSubjects[subjectId];
        
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        res.json({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            category: subject.category,
            totalQuestions: subject.totalQuestions,
            duration: subject.duration,
            hasDiagrams: subject.hasDiagrams || false,
            minDiagramQuestions: subject.minDiagramQuestions || 0,
            topicDistribution: subject.topicDistribution || null,
            topics: subject.topics
        });
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: 'Failed to fetch subject' });
    }
});

// Get topics for a subject
router.get('/topics/:subjectId', authenticateToken, (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);
        const subject = allSubjects[subjectId];
        
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        res.json({ 
            subjectId: subject.id,
            subjectName: subject.name,
            topics: subject.topics,
            hasDiagrams: subject.hasDiagrams || false
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Subject-specific guidelines for better questions
function getSubjectGuidelines(subjectName) {
    const guidelines = {
        'Use of English': 'Include comprehension, synonyms/antonyms, sentence completion, oral English, and the Lekki Headmaster novel. Questions should test vocabulary, grammar, and reading comprehension.',
        'Mathematics': 'Include calculation questions, formula application, geometry, algebra, statistics, probability, and word problems. Use numbers and variables. Questions should require step-by-step thinking.',
        'Physics': 'Include formula-based calculations, conceptual questions about laws, practical applications, scientific principles, and real-world scenarios.',
        'Chemistry': 'Include balancing equations, periodic table trends, chemical reactions, organic chemistry, mole calculations, and acid-base chemistry.',
        'Biology': 'Include definitions, processes, classifications, human anatomy, plant biology, ecology, genetics, and physiology.',
        'Agricultural Science': 'Include crop production, animal husbandry, soil science, agricultural economics, farm machinery, and pest control.',
        'Computer Studies': 'Include hardware, software, networking, programming concepts, data processing, number systems, and internet technologies.',
        'Literature in English': 'Include questions on drama, prose, poetry, literary devices, figures of speech, and African literature including The Lekki Headmaster.',
        'Government': 'Include political systems, Nigerian constitution, governance structures, electoral processes, political parties, and international relations.',
        'History': 'Include Nigerian history, pre-colonial societies, colonial era, independence movements, key historical figures, and major events.',
        'Economics': 'Include supply/demand, market structures, national income, monetary policy, fiscal policy, international trade, and economic theories.',
        'Commerce': 'Include trade, business units, marketing, banking, insurance, transportation, warehousing, and consumer protection.',
        'Principles of Accounts': 'Include double entry, ledger accounts, trial balance, final accounts, bank reconciliation, and financial statements.',
        'Geography': 'Include physical geography, map reading, climate patterns, population distribution, environmental issues, and regional geography.',
        'Christian Religious Studies': 'Include Bible stories, teachings of Jesus, parables, miracles, epistles, and Christian living.',
        'Islamic Studies': 'Include Quranic teachings, Hadith, pillars of Islam, Islamic history, and Islamic law.',
        'French': 'Include vocabulary, grammar, conjugation, comprehension, and cultural knowledge.',
        'Yoruba/Igbo/Hausa': 'Include language structure, grammar, literature, culture, and oral traditions.',
        'Music': 'Include music theory, notation, scales, rhythm, harmony, instruments, and music history.',
        'Fine Arts': 'Include art history, drawing, painting, sculpture, color theory, composition, and African art.'
    };
    return guidelines[subjectName] || 'Cover the syllabus comprehensively with factual, knowledge-based multiple-choice questions.';
}

// Generate high-quality MCQ questions in batches
async function generateQuestionsInBatches(subject, count, topic, difficulty, groqApiKey, batchSize = 10) {
    const allQuestions = [];
    const batches = Math.ceil(count / batchSize);
    
    // Map difficulty levels
    let difficultyDesc = 'STANDARD JAMB difficulty';
    let temperature = 0.75;
    
    if (difficulty === 'hard') {
        difficultyDesc = 'HARD - Challenging questions that require deep understanding, application, and sometimes calculations. Include tricky distractors.';
        temperature = 0.85;
    } else if (difficulty === 'easy') {
        difficultyDesc = 'EASY - Basic recall and simple understanding questions.';
        temperature = 0.65;
    } else {
        difficultyDesc = 'MEDIUM - Standard JAMB difficulty, testing understanding and basic application.';
        temperature = 0.75;
    }
    
    const subjectGuidelines = getSubjectGuidelines(subject.name);
    
    for (let i = 0; i < batches; i++) {
        const batchCount = Math.min(batchSize, count - (i * batchSize));
        console.log(`📦 Generating batch ${i + 1}/${batches} (${batchCount} questions) - Difficulty: ${difficulty}`);
        
        const prompt = `You are an expert JAMB examiner. Generate ${batchCount} ORIGINAL, HIGH-QUALITY multiple-choice questions for JAMB UTME ${subject.name}.

${topic && topic !== 'all' && topic !== 'Select Topic' ? `TOPIC: ${topic}` : `Cover diverse topics from the ${subject.name} syllabus.`}

DIFFICULTY: ${difficultyDesc}

SUBJECT-SPECIFIC GUIDELINES:
${subjectGuidelines}

CRITICAL FORMAT RULES:
- Each question MUST have 4 options (A, B, C, D)
- ONE correct answer, THREE plausible distractors
- Distractors must be BELIEVABLE but clearly incorrect
- Questions must be MULTIPLE CHOICE (NOT theory or essay)

QUESTION TYPES TO INCLUDE (mix them up):
1. Application: "If X happens, what would be the result?"
2. Calculation: "Calculate the value of..." (for Math/Sciences)
3. Analysis: "Which of the following best explains why..."
4. Comparison: "What is the difference between X and Y?"
5. Identification: "Which of these is an example of X?"
6. Definition/Concept: "What is the function of X?"
7. True/False style: "Which statement about X is CORRECT?"

AVOID:
- "What if" hypothetical questions
- Trivia or obvious facts
- Questions where the answer is obvious from options
- Simple definition recall without application

EXAMPLE OF A GOOD HARD QUESTION:
{
    "question_text": "A ball is thrown vertically upward with an initial velocity of 20 m/s. Assuming g = 10 m/s², what is the maximum height reached?",
    "option_a": "10 m",
    "option_b": "15 m",
    "option_c": "20 m",
    "option_d": "40 m",
    "correct_answer": "C",
    "explanation": "Using v² = u² - 2gh. At max height v=0, so h = u²/2g = (20)²/(2×10) = 400/20 = 20m.",
    "topic": "${topic || 'General'}",
    "difficulty": "${difficulty || 'medium'}"
}

EXAMPLE OF A GOOD MEDIUM QUESTION:
{
    "question_text": "What is the primary function of the mitochondria in a cell?",
    "option_a": "Protein synthesis",
    "option_b": "Energy production (ATP)",
    "option_c": "Waste storage",
    "option_d": "DNA replication",
    "correct_answer": "B",
    "explanation": "Mitochondria are known as the powerhouse of the cell because they produce ATP through cellular respiration.",
    "topic": "${topic || 'General'}",
    "difficulty": "${difficulty || 'medium'}"
}

Return ONLY a valid JSON array of ${batchCount} questions. No extra text, no markdown, no explanations before or after the array.

THE JSON ARRAY MUST START WITH [ AND END WITH ]`;

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: temperature,
                    max_tokens: 8192
                })
            });
            
            if (!response.ok) {
                console.error(`❌ GROQ batch ${i + 1} failed: ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            const generatedText = data.choices[0].message.content;
            
            // Extract JSON array
            let batchQuestions = [];
            try {
                // Try to find JSON array in the response
                const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (jsonMatch) {
                    batchQuestions = JSON.parse(jsonMatch[0]);
                } else {
                    batchQuestions = JSON.parse(generatedText);
                }
            } catch (parseError) {
                console.error(`❌ Failed to parse batch ${i + 1}:`, parseError.message);
                // Try to fix common JSON issues
                let fixedText = generatedText;
                // Remove any trailing commas before closing brackets
                fixedText = fixedText.replace(/,(\s*[}\]])/g, '$1');
                try {
                    const jsonMatch = fixedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
                    if (jsonMatch) {
                        batchQuestions = JSON.parse(jsonMatch[0]);
                    }
                } catch (e) {
                    console.error('Could not recover JSON');
                }
            }
            
            if (Array.isArray(batchQuestions) && batchQuestions.length > 0) {
                allQuestions.push(...batchQuestions);
                console.log(`✅ Batch ${i + 1} generated ${batchQuestions.length} questions`);
            } else {
                console.log(`⚠️ Batch ${i + 1} produced no valid questions`);
            }
            
        } catch (error) {
            console.error(`❌ Error in batch ${i + 1}:`, error.message);
        }
    }
    
    return allQuestions.slice(0, count);
}

// Generate questions using GROQ API
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, topic, count = 10, difficulty = 'medium', includeDiagrams = false, forceDiagrams = false, examMode = false } = req.body;
        
        console.log(`📝 Generate request: subjectId=${subjectId}, topic=${topic}, count=${count}, difficulty=${difficulty}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            console.error('❌ GROQ_API_KEY not set in environment variables');
            console.log('💡 Get a free API key from: https://console.groq.com');
            return res.status(500).json({ 
                error: 'AI service not configured. Please add GROQ_API_KEY to environment variables.',
                details: 'Get a free API key from https://console.groq.com'
            });
        }
        
        console.log(`🤖 Generating ${count} MCQ questions for ${subject.name} using GROQ`);
        console.log(`   Topic: ${topic || 'All Topics'}, Difficulty: ${difficulty}`);
        
        // Generate questions in batches
        const questions = await generateQuestionsInBatches(subject, count, topic, difficulty, groqApiKey, 10);
        
        if (!questions || questions.length === 0) {
            throw new Error('No valid questions generated. Please try again.');
        }
        
        // Format questions to match frontend expected structure
        const formattedQuestions = [];
        for (let i = 0; i < Math.min(questions.length, count); i++) {
            const q = questions[i];
            formattedQuestions.push({
                id: `ai_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
                question_text: q.question_text || q.question || 'No question provided',
                option_a: q.option_a || q.options?.A || 'Option A',
                option_b: q.option_b || q.options?.B || 'Option B',
                option_c: q.option_c || q.options?.C || 'Option C',
                option_d: q.option_d || q.options?.D || 'Option D',
                correct_answer: q.correct_answer || 'A',
                explanation: q.explanation || 'No explanation available',
                subject: subject.name,
                subject_id: subject.id,
                topic: q.topic || topic || 'General',
                difficulty: q.difficulty || difficulty,
                is_ai_generated: true
            });
        }
        
        console.log(`✅ Successfully generated ${formattedQuestions.length} MCQ questions for ${subject.name}`);
        
        // Log a sample question for quality verification
        if (formattedQuestions.length > 0) {
            const sample = formattedQuestions[0];
            console.log(`📖 Sample question: "${sample.question_text.substring(0, 80)}..."`);
            console.log(`   Correct answer: ${sample.correct_answer} - ${sample[sample.correct_answer === 'A' ? 'option_a' : sample.correct_answer === 'B' ? 'option_b' : sample.correct_answer === 'C' ? 'option_c' : 'option_d']}`);
        }
        
        res.json({ 
            success: true, 
            count: formattedQuestions.length, 
            questions: formattedQuestions 
        });
        
    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to generate questions', 
            details: error.message,
            suggestion: 'Please check your GROQ_API_KEY and try again.'
        });
    }
});

// Test endpoint to verify API key is working
router.get('/test', authenticateToken, async (req, res) => {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
        return res.json({ 
            status: 'error', 
            message: 'GROQ_API_KEY not set in environment variables',
            suggestion: 'Get a free API key from https://console.groq.com'
        });
    }
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${groqApiKey}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            res.json({
                status: 'ok',
                message: 'GROQ API key is valid',
                models: data.data?.slice(0, 3).map(m => m.id) || []
            });
        } else {
            res.json({
                status: 'error',
                message: 'Invalid GROQ API key'
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;