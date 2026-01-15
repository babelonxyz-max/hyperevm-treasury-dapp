// Comprehensive script to check ALL queues for wallet 0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4
// Run this in browser console while connected to the dApp

async function checkAllQueues(walletAddress) {
  console.log(`🔍 Checking ALL queues for wallet: ${walletAddress}`);
  console.log('='.repeat(60));
  
  try {
    // Get contract addresses from the dApp
    const contractAddresses = window.contractAddresses || {};
    console.log('📋 Contract addresses:', contractAddresses);
    
    if (!contractAddresses.treasuryCore || !contractAddresses.unstakingQueue) {
      console.log('❌ Contract addresses not found. Make sure you are on the dApp page.');
      return;
    }
    
    // Get provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Comprehensive Contract ABIs
    const treasuryCoreABI = [
      "function getPendingWithdrawals(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function balanceOf(address account) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function getTreasuryBalance() external view returns (uint256)"
    ];
    
    const unstakingQueueABI = [
      "function getUserUnstakingRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function getUnstakingRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function getPendingUnstaking(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function requestCount(address user) external view returns (uint256)",
      "function requests(address user, uint256 index) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed))",
      "function getTotalPendingRequests() external view returns (uint256)"
    ];
    
    // Create contract instances
    const treasuryContract = new ethers.Contract(contractAddresses.treasuryCore, treasuryCoreABI, signer);
    const unstakingContract = new ethers.Contract(contractAddresses.unstakingQueue, unstakingQueueABI, signer);
    
    // Results storage
    const allQueues = {
      hypeWithdrawals: [],
      zhypeUnstaking: [],
      errors: []
    };
    
    console.log('\n💰 CHECKING HYPE WITHDRAWAL QUEUE...');
    console.log('-'.repeat(40));
    
    // Check HYPE withdrawals
    try {
      const pendingWithdrawals = await treasuryContract.getPendingWithdrawals(walletAddress);
      console.log('✅ HYPE Withdrawals found:', pendingWithdrawals);
      
      if (pendingWithdrawals && pendingWithdrawals.length > 0) {
        console.log(`📊 Total HYPE withdrawal requests: ${pendingWithdrawals.length}`);
        
        pendingWithdrawals.forEach((withdrawal, index) => {
          const amount = ethers.formatEther(withdrawal.amount);
          const timestamp = new Date(Number(withdrawal.timestamp) * 1000);
          const completed = withdrawal.completed;
          const daysElapsed = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
          const hoursElapsed = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60));
          const daysRemaining = Math.max(0, 7 - daysElapsed);
          const hoursRemaining = Math.max(0, (7 * 24) - hoursElapsed);
          
          const queueItem = {
            type: 'HYPE Withdrawal',
            amount: amount,
            timestamp: timestamp.toISOString(),
            daysElapsed: daysElapsed,
            hoursElapsed: hoursElapsed,
            daysRemaining: daysRemaining,
            hoursRemaining: hoursRemaining,
            completed: completed,
            status: completed ? 'COMPLETED' : hoursRemaining > 0 ? `PENDING (${daysRemaining}d ${hoursRemaining % 24}h left)` : 'READY TO CLAIM'
          };
          
          allQueues.hypeWithdrawals.push(queueItem);
          
          console.log(`\n  📋 HYPE Withdrawal ${index + 1}:`);
          console.log(`    💰 Amount: ${amount} HYPE`);
          console.log(`    📅 Timestamp: ${timestamp.toISOString()}`);
          console.log(`    ⏰ Days elapsed: ${daysElapsed}`);
          console.log(`    ⏰ Hours elapsed: ${hoursElapsed}`);
          console.log(`    ⏳ Days remaining: ${daysRemaining}`);
          console.log(`    ⏳ Hours remaining: ${hoursRemaining}`);
          console.log(`    ✅ Completed: ${completed}`);
          console.log(`    🎯 Status: ${queueItem.status}`);
        });
      } else {
        console.log('📭 No HYPE withdrawal requests found');
      }
    } catch (error) {
      console.log('❌ Error fetching HYPE withdrawals:', error.message);
      allQueues.errors.push(`HYPE Withdrawals: ${error.message}`);
      
      // Try alternative method - check HYPE balance
      try {
        const hypeBalance = await treasuryContract.balanceOf(walletAddress);
        const hypeBalanceFormatted = ethers.formatEther(hypeBalance);
        console.log('💰 HYPE balance in treasury:', hypeBalanceFormatted);
        
        if (parseFloat(hypeBalanceFormatted) > 0) {
          console.log('💡 This might indicate a withdrawal request that needs to be processed');
        }
      } catch (balanceError) {
        console.log('❌ Could not check HYPE balance:', balanceError.message);
      }
    }
    
    console.log('\n🔄 CHECKING zHYPE UNSTAKING QUEUE...');
    console.log('-'.repeat(40));
    
    // Check zHYPE unstaking with multiple methods
    const unstakingMethods = [
      'getUserUnstakingRequests',
      'getUnstakingRequests', 
      'getPendingUnstaking'
    ];
    
    let unstakingRequests = [];
    let methodUsed = '';
    
    for (const method of unstakingMethods) {
      try {
        console.log(`🔍 Trying method: ${method}`);
        unstakingRequests = await unstakingContract[method](walletAddress);
        methodUsed = method;
        console.log(`✅ Success with ${method}:`, unstakingRequests);
        break;
      } catch (error) {
        console.log(`❌ ${method} failed:`, error.message);
      }
    }
    
    // If array methods don't work, try mapping approach
    if (!unstakingRequests || unstakingRequests.length === 0) {
      try {
        console.log('🔍 Trying mapping approach...');
        const count = await unstakingContract.requestCount(walletAddress);
        console.log('📊 Request count:', count.toString());
        
        unstakingRequests = [];
        for (let i = 0; i < Number(count); i++) {
          try {
            const request = await unstakingContract.requests(walletAddress, i);
            unstakingRequests.push(request);
          } catch (reqError) {
            console.log(`❌ Failed to get request ${i}:`, reqError.message);
          }
        }
        methodUsed = 'mapping approach';
      } catch (mapError) {
        console.log('❌ Mapping approach failed:', mapError.message);
        allQueues.errors.push(`zHYPE Unstaking: ${mapError.message}`);
      }
    }
    
    if (unstakingRequests && unstakingRequests.length > 0) {
      console.log(`✅ zHYPE Unstaking requests found (via ${methodUsed}):`, unstakingRequests.length);
      
      unstakingRequests.forEach((request, index) => {
        const amount = ethers.formatEther(request.amount);
        const timestamp = new Date(Number(request.timestamp) * 1000);
        const completed = request.completed;
        const daysElapsed = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
        const hoursElapsed = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60));
        const daysRemaining = Math.max(0, 7 - daysElapsed);
        const hoursRemaining = Math.max(0, (7 * 24) - hoursElapsed);
        
        const queueItem = {
          type: 'zHYPE Unstaking',
          amount: amount,
          timestamp: timestamp.toISOString(),
          daysElapsed: daysElapsed,
          hoursElapsed: hoursElapsed,
          daysRemaining: daysRemaining,
          hoursRemaining: hoursRemaining,
          completed: completed,
          status: completed ? 'COMPLETED' : hoursRemaining > 0 ? `PENDING (${daysRemaining}d ${hoursRemaining % 24}h left)` : 'READY TO CLAIM'
        };
        
        allQueues.zhypeUnstaking.push(queueItem);
        
        console.log(`\n  📋 zHYPE Unstaking ${index + 1}:`);
        console.log(`    💰 Amount: ${amount} zHYPE`);
        console.log(`    📅 Timestamp: ${timestamp.toISOString()}`);
        console.log(`    ⏰ Days elapsed: ${daysElapsed}`);
        console.log(`    ⏰ Hours elapsed: ${hoursElapsed}`);
        console.log(`    ⏳ Days remaining: ${daysRemaining}`);
        console.log(`    ⏳ Hours remaining: ${hoursRemaining}`);
        console.log(`    ✅ Completed: ${completed}`);
        console.log(`    🎯 Status: ${queueItem.status}`);
      });
    } else {
      console.log('📭 No zHYPE unstaking requests found');
    }
    
    // Summary Report
    console.log('\n📊 COMPLETE QUEUE SUMMARY');
    console.log('='.repeat(60));
    console.log(`👤 Wallet: ${walletAddress}`);
    console.log(`🏦 Treasury Contract: ${contractAddresses.treasuryCore}`);
    console.log(`🔄 Unstaking Contract: ${contractAddresses.unstakingQueue}`);
    console.log(`💰 HYPE Withdrawals: ${allQueues.hypeWithdrawals.length} requests`);
    console.log(`🔄 zHYPE Unstaking: ${allQueues.zhypeUnstaking.length} requests`);
    
    if (allQueues.errors.length > 0) {
      console.log(`❌ Errors: ${allQueues.errors.length}`);
      allQueues.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Detailed List
    console.log('\n📋 DETAILED QUEUE LIST:');
    console.log('-'.repeat(40));
    
    // HYPE Withdrawals
    if (allQueues.hypeWithdrawals.length > 0) {
      console.log('\n💰 HYPE WITHDRAWALS:');
      allQueues.hypeWithdrawals.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.amount} HYPE - ${item.status} (${item.daysElapsed}d ${item.hoursElapsed % 24}h ago)`);
      });
    } else {
      console.log('\n💰 HYPE WITHDRAWALS: None');
    }
    
    // zHYPE Unstaking
    if (allQueues.zhypeUnstaking.length > 0) {
      console.log('\n🔄 zHYPE UNSTAKING:');
      allQueues.zhypeUnstaking.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.amount} zHYPE - ${item.status} (${item.daysElapsed}d ${item.hoursElapsed % 24}h ago)`);
      });
    } else {
      console.log('\n🔄 zHYPE UNSTAKING: None');
    }
    
    // Return the data for further use
    return allQueues;
    
  } catch (error) {
    console.error('❌ Error checking all queues:', error);
    return { error: error.message };
  }
}

// Run the comprehensive check
checkAllQueues('0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4');






