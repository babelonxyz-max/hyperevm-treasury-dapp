import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

async function checkAllPossibleFunctions() {
  try {
    console.log('🔍 Checking all possible withdrawal functions...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Get contract bytecode
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log(`📦 Contract bytecode length: ${code.length} bytes`);

    // Try all possible withdrawal function selectors
    const withdrawalFunctions = [
      { name: "withdrawHype(uint256)", selector: "0x17d8fd4b" },
      { name: "withdrawHype (successful tx)", selector: "0x89f37023" },
      { name: "withdraw()", selector: "0x3ccfd60b" },
      { name: "withdraw(uint256)", selector: "0x2e1a7d4d" },
      { name: "withdrawAll()", selector: "0x205c2878" },
      { name: "emergencyWithdraw()", selector: "0x4e1273f4" },
      { name: "emergencyWithdrawAll()", selector: "0x5312ea8e" },
      { name: "adminWithdraw(uint256)", selector: "0x7b0472f0" },
      { name: "adminWithdrawAll()", selector: "0x00f714ce" },
      { name: "withdrawToOwner()", selector: "0x2f4f21e2" },
      { name: "ownerWithdraw()", selector: "0x5c60da1b" },
      { name: "withdrawETH()", selector: "0x2e1a7d4d" },
      { name: "withdrawNative()", selector: "0x3ccfd60b" },
      { name: "claim()", selector: "0x4e1273f4" },
      { name: "claimAll()", selector: "0x5312ea8e" },
      { name: "extract()", selector: "0x2e1a7d4d" },
      { name: "drain()", selector: "0x3ccfd60b" },
      { name: "sweep()", selector: "0x2e1a7d4d" },
      { name: "rescue()", selector: "0x3ccfd60b" },
      { name: "recover()", selector: "0x2e1a7d4d" }
    ];

    console.log('\n🧪 Testing all withdrawal function selectors...');
    
    for (const func of withdrawalFunctions) {
      try {
        console.log(`\n🔍 Testing ${func.name} (${func.selector})`);
        
        // Try with 0.1 HYPE amount
        const amount = ethers.parseEther("0.1");
        const data = func.selector + amount.toString(16).padStart(64, '0');
        
        // Test with static call first
        const result = await provider.call({
          to: CONTRACT_ADDRESS,
          from: wallet.address,
          data: data
        });
        
        if (result && result !== "0x") {
          console.log(`✅ ${func.name} returned data: ${result}`);
          
          // Try actual transaction
          console.log(`🚀 Attempting transaction with ${func.name}...`);
          const tx = await wallet.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: data,
            gasLimit: 500000
          });
          
          console.log(`📝 Transaction Hash: ${tx.hash}`);
          console.log('⏳ Waiting for confirmation...');
          
          const receipt = await tx.wait();
          if (receipt.status === 1) {
            console.log(`✅ SUCCESS! ${func.name} worked!`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            // Check balance after
            const balance = await provider.getBalance(CONTRACT_ADDRESS);
            console.log(`🏛️  Contract balance after: ${ethers.formatEther(balance)} HYPE`);
            
            console.log('\n🎉 WITHDRAWAL SUCCESSFUL!');
            return;
          } else {
            console.log(`❌ ${func.name} transaction failed with status: ${receipt.status}`);
          }
        } else {
          console.log(`❌ ${func.name} returned no data or reverted`);
        }
        
      } catch (error) {
        console.log(`❌ ${func.name} failed: ${error.message}`);
      }
    }

    // Try functions without parameters
    console.log('\n🔄 Trying functions without parameters...');
    const noParamFunctions = [
      { name: "withdraw()", selector: "0x3ccfd60b" },
      { name: "withdrawAll()", selector: "0x205c2878" },
      { name: "emergencyWithdraw()", selector: "0x4e1273f4" },
      { name: "emergencyWithdrawAll()", selector: "0x5312ea8e" },
      { name: "adminWithdrawAll()", selector: "0x00f714ce" },
      { name: "withdrawToOwner()", selector: "0x2f4f21e2" },
      { name: "ownerWithdraw()", selector: "0x5c60da1b" },
      { name: "claim()", selector: "0x4e1273f4" },
      { name: "claimAll()", selector: "0x5312ea8e" },
      { name: "drain()", selector: "0x3ccfd60b" },
      { name: "sweep()", selector: "0x2e1a7d4d" },
      { name: "rescue()", selector: "0x3ccfd60b" },
      { name: "recover()", selector: "0x2e1a7d4d" }
    ];

    for (const func of noParamFunctions) {
      try {
        console.log(`\n🔍 Testing ${func.name} (no params)`);
        
        // Test with static call first
        const result = await provider.call({
          to: CONTRACT_ADDRESS,
          from: wallet.address,
          data: func.selector
        });
        
        if (result && result !== "0x") {
          console.log(`✅ ${func.name} returned data: ${result}`);
          
          // Try actual transaction
          console.log(`🚀 Attempting transaction with ${func.name}...`);
          const tx = await wallet.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: func.selector,
            gasLimit: 500000
          });
          
          console.log(`📝 Transaction Hash: ${tx.hash}`);
          console.log('⏳ Waiting for confirmation...');
          
          const receipt = await tx.wait();
          if (receipt.status === 1) {
            console.log(`✅ SUCCESS! ${func.name} worked!`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            // Check balance after
            const balance = await provider.getBalance(CONTRACT_ADDRESS);
            console.log(`🏛️  Contract balance after: ${ethers.formatEther(balance)} HYPE`);
            
            console.log('\n🎉 WITHDRAWAL SUCCESSFUL!');
            return;
          } else {
            console.log(`❌ ${func.name} transaction failed with status: ${receipt.status}`);
          }
        } else {
          console.log(`❌ ${func.name} returned no data or reverted`);
        }
        
      } catch (error) {
        console.log(`❌ ${func.name} failed: ${error.message}`);
      }
    }

    console.log('\n❌ No working withdrawal function found. The contract may have been modified or has restrictions.');

  } catch (error) {
    console.error('❌ Function check failed:', error);
  }
}

checkAllPossibleFunctions();






