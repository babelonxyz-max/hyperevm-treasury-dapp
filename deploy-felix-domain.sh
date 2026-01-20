#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying Felix Foundation domain changes..."

# Add all changes (including domain detection code)
git add src/App.jsx vercel.json

# Commit changes
git commit -m "feat: add felix-foundation.xyz domain detection - show only terms page" 2>/dev/null || echo "Already committed"

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
echo "🌍 Your sites:"
echo "   - https://felix-foundation.xyz → Felix Terms Page Only"
echo "   - https://babelon.xyz → Full Babelon Dashboard"
echo ""
echo "⏳ SSL certificate provisioning may take a few minutes"
