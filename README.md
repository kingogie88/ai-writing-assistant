# AI Writing Assistant - Netlify Edition

A sophisticated AI-powered writing assistant that provides comprehensive text analysis, grammar checking, style suggestions, and content improvements using multiple AI providers. **Optimized for Netlify hosting with serverless functions.**

## 🚀 Features

- **Multi-Provider AI Support**: OpenAI GPT and Google Gemini
- **Comprehensive Analysis**: Grammar, style, tone, and content suggestions
- **Real-time Processing**: Instant feedback and improvements
- **User-Friendly Interface**: Clean, responsive design
- **Security First**: Serverless API key handling
- **Netlify Ready**: Optimized for serverless hosting

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Netlify Serverless Functions
- **AI Services**: OpenAI GPT-3.5-turbo, Google Gemini-Pro
- **Hosting**: Netlify (serverless)

## 📋 Prerequisites

- OpenAI API key
- Google Gemini API key (optional)
- Netlify account

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-writing-assistant
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.`
   - Add environment variables in Netlify dashboard

3. **Configure environment variables in Netlify**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Access your app**
   Your app will be available at `https://your-app-name.netlify.app`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `GEMINI_API_KEY` | Your Google Gemini API key | No (but recommended) |

### AI Provider Selection

The application supports three modes:
- **Auto-select**: Automatically chooses the best available provider
- **OpenAI GPT**: Uses OpenAI's GPT-3.5-turbo model
- **Google Gemini**: Uses Google's Gemini-Pro model

## 🏗️ Architecture

### Frontend
- **Modular JavaScript**: ES6 classes with proper separation of concerns
- **Responsive Design**: Mobile-first CSS with modern design principles
- **Accessibility**: ARIA labels and keyboard navigation support
- **Error Handling**: User-friendly error messages and validation

### Backend
- **Netlify Functions**: Serverless API endpoints
- **Security**: Input validation and CORS handling
- **Error Handling**: Graceful error responses without information leakage

### AI Integration
- **Provider Abstraction**: Unified interface for multiple AI services
- **Fallback Logic**: Automatic switching between providers
- **Response Parsing**: Structured JSON responses for consistent UI
- **Error Recovery**: Graceful handling of API failures

## 🔒 Security Features

- **API Key Protection**: Server-side storage, never exposed to client
- **Input Sanitization**: XSS prevention and content filtering
- **CORS Configuration**: Secure cross-origin resource sharing
- **Error Handling**: No sensitive information in error messages

## 📱 Usage

1. **Enter Text**: Paste or type your text in the input area
2. **Select Provider**: Choose your preferred AI provider or use auto-select
3. **Analyze**: Click "Analyze with AI" to get comprehensive feedback
4. **Review Results**: Examine grammar, style, tone, and content suggestions
5. **Apply Improvements**: Use the improved version or make manual edits
6. **Copy/Replace**: Copy the improved text or replace the original

## 🚀 Netlify Deployment

### Automatic Deployment
- Connect your GitHub repository to Netlify
- Set build command: `npm run build`
- Set publish directory: `.`
- Add environment variables in Netlify dashboard
- Deploy automatically on every push

### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## 🧪 Testing

The application includes comprehensive error handling and validation:
- Input validation and sanitization
- API error handling and fallbacks
- Network error recovery
- User input validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT API access
- Google for Gemini API access
- Netlify for serverless hosting

## 📞 Support

For support or questions:
- Create an issue in the repository
- Check the documentation
- Review the error logs

---

**Note**: This application requires valid API keys to function. Please ensure you have the necessary API access before deployment. 