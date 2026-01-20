import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT_CONTRACT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const DESTINATION_WALLET = "0x25b155C387bcf2434F0df5e2f34E9D68E0A99228";

// RPC URL
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";

// Wallet that owns the NFTs (has approved the transfer contract)
const NFT_OWNER_WALLET = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";

// Token IDs to transfer
const TOKEN_IDS = [1, 2, 3, 4, 5];

// ERC-721 ABI
const ERC721_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

// Transfer Contract ABI - we'll use it to get destination
const TRANSFER_ABI = [
  "function destinationWallet() external view returns (address)"
];

async function transferUsingApproval() {
  console.log('🚀 Transferring NFTs using existing approval');
  console.log('📋 Transfer Contract (approved operator):', TRANSFER_CONTRACT);
  console.log('🎫 NFT Contract:', RANDOM_ART_NFT_CONTRACT);
  console.log('👤 NFT Owner:', NFT_OWNER_WALLET);
  console.log('🎫 Token IDs:', TOKEN_IDS);
  console.log('');

  // Get private key - this should be the contract owner or someone authorized
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable not set!');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('✅ Using wallet:', wallet.address);
  console.log('');

  try {
    const nftContract = new ethers.Contract(RANDOM_ART_NFT_CONTRACT, ERC721_ABI, wallet);
    
    // Verify approval
    console.log('🔍 Verifying approval...');
    const isApproved = await nftContract.isApprovedForAll(NFT_OWNER_WALLET, TRANSFER_CONTRACT);
    
    if (!isApproved) {
      console.error('❌ ERROR: Transfer contract is not approved!');
      console.error('   The wallet must call setApprovalForAll first.');
      process.exit(1);
    }
    console.log('✅ Approval verified: Transfer contract is approved');
    console.log('');

    // Get destination from transfer contract
    const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, provider);
    const destination = await transferContract.destinationWallet();
    console.log('📬 Destination wallet:', destination);
    console.log('');

    // Since the transfer contract is approved, we can call safeTransferFrom
    // BUT - we need to call it FROM the transfer contract address
    // The approval allows the transfer contract to transfer, not us directly
    
    // Actually, I realize the issue: the approval is for the transfer contract,
    // so only the transfer contract can call safeTransferFrom. But the transfer
    // contract's functions require msg.sender to be the owner.
    
    // The solution: We need to call the transfer contract's function,
    // but we need the NFT owner's signature OR we need a function that allows
    // the contract owner to transfer on behalf.
    
    // Let me try calling safeTransferFrom directly from the NFT contract
    // using the transfer contract as the caller... but we can't do that.
    
    // Actually, wait - I can create a contract instance connected to the transfer
    // contract address, but I still can't sign with it.
    
    console.log('💡 Since the transfer contract is approved, we can transfer directly');
    console.log('   by calling safeTransferFrom on the NFT contract.');
    console.log('   However, the approval is for the transfer contract, so we need');
    console.log('   to call it through the transfer contract.');
    console.log('');
    console.log('📋 The transfer contract functions require msg.sender == owner,');
    console.log('   so we need the NFT owner to call it.');
    console.log('');
    console.log('✅ Since approval is already in place, the owner can call:');
    console.log(`   transferContract.transferNFTs("${RANDOM_ART_NFT_CONTRACT}", [${TOKEN_IDS.join(', ')}])`);
    console.log('   and it will work immediately.');
    console.log('');
    
    // Actually, let me try a different approach - what if we use the NFT contract
    // directly and call safeTransferFrom with from=owner, to=destination
    // But the approval is for the transfer contract, not for us...
    
    // I think the real solution is: we need to use the NFT owner's private key
    // to call the transfer contract's function. The approval allows it to work.
    
    console.log('🔧 Attempting direct transfer using approval...');
    
    // Try calling safeTransferFrom directly - this might work if the approval
    // allows any approved operator to call it
    // But ERC721 requires the caller to be the approved operator
    
    // Let me check: can we call safeTransferFrom from our wallet if we're not approved?
    // No, we can't. The approval is specifically for the transfer contract.
    
    // So the only way is:
    // 1. NFT owner calls transfer contract function (needs owner's key)
    // 2. OR we add a function to transfer contract that allows owner/admin to transfer
    
    console.log('❌ Cannot transfer without NFT owner\'s signature');
    console.log('   Current contract design requires msg.sender to be the NFT owner.');
    console.log('');
    console.log('💡 Solution: Use NFT owner\'s private key to call:');
    console.log(`   transferContract.transferNFTs("${RANDOM_ART_NFT_CONTRACT}", [${TOKEN_IDS.join(', ')}])`);
    console.log('   The approval is already in place, so it will work.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

transferUsingApproval()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
