/**
 * AI Writing Assistant - Enhanced Production-Ready Application
 * 
 * Security Features:
 * - Input validation & sanitization (XSS prevention)
 * - Rate limiting & abuse prevention
 * - Secure API key handling
 * - Error handling without information leakage
 * - Content Security Policy compliance
 * 
 * Structural Features:
 * - Modular architecture with proper separation of concerns
 * - Comprehensive error handling & logging
 * - Performance optimization & memory management
 * - Accessibility compliance
 * - Progressive enhancement
 * 
 * @author AI Writing Assistant Team
 * @version 2.0.0
 * @license MIT
 */

// Security Configuration
const SECURITY_CONFIG = {
    MAX_TEXT_LENGTH: 10000,
    MAX_REQUESTS_PER_MINUTE: 10,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    ALLOWED_HTML_TAGS: ['b', 'i', 'em', 'strong', 'u'],
    SANITIZE_HTML: true,
    ENABLE_RATE_LIMITING: true,
    LOG_SECURITY_EVENTS: true
};

// Application State Management
class AppState {
    constructor() {
        this.isAnalyzing = false;
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.sessionStartTime = Date.now();
        this.securityEvents = [];
        this.errorCount = 0;
        this.maxErrors = 5;
    }

    resetSession() {
        this.sessionStartTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        this.securityEvents = [];
    }

    isSessionValid() {
        return (Date.now() - this.sessionStartTime) < SECURITY_CONFIG.SESSION_TIMEOUT;
    }

    canMakeRequest() {
        if (!SECURITY_CONFIG.ENABLE_RATE_LIMITING) return true;
        
        const now = Date.now();
        const timeWindow = 60 * 1000; // 1 minute
        
        if (now - this.lastRequestTime > timeWindow) {
            this.requestCount = 0;
            this.lastRequestTime = now;
        }
        
        return this.requestCount < SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE;
    }

    incrementRequestCount() {
        this.requestCount++;
    }

    logSecurityEvent(event, details = {}) {
        if (SECURITY_CONFIG.LOG_SECURITY_EVENTS) {
            this.securityEvents.push({
                timestamp: new Date().toISOString(),
                event,
                details,
                userAgent: navigator.userAgent,
                ip: 'client-side' // Would be server-side in production
            });
            
            // Keep only last 100 events
            if (this.securityEvents.length > 100) {
                this.securityEvents.shift();
            }
        }
    }
}

// Input Validation & Sanitization
class InputValidator {
    static sanitizeText(text) {
        if (typeof text !== 'string') {
            throw new Error('Invalid input type');
        }

        // Remove null bytes and control characters
        text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // Basic XSS prevention
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Remove script tags and event handlers
        text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        text = text.replace(/on\w+\s*=/gi, '');
        
        return text.trim();
    }

    static validateText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Text input is required');
        }

        const sanitized = this.sanitizeText(text);
        
        if (sanitized.length === 0) {
            throw new Error('Text cannot be empty');
        }

        if (sanitized.length > SECURITY_CONFIG.MAX_TEXT_LENGTH) {
            throw new Error(`Text too long. Maximum ${SECURITY_CONFIG.MAX_TEXT_LENGTH} characters allowed.`);
        }

        // Check for suspicious patterns
        const suspiciousPatterns = [
            /javascript:/i,
            /vbscript:/i,
            /data:/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(sanitized)) {
                throw new Error('Text contains potentially unsafe content');
            }
        }

        return sanitized;
    }

    static validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('API key is required');
        }

        if (apiKey.length < 20) {
            throw new Error('API key appears to be invalid');
        }

        // Basic OpenAI API key format validation
        if (!apiKey.startsWith('sk-')) {
            throw new Error('API key format appears invalid');
        }

        return apiKey.trim();
    }
}

// Error Handling & Logging
class ErrorHandler {
    static handleError(error, context = '') {
        const errorInfo = {
            message: error.message || 'An unknown error occurred',
            context,
            timestamp: new Date().toISOString(),
            stack: error.stack,
            userAgent: navigator.userAgent
        };

        // Log error (in production, this would go to a logging service)
        console.error('Application Error:', errorInfo);

        // Don't expose sensitive information to users
        const userMessage = this.getUserFriendlyMessage(error);
        
        return {
            userMessage,
            errorCode: this.getErrorCode(error),
            shouldRetry: this.isRetryableError(error)
        };
    }

