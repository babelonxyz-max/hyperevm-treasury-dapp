#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying all changes (title, favicon, domain routing, version)..."

# Add all changes
git add index.html src/App.jsx version.json public/version.json

# Commit changes
git commit -m "feat: update title/favicon for Felix domain, fix routing, bump version to 28" 2>/dev/null || echo "Already committed"

# Push to GitHub
git push origin main

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
npx vercel --prod --yes --force

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Changes deployed:"
echo "   - Title: 'Felix Foundation - Terms of Service' on felix-foundation.xyz"
echo "   - Favicon: Felix logo with cache busting"
echo "   - Domain routing: Only shows terms page on felix-foundation.xyz"
echo "   - Version: Updated to build 28"
echo ""
echo "🌍 After deployment:"
echo "   - Clear browser cache (Cmd+Shift+R)"
echo "   - Visit https://felix-foundation.xyz/"
echo "   - Check version badge shows v1.0.28"
