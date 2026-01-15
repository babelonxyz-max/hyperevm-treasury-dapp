# Remix Deployment - Quick Steps

## Contract to Deploy: HypurrNFTTransferSimple

This is a simpler non-upgradeable version that works the same way but is easier to deploy via Remix.

## Step 1: Open Remix
1. Go to https://remix.ethereum.org
2. Create new file: `contracts/HypurrNFTTransferSimple.sol`

## Step 2: Copy Contract Code
Copy the entire contents of `contracts/HypurrNFTTransferSimple.sol` into Remix

## Step 3: Import OpenZeppelin
In Remix, you can use GitHub imports:
- Click "File Explorer"
- Click "Load from GitHub" 
- Enter: `OpenZeppelin/openzeppelin-contracts`
- This loads OpenZeppelin contracts automatically

## Step 4: Compile
1. Go to "Solidity Compiler" tab
2. Set compiler to `0.8.20`
3. Click "Compile HypurrNFTTransferSimple.sol"
4. Check for errors (should compile cleanly)

## Step 5: Deploy
1. Go to "Deploy & Run Transactions" tab
2. Environment: "Injected Provider - MetaMask"
3. **IMPORTANT**: Make sure MetaMask is connected to HyperEVM
   - Network: HyperEVM
   - Chain ID: 999
   - RPC: https://rpc.hyperliquid.xyz/evm
4. Select contract: `HypurrNFTTransferSimple`
5. In "Deploy" section, enter constructor parameter:
   - `_destinationWallet`: `0xbd24E200A8A7bE83c810039a073E18abD8362B6e`
6. Click "Deploy"
7. Confirm transaction in MetaMask

## Step 6: Add NFT Contracts
After deployment, you'll see the contract in "Deployed Contracts" section.

### Add Hypurr NFT:
1. Expand the deployed contract
2. Find `addNFTContract` function
3. Enter: `0x9125e2d6827a00b0f8330d6ef7bef07730bac685`
4. Click "addNFTContract"
5. Confirm transaction

### Add Random Art NFT:
1. Find `addNFTContract` function again
2. Enter: `0x298AbE38965DC68d239192d4366ab8c5b65a3B6f`
3. Click "addNFTContract"
4. Confirm transaction

## Step 7: Verify
1. Call `getEnabledNFTContracts()` - should return both addresses
2. Call `isNFTContractEnabled(0x9125e2d6827a00b0f8330d6ef7bef07730bac685)` - should return `true`
3. Call `isNFTContractEnabled(0x298AbE38965DC68d239192d4366ab8c5b65a3B6f)` - should return `true`

## Save Contract Address
After deployment, save the contract address - you'll need it for:
- Frontend environment variable: `REACT_APP_TRANSFER_CONTRACT`
- Testing scripts

## Summary
- ✅ Deploy `HypurrNFTTransferSimple` with destination: `0xbd24E200A8A7bE83c810039a073E18abD8362B6e`
- ✅ Add Hypurr: `0x9125e2d6827a00b0f8330d6ef7bef07730bac685`
- ✅ Add Random Art: `0x298AbE38965DC68d239192d4366ab8c5b65a3B6f`

Both collections will then be enabled for automatic transfer!
