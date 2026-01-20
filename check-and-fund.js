import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const CONTRACT_OWNER = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

async function checkBalance() {
  const balance = await provider.getBalance(CONTRACT_OWNER);
  console.log(`Contract owner balance: ${ethers.formatEther(balance)} HYPE`);
  console.log(`Need ~0.001 HYPE for deployment`);
  
  if (parseFloat(ethers.formatEther(balance)) < 0.001) {
    console.log('⚠️  Insufficient funds. Need to fund the wallet first.');
  } else {
    console.log('✅ Sufficient funds available');
  }
}

checkBalance();