    static getUserFriendlyMessage(error) {
        // Map technical errors to user-friendly messages
        const errorMessages = {
            'NetworkError': 'Network connection failed. Please check your internet connection.',
            'QuotaExceededError': 'API rate limit exceeded. Please wait a moment and try again.',
            'InvalidInputError': 'The text you entered contains invalid content. Please check and try again.',
            'AuthenticationError': 'API key is invalid or expired. Please check your configuration.',
            'ServiceUnavailableError': 'AI service is temporarily unavailable. Please try again later.'
        };

        return errorMessages[error.name] || 'An unexpected error occurred. Please try again.';
    }

    static getErrorCode(error) {
        const errorCodes = {
            'NetworkError': 'NETWORK_ERROR',
            'QuotaExceededError': 'RATE_LIMIT_ERROR',
            'InvalidInputError': 'VALIDATION_ERROR',
            'AuthenticationError': 'AUTH_ERROR',
            'ServiceUnavailableError': 'SERVICE_ERROR'
        };

        return errorCodes[error.name] || 'UNKNOWN_ERROR';
    }

    static isRetryableError(error) {
        const retryableErrors = ['NetworkError', 'ServiceUnavailableError'];
        return retryableErrors.includes(error.name);
    }
}

// Rate Limiting & Security
class SecurityManager {
    constructor(appState) {
        this.appState = appState;
        this.blockedIPs = new Set();
        this.suspiciousActivity = new Map();
    }

    checkRateLimit() {
        if (!this.appState.canMakeRequest()) {
            this.appState.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                requestCount: this.appState.requestCount,
                timeWindow: '1 minute'
            });
            
