import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TX_HASH = "0xe513ca9b917b8a92d26a4f0cc79b6a4c16d614b0acacb693293eaed17adcd0d2";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function analyzeTx() {
  const tx = await provider.getTransaction(TX_HASH);
  
  console.log('\n🔍 Transaction Analysis\n');
  console.log(`Data length: ${tx.data.length} bytes`);
  console.log(`Has data: ${tx.data !== '0x' ? 'YES (contract call)' : 'NO (simple transfer)'}`);
  console.log(`Value: ${ethers.formatEther(tx.value)} HYPE`);
  console.log(`Gas Limit: ${tx.gasLimit.toString()}`);
  console.log(`Gas Price: ${ethers.formatUnits(tx.gasPrice || 0n, 'gwei')} gwei`);
  
  if (tx.data !== '0x' && tx.data.length > 2) {
    console.log('\n⚠️  This is a contract call, not a simple transfer!');
    console.log('   The funds may have been sent to a contract, not directly to the wallet.');
  } else {
    console.log('\n✅ This is a simple transfer.');
    console.log('   But balance didn\'t increase - this is unusual.');
    console.log('   The RPC node may have sync issues.');
  }
  
  // Try to get balance with a fresh provider connection
  console.log('\n🔄 Trying fresh balance check...');
  const freshProvider = new ethers.JsonRpcProvider(RPC_URL);
  const freshBalance = await freshProvider.getBalance("0x29c1319f090c52e61c7099FD400234Fe83a82bB7");
  console.log(`   Fresh balance: ${ethers.formatEther(freshBalance)} HYPE`);
}

analyzeTx();
