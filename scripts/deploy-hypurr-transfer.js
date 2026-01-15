const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying HypurrNFTTransfer Contract...\n");

  // Configuration - UPDATE THESE VALUES
  const HYPURR_NFT_CONTRACT = process.env.HYPURR_NFT_CONTRACT || "0x0000000000000000000000000000000000000000";
  const DESTINATION_WALLET = process.env.DESTINATION_WALLET || "0x0000000000000000000000000000000000000000";
  const OWNER_ADDRESS = process.env.OWNER_ADDRESS || "0x0000000000000000000000000000000000000000";

  // Validate addresses
  if (HYPURR_NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ HYPURR_NFT_CONTRACT not set in environment variables");
  }
  if (DESTINATION_WALLET === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ DESTINATION_WALLET not set in environment variables");
  }
  if (OWNER_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ OWNER_ADDRESS not set in environment variables");
  }

  console.log("📋 Configuration:");
  console.log("  Hypurr NFT Contract:", HYPURR_NFT_CONTRACT);
  console.log("  Destination Wallet:", DESTINATION_WALLET);
  console.log("  Owner Address:", OWNER_ADDRESS);
  console.log("");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy contract
  const HypurrNFTTransfer = await ethers.getContractFactory("HypurrNFTTransfer");
  console.log("⏳ Deploying contract...");
  
  const contract = await HypurrNFTTransfer.deploy(
    HYPURR_NFT_CONTRACT,
    DESTINATION_WALLET,
    OWNER_ADDRESS
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const hypurrNFT = await contract.hypurrNFT();
  const destination = await contract.destinationWallet();
  const owner = await contract.owner();
  const paused = await contract.paused();

  console.log("  Hypurr NFT Contract:", hypurrNFT);
  console.log("  Destination Wallet:", destination);
  console.log("  Owner:", owner);
  console.log("  Paused:", paused);
  console.log("");

  console.log("📝 Next Steps:");
  console.log("1. Verify the contract on block explorer");
  console.log("2. Users need to approve this contract to transfer their NFTs:");
  console.log("   - Call setApprovalForAll(contractAddress, true) on Hypurr NFT contract");
  console.log("3. Users can then call checkAndTransfer(tokenIds) to transfer their NFTs");
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    contractAddress: contractAddress,
    hypurrNFTContract: HYPURR_NFT_CONTRACT,
    destinationWallet: DESTINATION_WALLET,
    owner: OWNER_ADDRESS,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
