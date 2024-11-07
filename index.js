const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

// Debug Middleware
app.use((req, res, next) => {
    console.log('Incoming request:');
    console.log('- URL:', req.url);
    console.log('- Method:', req.method);
    console.log('- Body:', req.body);
    next();
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/analyze', async (req, res) => {
    try {
        console.log('Analyze endpoint called');
        
        // Extrahiere das Problem aus dem Body
        const problem = req.body.attributes?.PROBLEM;
        
        console.log('Problem received:', problem);
        
        if (!problem) {
            console.log('No problem provided');
            return res.status(400).json({ error: 'Kein Problem übermittelt' });
        }

        console.log('Calling OpenAI...');
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

        const beliefs = completion.choices[0].message.content;
        console.log('Analysis result:', beliefs);
        
        res.json({
            attributes: {
                BELIEFS: beliefs
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    console.log('- OpenAI Key present:', !!process.env.OPENAI_API_KEY);
});
