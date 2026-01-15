import { ethers } from "hardhat";

async function main() {
  console.log("➕ Adding NFT Contract to Transfer Contract...\n");

  // Configuration
  const TRANSFER_CONTRACT = process.env.TRANSFER_CONTRACT || "0x0000000000000000000000000000000000000000";
  const NFT_CONTRACT = process.env.NFT_CONTRACT || "0x0000000000000000000000000000000000000000";

  if (TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ TRANSFER_CONTRACT not set in environment variables");
  }
  if (NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ NFT_CONTRACT not set in environment variables");
  }

  console.log("📋 Configuration:");
  console.log("  Transfer Contract:", TRANSFER_CONTRACT);
  console.log("  NFT Contract to Add:", NFT_CONTRACT);
  console.log("");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);
  console.log("");

  // Connect to transfer contract
  const TransferABI = [
    "function addNFTContract(address nftContract) external",
    "function isNFTContractEnabled(address nftContract) external view returns (bool)",
    "function getEnabledNFTContracts() external view returns (address[] memory)",
    "function owner() external view returns (address)"
  ];

  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TransferABI, deployer);

  // Check if caller is owner
  const owner = await transferContract.owner();
  if (deployer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`❌ Not the contract owner. Owner is: ${owner}`);
  }

  // Check if already enabled
  const isEnabled = await transferContract.isNFTContractEnabled(NFT_CONTRACT);
  if (isEnabled) {
    console.log("✅ NFT contract is already enabled!");
    return;
  }

  // Get current enabled contracts
  const enabledContracts = await transferContract.getEnabledNFTContracts();
  console.log("📋 Current enabled contracts:", enabledContracts.length);
  enabledContracts.forEach((addr, i) => {
    console.log(`   ${i + 1}. ${addr}`);
  });
  console.log("");

  // Add NFT contract
  console.log("⏳ Adding NFT contract...");
  const tx = await transferContract.addNFTContract(NFT_CONTRACT);
  console.log("📤 Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ NFT contract added successfully!");
  console.log("   Block:", receipt.blockNumber);
  console.log("   Gas Used:", receipt.gasUsed.toString());
  console.log("");

  // Verify
  const isEnabledNow = await transferContract.isNFTContractEnabled(NFT_CONTRACT);
  const enabledContractsAfter = await transferContract.getEnabledNFTContracts();
  
  console.log("🔍 Verification:");
  console.log("   NFT contract enabled:", isEnabledNow ? "✅ Yes" : "❌ No");
  console.log("   Total enabled contracts:", enabledContractsAfter.length);
  console.log("");
  
  console.log("📋 Updated enabled contracts:");
  enabledContractsAfter.forEach((addr, i) => {
    console.log(`   ${i + 1}. ${addr}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
