const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/analyze', async (req, res) => {
    try {
        console.log('POST /analyze called');
        
        let problem = null;
        
        // Extract problem from various possible locations
        if (req.body.attributes?.PROBLEM) {
            problem = req.body.attributes.PROBLEM;
        } else if (req.body.content?.[0]?.attributes?.PROBLEM) {
            problem = req.body.content[0].attributes.PROBLEM;
        }

        if (!problem) {
            console.log('No problem found');
            return res.json({ update: { BELIEFS: "Kein Problem gefunden" }});
        }

        console.log('Analyzing problem:', problem);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: `Analysiere das folgende Problem und gib exakt 3 limitierende Glaubenssätze zurück.
                         Format: "1. [Glaubenssatz 1]\n2. [Glaubenssatz 2]\n3. [Glaubenssatz 3]"`
            }, {
                role: "user",
                content: problem
            }],
            temperature: 0.7,
            max_tokens: 500
        });

        const beliefs = completion.choices[0].message.content;
        console.log('Generated beliefs:', beliefs);

        // Simplified response format
        return res.json({
            update: {
                BELIEFS: beliefs
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
