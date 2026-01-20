#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying root path fix for felix-foundation.xyz..."

# Add changes
git add src/App.jsx

# Commit changes
git commit -m "fix: ensure root path / shows terms page on felix-foundation.xyz" 2>/dev/null || echo "Already committed"

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
echo "   - https://felix-foundation.xyz/ → Shows Felix Terms Page"
echo "   - https://felix-foundation.xyz/hypurr → Also shows Felix Terms Page"
