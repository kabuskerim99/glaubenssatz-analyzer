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
        
        // Wenn es ein scenario_id gibt, ist es die Formular-Submission
        if (req.body.scenario_id) {
            const problem = req.body.attributes?.PROBLEM;
            console.log('Analyzing problem:', problem);
            
            if (!problem) {
                return res.status(200).json({ BELIEFS: 'Kein Problem gefunden' });
            }

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
            console.log('Generated beliefs:', beliefs);
            
            // Direktere Response-Format
            return res.json({
                BELIEFS: beliefs,
                status: 'success'
            });
        }
        
        // Für alle anderen Anfragen OK zurückgeben
        return res.status(200).json({ status: 'ok' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
