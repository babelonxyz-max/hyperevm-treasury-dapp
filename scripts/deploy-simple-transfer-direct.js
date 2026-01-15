import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const DESTINATION_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
const HYPURR_NFT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

async function main() {
  console.log("🚀 Deploying HypurrNFTTransferSimple Contract...\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("👤 Deploying from:", wallet.address);
  console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "HYPE");
  console.log("📬 Destination Wallet:", DESTINATION_WALLET);
  console.log("");

  // Read contract source
  const contractPath = path.join(process.cwd(), "contracts", "HypurrNFTTransferSimple.sol");
  const contractSource = fs.readFileSync(contractPath, "utf8");
  
  console.log("💡 Note: Direct deployment requires compilation.");
  console.log("   For Remix deployment, follow REMIX_DEPLOYMENT_STEPS.md");
  console.log("");
  console.log("📝 To deploy via Remix:");
  console.log("   1. Open https://remix.ethereum.org");
  console.log("   2. Create file: contracts/HypurrNFTTransferSimple.sol");
  console.log("   3. Copy contract code");
  console.log("   4. Load OpenZeppelin from GitHub");
  console.log("   5. Compile with 0.8.20");
  console.log("   6. Deploy with constructor: 0xbd24E200A8A7bE83c810039a073E18abD8362B6e");
  console.log("   7. Add collections after deployment");
  console.log("");
  console.log("📋 Collections to add:");
  console.log("   - Hypurr: 0x9125e2d6827a00b0f8330d6ef7bef07730bac685");
  console.log("   - Random Art: 0x298AbE38965DC68d239192d4366ab8c5b65a3B6f");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
