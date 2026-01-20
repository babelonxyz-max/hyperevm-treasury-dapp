#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying footer changes..."

# Add footer CSS changes
git add src/components/HypurrTerms.css

# Commit footer changes
git commit -m "fix: reduce footer size to take less viewport space"

# Push to GitHub
git push origin main

# Increment version
npm run increment-version

# Commit and push version
git add version.json public/version.json
git commit -m "chore: bump version"
git push origin main

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
npx vercel --prod --yes --force

echo "✅ Footer changes deployed!"
