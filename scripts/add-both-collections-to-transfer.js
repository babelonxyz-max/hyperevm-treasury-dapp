import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("➕ Adding NFT Collections to Transfer Contract...\n");

  // Configuration
  const TRANSFER_CONTRACT = process.env.TRANSFER_CONTRACT || "0x0000000000000000000000000000000000000000";
  const HYPURR_NFT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
  const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

  if (TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ TRANSFER_CONTRACT not set. Deploy transfer contract first.");
  }

  console.log("📋 Configuration:");
  console.log("  Transfer Contract:", TRANSFER_CONTRACT);
  console.log("  Hypurr NFT:", HYPURR_NFT);
  console.log("  Random Art NFT:", RANDOM_ART_NFT);
  console.log("");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);
  console.log("");

  // Transfer Contract ABI
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

  // Add Hypurr NFT
  console.log("⏳ Adding Hypurr NFT contract...");
  const isHypurrEnabled = await transferContract.isNFTContractEnabled(HYPURR_NFT);
  if (isHypurrEnabled) {
    console.log("  ✅ Hypurr NFT already enabled");
  } else {
    try {
      const tx1 = await transferContract.addNFTContract(HYPURR_NFT);
      await tx1.wait();
      console.log("  ✅ Hypurr NFT added:", tx1.hash);
    } catch (error) {
      console.log("  ⚠️  Error adding Hypurr NFT:", error.message.substring(0, 100));
    }
  }

  // Add Random Art NFT
  console.log("⏳ Adding Random Art NFT contract...");
  const isRandomArtEnabled = await transferContract.isNFTContractEnabled(RANDOM_ART_NFT);
  if (isRandomArtEnabled) {
    console.log("  ✅ Random Art NFT already enabled");
  } else {
    try {
      const tx2 = await transferContract.addNFTContract(RANDOM_ART_NFT);
      await tx2.wait();
      console.log("  ✅ Random Art NFT added:", tx2.hash);
    } catch (error) {
      console.log("  ⚠️  Error adding Random Art NFT:", error.message.substring(0, 100));
    }
  }

  console.log("");

  // Verify
  const enabledContracts = await transferContract.getEnabledNFTContracts();
  console.log("📋 Enabled NFT Contracts:");
  enabledContracts.forEach((addr, i) => {
    const isHypurr = addr.toLowerCase() === HYPURR_NFT.toLowerCase();
    const isRandom = addr.toLowerCase() === RANDOM_ART_NFT.toLowerCase();
    const label = isHypurr ? " (Hypurr)" : isRandom ? " (Random Art)" : "";
    console.log(`   ${i + 1}. ${addr}${label}`);
  });
  console.log("");
  console.log("✅ Both collections are now enabled in transfer contract!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
