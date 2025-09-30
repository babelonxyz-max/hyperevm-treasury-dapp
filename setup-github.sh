#!/bin/bash

# HyperEVM Treasury dApp - GitHub Setup Script
echo "🚀 Setting up GitHub repository for HyperEVM Treasury dApp..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

# Check if remote already exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote 'origin' already exists:"
    git remote get-url origin
    echo ""
    echo "To push your changes:"
    echo "  git add ."
    echo "  git commit -m 'Your commit message'"
    echo "  git push origin main"
    exit 0
fi

echo "📋 Next steps to create your GitHub repository:"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: hyperevm-treasury-dapp"
echo "3. Description: HyperEVM Treasury dApp - Advanced liquid staking protocol with floating stats bar"
echo "4. Set to Public (or Private if you prefer)"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
echo "7. After creating the repository, run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/hyperevm-treasury-dapp.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your actual GitHub username."
echo ""
echo "🎯 Your project is ready to be pushed to GitHub!"
