import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT_CONTRACT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

// RPC URL
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";

// Wallet that owns the NFTs (the one that approved)
const WALLET_ADDRESS = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";

// Token IDs to transfer (from the check script)
const TOKEN_IDS = [1, 2, 3, 4, 5];

// Transfer Contract ABI
const TRANSFER_ABI = [
  "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
  "function checkAndTransfer(address nftContract, uint256[] calldata tokenIds) external",
  "function checkNFTs(address nftContract, address wallet) external view returns (uint256)",
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function transferNFTs() {
  console.log('🚀 Starting NFT Transfer Process');
  console.log('📋 Transfer Contract:', TRANSFER_CONTRACT);
  console.log('🎫 NFT Contract:', RANDOM_ART_NFT_CONTRACT);
  console.log('👤 Wallet:', WALLET_ADDRESS);
  console.log('🎫 Token IDs:', TOKEN_IDS);
  console.log('');

  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable not set!');
    console.error('   Please set PRIVATE_KEY in .env file or as environment variable');
    console.error('   This should be the private key for wallet:', WALLET_ADDRESS);
    process.exit(1);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Verify wallet address matches
  if (wallet.address.toLowerCase() !== WALLET_ADDRESS.toLowerCase()) {
    console.error('❌ ERROR: Private key does not match wallet address!');
    console.error('   Expected:', WALLET_ADDRESS);
    console.error('   Got:', wallet.address);
    process.exit(1);
  }

  console.log('✅ Wallet connected:', wallet.address);
  console.log('');

  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);

  try {
    // Pre-flight checks
    console.log('🔍 Running pre-flight checks...');
    
    // Check if contract is paused
    const isPaused = await transferContract.paused();
    if (isPaused) {
      console.error('❌ ERROR: Transfer contract is paused!');
      process.exit(1);
    }
    console.log('✅ Contract is not paused');

    // Get destination wallet
    const destinationWallet = await transferContract.destinationWallet();
    console.log('✅ Destination wallet:', destinationWallet);

    // Verify NFT count
    const nftCount = await transferContract.checkNFTs(RANDOM_ART_NFT_CONTRACT, WALLET_ADDRESS);
    console.log('✅ NFT count verified:', Number(nftCount));
    
    if (Number(nftCount) !== TOKEN_IDS.length) {
      console.warn('⚠️  WARNING: Token count mismatch!');
      console.warn('   Expected:', TOKEN_IDS.length);
      console.warn('   Found:', Number(nftCount));
    }
    console.log('');

    // Execute transfer
    console.log('📤 Executing transfer...');
    console.log('   NFT Contract:', RANDOM_ART_NFT_CONTRACT);
    console.log('   Token IDs:', TOKEN_IDS);
    console.log('   From:', WALLET_ADDRESS);
    console.log('   To:', destinationWallet);
    console.log('');

    // Use checkAndTransfer for extra validation, or transferNFTs for direct transfer
    // checkAndTransfer validates the count matches, so it's safer
    const tx = await transferContract.checkAndTransfer(
      RANDOM_ART_NFT_CONTRACT,
      TOKEN_IDS,
      { gasLimit: 500000 } // Set gas limit to avoid estimation issues
    );

    console.log('⏳ Transaction sent!');
    console.log('   TX Hash:', tx.hash);
    console.log('   Waiting for confirmation...');
    console.log('');

    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('✅ Transfer successful!');
    console.log('   TX Hash:', receipt.hash);
    console.log('   Block Number:', receipt.blockNumber);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    console.log('');
    console.log('🎉 NFTs transferred successfully!');
    console.log(`   ${TOKEN_IDS.length} NFT(s) transferred from ${WALLET_ADDRESS} to ${destinationWallet}`);
    console.log('');

  } catch (error) {
    console.error('❌ Transfer failed!');
    console.error('   Error:', error.message);
    
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
    
    if (error.data) {
      console.error('   Data:', error.data);
    }
    
    // Check for common errors
    if (error.message.includes('not approved')) {
      console.error('');
      console.error('💡 TIP: Make sure the wallet has approved the transfer contract');
      console.error('   Call: setApprovalForAll(transferContract, true) on the NFT contract');
    }
    
    if (error.message.includes('Not owner')) {
      console.error('');
      console.error('💡 TIP: Make sure the wallet owns all the specified token IDs');
    }
    
    if (error.message.includes('paused')) {
      console.error('');
      console.error('💡 TIP: The transfer contract is paused. Contact the contract owner.');
    }
    
    throw error;
  }
}

transferNFTs()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
