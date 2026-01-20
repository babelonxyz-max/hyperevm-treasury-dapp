# Signature-Based NFT Transfer Implementation

## Overview

This implementation allows users to sign an EIP-712 message authorizing NFT transfers when they accept terms. The signatures are stored and can be used later to transfer NFTs without requiring the user's wallet to be connected.

## How It Works

1. **User accepts terms** → Signs terms message
2. **NFTs are verified** → System checks which NFTs user owns
3. **User approves contract** → Grants transfer permission
4. **User signs EIP-712 message** → Authorizes future transfers (NEW)
5. **Signature stored** → Saved in localStorage
6. **Later transfer** → Anyone can use stored signature to transfer (no user interaction needed)

## Files Created/Modified

### New Contract
- `contracts/HypurrNFTTransferWithSignature.sol` - Enhanced contract with `transferNFTsWithSignature()` function

### Frontend Changes
- `src/components/HypurrTerms.jsx` - Added `getTransferSignatures()` function and integrated it into the terms signing flow

### Scripts
- `transfer-with-stored-signature.js` - Script to transfer NFTs using stored signatures

## Contract Function

```solidity
function transferNFTsWithSignature(
    address owner,
    address nftContract,
    uint256[] calldata tokenIds,
    uint256 deadline,
    bytes calldata signature
) external nonReentrant
```

This function:
- Verifies the EIP-712 signature
- Checks that signature hasn't expired
- Validates nonce to prevent replay attacks
- Checks that contract is approved
- Transfers NFTs to destination wallet

## Frontend Implementation

### Signature Collection

When user signs terms and approves NFTs, the system now also requests an EIP-712 signature:

```javascript
// Automatically called after approval
await getTransferSignatures(signer, account, verificationResult.tokenIds);
```

### Signature Storage

Signatures are stored in localStorage:
- Key: `transfer_signature_{wallet}_{contractAddress}`
- Contains: signature, deadline, nonce, tokenIds, timestamp

### Using Stored Signatures

```javascript
// Get stored signature
const sigData = JSON.parse(localStorage.getItem(`transfer_signature_${wallet}_${contract}`));

// Transfer using signature
await transferContract.transferNFTsWithSignature(
  wallet,
  contract,
  tokenIds,
  deadline,
  signature
);
```

## Deployment

### Option 1: Deploy New Contract

1. Deploy `HypurrNFTTransferWithSignature.sol`:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy-transfer-with-signature.js --network hyperevm
   ```

2. Update `REACT_APP_TRANSFER_CONTRACT` environment variable

### Option 2: Use Existing Contract (Limited)

The frontend will collect signatures even with the old contract. However, you'll need to deploy the new contract to actually use them for transfers.

## Usage

### Collect Signatures (Automatic)

Signatures are automatically collected when users:
1. Connect wallet
2. Sign terms
3. Approve NFT contract

### Transfer Using Signatures

```bash
# Set environment variables
export PRIVATE_KEY=0x... # Contract owner or authorized signer
export NFT_OWNER_WALLET=0x67252aCF497134CC5c8f840a38b5f59Fc090Af83
export TRANSFER_SIGNATURES='{"0x298AbE...":{"signature":"0x...","deadline":1234567890,...}}'

# Run transfer script
node transfer-with-stored-signature.js
```

Or from browser console:
```javascript
// Get stored signatures
const sigs = JSON.parse(localStorage.getItem(`transfer_signatures_${wallet}`));

// Use them to transfer
// (Requires new contract with transferNFTsWithSignature function)
```

## Benefits

1. **Gasless for users** - User only pays gas for approval, not transfers
2. **Batch transfers** - Can transfer multiple NFTs in one transaction
3. **No user interaction** - Transfers can happen anytime after signature
4. **Secure** - Uses EIP-712 standard, nonce prevents replay attacks
5. **Flexible** - Signatures valid for 1 year (configurable)

## Security Features

- ✅ EIP-712 typed data signing (industry standard)
- ✅ Nonce tracking prevents replay attacks
- ✅ Deadline prevents expired signatures
- ✅ Signature verification ensures only owner can authorize
- ✅ Approval check ensures contract is authorized

## Next Steps

1. Deploy new contract with signature support
2. Update frontend to use new contract address
3. Test signature collection flow
4. Test transfer using stored signatures
5. Deploy to production

## Notes

- Signatures are stored in localStorage (browser only)
- For Node.js scripts, pass signatures via environment variable
- Signatures expire after deadline (default: 1 year)
- Each signature can only be used once (nonce increments)
