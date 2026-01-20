import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT_CONTRACT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

// RPC URL
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";

// Wallet that owns the NFTs (has approved)
const NFT_OWNER_WALLET = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";

// Token IDs to transfer
const TOKEN_IDS = [1, 2, 3, 4, 5];

// ERC-721 ABI - we'll call safeTransferFrom directly since we're approved
const ERC721_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

async function transferAsApprovedOperator() {
  console.log('🚀 Transferring NFTs using approval');
  console.log('📋 Transfer Contract (approved operator):', TRANSFER_CONTRACT);
  console.log('🎫 NFT Contract:', RANDOM_ART_NFT_CONTRACT);
  console.log('👤 NFT Owner:', NFT_OWNER_WALLET);
  console.log('🎫 Token IDs:', TOKEN_IDS);
  console.log('');

  // Get contract owner private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable not set!');
    console.error('   This should be the contract owner or a wallet that can call the transfer contract');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('✅ Using wallet:', wallet.address);
  console.log('');

  // Since the transfer contract is approved, we can call safeTransferFrom directly
  // from the NFT contract, but we need to do it as the transfer contract
  // Actually, wait - we can't do that. The approval is for the transfer contract,
  // so only the transfer contract can call safeTransferFrom.
  
  // But the transfer contract functions require msg.sender to be the owner.
  // So we need to either:
  // 1. Have the owner call it (needs owner's private key)
  // 2. Add a function to the contract that allows owner/admin to transfer on behalf
  
  // Let me try a different approach - call the NFT contract's safeTransferFrom
  // from the transfer contract's perspective... but we can't do that either.
  
  // Actually, I think the issue is that the contract design requires the owner
  // to call the transfer functions. Even with approval, the contract enforces
  // that msg.sender == owner.
  
  // Let me check if we can use the transfer contract's address as the caller
  // by using a contract instance connected to the transfer contract address...
  // but that won't work because we can't sign with the contract's address.
  
  console.log('⚠️  Current contract design requires the NFT owner to call transfer functions');
  console.log('   even though approval is in place.');
  console.log('');
  console.log('💡 Solution: We need to either:');
  console.log('   1. Use the NFT owner\'s private key to call transferNFTs()');
  console.log('   2. Add a new contract function that allows owner/admin to transfer');
  console.log('      on behalf of approved users');
  console.log('');
  console.log('📋 Since approval is already in place, the transfer will work once');
  console.log('   the owner calls the function. The approval allows the transfer,');
  console.log('   but the contract still requires the owner to initiate it.');
  console.log('');
  
  // Let's try to call it anyway - maybe the contract allows it?
  try {
    const nftContract = new ethers.Contract(RANDOM_ART_NFT_CONTRACT, ERC721_ABI, provider);
    
    // Check approval
    const isApproved = await nftContract.isApprovedForAll(NFT_OWNER_WALLET, TRANSFER_CONTRACT);
    console.log('✅ Approval status:', isApproved ? 'APPROVED' : 'NOT APPROVED');
    
    if (!isApproved) {
      console.error('❌ Contract is not approved!');
      process.exit(1);
    }
    
    // Try calling from transfer contract - but we need the transfer contract to sign
    // This won't work because we can't sign as the contract
    
    console.log('');
    console.log('❌ Cannot transfer without NFT owner\'s signature');
    console.log('   The contract requires msg.sender to be the NFT owner.');
    console.log('');
    console.log('✅ However, since approval is in place, the owner can call:');
    console.log(`   transferContract.transferNFTs("${RANDOM_ART_NFT_CONTRACT}", [${TOKEN_IDS.join(', ')}])`);
    console.log('   and it will succeed immediately.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

transferAsApprovedOperator()
  .then(() => {
    console.log('');
    console.log('💡 To actually transfer, you need the NFT owner to call the function.');
    console.log('   The approval is already in place, so the transfer will work.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
