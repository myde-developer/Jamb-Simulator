// server/routes/flashcards.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Generate flashcards using Gemini AI
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { subject, topic, count = 20 } = req.body;
        
        if (!subject) {
            return res.status(400).json({ error: 'Subject is required' });
        }
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('❌ GEMINI_API_KEY not set in environment variables');
            return res.status(500).json({ error: 'AI service not configured' });
        }
        
        // Build the prompt
        let prompt = `Generate ${count} high-quality flashcards for the JAMB (Joint Admissions and Matriculation Board) ${subject} exam.`;
        
        if (topic && topic !== 'Select Topic') {
            prompt += ` Focus specifically on the topic: ${topic}.`;
        } else {
            prompt += ` Cover key concepts, formulas, definitions, and important facts that frequently appear in JAMB exams.`;
        }
        
        prompt += `

Each flashcard must be in this EXACT JSON format:
{
    "front": "The question or concept prompt",
    "back": "The complete answer followed by a brief explanation (2-3 sentences)"
}

IMPORTANT RULES:
- Front should be a clear question, fill-in-the-blank, or "Define/Explain/State" prompt
- Back should give the FULL answer first, THEN a short explanation
- Focus on high-yield, exam-relevant content
- DO NOT include multiple choice options (no A, B, C, D)
- Make answers concise but complete
- Include formulas, definitions, key dates, important names where relevant
- Difficulty should be appropriate for JAMB level (senior secondary)

Return ONLY a valid JSON array of ${count} flashcards. No extra text, no markdown formatting, no explanation before or after the array.

Example format:
[
    {
        "front": "What is the function of the mitochondria?",
        "back": "The mitochondria produces energy (ATP) for the cell through cellular respiration. It is often called the 'powerhouse of the cell' because it converts glucose and oxygen into usable energy."
    },
    {
        "front": "State Newton's Second Law of Motion.",
        "back": "Newton's Second Law states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass (F = ma). This means heavier objects require more force to achieve the same acceleration."
    }
]

Generate ${count} flashcards now. Return ONLY the JSON array.`;

        console.log(`📚 Generating ${count} flashcards for ${subject}${topic ? ` - ${topic}` : ''}`);
        
        // Call Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API error:', response.status, errorText);
            throw new Error(`Gemini API returned ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }
        
        // Extract JSON array from response
        let flashcards = [];
        try {
            // Try to find JSON array in the response
            const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                flashcards = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: try parsing entire response
                flashcards = JSON.parse(generatedText);
            }
        } catch (parseError) {
            console.error('❌ Failed to parse Gemini response:', generatedText);
            throw new Error('Invalid response format from AI');
        }
        
        // Validate and limit count
        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error('No flashcards generated');
        }
        
        // Ensure each flashcard has front and back
        flashcards = flashcards.slice(0, count).map(card => ({
            front: card.front || card.question || 'No question provided',
            back: card.back || card.answer || card.explanation || 'No answer provided'
        }));
        
        console.log(`✅ Successfully generated ${flashcards.length} flashcards`);
        
        res.json({
            success: true,
            count: flashcards.length,
            flashcards: flashcards
        });
        
    } catch (error) {
        console.error('❌ Error generating flashcards:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate flashcards',
            details: error.message 
        });
    }
});

// Test endpoint to verify API key is working
router.get('/test', authenticateToken, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.json({ 
            status: 'error', 
            message: 'GEMINI_API_KEY not set in environment variables' 
        });
    }
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        res.json({
            status: 'ok',
            message: 'Gemini API key is valid',
            models: data.models?.slice(0, 3) || []
        });
    } catch (error) {
        res.json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;