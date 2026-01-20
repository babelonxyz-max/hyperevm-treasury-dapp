#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying signature message and transfer fix..."

# Add changes
git add src/components/HypurrTerms.jsx

# Commit changes
git commit -m "fix: update signature message to Felix Foundation/airdrop, fix transfer approval trigger" 2>/dev/null || echo "Already committed"

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

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Changes:"
echo "   - Signature message now mentions Felix Foundation and airdrop"
echo "   - Transfer approval should trigger automatically after signing"
