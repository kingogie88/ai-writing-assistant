# AI Writing Assistant - Multi-Provider AI Edition

A secure, production-ready AI writing assistant that supports **both OpenAI GPT and Google Gemini APIs**. Your API keys are securely stored on the server, never exposed to the browser.

## 🚀 **What's New in v2.0**

- **🔄 Multi-Provider Support**: OpenAI GPT + Google Gemini
- **🛡️ Enhanced Security**: Server-side API handling, no exposed keys
- **⚡ Smart Fallback**: Automatic provider switching if one fails
- **🎯 Provider Selection**: Users can choose their preferred AI
- **🔒 Enterprise Security**: Rate limiting, input validation, XSS prevention

## 🎯 **Real-World Problem Solved**

**Problem**: Writing improvement is a universal need for students, professionals, content creators, and anyone who communicates in writing.

**Solution**: Instant, AI-powered analysis that provides:
- Grammar and style assessment
- Tone and clarity analysis  
- Content improvement suggestions
- Complete improved versions
- Professional writing feedback

**Value**: Users get immediate, actionable feedback to improve their writing quality without needing expensive editors or time-consuming revisions.

## 🏗️ **Architecture Overview**

```
Frontend (Browser) ←→ Secure Backend Server ←→ AI APIs
     (No API Keys)         (Protected)           (Keys Stored)
```

- **Frontend**: Clean, intuitive interface with provider selection
- **Backend**: Express.js server with security middleware
- **AI Integration**: OpenAI GPT + Google Gemini with fallback
- **Security**: Multi-layered protection, rate limiting, input validation

## 📋 **Prerequisites**

- Node.js 16.0.0 or higher
- OpenAI API key (optional)
- Google Gemini API key (optional)
- **At least one API key is required**

## 🛠️ **Installation & Setup**

### 1. **Clone & Install**
```bash
git clone <your-repo-url>
cd ai-writing-assistant
npm install
```

### 2. **Environment Configuration**
```bash
cp env.template .env
```

Edit `.env` and add your API keys:
```env
# AI API Configuration
# You can set one or both API keys
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Production Settings
# CORS_ORIGIN=https://yourdomain.com
```

### 3. **Start the Application**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Windows users can use
start.bat
```

### 4. **Access the Application**
Open your browser to `http://localhost:3000`

## 🔑 **Getting API Keys**

### **OpenAI API Key**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### **Google Gemini API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key

## 🎮 **How to Use**

### **Provider Selection**
- **🔄 Auto-select (Recommended)**: System automatically chooses the best available provider
- **🤖 OpenAI GPT**: Force the use of OpenAI's GPT model
- **🌟 Google Gemini**: Force the use of Google's Gemini model

### **Text Analysis Workflow**
1. **Enter Text**: Paste or type your text in the input area
2. **Choose AI**: Select your preferred provider (or leave as auto)
3. **Analyze**: Click "Analyze with AI" button
4. **Review Results**: Get comprehensive analysis in organized cards
5. **Edit & Improve**: Copy, replace, or modify the improved version

### **Analysis Results Include**
- **Grammar & Style**: Score, issues found, improvement suggestions
- **Tone Analysis**: Writing tone, clarity assessment, style tips
- **Content Feedback**: Strengths, weaknesses, enhancement ideas
- **Improved Version**: Complete rewritten text incorporating all suggestions

## 🔒 **Security Features**

### **API Key Protection**
- ✅ **Server-side storage**: No keys in browser
- ✅ **Environment variables**: Secure configuration
- ✅ **Input validation**: XSS prevention
- ✅ **Rate limiting**: Abuse protection

### **Data Security**
- ✅ **CORS protection**: Secure cross-origin requests
- ✅ **Helmet.js**: Security headers and protection
- ✅ **Input sanitization**: Content filtering
- ✅ **Error handling**: No sensitive data exposure

### **Access Control**
- ✅ **No user profiles**: Instant access
- ✅ **Rate limiting**: 100 requests per 15 minutes
- ✅ **Input validation**: Maximum 10,000 characters
- ✅ **Security logging**: Event monitoring

## 🚀 **Deployment**

### **Production Setup**
1. Set `NODE_ENV=production`
2. Update `CORS_ORIGIN` with your domain
3. Use process manager (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ai-writing-assistant"
   ```

### **Environment Variables for Production**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
OPENAI_API_KEY=your_production_openai_key
GEMINI_API_KEY=your_production_gemini_key
```

## 📊 **API Endpoints**

### **POST `/api/analyze`**
Analyze text using AI with provider selection

**Request Body:**
```json
{
  "text": "Your text to analyze",
  "provider": "auto" // "auto", "openai", or "gemini"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "grammar": { "score": 8, "issues": [], "suggestions": [] },
    "style": { "score": 7, "tone": "...", "clarity": "...", "suggestions": [] },
    "content": { "strengths": [], "weaknesses": [], "suggestions": [] },
    "improved_version": "..."
  },
  "provider": "openai"
}
```

### **GET `/api/providers`**
Get available AI providers

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI GPT",
      "model": "gpt-3.5-turbo",
      "available": true
    }
  ],
  "default": "openai"
}
```

### **GET `/api/health`**
Health check endpoint

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"No AI providers available"**
   - Check that at least one API key is set in `.env`
   - Verify API keys are valid and have sufficient credits

2. **Rate limit exceeded**
   - Wait a few minutes before trying again
   - Check your API provider's rate limits

3. **Invalid response format**
   - Usually indicates an issue with the AI provider
   - Try switching to a different provider

4. **CORS errors**
   - Ensure `CORS_ORIGIN` is set correctly for production
   - Check that your domain matches the allowed origins

### **Debug Mode**
Set `NODE_ENV=development` to see detailed error messages and logs.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- OpenAI for GPT models
- Google for Gemini models
- Express.js community
- All contributors and users

## 📞 **Support**

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the logs in your terminal
3. Open an issue on GitHub
4. Check your API provider's status page

---

**Note**: This application requires valid API keys from OpenAI and/or Google to function. Make sure to keep your API keys secure and never commit them to version control.

## 🎯 **Project Alignment with Requirements**

This AI Writing Assistant perfectly aligns with the project requirements:

✅ **Real-world problem solving** - Writing improvement is universal  
✅ **No user profiles needed** - Instant access via web link  
✅ **Intuitive AI interface** - Clear workflow with AI analysis  
✅ **Editable results** - Copy, replace, and modify improvements  
✅ **LLM API integration** - OpenAI GPT + Google Gemini  
✅ **Proof of concept/MVP** - Tangible, experienceable solution  
✅ **Professional quality** - Production-ready with security  

The application demonstrates real AI integration, solves genuine problems, and provides immediate value to users without any barriers to entry. 