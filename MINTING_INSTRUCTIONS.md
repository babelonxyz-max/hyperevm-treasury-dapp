# Minting Test NFTs - Instructions

## Quick Start

To mint 5-10 test NFTs, run:

```bash
TARGET_WALLET=0xYourTestWalletAddress \
PRIVATE_KEY=0xOwnerPrivateKey \
QUANTITY=7 \
node scripts/mint-hypurr-nft.js
```

## Requirements

1. **Owner Private Key**: The contract owner is `0xdc97B8A7023C5e29b1Ca17eD9E850b8Ba457D610`
   - You need the private key for this address
   - Or an address with minting permissions

2. **Test Wallet Address**: Where to mint the NFTs
   - Can be any wallet address
   - Will receive the minted NFTs

3. **Gas Fees**: Need HYPE for transaction fees
   - Each mint requires gas
   - Estimate: ~0.001-0.01 HYPE per NFT

## Example

```bash
# Mint 7 NFTs to test wallet
TARGET_WALLET=0xbd24E200A8A7bE83c810039a073E18abD8362B6e \
PRIVATE_KEY=0xOwnerPrivateKey \
QUANTITY=7 \
node scripts/mint-hypurr-nft.js
```

## Verification

After minting, verify:
1. Check NFT balance: `balanceOf(TARGET_WALLET)` should show the minted count
2. Check total supply increased
3. NFTs should be visible in wallet/explorer

## Next Steps

After minting:
1. Connect test wallet to terms page
2. Verify NFT count displays correctly
3. Test terms acceptance
4. Test automatic transfer
