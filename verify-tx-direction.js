import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TX_HASH = "0xe513ca9b917b8a92d26a4f0cc79b6a4c16d614b0acacb693293eaed17adcd0d2";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function verifyDirection() {
  const receipt = await provider.getTransactionReceipt(TX_HASH);
  const tx = await provider.getTransaction(TX_HASH);
  
  console.log('\n🔍 Transaction Direction Analysis\n');
  console.log(`From: ${tx.from}`);
  console.log(`To: ${tx.to}`);
  console.log(`Value: ${ethers.formatEther(tx.value)} HYPE`);
  console.log(`Contract Owner: ${CONTRACT_OWNER}`);
  console.log('');
  
  if (tx.from?.toLowerCase() === CONTRACT_OWNER.toLowerCase()) {
    console.log('❌ Transaction was sent FROM contract owner (outgoing)!');
    console.log('   This means funds were sent AWAY from the contract owner.');
    console.log('   We need funds sent TO the contract owner instead.');
  } else if (tx.to?.toLowerCase() === CONTRACT_OWNER.toLowerCase()) {
    console.log('✅ Transaction was sent TO contract owner (incoming)!');
    console.log('   But balance didn\'t increase - checking for issues...');
    
    // Check if there were other transactions in the same block
    const block = await provider.getBlock(receipt.blockNumber, true);
    console.log(`\n   Block ${receipt.blockNumber} has ${block.transactions.length} transactions`);
    
    // Check balance of sender before and after
    const senderBalanceBefore = await provider.getBalance(tx.from, receipt.blockNumber - 1);
    const senderBalanceAfter = await provider.getBalance(tx.from, receipt.blockNumber);
    console.log(`   Sender balance before: ${ethers.formatEther(senderBalanceBefore)} HYPE`);
    console.log(`   Sender balance after: ${ethers.formatEther(senderBalanceAfter)} HYPE`);
    console.log(`   Difference: ${ethers.formatEther(senderBalanceBefore - senderBalanceAfter)} HYPE`);
  } else {
    console.log('⚠️  Transaction was not to/from contract owner!');
  }
}

verifyDirection();
