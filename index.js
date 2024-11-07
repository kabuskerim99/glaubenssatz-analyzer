const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/analyze', async (req, res) => {
    try {
        console.log('Request received:', JSON.stringify(req.body, null, 2));
        
        // Test-Antwort im Brevo-Format
        const response = {
            code: "success",
            message: "Contact attributes updated",
            data: {
                BELIEFS: "TEST BELIEF 1\nTEST BELIEF 2\nTEST BELIEF 3"
            }
        };
        
        console.log('Sending response:', JSON.stringify(response, null, 2));
        res.json(response);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            code: "error",
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});
