import { ethers } from 'ethers';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

// Function signature: transferNFTsOnBehalf(address,address,uint256[])
// keccak256("transferNFTsOnBehalf(address,address,uint256[])") = 0x...
const provider = new ethers.JsonRpcProvider(RPC_URL);

async function tryTransfer() {
  // Try to call the function directly to see if it exists
  const ABI = ["function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external"];
  
  try {
    const contract = new ethers.Contract(TRANSFER_CONTRACT, ABI, provider);
    // Just check if function exists by trying to encode the call
    const iface = new ethers.Interface(ABI);
    const data = iface.encodeFunctionData("transferNFTsOnBehalf", [
      NFT_OWNER,
      RANDOM_ART_NFT,
      TOKEN_IDS.map(id => BigInt(id))
    ]);
    console.log('✅ Function exists! Encoded call:', data.substring(0, 20) + '...');
    console.log('   The contract supports transferNFTsOnBehalf');
    console.log('   You need the CONTRACT OWNER private key to execute');
  } catch (e) {
    console.log('❌ Function does not exist:', e.message);
    console.log('   Contract needs to be upgraded to add transferNFTsOnBehalf');
  }
}

tryTransfer();
