# Vercel KV Setup Instructions

## Overview

The signature storage now uses Vercel KV (Redis) for persistent storage. You need to set up Vercel KV in your Vercel project.

## Setup Steps

### 1. Create Vercel KV Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **KV** (Redis)
5. Choose a name (e.g., `babelon-signatures`)
6. Select a region (choose closest to your users)
7. Click **Create**

### 2. Get Connection Details

After creating the KV database:

1. Go to **Storage** → Your KV database
2. Click **.env.local** tab
3. Copy the environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Add Environment Variables to Vercel

1. Go to your project **Settings** → **Environment Variables**
2. Add all 4 variables from step 2:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`
   - `KV_REST_API_READ_ONLY_TOKEN`
3. Make sure they're available for **Production**, **Preview**, and **Development**
4. Click **Save**

### 4. Redeploy

After adding environment variables:

```bash
# Redeploy to apply changes
npx vercel --prod --force
```

Or trigger a redeploy from Vercel dashboard.

## Verification

After setup, test the API:

```bash
# Test storing a signature
curl -X POST https://babelon.xyz/api/store-signature \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83",
    "signature": "0x1234...",
    "nftContract": "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f",
    "tokenIds": ["1", "2", "3"],
    "deadline": 1735689600,
    "nonce": 0
  }'

# Test retrieving signatures
curl "https://babelon.xyz/api/get-signatures?wallet=0x67252aCF497134CC5c8f840a38b5f59Fc090Af83"
```

## Troubleshooting

### Error: "KV storage not configured"

This means the KV environment variables are not set. Follow steps 2-3 above.

### Error: "Connection refused" or "Redis error"

- Check that KV database is created and running
- Verify environment variables are correct
- Make sure variables are set for the correct environment (Production/Preview)

### Signatures not persisting

- Check KV database in Vercel dashboard to see if data is stored
- Verify TTL (time-to-live) is set correctly
- Check that environment variables are available in production

## Alternative: Use Without KV (Fallback)

If you don't want to use KV right now, the API will return an error when KV is not configured, but the frontend will still store signatures in localStorage as a backup. However, you won't be able to retrieve them from the server.

For production, KV (or another database) is required.
