import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS_ADDRESS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const ZHYPE_TOKEN_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
const AMOUNT = "100";

async function tryTransferFunctions() {
  try {
    console.log('🔍 Trying different function signatures found in bytecode...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    const amountWei = ethers.parseEther(AMOUNT);
    
    // Try different function signatures
    const functions = [
      {
        name: 'transferToken(address,address,uint256)',
        abi: "function transferToken(address token, address to, uint256 amount) external",
        params: [ZHYPE_TOKEN_ADDRESS, TARGET_WALLET, amountWei]
      },
      {
        name: 'transferToken(address,uint256,address)',
        abi: "function transferToken(address token, uint256 amount, address to) external",
        params: [ZHYPE_TOKEN_ADDRESS, amountWei, TARGET_WALLET]
      },
      {
        name: 'emergencyWithdraw(address,address,uint256)',
        abi: "function emergencyWithdraw(address token, address to, uint256 amount) external",
        params: [ZHYPE_TOKEN_ADDRESS, TARGET_WALLET, amountWei]
      },
      {
        name: 'adminTransfer(address,address,uint256)',
        abi: "function adminTransfer(address token, address to, uint256 amount) external",
        params: [ZHYPE_TOKEN_ADDRESS, TARGET_WALLET, amountWei]
      },
      {
        name: 'withdraw(address,uint256)',
        abi: "function withdraw(address token, uint256 amount) external",
        params: [ZHYPE_TOKEN_ADDRESS, amountWei]
      }
    ];

    const zhypeABI = ["function balanceOf(address account) external view returns (uint256)"];
    const zhypeContract = new ethers.Contract(ZHYPE_TOKEN_ADDRESS, zhypeABI, provider);
    
    const balanceBefore = await zhypeContract.balanceOf(TARGET_WALLET);
    console.log(`📊 Target wallet balance before: ${ethers.formatEther(balanceBefore)} zHYPE`);

    for (const func of functions) {
      try {
        console.log(`\n🧪 Trying: ${func.name}...`);
        const contract = new ethers.Contract(STAKING_REWARDS_ADDRESS, [func.abi], wallet);
        
        // Try to estimate gas first
        const gasEstimate = await contract[func.name.split('(')[0]].estimateGas(...func.params);
        console.log(`✅ Function exists! Gas estimate: ${gasEstimate.toString()}`);
        
        // If gas estimation succeeds, try the actual transaction
        console.log(`🚀 Executing transaction...`);
        const tx = await contract[func.name.split('(')[0]](...func.params, { gasLimit: 200000 });
        console.log(`📝 Transaction Hash: ${tx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        
        // Check balance after
        const balanceAfter = await zhypeContract.balanceOf(TARGET_WALLET);
        const transferred = parseFloat(ethers.formatEther(balanceAfter)) - parseFloat(ethers.formatEther(balanceBefore));
        console.log(`💰 Transferred: ${transferred.toFixed(6)} zHYPE`);
        console.log(`\n🎉 SUCCESS with function: ${func.name}!`);
        return;
        
      } catch (error) {
        if (error.code === 'CALL_EXCEPTION' || error.message.includes('revert')) {
          console.log(`❌ ${func.name}: Function doesn't exist or parameters wrong`);
        } else if (error.code === 'INVALID_ARGUMENT') {
          console.log(`❌ ${func.name}: Invalid parameters`);
        } else {
          console.log(`❌ ${func.name}: ${error.message}`);
        }
        continue;
      }
    }
    
    console.log('\n❌ None of the functions worked. Contract may need to be upgraded or source code checked.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

tryTransferFunctions();

