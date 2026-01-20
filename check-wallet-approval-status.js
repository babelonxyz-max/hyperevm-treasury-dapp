import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const HYPURR_NFT_CONTRACT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
const RANDOM_ART_NFT_CONTRACT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

// RPC URL - try multiple options
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";

// Wallet to check
const WALLET_TO_CHECK = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";

// ERC-721 ABI
const ERC721_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external"
];

// Transfer Contract ABI
const TRANSFER_ABI = [
  "function checkNFTs(address nftContract, address wallet) external view returns (uint256)",
  "function checkAllNFTs(address wallet) external view returns (uint256)",
  "function isNFTContractEnabled(address nftContract) external view returns (bool)",
  "function getEnabledNFTContracts() external view returns (address[])",
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function checkWalletApprovalStatus() {
  console.log('🔍 Checking Approval Status for Wallet:', WALLET_TO_CHECK);
  console.log('📋 Transfer Contract:', TRANSFER_CONTRACT);
  console.log('🌐 RPC URL:', RPC_URL);
  console.log('');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, provider);

  try {
    // Check if contract is paused
    const isPaused = await transferContract.paused();
    console.log('⏸️  Contract Paused:', isPaused);
    if (isPaused) {
      console.log('⚠️  WARNING: Transfer contract is paused! Transfers cannot be executed.');
      console.log('');
    }

    // Get destination wallet
    const destinationWallet = await transferContract.destinationWallet();
    console.log('📬 Destination Wallet:', destinationWallet);
    console.log('');

    // Get enabled NFT contracts
    console.log('📋 Getting enabled NFT contracts...');
    const enabledContracts = await transferContract.getEnabledNFTContracts();
    console.log('✅ Enabled NFT Contracts:', enabledContracts.length);
    enabledContracts.forEach((addr, i) => {
      console.log(`   ${i + 1}. ${addr}`);
    });
    console.log('');

    // Check each enabled contract
    const results = [];
    
    for (const nftContractAddress of enabledContracts) {
      const checksumAddress = ethers.getAddress(nftContractAddress);
      console.log(`\n🔍 Checking NFT Contract: ${checksumAddress}`);
      
      const nftContract = new ethers.Contract(checksumAddress, ERC721_ABI, provider);
      
      // Check if contract is enabled
      const isEnabled = await transferContract.isNFTContractEnabled(checksumAddress);
      console.log(`   ✅ Enabled: ${isEnabled}`);
      
      // Check NFT balance
      const balance = await nftContract.balanceOf(WALLET_TO_CHECK);
      const balanceNum = Number(balance);
      console.log(`   📊 NFT Balance: ${balanceNum}`);
      
      // Get token IDs if balance > 0
      let tokenIds = [];
      if (balanceNum > 0) {
        console.log(`   🔢 Fetching token IDs...`);
        for (let i = 0; i < balanceNum; i++) {
          try {
            const tokenId = await nftContract.tokenOfOwnerByIndex(WALLET_TO_CHECK, i);
            tokenIds.push(tokenId.toString());
          } catch (error) {
            console.log(`   ⚠️  Error fetching token ID at index ${i}:`, error.message);
          }
        }
        console.log(`   🎫 Token IDs: [${tokenIds.join(', ')}]`);
      }
      
      // Check approval status
      const isApproved = await nftContract.isApprovedForAll(WALLET_TO_CHECK, TRANSFER_CONTRACT);
      console.log(`   ✅ Approval Status: ${isApproved ? 'APPROVED ✅' : 'NOT APPROVED ❌'}`);
      
      // Check via transfer contract
      let transferContractCount = 0;
      try {
        transferContractCount = await transferContract.checkNFTs(checksumAddress, WALLET_TO_CHECK);
        console.log(`   📋 Transfer Contract Count: ${Number(transferContractCount)}`);
      } catch (error) {
        console.log(`   ⚠️  Error checking via transfer contract:`, error.message);
      }
      
      results.push({
        contract: checksumAddress,
        enabled: isEnabled,
        balance: balanceNum,
        tokenIds: tokenIds,
        approved: isApproved,
        transferContractCount: Number(transferContractCount),
        canTransfer: isApproved && balanceNum > 0 && !isPaused
      });
      
      console.log('');
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    
    const totalNFTs = results.reduce((sum, r) => sum + r.balance, 0);
    const totalApproved = results.filter(r => r.approved).length;
    const totalCanTransfer = results.filter(r => r.canTransfer).length;
    
    console.log(`\n💰 Total NFTs Owned: ${totalNFTs}`);
    console.log(`✅ Contracts Approved: ${totalApproved} / ${results.length}`);
    console.log(`🚀 Ready to Transfer: ${totalCanTransfer} / ${results.length}`);
    console.log(`⏸️  Contract Paused: ${isPaused ? 'YES (transfers blocked)' : 'NO (transfers allowed)'}`);
    
    console.log('\n📋 Detailed Status:');
    results.forEach((result, i) => {
      console.log(`\n${i + 1}. Contract: ${result.contract}`);
      console.log(`   - NFTs Owned: ${result.balance}`);
      console.log(`   - Approved: ${result.approved ? '✅ YES' : '❌ NO'}`);
      console.log(`   - Can Transfer: ${result.canTransfer ? '✅ YES' : '❌ NO'}`);
      if (result.tokenIds.length > 0) {
        console.log(`   - Token IDs: [${result.tokenIds.slice(0, 10).join(', ')}${result.tokenIds.length > 10 ? '...' : ''}]`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TRANSFER READINESS');
    console.log('='.repeat(80));
    
    if (isPaused) {
      console.log('\n❌ CANNOT TRANSFER: Contract is paused');
    } else if (totalNFTs === 0) {
      console.log('\n❌ CANNOT TRANSFER: Wallet has no NFTs');
    } else if (totalCanTransfer === 0) {
      console.log('\n❌ CANNOT TRANSFER: No contracts are approved');
      console.log('   → User needs to call setApprovalForAll() for each NFT contract');
    } else {
      console.log('\n✅ CAN TRANSFER: Ready to transfer NFTs!');
      console.log(`   → ${totalNFTs} NFT(s) can be transferred`);
      console.log(`   → Destination: ${destinationWallet}`);
      console.log(`   → You can call transferNFTs() or checkAndTransfer() on the transfer contract`);
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

checkWalletApprovalStatus()
  .then(() => {
    console.log('✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
