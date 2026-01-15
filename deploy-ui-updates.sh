#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying UI updates..."

# Add changes
git add src/components/HypurrTerms.jsx src/components/HypurrTerms.css

# Commit
git commit -m "feat: UI updates - larger terms, visible scrollbar, celebratory animations, conditional NFT display" || echo "Already committed"

# Push
git push origin main || echo "Push failed or already pushed"

# Increment version
npm run increment-version

# Add version files
git add version.json public/version.json
git commit -m "chore: bump version" || echo "Version already committed"
git push origin main || echo "Version push failed"

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
npx vercel --prod --yes --force

echo "✅ Deployment complete!"
