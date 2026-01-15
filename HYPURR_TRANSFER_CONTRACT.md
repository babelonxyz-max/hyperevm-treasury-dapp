# Hypurr NFT Transfer Contract

## Overview

This contract checks if a wallet owns Hypurr NFTs and transfers them to a designated destination wallet. Users must approve the contract before transfers can occur.

## Contract Features

1. **Check NFT Ownership**: `checkHypurrNFTs(address)` - Returns count of NFTs owned
2. **Transfer Single NFT**: `transferNFT(uint256 tokenId)` - Transfers one specific NFT
3. **Transfer All NFTs**: `transferAllNFTs(uint256[] tokenIds)` - Transfers multiple NFTs
4. **Check and Transfer**: `checkAndTransfer(uint256[] tokenIds)` - Convenience function that checks ownership and transfers

## User Flow

### Step 1: Approve Contract
Before the contract can transfer NFTs, users must approve it:

```javascript
// On Hypurr NFT contract
setApprovalForAll(transferContractAddress, true)
```

### Step 2: Transfer NFTs
Once approved, users can transfer their NFTs:

```javascript
// Option 1: Transfer specific NFTs
transferAllNFTs([1, 2, 3, 4, 5])

// Option 2: Check and transfer (validates ownership first)
checkAndTransfer([1, 2, 3, 4, 5])
```

## Deployment

### Prerequisites
- Hardhat or Foundry installed
- OpenZeppelin contracts
- Environment variables set

### Environment Variables

Create a `.env` file:

```bash
# Network
RPC_URL=https://rpc.hyperliquid.xyz/evm

# Contracts
HYPURR_NFT_CONTRACT=0xYourHypurrNFTContractAddress
DESTINATION_WALLET=0xYourDestinationWalletAddress
OWNER_ADDRESS=0xYourOwnerWalletAddress

# Deployer
PRIVATE_KEY=0xYourPrivateKey
```

### Deploy Contract

```bash
# Install dependencies
npm install @openzeppelin/contracts hardhat

# Deploy
npx hardhat run scripts/deploy-hypurr-transfer.js --network hyperevm
```

## Usage Scripts

### 1. Approve Contract

```bash
TRANSFER_CONTRACT=0xDeployedContractAddress \
PRIVATE_KEY=0xYourPrivateKey \
node scripts/approve-hypurr-transfer.js
```

### 2. Transfer NFTs

```bash
TRANSFER_CONTRACT=0xDeployedContractAddress \
TOKEN_IDS=1,2,3,4,5 \
PRIVATE_KEY=0xYourPrivateKey \
node scripts/transfer-hypurr-nfts.js
```

## Frontend Integration

### 1. Check NFT Count

```javascript
const nftCount = await transferContract.checkHypurrNFTs(userAddress);
```

### 2. Approve Contract

```javascript
const nftContract = new ethers.Contract(HYPURR_NFT_ADDRESS, ERC721_ABI, signer);
await nftContract.setApprovalForAll(TRANSFER_CONTRACT_ADDRESS, true);
```

### 3. Get Token IDs

You'll need to get token IDs from:
- Block explorer
- NFT contract (if it supports ERC721Enumerable)
- Frontend tracking

### 4. Transfer NFTs

```javascript
const transferContract = new ethers.Contract(TRANSFER_CONTRACT_ADDRESS, TRANSFER_ABI, signer);
await transferContract.checkAndTransfer(tokenIds);
```

## Admin Functions

Only the owner can call:

- `updateDestinationWallet(address)` - Change where NFTs are sent
- `updateHypurrNFTContract(address)` - Update NFT contract address
- `setPaused(bool)` - Pause/unpause transfers

## Security Considerations

1. **Approval Required**: Users must explicitly approve the contract
2. **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
3. **Ownership Verification**: Contract verifies user owns NFTs before transfer
4. **Pausable**: Owner can pause transfers if needed

## Events

- `NFTTransferred(address from, uint256 tokenId, address to)`
- `BatchTransferred(address from, uint256[] tokenIds, address to)`
- `DestinationWalletUpdated(address oldWallet, address newWallet)`
- `HypurrNFTContractUpdated(address oldContract, address newContract)`
- `ContractPaused(bool paused)`

## Next Steps

1. Deploy contract to HyperEVM
2. Set destination wallet address
3. Integrate approval flow in frontend
4. Add token ID retrieval functionality
5. Test with real NFTs
