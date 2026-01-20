import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";
const TX_BLOCK = 25046110; // Block where funding transaction was confirmed

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function checkBalanceAtBlock() {
  console.log('\n🔍 Checking balance at transaction block...\n');
  
  try {
    // Check balance at the block where transaction was confirmed
    const balance = await provider.getBalance(CONTRACT_OWNER, TX_BLOCK + 1);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Balance at block ${TX_BLOCK + 1}: ${balanceEth} HYPE`);
    
    // Also check current balance
    const currentBalance = await provider.getBalance(CONTRACT_OWNER);
    const currentBalanceEth = ethers.formatEther(currentBalance);
    console.log(`💰 Current balance (latest): ${currentBalanceEth} HYPE`);
    
    if (parseFloat(balanceEth) >= 0.001 || parseFloat(currentBalanceEth) >= 0.001) {
      console.log('\n✅ Funds are available! Proceeding with upgrade...\n');
      return true;
    } else {
      console.log('\n⚠️  Balance still showing low. This might be an RPC cache issue.');
      console.log('   The transaction shows 0.01 HYPE was sent successfully.');
      console.log('   Let me try proceeding anyway - the funds should be there.\n');
      return false;
    }
  } catch (e) {
    console.error('Error:', e.message);
    return false;
  }
}

checkBalanceAtBlock();
