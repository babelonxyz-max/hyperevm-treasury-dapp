import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const TOKEN_IDS = [1, 5, 4, 3, 2];

// Try to use transferNFTsOnBehalf if it exists, otherwise use regular transferNFTs
const TRANSFER_ABI = [
  "function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external",
  "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
  "function owner() external view returns (address)",
  "function paused() external view returns (bool)",
  "function destinationWallet() external view returns (address)"
];

async function transferAsOwner() {
  console.log('🚀 Transferring NFTs as Contract Owner');
  console.log('='.repeat(80));
  
  const privateKey = process.env.PRIVATE_KEY || process.env.CONTRACT_OWNER_KEY;
  if (!privateKey) {
    console.error('❌ Need PRIVATE_KEY (contract owner or NFT owner)');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
  
  console.log(`✅ Using wallet: ${wallet.address}`);
  
  try {
    const contractOwner = await transferContract.owner();
    const isPaused = await transferContract.paused();
    const destination = await transferContract.destinationWallet();
    
    console.log(`📋 Contract Owner: ${contractOwner}`);
    console.log(`⏸️  Paused: ${isPaused}`);
    console.log(`📬 Destination: ${destination}`);
    console.log(`👤 NFT Owner: ${NFT_OWNER}`);
    console.log(`🎫 Token IDs: [${TOKEN_IDS.join(', ')}]`);
    console.log('');
    
    if (isPaused) {
      console.error('❌ Contract is paused!');
      process.exit(1);
    }
    
    // Try transferNFTsOnBehalf first (if contract owner)
    if (wallet.address.toLowerCase() === contractOwner.toLowerCase()) {
      console.log('✅ Wallet is contract owner - using transferNFTsOnBehalf...');
      const tx = await transferContract.transferNFTsOnBehalf(
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
    }
    
    // Otherwise, try regular transferNFTs (requires NFT owner)
    if (wallet.address.toLowerCase() === NFT_OWNER.toLowerCase()) {
      console.log('✅ Wallet is NFT owner - using transferNFTs...');
      const tx = await transferContract.transferNFTs(
        RANDOM_ART_NFT,
        TOKEN_IDS.map(id => BigInt(id))
      );
      console.log(`📤 Transaction: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log('✅ Transfer successful!');
      console.log(`   Hash: ${receipt.transactionHash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      return;
    }
    
    console.error('❌ Wallet is neither contract owner nor NFT owner!');
    console.error(`   Contract Owner: ${contractOwner}`);
    console.error(`   NFT Owner: ${NFT_OWNER}`);
    console.error(`   Your Wallet: ${wallet.address}`);
    process.exit(1);
    
  } catch (error) {
    if (error.message.includes('transferNFTsOnBehalf')) {
      console.log('⚠️  transferNFTsOnBehalf not available, trying transferNFTs...');
      // Contract doesn't have transferNFTsOnBehalf - need NFT owner's key
      console.error('❌ Contract needs upgrade to add transferNFTsOnBehalf function');
      console.error('   OR use NFT owner\'s private key');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

transferAsOwner()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
