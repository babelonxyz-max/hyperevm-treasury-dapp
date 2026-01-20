import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT_CONTRACT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

// RPC URL
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";

// Wallet that owns the NFTs
const NFT_OWNER_WALLET = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";

// Token IDs to transfer
const TOKEN_IDS = [1, 2, 3, 4, 5];

// Transfer Contract ABI
const TRANSFER_ABI = [
  "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function transferNFTs() {
  console.log('🚀 Transferring NFTs');
  console.log('📋 Transfer Contract:', TRANSFER_CONTRACT);
  console.log('🎫 NFT Contract:', RANDOM_ART_NFT_CONTRACT);
  console.log('👤 NFT Owner:', NFT_OWNER_WALLET);
  console.log('🎫 Token IDs:', TOKEN_IDS);
  console.log('');

  // We need the NFT owner's private key since the contract requires msg.sender == owner
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable not set!');
    console.error('   This must be the private key for:', NFT_OWNER_WALLET);
    console.error('   The approval is already in place, so the transfer will work once called.');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Verify wallet matches
  if (wallet.address.toLowerCase() !== NFT_OWNER_WALLET.toLowerCase()) {
    console.error('❌ ERROR: Private key does not match NFT owner wallet!');
    console.error('   Expected:', NFT_OWNER_WALLET);
    console.error('   Got:', wallet.address);
    process.exit(1);
  }

  console.log('✅ Wallet verified:', wallet.address);
  console.log('');

  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);

  try {
    // Pre-flight checks
    console.log('🔍 Running checks...');
    
    const isPaused = await transferContract.paused();
    if (isPaused) {
      console.error('❌ Contract is paused!');
      process.exit(1);
    }
    console.log('✅ Contract is active');

    const destination = await transferContract.destinationWallet();
    console.log('✅ Destination:', destination);
    console.log('');

    // Execute transfer
    console.log('📤 Executing transfer...');
    const tx = await transferContract.transferNFTs(
      RANDOM_ART_NFT_CONTRACT,
      TOKEN_IDS,
      { gasLimit: 500000 }
    );

    console.log('⏳ Transaction sent!');
    console.log('   TX Hash:', tx.hash);
    console.log('   Waiting for confirmation...');
    console.log('');

    const receipt = await tx.wait();
    
    console.log('✅ Transfer successful!');
    console.log('   TX Hash:', receipt.hash);
    console.log('   Block:', receipt.blockNumber);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    console.log('');
    console.log(`🎉 ${TOKEN_IDS.length} NFT(s) transferred to ${destination}`);
    console.log('');

  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
    throw error;
  }
}

transferNFTs()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
