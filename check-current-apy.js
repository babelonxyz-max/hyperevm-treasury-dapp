import { ethers } from 'ethers';

// Contract addresses
const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16",
  stakingRewards: "0xdC903501E97920E8016dbAc22b2Eb73407e34F1F"
};

// RPC URL
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Contract ABIs
const TREASURY_ABI = [
  "function hypeStakingAPY() external view returns (uint256)",
  "function owner() external view returns (address)"
];

const STAKING_ABI = [
  "function zhypeStakingAPY() external view returns (uint256)",
  "function owner() external view returns (address)"
];

async function checkCurrentAPY() {
  try {
    console.log('🔍 Checking current APY values from contracts...');
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('📡 Connected to HyperEVM');
    
    // Initialize contracts
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, TREASURY_ABI, provider);
    const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingRewards, STAKING_ABI, provider);
    
    console.log('\n📊 Current APY Values:');
    
    // Check Treasury Core APY
    try {
      console.log('  🏛️  Treasury Core Contract:');
      
      // Try hypeStakingAPY
      try {
        const hypeAPY = await treasuryContract.hypeStakingAPY();
        console.log(`    hypeStakingAPY(): ${(Number(ethers.formatEther(hypeAPY)) * 100).toFixed(2)}%`);
      } catch (error) {
        console.log(`    hypeStakingAPY(): Not available - ${error.message}`);
      }
      
      // Check owner
      try {
        const owner = await treasuryContract.owner();
        console.log(`    Owner: ${owner}`);
      } catch (error) {
        console.log(`    Owner: Not available - ${error.message}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Treasury Core error: ${error.message}`);
    }
    
    // Check Staking Rewards APY
    try {
      console.log('  🎯 Staking Rewards Contract:');
      
      // Try zhypeStakingAPY
      try {
        const zhypeAPY = await stakingContract.zhypeStakingAPY();
        console.log(`    zhypeStakingAPY(): ${(Number(ethers.formatEther(zhypeAPY)) * 100).toFixed(2)}%`);
      } catch (error) {
        console.log(`    zhypeStakingAPY(): Not available - ${error.message}`);
      }
      
      // Check owner
      try {
        const owner = await stakingContract.owner();
        console.log(`    Owner: ${owner}`);
      } catch (error) {
        console.log(`    Owner: Not available - ${error.message}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Staking Rewards error: ${error.message}`);
    }
    
    console.log('\n✅ APY check completed!');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run check
checkCurrentAPY();
