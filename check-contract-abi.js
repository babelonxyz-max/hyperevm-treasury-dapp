import { ethers } from 'ethers';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Try to get contract code to see what functions exist
async function checkContract() {
  const code = await provider.getCode(TRANSFER_CONTRACT);
  console.log('Contract deployed:', code !== '0x');
  
  // Try calling owner() function
  try {
    const ownerABI = ["function owner() external view returns (address)"];
    const contract = new ethers.Contract(TRANSFER_CONTRACT, ownerABI, provider);
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
  } catch (e) {
    console.log('Could not get owner:', e.message);
  }
}

checkContract();
