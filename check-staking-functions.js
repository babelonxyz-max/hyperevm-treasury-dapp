// Check what functions are available on the staking rewards contract
import { ethers } from 'ethers';

async function checkStakingFunctions() {
  const walletAddress = '0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4';
  
  // Contract addresses
  const stakingRewardsAddress = '0x716E8c9E464736293EB46B71e81f6e9AA9c09058';
  
  const rpcUrl = 'https://rpc.hyperliquid.xyz/evm';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log('🔍 Checking staking rewards contract functions...');
    
    // Try to get contract code to see if it exists
    const contractCode = await provider.getCode(stakingRewardsAddress);
    console.log('Contract code length:', contractCode.length);
    
    if (contractCode === '0x') {
      console.log('❌ Contract not found at address');
      return;
    } else {
      console.log('✅ Contract found');
    }
    
    // Try different function names that might exist for auto-invest
    const possibleFunctions = [
      'toggleAutoInvest',
      'setAutoInvest',
      'enableAutoInvest',
      'disableAutoInvest',
      'toggleAutoReinvest',
      'setAutoReinvest',
      'toggleAutoCompound',
      'setAutoCompound',
      'toggleAutoStake',
      'setAutoStake'
    ];
    
    console.log('\nTrying different auto-invest function names...');
    
    for (const funcName of possibleFunctions) {
      try {
        // Create a simple ABI for testing
        const testABI = [`function ${funcName}() external`];
        const contract = new ethers.Contract(stakingRewardsAddress, testABI, provider);
        
        // Try to estimate gas (this will fail if function doesn't exist)
        await contract[funcName].estimateGas();
        console.log(`✅ ${funcName} - Function exists!`);
        
        // Try to call it (this will fail but give us more info)
        try {
          await contract[funcName]();
        } catch (callError) {
          if (callError.message.includes('missing revert data')) {
            console.log(`   - Function exists but requires transaction (not view)`);
          } else {
            console.log(`   - Call error: ${callError.message}`);
          }
        }
        
      } catch (e) {
        // Function doesn't exist
        console.log(`❌ ${funcName} - Function does not exist`);
      }
    }
    
    // Also check for view functions
    console.log('\nChecking view functions...');
    const viewFunctions = [
      'getAutoInvestEnabled',
      'isAutoInvestEnabled',
      'autoInvestEnabled',
      'getAutoReinvestEnabled',
      'isAutoReinvestEnabled',
      'autoReinvestEnabled'
    ];
    
    for (const funcName of viewFunctions) {
      try {
        const testABI = [`function ${funcName}(address user) external view returns (bool)`];
        const contract = new ethers.Contract(stakingRewardsAddress, testABI, provider);
        const result = await contract[funcName](walletAddress);
        console.log(`✅ ${funcName} - Returns: ${result}`);
      } catch (e) {
        console.log(`❌ ${funcName} - Function does not exist`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStakingFunctions();






