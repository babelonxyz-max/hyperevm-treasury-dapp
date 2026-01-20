#!/bin/bash

# Deployment script: Remove NFT count text from wallet verification
# This removes "Hypurr NFTs Found" label and "No NFTs found" warning message

set -e

echo "🚀 Starting deployment: Remove NFT count text"
echo "================================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Add changed files
echo ""
echo "📝 Staging changes..."
git add src/components/HypurrTerms.jsx

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit"
    exit 0
fi

# Commit changes
echo ""
echo "💾 Committing changes..."
git commit -m "Remove NFT count text from wallet verification section

- Remove 'Hypurr NFTs Found' label and count display
- Remove 'No NFTs found in this wallet' warning message
- Wallet verification now only shows wallet address"

# Push to remote
echo ""
echo "📤 Pushing to remote repository..."
git push origin "$CURRENT_BRANCH"

# Increment version
echo ""
echo "🔢 Incrementing version..."
npm run increment-version || echo "⚠️  Version increment script not found, skipping..."

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."
npx vercel --prod --yes --force

echo ""
echo "✅ Deployment complete!"
echo "================================================"
echo "Changes deployed:"
echo "  - Removed 'Hypurr NFTs Found' text"
echo "  - Removed 'No NFTs found' warning message"
echo "  - Wallet verification now only shows address"
