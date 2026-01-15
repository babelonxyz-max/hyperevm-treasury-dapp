# Hypurr Terms & Verification Page - Setup Guide

## ✅ What's Been Created

1. **`src/components/HypurrTerms.jsx`** - Main React component with:
   - Wallet connection (MetaMask/Web3)
   - Hypurr NFT verification
   - Terms signature acceptance
   - Local storage for signature persistence

2. **`src/components/HypurrTerms.css`** - Complete styling matching the Felix design

3. **Routing** - Added to `src/App.jsx`:
   - `/hypurr` - Hypurr Terms page
   - `/terms` - Alternative route (also Hypurr Terms)

## 🔧 Configuration Needed

### 1. Set Hypurr NFT Contract Address

Create a `.env` file in the root directory:

```bash
REACT_APP_HYPURR_NFT_CONTRACT=0xYourHypurrNFTContractAddress
```

Or update the default in `HypurrTerms.jsx`:
```javascript
const HYPURR_NFT_CONTRACT = "0xYourHypurrNFTContractAddress";
```

### 2. Features Implemented

✅ **Wallet Connection**
- Detects MetaMask/Web3 wallets
- Shows connected wallet address
- Handles account/chain changes

✅ **NFT Verification**
- Checks wallet for Hypurr NFTs using `balanceOf()`
- Displays NFT count
- Shows verification status

✅ **Terms Signature**
- Signs message with wallet
- Stores signature in localStorage
- Shows acceptance status

✅ **UI/UX**
- Matches Felix design aesthetic
- Responsive design
- Error handling
- Loading states

## 🚀 Usage

1. **Access the page:**
   - `http://localhost:6023/hypurr`
   - `http://localhost:6023/terms`

2. **User flow:**
   - User clicks "Connect Wallet"
   - Wallet connects and NFTs are verified
   - User reviews terms
   - User clicks "Accept Terms & Sign"
   - Signature is stored locally

## 📝 Next Steps

1. **Add Hypurr NFT Contract Address** - Update `.env` or component
2. **Customize Terms Content** - Edit the terms text in `HypurrTerms.jsx`
3. **Add Backend Verification** (optional) - Verify signatures server-side
4. **Deploy to Vercel** - Set up subdomain routing for `hypurr.babelon.xyz`

## 🔗 Vercel Configuration

For subdomain routing, update `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/hypurr",
      "destination": "/index.html"
    },
    {
      "source": "/terms",
      "destination": "/index.html"
    }
  ]
}
```

## 🎨 Customization

- **Colors**: Update CSS variables in `HypurrTerms.css`
- **Logo**: Change "Hypurr" to your branding
- **Terms Content**: Edit the terms sections in `HypurrTerms.jsx`
- **Footer Links**: Update social/community links

## 📦 Dependencies

- `react-router-dom` - Already installed
- `ethers` - Already installed
- React hooks for state management

## 🐛 Troubleshooting

- **NFTs not showing**: Check contract address is correct
- **Wallet not connecting**: Ensure MetaMask is installed
- **Signature failing**: Check wallet is unlocked
- **Routing not working**: Ensure BrowserRouter wraps the app
