import { ethers } from 'ethers';

// Contract addresses
const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16",
  stakingRewards: "0x716E8c9E464736293EB46B71e81f6e9AA9c09058"
};

// RPC URL
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Contract ABIs
const TREASURY_ABI = [
  "function getAPYPercentage() external view returns (uint256)",
  "function setAPY(uint256 newAPY) external",
  "function owner() external view returns (address)"
];

const STAKING_ABI = [
  "function getAPYPercentage() external view returns (uint256)",
  "function setAPY(uint256 newAPY) external",
  "function owner() external view returns (address)"
];

async function testDynamicAPYUpdate() {
  try {
    console.log('🧪 Testing Dynamic APY Update...');
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log('👤 Account:', wallet.address);
    
    // Initialize contracts
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, TREASURY_ABI, wallet);
    const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingRewards, STAKING_ABI, wallet);
    
    // Check current APY values
    console.log('\n📊 Current APY Values:');
    try {
      const treasuryAPY = await treasuryContract.getAPYPercentage();
      console.log('  Treasury Core APY:', (Number(treasuryAPY) / 100).toFixed(1) + '%');
    } catch (error) {
      console.log('  Treasury Core APY: Error reading -', error.message);
    }
    
    try {
      const stakingAPY = await stakingContract.getAPYPercentage();
      console.log('  Staking Rewards APY:', (Number(stakingAPY) / 100).toFixed(1) + '%');
    } catch (error) {
      console.log('  Staking Rewards APY: Error reading -', error.message);
    }
    
    // Check if we're the owner
    console.log('\n🔐 Checking Ownership:');
    try {
      const treasuryOwner = await treasuryContract.owner();
      const stakingOwner = await stakingContract.owner();
      console.log('  Treasury Owner:', treasuryOwner);
      console.log('  Staking Owner:', stakingOwner);
      console.log('  Our Address:', wallet.address);
      console.log('  Can update Treasury:', treasuryOwner.toLowerCase() === wallet.address.toLowerCase());
      console.log('  Can update Staking:', stakingOwner.toLowerCase() === wallet.address.toLowerCase());
    } catch (error) {
      console.log('  Ownership check failed:', error.message);
    }
    
    // Test APY update
    const newAPY = 3720; // 37.2% in basis points
    console.log(`\n🔄 Testing APY update to ${(newAPY / 100).toFixed(1)}%...`);
    
    // Update Treasury Core APY
    try {
      console.log('  Updating Treasury Core APY...');
      const tx1 = await treasuryContract.setAPY(newAPY, { gasLimit: 150000 });
      console.log('  Transaction hash:', tx1.hash);
      await tx1.wait();
      console.log('  ✅ Treasury Core APY updated successfully');
    } catch (error) {
      console.log('  ❌ Treasury Core APY update failed:', error.message);
    }
    
    // Update Staking Rewards APY
    try {
      console.log('  Updating Staking Rewards APY...');
      const tx2 = await stakingContract.setAPY(newAPY, { gasLimit: 150000 });
      console.log('  Transaction hash:', tx2.hash);
      await tx2.wait();
      console.log('  ✅ Staking Rewards APY updated successfully');
    } catch (error) {
      console.log('  ❌ Staking Rewards APY update failed:', error.message);
    }
    
    // Verify updated values
    console.log('\n📊 Updated APY Values:');
    try {
      const treasuryAPY = await treasuryContract.getAPYPercentage();
      console.log('  Treasury Core APY:', (Number(treasuryAPY) / 100).toFixed(1) + '%');
    } catch (error) {
      console.log('  Treasury Core APY: Error reading -', error.message);
    }
    
    try {
      const stakingAPY = await stakingContract.getAPYPercentage();
      console.log('  Staking Rewards APY:', (Number(stakingAPY) / 100).toFixed(1) + '%');
    } catch (error) {
      console.log('  Staking Rewards APY: Error reading -', error.message);
    }
    
    console.log('\n🎉 Dynamic APY test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Please set PRIVATE_KEY environment variable');
    process.exit(1);
  }
  
  testDynamicAPYUpdate();
}

export { testDynamicAPYUpdate };
