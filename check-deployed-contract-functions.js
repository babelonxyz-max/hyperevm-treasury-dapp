import { ethers } from 'ethers';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Common function signatures to check
const functionSignatures = {
  'transferNFTs': '0x6a627842',
  'transferNFTsWithSignature': '0x...', // Need to calculate
  'transferNFT': '0x...',
  'checkAndTransfer': '0x...',
};

async function checkContract() {
  console.log('Checking deployed contract functions...\n');
  
  // Try calling transferNFTs with owner address as parameter (if it exists)
  // Or check if there's a way to transfer using approval
  
  // Let's try to see if we can use the approval directly
  // The approval means the transfer contract can call safeTransferFrom
  // But we need a function that allows us to trigger this
  
  // Check if contract owner can execute transfers
  const ownerABI = ["function owner() external view returns (address)"];
  const contract = new ethers.Contract(TRANSFER_CONTRACT, ownerABI, provider);
  const owner = await contract.owner();
  console.log('Contract owner:', owner);
  
  // Try to see what functions are available by checking the contract code
  const code = await provider.getCode(TRANSFER_CONTRACT);
  console.log('Contract code length:', code.length);
  
  // The key insight: if the NFT owner approved the contract,
  // the contract can transfer. But we need a function that doesn't require msg.sender == owner
  // Maybe there's a function that takes owner as parameter?
}

checkContract();
