import { ethers } from 'ethers';

// Contract addresses
const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16",
  stakingRewards: "0xdC903501E97920E8016dbAc22b2Eb73407e34F1F"
};

// RPC URL
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Extended ABIs to test all possible APY functions
const TREASURY_ABI = [
  "function hypeStakingAPY() external view returns (uint256)",
  "function getHypeStakingAPY() external view returns (uint256)",
  "function getAPYPercentage() external view returns (uint256)",
  "function getAPY() external view returns (uint256)",
  "function apy() external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "function getRewardRate() external view returns (uint256)",
  "function owner() external view returns (address)"
];

const STAKING_ABI = [
  "function zhypeStakingAPY() external view returns (uint256)",
  "function getZhypeStakingAPY() external view returns (uint256)",
  "function getAPYPercentage() external view returns (uint256)",
  "function getAPY() external view returns (uint256)",
  "function apy() external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "function getRewardRate() external view returns (uint256)",
  "function owner() external view returns (address)"
];

async function debugAPYFunctions() {
  try {
    console.log('🔍 Debugging APY functions on contracts...');
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('📡 Connected to HyperEVM');
    
    // Initialize contracts
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, TREASURY_ABI, provider);
    const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingRewards, STAKING_ABI, provider);
    
    console.log('\n🏛️  Treasury Core Contract APY Functions:');
    console.log('=' .repeat(60));
    
    const treasuryFunctions = [
      'hypeStakingAPY',
      'getHypeStakingAPY', 
      'getAPYPercentage',
      'getAPY',
      'apy',
      'rewardRate',
      'getRewardRate'
    ];
    
    for (const funcName of treasuryFunctions) {
      try {
        if (typeof treasuryContract[funcName] === 'function') {
          const result = await treasuryContract[funcName]();
          console.log(`  ✅ ${funcName}(): ${ethers.formatEther(result)} (${(Number(ethers.formatEther(result)) * 100).toFixed(2)}%)`);
        } else {
          console.log(`  ❌ ${funcName}(): Function not found`);
        }
      } catch (error) {
        console.log(`  ❌ ${funcName}(): ${error.message}`);
      }
    }
    
    console.log('\n🎯 Staking Rewards Contract APY Functions:');
    console.log('=' .repeat(60));
    
    const stakingFunctions = [
      'zhypeStakingAPY',
      'getZhypeStakingAPY',
      'getAPYPercentage', 
      'getAPY',
      'apy',
      'rewardRate',
      'getRewardRate'
    ];
    
    for (const funcName of stakingFunctions) {
      try {
        if (typeof stakingContract[funcName] === 'function') {
          const result = await stakingContract[funcName]();
          console.log(`  ✅ ${funcName}(): ${ethers.formatEther(result)} (${(Number(ethers.formatEther(result)) * 100).toFixed(2)}%)`);
        } else {
          console.log(`  ❌ ${funcName}(): Function not found`);
        }
      } catch (error) {
        console.log(`  ❌ ${funcName}(): ${error.message}`);
      }
    }
    
    console.log('\n🔍 Checking if APY values are stored differently:');
    console.log('=' .repeat(60));
    
    // Check if APY might be stored as basis points (multiply by 100)
    try {
      const treasuryAPY = await treasuryContract.hypeStakingAPY();
      const treasuryAPYAsBasisPoints = Number(treasuryAPY) / 100;
      console.log(`  📊 Treasury APY as basis points: ${treasuryAPYAsBasisPoints}%`);
    } catch (error) {
      console.log(`  ❌ Treasury APY basis points check failed: ${error.message}`);
    }
    
    try {
      const stakingAPY = await stakingContract.zhypeStakingAPY();
      const stakingAPYAsBasisPoints = Number(stakingAPY) / 100;
      console.log(`  📊 Staking APY as basis points: ${stakingAPYAsBasisPoints}%`);
    } catch (error) {
      console.log(`  ❌ Staking APY basis points check failed: ${error.message}`);
    }
    
    console.log('\n🧮 Expected vs Actual:');
    console.log('=' .repeat(60));
    console.log('  Expected HYPE APY: 37.2%');
    console.log('  Expected zHYPE APY: 17.0%');
    console.log('  Actual Treasury APY: 0.00% (or function not available)');
    console.log('  Actual Staking APY: 0.00% (or function not available)');
    
    console.log('\n💡 Possible Issues:');
    console.log('  1. APY functions not implemented in contracts');
    console.log('  2. APY values not set (defaulting to 0)');
    console.log('  3. APY stored in different format (basis points, etc.)');
    console.log('  4. Wrong contract addresses');
    console.log('  5. Frontend using hardcoded values instead of contract values');
    
    console.log('\n✅ APY debugging completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

// Run debug
debugAPYFunctions();






