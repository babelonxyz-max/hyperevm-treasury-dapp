import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🔄 Upgrading HypurrNFTTransfer Contract...\n");

  // Configuration
  const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "0x0000000000000000000000000000000000000000";

  if (PROXY_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ PROXY_ADDRESS not set in environment variables");
  }

  console.log("📋 Configuration:");
  console.log("  Proxy Address:", PROXY_ADDRESS);
  console.log("");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Upgrading with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Get current implementation
  const currentImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("📍 Current Implementation:", currentImplementation);
  console.log("");

  // Deploy new implementation
  console.log("⏳ Deploying new implementation...");
  const HypurrNFTTransferV2 = await ethers.getContractFactory("HypurrNFTTransferV2");
  
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, HypurrNFTTransferV2);
  await upgraded.waitForDeployment();
  
  const newImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  const proxyAddress = await upgraded.getAddress();

  console.log("✅ Contract upgraded!");
  console.log("📍 Proxy Address:", proxyAddress);
  console.log("📍 New Implementation:", newImplementation);
  console.log("");

  // Initialize V2 if needed
  try {
    console.log("⏳ Initializing V2...");
    const tx = await upgraded.initializeV2();
    await tx.wait();
    console.log("✅ V2 initialized!");
  } catch (error) {
    console.log("⚠️  V2 initialization skipped (may already be initialized):", error.message);
  }

  console.log("");
  console.log("📝 Upgrade complete!");
  console.log("   All existing data is preserved");
  console.log("   New functions are now available");
  console.log("");

  // Verify upgrade
  const destination = await upgraded.destinationWallet();
  const owner = await upgraded.owner();
  const contractCount = await upgraded.getEnabledNFTContractCount();

  console.log("🔍 Verification:");
  console.log("  Destination Wallet:", destination);
  console.log("  Owner:", owner);
  console.log("  Enabled NFT Contracts:", contractCount.toString());
  console.log("  New Feature Value:", (await upgraded.newFeatureValue()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });
