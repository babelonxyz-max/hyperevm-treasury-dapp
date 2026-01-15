import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🎨 Deploying Random Art NFT Collection...\n");

  // Configuration
  const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
  const QUANTITY = 5;
  const MAX_SUPPLY = 1000;
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "HYPE\n");

  // Deploy contract
  const RandomArtNFT = await ethers.getContractFactory("RandomArtNFT");
  console.log("⏳ Deploying RandomArtNFT contract...");
  
  const contract = await RandomArtNFT.deploy(
    "Random Art Collection",
    "RANDOM",
    "", // Base URI (using on-chain SVG)
    MAX_SUPPLY,
    deployer.address // Owner
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("");

  // Mint NFTs to target wallet
  console.log(`⏳ Minting ${QUANTITY} NFTs to ${TARGET_WALLET}...`);
  const mintTx = await contract.mintBatch(TARGET_WALLET, QUANTITY);
  console.log("📤 Transaction sent:", mintTx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await mintTx.wait();
  console.log("✅ NFTs minted successfully!");
  console.log("   Block:", receipt.blockNumber);
  console.log("   Gas Used:", receipt.gasUsed.toString());
  console.log("");

  // Verify minting
  const balance = await contract.balanceOf(TARGET_WALLET);
  const totalSupply = await contract.totalSupply();
  
  console.log("📊 Verification:");
  console.log("   Balance in target wallet:", balance.toString());
  console.log("   Total supply:", totalSupply.toString());
  console.log("");

  // Get token IDs
  console.log("🔍 Token IDs minted:");
  for (let i = 0; i < QUANTITY; i++) {
    try {
      const tokenId = await contract.tokenOfOwnerByIndex(TARGET_WALLET, i);
      console.log(`   Token #${tokenId.toString()}`);
    } catch (e) {
      console.log(`   Could not retrieve token #${i + 1}`);
    }
  }
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    contractAddress: contractAddress,
    targetWallet: TARGET_WALLET,
    quantity: QUANTITY,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");
  console.log("📝 Next Step: Add this contract to transfer contract:");
  console.log(`   npx hardhat run scripts/add-nft-to-transfer.js --network hyperevm`);
  console.log(`   NFT_CONTRACT=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
