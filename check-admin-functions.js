// Check for admin functions and other possible APY update methods
import { ethers } from 'ethers';

async function checkAdminFunctions() {
  const contracts = [
    { name: 'Treasury Core', address: '0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16' },
    { name: 'Staking Rewards', address: '0x716E8c9E464736293EB46B71e81f6e9AA9c09058' }
  ];
  
  const rpcUrl = 'https://rpc.hyperliquid.xyz/evm';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    for (const contractInfo of contracts) {
      console.log(`\n🔍 Checking ${contractInfo.name} admin functions...`);
      
      try {
        // Check for admin/owner functions
        const adminFunctions = [
          'owner',
          'admin',
          'governance',
          'setOwner',
          'transferOwnership',
          'renounceOwnership'
        ];
        
        for (const funcName of adminFunctions) {
          try {
            const testABI = [`function ${funcName}() external view returns (address)`];
            const contract = new ethers.Contract(contractInfo.address, testABI, provider);
            const result = await contract[funcName]();
            console.log(`✅ ${funcName}: ${result}`);
          } catch (e) {
            console.log(`❌ ${funcName}: Not available`);
          }
        }
        
        // Check for any functions that might update rates/APY
        const rateFunctions = [
          'setRate',
          'updateRate', 
          'setRewardRate',
          'updateRewardRate',
          'setInterestRate',
          'updateInterestRate',
          'setYield',
          'updateYield',
          'setMultiplier',
          'updateMultiplier',
          'setFactor',
          'updateFactor'
        ];
        
        console.log('\n🔍 Checking rate update functions...');
        for (const funcName of rateFunctions) {
          try {
            const testABI = [`function ${funcName}(uint256) external`];
            const contract = new ethers.Contract(contractInfo.address, testABI, provider);
            await contract[funcName].estimateGas(ethers.parseEther('0.372'));
            console.log(`✅ ${funcName} - Function exists!`);
          } catch (e) {
            console.log(`❌ ${funcName} - Function does not exist`);
          }
        }
        
      } catch (error) {
        console.log(`❌ Error checking ${contractInfo.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAdminFunctions();






