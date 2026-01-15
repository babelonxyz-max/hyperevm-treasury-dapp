import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

/**
 * This script upgrades Staking Rewards to add transferToken function
 */
async function upgradeStakingRewards() {
  try {
    console.log('🚀 Upgrading Staking Rewards to add transferToken()...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log(`👤 Owner: ${wallet.address}`);
    
    const upgradeABI = [
      "function owner() external view returns (address)",
      "function upgradeTo(address) external",
      "function implementation() external view returns (address)"
    ];
    
    const contract = new ethers.Contract(STAKING_REWARDS, upgradeABI, wallet);
    
    const owner = await contract.owner();
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      return;
    }
    console.log('✅ Owner verified\n');
    
    console.log('📝 Next steps:');
    console.log('='.repeat(60));
    console.log('1. Compile StakingRewardsUpgradeableV2.sol');
    console.log('2. Deploy new implementation');
    console.log('3. Call upgradeTo(newImplementation)');
    console.log('4. Use transferToken() to move 1,102.75 zHYPE');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

upgradeStakingRewards();
