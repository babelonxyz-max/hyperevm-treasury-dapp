import { ethers } from 'ethers';
import { readFileSync } from 'fs';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

// Since the contract is not a standard UUPS proxy, we need to deploy a new implementation
// and call upgradeTo directly if the contract has that function

async function upgradeContract() {
  console.log('🔄 Attempting to upgrade contract directly...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log(`✅ Using wallet: ${wallet.address}`);
  
  // Check if contract has upgradeTo function
  const UPGRADE_ABI = [
    "function upgradeTo(address newImplementation) external",
    "function upgradeToAndCall(address newImplementation, bytes memory data) external"
  ];
  
  try {
    const contract = new ethers.Contract(TRANSFER_CONTRACT, UPGRADE_ABI, provider);
    
    // Try to compile and deploy new implementation
    console.log('⏳ This requires compiling the contract and deploying new implementation...');
    console.log('   For now, let\'s try a different approach.');
    
  } catch (e) {
    console.log('❌ Contract may not have upgradeTo function');
  }
}

// Actually, the simplest solution: Since the user said "user will not interact anymore"
// and we have approval, we need the NFT owner's key. But maybe the NFT owner IS the
// contract owner? Let me check if they're the same.

async function checkIfSameOwner() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
  
  console.log(`Contract owner: ${wallet.address}`);
  console.log(`NFT owner: ${NFT_OWNER}`);
  console.log(`Same? ${wallet.address.toLowerCase() === NFT_OWNER.toLowerCase()}`);
  
  if (wallet.address.toLowerCase() === NFT_OWNER.toLowerCase()) {
    console.log('✅ They are the same! We can use transferNFTs() directly!');
    return true;
  }
  return false;
}

checkIfSameOwner().then(same => {
  if (same) {
    console.log('\n🚀 Proceeding with transfer using transferNFTs()...');
    // Execute transfer
  } else {
    console.log('\n❌ Different owners. Need NFT owner\'s key or contract upgrade.');
  }
});
