# Clear Cache Instructions

## Domain
**https://hypurr.babelon.xyz/hypurr**

## Browser Cache Clearing

### Chrome/Edge:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Firefox:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Safari:
1. Cmd+Option+E (clear cache)
2. Cmd+Shift+R (hard reload)

## Vercel Cache

The new code needs to be deployed first. After deployment:
1. Vercel may cache for a few minutes
2. Add `?v=2` to URL to bypass: `https://hypurr.babelon.xyz/hypurr?v=2`
3. Or wait 5-10 minutes for cache to clear

## Environment Variables to Set

Make sure these are set in Vercel Dashboard:
```
REACT_APP_TRANSFER_CONTRACT=0x50fD5cf1f972607ECc9d7da2A6211e316469E78E
REACT_APP_HYPURR_NFT_CONTRACT=0x9125e2d6827a00b0f8330d6ef7bef07730bac685
REACT_APP_RANDOM_ART_NFT_CONTRACT=0x298AbE38965DC68d239192d4366ab8c5b65a3B6f
```
