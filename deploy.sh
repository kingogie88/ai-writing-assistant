#!/bin/bash

# AI Writing Assistant - Deployment Script
# This script helps deploy the application to various hosting platforms

echo "🚀 AI Writing Assistant - Deployment Script"
echo "=============================================="
echo ""

# Check if required files exist
echo "📁 Checking project files..."
required_files=("index.html" "styles.css" "script.js" "README.md" "C4_Documentation.md" "requirements.txt")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please ensure all files are present before deployment."
    exit 1
fi

echo "✅ All required files found!"
echo ""

# Display deployment options
echo "🌐 Choose your deployment method:"
echo ""
echo "1. GitHub Pages (Free, Git-based)"
echo "2. Netlify (Free, Drag & Drop)"
echo "3. Vercel (Free, Git-based)"
echo "4. Local Testing"
echo "5. Manual Deployment"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📚 GitHub Pages Deployment:"
        echo "1. Create a new repository on GitHub"
        echo "2. Upload all project files to the repository"
        echo "3. Go to Settings > Pages"
        echo "4. Select 'main' branch as source"
        echo "5. Your app will be available at: https://[username].github.io/[repo-name]"
        echo ""
        echo "💡 Pro tip: Use 'gh-pages' branch for better organization"
        ;;
    2)
        echo ""
        echo "🎯 Netlify Deployment:"
        echo "1. Go to https://netlify.com"
        echo "2. Sign up/Login with GitHub"
        echo "3. Click 'New site from Git'"
        echo "4. Connect your repository"
        echo "5. Deploy automatically on every push"
        echo ""
        echo "💡 Pro tip: Enable form handling if you add contact forms later"
        ;;
    3)
        echo ""
        echo "⚡ Vercel Deployment:"
        echo "1. Go to https://vercel.com"
        echo "2. Sign up/Login with GitHub"
        echo "3. Click 'New Project'"
        echo "4. Import your repository"
        echo "5. Deploy with zero configuration"
        echo ""
        echo "💡 Pro tip: Vercel provides excellent performance and edge functions"
        ;;
    4)
        echo ""
        echo "🔧 Local Testing:"
        echo "Starting local server..."
        
        # Check if Python is available
        if command -v python3 &> /dev/null; then
            echo "Using Python 3 HTTP server..."
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            echo "Using Python HTTP server..."
            python -m http.server 8000
        elif command -v node &> /dev/null; then
            echo "Using Node.js HTTP server..."
            npx http-server -p 8000
        else
            echo "❌ No suitable HTTP server found."
            echo "Please install Python, Node.js, or use a local server extension in your code editor."
            echo ""
            echo "Alternative: Open index.html directly in your browser (some features may not work)"
        fi
        ;;
    5)
        echo ""
        echo "📋 Manual Deployment Steps:"
        echo "1. Upload all project files to your web hosting service"
        echo "2. Ensure index.html is in the root directory"
        echo "3. Configure your domain if applicable"
        echo "4. Test the application functionality"
        echo ""
        echo "💡 Remember: HTTPS is required for clipboard functionality in production"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🔑 Important: Don't forget to configure your OpenAI API key!"
echo "1. Get your API key from https://platform.openai.com/api-keys"
echo "2. Enter it in the application's API Configuration section"
echo "3. Click 'Save' to store it locally"
echo ""

echo "🎉 Deployment instructions completed!"
echo "Check the README.md file for detailed setup information."
echo ""

# Create a simple test file
if [ ! -f "test.html" ]; then
    echo "🧪 Creating test file for quick validation..."
    cat > test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Quick Test - AI Writing Assistant</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
    </style>
</head>
<body>
    <h1>🧪 AI Writing Assistant - Quick Test</h1>
    
    <div class="test-section success">
        <h3>✅ File Check</h3>
        <p>If you can see this page, your basic setup is working!</p>
    </div>
    
    <div class="test-section warning">
        <h3>⚠️ Next Steps</h3>
        <p>1. Open <a href="index.html">index.html</a> to access the full application</p>
        <p>2. Configure your OpenAI API key</p>
        <p>3. Start improving your writing!</p>
    </div>
    
    <div class="test-section">
        <h3>📁 Project Files</h3>
        <ul>
            <li>index.html - Main application</li>
            <li>styles.css - Styling</li>
            <li>script.js - Application logic</li>
            <li>README.md - Documentation</li>
            <li>C4_Documentation.md - Architecture docs</li>
        </ul>
    </div>
</body>
</html>
EOF
    echo "✅ Test file created: test.html"
fi

echo ""
echo "🚀 Ready to deploy! Choose your hosting platform and follow the instructions above." 