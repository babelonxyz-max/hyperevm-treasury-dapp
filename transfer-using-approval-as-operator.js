import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const TOKEN_IDS = [1, 5, 4, 3, 2];
const DESTINATION = "0x25b155C387bcf2434F0df5e2f34E9D68E0A99228";

// Since the transfer contract is approved, we can call safeTransferFrom
// BUT - we need to call it FROM the transfer contract
// The approval allows the transfer contract to transfer, not us directly

const ERC721_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)"
];

async function transferUsingApproval() {
  console.log('🚀 Transferring NFTs using existing approval');
  console.log('='.repeat(80));
  console.log(`📋 Transfer Contract: ${TRANSFER_CONTRACT}`);
  console.log(`🎨 NFT Contract: ${RANDOM_ART_NFT}`);
  console.log(`👤 NFT Owner: ${NFT_OWNER}`);
  console.log(`🎫 Token IDs: [${TOKEN_IDS.join(', ')}]`);
  console.log(`📬 Destination: ${DESTINATION}`);
  console.log('');

  // Get private key - this should be the CONTRACT OWNER's key
  // The contract owner can potentially add a function to transfer on behalf
  // OR we use the NFT owner's key to call the transfer function
  const privateKey = process.env.PRIVATE_KEY || process.env.CONTRACT_OWNER_KEY;
  
  if (!privateKey) {
    console.error('❌ ERROR: Need PRIVATE_KEY or CONTRACT_OWNER_KEY');
    console.error('   Since approval exists, we need either:');
    console.error('   1. NFT owner\'s key to call transferNFTs()');
    console.error('   2. Contract owner\'s key (if contract has owner transfer function)');
    console.error('   3. Stored signatures (if contract supports transferNFTsWithSignature)');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`✅ Using wallet: ${wallet.address}`);
  console.log('');

  try {
    // Verify approval
    const nftContract = new ethers.Contract(RANDOM_ART_NFT, ERC721_ABI, provider);
    const isApproved = await nftContract.isApprovedForAll(NFT_OWNER, TRANSFER_CONTRACT);
    
    if (!isApproved) {
      console.error('❌ Transfer contract is not approved!');
      process.exit(1);
    }
    console.log('✅ Approval verified');
    console.log('');

    // Try to call transferNFTs from the transfer contract
    // This requires msg.sender to be the NFT owner
    const TRANSFER_ABI = [
      "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external"
    ];
    
    const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
    
    // Check if wallet is the NFT owner
    if (wallet.address.toLowerCase() !== NFT_OWNER.toLowerCase()) {
      console.error('❌ Wallet is not the NFT owner!');
      console.error(`   Expected: ${NFT_OWNER}`);
      console.error(`   Got: ${wallet.address}`);
      console.error('');
      console.error('💡 The contract requires msg.sender to be the NFT owner.');
      console.error('   Since approval exists, the transfer will work once called by the owner.');
      process.exit(1);
    }

    console.log('✅ Wallet matches NFT owner - proceeding with transfer...');
    console.log('');

    const tx = await transferContract.transferNFTs(
      RANDOM_ART_NFT,
      TOKEN_IDS.map(id => BigInt(id))
    );

    console.log(`📤 Transaction: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    
    console.log('');
    console.log('✅ Transfer successful!');
    console.log(`   Hash: ${receipt.transactionHash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
    process.exit(1);
  }
}

transferUsingApproval()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
