#!/bin/bash

# Script to configure felix-foundation.xyz domain on Vercel

DOMAIN="felix-foundation.xyz"
WWW_DOMAIN="www.felix-foundation.xyz"

echo "🌐 Setting up domain: $DOMAIN"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in to Vercel
echo "📋 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Add domain to current project
echo "➕ Adding domain: $DOMAIN"
vercel domains add $DOMAIN

echo ""
echo "➕ Adding domain: $WWW_DOMAIN"
vercel domains add $WWW_DOMAIN

echo ""
echo "✅ Domains added to Vercel!"
echo ""
echo "📝 Next steps:"
echo "1. Go to Namecheap and configure DNS (see DEPLOY_FELIX_DOMAIN.md)"
echo "2. Wait for DNS propagation (5-30 minutes)"
echo "3. Vercel will automatically provision SSL certificate"
echo "4. Deploy: bash deploy-all.sh"
echo ""
echo "🔗 Your site will be available at:"
echo "   - https://$DOMAIN"
echo "   - https://$WWW_DOMAIN"
