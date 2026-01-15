#!/bin/bash

# Set Vercel Environment Variables
# Run this script to set all required environment variables

echo "🔧 Setting Vercel Environment Variables..."
echo ""

# Transfer Contract
echo "Setting REACT_APP_TRANSFER_CONTRACT..."
echo "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E" | npx vercel env add REACT_APP_TRANSFER_CONTRACT production

# Hypurr NFT Contract
echo "Setting REACT_APP_HYPURR_NFT_CONTRACT..."
echo "0x9125e2d6827a00b0f8330d6ef7bef07730bac685" | npx vercel env add REACT_APP_HYPURR_NFT_CONTRACT production

# Random Art NFT Contract
echo "Setting REACT_APP_RANDOM_ART_NFT_CONTRACT..."
echo "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f" | npx vercel env add REACT_APP_RANDOM_ART_NFT_CONTRACT production

echo ""
echo "✅ Environment variables set!"
echo "📝 Note: You may need to redeploy for changes to take effect"
