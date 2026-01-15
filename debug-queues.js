// Debug script to check withdrawal and unstake queue status
// Run this in browser console while connected to the dApp

async function debugQueues() {
  console.log('🔍 Starting queue debugging...');
  
  // Get the current account
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length === 0) {
    console.log('❌ No wallet connected');
    return;
  }
  
  const account = accounts[0];
  console.log('👤 Account:', account);
  
  // Get contract addresses from the dApp
  const contractAddresses = window.contractAddresses || {};
  console.log('📋 Contract addresses:', contractAddresses);
  
  // Get contract instances
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Treasury Core Contract
  const treasuryCoreABI = [
    "function withdrawHype(uint256 amount) external",
    "function getPendingWithdrawals(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
    "function balanceOf(address account) external view returns (uint256)"
  ];
  
  // Unstaking Queue Contract
  const unstakingQueueABI = [
    "function getUserUnstakingRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
    "function getUnstakingRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
    "function getPendingUnstaking(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed)[])",
    "function requestCount(address user) external view returns (uint256)",
    "function requests(address user, uint256 index) external view returns (tuple(uint256 amount, uint256 timestamp, bool completed))"
  ];
  
  try {
    // Check HYPE Withdrawal Queue
    console.log('\n💰 Checking HYPE Withdrawal Queue...');
    if (contractAddresses.treasuryCore) {
      const treasuryContract = new ethers.Contract(contractAddresses.treasuryCore, treasuryCoreABI, signer);
      
      try {
        const pendingWithdrawals = await treasuryContract.getPendingWithdrawals(account);
        console.log('✅ HYPE Withdrawals found:', pendingWithdrawals);
        
        if (pendingWithdrawals && pendingWithdrawals.length > 0) {
          pendingWithdrawals.forEach((withdrawal, index) => {
            const amount = ethers.formatEther(withdrawal.amount);
            const timestamp = new Date(Number(withdrawal.timestamp) * 1000);
            const completed = withdrawal.completed;
            const daysElapsed = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
            const daysRemaining = Math.max(0, 7 - daysElapsed);
            
            console.log(`  📋 Withdrawal ${index + 1}:`);
            console.log(`    Amount: ${amount} HYPE`);
            console.log(`    Timestamp: ${timestamp.toISOString()}`);
            console.log(`    Completed: ${completed}`);
            console.log(`    Days elapsed: ${daysElapsed}`);
            console.log(`    Days remaining: ${daysRemaining}`);
            console.log(`    Status: ${completed ? 'Completed' : daysRemaining > 0 ? `Pending (${daysRemaining} days left)` : 'Ready to claim'}`);
          });
        } else {
          console.log('📭 No HYPE withdrawal requests found');
        }
      } catch (error) {
        console.log('❌ Error fetching HYPE withdrawals:', error.message);
        
        // Fallback: Check HYPE balance
        try {
          const hypeBalance = await treasuryContract.balanceOf(account);
          const hypeBalanceFormatted = ethers.formatEther(hypeBalance);
          console.log('💰 HYPE balance:', hypeBalanceFormatted);
        } catch (balanceError) {
          console.log('❌ Could not check HYPE balance:', balanceError.message);
        }
      }
    } else {
      console.log('❌ Treasury Core contract address not found');
    }
    
    // Check zHYPE Unstaking Queue
    console.log('\n🔄 Checking zHYPE Unstaking Queue...');
    if (contractAddresses.unstakingQueue) {
      const unstakingContract = new ethers.Contract(contractAddresses.unstakingQueue, unstakingQueueABI, signer);
      
      // Try different methods
      const methods = [
        'getUserUnstakingRequests',
        'getUnstakingRequests', 
        'getPendingUnstaking'
      ];
      
      let unstakingRequests = [];
      let methodUsed = '';
      
      for (const method of methods) {
        try {
          console.log(`🔍 Trying method: ${method}`);
          unstakingRequests = await unstakingContract[method](account);
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
          const count = await unstakingContract.requestCount(account);
          console.log('📊 Request count:', count.toString());
          
          unstakingRequests = [];
          for (let i = 0; i < Number(count); i++) {
            try {
              const request = await unstakingContract.requests(account, i);
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
          const daysRemaining = Math.max(0, 7 - daysElapsed);
          
          console.log(`  📋 Unstaking ${index + 1}:`);
          console.log(`    Amount: ${amount} zHYPE`);
          console.log(`    Timestamp: ${timestamp.toISOString()}`);
          console.log(`    Completed: ${completed}`);
          console.log(`    Days elapsed: ${daysElapsed}`);
          console.log(`    Days remaining: ${daysRemaining}`);
          console.log(`    Status: ${completed ? 'Completed' : daysRemaining > 0 ? `Pending (${daysRemaining} days left)` : 'Ready to claim'}`);
        });
      } else {
        console.log('📭 No zHYPE unstaking requests found');
      }
    } else {
      console.log('❌ Unstaking Queue contract address not found');
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log('Account:', account);
    console.log('Contract addresses:', contractAddresses);
    console.log('Check the detailed logs above for your queue status');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug function
debugQueues();






