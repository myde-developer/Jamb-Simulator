// server/routes/ai-questions.js - WITH TOPIC DISTRIBUTION
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

// Get topic distribution for a subject
function getTopicDistribution(subjectId, totalCount) {
    const subject = allSubjects[subjectId];
    if (!subject || !subject.topicDistribution) {
        return null;
    }
    
    const distribution = subject.topicDistribution;
    const topics = Object.keys(distribution);
    const totalRequired = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    // Calculate how many questions per topic based on totalCount
    const multiplier = totalCount / totalRequired;
    const topicCounts = {};
    
    for (const [topic, count] of Object.entries(distribution)) {
        topicCounts[topic] = Math.round(count * multiplier);
    }
    
    // Adjust to ensure total matches exactly
    let sum = Object.values(topicCounts).reduce((a, b) => a + b, 0);
    let diff = totalCount - sum;
    
    if (diff !== 0) {
        const firstTopic = Object.keys(topicCounts)[0];
        topicCounts[firstTopic] += diff;
    }
    
    console.log(`📊 Topic distribution for ${subject.name} (${totalCount} questions):`);
    for (const [topic, count] of Object.entries(topicCounts)) {
        console.log(`   ${topic}: ${count} questions`);
    }
    
    return topicCounts;
}

// Generate ONE question for a specific topic
async function generateSingleQuestion(subject, specificTopic, difficulty, groqApiKey, questionNumber, totalForTopic) {
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

Return ONLY the JSON object, no extra text.`;

    let retries = 2;
    
    while (retries > 0) {
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
                console.log(`   ⏳ Rate limited, waiting 3 seconds...`);
                await delay(3000);
                retries--;
                continue;
            }
            
            if (!response.ok) {
                console.log(`   ⚠️ API error ${response.status}, retrying...`);
                retries--;
                await delay(2000);
                continue;
            }
            
            const data = await response.json();
            const generatedText = data.choices[0].message.content;
            
            let question;
            try {
                const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    question = JSON.parse(jsonMatch[0]);
                } else {
                    question = JSON.parse(generatedText);
                }
            } catch (parseError) {
                console.log(`   ⚠️ Parse error, retrying...`);
                retries--;
                await delay(2000);
                continue;
            }
            
            if (question && question.question_text) {
                return question;
            }
            
            retries--;
            
        } catch (error) {
            console.error(`   ❌ Error:`, error.message);
            retries--;
            if (retries > 0) await delay(2000);
        }
    }
    
    // Return mock question if all retries fail
    console.log(`   ⚠️ Using mock question`);
    return {
        question_text: `${subject.name} - ${specificTopic} practice question: What is the correct answer?`,
        option_a: 'Option A (Correct)',
        option_b: 'Option B',
        option_c: 'Option C',
        option_d: 'Option D',
        correct_answer: 'A',
        explanation: `This is a practice question for ${subject.name} - ${specificTopic}. The correct answer is A.`,
        topic: specificTopic,
        difficulty: difficulty
    };
}

// Generate questions ACCORDING TO TOPIC DISTRIBUTION
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, topic, count = 10, difficulty = 'medium', examMode = false } = req.body;
        
        console.log(`\n📝 Generate ${count} questions for subject ${subjectId}`);
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const groqApiKey = process.env.GROQ_API_KEY;
        const allQuestions = [];
        
        // If a specific topic is requested (practice mode)
        if (topic && topic !== 'all' && topic !== 'Select Topic') {
            console.log(`🎯 Practice Mode: Generating ${count} questions for topic: ${topic}`);
            
            for (let i = 0; i < count; i++) {
                console.log(`   Generating question ${i + 1}/${count} for topic: ${topic}`);
                
                let question;
                if (groqApiKey) {
                    question = await generateSingleQuestion(subject, topic, difficulty, groqApiKey, i + 1, count);
                } else {
                    question = {
                        question_text: `${subject.name} - ${topic} practice question ${i + 1}: What is the correct answer?`,
                        option_a: 'Option A (Correct)',
                        option_b: 'Option B',
                        option_c: 'Option C',
                        option_d: 'Option D',
                        correct_answer: 'A',
                        explanation: `Practice question for ${subject.name} - ${topic}.`,
                        topic: topic,
                        difficulty: difficulty
                    };
                }
                
                allQuestions.push(question);
                
                if (i < count - 1) {
                    await delay(2000);
                }
            }
        } 
        // Exam mode: follow topic distribution
        else if (examMode) {
            console.log(`📚 Exam Mode: Using topic distribution for ${subject.name}`);
            const topicDistribution = getTopicDistribution(parseInt(subjectId), count);
            
            if (!topicDistribution) {
                console.log(`⚠️ No topic distribution found, using general generation`);
                // Fallback to general generation
                for (let i = 0; i < count; i++) {
                    let question;
                    if (groqApiKey) {
                        question = await generateSingleQuestion(subject, 'General', difficulty, groqApiKey, i + 1, count);
                    } else {
                        question = {
                            question_text: `${subject.name} practice question ${i + 1}: What is the correct answer?`,
                            option_a: 'Option A (Correct)',
                            option_b: 'Option B',
                            option_c: 'Option C',
                            option_d: 'Option D',
                            correct_answer: 'A',
                            explanation: `Practice question for ${subject.name}.`,
                            topic: 'General',
                            difficulty: difficulty
                        };
                    }
                    allQuestions.push(question);
                    if (i < count - 1) await delay(2000);
                }
            } else {
                // Generate questions per topic according to distribution
                let questionCounter = 0;
                
                for (const [specificTopic, topicCount] of Object.entries(topicDistribution)) {
                    if (topicCount > 0) {
                        console.log(`\n📖 Generating ${topicCount} question(s) for topic: ${specificTopic}`);
                        
                        for (let i = 0; i < topicCount; i++) {
                            questionCounter++;
                            console.log(`   Question ${questionCounter}/${count} - ${specificTopic} (${i + 1}/${topicCount})`);
                            
                            let question;
                            if (groqApiKey) {
                                question = await generateSingleQuestion(subject, specificTopic, difficulty, groqApiKey, questionCounter, topicCount);
                            } else {
                                question = {
                                    question_text: `${subject.name} - ${specificTopic} question: What is the correct answer?`,
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
                            
                            allQuestions.push(question);
                            
                            if (questionCounter < count) {
                                await delay(2000);
                            }
                        }
                    }
                }
            }
        } 
        // Default: general generation
        else {
            console.log(`📖 General Mode: Generating ${count} questions`);
            
            for (let i = 0; i < count; i++) {
                console.log(`   Generating question ${i + 1}/${count}`);
                
                let question;
                if (groqApiKey) {
                    question = await generateSingleQuestion(subject, 'General', difficulty, groqApiKey, i + 1, count);
                } else {
                    question = {
                        question_text: `${subject.name} practice question ${i + 1}: What is the correct answer?`,
                        option_a: 'Option A (Correct)',
                        option_b: 'Option B',
                        option_c: 'Option C',
                        option_d: 'Option D',
                        correct_answer: 'A',
                        explanation: `Practice question for ${subject.name}.`,
                        topic: 'General',
                        difficulty: difficulty
                    };
                }
                
                allQuestions.push(question);
                
                if (i < count - 1) {
                    await delay(2000);
                }
            }
        }
        
        // Format questions
        const formattedQuestions = allQuestions.map((q, i) => ({
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
        
        console.log(`\n✅ Successfully generated ${formattedQuestions.length} questions for ${subject.name}`);
        
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
        message: 'Generating questions according to topic distribution'
    });
});

module.exports = router;