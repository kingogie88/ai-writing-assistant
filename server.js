const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Environment validation
if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.error('ERROR: At least one API key (OPENAI_API_KEY or GEMINI_API_KEY) must be set!');
    process.exit(1);
}

// Initialize AI clients
let openai = null;
let gemini = null;

if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized');
}

if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini client initialized');
}

// Input validation middleware
const validateTextInput = (req, res, next) => {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
            error: 'Text input is required and must be a string' 
        });
    }
    
    if (text.length > 10000) {
        return res.status(400).json({ 
            error: 'Text too long. Maximum 10,000 characters allowed.' 
        });
    }
    
    next();
};

// API Routes
app.post('/api/analyze', validateTextInput, async (req, res) => {
    try {
        const { text, provider = 'auto' } = req.body;
        
        const prompt = `Please analyze the following text and provide feedback in the exact JSON format below:

Text to analyze: "${text}"

Please respond with a JSON object containing:
{
    "grammar": {
        "score": "number from 1-10",
        "issues": ["list of grammar issues found"],
        "suggestions": ["list of grammar improvement suggestions"]
    },
    "style": {
        "score": "number from 1-10",
        "tone": "description of the writing tone",
        "clarity": "assessment of clarity and readability",
        "suggestions": ["list of style improvement suggestions"]
    },
    "content": {
        "strengths": ["list of content strengths"],
        "weaknesses": ["list of content areas for improvement"],
        "suggestions": ["list of content improvement suggestions"]
    },
    "improved_version": "complete improved version of the text"
}`;

        let analysis;
        let usedProvider;

        // Determine which provider to use
        if (provider === 'openai' && openai) {
            usedProvider = 'openai';
            analysis = await analyzeWithOpenAI(prompt);
        } else if (provider === 'gemini' && gemini) {
            usedProvider = 'gemini';
            analysis = await analyzeWithGemini(prompt);
        } else {
            // Auto-select based on availability
            if (openai && gemini) {
                // Try OpenAI first, fallback to Gemini
                try {
                    usedProvider = 'openai';
                    analysis = await analyzeWithOpenAI(prompt);
                } catch (error) {
                    console.log('OpenAI failed, trying Gemini...');
                    usedProvider = 'gemini';
                    analysis = await analyzeWithGemini(prompt);
                }
            } else if (openai) {
                usedProvider = 'openai';
                analysis = await analyzeWithOpenAI(prompt);
            } else if (gemini) {
                usedProvider = 'gemini';
                analysis = await analyzeWithGemini(prompt);
            } else {
                throw new Error('No AI providers available');
            }
        }

        res.json({ 
            success: true, 
            analysis,
            provider: usedProvider
        });

    } catch (error) {
        console.error('Analysis error:', error);
        
        let statusCode = 500;
        let errorMessage = 'Internal server error';
        
        if (error.message.includes('quota')) {
            statusCode = 429;
            errorMessage = 'API quota exceeded';
        } else if (error.message.includes('rate limit')) {
            statusCode = 429;
            errorMessage = 'Rate limit exceeded';
        } else if (error.message.includes('No AI providers available')) {
            statusCode = 503;
            errorMessage = 'AI service temporarily unavailable';
        }
        
        res.status(statusCode).json({ 
            success: false, 
            error: errorMessage
        });
    }
});

// OpenAI analysis function
async function analyzeWithOpenAI(prompt) {
    if (!openai) {
        throw new Error('OpenAI client not available');
    }

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are an expert writing assistant that provides detailed analysis and suggestions for improving text. Always respond in the exact JSON format requested.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 1500,
        temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
        throw new Error('No response content received from OpenAI');
    }

    try {
        return JSON.parse(content);
    } catch (parseError) {
        throw new Error('Invalid response format from OpenAI');
    }
}

// Gemini analysis function
async function analyzeWithGemini(prompt) {
    if (!gemini) {
        throw new Error('Gemini client not available');
    }

    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
        throw new Error('No response content received from Gemini');
    }

    try {
        return JSON.parse(content);
    } catch (parseError) {
        throw new Error('Invalid response format from Gemini');
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString()
    });
});

// Get available AI providers
app.get('/api/providers', (req, res) => {
    const providers = [];
    
    if (openai) {
        providers.push({
            id: 'openai',
            name: 'OpenAI GPT',
            model: 'gpt-3.5-turbo',
            available: true
        });
    }
    
    if (gemini) {
        providers.push({
            id: 'gemini',
            name: 'Google Gemini',
            model: 'gemini-pro',
            available: true
        });
    }
    
    res.json({
        success: true,
        providers,
        default: providers.length > 0 ? providers[0].id : null
    });
});

app.listen(PORT, () => {
    console.log(`🚀 AI Writing Assistant server running on port ${PORT}`);
    console.log(`🔒 Security: Rate limiting, CORS, and input validation enabled`);
});
