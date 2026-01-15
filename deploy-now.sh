#!/bin/bash
cd /Users/mark/hyperevm-treasury-dapp

echo "🚀 Deploying Felix logo update..."

# Add all changes
git add -A

# Commit
git commit -m "feat: use Felix logo from usefelix.xyz" || echo "No changes to commit"

# Push
git push origin main

# Increment version
npm run increment-version

# Add version files
git add version.json public/version.json
git commit -m "chore: bump version for logo update"
git push origin main

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
npx vercel --prod --yes --force

echo "✅ Deployment complete!"
