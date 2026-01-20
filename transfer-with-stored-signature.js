import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x221f11eCE3bC09fd5Ba55BBd9A2353d32196faDc";

// RPC URL
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";

// Wallet that owns the NFTs (has approved and signed)
const NFT_OWNER_WALLET = process.env.NFT_OWNER_WALLET || "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";

// Evaluator Contract ABI
const TRANSFER_ABI = [
  "function processOnBehalf(address wallet, address assetContract, uint256[] calldata tokenIds) external",
  "function treasuryWallet() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function transferWithStoredSignature() {
  console.log('🚀 Transferring NFTs using stored EIP-712 signature');
  console.log('📋 Transfer Contract:', TRANSFER_CONTRACT);
  console.log('👤 NFT Owner:', NFT_OWNER_WALLET);
  console.log('');

  // Get contract owner's private key (or any authorized signer)
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable not set!');
    console.error('   This should be the contract owner or authorized signer');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('✅ Using wallet:', wallet.address);
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

    // Get stored signatures from backend API
    let transferSignatures = {};
    
    const API_URL = process.env.API_URL || process.env.REACT_APP_API_URL || 'https://babelon.xyz';
    
    try {
      console.log(`📡 Fetching signatures from backend API for wallet ${NFT_OWNER_WALLET}...`);
      const response = await fetch(`${API_URL}/api/get-signatures?wallet=${NFT_OWNER_WALLET}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error('❌ No signatures found in backend!');
          console.error('   User needs to sign terms first to generate signatures');
          process.exit(1);
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.signatures) {
        transferSignatures = result.signatures;
        console.log(`✅ Retrieved ${result.count} signature(s) from backend`);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (apiError) {
      console.error('❌ Error fetching signatures from backend:', apiError.message);
      console.error('   Falling back to environment variable...');
      
      // Fallback to environment variable
      const signaturesJson = process.env.TRANSFER_SIGNATURES;
      if (signaturesJson) {
        transferSignatures = JSON.parse(signaturesJson);
        console.log('✅ Using signatures from TRANSFER_SIGNATURES environment variable');
      } else {
        console.error('❌ No stored signatures found!');
        console.error('   Options:');
        console.error('   1. Set API_URL environment variable to your backend URL');
        console.error('   2. Set TRANSFER_SIGNATURES environment variable with JSON of signatures');
        process.exit(1);
      }
    }

    if (Object.keys(transferSignatures).length === 0) {
      console.error('❌ No transfer signatures found for this wallet!');
      console.error('   User needs to sign terms first to generate signatures');
      process.exit(1);
    }

    console.log(`📋 Found ${Object.keys(transferSignatures).length} contract signature(s)`);
    console.log('');

    // Transfer NFTs for each contract
    let totalTransferred = 0;
    for (const [nftContract, sigData] of Object.entries(transferSignatures)) {
      try {
        const { signature, deadline, nonce, tokenIds } = sigData;
        
        console.log(`\n🔍 Processing contract: ${nftContract}`);
        console.log(`   Token IDs: [${tokenIds.join(', ')}]`);
        console.log(`   Deadline: ${new Date(deadline * 1000).toISOString()}`);
        
        // Check if signature expired
        const now = Math.floor(Date.now() / 1000);
        if (now > deadline) {
          console.error(`   ❌ Signature expired! (deadline: ${deadline}, now: ${now})`);
          continue;
        }
        
        // Check current nonce
        try {
          const currentNonce = await transferContract.getNonce(NFT_OWNER_WALLET);
          if (Number(currentNonce) !== nonce) {
            console.warn(`   ⚠️  Nonce mismatch! Expected ${nonce}, got ${Number(currentNonce)}`);
            console.warn(`   Signature may have been used already or nonce changed`);
            // Continue anyway - the contract will reject if invalid
          }
        } catch (e) {
          console.log(`   ⚠️  Could not check nonce (contract may not have getNonce function)`);
        }
        
        console.log(`   📤 Executing transfer with signature...`);
        
        // Execute transfer
        const tx = await transferContract.transferNFTsWithSignature(
          NFT_OWNER_WALLET,
          nftContract,
          tokenIds.map(t => BigInt(t)), // Convert to BigInt
          deadline,
          signature,
          { gasLimit: 500000 }
        );

        console.log(`   ⏳ Transaction sent: ${tx.hash}`);
        console.log(`   Waiting for confirmation...`);
        
        const receipt = await tx.wait();
        
        console.log(`   ✅ Transfer successful!`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        
        totalTransferred += tokenIds.length;
        
      } catch (error) {
        console.error(`   ❌ Error transferring from ${nftContract}:`, error.message);
        if (error.reason) {
          console.error(`   Reason: ${error.reason}`);
        }
        // Continue with other contracts
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Total NFTs transferred: ${totalTransferred}`);
    console.log(`📬 Destination: ${destination}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Transfer failed:', error);
    throw error;
  }
}

transferWithStoredSignature()
  .then(() => {
    console.log('✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
