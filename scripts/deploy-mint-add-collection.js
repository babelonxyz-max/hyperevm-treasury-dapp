import { ethers } from "ethers";

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
const QUANTITY = 5;
const TRANSFER_CONTRACT = process.env.TRANSFER_CONTRACT || "0x0000000000000000000000000000000000000000";

async function main() {
  console.log("🎨 Deploying Random Art NFT Collection and Minting...\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log("👤 Deploying from:", wallet.address);
  console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "HYPE");
  console.log("📬 Target Wallet:", TARGET_WALLET);
  console.log("📊 Quantity:", QUANTITY);
  console.log("");

  // Check if hardhat compiled the contract
  console.log("💡 To deploy RandomArtNFT contract:");
  console.log("   1. Ensure hardhat dependencies are installed");
  console.log("   2. Run: npx hardhat compile");
  console.log("   3. Run: npx hardhat run scripts/deploy-random-art-nft.js --network hyperevm");
  console.log("");
  console.log("📝 Alternative: Use existing Hypurr contract to mint test NFTs");
  console.log("   Then add both contracts to transfer contract whitelist");
  console.log("");
  
  if (TRANSFER_CONTRACT !== "0x0000000000000000000000000000000000000000") {
    console.log("📋 After deploying new collection, add it to transfer contract:");
    console.log(`   TRANSFER_CONTRACT=${TRANSFER_CONTRACT} NFT_CONTRACT=<new_contract> npx hardhat run scripts/add-nft-to-transfer.js --network hyperevm`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
