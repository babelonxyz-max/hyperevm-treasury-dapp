# Deploy Transfer Contract via Remix IDE

## Step-by-Step Instructions

### 1. Open Remix IDE
- Go to https://remix.ethereum.org
- Create a new file: `HypurrNFTTransfer.sol` in the `contracts` folder

### 2. Copy Contract Code
Copy the entire contents of `contracts/HypurrNFTTransfer.sol` into Remix

### 3. Install Dependencies in Remix
- Go to "File Explorer" → "contracts" folder
- Click the "+" button to create new files
- Create these files with OpenZeppelin imports:

**Option A: Use Remix's GitHub Import**
- In Remix, go to "File Explorer"
- Click "Load from GitHub"
- Enter: `OpenZeppelin/openzeppelin-contracts-upgradeable`
- This will load the contracts

**Option B: Manual Import (if GitHub doesn't work)**
- You may need to copy OpenZeppelin contracts manually
- Or use Remix's built-in import resolver

### 4. Compile
- Go to "Solidity Compiler" tab
- Set compiler version: `0.8.20` or `0.8.21`
- Click "Compile HypurrNFTTransfer.sol"
- Check for errors and fix if needed

### 5. Deploy Configuration

**Network Setup:**
- Go to "Deploy & Run Transactions" tab
- Environment: Select "Injected Provider - MetaMask"
- Make sure MetaMask is connected to HyperEVM (Chain ID: 999)
- RPC: `https://rpc.hyperliquid.xyz/evm`

**Deployment Parameters:**
- Contract: Select `HypurrNFTTransfer`
- Use the UUPS Proxy pattern

### 6. Deploy Using UUPS Proxy

**Step 6a: Deploy Implementation**
1. In Remix, deploy `HypurrNFTTransfer` directly (this deploys the implementation)
2. Save the implementation address

**Step 6b: Deploy Proxy (Manual)**
Since Remix doesn't have built-in UUPS proxy deployment, you'll need to:

**Option 1: Use Hardhat Script (After fixing compiler)**
```bash
# Once compiler is fixed
DESTINATION_WALLET=0xbd24E200A8A7bE83c810039a073E18abD8362B6e \
OWNER_ADDRESS=0x29c1319f090c52e61c7099FD400234Fe83a82bB7 \
INITIAL_NFT_CONTRACTS=0x9125e2d6827a00b0f8330d6ef7bef07730bac685,0x298AbE38965DC68d239192d4366ab8c5b65a3B6f \
PRIVATE_KEY=0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61 \
npx hardhat run scripts/deploy-hypurr-transfer-upgradeable.js --network hyperevm
```

**Option 2: Deploy Non-Upgradeable Version (Simpler)**
Create a simpler non-upgradeable version for Remix deployment.

### 7. Initialize Contract
After deploying, call `initialize()` with:
- `_destinationWallet`: `0xbd24E200A8A7bE83c810039a073E18abD8362B6e`
- `_owner`: `0x29c1319f090c52e61c7099FD400234Fe83a82bB7`

### 8. Add NFT Contracts
After initialization, call:
- `addNFTContract(0x9125e2d6827a00b0f8330d6ef7bef07730bac685)` - Hypurr
- `addNFTContract(0x298AbE38965DC68d239192d4366ab8c5b65a3B6f)` - Random Art

## Alternative: Deploy Non-Upgradeable Version

If UUPS proxy is too complex in Remix, I can create a simpler non-upgradeable version that works the same way but can't be upgraded.
