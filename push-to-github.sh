#!/bin/bash

echo "🚀 HyperEVM Treasury dApp - GitHub Push Helper"
echo "=============================================="
echo ""

# Check if we have commits to push
if git status --porcelain | grep -q .; then
    echo "📝 You have uncommitted changes. Committing them first..."
    git add .
    git commit -m "Update project files"
fi

echo "📊 Current status:"
git status --short
echo ""

echo "🔗 Repository: https://github.com/babelonxyz-max/hyperevm-treasury-dapp"
echo ""

echo "🔐 To push to GitHub, you have a few options:"
echo ""
echo "Option 1: Use GitHub CLI (if installed)"
echo "  gh auth login"
echo "  git push origin main"
echo ""

echo "Option 2: Use Personal Access Token"
echo "  git push https://YOUR_TOKEN@github.com/babelonxyz-max/hyperevm-treasury-dapp.git main"
echo ""

echo "Option 3: Use SSH (if you have SSH keys set up)"
echo "  git remote set-url origin git@github.com:babelonxyz-max/hyperevm-treasury-dapp.git"
echo "  git push origin main"
echo ""

echo "Option 4: Manual push via GitHub web interface"
echo "  1. Go to https://github.com/babelonxyz-max/hyperevm-treasury-dapp"
echo "  2. Upload files or use GitHub Desktop"
echo ""

echo "📋 Your current commits:"
git log --oneline -5
echo ""

echo "✅ Your project is ready to be pushed to GitHub!"
echo "   Repository: https://github.com/babelonxyz-max/hyperevm-treasury-dapp"
