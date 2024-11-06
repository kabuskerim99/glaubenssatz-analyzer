const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Angepasst für Brevo's einfachen Webhook-Aufruf
app.get('/analyze', async (req, res) => {
  try {
    // Holt das Problem aus den URL-Parametern
    const problem = req.query.PROBLEM;
    
    if (!problem) {
      return res.status(400).json({ error: 'Kein Problem übermittelt' });
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
    
    // Speichert die Analyse als Kontakteigenschaft
    res.json({
      attributes: {
        BELIEFS: beliefs
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
