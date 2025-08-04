#!/bin/bash

echo "🚀 RoweCapital Platform Deployment Script"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit for Render deployment"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository as remote origin:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/rowecapital-platform.git"
    echo ""
    echo "📤 Then push to GitHub:"
    echo "   git push -u origin main"
else
    echo "📤 Pushing to GitHub..."
    git push origin main
fi

echo ""
echo "🎯 Next Steps for Render Deployment:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Name: rowecapital-platform"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Plan: Free"
echo ""
echo "✅ Deployment files are ready!"
echo "🌐 Your platform will be available at: https://rowecapital-platform.onrender.com" 