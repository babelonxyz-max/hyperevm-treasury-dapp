#!/bin/bash

# Deploy terms text update
echo "📝 Staging changes..."
git add src/components/HypurrTerms.jsx version.json public/version.json

echo "💾 Committing changes..."
git commit -m "feat: add non-refundable clause to terms and update version"

echo "📤 Pushing to GitHub..."
git push origin main

echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"
