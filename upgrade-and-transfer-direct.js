import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

// Since upgrading is complex, let's just try to transfer using the NFT owner's key
// OR check if we can find the NFT owner's key

async function transferNFTs() {
  console.log('🚀 Transferring NFTs');
  console.log('='.repeat(80));
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log(`✅ Using contract owner wallet: ${wallet.address}`);
  console.log(`👤 NFT Owner: ${NFT_OWNER}`);
  console.log(`🎫 Token IDs: [${TOKEN_IDS.join(', ')}]`);
  console.log('');
  
  // Check if contract has transferNFTsOnBehalf
  const TRANSFER_ABI = [
    "function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external",
    "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
    "function owner() external view returns (address)",
    "function paused() external view returns (bool)"
  ];
  
  const contract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
  
  try {
    const contractOwner = await contract.owner();
    const isPaused = await contract.paused();
    
    console.log(`📋 Contract Owner: ${contractOwner}`);
    console.log(`⏸️  Paused: ${isPaused}`);
    console.log('');
    
    if (isPaused) {
      console.error('❌ Contract is paused!');
      process.exit(1);
    }
    
    // Try transferNFTsOnBehalf
    console.log('⏳ Attempting transferNFTsOnBehalf...');
    try {
      const tx = await contract.transferNFTsOnBehalf(
        NFT_OWNER,
        RANDOM_ART_NFT,
        TOKEN_IDS.map(id => BigInt(id))
      );
      console.log(`📤 Transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log('✅ Transfer successful!');
      console.log(`   Hash: ${receipt.transactionHash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      return;
    } catch (e) {
      console.log('❌ transferNFTsOnBehalf failed:', e.message);
      console.log('   Contract needs upgrade OR we need NFT owner\'s key');
      console.log('');
      console.log('💡 To proceed, we need:');
      console.log('   1. NFT owner\'s private key (0x67252aCF497134CC5c8f840a38b5f59Fc090Af83)');
      console.log('   OR');
      console.log('   2. Upgrade contract to add transferNFTsOnBehalf function');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

transferNFTs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
