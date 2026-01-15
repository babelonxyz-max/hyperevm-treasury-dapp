# Mint Hypurr NFTs for Testing

## Quick Start

### 1. Set Environment Variables

```bash
export PRIVATE_KEY=0xYourPrivateKey
export TARGET_WALLET=0xWalletToReceiveNFTs
export QUANTITY=5  # Number of NFTs to mint (optional, default: 1)
```

### 2. Run Mint Script

```bash
node scripts/mint-hypurr-nft.js
```

## Contract Info

- **Contract Address**: `0x9125e2d6827a00b0f8330d6ef7bef07730bac685`
- **Name**: Hypurr
- **Symbol**: HYPURR
- **Total Supply**: 4600
- **Owner**: `0xdc97B8A7023C5e29b1Ca17eD9E850b8Ba457D610`

## Available Mint Functions

The script tries these functions in order:
1. `mint(address)` - Single mint
2. `safeMint(address)` - Safe single mint
3. `mintTo(address)` - Mint to address
4. `mint(address,uint256)` - Mint with quantity
5. `safeMint(address,uint256)` - Safe mint with quantity
6. `mintTo(address,uint256)` - Mint to with quantity
7. `adminMint(address,uint256)` - Admin mint
8. `ownerMint(address,uint256)` - Owner mint

## Requirements

### For Minting:
- ✅ Contract owner address OR
- ✅ Address with minting role/permissions
- ✅ Sufficient gas (HYPE) for transactions

### Check if You Can Mint:

1. **Check if you're the owner:**
   ```bash
   node scripts/check-hypurr-nft-contract.js
   ```
   Compare the owner address with your wallet address.

2. **If not owner:**
   - You may need a role/permission
   - Contact contract owner to grant minting permissions
   - Or use owner's private key

## Example Usage

### Mint 1 NFT:
```bash
TARGET_WALLET=0xbd24E200A8A7bE83c810039a073E18abD8362B6e \
PRIVATE_KEY=0xYourPrivateKey \
node scripts/mint-hypurr-nft.js
```

### Mint 5 NFTs:
```bash
TARGET_WALLET=0xbd24E200A8A7bE83c810039a073E18abD8362B6e \
PRIVATE_KEY=0xYourPrivateKey \
QUANTITY=5 \
node scripts/mint-hypurr-nft.js
```

## Testing Transfer Function

After minting NFTs:

1. **Connect wallet with NFTs** to the terms page
2. **Sign terms** - NFTs will automatically transfer
3. **Check destination wallet** for received NFTs

## Troubleshooting

### "Function not found"
- Contract may use different function names
- Check contract source code or ABI

### "Unauthorized" or "Access denied"
- You're not the contract owner
- You don't have minting permissions
- Use owner's private key or get permissions

### "Insufficient funds"
- Need HYPE for gas
- Fund your wallet with HYPE

### "Contract paused"
- Minting is paused
- Contact contract owner to unpause

## Next Steps

After minting NFTs:
1. ✅ NFTs are in target wallet
2. ✅ Test the transfer function on terms page
3. ✅ Verify NFTs transfer to destination wallet automatically
