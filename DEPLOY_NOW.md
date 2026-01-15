# 🚀 Deploy Multi-Collection NFT Support

## Changes Made
- ✅ Frontend now checks for BOTH Hypurr and Random Art NFTs
- ✅ Uses transfer contract's `checkAllNFTs()` function
- ✅ Handles transfers from multiple collections
- ✅ Updated UI text to reflect both collections

## Domain
**https://hypurr.babelon.xyz/hypurr**

## Deploy Steps

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Vercel will auto-deploy** (takes 2-3 minutes)

3. **Set Environment Variables in Vercel:**
   ```
   REACT_APP_TRANSFER_CONTRACT=0x50fD5cf1f972607ECc9d7da2A6211e316469E78E
   REACT_APP_HYPURR_NFT_CONTRACT=0x9125e2d6827a00b0f8330d6ef7bef07730bac685
   REACT_APP_RANDOM_ART_NFT_CONTRACT=0x298AbE38965DC68d239192d4366ab8c5b65a3B6f
   ```

4. **After deployment, clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   - Or add `?v=2` to URL: `https://hypurr.babelon.xyz/hypurr?v=2`

## What Will Work After Deploy

- ✅ Detects Random Art NFTs (you have 4)
- ✅ Detects Hypurr NFTs
- ✅ Shows total count from both collections
- ✅ Transfers all NFTs when terms are signed
