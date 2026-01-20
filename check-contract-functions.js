import { ethers } from 'ethers';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Try calling transferNFTs directly - maybe the contract allows owner to call it
async function checkFunctions() {
  const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log('Wallet address:', wallet.address);
  
  // The issue: transferNFTs requires msg.sender == NFT owner
  // But we're the contract owner, not the NFT owner
  // So we need transferNFTsOnBehalf, but it might not be deployed
  
  // Let's try a different approach: check if we can use the NFT contract directly
  // Since the transfer contract is approved, we could theoretically call safeTransferFrom
  // from the transfer contract, but we can't sign as the transfer contract
  
  console.log('\n💡 Since transferNFTsOnBehalf might not be deployed,');
  console.log('   we need the NFT owner\'s private key to call transferNFTs()');
  console.log('   OR we need to upgrade the contract to add transferNFTsOnBehalf');
}

checkFunctions();
