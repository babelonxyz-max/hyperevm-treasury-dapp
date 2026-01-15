// Check what functions are actually available on the main staking rewards contract
import { ethers } from 'ethers';

async function checkMainContractFunctions() {
  const walletAddress = '0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4';
  const stakingRewardsAddress = '0x716E8c9E464736293EB46B71e81f6e9AA9c09058';
  const rpcUrl = 'https://rpc.hyperliquid.xyz/evm';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log('🔍 Checking main staking rewards contract functions...');
    
    // Try different possible toggle function names
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
      'setAutoStake',
      'toggleAutoClaim',
      'setAutoClaim'
    ];
    
    for (const funcName of possibleFunctions) {
      try {
        const testABI = [`function ${funcName}() external`];
        const contract = new ethers.Contract(stakingRewardsAddress, testABI, provider);
        
        // Try to estimate gas (this will fail if function doesn't exist)
        await contract[funcName].estimateGas();
        console.log(`✅ ${funcName} - Function exists on main contract!`);
        
      } catch (e) {
        console.log(`❌ ${funcName} - Function does not exist on main contract`);
      }
    }
    
    // Also check if there are any functions that take a boolean parameter
    const booleanFunctions = [
      'setAutoInvest(bool)',
      'setAutoReinvest(bool)',
      'setAutoCompound(bool)',
      'setAutoStake(bool)',
      'setAutoClaim(bool)'
    ];
    
    console.log('\n🔍 Checking boolean parameter functions...');
    for (const funcName of booleanFunctions) {
      try {
        const testABI = [`function ${funcName} external`];
        const contract = new ethers.Contract(stakingRewardsAddress, testABI, provider);
        
        await contract[funcName.split('(')[0]].estimateGas(true);
        console.log(`✅ ${funcName} - Function exists on main contract!`);
        
      } catch (e) {
        console.log(`❌ ${funcName} - Function does not exist on main contract`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMainContractFunctions();






