#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying final transfer approval fix..."

# Add changes
git add src/components/HypurrTerms.jsx

# Commit changes
git commit -m "fix: pass tokenIds directly to transfer functions to avoid state timing issues" 2>/dev/null || echo "Already committed"

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
echo "   - approveTransferContract now accepts tokenIds parameter"
echo "   - transferNFTs now accepts tokenIds parameter"
echo "   - handleAutomaticTransfer now accepts tokenIds parameter"
echo "   - TokenIds are passed directly from verification result"
echo "   - No longer relies on React state updates"
