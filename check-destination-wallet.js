import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";

const TRANSFER_ABI = [
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)",
  "function owner() external view returns (address)"
];

async function checkDestinationWallet() {
  try {
    console.log('🔍 Checking Hypurr NFT Transfer Contract...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, provider);
    
    const destination = await transferContract.destinationWallet();
    const paused = await transferContract.paused();
    const owner = await transferContract.owner();
    
    console.log('📍 Transfer Contract:', TRANSFER_CONTRACT);
    console.log('📬 Current Destination Wallet:', destination);
    console.log('👤 Contract Owner:', owner);
    console.log('⏸️  Contract Paused:', paused);
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
  }
}

checkDestinationWallet();
