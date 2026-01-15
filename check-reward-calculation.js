import { ethers } from 'ethers';

// Contract addresses
const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16",
  stakingRewards: "0xdC903501E97920E8016dbAc22b2Eb73407e34F1F"
};

// RPC URL
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Contract ABIs for reward calculation
const TREASURY_ABI = [
  "function calculateZhypeRewards(address user) external view returns (uint256)",
  "function getTreasuryBalance() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function lastRewardTime() external view returns (uint256)",
  "function hypeStakingAPY() external view returns (uint256)",
  "function owner() external view returns (address)"
];

const STAKING_ABI = [
  "function calculateUsdhRewards(address user) external view returns (uint256)",
  "function getStakingRewards(address user) external view returns (uint256)",
  "function getTotalStakedAmount() external view returns (uint256)",
  "function getRewardRate() external view returns (uint256)",
  "function lastUpdateTime() external view returns (uint256)",
  "function zhypeStakingAPY() external view returns (uint256)",
  "function getTotalStaked(address user) external view returns (uint256)",
  "function virtualZhypeStaked(address user) external view returns (uint256)",
  "function owner() external view returns (address)"
];

async function checkRewardCalculation() {
  try {
    console.log('🔍 Checking reward calculation mechanisms...');
    
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('📡 Connected to HyperEVM');
    
    // Initialize contracts
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, TREASURY_ABI, provider);
    const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingRewards, STAKING_ABI, provider);
    
    // Test wallet address
    const testWallet = "0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4";
    
    console.log('\n📊 Treasury Core Contract (HYPE → zHYPE rewards):');
    console.log('=' .repeat(60));
    
    try {
      // Check treasury balance
      const treasuryBalance = await treasuryContract.getTreasuryBalance();
      console.log(`  💰 Treasury Balance: ${ethers.formatEther(treasuryBalance)} HYPE`);
      
      // Check total zHYPE supply
      const totalSupply = await treasuryContract.totalSupply();
      console.log(`  🪙 Total zHYPE Supply: ${ethers.formatEther(totalSupply)} zHYPE`);
      
      // Check user's zHYPE balance
      const userBalance = await treasuryContract.balanceOf(testWallet);
      console.log(`  👤 User zHYPE Balance: ${ethers.formatEther(userBalance)} zHYPE`);
      
      // Check last reward time
      try {
        const lastRewardTime = await treasuryContract.lastRewardTime();
        const lastRewardDate = new Date(Number(lastRewardTime) * 1000);
        console.log(`  ⏰ Last Reward Time: ${lastRewardDate.toISOString()}`);
      } catch (error) {
        console.log(`  ⏰ Last Reward Time: Not available - ${error.message}`);
      }
      
      // Check APY
      try {
        const apy = await treasuryContract.hypeStakingAPY();
        console.log(`  📈 APY: ${(Number(ethers.formatEther(apy)) * 100).toFixed(2)}%`);
      } catch (error) {
        console.log(`  📈 APY: Not available - ${error.message}`);
      }
      
      // Calculate rewards for user
      try {
        const rewards = await treasuryContract.calculateZhypeRewards(testWallet);
        console.log(`  🎁 Pending zHYPE Rewards: ${ethers.formatEther(rewards)} zHYPE`);
      } catch (error) {
        console.log(`  🎁 Pending zHYPE Rewards: Not available - ${error.message}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Treasury Core error: ${error.message}`);
    }
    
    console.log('\n🎯 Staking Rewards Contract (zHYPE → USDH rewards):');
    console.log('=' .repeat(60));
    
    try {
      // Check total staked amount
      const totalStaked = await stakingContract.getTotalStakedAmount();
      console.log(`  💎 Total Staked zHYPE: ${ethers.formatEther(totalStaked)} zHYPE`);
      
      // Check user's staked amount
      const userStaked = await stakingContract.getTotalStaked(testWallet);
      console.log(`  👤 User Staked zHYPE: ${ethers.formatEther(userStaked)} zHYPE`);
      
      // Check user's virtual staked amount
      try {
        const virtualStaked = await stakingContract.virtualZhypeStaked(testWallet);
        console.log(`  👤 User Virtual zHYPE: ${ethers.formatEther(virtualStaked)} zHYPE`);
      } catch (error) {
        console.log(`  👤 User Virtual zHYPE: Not available - ${error.message}`);
      }
      
      // Check reward rate
      try {
        const rewardRate = await stakingContract.getRewardRate();
        console.log(`  ⚡ Reward Rate: ${ethers.formatEther(rewardRate)} USDH per second`);
      } catch (error) {
        console.log(`  ⚡ Reward Rate: Not available - ${error.message}`);
      }
      
      // Check last update time
      try {
        const lastUpdate = await stakingContract.lastUpdateTime();
        const lastUpdateDate = new Date(Number(lastUpdate) * 1000);
        console.log(`  ⏰ Last Update Time: ${lastUpdateDate.toISOString()}`);
      } catch (error) {
        console.log(`  ⏰ Last Update Time: Not available - ${error.message}`);
      }
      
      // Check APY
      try {
        const apy = await stakingContract.zhypeStakingAPY();
        console.log(`  📈 APY: ${(Number(ethers.formatEther(apy)) * 100).toFixed(2)}%`);
      } catch (error) {
        console.log(`  📈 APY: Not available - ${error.message}`);
      }
      
      // Calculate USDH rewards for user
      try {
        const usdhRewards = await stakingContract.calculateUsdhRewards(testWallet);
        console.log(`  🎁 Pending USDH Rewards: ${ethers.formatEther(usdhRewards)} USDH`);
      } catch (error) {
        console.log(`  🎁 Pending USDH Rewards: Not available - ${error.message}`);
      }
      
      // Alternative reward calculation
      try {
        const stakingRewards = await stakingContract.getStakingRewards(testWallet);
        console.log(`  🎁 Staking Rewards (alt): ${ethers.formatEther(stakingRewards)} USDH`);
      } catch (error) {
        console.log(`  🎁 Staking Rewards (alt): Not available - ${error.message}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Staking Rewards error: ${error.message}`);
    }
    
    console.log('\n🧮 Reward Calculation Analysis:');
    console.log('=' .repeat(60));
    
    // Analyze the reward calculation mechanism
    try {
      const treasuryBalance = await treasuryContract.getTreasuryBalance();
      const totalSupply = await treasuryContract.totalSupply();
      const userBalance = await treasuryContract.balanceOf(testWallet);
      
      if (Number(totalSupply) > 0) {
        const userShare = Number(userBalance) / Number(totalSupply);
        const treasuryValue = Number(ethers.formatEther(treasuryBalance));
        const potentialReward = treasuryValue * userShare;
        
        console.log(`  📊 User Share of zHYPE: ${(userShare * 100).toFixed(4)}%`);
        console.log(`  💰 Potential Reward Share: ${potentialReward.toFixed(6)} HYPE`);
        console.log(`  🔄 Reward Mechanism: Based on zHYPE balance share of total supply`);
      } else {
        console.log(`  ⚠️  No zHYPE minted yet - rewards calculation not applicable`);
      }
    } catch (error) {
      console.log(`  ❌ Analysis error: ${error.message}`);
    }
    
    console.log('\n✅ Reward calculation check completed!');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

// Run check
checkRewardCalculation();






