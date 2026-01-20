#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying title and favicon fix..."

# Add changes
git add index.html src/App.jsx

# Commit changes
git commit -m "fix: improve title and favicon detection with cache busting for felix-foundation.xyz" 2>/dev/null || echo "Already committed"

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
echo "🌍 After deployment, clear browser cache and check:"
echo "   - https://felix-foundation.xyz/ → Title: 'Felix Foundation - Terms of Service'"
echo "   - Favicon should show Felix logo"
