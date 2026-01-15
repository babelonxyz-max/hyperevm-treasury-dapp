#!/bin/bash

# Deploy to nft.babelon.xyz staging
# This script helps deploy the Hypurr Terms page to nft.babelon.xyz

echo "🚀 Deploying to nft.babelon.xyz..."

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -D vercel
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod --yes

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Go to Vercel Dashboard → Your Project → Settings → Domains"
    echo "2. Add 'nft.babelon.xyz' as a custom domain"
    echo "3. Update DNS in Cloudflare:"
    echo "   - Add CNAME: nft → cname.vercel-dns.com"
    echo ""
    echo "🌐 Your site will be live at: https://nft.babelon.xyz"
else
    echo "❌ Deployment failed!"
    echo "💡 Alternative: Push to git and Vercel will auto-deploy"
    echo "   git add ."
    echo "   git commit -m 'Deploy Hypurr Terms to staging'"
    echo "   git push origin main"
fi
