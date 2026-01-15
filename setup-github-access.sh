#!/bin/bash

# Setup GitHub access for deployment
# This script helps configure git for pushing to GitHub

echo "🔐 Setting up GitHub access..."

# Check current remote
echo "Current remote URL:"
git remote get-url origin

echo ""
echo "Choose an option:"
echo "1. Use Personal Access Token (recommended)"
echo "2. Use SSH (if keys are configured)"
echo "3. Configure credential helper"

read -p "Enter option (1-3): " option

case $option in
  1)
    echo ""
    echo "📝 To use Personal Access Token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic) with 'repo' scope"
    echo "3. Copy the token"
    echo ""
    read -p "Enter your GitHub Personal Access Token: " token
    if [ ! -z "$token" ]; then
      git remote set-url origin "https://${token}@github.com/babelonxyz-max/hyperevm-treasury-dapp.git"
      echo "✅ Remote URL updated!"
      echo "Testing connection..."
      git ls-remote --heads origin | head -1
      if [ $? -eq 0 ]; then
        echo "✅ Connection successful!"
        echo "Ready to push!"
      else
        echo "❌ Connection failed. Please check your token."
      fi
    fi
    ;;
  2)
    echo "Switching to SSH..."
    git remote set-url origin "git@github.com:babelonxyz-max/hyperevm-treasury-dapp.git"
    echo "✅ Remote URL updated to SSH"
    echo "Testing connection..."
    ssh -T git@github.com 2>&1 | head -3
    ;;
  3)
    echo "Configuring credential helper..."
    git config --global credential.helper store
    echo "✅ Credential helper configured"
    echo "Next time you push, git will ask for credentials and save them"
    ;;
  *)
    echo "Invalid option"
    ;;
esac

echo ""
echo "🚀 To deploy, run:"
echo "   git push origin main"
