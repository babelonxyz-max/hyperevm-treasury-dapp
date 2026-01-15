import { ethers } from "ethers";

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

const ERC721_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)"
];

async function main() {
  console.log("🔍 Checking Random Art NFT Balance...\n");
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const nftContract = new ethers.Contract(RANDOM_ART_NFT, ERC721_ABI, provider);
  
  try {
    // Check contract info
    const name = await nftContract.name();
    const symbol = await nftContract.symbol();
    console.log("📋 Contract Info:");
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Address:", RANDOM_ART_NFT);
    console.log("");
    
    // Check wallet balance
    const balance = await nftContract.balanceOf(WALLET);
    console.log("💰 Wallet Balance:");
    console.log("   Wallet:", WALLET);
    console.log("   Balance:", balance.toString(), "NFTs");
    console.log("");
    
    // Get token IDs if balance > 0
    if (balance > 0) {
      console.log("🆔 Token IDs:");
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await nftContract.tokenOfOwnerByIndex(WALLET, i);
          console.log(`   Token #${i + 1}: ${tokenId.toString()}`);
        } catch (err) {
          console.log(`   Token #${i + 1}: Unable to fetch (may not support Enumerable)`);
        }
      }
    }
    
    // Check total supply
    try {
      const totalSupply = await nftContract.totalSupply();
      console.log("\n📊 Total Supply:", totalSupply.toString());
    } catch (err) {
      console.log("\n⚠️  Total supply not available");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("   Data:", error.data);
    }
  }
}

main();
