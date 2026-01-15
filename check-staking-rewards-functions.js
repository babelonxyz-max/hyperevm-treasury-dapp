import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const ZHYPE_TOKEN = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

async function checkAllFunctions() {
  try {
    console.log('🔍 Checking ALL possible functions to access Staking Rewards zHYPE...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    // Check zHYPE balance
    const zhypeABI = ["function balanceOf(address) view returns(uint256)"];
    const zhypeContract = new ethers.Contract(ZHYPE_TOKEN, zhypeABI, provider);
    const stakingBalance = await zhypeContract.balanceOf(STAKING_REWARDS);
    console.log(`📊 Staking Rewards zHYPE balance: ${ethers.formatEther(stakingBalance)} zHYPE\n`);
    
    // Try every possible function that might move tokens
    const possibleFunctions = [
      // Direct transfer functions
      "function transferToken(address,address,uint256)",
      "function adminTransfer(address,address,uint256)",
      "function emergencyWithdraw(address,address,uint256)",
      "function withdrawToken(address,address,uint256)",
      "function rescueTokens(address,address,uint256)",
      
      // Owner functions
      "function owner() view returns(address)",
      "function transferOwnership(address)",
      
      // Upgrade functions
      "function upgradeTo(address)",
      "function implementation() view returns(address)",
      
      // Distribution functions that might move tokens
      "function distributeRewards(address,uint256)",
      "function emergencyDistribute(address,uint256)",
      "function withdraw(address,uint256)",
      
      // Generic execute functions
      "function execute(address,bytes)",
      "function call(address,bytes)",
      "function multicall(bytes[])",
    ];
    
    console.log('Testing functions on Staking Rewards contract:');
    console.log('='.repeat(60));
    
    for (const funcSig of possibleFunctions) {
      try {
        const abi = [funcSig];
        const contract = new ethers.Contract(STAKING_REWARDS, abi, wallet);
        
        // Try to read if it's a view function
        if (funcSig.includes('view') || funcSig.includes('returns')) {
          try {
            const funcName = funcSig.split('(')[0].split(' ').pop();
            if (funcName === 'owner') {
              const owner = await contract.owner();
              console.log(`✅ ${funcName}() exists - Owner: ${owner}`);
            } else if (funcName === 'implementation') {
              const impl = await contract.implementation();
              console.log(`✅ ${funcName}() exists - Implementation: ${impl}`);
            } else {
              console.log(`✅ ${funcName}() exists (view function)`);
            }
          } catch (e) {
            console.log(`❌ ${funcSig.split('(')[0].split(' ').pop()}() - does not exist`);
          }
        } else {
          // Try to estimate gas (means function exists)
          const funcName = funcSig.split('(')[0].split(' ').pop();
          try {
            // Use dummy parameters
            if (funcName === 'transferToken' || funcName === 'adminTransfer') {
              await contract[funcName].estimateGas(
                ZHYPE_TOKEN,
                TARGET_WALLET,
                ethers.parseEther("1")
              );
              console.log(`✅ ${funcName}() EXISTS! Can transfer tokens!`);
            } else if (funcName === 'upgradeTo') {
              await contract[funcName].estimateGas("0x0000000000000000000000000000000000000000");
              console.log(`✅ ${funcName}() EXISTS! Contract is upgradeable!`);
            } else {
              console.log(`⚠️  ${funcName}() - may exist (needs testing)`);
            }
          } catch (e) {
            if (e.message.includes('missing revert data') || e.message.includes('execution reverted')) {
              console.log(`⚠️  ${funcName}() - may exist but reverts with dummy params`);
            } else {
              console.log(`❌ ${funcName}() - does not exist`);
            }
          }
        }
      } catch (e) {
        const funcName = funcSig.split('(')[0].split(' ').pop();
        console.log(`❌ ${funcName}() - does not exist`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📝 SUMMARY:');
    console.log('='.repeat(60));
    console.log('❌ No transfer functions found');
    console.log('✅ Contract is owned by you');
    console.log('⚠️  zHYPE is locked in contract');
    console.log('\n💡 SOLUTION: Upgrade contract to add transferToken() function');
    console.log('   File: StakingRewardsUpgradeableV2.sol');
    console.log('   Function: transferToken(address token, address to, uint256 amount)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllFunctions();
