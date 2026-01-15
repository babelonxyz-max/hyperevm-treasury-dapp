# Deploy to nft.babelon.xyz - Staging Instructions

## 🚀 Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Add Hypurr Terms page with NFT verification"
   git push origin main
   ```

2. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Domains"
   - Add `nft.babelon.xyz` as a custom domain
   - Vercel will auto-deploy on push

3. **DNS Configuration:**
   - In Cloudflare (or your DNS provider):
   - Add CNAME record:
     - Name: `nft`
     - Target: `cname.vercel-dns.com`
   - Or use A record pointing to Vercel's IPs

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel --prod

# Add domain
vercel domains add nft.babelon.xyz
```

## 📋 Vercel Configuration

The `vercel.json` is already configured for SPA routing. It will:
- Route `/hypurr` and `/terms` to the React app
- Handle API routes correctly
- Serve the app at `nft.babelon.xyz`

## ✅ Verification

After deployment, verify:
1. `https://nft.babelon.xyz` loads the app
2. `https://nft.babelon.xyz/hypurr` shows Hypurr Terms page
3. Wallet connection works
4. NFT verification works (once contract address is set)

## 🔧 Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:
- `REACT_APP_HYPURR_NFT_CONTRACT` = Your Hypurr NFT contract address

## 📝 Notes

- Staging deployment allows testing before production
- Changes auto-deploy on git push
- Can preview before adding to main domain
