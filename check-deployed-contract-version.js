import { ethers } from 'ethers';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Check if contract has transferNFTsWithSignature function
// Function signature: transferNFTsWithSignature(address,address,uint256[],uint256,bytes)
// keccak256("transferNFTsWithSignature(address,address,uint256[],uint256,bytes)") = 0x...

async function checkContractFunctions() {
  console.log('Checking deployed contract capabilities...\n');
  
  // Try to check if it has getNonce (indicates signature version)
  try {
    const nonceABI = ["function getNonce(address user) external view returns (uint256)"];
    const contract = new ethers.Contract(TRANSFER_CONTRACT, nonceABI, provider);
    const nonce = await contract.getNonce(NFT_OWNER);
    console.log('✅ Contract has getNonce function (signature version)');
    console.log(`   Current nonce for ${NFT_OWNER}: ${nonce.toString()}`);
  } catch (e) {
    console.log('❌ Contract does not have getNonce (not signature version)');
  }
  
  // The key insight: Since approval exists, the transfer contract CAN transfer
  // But we need a way to trigger it. The current functions require msg.sender == owner
  // Unless... maybe we can call the NFT contract directly using the transfer contract's approval?
  // No, that won't work because we can't sign as the transfer contract.
  
  // Actually, wait - if the contract owner has a special function, or if we use
  // a meta-transaction pattern... but the current contract doesn't support that.
  
  console.log('\n💡 Solution: We need to use the NFT owner\'s private key OR');
  console.log('   we need signatures if the contract supports transferNFTsWithSignature');
  console.log('   Since approval exists, the transfer will work once we can call the function.');
}

checkContractFunctions();
