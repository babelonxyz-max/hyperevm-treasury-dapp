import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

async function directContractApproach() {
  try {
    console.log('🚀 Direct contract approach with owner private key...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Get contract bytecode to understand what functions exist
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log(`📦 Contract bytecode length: ${code.length} bytes`);
    
    // Try different function selectors that might exist
    const possibleFunctions = [
      // Common withdrawal function selectors
      "0x17d8fd4b", // withdrawHype(uint256)
      "0x89f37023", // withdrawHype (from successful tx)
      "0x3ccfd60b", // withdraw()
      "0x2e1a7d4d", // withdraw(uint256)
      "0x205c2878", // withdrawAll()
      "0x4e1273f4", // emergencyWithdraw()
      "0x5312ea8e", // emergencyWithdrawAll()
      "0x7b0472f0", // adminWithdraw(uint256)
      "0x00f714ce", // adminWithdrawAll()
      "0x2f4f21e2", // withdrawToOwner()
      "0x5c60da1b", // ownerWithdraw()
    ];

    console.log('\n🔍 Testing different function selectors...');
    
    for (const selector of possibleFunctions) {
      try {
        console.log(`\n🧪 Testing selector: ${selector}`);
        
        // Try with 0.1 HYPE amount
        const amount = ethers.parseEther("0.1");
        const data = selector + amount.toString(16).padStart(64, '0');
        
        // Test with static call first
        const result = await provider.call({
          to: CONTRACT_ADDRESS,
          from: wallet.address,
          data: data
        });
        
        if (result && result !== "0x") {
          console.log(`✅ Selector ${selector} returned data: ${result}`);
          
          // Try actual transaction
          console.log(`🚀 Attempting transaction with selector ${selector}...`);
          const tx = await wallet.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: data,
            gasLimit: 500000
          });
          
          console.log(`📝 Transaction Hash: ${tx.hash}`);
          console.log('⏳ Waiting for confirmation...');
          
          const receipt = await tx.wait();
          if (receipt.status === 1) {
            console.log(`✅ SUCCESS! Transaction confirmed in block ${receipt.blockNumber}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            // Check balance after
            const balance = await provider.getBalance(CONTRACT_ADDRESS);
            console.log(`🏛️  Contract balance after: ${ethers.formatEther(balance)} HYPE`);
            
            console.log('\n🎉 WITHDRAWAL SUCCESSFUL!');
            return;
          } else {
            console.log(`❌ Transaction failed with status: ${receipt.status}`);
          }
        } else {
          console.log(`❌ Selector ${selector} returned no data or reverted`);
        }
        
      } catch (error) {
        console.log(`❌ Selector ${selector} failed: ${error.message}`);
      }
    }

    // If no function worked, try direct ETH transfer (if contract has receive function)
    console.log('\n🔄 Trying direct ETH transfer approach...');
    try {
      const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
      console.log(`🏛️  Contract ETH balance: ${ethers.formatEther(contractBalance)} ETH`);
      
      // Try to send ETH from contract to owner (if contract has this capability)
      const tx = await wallet.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: 0,
        data: "0x" // Empty data to trigger receive function
      });
      
      console.log(`📝 Transaction Hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed: ${receipt.status}`);
      
    } catch (error) {
      console.log(`❌ Direct ETH transfer failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Direct approach failed:', error);
  }
}

directContractApproach();






