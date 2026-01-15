# Deploy HypurrNFTTransfer Contract - Instructions

## Prerequisites

1. **Hardhat Setup**:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/hardhat-upgrades
npm install @openzeppelin/contracts-upgradeable
```

2. **Environment Variables** (create `.env`):
```bash
RPC_URL=https://rpc.hyperliquid.xyz/evm
PRIVATE_KEY=0xYourPrivateKey
DESTINATION_WALLET=0xYourDestinationWallet
OWNER_ADDRESS=0xYourOwnerWallet
INITIAL_NFT_CONTRACTS=0x9125e2d6827a00b0f8330d6ef7bef07730bac685
```

## Deployment Steps

### 1. Deploy Contract

```bash
npx hardhat run scripts/deploy-hypurr-transfer-upgradeable.js --network hyperevm
```

This will:
- Deploy proxy contract (user-facing address)
- Deploy implementation contract (logic)
- Initialize with destination wallet and owner
- Add Hypurr NFT contract to whitelist

### 2. Save Contract Addresses

After deployment, save:
- **Proxy Address**: The address users interact with
- **Implementation Address**: For future upgrades

### 3. Configure Frontend

Set environment variable:
```bash
REACT_APP_TRANSFER_CONTRACT=0xProxyAddress
```

## Post-Deployment

1. **Verify Deployment**:
   - Check contract on block explorer
   - Verify destination wallet is set
   - Verify Hypurr NFT contract is enabled

2. **Test Functions**:
   - `checkNFTs(nftContract, wallet)` - Check NFT count
   - `isNFTContractEnabled(nftContract)` - Verify contract enabled
   - `destinationWallet()` - Verify destination

3. **Update Frontend**:
   - Set `REACT_APP_TRANSFER_CONTRACT` in Vercel
   - Redeploy frontend

## Important Notes

- Proxy address is what users interact with
- Implementation can be upgraded without changing proxy
- All state is stored in proxy
- Destination wallet can be changed by owner
