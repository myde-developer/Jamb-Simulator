// server/routes/ai-questions.js - FINAL VERSION
// Safe batch-parallel generation for speed without rate limits
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

// Generate a SINGLE question
async function generateSingleQuestion(subject, specificTopic, difficulty, groqApiKey, retryCount = 0) {
    let difficultyDesc = 'MEDIUM - Standard JAMB difficulty';
    let temperature = 0.75;
    
    if (difficulty === 'hard') {
        difficultyDesc = 'HARD - Challenging question requiring deep understanding';
        temperature = 0.85;
    } else if (difficulty === 'easy') {
        difficultyDesc = 'EASY - Basic recall question';
        temperature = 0.65;
    }
    
    const prompt = `Generate ONE multiple-choice question for JAMB ${subject.name}.
Topic: ${specificTopic}
Difficulty: ${difficultyDesc}

Format as JSON:
{
    "question_text": "question here",
    "option_a": "option A",
    "option_b": "option B", 
    "option_c": "option C",
    "option_d": "option D",
    "correct_answer": "A/B/C/D",
    "explanation": "explanation here",
    "topic": "${specificTopic}",
    "difficulty": "${difficulty}"
}

Return ONLY the JSON object.`;

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
                max_tokens: 2048
            })
        });
        
        if (response.status === 429) {
            if (retryCount < 2) {
                await delay(2000);
                return generateSingleQuestion(subject, specificTopic, difficulty, groqApiKey, retryCount + 1);
            }
            throw new Error('Rate limited');
        }
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.choices[0].message.content;
        
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(generatedText);
        
    } catch (error) {
        console.log(`⚠️ Error for ${specificTopic}, using mock`);
        return {
            question_text: `${subject.name} - ${specificTopic} practice question: What is the correct answer?`,
            option_a: 'Option A (Correct)',
            option_b: 'Option B',
            option_c: 'Option C',
            option_d: 'Option D',
            correct_answer: 'A',
            explanation: `Practice question for ${subject.name} - ${specificTopic}.`,
            topic: specificTopic,
            difficulty: difficulty
        };
    }
}

// Generate questions in SAFE BATCHES (5 at a time in parallel)
async function generateQuestionsInBatches(subject, topicDistribution, difficulty, groqApiKey, batchSize = 5) {
    const allQuestions = [];
    
    // Collect all question requirements
    const requirements = [];
    for (const [specificTopic, count] of Object.entries(topicDistribution)) {
        for (let i = 0; i < count; i++) {
            requirements.push({ topic: specificTopic });
        }
    }
    
    console.log(`📊 Total questions to generate: ${requirements.length}`);
    
    // Process in batches
    for (let i = 0; i < requirements.length; i += batchSize) {
        const batch = requirements.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(requirements.length / batchSize);
        
        console.log(`📦 Batch ${batchNum}/${totalBatches}: Generating ${batch.length} questions in parallel...`);
        
        // Generate this batch in parallel
        const batchPromises = batch.map(req => 
            generateSingleQuestion(subject, req.topic, difficulty, groqApiKey)
        );
        
        const batchResults = await Promise.all(batchPromises);
        allQuestions.push(...batchResults);
        
        // Wait between batches to avoid rate limits
        if (i + batchSize < requirements.length) {
            console.log(`⏳ Waiting 2 seconds before next batch...`);
            await delay(2000);
        }
    }
    
    return allQuestions;
}

// Generate questions SEQUENTIALLY for practice mode
async function generateQuestionsSequential(subject, topic, count, difficulty, groqApiKey) {
    const questions = [];
    const specificTopic = topic || 'General';
    
    for (let i = 0; i < count; i++) {
        console.log(`   Generating question ${i + 1}/${count}`);
        const question = await generateSingleQuestion(subject, specificTopic, difficulty, groqApiKey);
        questions.push(question);
        if (i < count - 1) await delay(1000);
    }
    
    return questions;
}

