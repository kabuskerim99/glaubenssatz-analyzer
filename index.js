const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateBeliefs(problem) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
            role: "system",
            content: `Du bist ein erfahrener Psychologe und Experte für limitierende Glaubenssätze.
                   Analysiere das folgende Problem und identifiziere die 3 wichtigsten limitierenden 
                   Kernglaubenssätze, die dahinter stecken könnten. Formuliere sie in der Ich-Form. Identifiziere dann die 3 wichtigsten limitierenden Kernglaubenssätze, die verhindern könnten, dass die vorherigen Kernglaubenssätze losgelassen werden könnten. Identifiziere dann die secondary benefits dieser. Liste alle Glaubenssätze auf, ohne Erklärung und Beschreibung.`
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
        console.log('POST /analyze called with body:', JSON.stringify(req.body, null, 2));

        let problem = null;

        // Fall 1: Formular-Submission
        if (req.body.scenario_id) {
            problem = req.body.attributes?.PROBLEM;
            console.log('Form submission detected, problem:', problem);
        }
        // Fall 2: Contact Update Event
        else if (req.body.event === 'contact_updated' && req.body.content?.[0]?.attributes?.PROBLEM) {
            problem = req.body.content[0].attributes.PROBLEM;
            console.log('Contact update detected, problem:', problem);
        }

        if (problem) {
            console.log('Generating beliefs for problem:', problem);
            const beliefs = await generateBeliefs(problem);
            console.log('Generated beliefs:', beliefs);

            return res.json({
                BELIEFS: beliefs,
                attributes: {
                    BELIEFS: beliefs
                }
            });
        }

        // Wenn kein Problem gefunden wurde, senden wir trotzdem eine erfolgreiche Antwort
        console.log('No problem found in request, sending OK response');
        return res.json({ status: 'ok' });

    } catch (error) {
        console.error('Error in /analyze:', error);
        return res.status(500).json({ 
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
