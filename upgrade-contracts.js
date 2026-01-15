import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

/**
 * This script checks if contracts are upgradeable and provides upgrade instructions
 * 
 * NOTE: This requires:
 * 1. Contracts to be deployed as upgradeable (UUPS or Transparent Proxy)
 * 2. OpenZeppelin Upgrades plugin for safe upgrades
 * 3. Contract source code to compile new versions
 */
async function checkUpgradeability() {
  try {
    console.log('🔍 Checking contract upgradeability for adding functions...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log(`👤 Owner wallet: ${wallet.address}\n`);
    
    // Check Treasury Core
    console.log('📋 Treasury Core Upgrade Check:');
    console.log('='.repeat(60));
    
    const treasuryABI = [
      "function owner() external view returns (address)",
      "function upgradeTo(address) external",
      "function upgradeToAndCall(address,bytes) external",
      "function implementation() external view returns (address)",
      "function proxiableUUID() external view returns (bytes32)"
    ];
    
    try {
      const treasuryContract = new ethers.Contract(TREASURY_CORE, treasuryABI, wallet);
      
      // Verify owner
      const owner = await treasuryContract.owner();
      console.log(`✅ Owner: ${owner}`);
      console.log(`✅ Is owner: ${wallet.address.toLowerCase() === owner.toLowerCase()}\n`);
      
      // Check for upgrade functions
      try {
        const impl = await treasuryContract.implementation();
        console.log(`✅ Contract is upgradeable!`);
        console.log(`   Current implementation: ${impl}\n`);
        
        console.log('💡 To add adminMint function:');
        console.log('   1. Compile TreasuryCoreUpgradeable.sol with new adminMint function');
        console.log('   2. Deploy new implementation contract');
        console.log('   3. Call upgradeTo(newImplementation) from owner wallet');
        console.log('   4. New adminMint function will be available\n');
        
      } catch (e) {
        console.log('❌ No implementation() function found');
        console.log('   Contract may not be using standard upgradeable pattern\n');
      }
      
      // Try to estimate upgradeTo
      try {
        // Use a dummy address to test if function exists
        await treasuryContract.upgradeTo.estimateGas("0x0000000000000000000000000000000000000000");
        console.log('✅ upgradeTo() function exists');
      } catch (e) {
        if (e.message.includes('missing revert data') || e.message.includes('execution reverted')) {
          console.log('⚠️  upgradeTo() may exist but requires valid implementation address');
        } else {
          console.log('❌ upgradeTo() function does not exist');
          console.log('   Contract is not upgradeable via standard methods');
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking Treasury Core: ${error.message}`);
    }
    
    // Check Staking Rewards
    console.log('\n📋 Staking Rewards Upgrade Check:');
    console.log('='.repeat(60));
    
    try {
      const stakingABI = [
        "function owner() external view returns (address)",
        "function upgradeTo(address) external",
        "function implementation() external view returns (address)"
      ];
      
      const stakingContract = new ethers.Contract(STAKING_REWARDS, stakingABI, wallet);
      
      const owner = await stakingContract.owner();
      console.log(`✅ Owner: ${owner}`);
      console.log(`✅ Is owner: ${wallet.address.toLowerCase() === owner.toLowerCase()}\n`);
      
      try {
        const impl = await stakingContract.implementation();
        console.log(`✅ Contract is upgradeable!`);
        console.log(`   Current implementation: ${impl}\n`);
        
        console.log('💡 To add transferToken function:');
        console.log('   1. Compile StakingRewardsUpgradeableV2.sol with transferToken function');
        console.log('   2. Deploy new implementation contract');
        console.log('   3. Call upgradeTo(newImplementation) from owner wallet');
        console.log('   4. New transferToken function will be available\n');
        
      } catch (e) {
        console.log('❌ No implementation() function found');
      }
      
    } catch (error) {
      console.log(`❌ Error checking Staking Rewards: ${error.message}`);
    }
    
    console.log('\n📝 SUMMARY:');
    console.log('='.repeat(60));
    console.log('If contracts are upgradeable:');
    console.log('  1. Use OpenZeppelin Upgrades plugin for safe upgrades');
    console.log('  2. Deploy new implementation with added functions');
    console.log('  3. Call upgradeTo() from owner wallet');
    console.log('\nIf contracts are NOT upgradeable:');
    console.log('  1. Use depositHype() to mint zHYPE (Treasury Core)');
    console.log('  2. Staking Rewards zHYPE cannot be transferred (need redeployment)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUpgradeability();
