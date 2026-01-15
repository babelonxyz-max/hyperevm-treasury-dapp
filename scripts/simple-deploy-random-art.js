import { ethers } from "ethers";

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
const QUANTITY = 5;
const TRANSFER_CONTRACT = process.env.TRANSFER_CONTRACT || "0x0000000000000000000000000000000000000000";

// Simple ERC721 contract ABI (minimal)
const SIMPLE_NFT_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function mint(address to) external",
  "function safeMint(address to) external",
  "function mintBatch(address to, uint256 quantity) external",
  "function owner() external view returns (address)"
];

async function main() {
  console.log("🎨 Deploying Random Art NFT Collection...\n");
  console.log("⚠️  Note: This requires Hardhat compilation first.");
  console.log("   For now, using Hypurr contract to mint test NFTs.\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log("👤 Using wallet:", wallet.address);
  console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "HYPE");
  console.log("");

  // Check if we can use Hypurr contract to mint
  const HYPURR_CONTRACT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
  const hypurrContract = new ethers.Contract(HYPURR_CONTRACT, SIMPLE_NFT_ABI, wallet);
  
  try {
    const owner = await hypurrContract.owner();
    console.log("📋 Hypurr Contract Owner:", owner);
    
    if (owner.toLowerCase() === wallet.address.toLowerCase()) {
      console.log("✅ You are the owner! Minting from Hypurr contract...\n");
      
      // Try to mint
      for (let i = 0; i < QUANTITY; i++) {
        try {
          console.log(`Minting NFT #${i + 1}...`);
          const tx = await hypurrContract.mint(TARGET_WALLET);
          console.log(`  Transaction: ${tx.hash}`);
          const receipt = await tx.wait();
          console.log(`  ✅ Minted! Block: ${receipt.blockNumber}\n`);
        } catch (error) {
          console.log(`  ⚠️  Error: ${error.message.substring(0, 100)}`);
          // Try next function
          try {
            const tx = await hypurrContract.safeMint(TARGET_WALLET);
            console.log(`  Transaction: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`  ✅ Minted! Block: ${receipt.blockNumber}\n`);
          } catch (e2) {
            console.log(`  ❌ All mint functions failed\n`);
            break;
          }
        }
      }
      
      // Verify
      const balance = await hypurrContract.balanceOf(TARGET_WALLET);
      console.log("📊 Final balance in target wallet:", balance.toString());
      console.log("");
      console.log("📝 Next: Add Hypurr contract to transfer contract if not already added");
      
    } else {
      console.log("❌ Not the owner of Hypurr contract");
      console.log("   Need to deploy new RandomArtNFT contract");
      console.log("   Run: npx hardhat compile && npx hardhat run scripts/deploy-random-art-nft.js --network hyperevm");
    }
  } catch (error) {
    console.log("⚠️  Error checking Hypurr contract:", error.message);
    console.log("   Need to deploy new contract");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
