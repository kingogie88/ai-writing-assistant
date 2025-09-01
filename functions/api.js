const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize AI clients
let openai = null;
let gemini = null;

// Initialize clients based on environment variables
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Input validation middleware
const validateTextInput = (body) => {
    const { text } = body;
    
    if (!text || typeof text !== 'string') {
        throw new Error('Text input is required and must be a string');
    }
    
    if (text.length > 10000) {
        throw new Error('Text too long. Maximum 10,000 characters allowed.');
    }
    
    return true;
};

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

// Main handler function
exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        
        // Route handling
        if (event.path.endsWith('/analyze') && event.httpMethod === 'POST') {
            // Validate input
            validateTextInput(body);
            
            const { text, provider = 'auto' } = body;
            
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

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    analysis,
                    provider: usedProvider
                })
            };
        }
        
        else if (event.path.endsWith('/providers') && event.httpMethod === 'GET') {
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
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    providers,
                    default: providers.length > 0 ? providers[0].id : null
                })
            };
        }
        
        else if (event.path.endsWith('/health') && event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Endpoint not found'
                })
            };
        }

    } catch (error) {
        console.error('Function error:', error);
        
        let statusCode = 500;
        let errorMessage = 'Internal server error';
        
        if (error.message.includes('Text input is required')) {
            statusCode = 400;
            errorMessage = error.message;
        } else if (error.message.includes('Text too long')) {
            statusCode = 400;
            errorMessage = error.message;
        } else if (error.message.includes('quota')) {
            statusCode = 429;
            errorMessage = 'API quota exceeded';
        } else if (error.message.includes('rate limit')) {
            statusCode = 429;
            errorMessage = 'Rate limit exceeded';
        } else if (error.message.includes('No AI providers available')) {
            statusCode = 503;
            errorMessage = 'AI service temporarily unavailable';
        }
        
        return {
            statusCode,
            headers,
            body: JSON.stringify({
                success: false,
                error: errorMessage
            })
        };
    }
};
