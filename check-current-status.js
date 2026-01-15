// Check current auto-invest status
import { ethers } from 'ethers';

async function checkCurrentStatus() {
  const walletAddress = '0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4';
  
  // Contract addresses
  const stakingRewardsAddress = '0x716E8c9E464736293EB46B71e81f6e9AA9c09058';
  const stakingRewardsSimpleAddress = '0xBd8f5961Eeb024ACE3443C93d12Dea3740e28852';
  
  const rpcUrl = 'https://rpc.hyperliquid.xyz/evm';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log('🔍 Checking current auto-invest status...');
    console.log('Wallet:', walletAddress);
    console.log('Timestamp:', new Date().toISOString());
    
    // Check main staking rewards contract
    const stakingABI = [
      "function getAutoInvestEnabled(address user) external view returns (bool)",
      "function calculateUsdhRewards(address user) external view returns (uint256)",
      "function getTotalStaked(address user) external view returns (uint256)"
    ];
    
    const stakingContract = new ethers.Contract(stakingRewardsAddress, stakingABI, provider);
    
    try {
      const autoInvestEnabled = await stakingContract.getAutoInvestEnabled(walletAddress);
      const rewards = await stakingContract.calculateUsdhRewards(walletAddress);
      const totalStaked = await stakingContract.getTotalStaked(walletAddress);
      
      console.log('\n📊 MAIN STAKING REWARDS CONTRACT:');
      console.log(`Auto-invest enabled: ${autoInvestEnabled}`);
      console.log(`Pending rewards: ${ethers.formatEther(rewards)} USDH`);
      console.log(`Total staked: ${ethers.formatEther(totalStaked)} zHYPE`);
      
    } catch (error) {
      console.log('❌ Error checking main staking contract:', error.message);
    }
    
    // Check staking rewards simple contract
    const simpleABI = [
      "function toggleAutoInvest() external",
      "function getAutoInvestEnabled(address user) external view returns (bool)"
    ];
    
    const simpleContract = new ethers.Contract(stakingRewardsSimpleAddress, simpleABI, provider);
    
    try {
      const simpleAutoInvest = await simpleContract.getAutoInvestEnabled(walletAddress);
      console.log('\n📊 STAKING REWARDS SIMPLE CONTRACT:');
      console.log(`Auto-invest enabled: ${simpleAutoInvest}`);
    } catch (error) {
      console.log('❌ Error checking simple contract:', error.message);
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('Ready for transaction signing!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCurrentStatus();






