import { ethers } from 'ethers';
import fs from 'fs';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

/**
 * This script upgrades Treasury Core to add adminMint function
 * 
 * Steps:
 * 1. Compile TreasuryCoreUpgradeable.sol (with adminMint)
 * 2. Deploy new implementation
 * 3. Call upgradeTo() on existing contract
 */
async function upgradeTreasury() {
  try {
    console.log('🚀 Upgrading Treasury Core to add adminMint()...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log(`👤 Owner: ${wallet.address}`);
    
    // Check if contract is upgradeable
    const upgradeABI = [
      "function owner() external view returns (address)",
      "function upgradeTo(address) external",
      "function upgradeToAndCall(address,bytes) external",
      "function implementation() external view returns (address)"
    ];
    
    const contract = new ethers.Contract(TREASURY_CORE, upgradeABI, wallet);
    
    // Verify owner
    const owner = await contract.owner();
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      return;
    }
    console.log('✅ Owner verified\n');
    
    // Check current implementation
    try {
      const currentImpl = await contract.implementation();
      console.log(`📋 Current implementation: ${currentImpl}\n`);
    } catch (e) {
      console.log('⚠️  Cannot read current implementation (may not be standard proxy)\n');
    }
    
    console.log('📝 Next steps:');
    console.log('='.repeat(60));
    console.log('1. Compile TreasuryCoreUpgradeable.sol:');
    console.log('   npx hardhat compile');
    console.log('   OR');
    console.log('   solc --abi --bin TreasuryCoreUpgradeable.sol');
    console.log('');
    console.log('2. Deploy new implementation:');
    console.log('   - Use Hardhat deploy script');
    console.log('   - Or deploy manually with ethers.js');
    console.log('');
    console.log('3. Call upgradeTo(newImplementation):');
    console.log('   const tx = await contract.upgradeTo(newImplementationAddress);');
    console.log('   await tx.wait();');
    console.log('');
    console.log('4. Verify adminMint() is available');
    console.log('');
    console.log('💡 Alternative: If contracts use OpenZeppelin Upgrades plugin:');
    console.log('   npx hardhat upgrade --network hyperevm TreasuryCore <newImplementation>');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

upgradeTreasury();
