import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

async function exactSuccessfulMethod() {
  try {
    console.log('🚀 Using exact method from successful transaction...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Check current state
    const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log(`🏛️  Contract ETH balance: ${ethers.formatEther(contractBalance)} ETH`);

    // The successful transaction used function selector 0x89f37023
    // Let's try to decode what this function actually is
    console.log('\n🔍 Analyzing successful transaction function...');
    
    // Try the exact same function call as the successful transaction
    // 0x89f37023 with 0.257 HYPE = 0x03910c236b468000
    const amount = ethers.parseEther("0.257");
    const data = "0x89f37023" + amount.toString(16).padStart(64, '0');
    
    console.log(`📝 Function data: ${data}`);
    console.log(`💰 Amount: ${ethers.formatEther(amount)} HYPE`);
    
    try {
      // Test with static call first
      console.log('\n🧪 Testing static call...');
      const result = await provider.call({
        to: CONTRACT_ADDRESS,
        from: wallet.address,
        data: data
      });
      
      if (result && result !== "0x") {
        console.log(`✅ Static call returned: ${result}`);
        
        // Try actual transaction
        console.log('\n🚀 Attempting actual transaction...');
        const tx = await wallet.sendTransaction({
          to: CONTRACT_ADDRESS,
          data: data,
          gasLimit: 500000,
          gasPrice: ethers.parseUnits("1", "gwei")
        });
        
        console.log(`📝 Transaction Hash: ${tx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log(`✅ SUCCESS! Transaction confirmed in block ${receipt.blockNumber}`);
          console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
          
          // Check balance after
          const newBalance = await provider.getBalance(CONTRACT_ADDRESS);
          console.log(`🏛️  Contract balance after: ${ethers.formatEther(newBalance)} ETH`);
          
          const withdrawnAmount = parseFloat(ethers.formatEther(contractBalance)) - parseFloat(ethers.formatEther(newBalance));
          console.log(`💰 Amount withdrawn: ${withdrawnAmount.toFixed(6)} ETH`);
          
          console.log('\n🎉 WITHDRAWAL SUCCESSFUL!');
          return;
        } else {
          console.log(`❌ Transaction failed with status: ${receipt.status}`);
        }
      } else {
        console.log(`❌ Static call returned no data or reverted`);
      }
      
    } catch (error) {
      console.log(`❌ Function call failed: ${error.message}`);
    }

    // Try with different amounts
    console.log('\n🔄 Trying with different amounts...');
    const amounts = ["0.1", "0.5", "1.0", "1.2"];
    
    for (const amountStr of amounts) {
      try {
        console.log(`\n🧪 Trying ${amountStr} HYPE...`);
        const amount = ethers.parseEther(amountStr);
        const data = "0x89f37023" + amount.toString(16).padStart(64, '0');
        
        const tx = await wallet.sendTransaction({
          to: CONTRACT_ADDRESS,
          data: data,
          gasLimit: 500000,
          gasPrice: ethers.parseUnits("1", "gwei")
        });
        
        console.log(`📝 Transaction Hash: ${tx.hash}`);
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          console.log(`✅ SUCCESS with ${amountStr} HYPE!`);
          console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
          
          const newBalance = await provider.getBalance(CONTRACT_ADDRESS);
          console.log(`🏛️  New balance: ${ethers.formatEther(newBalance)} ETH`);
          
          const withdrawnAmount = parseFloat(ethers.formatEther(contractBalance)) - parseFloat(ethers.formatEther(newBalance));
          console.log(`💰 Amount withdrawn: ${withdrawnAmount.toFixed(6)} ETH`);
          
          console.log('\n🎉 WITHDRAWAL SUCCESSFUL!');
          return;
        } else {
          console.log(`❌ ${amountStr} HYPE failed with status: ${receipt.status}`);
        }
        
      } catch (error) {
        console.log(`❌ ${amountStr} HYPE failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Exact successful method failed:', error);
  }
}

exactSuccessfulMethod();






