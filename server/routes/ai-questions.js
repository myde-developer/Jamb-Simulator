// server/routes/ai-questions.js - NO DIAGRAMS
const express = require('express');
const router = express.Router();
const { allSubjects } = require('../data/all-subjects');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
            topics: subject.topics
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Subject-specific guidelines
function getSubjectGuidelines(subjectName) {
    const guidelines = {
        'Use of English': 'Include comprehension, synonyms/antonyms, sentence completion, oral English, and the Lekki Headmaster novel.',
        'Mathematics': 'Include calculation questions, formula application, geometry, algebra, statistics, probability, and word problems.',
        'Physics': 'Include formula-based calculations, conceptual questions about laws, practical applications, and scientific principles.',
        'Chemistry': 'Include balancing equations, periodic table trends, chemical reactions, organic chemistry, and mole calculations.',
        'Biology': 'Include definitions, processes, classifications, human anatomy, plant biology, ecology, and genetics.',
        'Agricultural Science': 'Include crop production, animal husbandry, soil science, agricultural economics, and farm machinery.',
        'Computer Studies': 'Include hardware, software, networking, programming concepts, data processing, and number systems.',
        'Literature in English': 'Include drama, prose, poetry, literary devices, figures of speech, and African literature.',
        'Government': 'Include political systems, Nigerian constitution, governance structures, electoral processes, and political parties.',
        'History': 'Include Nigerian history, pre-colonial societies, colonial era, independence movements, and key historical figures.',
        'Economics': 'Include supply/demand, market structures, national income, monetary policy, fiscal policy, and international trade.',
        'Commerce': 'Include trade, business units, marketing, banking, insurance, transportation, and warehousing.',
        'Principles of Accounts': 'Include double entry, ledger accounts, trial balance, final accounts, and bank reconciliation.',
        'Geography': 'Include physical geography, map reading, climate patterns, population distribution, and environmental issues.',
        'Christian Religious Studies': 'Include Bible stories, teachings of Jesus, parables, miracles, and epistles.',
        'Islamic Studies': 'Include Quranic teachings, Hadith, pillars of Islam, Islamic history, and Islamic law.',
        'French': 'Include vocabulary, grammar, conjugation, comprehension, and cultural knowledge.',
        'Yoruba': 'Include language structure, grammar, literature, culture, and oral traditions.',
        'Igbo': 'Include language structure, grammar, literature, culture, and oral traditions.',
        'Hausa': 'Include language structure, grammar, literature, culture, and oral traditions.',
        'Music': 'Include music theory, notation, scales, rhythm, harmony, instruments, and music history.',
        'Fine Arts': 'Include art history, drawing, painting, sculpture, color theory, composition, and African art.'
    };
    return guidelines[subjectName] || 'Cover the syllabus comprehensively with factual, knowledge-based multiple-choice questions.';
}

// Generate MCQ questions in batches
async function generateQuestionsInBatches(subject, count, topic, difficulty, groqApiKey, batchSize = 5) {
    const allQuestions = [];
    const batches = Math.ceil(count / batchSize);
    
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
        
        if (i > 0) {
            console.log(`⏳ Waiting 3 seconds before next batch...`);
            await delay(3000);
        }
        
        const prompt = `You are an expert JAMB examiner. Generate ${batchCount} ORIGINAL, HIGH-QUALITY multiple-choice questions for JAMB UTME ${subject.name}.

${topic && topic !== 'all' && topic !== 'Select Topic' ? `TOPIC: ${topic}` : `Cover diverse topics from the ${subject.name} syllabus.`}

DIFFICULTY: ${difficultyDesc}

SUBJECT-SPECIFIC GUIDELINES:
${subjectGuidelines}

Each question MUST have 4 options (A, B, C, D) with ONE correct answer.

Question types to include:
- Application: "If X happens, what would be the result?"
- Calculation: "Calculate the value of..." (for Math/Sciences)
- Analysis: "Which of the following best explains why..."
- Comparison: "What is the difference between X and Y?"
- Identification: "Which of these is an example of X?"

Return ONLY a valid JSON array of ${batchCount} questions in this format:
{
    "question_text": "The question text",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "A/B/C/D",
    "explanation": "Detailed explanation (2-3 sentences)",
    "topic": "${topic || 'General'}",
    "difficulty": "${difficulty || 'medium'}"
}`;

        let retries = 3;
        let success = false;
        let batchQuestions = [];
        
        while (retries > 0 && !success) {
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
                
                if (response.status === 429) {
                    console.log(`⚠️ Rate limited! Waiting 5 seconds... (${retries} retries left)`);
                    await delay(5000);
                    retries--;
                    continue;
                }
                
                if (!response.ok) {
                    console.error(`❌ GROQ batch ${i + 1} failed: ${response.status}`);
                    retries--;
                    continue;
                }
                
                const data = await response.json();
                const generatedText = data.choices[0].message.content;
                
                const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (jsonMatch) {
                    batchQuestions = JSON.parse(jsonMatch[0]);
                } else {
                    batchQuestions = JSON.parse(generatedText);
                }
                
                if (Array.isArray(batchQuestions) && batchQuestions.length > 0) {
                    allQuestions.push(...batchQuestions);
                    console.log(`✅ Batch ${i + 1} generated ${batchQuestions.length} questions`);
                    success = true;
                } else {
                    retries--;
                }
                
            } catch (error) {
                console.error(`❌ Error in batch ${i + 1}:`, error.message);
                retries--;
            }
        }
    }
    
    return allQuestions.slice(0, count);
}

// Generate questions using GROQ API
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, topic, count = 10, difficulty = 'medium', examMode = false } = req.body;
        
        console.log(`📝 Generate request: subjectId=${subjectId}, topic=${topic}, count=${count}, difficulty=${difficulty}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            console.error('❌ GROQ_API_KEY not set');
            return res.status(500).json({ error: 'AI service not configured. Please add GROQ_API_KEY.' });
        }
        
        console.log(`🤖 Generating ${count} MCQ questions for ${subject.name} using GROQ`);
        
        const questions = await generateQuestionsInBatches(subject, count, topic, difficulty, groqApiKey, 5);
        
        if (!questions || questions.length === 0) {
            throw new Error('No valid questions generated. Please try again.');
        }
        
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
        
        console.log(`✅ Generated ${formattedQuestions.length} questions for ${subject.name}`);
        
        res.json({ 
            success: true, 
            count: formattedQuestions.length, 
            questions: formattedQuestions 
        });
        
    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate questions', 
            details: error.message 
        });
    }
});

// Test endpoint
router.get('/test', authenticateToken, async (req, res) => {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
        return res.json({ 
            status: 'error', 
            message: 'GROQ_API_KEY not set',
            suggestion: 'Get a free API key from https://console.groq.com'
        });
    }
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${groqApiKey}` }
        });
        
        if (response.ok) {
            res.json({ status: 'ok', message: 'GROQ API key is valid' });
        } else {
            res.json({ status: 'error', message: 'Invalid GROQ API key' });
        }
    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }
});

module.exports = router;