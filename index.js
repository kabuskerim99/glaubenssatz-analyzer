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
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
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
        
        // Versuche das Problem aus verschiedenen möglichen Stellen zu extrahieren
        let problem = null;
        
        if (req.body.attributes?.PROBLEM) {
            problem = req.body.attributes.PROBLEM;
            console.log('Found problem in body.attributes');
        } else if (req.body.content?.[0]?.attributes?.PROBLEM) {
            problem = req.body.content[0].attributes.PROBLEM;
            console.log('Found problem in content[0].attributes');
        } else if (req.query.PROBLEM) {
            problem = req.query.PROBLEM;
            console.log('Found problem in query');
        }
        
        console.log('Extracted problem:', problem);
        
        if (!problem) {
            console.log('No problem found in request');
            return res.status(200).json({ status: 'No problem provided' });
        }

        const beliefs = await analyzeText(problem);
        console.log('Generated beliefs:', beliefs);
        
        res.json({
            attributes: {
                BELIEFS: beliefs
            }
        });
        
    } catch (error) {
        console.error('Error in /analyze:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message,
            stack: error.stack 
        });
    }
});

// Zusätzlicher GET endpoint für den gleichen Pfad
app.get('/analyze', async (req, res) => {
    try {
        console.log('GET /analyze called');
        const problem = req.query.PROBLEM;
        
        if (!problem) {
            return res.status(200).json({ status: 'No problem provided' });
        }

        const beliefs = await analyzeText(problem);
        console.log('Generated beliefs:', beliefs);
        
        res.json({
            attributes: {
                BELIEFS: beliefs
            }
        });
        
    } catch (error) {
        console.error('Error in GET /analyze:', error);
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
    console.log('- OpenAI Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 7));
});
