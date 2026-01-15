import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying HypurrNFTTransferSimple Contract...\n");

  const DESTINATION_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
  const HYPURR_NFT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
  const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "HYPE\n");

  // Deploy contract
  const HypurrNFTTransferSimple = await ethers.getContractFactory("HypurrNFTTransferSimple");
  console.log("⏳ Deploying contract...");
  
  const contract = await HypurrNFTTransferSimple.deploy(DESTINATION_WALLET);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("");

  // Add NFT contracts
  console.log("⏳ Adding NFT collections...");
  
  // Add Hypurr
  try {
    const tx1 = await contract.addNFTContract(HYPURR_NFT);
    await tx1.wait();
    console.log("✅ Added Hypurr NFT:", HYPURR_NFT);
  } catch (error) {
    console.log("⚠️  Error adding Hypurr:", error.message.substring(0, 100));
  }

  // Add Random Art
  try {
    const tx2 = await contract.addNFTContract(RANDOM_ART_NFT);
    await tx2.wait();
    console.log("✅ Added Random Art NFT:", RANDOM_ART_NFT);
  } catch (error) {
    console.log("⚠️  Error adding Random Art:", error.message.substring(0, 100));
  }

  console.log("");

  // Verify
  const enabledContracts = await contract.getEnabledNFTContracts();
  console.log("📋 Enabled NFT Contracts:");
  enabledContracts.forEach((addr, i) => {
    const label = addr.toLowerCase() === HYPURR_NFT.toLowerCase() ? " (Hypurr)" : 
                  addr.toLowerCase() === RANDOM_ART_NFT.toLowerCase() ? " (Random Art)" : "";
    console.log(`   ${i + 1}. ${addr}${label}`);
  });
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    contractAddress: contractAddress,
    destinationWallet: DESTINATION_WALLET,
    deployer: deployer.address,
    enabledCollections: enabledContracts,
    deployedAt: new Date().toISOString()
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");
  console.log("📝 Next Step: Set in frontend environment:");
  console.log(`   REACT_APP_TRANSFER_CONTRACT=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
