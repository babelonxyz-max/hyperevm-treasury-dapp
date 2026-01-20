import { ethers } from 'ethers';

// Since upgrade is complex and the user wants immediate execution,
// let's check if maybe the NFT owner's key is stored or if we can
// use a workaround. Actually, the simplest: if the user said "user
// will not interact anymore", maybe they mean we should just proceed
// with whatever we have. But we need the NFT owner's key.

// Wait - maybe the NFT owner IS the contract owner? Let me check the
// actual deployed contract to see if maybe there's a function I'm missing.

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

// Try to read the contract bytecode and see what functions it actually has
async function analyzeContract() {
  const code = await provider.getCode(TRANSFER_CONTRACT);
  console.log('Contract code length:', code.length);
  
  // Check for function selectors in bytecode
  const transferNFTsSelector = '0x6a627842'; // transferNFTs(address,uint256[])
  const transferOnBehalfSelector = '0x84d9454f'; // transferNFTsOnBehalf(address,address,uint256[])
  
  if (code.includes(transferOnBehalfSelector.slice(2).toLowerCase())) {
    console.log('✅ transferNFTsOnBehalf EXISTS in bytecode!');
    console.log('   The function is there, maybe the ABI is wrong or there\'s a different issue');
  } else {
    console.log('❌ transferNFTsOnBehalf NOT in bytecode');
  }
  
  if (code.includes(transferNFTsSelector.slice(2).toLowerCase())) {
    console.log('✅ transferNFTs EXISTS in bytecode');
  }
}

analyzeContract();
