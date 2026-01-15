const { ethers } = require('ethers');

// Contract addresses from deployed-addresses-comprehensive.json
const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16",
  stakingRewards: "0x716E8c9E464736293EB46B71e81f6e9AA9c09058"
};

// RPC URL
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Dynamic APY Updater Contract ABI
const DYNAMIC_APY_ABI = [
  "constructor(address _treasuryCore, address _stakingRewards)",
  "function updateAPY() external",
  "function canUpdate() external view returns (bool)",
  "function timeUntilNextUpdate() external view returns (uint256)",
  "function setBaseAPY(uint256 _newBaseAPY) external",
  "function setContracts(address _treasuryCore, address _stakingRewards) external",
  "function transferOwnership(address newOwner) external",
  "function emergencyUpdateAPY(uint256 newAPY) external",
  "function owner() external view returns (address)",
  "function treasuryCore() external view returns (address)",
  "function stakingRewards() external view returns (address)",
  "function baseAPY() external view returns (uint256)",
  "function lastUpdate() external view returns (uint256)",
  "event APYUpdated(uint256 newAPY, uint256 timestamp)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];

async function deployDynamicAPYUpdater() {
  try {
    console.log('🚀 Deploying Dynamic APY Updater...');
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log('👤 Deployer:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      throw new Error('Insufficient balance for deployment');
    }
    
    // Deploy contract
    const factory = new ethers.ContractFactory(DYNAMIC_APY_ABI, DYNAMIC_APY_ABI, wallet);
    
    console.log('📦 Deploying contract...');
    const contract = await factory.deploy(
      CONTRACT_ADDRESSES.treasuryCore,
      CONTRACT_ADDRESSES.stakingRewards
    );
    
    console.log('⏳ Waiting for deployment...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Dynamic APY Updater deployed at:', contractAddress);
    
    // Verify deployment
    console.log('🔍 Verifying deployment...');
    const owner = await contract.owner();
    const treasuryCore = await contract.treasuryCore();
    const stakingRewards = await contract.stakingRewards();
    const baseAPY = await contract.baseAPY();
    
    console.log('📋 Contract Details:');
    console.log('  Owner:', owner);
    console.log('  Treasury Core:', treasuryCore);
    console.log('  Staking Rewards:', stakingRewards);
    console.log('  Base APY:', (Number(baseAPY) / 100).toFixed(1) + '%');
    
    // Test update function
    console.log('🧪 Testing update function...');
    const canUpdate = await contract.canUpdate();
    console.log('  Can update now:', canUpdate);
    
    if (canUpdate) {
      console.log('  Updating APY...');
      const tx = await contract.updateAPY();
      await tx.wait();
      console.log('  ✅ APY updated successfully');
    } else {
      const timeUntilUpdate = await contract.timeUntilNextUpdate();
      console.log('  ⏰ Next update in:', Math.floor(Number(timeUntilUpdate) / 3600), 'hours');
    }
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      treasuryCore: CONTRACT_ADDRESSES.treasuryCore,
      stakingRewards: CONTRACT_ADDRESSES.stakingRewards,
      deployer: wallet.address,
      deploymentTime: new Date().toISOString(),
      network: 'hyperevm',
      rpcUrl: RPC_URL
    };
    
    const fs = require('fs');
    fs.writeFileSync('dynamic-apy-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to dynamic-apy-deployment.json');
    
    console.log('\n🎉 Dynamic APY Updater deployment completed!');
    console.log('📝 Next steps:');
    console.log('  1. Set up a cron job to call updateAPY() every 6 hours');
    console.log('  2. Or use a service like Chainlink Automation');
    console.log('  3. Monitor the contract for APY updates');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Please set PRIVATE_KEY environment variable');
    process.exit(1);
  }
  
  deployDynamicAPYUpdater();
}

module.exports = { deployDynamicAPYUpdater };






