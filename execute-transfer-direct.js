import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract addresses
const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RANDOM_ART_NFT_CONTRACT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER_WALLET = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const TOKEN_IDS = [1, 5, 4, 3, 2];

const TRANSFER_ABI = [
  "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function executeTransfer() {
  console.log('🚀 Executing NFT Transfer');
  console.log('='.repeat(80));
  
  // Try to get private key from environment
  const privateKey = process.env.PRIVATE_KEY || process.env.OWNER_PRIVATE_KEY || process.env.CONTRACT_OWNER_KEY;
  
  if (!privateKey) {
    console.error('❌ ERROR: No private key found in environment variables');
    console.error('   Set one of: PRIVATE_KEY, OWNER_PRIVATE_KEY, or CONTRACT_OWNER_KEY');
    console.error('   This must be the private key for the NFT owner wallet');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`✅ Using wallet: ${wallet.address}`);
  console.log(`📋 NFT Owner: ${NFT_OWNER_WALLET}`);
  
  if (wallet.address.toLowerCase() !== NFT_OWNER_WALLET.toLowerCase()) {
    console.error('❌ ERROR: Private key does not match NFT owner wallet!');
    console.error(`   Expected: ${NFT_OWNER_WALLET}`);
    console.error(`   Got: ${wallet.address}`);
    process.exit(1);
  }

  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
  
  try {
    // Pre-flight checks
    const isPaused = await transferContract.paused();
    if (isPaused) {
      console.error('❌ Contract is paused!');
      process.exit(1);
    }
    
    const destination = await transferContract.destinationWallet();
    console.log(`📬 Destination: ${destination}`);
    console.log(`🎫 Token IDs: [${TOKEN_IDS.join(', ')}]`);
    console.log('');
    
    console.log('⏳ Executing transfer...');
    const tx = await transferContract.transferNFTs(
      RANDOM_ART_NFT_CONTRACT,
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
    console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
    process.exit(1);
  }
}

executeTransfer()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
