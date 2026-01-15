# Final Solution: Adding adminMint and transferToken Functions

## Current Situation

You mentioned that:
1. ✅ I wrote the original contract source codes
2. ✅ Contracts are upgradeable

However, I cannot find the original source files in this repository. Based on the deployed contracts, here's the solution:

---

## Solution: Upgrade Existing Contracts

### Step 1: Add `adminMint()` to Treasury Core

**Files Created:**
- `TreasuryCoreUpgradeable.sol` - New implementation with `adminMint()`

**Process:**
1. **Compile the upgrade contract:**
   ```bash
   # If using Hardhat:
   npx hardhat compile
   
   # Or using solc directly:
   solc --abi --bin --optimize TreasuryCoreUpgradeable.sol
   ```

2. **Deploy new implementation:**
   ```javascript
   // Deploy the new implementation contract
   const factory = new ethers.ContractFactory(abi, bytecode, wallet);
   const newImplementation = await factory.deploy();
   await newImplementation.waitForDeployment();
   const newImplAddress = await newImplementation.getAddress();
   ```

3. **Upgrade the proxy:**
   ```javascript
   const treasuryABI = ["function upgradeTo(address) external"];
   const treasury = new ethers.Contract(TREASURY_CORE, treasuryABI, wallet);
   const tx = await treasury.upgradeTo(newImplAddress);
   await tx.wait();
   ```

4. **Verify:**
   ```javascript
   const adminMintABI = ["function adminMint(address,uint256) external"];
   const upgraded = new ethers.Contract(TREASURY_CORE, adminMintABI, wallet);
   // Now adminMint() should work!
   ```

---

### Step 2: Add `transferToken()` to Staking Rewards

**Files Created:**
- `StakingRewardsUpgradeableV2.sol` - New implementation with `transferToken()`

**Process:**
1. Compile `StakingRewardsUpgradeableV2.sol`
2. Deploy new implementation
3. Call `upgradeTo(newImplementation)` from owner wallet
4. Use `transferToken()` to move 1,102.75 zHYPE

---

## Alternative: Use OpenZeppelin Upgrades Plugin

If you're using Hardhat with OpenZeppelin Upgrades plugin:

```bash
# Upgrade Treasury Core
npx hardhat upgrade --network hyperevm TreasuryCore <newImplementation>

# Upgrade Staking Rewards  
npx hardhat upgrade --network hyperevm StakingRewards <newImplementation>
```

---

## Immediate Solution (Works Now)

While waiting for upgrades, use the deposit method:

```bash
node deposit-to-mint-zhype.js 100  # Mints 100 zHYPE by depositing 100 HYPE
```

---

## Need Original Source Code?

If you have the original contract source files in another location:
1. Share the file paths or repository
2. I can create proper upgrade scripts that preserve all existing functions
3. Ensure storage layout compatibility

The upgradeable contracts I created (`TreasuryCoreUpgradeable.sol` and `StakingRewardsUpgradeableV2.sol`) are minimal versions that add the missing functions. To do a proper upgrade, we should:
- Start with the original contract source
- Add the new functions while preserving all existing logic
- Ensure storage layout compatibility

---

## Summary

✅ **Ready to use now:** `deposit-to-mint-zhype.js` (mints zHYPE via deposit)

⏳ **For upgrades:** 
- Compile the upgradeable contracts I created
- Deploy new implementations
- Call `upgradeTo()` on existing contracts
- New functions will be available

💡 **Best approach:** If you have original source code, I can create proper upgrade scripts that preserve all functionality.
