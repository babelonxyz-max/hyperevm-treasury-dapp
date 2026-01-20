import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";
const TX_HASH = "0xe513ca9b917b8a92d26a4f0cc79b6a4c16d614b0acacb693293eaed17adcd0d2";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function checkAll() {
  console.log('\n🔍 Comprehensive Balance Check\n');
  
  // Get transaction receipt
  const receipt = await provider.getTransactionReceipt(TX_HASH);
  const tx = await provider.getTransaction(TX_HASH);
  
  console.log('📋 Funding Transaction:');
  console.log(`   Hash: ${TX_HASH}`);
  console.log(`   Block: ${receipt.blockNumber}`);
  console.log(`   Value: ${ethers.formatEther(tx.value)} HYPE`);
  console.log(`   Status: ${receipt.status === 1 ? 'Success ✅' : 'Failed ❌'}\n`);
  
  // Calculate expected balance
  const balanceBefore = await provider.getBalance(CONTRACT_OWNER, receipt.blockNumber - 1);
  const balanceAfter = await provider.getBalance(CONTRACT_OWNER, receipt.blockNumber);
  const currentBalance = await provider.getBalance(CONTRACT_OWNER);
  
  console.log('💰 Balance Analysis:');
  console.log(`   Before funding (block ${receipt.blockNumber - 1}): ${ethers.formatEther(balanceBefore)} HYPE`);
  console.log(`   After funding (block ${receipt.blockNumber}): ${ethers.formatEther(balanceAfter)} HYPE`);
  console.log(`   Current balance: ${ethers.formatEther(currentBalance)} HYPE`);
  
  const expectedBalance = balanceBefore + tx.value;
  console.log(`\n   Expected balance: ${ethers.formatEther(expectedBalance)} HYPE`);
  
  if (parseFloat(ethers.formatEther(balanceAfter)) >= 0.001) {
    console.log('\n✅ Funds confirmed in block! Proceeding...\n');
    return true;
  } else {
    console.log('\n⚠️  Balance still low in block. Checking for other transactions...\n');
    return false;
  }
}

checkAll();
