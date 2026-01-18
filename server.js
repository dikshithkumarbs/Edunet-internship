const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for simplicity in this demo, enable for production
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini AI Proxy
app.post('/api/generate-content', async (req, res) => {
    try {
        const { prompt, model } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API Key not configured on server' });
        }

        const aiModel = model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        // Extract text safely
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        res.json({ text: generatedText });

    } catch (error) {
        console.error('Gemini Proxy Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Hugging Face Proxy
app.post('/api/huggingface', async (req, res) => {
    try {
        const { inputs, model, parameters } = req.body;

        if (!process.env.HF_API_KEY) {
            return res.status(500).json({ error: 'Hugging Face API Key not configured on server' });
        }

        const hfModel = model || 'google/flan-t5-base';
        const url = `https://api-inference.huggingface.co/models/${hfModel}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs, parameters })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HF API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('HF Proxy Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Serve Index
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔒 API Keys secured on server.`);
    console.log(`📝 Ready to build resumes!\n`);
});
