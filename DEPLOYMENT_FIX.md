# Vercel Deployment Not Triggering - Fix Guide

## Problem
Commits are being pushed to GitHub successfully, but Vercel is not auto-deploying them.

## Solution

### Option 1: Reconnect Git Integration (Recommended)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Open your project: `hyperevm-treasury-dapp`
3. Go to **Settings** → **Git**
4. **Disconnect** the GitHub repository
5. **Reconnect** it again
6. Ensure **Production Branch** is set to `main`
7. Ensure **Auto-deploy** is enabled

### Option 2: Manual Deployment

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or click **"Deploy"** → **"Deploy from GitHub"**
4. Select the latest commit (`d05c09f` or newer)

### Option 3: Check Webhook Status

1. Go to **Vercel Dashboard** → **Settings** → **Git**
2. Check **"Webhook Status"**
3. If webhook is failing, reconnect the repository

### Option 4: Use Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod --force
```

## Current Status

- ✅ Commits are being pushed to GitHub successfully
- ✅ Latest commit: `d05c09f` (v1.0.0.13)
- ❌ Vercel not auto-deploying (last deployment: `92ba98e` from 36+ minutes ago)

## Verification

After fixing, check:
1. Vercel Dashboard → Deployments (should show new deployment)
2. Website header should show version v1.0.0.13
3. Hard refresh browser to clear cache
