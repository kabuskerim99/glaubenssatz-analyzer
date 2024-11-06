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
    const { problem } = req.body;
    
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
    
    res.json({
      beliefs: beliefs
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
