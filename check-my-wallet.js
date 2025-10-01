import { ethers } from 'ethers';
import { readFileSync } from 'fs';

// Your wallet address
const WALLET_ADDRESS = '0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4';

// RPC URL
const RPC_URL = 'https://rpc.hyperliquid.xyz/evm';

// Contract addresses
const CONTRACT_ADDRESSES = {
  treasuryCore: '0x1234567890123456789012345678901234567890', // Replace with actual address
  unstakingQueue: '0x1234567890123456789012345678901234567890', // Replace with actual address
  stakingRewards: '0x1234567890123456789012345678901234567890'  // Replace with actual address
};

// Load deployed addresses
let deployedAddresses = {};
try {
  const addressesData = readFileSync('./public/deployed-addresses.json', 'utf8');
  deployedAddresses = JSON.parse(addressesData);
  console.log('📋 Loaded deployed addresses:', deployedAddresses);
} catch (error) {
  console.log('❌ Could not load deployed addresses, using defaults');
}

// Update contract addresses with real ones
if (deployedAddresses.contracts?.treasuryCore) CONTRACT_ADDRESSES.treasuryCore = deployedAddresses.contracts.treasuryCore;
if (deployedAddresses.contracts?.unstakingQueue) CONTRACT_ADDRESSES.unstakingQueue = deployedAddresses.contracts.unstakingQueue;
if (deployedAddresses.contracts?.stakingRewards) CONTRACT_ADDRESSES.stakingRewards = deployedAddresses.contracts.stakingRewards;

console.log('🔗 Using contract addresses:', CONTRACT_ADDRESSES);

// Create provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Basic ABI for common functions
const BASIC_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function getPendingWithdrawals(address) view returns (tuple(uint256 amount, bool completed, uint256 timestamp)[])',
  'function getUserUnstakingRequests(address) view returns (tuple(uint256 amount, bool completed, uint256 timestamp)[])',
  'function getTotalPendingRequests() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

async function checkWalletData() {
  console.log(`\n🔍 Checking wallet: ${WALLET_ADDRESS}`);
  console.log('=' .repeat(60));

  try {
    // Check HYPE balance
    if (CONTRACT_ADDRESSES.treasuryCore) {
      console.log('\n💰 Checking HYPE balance...');
      try {
        const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, BASIC_ABI, provider);
        const hypeBalance = await treasuryContract.balanceOf(WALLET_ADDRESS);
        const hypeBalanceFormatted = ethers.formatEther(hypeBalance);
        console.log(`   HYPE Balance: ${hypeBalanceFormatted}`);
        
        if (parseFloat(hypeBalanceFormatted) >= 0.0001) {
          console.log(`   ✅ Has withdrawable HYPE: ${hypeBalanceFormatted}`);
        } else {
          console.log(`   ❌ HYPE balance too small: ${hypeBalanceFormatted}`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking HYPE balance: ${error.message}`);
      }
    }

    // Check pending withdrawals
    if (CONTRACT_ADDRESSES.treasuryCore) {
      console.log('\n📋 Checking pending withdrawals...');
      try {
        const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, BASIC_ABI, provider);
        const pendingWithdrawals = await treasuryContract.getPendingWithdrawals(WALLET_ADDRESS);
        console.log(`   Raw pending withdrawals:`, pendingWithdrawals);
        
        if (pendingWithdrawals && pendingWithdrawals.length > 0) {
          console.log(`   Found ${pendingWithdrawals.length} pending withdrawals:`);
          pendingWithdrawals.forEach((withdrawal, index) => {
            const amount = ethers.formatEther(withdrawal.amount);
            const completed = withdrawal.completed;
            const timestamp = withdrawal.timestamp ? new Date(Number(withdrawal.timestamp) * 1000).toISOString() : 'Unknown';
            console.log(`     ${index + 1}. Amount: ${amount}, Completed: ${completed}, Timestamp: ${timestamp}`);
          });
        } else {
          console.log(`   No pending withdrawals found`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking pending withdrawals: ${error.message}`);
      }
    }

    // Check unstaking requests
    if (CONTRACT_ADDRESSES.unstakingQueue) {
      console.log('\n🔄 Checking unstaking requests...');
      try {
        const unstakingContract = new ethers.Contract(CONTRACT_ADDRESSES.unstakingQueue, BASIC_ABI, provider);
        const unstakingRequests = await unstakingContract.getUserUnstakingRequests(WALLET_ADDRESS);
        console.log(`   Raw unstaking requests:`, unstakingRequests);
        
        if (unstakingRequests && unstakingRequests.length > 0) {
          console.log(`   Found ${unstakingRequests.length} unstaking requests:`);
          unstakingRequests.forEach((request, index) => {
            const amount = ethers.formatEther(request.amount);
            const completed = request.completed;
            const timestamp = request.timestamp ? new Date(Number(request.timestamp) * 1000).toISOString() : 'Unknown';
            console.log(`     ${index + 1}. Amount: ${amount}, Completed: ${completed}, Timestamp: ${timestamp}`);
          });
        } else {
          console.log(`   No unstaking requests found`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking unstaking requests: ${error.message}`);
      }
    }

    // Check total pending requests
    if (CONTRACT_ADDRESSES.unstakingQueue) {
      console.log('\n📊 Checking total pending requests...');
      try {
        const unstakingContract = new ethers.Contract(CONTRACT_ADDRESSES.unstakingQueue, BASIC_ABI, provider);
        const totalPending = await unstakingContract.getTotalPendingRequests();
        console.log(`   Total pending requests: ${totalPending.toString()}`);
      } catch (error) {
        console.log(`   ❌ Error checking total pending requests: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking wallet data:', error);
  }
}

// Run the check
checkWalletData().catch(console.error);
