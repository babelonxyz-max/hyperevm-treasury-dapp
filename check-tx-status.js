import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TX_HASH = "0xe513ca9b917b8a92d26a4f0cc79b6a4c16d614b0acacb693293eaed17adcd0d2";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function checkTx() {
  console.log('\n🔍 Checking transaction status...\n');
  console.log(`📋 Transaction Hash: ${TX_HASH}\n`);
  
  try {
    const receipt = await provider.getTransactionReceipt(TX_HASH);
    if (receipt) {
      console.log('✅ Transaction confirmed!');
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
      
      // Get the transaction details
      const tx = await provider.getTransaction(TX_HASH);
      console.log(`\n📤 From: ${tx.from}`);
      console.log(`📥 To: ${tx.to}`);
      console.log(`💰 Value: ${ethers.formatEther(tx.value)} HYPE`);
      
      // Check balance now
      console.log('\n💰 Checking balance...');
      const balance = await provider.getBalance(CONTRACT_OWNER);
      console.log(`   Current Balance: ${ethers.formatEther(balance)} HYPE`);
      
      if (parseFloat(ethers.formatEther(balance)) >= 0.001) {
        console.log('\n✅ Sufficient funds! Ready to proceed with upgrade and transfer.');
      } else {
        console.log(`\n⚠️  Still need: ${(0.001 - parseFloat(ethers.formatEther(balance))).toFixed(6)} HYPE`);
      }
    } else {
      console.log('⏳ Transaction not yet confirmed (pending)...');
      const tx = await provider.getTransaction(TX_HASH);
      if (tx) {
        console.log(`   From: ${tx.from}`);
        console.log(`   To: ${tx.to}`);
        console.log(`   Value: ${ethers.formatEther(tx.value)} HYPE`);
        console.log('\n   Waiting for confirmation...');
      } else {
        console.log('   Transaction not found. Please verify the hash.');
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkTx();
