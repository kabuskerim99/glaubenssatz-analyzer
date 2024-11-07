const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

// Debug Middleware
app.use((req, res, next) => {
    console.log('\n--- New Request ---');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function analyzeText(problem) {
    console.log('Analyzing problem:', problem);
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "system",
            content: `Du bist ein erfahrener Psychologe und Experte für limitierende Glaubenssätze.
                   Analysiere das folgende Problem und identifiziere die 3 wichtigsten limitierenden 
                   Kernglaubenssätze, die dahinter stecken könnten. Formuliere sie in der Ich-Form.`
        }, {
            role: "user",
            content: problem
        }],
        temperature: 0.7,
        max_tokens: 500
    });
    return completion.choices[0].message.content;
}

app.post('/analyze', async (req, res) => {
    try {
        console.log('POST /analyze called');
        
        // Wenn es ein scenario_id gibt, ist es die Formular-Submission
        if (req.body.scenario_id) {
            console.log('Form submission detected');
            const problem = req.body.attributes?.PROBLEM;
            
            if (!problem) {
                console.log('No problem found in form submission');
                return res.status(200).json({ status: 'ok' });
            }

            const beliefs = await analyzeText(problem);
            console.log('Generated beliefs:', beliefs);
            
            return res.json({
                attributes: {
                    BELIEFS: beliefs
                }
            });
        }
        
        // Für alle anderen Anfragen OK zurückgeben
        return res.status(200).json({ status: 'ok' });
        
    } catch (error) {
        console.error('Error in /analyze:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    console.log('- OpenAI Key present:', !!process.env.OPENAI_API_KEY);
});
