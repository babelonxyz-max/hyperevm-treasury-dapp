import hre from "hardhat";
const { ethers, upgrades } = hre;

async function main() {
  console.log("🚀 Deploying Upgradeable HypurrNFTTransfer Contract...\n");

  // Configuration - UPDATE THESE VALUES
  const DESTINATION_WALLET = process.env.DESTINATION_WALLET || "0x0000000000000000000000000000000000000000";
  const OWNER_ADDRESS = process.env.OWNER_ADDRESS || "0x0000000000000000000000000000000000000000";
  const INITIAL_NFT_CONTRACTS = process.env.INITIAL_NFT_CONTRACTS 
    ? process.env.INITIAL_NFT_CONTRACTS.split(",").map(addr => addr.trim())
    : [];

  // Validate addresses
  if (DESTINATION_WALLET === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ DESTINATION_WALLET not set in environment variables");
  }
  if (OWNER_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ OWNER_ADDRESS not set in environment variables");
  }

  console.log("📋 Configuration:");
  console.log("  Destination Wallet:", DESTINATION_WALLET);
  console.log("  Owner Address:", OWNER_ADDRESS);
  console.log("  Initial NFT Contracts:", INITIAL_NFT_CONTRACTS.length > 0 ? INITIAL_NFT_CONTRACTS.join(", ") : "None");
  console.log("");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy upgradeable contract
  const HypurrNFTTransfer = await ethers.getContractFactory("HypurrNFTTransfer");
  console.log("⏳ Deploying upgradeable contract...");
  
  const contract = await upgrades.deployProxy(
    HypurrNFTTransfer,
    [DESTINATION_WALLET, OWNER_ADDRESS],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);

  console.log("✅ Contract deployed!");
  console.log("📍 Proxy Address:", contractAddress);
  console.log("📍 Implementation Address:", implementationAddress);
  console.log("");

  // Add initial NFT contracts if provided
  if (INITIAL_NFT_CONTRACTS.length > 0) {
    console.log("⏳ Adding initial NFT contracts...");
    for (const nftContract of INITIAL_NFT_CONTRACTS) {
      if (nftContract && nftContract !== "0x0000000000000000000000000000000000000000") {
        try {
          const tx = await contract.addNFTContract(nftContract);
          await tx.wait();
          console.log("  ✅ Added:", nftContract);
        } catch (error) {
          console.log("  ⚠️  Failed to add:", nftContract, error.message);
        }
      }
    }
    console.log("");
  }

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const destination = await contract.destinationWallet();
  const owner = await contract.owner();
  const paused = await contract.paused();
  const acceptAll = await contract.acceptAllNFTs();
  const contractCount = await contract.getEnabledNFTContractCount();

  console.log("  Destination Wallet:", destination);
  console.log("  Owner:", owner);
  console.log("  Paused:", paused);
  console.log("  Accept All NFTs:", acceptAll);
  console.log("  Enabled NFT Contracts:", contractCount.toString());
  console.log("");

  console.log("📝 Next Steps:");
  console.log("1. Verify the implementation contract on block explorer");
  console.log("2. Add NFT contracts using: addNFTContract(address)");
  console.log("3. Or enable all NFTs: setAcceptAllNFTs(true)");
  console.log("4. Users need to approve this contract to transfer their NFTs");
  console.log("5. To upgrade: deploy new implementation and call upgradeTo(newImplementation)");
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    proxyAddress: contractAddress,
    implementationAddress: implementationAddress,
    destinationWallet: DESTINATION_WALLET,
    owner: OWNER_ADDRESS,
    deployer: deployer.address,
    initialNFTContracts: INITIAL_NFT_CONTRACTS,
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
