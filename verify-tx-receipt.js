import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TX_HASH = "0xe513ca9b917b8a92d26a4f0cc79b6a4c16d614b0acacb693293eaed17adcd0d2";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function verifyReceipt() {
  const receipt = await provider.getTransactionReceipt(TX_HASH);
  const tx = await provider.getTransaction(TX_HASH);
  
  console.log('\n📋 Transaction Details:');
  console.log(`   Hash: ${TX_HASH}`);
  console.log(`   From: ${tx.from}`);
  console.log(`   To: ${tx.to}`);
  console.log(`   Value: ${ethers.formatEther(tx.value)} HYPE`);
  console.log(`   Block: ${receipt.blockNumber}`);
  console.log(`   Status: ${receipt.status === 1 ? 'Success ✅' : 'Failed ❌'}`);
  
  // Check if the "to" address matches
  if (tx.to?.toLowerCase() === CONTRACT_OWNER.toLowerCase()) {
    console.log('\n✅ Transaction sent to correct address!');
    console.log('   Funds should be available. Proceeding with upgrade...\n');
    return true;
  } else {
    console.log('\n❌ Transaction sent to different address!');
    console.log(`   Expected: ${CONTRACT_OWNER}`);
    console.log(`   Got: ${tx.to}`);
    return false;
  }
}

verifyReceipt();
