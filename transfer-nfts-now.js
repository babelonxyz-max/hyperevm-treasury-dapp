import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT_CONTRACT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

// RPC URL
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";

// Wallet that owns the NFTs
const NFT_OWNER_WALLET = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";

// Token IDs to transfer (from status check)
const TOKEN_IDS = [1, 5, 4, 3, 2];

// Transfer Contract ABI
const TRANSFER_ABI = [
  "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
  "function checkAndTransfer(address nftContract, uint256[] calldata tokenIds) external",
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)"
];

// ERC-721 ABI
const ERC721_ABI = [
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)"
];

async function transferNFTs() {
  console.log('🚀 Transferring NFTs');
  console.log('='.repeat(80));
  console.log(`📋 Transfer Contract: ${TRANSFER_CONTRACT}`);
  console.log(`🎨 NFT Contract: ${RANDOM_ART_NFT_CONTRACT}`);
  console.log(`👤 NFT Owner: ${NFT_OWNER_WALLET}`);
  console.log(`🎫 Token IDs: [${TOKEN_IDS.join(', ')}]`);
  console.log('');

  // Get private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable not set!');
    console.error('   Set it with: export PRIVATE_KEY=0x...');
    console.error('   This must be the private key for the NFT owner wallet');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Verify wallet matches
  if (wallet.address.toLowerCase() !== NFT_OWNER_WALLET.toLowerCase()) {
    console.error('❌ ERROR: Private key does not match NFT owner wallet!');
    console.error(`   Expected: ${NFT_OWNER_WALLET}`);
    console.error(`   Got: ${wallet.address}`);
    process.exit(1);
  }

  console.log(`✅ Using wallet: ${wallet.address}`);
  console.log('');

  try {
    // Pre-flight checks
    console.log('🔍 Running pre-flight checks...');
    
    const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, provider);
    const nftContract = new ethers.Contract(RANDOM_ART_NFT_CONTRACT, ERC721_ABI, provider);

    // Check if contract is paused
    const isPaused = await transferContract.paused();
    if (isPaused) {
      console.error('❌ ERROR: Transfer contract is paused!');
      process.exit(1);
    }
    console.log('✅ Contract is active (not paused)');

    // Check approval
    const isApproved = await nftContract.isApprovedForAll(NFT_OWNER_WALLET, TRANSFER_CONTRACT);
    if (!isApproved) {
      console.error('❌ ERROR: Transfer contract is not approved!');
      console.error('   The wallet must call setApprovalForAll first.');
      process.exit(1);
    }
    console.log('✅ Transfer contract is approved');

    // Check balance
    const balance = await nftContract.balanceOf(NFT_OWNER_WALLET);
    if (Number(balance) < TOKEN_IDS.length) {
      console.error(`❌ ERROR: Wallet only has ${balance} NFTs, but trying to transfer ${TOKEN_IDS.length}`);
      process.exit(1);
    }
    console.log(`✅ Wallet has ${balance} NFTs (need ${TOKEN_IDS.length})`);

    // Get destination
    const destination = await transferContract.destinationWallet();
    console.log(`📬 Destination wallet: ${destination}`);
    console.log('');

    // Convert token IDs to BigInt
    const tokenIdsBigInt = TOKEN_IDS.map(id => BigInt(id));

    // Transfer NFTs
    console.log('⏳ Transferring NFTs...');
    console.log(`   Token IDs: [${TOKEN_IDS.join(', ')}]`);
    console.log(`   From: ${NFT_OWNER_WALLET}`);
    console.log(`   To: ${destination}`);
    console.log('');

    const transferContractWithSigner = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
    
    // Use transferNFTs function (requires msg.sender to be owner)
    const tx = await transferContractWithSigner.transferNFTs(
      RANDOM_ART_NFT_CONTRACT,
      tokenIdsBigInt
    );

    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    
    console.log('');
    console.log('✅ Transfer successful!');
    console.log('='.repeat(80));
    console.log('📋 Transaction Details:');
    console.log(`   Hash: ${receipt.transactionHash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    console.log('');
    console.log(`🎉 ${TOKEN_IDS.length} NFT(s) transferred to ${destination}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
    if (error.data) {
      console.error('   Data:', error.data);
    }
    process.exit(1);
  }
}

transferNFTs()
  .then(() => {
    console.log('✅ Transfer complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Transfer failed:', error);
    process.exit(1);
  });