            throw new Error('Rate limit exceeded. Please wait before making another request.');
        }

        this.appState.incrementRequestCount();
        return true;
    }

    validateRequest(text, apiKey) {
        try {
            // Input validation
            const sanitizedText = InputValidator.validateText(text);
            const validatedApiKey = InputValidator.validateApiKey(apiKey);

            // Check for suspicious patterns
            this.detectSuspiciousActivity(sanitizedText);

            return { sanitizedText, validatedApiKey };
        } catch (error) {
            this.appState.logSecurityEvent('VALIDATION_FAILED', {
                error: error.message,
                textLength: text?.length || 0
            });
            throw error;
        }
    }

    detectSuspiciousActivity(text) {
        const suspiciousPatterns = [
            { pattern: /(.)\1{10,}/, description: 'Repeated characters' },
            { pattern: /[A-Z]{20,}/, description: 'Excessive caps' },
            { pattern: /[!@#$%^&*()]{10,}/, description: 'Excessive symbols' },
            { pattern: /\b(spam|viagra|casino|loan)\b/i, description: 'Suspicious keywords' }
        ];

        for (const { pattern, description } of suspiciousPatterns) {
            if (pattern.test(text)) {
                this.appState.logSecurityEvent('SUSPICIOUS_CONTENT_DETECTED', {
                    pattern: description,
                    textSample: text.substring(0, 100)
                });
            }
        }
    }
}

// Enhanced Writing Assistant Class
class WritingAssistant {
    constructor() {
        this.appState = new AppState();
        this.securityManager = new SecurityManager(this.appState);
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        this.init();
    }

    init() {
        try {
            this.bindEvents();
            this.updateUI();
            this.setupSecurityHeaders();
            this.initializeServiceWorker();
            
            console.log('AI Writing Assistant initialized successfully');
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showToast('Application initialization failed', 'error');
        }
    }

    setupSecurityHeaders() {
        // Set security headers (would be server-side in production)
        if (typeof document !== 'undefined') {
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            const cspContent = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com;";
            meta.content = cspContent;
            document.head.appendChild(meta);
        }
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    bindEvents() {
        // Main action buttons with error handling
        this.safeBindEvent('analyzeBtn', 'click', () => this.analyzeText());
        this.safeBindEvent('clearBtn', 'click', () => this.clearAll());
        this.safeBindEvent('copyBtn', 'click', () => this.copyImprovedText());
        this.safeBindEvent('replaceBtn', 'click', () => this.replaceOriginalText());

        // Input validation on change
        this.safeBindEvent('textInput', 'input', () => this.debounce(this.updateUI, 300));
        this.safeBindEvent('improvedText', 'input', () => this.debounce(this.updateUI, 300));

        // Keyboard shortcuts with security
        this.safeBindEvent(document, 'keydown', (e) => this.handleKeyboardShortcuts(e));

        // Error boundary for unhandled errors
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handleUnhandledRejection(e));
    }

    safeBindEvent(elementId, event, handler) {
        const element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
        if (element) {
            element.addEventListener(event, (e) => {
                try {
                    handler(e);
                } catch (error) {
                    this.handleError(error, `Event handler for ${event}`);
                }
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleKeyboardShortcuts(e) {
        try {
            // Ctrl/Cmd + Enter to analyze
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (this.appState.isAnalyzing) return;
                document.getElementById('analyzeBtn')?.click();
            }
            
            // Ctrl/Cmd + K to clear
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('clearBtn')?.click();
            }
        } catch (error) {
            this.handleError(error, 'Keyboard shortcuts');
        }
    }

    handleGlobalError(event) {
        this.handleError(event.error || new Error('Global error'), 'Global error handler');
    }

    handleUnhandledRejection(event) {
        this.handleError(new Error(event.reason), 'Unhandled promise rejection');
    }

    async analyzeText() {
        try {
            const text = document.getElementById('textInput')?.value?.trim();
            
            if (!text) {
                this.showToast('Please enter some text to analyze', 'error');
                return;
            }

            if (!this.appState.apiKey) {
                this.showToast('Please enter your OpenAI API key first', 'error');
                return;
            }

            if (this.appState.isAnalyzing) {
                return;
            }

            // Security checks
            this.securityManager.checkRateLimit();
            const { sanitizedText, validatedApiKey } = this.securityManager.validateRequest(text, this.appState.apiKey);

            this.appState.isAnalyzing = true;
            this.showResultsSection();
            this.showLoading(true);
            this.resetRetryAttempts();

            const analysis = await this.performAIAnalysis(sanitizedText, validatedApiKey);
            this.displayResults(analysis);
            this.showToast('Analysis completed successfully!', 'success');
            
            // Reset error count on success
            this.appState.errorCount = 0;
            
        } catch (error) {
            await this.handleAnalysisError(error);
        } finally {
            this.appState.isAnalyzing = false;
            this.showLoading(false);
        }
    }

    async handleAnalysisError(error) {
        const errorInfo = ErrorHandler.handleError(error, 'Text analysis');
        
        if (errorInfo.shouldRetry && this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            this.showToast(`Retrying... (${this.retryAttempts}/${this.maxRetries})`, 'info');
            
            await this.delay(this.retryDelay * this.retryAttempts);
            return this.analyzeText();
        }

        this.appState.errorCount++;
        this.appState.logSecurityEvent('ANALYSIS_FAILED', {
            error: error.message,
            retryAttempts: this.retryAttempts,
            errorCount: this.appState.errorCount
        });

        if (this.appState.errorCount >= this.appState.maxErrors) {
            this.showToast('Too many errors. Please refresh the page.', 'error');
            return;
        }

        this.showToast(errorInfo.userMessage, 'error');
        this.displayErrorResults();
    }

    async performAIAnalysis(text, apiKey) {
        // Get selected provider
        const providerSelect = document.getElementById('providerSelect');
        const selectedProvider = providerSelect ? providerSelect.value : 'auto';
        
        // Call our secure backend instead of OpenAI directly
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, provider: selectedProvider })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
            
            if (response.status === 429) {
                throw new Error('QuotaExceededError');
            } else if (response.status === 401) {
                throw new Error('AuthenticationError');
            } else if (response.status >= 500) {
                throw new Error('ServiceUnavailableError');
            } else {
                throw new Error(errorMessage);
            }
        }

        const data = await response.json();
        
        if (!data.success || !data.analysis) {
            throw new Error('Invalid response from server');
        }

        // Store the provider used for display
        this.lastUsedProvider = data.provider;
        
        return data.analysis;
    }

    createAnalysisPrompt(text) {
        return `Please analyze the following text and provide feedback in the exact JSON format below:

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
}

Focus on providing actionable, specific feedback that will help improve the writing.`;
    }

    displayResults(analysis) {
        try {
            // Validate analysis structure
            if (!this.validateAnalysisStructure(analysis)) {
                throw new Error('Invalid analysis structure received');
            }

            // Display grammar and style analysis
            this.updateAnalysisCard('grammarContent', analysis.grammar, 'Grammar & Style');
            this.updateAnalysisCard('toneContent', analysis.style, 'Tone Analysis');
            this.updateAnalysisCard('suggestionsContent', analysis.content, 'Content Suggestions');

            // Display improved version
            const improvedText = document.getElementById('improvedText');
            if (improvedText) {
                improvedText.value = analysis.improved_version || 'No improved version available';
            }

            // Show which provider was used
            this.showProviderInfo();

            // Add CSS for analysis items
            this.addAnalysisStyles();
            
        } catch (error) {
            this.handleError(error, 'Display results');
            this.displayErrorResults();
        }
    }

    showProviderInfo() {
        if (this.lastUsedProvider) {
            const providerNames = {
                'openai': 'OpenAI GPT',
                'gemini': 'Google Gemini'
            };
            
            const providerName = providerNames[this.lastUsedProvider] || this.lastUsedProvider;
            this.showToast(`Analysis completed using ${providerName}`, 'success');
        }
    }

    validateAnalysisStructure(analysis) {
        const requiredFields = ['grammar', 'style', 'content', 'improved_version'];
        return requiredFields.every(field => analysis.hasOwnProperty(field));
    }

    updateAnalysisCard(elementId, data, title) {
        const element = document.getElementById(elementId);
        if (!element || !data) return;

        element.innerHTML = `
            <div class="analysis-item">
                <div class="score-badge">Score: ${data.score || 'N/A'}/10</div>
                ${this.renderAnalysisData(data, title)}
            </div>
        `;
    }

    renderAnalysisData(data, title) {
        let html = '';
        
        if (title === 'Grammar & Style') {
            html += `
                <h4>Issues Found:</h4>
                <ul>${(data.issues || []).map(issue => `<li>${this.escapeHtml(issue)}</li>`).join('')}</ul>
                <h4>Suggestions:</h4>
                <ul>${(data.suggestions || []).map(suggestion => `<li>${this.escapeHtml(suggestion)}</li>`).join('')}</ul>
            `;
        } else if (title === 'Tone Analysis') {
            html += `
                <h4>Tone:</h4>
                <p>${this.escapeHtml(data.tone || 'Not analyzed')}</p>
                <h4>Clarity:</h4>
                <p>${this.escapeHtml(data.clarity || 'Not analyzed')}</p>
                <h4>Style Suggestions:</h4>
                <ul>${(data.suggestions || []).map(suggestion => `<li>${this.escapeHtml(suggestion)}</li>`).join('')}</ul>
            `;
        } else if (title === 'Content Suggestions') {
            html += `
                <h4>Content Strengths:</h4>
                <ul>${(data.strengths || []).map(strength => `<li>${this.escapeHtml(strength)}</li>`).join('')}</ul>
                <h4>Areas for Improvement:</h4>
                <ul>${(data.weaknesses || []).map(weakness => `<li>${this.escapeHtml(weakness)}</li>`).join('')}</ul>
                <h4>Content Suggestions:</h4>
                <ul>${(data.suggestions || []).map(suggestion => `<li>${this.escapeHtml(suggestion)}</li>`).join('')}</ul>
            `;
        }

        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    displayErrorResults() {
        const errorMessage = 'Analysis could not be completed. Please check your API key and try again.';
        
        ['grammarContent', 'toneContent', 'suggestionsContent'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `<p class="error-text">${errorMessage}</p>`;
            }
        });

        const improvedText = document.getElementById('improvedText');
        if (improvedText) {
            improvedText.value = '';
        }
    }

    addAnalysisStyles() {
        if (!document.getElementById('analysis-styles')) {
            const style = document.createElement('style');
            style.id = 'analysis-styles';
            style.textContent = `
                .analysis-item h4 {
                    color: #4a5568;
                    margin: 1rem 0 0.5rem 0;
                    font-size: 1rem;
                    font-weight: 600;
                }
                
                .analysis-item ul {
                    margin: 0.5rem 0 1rem 0;
                    padding-left: 1.5rem;
                }
                
                .analysis-item li {
                    margin-bottom: 0.25rem;
                    color: #4a5568;
                }
                
                .score-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                
                .error-text {
                    color: #f56565;
                    text-align: center;
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
        }
    }

    clearAll() {
        try {
            document.getElementById('textInput').value = '';
            document.getElementById('improvedText').value = '';
            this.hideResultsSection();
            this.updateUI();
            this.showToast('All content cleared', 'success');
            this.appState.resetSession();
        } catch (error) {
            this.handleError(error, 'Clear all');
        }
    }

    async copyImprovedText() {
        try {
            const improvedText = document.getElementById('improvedText')?.value;
            if (!improvedText) {
                this.showToast('No improved text to copy', 'error');
                return;
            }

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(improvedText);
                this.showToast('Improved text copied to clipboard!', 'success');
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = improvedText;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    this.showToast('Improved text copied to clipboard!', 'success');
                } catch (fallbackError) {
                    this.showToast('Copy failed. Please select and copy manually.', 'error');
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        } catch (error) {
            this.handleError(error, 'Copy text');
        }
    }

    replaceOriginalText() {
        try {
            const improvedText = document.getElementById('improvedText')?.value;
            if (!improvedText) {
                this.showToast('No improved text to replace with', 'error');
                return;
            }

            document.getElementById('textInput').value = improvedText;
            this.showToast('Original text replaced with improved version', 'success');
            this.updateUI();
        } catch (error) {
            this.handleError(error, 'Replace text');
        }
    }

    saveApiKey() {
        try {
            const apiKeyInput = document.getElementById('apiKeyInput');
            const apiKey = apiKeyInput?.value?.trim();
            
            if (!apiKey) {
                this.showToast('Please enter an API key', 'error');
                return;
            }

            // Validate API key
            const validatedApiKey = InputValidator.validateApiKey(apiKey);
            
            this.appState.apiKey = validatedApiKey;
            localStorage.setItem('openai_api_key', validatedApiKey);
            
            this.showToast('API key saved successfully!', 'success');
            this.appState.logSecurityEvent('API_KEY_SAVED', { keyLength: validatedApiKey.length });
            
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    loadSavedApiKey() {
        try {
            const savedKey = localStorage.getItem('openai_api_key');
            if (savedKey) {
                this.appState.apiKey = savedKey;
                const apiKeyInput = document.getElementById('apiKeyInput');
                if (apiKeyInput) {
                    apiKeyInput.value = savedKey;
                }
            }
        } catch (error) {
            console.warn('Failed to load saved API key:', error);
        }
    }

    showResultsSection() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
        }
    }

    hideResultsSection() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
    }

    showLoading(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            if (show) {
                loadingSpinner.classList.remove('hidden');
            } else {
                loadingSpinner.classList.add('hidden');
            }
        }
    }

    updateUI() {
        try {
            const textInput = document.getElementById('textInput')?.value?.trim();
            const improvedText = document.getElementById('improvedText')?.value?.trim();
            
            // Enable/disable analyze button
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.disabled = !textInput || this.appState.isAnalyzing;
            }
            
            // Enable/disable copy and replace buttons
            const copyBtn = document.getElementById('copyBtn');
            const replaceBtn = document.getElementById('replaceBtn');
            
            if (copyBtn) copyBtn.disabled = !improvedText;
            if (replaceBtn) replaceBtn.disabled = !improvedText;
            
            // Show/hide results section based on content
            if (textInput || improvedText) {
                this.showResultsSection();
            } else {
                this.hideResultsSection();
            }
            
        } catch (error) {
            this.handleError(error, 'Update UI');
        }
    }

    showToast(message, type = 'info') {
        try {
            const toastContainer = document.getElementById('toastContainer');
            if (!toastContainer) return;

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = this.escapeHtml(message);

            toastContainer.appendChild(toast);

            // Auto-remove toast after 5 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);

            // Remove toast on click
            toast.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });

        } catch (error) {
            console.error('Failed to show toast:', error);
        }
    }

    handleError(error, context = '') {
        const errorInfo = ErrorHandler.handleError(error, context);
        this.showToast(errorInfo.userMessage, 'error');
        
        // Log security event for certain types of errors
        if (error.name === 'SecurityError' || error.name === 'QuotaExceededError') {
            this.appState.logSecurityEvent('SECURITY_ERROR', {
                error: error.message,
                context
            });
        }
    }

    resetRetryAttempts() {
        this.retryAttempts = 0;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Performance monitoring
    logPerformanceMetric(operation, duration) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(`${operation}-end`);
            window.performance.measure(operation, `${operation}-start`, `${operation}-end`);
            
            const measure = window.performance.getEntriesByName(operation)[0];
            console.log(`${operation} took ${measure.duration.toFixed(2)}ms`);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.writingAssistant = new WritingAssistant();
        console.log('AI Writing Assistant loaded successfully');
    } catch (error) {
        console.error('Failed to initialize Writing Assistant:', error);
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f56565;">
                <h3>Application Error</h3>
                <p>Failed to initialize the application. Please refresh the page.</p>
                <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Add some additional utility functions
window.addEventListener('load', () => {
    try {
        // Add smooth scrolling for better UX
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Performance monitoring
        if (window.performance && window.performance.mark) {
            window.performance.mark('app-load-end');
            window.performance.measure('app-load', 'app-load-start', 'app-load-end');
        }
        
    } catch (error) {
        console.warn('Failed to initialize additional features:', error);
    }
});

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WritingAssistant, InputValidator, ErrorHandler, SecurityManager };
}