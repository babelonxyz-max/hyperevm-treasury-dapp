# Hypurr NFT Transfer Contract - Upgradeable Version

## Overview

This is an **upgradeable** contract using OpenZeppelin's UUPS (Universal Upgradeable Proxy Standard) pattern. It allows:
- ✅ Changing NFT collection addresses (add/remove multiple collections)
- ✅ Accepting all NFTs (no whitelist required)
- ✅ Changing destination wallet address
- ✅ Upgrading contract logic without losing data

## Key Features

### 1. Multiple NFT Collections
- Add multiple NFT contract addresses
- Remove NFT contracts from whitelist
- Enable "accept all NFTs" mode (no whitelist)

### 2. Flexible Configuration
- Update destination wallet anytime
- Pause/unpause transfers
- View all enabled NFT contracts

### 3. Upgradeable
- Upgrade contract logic without losing data
- Add new functions in future versions
- Preserve all existing state

## Contract Functions

### User Functions

#### `checkNFTs(address nftContract, address wallet)`
Check how many NFTs a wallet owns from a specific contract.

#### `checkAllNFTs(address wallet)`
Check total NFTs owned across all enabled contracts.

#### `transferNFT(address nftContract, uint256 tokenId)`
Transfer a single NFT from a specific contract.

#### `transferNFTs(address nftContract, uint256[] tokenIds)`
Transfer multiple NFTs from a specific contract.

#### `transferNFTsFromMultiple(address[] nftContracts, uint256[][] tokenIdsArray)`
Transfer NFTs from multiple contracts in one transaction.

#### `checkAndTransfer(address nftContract, uint256[] tokenIds)`
Check ownership and transfer NFTs (convenience function).

### Admin Functions (Owner Only)

#### `updateDestinationWallet(address newDestination)`
Change where NFTs are sent.

#### `addNFTContract(address nftContract)`
Add an NFT contract to the whitelist.

#### `removeNFTContract(address nftContract)`
Remove an NFT contract from the whitelist.

#### `setAcceptAllNFTs(bool acceptAll)`
Enable/disable accepting all NFTs (bypass whitelist).

#### `setPaused(bool paused)`
Pause/unpause all transfers.

#### `getEnabledNFTContracts()`
Get list of all enabled NFT contracts.

#### `getEnabledNFTContractCount()`
Get count of enabled NFT contracts.

## Deployment

### Prerequisites

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/hardhat-upgrades
npm install @openzeppelin/contracts-upgradeable
```

### Environment Variables

Create `.env` file:

```bash
RPC_URL=https://rpc.hyperliquid.xyz/evm
PRIVATE_KEY=0xYourPrivateKey
DESTINATION_WALLET=0xYourDestinationWallet
OWNER_ADDRESS=0xYourOwnerWallet
INITIAL_NFT_CONTRACTS=0xNFT1,0xNFT2,0xNFT3  # Optional, comma-separated
```

### Deploy

```bash
npx hardhat run scripts/deploy-hypurr-transfer-upgradeable.js --network hyperevm
```

This will deploy:
- **Proxy Contract**: The address users interact with (keeps state)
- **Implementation Contract**: The actual logic (can be upgraded)

## Upgrading the Contract

### 1. Create New Version

Create `contracts/HypurrNFTTransferV2.sol` (example provided).

### 2. Deploy Upgrade

```bash
PROXY_ADDRESS=0xYourProxyAddress \
npx hardhat run scripts/upgrade-hypurr-transfer.js --network hyperevm
```

### 3. Initialize New Version (if needed)

If you add new storage variables, call `initializeV2()` after upgrade.

## Usage Examples

### Add NFT Contract

```javascript
await transferContract.addNFTContract("0xNFTContractAddress");
```

### Enable All NFTs

```javascript
await transferContract.setAcceptAllNFTs(true);
```

### Transfer NFTs

```javascript
// User must approve first
await nftContract.setApprovalForAll(transferContractAddress, true);

// Then transfer
await transferContract.checkAndTransfer(
  nftContractAddress,
  [1, 2, 3, 4, 5]  // token IDs
);
```

### Transfer from Multiple Contracts

```javascript
await transferContract.transferNFTsFromMultiple(
  [contract1, contract2],  // NFT contracts
  [[1, 2, 3], [4, 5]]      // Token IDs for each contract
);
```

## Frontend Integration

### 1. Check if NFT Contract is Enabled

```javascript
const isEnabled = await transferContract.isNFTContractEnabled(nftContractAddress);
```

### 2. Get Enabled Contracts

```javascript
const enabledContracts = await transferContract.getEnabledNFTContracts();
```

### 3. Check NFT Count

```javascript
const count = await transferContract.checkNFTs(nftContractAddress, userAddress);
```

### 4. Approve and Transfer

```javascript
// Approve
await nftContract.setApprovalForAll(transferContractAddress, true);

// Transfer
await transferContract.checkAndTransfer(nftContractAddress, tokenIds);
```

## Security

- ✅ **UUPS Upgradeable**: Only owner can upgrade
- ✅ **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- ✅ **Ownership Verification**: Verifies user owns NFTs before transfer
- ✅ **Pausable**: Can pause all transfers if needed
- ✅ **Approval Required**: Users must explicitly approve

## Events

- `NFTTransferred(address nftContract, address from, uint256 tokenId, address to)`
- `BatchTransferred(address nftContract, address from, uint256[] tokenIds, address to)`
- `DestinationWalletUpdated(address oldWallet, address newWallet)`
- `NFTContractAdded(address nftContract)`
- `NFTContractRemoved(address nftContract)`
- `AcceptAllNFTsUpdated(bool acceptAll)`
- `ContractPaused(bool paused)`

## Migration from Non-Upgradeable Version

If you deployed the non-upgradeable version, you'll need to:
1. Deploy the new upgradeable contract
2. Users will need to approve the new contract
3. Update frontend to use new contract address

## Next Steps

1. Deploy to HyperEVM
2. Add NFT contract addresses
3. Set destination wallet
4. Integrate in frontend
5. Test with real NFTs
