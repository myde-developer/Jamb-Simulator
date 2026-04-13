// server/routes/ai-questions.js
const express = require('express');
const router = express.Router();
const { allSubjects } = require('../data/all-subjects');

// Middleware to verify JWT token
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
    const subjects = Object.values(allSubjects).map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        category: subject.category,
        hasDiagrams: subject.hasDiagrams,
        totalQuestions: subject.totalQuestions
    }));
    res.json({ subjects });
});

// Get subject details including distribution
router.get('/subject/:subjectId', authenticateToken, (req, res) => {
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
        hasDiagrams: subject.hasDiagrams,
        minDiagramQuestions: subject.minDiagramQuestions || 0,
        topicDistribution: subject.topicDistribution || null,
        topics: subject.topics
    });
});

// Get topics for a subject
router.get('/topics/:subjectId', authenticateToken, (req, res) => {
    const subjectId = parseInt(req.params.subjectId);
    const subject = allSubjects[subjectId];
    
    if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json({ 
        subjectId: subject.id,
        subjectName: subject.name,
        topics: subject.topics,
        hasDiagrams: subject.hasDiagrams
    });
});

// Generate questions using Gemini AI
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subjectId, topic, count = 10, difficulty = 'medium', includeDiagrams = false, forceDiagrams = false } = req.body;
        
        const subject = allSubjects[parseInt(subjectId)];
        if (!subject) {
            return res.status(400).json({ error: 'Invalid subject' });
        }
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'AI service not configured' });
        }
        
        const needsDiagrams = (includeDiagrams || forceDiagrams) && subject.hasDiagrams;
        const minDiagrams = subject.minDiagramQuestions || 0;
        
        let prompt = `Generate ${count} high-quality multiple-choice practice questions for the JAMB UTME ${subject.name} exam.`;
        
        if (topic && topic !== 'all' && topic !== 'Select Topic') {
            prompt += ` Focus specifically on the topic: ${topic}.`;
        } else {
            prompt += ` Cover key concepts from the ${subject.name} syllabus.`;
        }
        
        if (difficulty && difficulty !== 'all') {
            prompt += ` Difficulty level: ${difficulty}.`;
        }
        
        if (needsDiagrams && minDiagrams > 0) {
            prompt += `\n\nIMPORTANT: At least ${minDiagrams} of these questions MUST include diagrams. For diagram questions, include a "diagram_prompt" field.`;
        }
        
        prompt += `

Each question must be in this EXACT JSON format:
{
    "question_text": "The question text",
    ${needsDiagrams ? '"diagram_prompt": "Description for generating the diagram",' : ''}
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "A/B/C/D",
    "explanation": "Detailed explanation of why this is correct (2-3 sentences)",
    "topic": "${topic || 'General'}",
    "difficulty": "${difficulty}"
}

CRITICAL FORMAT RULES:
- Use "question_text" for the question
- Use "option_a", "option_b", "option_c", "option_d" as separate fields
- Use "correct_answer" as a single letter (A, B, C, or D)
- All fields are required

Example:
{
    "question_text": "What is the capital of Nigeria?",
    "option_a": "Lagos",
    "option_b": "Abuja",
    "option_c": "Kano",
    "option_d": "Ibadan",
    "correct_answer": "B",
    "explanation": "Abuja became the capital of Nigeria in 1991, replacing Lagos.",
    "topic": "Geography",
    "difficulty": "easy"
}

Generate ${count} questions now. Return ONLY the JSON array. No extra text, no markdown.`;

        console.log(`🤖 Generating ${count} AI questions for ${subject.name} - Topic: ${topic || 'All Topics'}`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API returned ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }
        
        let questions = [];
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0]);
        } else {
            questions = JSON.parse(generatedText);
        }
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('No questions generated');
        }
        
        const formattedQuestions = [];
        
        for (let i = 0; i < Math.min(questions.length, count); i++) {
            const q = questions[i];
            
            const formattedQ = {
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
                diagram_prompt: q.diagram_prompt || null,
                diagram_url: null,
                is_ai_generated: true
            };
            
            formattedQuestions.push(formattedQ);
        }
        
        if (needsDiagrams) {
            for (let i = 0; i < formattedQuestions.length; i++) {
                if (formattedQuestions[i].diagram_prompt) {
                    const diagramUrl = await generateDiagram(formattedQuestions[i].diagram_prompt, apiKey);
                    if (diagramUrl) {
                        formattedQuestions[i].diagram_url = diagramUrl;
                    }
                }
            }
        }
        
        console.log(`✅ Generated ${formattedQuestions.length} questions for ${subject.name}`);
        
        res.json({ 
            success: true, 
            count: formattedQuestions.length, 
            questions: formattedQuestions 
        });
        
    } catch (error) {
        console.error('❌ AI generation error:', error.message);
        res.status(500).json({ error: 'Failed to generate questions', details: error.message });
    }
});

async function generateDiagram(prompt, apiKey) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Create a clear, educational diagram: ${prompt}. 
                        Style: Clean black and white line drawing suitable for exam questions.
                        Include all labels and measurements as specified.
                        Resolution: 4K, Aspect ratio: 16:9, Format: PNG.
                        Make it professional and exam-appropriate.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    responseModalities: ["TEXT", "IMAGE"]
                }
            })
        });
        
        const data = await response.json();
        const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        
        if (imagePart && imagePart.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
        return null;
        
    } catch (error) {
        console.error('Diagram generation error:', error.message);
        return null;
    }
}

module.exports = router;