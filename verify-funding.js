import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function verifyFunding() {
  console.log('\n🔍 Checking wallet balance and recent transactions...\n');
  console.log(`📍 Wallet Address: ${CONTRACT_OWNER}`);
  
  try {
    const balance = await provider.getBalance(CONTRACT_OWNER);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Current Balance: ${balanceEth} HYPE`);
    
    // Check recent transactions
    console.log('\n📋 Checking recent transactions...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`   Current block: ${blockNumber}`);
    
    // Try to get the latest block to see if there are any pending transactions
    const latestBlock = await provider.getBlock(blockNumber, true);
    console.log(`   Transactions in latest block: ${latestBlock.transactions.length}`);
    
    console.log('\n💡 If you sent funds, please verify:');
    console.log(`   1. Sent to: ${CONTRACT_OWNER}`);
    console.log(`   2. Amount: At least 0.001 HYPE`);
    console.log(`   3. Network: HyperEVM (Chain ID: 999)`);
    console.log(`   4. Transaction hash (if available)`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

verifyFunding();
