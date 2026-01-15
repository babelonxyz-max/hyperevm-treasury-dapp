import { ethers } from 'ethers';

// Contract addresses
const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16",
  stakingRewards: "0xdC903501E97920E8016dbAc22b2Eb73407e34F1F",
  stakingRewardsSimple: "0xBd8f5961Eeb024ACE3443C93d12Dea3740e28852"
};

// RPC URL
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Test wallet
const TEST_WALLET = "0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4";

// Contract ABIs
const TREASURY_ABI = [
  "function calculateZhypeRewards(address user) external view returns (uint256)",
  "function getTreasuryBalance() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)"
];

const STAKING_ABI = [
  "function calculateUsdhRewards(address user) external view returns (uint256)",
  "function getStakingRewards(address user) external view returns (uint256)",
  "function getTotalStaked(address user) external view returns (uint256)",
  "function virtualZhypeStaked(address user) external view returns (uint256)",
  "function getTotalStakedAmount() external view returns (uint256)"
];

const STAKING_SIMPLE_ABI = [
  "function autoInvestEnabled(address user) external view returns (bool)",
  "function getAutoInvestEnabled(address user) external view returns (bool)"
];

async function checkAutoInvestRewards() {
  try {
    console.log('🔍 Checking auto-invest impact on rewards...');
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('📡 Connected to HyperEVM');
    
    // Initialize contracts
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, TREASURY_ABI, provider);
    const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingRewards, STAKING_ABI, provider);
    const stakingSimpleContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingRewardsSimple, STAKING_SIMPLE_ABI, provider);
    
    console.log(`\n👤 Checking wallet: ${TEST_WALLET}`);
    console.log('=' .repeat(60));
    
    // Check auto-invest status
    console.log('\n🔄 Auto-Invest Status:');
    try {
      const autoInvestEnabled = await stakingSimpleContract.autoInvestEnabled(TEST_WALLET);
      console.log(`  Auto-invest enabled: ${autoInvestEnabled}`);
      
      if (autoInvestEnabled) {
        console.log('  💡 Auto-invest is ON - rewards are automatically claimed and reinvested');
        console.log('  💡 This explains why pending rewards show 0!');
      } else {
        console.log('  💡 Auto-invest is OFF - rewards should accumulate normally');
      }
    } catch (error) {
      console.log(`  ❌ Error checking auto-invest: ${error.message}`);
    }
    
    // Check current balances and staked amounts
    console.log('\n💰 Current Balances:');
    try {
      const zhypeBalance = await treasuryContract.balanceOf(TEST_WALLET);
      console.log(`  zHYPE Balance: ${ethers.formatEther(zhypeBalance)} zHYPE`);
      
      const stakedAmount = await stakingContract.getTotalStaked(TEST_WALLET);
      console.log(`  Staked zHYPE: ${ethers.formatEther(stakedAmount)} zHYPE`);
      
      const virtualStaked = await stakingContract.virtualZhypeStaked(TEST_WALLET);
      console.log(`  Virtual zHYPE: ${ethers.formatEther(virtualStaked)} zHYPE`);
      
    } catch (error) {
      console.log(`  ❌ Error checking balances: ${error.message}`);
    }
    
    // Check pending rewards (should be 0 if auto-invest is on)
    console.log('\n🎁 Pending Rewards:');
    try {
      const zhypeRewards = await treasuryContract.calculateZhypeRewards(TEST_WALLET);
      console.log(`  zHYPE Rewards: ${ethers.formatEther(zhypeRewards)} zHYPE`);
      
      const usdhRewards = await stakingContract.calculateUsdhRewards(TEST_WALLET);
      console.log(`  USDH Rewards: ${ethers.formatEther(usdhRewards)} USDH`);
      
      const stakingRewards = await stakingContract.getStakingRewards(TEST_WALLET);
      console.log(`  Staking Rewards: ${ethers.formatEther(stakingRewards)} USDH`);
      
    } catch (error) {
      console.log(`  ❌ Error checking rewards: ${error.message}`);
    }
    
    // Check if rewards are being generated but immediately claimed
    console.log('\n🧮 Reward Generation Analysis:');
    try {
      const treasuryBalance = await treasuryContract.getTreasuryBalance();
      const totalSupply = await treasuryContract.totalSupply();
      const userBalance = await treasuryContract.balanceOf(TEST_WALLET);
      
      if (Number(totalSupply) > 0) {
        const userShare = Number(userBalance) / Number(totalSupply);
        const treasuryValue = Number(ethers.formatEther(treasuryBalance));
        const potentialReward = treasuryValue * userShare;
        
        console.log(`  📊 User Share of Treasury: ${(userShare * 100).toFixed(4)}%`);
        console.log(`  💰 Potential zHYPE Reward: ${potentialReward.toFixed(6)} zHYPE`);
        console.log(`  🔄 If auto-invest is ON, this gets immediately converted to staked zHYPE`);
      }
    } catch (error) {
      console.log(`  ❌ Analysis error: ${error.message}`);
    }
    
    // Check total staked amount in the system
    console.log('\n📈 System Overview:');
    try {
      const totalStaked = await stakingContract.getTotalStakedAmount();
      console.log(`  Total Staked in System: ${ethers.formatEther(totalStaked)} zHYPE`);
      
      const treasuryBalance = await treasuryContract.getTreasuryBalance();
      console.log(`  Treasury Balance: ${ethers.formatEther(treasuryBalance)} HYPE`);
      
      const totalZhypeSupply = await treasuryContract.totalSupply();
      console.log(`  Total zHYPE Supply: ${ethers.formatEther(totalZhypeSupply)} zHYPE`);
      
    } catch (error) {
      console.log(`  ❌ System overview error: ${error.message}`);
    }
    
    console.log('\n💡 Conclusion:');
    console.log('=' .repeat(60));
    console.log('  If auto-invest is enabled:');
    console.log('  ✅ Rewards are generated normally');
    console.log('  ✅ Rewards are immediately claimed');
    console.log('  ✅ Rewards are automatically reinvested as staked zHYPE');
    console.log('  ✅ Pending rewards show 0 (because they are claimed instantly)');
    console.log('  ✅ User sees growth in staked zHYPE balance instead');
    
    console.log('\n✅ Auto-invest rewards analysis completed!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run analysis
checkAutoInvestRewards();






