import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

const TREASURY_ABI = [
  "function getTreasuryBalance() external view returns (uint256)",
  "function withdrawHype(uint256 amount) external",
  "function owner() external view returns (address)"
];

async function withdrawNativeHype() {
  try {
    console.log('🚀 Withdrawing native HYPE from HyperEVM...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESS, TREASURY_ABI, wallet);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Check current state
    const treasuryBalance = await treasuryContract.getTreasuryBalance();
    const owner = await treasuryContract.owner();
    const ownerBalance = await provider.getBalance(wallet.address);
    
    console.log('\n📊 Current State:');
    console.log(`🏛️  Treasury HYPE Balance: ${ethers.formatEther(treasuryBalance)} HYPE`);
    console.log(`👤 Owner HYPE Balance: ${ethers.formatEther(ownerBalance)} HYPE`);
    console.log(`👤 Contract Owner: ${owner}`);
    
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      return;
    }

    // Try withdrawing the full amount
    console.log(`\n🚀 Attempting to withdraw ${ethers.formatEther(treasuryBalance)} HYPE...`);
    
    try {
      // Test with static call first
      console.log('Testing static call...');
      await treasuryContract.withdrawHype.staticCall(treasuryBalance);
      console.log('✅ Static call successful');
      
      // Try actual transaction
      console.log('Attempting actual withdrawal...');
      const tx = await treasuryContract.withdrawHype(treasuryBalance, {
        gasLimit: 500000
      });
      
      console.log(`📝 Transaction Hash: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check new balances
      const newTreasuryBalance = await treasuryContract.getTreasuryBalance();
      const newOwnerBalance = await provider.getBalance(wallet.address);
      
      console.log(`\n📊 New State:`);
      console.log(`🏛️  New Treasury HYPE Balance: ${ethers.formatEther(newTreasuryBalance)} HYPE`);
      console.log(`👤 New Owner HYPE Balance: ${ethers.formatEther(newOwnerBalance)} HYPE`);
      
      const withdrawnAmount = parseFloat(ethers.formatEther(treasuryBalance)) - parseFloat(ethers.formatEther(newTreasuryBalance));
      console.log(`💰 Amount withdrawn: ${withdrawnAmount.toFixed(6)} HYPE`);
      
      console.log('\n🎉 SUCCESS! Native HYPE withdrawal completed!');
      
    } catch (error) {
      console.log(`❌ Full withdrawal failed: ${error.message}`);
      
      // Try with slightly less to account for gas
      console.log('\n🔄 Trying with slightly less amount...');
      try {
        const gasBuffer = ethers.parseEther("0.01"); // Reserve 0.01 HYPE for gas
        const withdrawAmount = treasuryBalance - gasBuffer;
        
        console.log(`Attempting to withdraw ${ethers.formatEther(withdrawAmount)} HYPE...`);
        
        const tx2 = await treasuryContract.withdrawHype(withdrawAmount, {
          gasLimit: 500000
        });
        
        console.log(`📝 Transaction Hash: ${tx2.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt2 = await tx2.wait();
        console.log(`✅ Transaction confirmed in block ${receipt2.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt2.gasUsed.toString()}`);
        
        const newTreasuryBalance2 = await treasuryContract.getTreasuryBalance();
        const newOwnerBalance2 = await provider.getBalance(wallet.address);
        
        console.log(`\n📊 New State:`);
        console.log(`🏛️  New Treasury HYPE Balance: ${ethers.formatEther(newTreasuryBalance2)} HYPE`);
        console.log(`👤 New Owner HYPE Balance: ${ethers.formatEther(newOwnerBalance2)} HYPE`);
        
        const withdrawnAmount2 = parseFloat(ethers.formatEther(treasuryBalance)) - parseFloat(ethers.formatEther(newTreasuryBalance2));
        console.log(`💰 Amount withdrawn: ${withdrawnAmount2.toFixed(6)} HYPE`);
        
        console.log('\n🎉 SUCCESS! Native HYPE withdrawal completed!');
        
      } catch (error2) {
        console.log(`❌ Reduced amount also failed: ${error2.message}`);
        
        // Try with 1.0 HYPE
        console.log('\n🔄 Trying with 1.0 HYPE...');
        try {
          const oneHype = ethers.parseEther("1.0");
          const tx3 = await treasuryContract.withdrawHype(oneHype, {
            gasLimit: 500000
          });
          
          console.log(`📝 Transaction Hash: ${tx3.hash}`);
          console.log('⏳ Waiting for confirmation...');
          
          const receipt3 = await tx3.wait();
          console.log(`✅ Transaction confirmed in block ${receipt3.blockNumber}`);
          console.log(`⛽ Gas used: ${receipt3.gasUsed.toString()}`);
          
          const newTreasuryBalance3 = await treasuryContract.getTreasuryBalance();
          const newOwnerBalance3 = await provider.getBalance(wallet.address);
          
          console.log(`\n📊 New State:`);
          console.log(`🏛️  New Treasury HYPE Balance: ${ethers.formatEther(newTreasuryBalance3)} HYPE`);
          console.log(`👤 New Owner HYPE Balance: ${ethers.formatEther(newOwnerBalance3)} HYPE`);
          
          const withdrawnAmount3 = parseFloat(ethers.formatEther(treasuryBalance)) - parseFloat(ethers.formatEther(newTreasuryBalance3));
          console.log(`💰 Amount withdrawn: ${withdrawnAmount3.toFixed(6)} HYPE`);
          
          console.log('\n🎉 SUCCESS! Native HYPE withdrawal completed!');
          
        } catch (error3) {
          console.log(`❌ All attempts failed. Last error: ${error3.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Native HYPE withdrawal failed:', error);
  }
}

withdrawNativeHype();






