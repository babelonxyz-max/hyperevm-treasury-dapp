import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🔄 Upgrading HypurrNFTTransfer Contract...\n");

  const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
  
  console.log("📋 Proxy Address:", TRANSFER_CONTRACT);
  console.log("");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Upgrading with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "HYPE\n");

  // Get the contract factory
  const HypurrNFTTransfer = await ethers.getContractFactory("HypurrNFTTransfer");
  
  console.log("⏳ Upgrading contract...");
  
  // Upgrade the proxy
  const upgraded = await upgrades.upgradeProxy(TRANSFER_CONTRACT, HypurrNFTTransfer);
  
  console.log("✅ Contract upgraded!");
  console.log("📍 Proxy Address (unchanged):", TRANSFER_CONTRACT);
  console.log("📍 New Implementation Address:", await upgrades.erc1967.getImplementationAddress(TRANSFER_CONTRACT));
  console.log("");

  // Verify the new function exists
  console.log("🔍 Verifying new function...");
  try {
    const contract = await ethers.getContractAt("HypurrNFTTransfer", TRANSFER_CONTRACT);
    // Try to get the function signature
    const iface = contract.interface;
    if (iface.hasFunction("transferNFTsOnBehalf")) {
      console.log("✅ transferNFTsOnBehalf function is now available!");
    } else {
      console.log("⚠️  transferNFTsOnBehalf function not found in interface");
    }
  } catch (error) {
    console.log("⚠️  Could not verify function:", error.message);
  }

  console.log("\n📝 Next Steps:");
  console.log("1. Contract owner can now use transferNFTsOnBehalf()");
  console.log("2. Test the function with a transfer");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });
