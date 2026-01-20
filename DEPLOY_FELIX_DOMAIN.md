# Deploy to felix-foundation.xyz

## Step 1: Configure DNS on Namecheap

1. **Log into Namecheap**
   - Go to https://www.namecheap.com
   - Navigate to Domain List → Manage `felix-foundation.xyz`

2. **Add DNS Records**
   - Go to **Advanced DNS** tab
   - Add these records:

   **For Root Domain (felix-foundation.xyz):**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

   **OR use Vercel's recommended approach:**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   
   Type: A Record
   Host: @
   Value: 76.223.126.88
   TTL: Automatic
   ```

3. **Save Changes**
   - Wait 5-30 minutes for DNS propagation

## Step 2: Add Domain to Vercel

### Option A: Using Vercel CLI (Recommended)

Run this script:
```bash
bash setup-felix-domain.sh
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (hyperevm-treasury-dapp)
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `felix-foundation.xyz`
6. Click **Add**
7. Also add: `www.felix-foundation.xyz`
8. Follow Vercel's DNS instructions if needed

## Step 3: Verify DNS Configuration

After adding domain in Vercel, it will show DNS records to add. Use those instead if different from above.

## Step 4: Deploy

Once DNS is configured:
```bash
bash deploy-all.sh
```

The site will be available at:
- https://felix-foundation.xyz
- https://www.felix-foundation.xyz

## Troubleshooting

- **DNS Propagation**: Can take up to 48 hours, usually 1-2 hours
- **SSL Certificate**: Vercel automatically provisions SSL (may take a few minutes)
- **Check DNS**: Use `dig felix-foundation.xyz` or https://dnschecker.org
