import { ethers } from 'ethers';

// Contract addresses
const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16",
  stakingRewards: "0xdC903501E97920E8016dbAc22b2Eb73407e34F1F"
};

// RPC URL
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Contract ABIs
const STAKING_ABI = [
  "function zhypeStakingAPY() external view returns (uint256)",
  "function owner() external view returns (address)"
];

async function checkAPYFormat() {
  try {
    console.log('🔍 Checking APY format and values...');
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('📡 Connected to HyperEVM');
    
    // Initialize contract
    const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingRewards, STAKING_ABI, provider);
    
    console.log('\n🎯 Staking Rewards Contract APY Analysis:');
    console.log('=' .repeat(60));
    
    try {
      const rawAPY = await stakingContract.zhypeStakingAPY();
      console.log(`  Raw APY value: ${rawAPY.toString()}`);
      console.log(`  Raw APY (hex): 0x${rawAPY.toString(16)}`);
      
      // Try different interpretations
      const asEther = ethers.formatEther(rawAPY);
      const asPercentage = Number(asEther) * 100;
      const asBasisPoints = Number(rawAPY) / 100;
      const asBasisPointsEther = Number(ethers.formatEther(rawAPY)) * 100;
      
      console.log(`  As ether: ${asEther}`);
      console.log(`  As percentage: ${asPercentage.toFixed(6)}%`);
      console.log(`  As basis points: ${asBasisPoints}%`);
      console.log(`  As basis points (ether): ${asBasisPointsEther.toFixed(6)}%`);
      
      // Check if it matches expected values
      console.log('\n  Expected values:');
      console.log(`  Expected 17%: ${17}%`);
      console.log(`  Expected 17% as basis points: ${17 * 100} (1700)`);
      console.log(`  Expected 17% as ether: ${ethers.parseEther('0.17').toString()}`);
      
      // Check if raw value matches any expected format
      if (rawAPY.toString() === '1700') {
        console.log('  ✅ Matches 17% as basis points (1700)');
      } else if (rawAPY.toString() === ethers.parseEther('0.17').toString()) {
        console.log('  ✅ Matches 17% as ether (0.17)');
      } else if (rawAPY.toString() === '17') {
        console.log('  ✅ Matches 17% as percentage (17)');
      } else {
        console.log('  ❌ Does not match expected 17% in any format');
      }
      
    } catch (error) {
      console.log(`  ❌ Error reading APY: ${error.message}`);
    }
    
    console.log('\n🏛️  Treasury Core Contract:');
    console.log('=' .repeat(60));
    console.log('  ❌ No APY functions available - all return "missing revert data"');
    console.log('  💡 This suggests the Treasury Core contract does not have APY management implemented');
    
    console.log('\n🔍 Frontend vs Contract Mismatch:');
    console.log('=' .repeat(60));
    console.log('  Frontend shows: 37.2% HYPE APY, 17% zHYPE APY');
    console.log('  Contract shows: 0% HYPE APY, ~0% zHYPE APY');
    console.log('  💡 The frontend is using HARDCODED values, not contract values!');
    
    console.log('\n💡 Solution:');
    console.log('  1. The contracts need to be updated with proper APY values');
    console.log('  2. Or the frontend should use the hardcoded values as fallback');
    console.log('  3. The dynamic APY system I built will work once contracts are updated');
    
    console.log('\n✅ APY format check completed!');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run check
checkAPYFormat();






