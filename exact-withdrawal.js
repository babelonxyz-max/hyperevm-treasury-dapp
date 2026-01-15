import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

const TREASURY_ABI = [
  "function getTreasuryBalance() external view returns (uint256)",
  "function withdrawHype(uint256 amount) external",
  "function owner() external view returns (address)"
];

async function exactWithdrawal() {
  try {
    console.log('🚀 Attempting exact withdrawal parameters...');
    
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
      // Try with different gas settings
      const tx = await treasuryContract.withdrawHype(exactAmount, {
        gasLimit: 300000,
        gasPrice: ethers.parseUnits("1", "gwei")
      });
      
      console.log(`📝 Transaction Hash: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check new balance
      const newBalance = await treasuryContract.getTreasuryBalance();
      console.log(`🏛️  New Treasury Balance: ${ethers.formatEther(newBalance)} HYPE`);
      
      const withdrawnAmount = parseFloat(ethers.formatEther(treasuryBalance)) - parseFloat(ethers.formatEther(newBalance));
      console.log(`💰 Amount withdrawn: ${withdrawnAmount.toFixed(6)} HYPE`);
      
      console.log('\n🎉 SUCCESS! Withdrawal completed!');
      
    } catch (error) {
      console.log(`❌ Exact amount failed: ${error.message}`);
      
      // Try with the current balance minus a small amount
      console.log('\n🔄 Trying with current balance minus 0.001 HYPE...');
      try {
        const currentBalanceWei = treasuryBalance;
        const smallBuffer = ethers.parseEther("0.001");
        const withdrawAmount = currentBalanceWei - smallBuffer;
        
        console.log(`Attempting to withdraw: ${ethers.formatEther(withdrawAmount)} HYPE`);
        
        const tx2 = await treasuryContract.withdrawHype(withdrawAmount, {
          gasLimit: 300000,
          gasPrice: ethers.parseUnits("1", "gwei")
        });
        
        console.log(`📝 Transaction Hash: ${tx2.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt2 = await tx2.wait();
        console.log(`✅ Transaction confirmed in block ${receipt2.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt2.gasUsed.toString()}`);
        
        const newBalance2 = await treasuryContract.getTreasuryBalance();
        console.log(`🏛️  New Treasury Balance: ${ethers.formatEther(newBalance2)} HYPE`);
        
        const withdrawnAmount2 = parseFloat(ethers.formatEther(treasuryBalance)) - parseFloat(ethers.formatEther(newBalance2));
        console.log(`💰 Amount withdrawn: ${withdrawnAmount2.toFixed(6)} HYPE`);
        
        console.log('\n🎉 SUCCESS! Withdrawal completed!');
        
      } catch (error2) {
        console.log(`❌ Current balance minus buffer also failed: ${error2.message}`);
        
        // Try with a very small amount
        console.log('\n🔄 Trying with 0.001 HYPE...');
        try {
          const tinyAmount = ethers.parseEther("0.001");
          const tx3 = await treasuryContract.withdrawHype(tinyAmount, {
            gasLimit: 300000,
            gasPrice: ethers.parseUnits("1", "gwei")
          });
          
          console.log(`📝 Transaction Hash: ${tx3.hash}`);
          console.log('⏳ Waiting for confirmation...');
          
          const receipt3 = await tx3.wait();
          console.log(`✅ Transaction confirmed in block ${receipt3.blockNumber}`);
          console.log(`⛽ Gas used: ${receipt3.gasUsed.toString()}`);
          
          const newBalance3 = await treasuryContract.getTreasuryBalance();
          console.log(`🏛️  New Treasury Balance: ${ethers.formatEther(newBalance3)} HYPE`);
          
          const withdrawnAmount3 = parseFloat(ethers.formatEther(treasuryBalance)) - parseFloat(ethers.formatEther(newBalance3));
          console.log(`💰 Amount withdrawn: ${withdrawnAmount3.toFixed(6)} HYPE`);
          
          console.log('\n🎉 SUCCESS! Withdrawal completed!');
          
        } catch (error3) {
          console.log(`❌ All attempts failed. Last error: ${error3.message}`);
          console.log('\n🔍 This suggests the contract may have been modified or has additional restrictions.');
        }
      }
    }

  } catch (error) {
    console.error('❌ Withdrawal failed:', error);
  }
}

exactWithdrawal();






