#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying domain detection fix..."

# Add changes
git add src/App.jsx

# Commit changes
git commit -m "fix: improve domain detection with useState and useEffect for felix-foundation.xyz" 2>/dev/null || echo "Already committed"

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
echo "🌍 Check browser console for domain detection logs"
echo "   - Should see: '🌐 Domain check' and '✅ Showing Felix Terms Page'"
