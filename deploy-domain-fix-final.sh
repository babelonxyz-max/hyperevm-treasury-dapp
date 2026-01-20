#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying final domain detection fix..."

# Add changes
git add src/App.jsx

# Commit changes
git commit -m "fix: check domain synchronously before render to prevent Babelon dashboard flash" 2>/dev/null || echo "Already committed"

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
echo "🌍 felix-foundation.xyz should now show ONLY the Felix Terms Page"
echo "   (No Babelon dashboard flash)"