// Main generate endpoint
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, topic, count = 10, difficulty = 'medium', examMode = false } = req.body;
        
        console.log(`\n📝 Generate request: subjectId=${subjectId}, count=${count}, examMode=${examMode}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const groqApiKey = process.env.GROQ_API_KEY;
        let questions = [];
        
        if (examMode && subject.topicDistribution) {
            // EXAM MODE: Generate according to topic distribution in BATCHES
            console.log(`📚 Exam Mode: Using topic distribution for ${subject.name}`);
            
            // Calculate how many questions per topic
            const totalRequired = Object.values(subject.topicDistribution).reduce((a, b) => a + b, 0);
            const multiplier = count / totalRequired;
            const topicDistribution = {};
            
            for (const [topicName, topicCount] of Object.entries(subject.topicDistribution)) {
                topicDistribution[topicName] = Math.round(topicCount * multiplier);
            }
            
            // Adjust to ensure exact count
            let sum = Object.values(topicDistribution).reduce((a, b) => a + b, 0);
            let diff = count - sum;
            if (diff !== 0) {
                const firstTopic = Object.keys(topicDistribution)[0];
                topicDistribution[firstTopic] += diff;
            }
            
            console.log('📊 Topic distribution:');
            for (const [topicName, topicCount] of Object.entries(topicDistribution)) {
                console.log(`   ${topicName}: ${topicCount} questions`);
            }
            
            if (groqApiKey) {
                // Generate in SAFE batches (5 at a time in parallel)
                questions = await generateQuestionsInBatches(subject, topicDistribution, difficulty, groqApiKey, 5);
            } else {
                // Fallback to mock questions
                for (const [specificTopic, topicCount] of Object.entries(topicDistribution)) {
                    for (let i = 0; i < topicCount; i++) {
                        questions.push({
                            question_text: `${subject.name} - ${specificTopic} practice question: What is the correct answer?`,
                            option_a: 'Option A (Correct)',
                            option_b: 'Option B',
                            option_c: 'Option C',
                            option_d: 'Option D',
                            correct_answer: 'A',
                            explanation: `Practice question for ${subject.name} - ${specificTopic}.`,
                            topic: specificTopic,
                            difficulty: difficulty
                        });
                    }
                }
            }
            
        } else {
            // PRACTICE MODE: Generate sequentially for a specific topic
            console.log(`📖 Practice Mode: Generating ${count} questions for topic: ${topic || 'General'}`);
            
            if (groqApiKey) {
                questions = await generateQuestionsSequential(subject, topic, count, difficulty, groqApiKey);
            } else {
                for (let i = 0; i < count; i++) {
                    questions.push({
                        question_text: `${subject.name} practice question ${i + 1}: What is the correct answer?`,
                        option_a: 'Option A (Correct)',
                        option_b: 'Option B',
                        option_c: 'Option C',
                        option_d: 'Option D',
                        correct_answer: 'A',
                        explanation: `Practice question for ${subject.name}.`,
                        topic: topic || 'General',
                        difficulty: difficulty
                    });
                }
            }
        }
        
        // Format questions
        const formattedQuestions = questions.slice(0, count).map((q, i) => ({
            id: `ai_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
            question_text: q.question_text || `Sample ${subject.name} question`,
            option_a: q.option_a || 'Option A',
            option_b: q.option_b || 'Option B',
            option_c: q.option_c || 'Option C',
            option_d: q.option_d || 'Option D',
            correct_answer: q.correct_answer || 'A',
            explanation: q.explanation || 'No explanation available',
            subject: subject.name,
            subject_id: subject.id,
            topic: q.topic || topic || 'General',
            difficulty: q.difficulty || difficulty,
            is_ai_generated: true
        }));
        
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
    res.json({ 
        status: groqApiKey ? 'GROQ_API_KEY is set' : 'GROQ_API_KEY not set',
        message: 'Safe batch-parallel generation (5 questions at a time)'
    });
});

module.exports = router;