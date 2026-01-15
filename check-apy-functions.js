// Check what APY update functions exist on contracts
import { ethers } from 'ethers';

async function checkAPYFunctions() {
  const contracts = [
    { name: 'Treasury Core', address: '0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16' },
    { name: 'Staking Rewards', address: '0x716E8c9E464736293EB46B71e81f6e9AA9c09058' },
    { name: 'Staking Rewards Simple', address: '0xBd8f5961Eeb024ACE3443C93d12Dea3740e28852' }
  ];
  
  const rpcUrl = 'https://rpc.hyperliquid.xyz/evm';
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    for (const contractInfo of contracts) {
      console.log(`\n🔍 Checking ${contractInfo.name} (${contractInfo.address})...`);
      
      try {
        // Check if contract exists
        const code = await provider.getCode(contractInfo.address);
        if (code === '0x') {
          console.log('❌ Contract not deployed');
          continue;
        }
        
        // Try different APY update function names
        const possibleFunctions = [
          'setHypeStakingAPY',
          'updateHypeStakingAPY',
          'setAPY',
          'updateAPY',
          'setRewardRate',
          'updateRewardRate',
          'setZhypeStakingAPY',
          'updateZhypeStakingAPY',
          'setStakingAPY',
          'updateStakingAPY'
        ];
        
        for (const funcName of possibleFunctions) {
          try {
            const testABI = [`function ${funcName}(uint256 newAPY) external`];
            const contract = new ethers.Contract(contractInfo.address, testABI, provider);
            
            // Try to estimate gas (this will fail if function doesn't exist)
            await contract[funcName].estimateGas(ethers.parseEther('0.372')); // 37.2%
            console.log(`✅ ${funcName} - Function exists!`);
            
          } catch (e) {
            console.log(`❌ ${funcName} - Function does not exist`);
          }
        }
        
        // Also check for owner functions
        try {
          const ownerABI = ['function owner() external view returns (address)'];
          const contract = new ethers.Contract(contractInfo.address, ownerABI, provider);
          const owner = await contract.owner();
          console.log(`👑 Owner: ${owner}`);
        } catch (e) {
          console.log('❌ Owner function not available');
        }
        
      } catch (error) {
        console.log(`❌ Error checking ${contractInfo.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAPYFunctions();






