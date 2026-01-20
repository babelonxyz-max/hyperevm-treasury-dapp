#!/bin/bash

# Deployment script for latest UI updates
# Run this script to commit, push, and deploy all changes

set -e  # Exit on error

cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Check git status
echo "📋 Checking git status..."
git status --short
echo ""

# Step 2: Add all changes
echo "➕ Adding changes..."
git add src/components/HypurrTerms.jsx src/components/HypurrTerms.css
echo "✅ Changes added"
echo ""

# Step 3: Commit changes
echo "💾 Committing changes..."
git commit -m "feat: UI updates - larger terms, visible scrollbar, celebratory animations, conditional NFT display, smaller footer" || {
    echo "⚠️  No new changes to commit (or already committed)"
}
echo ""

# Step 4: Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main || {
    echo "⚠️  Push failed or already pushed"
}
echo ""

# Step 5: Increment version
echo "📦 Incrementing version..."
npm run increment-version
echo ""

# Step 6: Commit version bump
echo "💾 Committing version bump..."
git add version.json public/version.json
git commit -m "chore: bump version" || {
    echo "⚠️  Version already committed"
}
git push origin main || {
    echo "⚠️  Version push failed"
}
echo ""

# Step 7: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo "This may take a minute..."
npx vercel --prod --yes --force

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Summary:"
echo "  - Committed UI changes"
echo "  - Version incremented"
echo "  - Pushed to GitHub"
echo "  - Deployed to Vercel production"
echo ""
echo "🌍 Your changes should be live shortly!"
