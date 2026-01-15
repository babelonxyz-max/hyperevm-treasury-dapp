# Deploy to nft.babelon.xyz - Complete Instructions

## ✅ Code is Ready!

The Hypurr Terms page has been committed and is ready to deploy. Here's how to complete the deployment:

## 🚀 Method 1: Git Push (Recommended - Auto-Deploy)

Since git push requires authentication, please run:

```bash
git push origin main
```

This will trigger Vercel's auto-deployment.

## 🚀 Method 2: Vercel CLI

1. **Login to Vercel:**
   ```bash
   npx vercel login
   ```

2. **Deploy:**
   ```bash
   npx vercel --prod
   ```

3. **Add Domain:**
   ```bash
   npx vercel domains add nft.babelon.xyz
   ```

## 🚀 Method 3: Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project

2. **Add Domain:**
   - Go to Settings → Domains
   - Click "Add Domain"
   - Enter: `nft.babelon.xyz`
   - Vercel will provide DNS instructions

3. **Configure DNS (Cloudflare):**
   - Add CNAME record:
     - Name: `nft`
     - Target: `cname.vercel-dns.com`
     - Proxy: Off (or On, your choice)

## 📋 What's Been Deployed

✅ Hypurr Terms page component
✅ Wallet connection functionality
✅ NFT verification (balanceOf)
✅ Terms signature acceptance
✅ Updated header aligned with usefelix.xyz
✅ Responsive design
✅ Routing configured for `/hypurr` and `/terms`

## 🔧 Environment Variables to Set

In Vercel Dashboard → Settings → Environment Variables, add:

```
REACT_APP_HYPURR_NFT_CONTRACT=0xYourHypurrNFTContractAddress
```

## ✅ After Deployment

1. Visit: `https://nft.babelon.xyz/hypurr`
2. Test wallet connection
3. Test NFT verification
4. Test terms signature

## 📝 Next Steps

1. **Set NFT Contract Address** - Update environment variable
2. **Test the Page** - Verify all functionality works
3. **Plan NFT Logic** - Review `NFT_LOGIC_PLAN.md` for next features

## 🐛 Troubleshooting

- **Domain not working?** Check DNS propagation (can take up to 48 hours)
- **Page not loading?** Check Vercel deployment logs
- **Wallet not connecting?** Ensure MetaMask is installed
- **NFTs not showing?** Verify contract address is correct
