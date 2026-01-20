#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Fixing vercel.json and deploying..."

# Add changes
git add vercel.json

# Commit changes
git commit -m "fix: remove invalid domains property from vercel.json" 2>/dev/null || echo "Already committed"

# Push to GitHub
git push origin main

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
npx vercel --prod --yes --force

echo ""
echo "✅ Deployment complete!"
echo "   vercel.json schema validation should now pass"
