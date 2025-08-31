# AI Writing Assistant Setup Guide - Multi-Provider Edition

## 🚀 **Quick Start**

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
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
   ```

3. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   
   # Windows users
   start.bat
   ```

4. **Open browser to** `http://localhost:3000`

## ✨ **New Features in v2.0**

- 🔄 **Multi-Provider AI**: OpenAI GPT + Google Gemini
- 🛡️ **Enhanced Security**: Server-side API handling
- ⚡ **Smart Fallback**: Automatic provider switching
- 🎯 **Provider Selection**: Choose your preferred AI
- 🔒 **Enterprise Security**: Rate limiting, input validation

## 🎯 **What This Solves**

**Real-world problem**: Writing improvement is needed by everyone - students, professionals, content creators.

**Value provided**: Instant, professional-grade writing analysis with actionable suggestions.

**Accessibility**: No user profiles needed - just paste text and get AI analysis immediately.

## 🔑 **API Keys Required**

- **OpenAI**: Visit [platform.openai.com](https://platform.openai.com/)
- **Gemini**: Visit [makersuite.google.com](https://makersuite.google.com/app/apikey)

**At least one API key is required** for the system to work.

## 🏗️ **Architecture**

- **Frontend**: Clean, responsive interface
- **Backend**: Secure Node.js/Express server
- **AI Integration**: Multiple providers with fallback
- **Security**: Multi-layered protection

## 🚀 **Deployment Ready**

This application is designed to be:
- **Hosted online** (Heroku, Vercel, AWS, etc.)
- **Accessible via link** (no user profiles needed)
- **Secure and production-ready**
- **Scalable for real users**

Perfect for your project submission requirements!
