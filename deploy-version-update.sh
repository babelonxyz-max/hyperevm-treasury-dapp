#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying version update..."

# Increment version
npm run increment-version

# Add version files
git add version.json public/version.json

# Commit version
git commit -m "chore: bump version to latest" 2>/dev/null || echo "Already committed"

# Push to GitHub
git push origin main

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
npx vercel --prod --yes --force

echo ""
echo "✅ Deployment complete!"
echo "   Check version.json for current build number"
