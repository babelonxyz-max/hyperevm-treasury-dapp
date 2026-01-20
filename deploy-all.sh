#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying all latest changes..."

# Add all changes
git add src/components/HypurrTerms.jsx src/components/HypurrTerms.css

# Commit changes
git commit -m "feat: update flow - no NFT check before signing, evaluation messages, scroll to top after accept" 2>/dev/null || echo "Already committed"

# Push to GitHub
git push origin main

# Increment version
npm run increment-version

# Commit and push version
git add version.json public/version.json
git commit -m "chore: bump version" 2>/dev/null || echo "Version already committed"
git push origin main

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
npx vercel --prod --yes --force

echo "✅ Done!"
