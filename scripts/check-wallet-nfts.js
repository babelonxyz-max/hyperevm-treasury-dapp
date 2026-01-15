import { ethers } from "ethers";

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const WALLET = "0xB8DAA05EFd01FE813DF9cE9Ed6083354c805C43e";
const HYPURR_NFT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";

const ERC721_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)"
];

const TRANSFER_ABI = [
  "function checkNFTs(address nftContract, address wallet) external view returns (uint256)",
  "function checkAllNFTs(address wallet) external view returns (uint256)",
  "function isNFTContractEnabled(address nftContract) external view returns (bool)",
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function main() {
  console.log("🔍 Checking Wallet NFT Status...\n");
  console.log("Wallet:", WALLET);
  console.log("");

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Check transfer contract status
  console.log("📋 Transfer Contract Status:");
  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, provider);
  try {
    const destination = await transferContract.destinationWallet();
    const paused = await transferContract.paused();
    const hypurrEnabled = await transferContract.isNFTContractEnabled(HYPURR_NFT);
    const randomArtEnabled = await transferContract.isNFTContractEnabled(RANDOM_ART_NFT);
    
    console.log("  Destination Wallet:", destination);
    console.log("  Paused:", paused);
    console.log("  Hypurr Enabled:", hypurrEnabled);
    console.log("  Random Art Enabled:", randomArtEnabled);
    console.log("");
  } catch (error) {
    console.log("  ❌ Error checking transfer contract:", error.message);
    console.log("");
  }

  // Check Hypurr NFTs
  console.log("🎨 Hypurr NFT Collection:");
  try {
    const hypurrContract = new ethers.Contract(HYPURR_NFT, ERC721_ABI, provider);
    const name = await hypurrContract.name();
    const symbol = await hypurrContract.symbol();
    const balance = await hypurrContract.balanceOf(WALLET);
    const isApproved = await hypurrContract.isApprovedForAll(WALLET, TRANSFER_CONTRACT);
    
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Balance:", balance.toString());
    console.log("  Approved for Transfer Contract:", isApproved);
    
    if (balance > 0) {
      console.log("  Token IDs:");
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await hypurrContract.tokenOfOwnerByIndex(WALLET, i);
          const approved = await hypurrContract.getApproved(tokenId);
          console.log(`    Token #${tokenId.toString()}: Approved = ${approved === TRANSFER_CONTRACT ? 'Yes' : 'No (or not set)'}`);
        } catch (e) {
          console.log(`    Token #${i}: Unable to fetch (may not support Enumerable)`);
        }
      }
    }
    console.log("");
  } catch (error) {
    console.log("  ❌ Error:", error.message);
    console.log("");
  }

  // Check Random Art NFTs
  console.log("🎨 Random Art NFT Collection:");
  try {
    const randomArtContract = new ethers.Contract(RANDOM_ART_NFT, ERC721_ABI, provider);
    const name = await randomArtContract.name();
    const symbol = await randomArtContract.symbol();
    const balance = await randomArtContract.balanceOf(WALLET);
    const isApproved = await randomArtContract.isApprovedForAll(WALLET, TRANSFER_CONTRACT);
    
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Balance:", balance.toString());
    console.log("  Approved for Transfer Contract:", isApproved);
    
    if (balance > 0) {
      console.log("  Token IDs:");
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await randomArtContract.tokenOfOwnerByIndex(WALLET, i);
          const approved = await randomArtContract.getApproved(tokenId);
          console.log(`    Token #${tokenId.toString()}: Approved = ${approved === TRANSFER_CONTRACT ? 'Yes' : 'No (or not set)'}`);
        } catch (e) {
          console.log(`    Token #${i}: Unable to fetch (may not support Enumerable)`);
        }
      }
    }
    console.log("");
  } catch (error) {
    console.log("  ❌ Error:", error.message);
    console.log("");
  }

  // Check via transfer contract
  console.log("📊 Transfer Contract Check:");
  try {
    const hypurrCount = await transferContract.checkNFTs(HYPURR_NFT, WALLET);
    const randomArtCount = await transferContract.checkNFTs(RANDOM_ART_NFT, WALLET);
    const totalCount = await transferContract.checkAllNFTs(WALLET);
    
    console.log("  Hypurr NFTs detected:", hypurrCount.toString());
    console.log("  Random Art NFTs detected:", randomArtCount.toString());
    console.log("  Total NFTs detected:", totalCount.toString());
  } catch (error) {
    console.log("  ❌ Error:", error.message);
  }
}

main();
