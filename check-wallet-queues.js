// Script to check withdrawal and unstaking queues for specific wallet
// Run this in browser console while connected to the dApp

async function checkWalletQueues(walletAddress) {
  console.log(`🔍 Checking queues for wallet: ${walletAddress}`);
  
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
    
    // Contract ABIs
    const treasuryCoreABI = [
      "function getPendingWithdrawals(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function balanceOf(address account) external view returns (uint256)",
      "function withdrawHype(uint256 amount) external"
    ];
    
    const unstakingQueueABI = [
      "function getUserUnstakingRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function getUnstakingRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function getPendingUnstaking(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
      "function requestCount(address user) external view returns (uint256)",
      "function requests(address user, uint256 index) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed))"
    ];
    
    // Create contract instances
    const treasuryContract = new ethers.Contract(contractAddresses.treasuryCore, treasuryCoreABI, signer);
    const unstakingContract = new ethers.Contract(contractAddresses.unstakingQueue, unstakingQueueABI, signer);
    
    console.log('\n💰 Checking HYPE Withdrawal Queue...');
    
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
          
          console.log(`\n  📋 HYPE Withdrawal ${index + 1}:`);
          console.log(`    💰 Amount: ${amount} HYPE`);
          console.log(`    📅 Timestamp: ${timestamp.toISOString()}`);
          console.log(`    ⏰ Days elapsed: ${daysElapsed}`);
          console.log(`    ⏰ Hours elapsed: ${hoursElapsed}`);
          console.log(`    ⏳ Days remaining: ${daysRemaining}`);
          console.log(`    ⏳ Hours remaining: ${hoursRemaining}`);
          console.log(`    ✅ Completed: ${completed}`);
          
          if (completed) {
            console.log(`    🎉 Status: COMPLETED - Ready to claim!`);
          } else if (hoursRemaining > 0) {
            console.log(`    ⏳ Status: PENDING - ${daysRemaining}d ${hoursRemaining % 24}h remaining`);
          } else {
            console.log(`    🚀 Status: READY TO CLAIM!`);
          }
        });
      } else {
        console.log('📭 No HYPE withdrawal requests found');
      }
    } catch (error) {
      console.log('❌ Error fetching HYPE withdrawals:', error.message);
      
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
    
    console.log('\n🔄 Checking zHYPE Unstaking Queue...');
    
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
        
        console.log(`\n  📋 zHYPE Unstaking ${index + 1}:`);
        console.log(`    💰 Amount: ${amount} zHYPE`);
        console.log(`    📅 Timestamp: ${timestamp.toISOString()}`);
        console.log(`    ⏰ Days elapsed: ${daysElapsed}`);
        console.log(`    ⏰ Hours elapsed: ${hoursElapsed}`);
        console.log(`    ⏳ Days remaining: ${daysRemaining}`);
        console.log(`    ⏳ Hours remaining: ${hoursRemaining}`);
        console.log(`    ✅ Completed: ${completed}`);
        
        if (completed) {
          console.log(`    🎉 Status: COMPLETED - Ready to claim!`);
        } else if (hoursRemaining > 0) {
          console.log(`    ⏳ Status: PENDING - ${daysRemaining}d ${hoursRemaining % 24}h remaining`);
        } else {
          console.log(`    🚀 Status: READY TO CLAIM!`);
        }
      });
    } else {
      console.log('📭 No zHYPE unstaking requests found');
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`👤 Wallet: ${walletAddress}`);
    console.log(`🏦 Treasury Contract: ${contractAddresses.treasuryCore}`);
    console.log(`🔄 Unstaking Contract: ${contractAddresses.unstakingQueue}`);
    console.log(`💰 HYPE Withdrawals: ${pendingWithdrawals?.length || 0} requests`);
    console.log(`🔄 zHYPE Unstaking: ${unstakingRequests?.length || 0} requests`);
    
  } catch (error) {
    console.error('❌ Error checking queues:', error);
  }
}

// Run the check for the specific wallet
checkWalletQueues('0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4');






