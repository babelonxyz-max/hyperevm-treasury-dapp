import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const TOKEN_IDS = [1, 5, 4, 3, 2];

// Try multiple possible key sources
const PRIVATE_KEY = process.env.PRIVATE_KEY 
  || process.env.NFT_OWNER_PRIVATE_KEY 
  || process.env.OWNER_PRIVATE_KEY
  || process.env.CONTRACT_OWNER_KEY;

async function executeTransfer() {
  console.log('🚀 Executing NFT Transfer');
  console.log('='.repeat(80));
  
  if (!PRIVATE_KEY) {
    console.error('❌ No private key found!');
    console.error('   Tried: PRIVATE_KEY, NFT_OWNER_PRIVATE_KEY, OWNER_PRIVATE_KEY, CONTRACT_OWNER_KEY');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`✅ Using wallet: ${wallet.address}`);
  console.log(`📋 NFT Owner: ${NFT_OWNER}`);
  console.log(`🎫 Token IDs: [${TOKEN_IDS.join(', ')}]`);
  console.log('');
  
  const TRANSFER_ABI = [
    "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
    "function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external",
    "function owner() external view returns (address)",
    "function paused() external view returns (bool)",
    "function destinationWallet() external view returns (address)"
  ];
  
  const contract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
  
  try {
    const contractOwner = await contract.owner();
    const isPaused = await contract.paused();
    const destination = await contract.destinationWallet();
    
    console.log(`📋 Contract Owner: ${contractOwner}`);
    console.log(`⏸️  Paused: ${isPaused}`);
    console.log(`📬 Destination: ${destination}`);
    console.log('');
    
    if (isPaused) {
      console.error('❌ Contract is paused!');
      process.exit(1);
    }
    
    // Try transferNFTsOnBehalf if wallet is contract owner
    if (wallet.address.toLowerCase() === contractOwner.toLowerCase()) {
      console.log('✅ Wallet is contract owner - trying transferNFTsOnBehalf...');
      try {
        const tx = await contract.transferNFTsOnBehalf(
          NFT_OWNER,
          RANDOM_ART_NFT,
          TOKEN_IDS.map(id => BigInt(id))
        );
        console.log(`📤 Transaction: ${tx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transfer successful!');
        console.log(`   Hash: ${receipt.transactionHash}`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        return;
      } catch (e) {
        console.log('❌ transferNFTsOnBehalf failed:', e.message);
        console.log('   Function may not exist - contract needs upgrade');
        console.log('   Trying transferNFTs instead (requires NFT owner)...');
      }
    }
    
    // Try transferNFTs if wallet is NFT owner
    if (wallet.address.toLowerCase() === NFT_OWNER.toLowerCase()) {
      console.log('✅ Wallet is NFT owner - using transferNFTs...');
      const tx = await contract.transferNFTs(
        RANDOM_ART_NFT,
        TOKEN_IDS.map(id => BigInt(id))
      );
      console.log(`📤 Transaction: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transfer successful!');
      console.log(`   Hash: ${receipt.transactionHash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
      return;
    }
    
    console.error('❌ Wallet is neither contract owner nor NFT owner!');
    console.error(`   Contract Owner: ${contractOwner}`);
    console.error(`   NFT Owner: ${NFT_OWNER}`);
    console.error(`   Your Wallet: ${wallet.address}`);
    process.exit(1);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
    process.exit(1);
  }
}

executeTransfer()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
