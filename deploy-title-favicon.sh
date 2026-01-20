#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying title and favicon updates..."

# Add changes
git add index.html src/components/HypurrTerms.jsx

# Commit changes
git commit -m "feat: update title and favicon for felix-foundation.xyz domain" 2>/dev/null || echo "Already committed"

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
echo "🌍 After deployment:"
echo "   - felix-foundation.xyz → 'Felix Foundation - Terms of Service' title + Felix favicon"
echo "   - babelon.xyz → 'Babelon Protocol' title + Felix favicon"
