import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

const TREASURY_ABI = [
  "function getTreasuryBalance() external view returns (uint256)",
  "function withdrawHype(uint256 amount) external",
  "function owner() external view returns (address)"
];

async function retryWithdrawal() {
  try {
    console.log('🚀 Retrying withdrawal with exact same method as successful transaction...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESS, TREASURY_ABI, wallet);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Check current state
    const treasuryBalance = await treasuryContract.getTreasuryBalance();
    const owner = await treasuryContract.owner();
    
    console.log('\n📊 Current State:');
    console.log(`🏛️  Treasury Balance: ${ethers.formatEther(treasuryBalance)} HYPE`);
    console.log(`👤 Contract Owner: ${owner}`);
    
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      return;
    }

    // Try the exact same amount as the successful transaction (0.257 HYPE)
    const exactAmount = ethers.parseEther("0.257");
    console.log(`\n🚀 Trying exact same amount as successful transaction: 0.257 HYPE`);
    
    try {
      // Test with static call first
      console.log('Testing static call...');
      await treasuryContract.withdrawHype.staticCall(exactAmount);
      console.log('✅ Static call successful');
      
      // Try actual transaction
      console.log('Attempting actual withdrawal...');
      const tx = await treasuryContract.withdrawHype(exactAmount, {
        gasLimit: 500000
      });
      
      console.log(`📝 Transaction Hash: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check new balance
      const newBalance = await treasuryContract.getTreasuryBalance();
      console.log(`🏛️  New Treasury Balance: ${ethers.formatEther(newBalance)} HYPE`);
      
      console.log('\n🎉 SUCCESS! Withdrawal completed!');
      
    } catch (error) {
      console.log(`❌ Withdrawal failed: ${error.message}`);
      
      // Try with a smaller amount
      console.log('\n🔄 Trying with smaller amount (0.1 HYPE)...');
      try {
        const smallerAmount = ethers.parseEther("0.1");
        const tx2 = await treasuryContract.withdrawHype(smallerAmount, {
          gasLimit: 500000
        });
        
        console.log(`📝 Transaction Hash: ${tx2.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt2 = await tx2.wait();
        console.log(`✅ Transaction confirmed in block ${receipt2.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt2.gasUsed.toString()}`);
        
        const newBalance2 = await treasuryContract.getTreasuryBalance();
        console.log(`🏛️  New Treasury Balance: ${ethers.formatEther(newBalance2)} HYPE`);
        
        console.log('\n🎉 SUCCESS! Withdrawal completed!');
        
      } catch (error2) {
        console.log(`❌ Smaller amount also failed: ${error2.message}`);
        
        // Try with even smaller amount
        console.log('\n🔄 Trying with very small amount (0.01 HYPE)...');
        try {
          const tinyAmount = ethers.parseEther("0.01");
          const tx3 = await treasuryContract.withdrawHype(tinyAmount, {
            gasLimit: 500000
          });
          
          console.log(`📝 Transaction Hash: ${tx3.hash}`);
          console.log('⏳ Waiting for confirmation...');
          
          const receipt3 = await tx3.wait();
          console.log(`✅ Transaction confirmed in block ${receipt3.blockNumber}`);
          console.log(`⛽ Gas used: ${receipt3.gasUsed.toString()}`);
          
          const newBalance3 = await treasuryContract.getTreasuryBalance();
          console.log(`🏛️  New Treasury Balance: ${ethers.formatEther(newBalance3)} HYPE`);
          
          console.log('\n🎉 SUCCESS! Withdrawal completed!');
          
        } catch (error3) {
          console.log(`❌ All attempts failed: ${error3.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Retry failed:', error);
  }
}

retryWithdrawal();






