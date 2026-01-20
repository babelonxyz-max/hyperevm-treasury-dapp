import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function checkBalance() {
  try {
    const balance = await provider.getBalance(CONTRACT_OWNER);
    const balanceEth = ethers.formatEther(balance);
    console.log(`\n💰 Current Balance: ${balanceEth} HYPE`);
    console.log(`📊 Need: ~0.001 HYPE for deployment`);
    const needed = 0.001 - parseFloat(balanceEth);
    if (needed > 0) {
      console.log(`⚠️  Still need: ${needed.toFixed(6)} HYPE`);
    } else {
      console.log(`✅ Sufficient funds! Ready to proceed.`);
    }
    console.log(`\n📍 Wallet Address: ${CONTRACT_OWNER}\n`);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkBalance();
