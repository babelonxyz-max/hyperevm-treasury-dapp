# Deployment Setup - Separate Domain

## Option 1: New Vercel Project (Recommended for Separate Domain)

### Steps:

1. **Create New Vercel Project**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Import repository or create new
   - Name: `hypurr-terms` or similar

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add domain: `terms.babelon.xyz` (or your chosen domain)
   - Follow DNS instructions

4. **Set Environment Variables**
   ```
   REACT_APP_HYPURR_NFT_CONTRACT=0x9125e2d6827a00b0f8330d6ef7bef07730bac685
   REACT_APP_TRANSFER_CONTRACT=<deployed_contract_address>
   ```

5. **Deploy**
   - Push to repository
   - Vercel auto-deploys
   - Or manually trigger deployment

## Option 2: New Subdomain (Same Project)

### Steps:

1. **Add Subdomain in Vercel**
   - Go to existing project
   - Settings → Domains
   - Add: `terms.babelon.xyz`

2. **Configure DNS (Cloudflare)**
   - Add CNAME record:
     - Name: `terms`
     - Target: `cname.vercel-dns.com`
     - Proxy: Off (or On)

3. **Set Environment Variables**
   - Same as Option 1

4. **Update Routing (if needed)**
   - `vercel.json` already configured for SPA routing
   - `/hypurr` and `/terms` routes work

## DNS Configuration

### Cloudflare Setup:
1. Go to Cloudflare Dashboard
2. Select `babelon.xyz` domain
3. DNS → Records
4. Add CNAME:
   - Type: CNAME
   - Name: `terms` (or your subdomain)
   - Target: `cname.vercel-dns.com`
   - Proxy status: Off (recommended) or On
5. Save

### Wait for Propagation:
- DNS changes can take 5 minutes to 48 hours
- Usually propagates within 1-2 hours

## Environment Variables

### Required:
- `REACT_APP_HYPURR_NFT_CONTRACT` - Hypurr NFT contract address
- `REACT_APP_TRANSFER_CONTRACT` - Transfer contract proxy address

### Optional:
- `REACT_APP_RPC_URL` - Custom RPC endpoint (defaults to HyperEVM)

## Post-Deployment Verification

1. **Domain Resolution**
   - Visit domain in browser
   - Should load terms page

2. **Functionality Test**
   - Connect wallet
   - Verify NFT count
   - Sign terms
   - Check automatic transfer

3. **Performance Check**
   - Page load time
   - Wallet connection speed
   - Transaction execution

## Troubleshooting

### Domain Not Resolving:
- Check DNS records in Cloudflare
- Verify nameservers point to Cloudflare
- Wait for DNS propagation
- Check Vercel domain configuration

### Build Errors:
- Check environment variables
- Verify build logs
- Check Node version compatibility

### Functionality Issues:
- Verify environment variables set correctly
- Check contract addresses are valid
- Verify network (HyperEVM) is correct
- Check browser console for errors
