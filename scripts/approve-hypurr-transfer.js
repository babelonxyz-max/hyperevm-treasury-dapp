const { ethers } = require("ethers");

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const HYPURR_NFT_CONTRACT = process.env.HYPURR_NFT_CONTRACT || "0x0000000000000000000000000000000000000000";
const TRANSFER_CONTRACT = process.env.TRANSFER_CONTRACT || "0x0000000000000000000000000000000000000000";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// ERC721 ABI for setApprovalForAll
const ERC721_ABI = [
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)"
];

async function main() {
  console.log("🔐 Approving HypurrNFTTransfer Contract...\n");

  if (!PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not set in environment variables");
  }
  if (HYPURR_NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ HYPURR_NFT_CONTRACT not set");
  }
  if (TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ TRANSFER_CONTRACT not set");
  }

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("📝 Wallet:", wallet.address);
  console.log("📍 Hypurr NFT Contract:", HYPURR_NFT_CONTRACT);
  console.log("📍 Transfer Contract:", TRANSFER_CONTRACT);
  console.log("");

  // Check current approval status
  const nftContract = new ethers.Contract(HYPURR_NFT_CONTRACT, ERC721_ABI, provider);
  const isApproved = await nftContract.isApprovedForAll(wallet.address, TRANSFER_CONTRACT);
  
  console.log("🔍 Current approval status:", isApproved ? "✅ Approved" : "❌ Not Approved");
  
  if (isApproved) {
    console.log("✅ Contract is already approved. No action needed.");
    return;
  }

  // Check NFT balance
  const balance = await nftContract.balanceOf(wallet.address);
  console.log("📊 NFT Balance:", balance.toString());
  console.log("");

  // Approve contract
  console.log("⏳ Approving contract...");
  const nftContractWithSigner = nftContract.connect(wallet);
  const tx = await nftContractWithSigner.setApprovalForAll(TRANSFER_CONTRACT, true);
  
  console.log("📤 Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed!");
  console.log("   Block:", receipt.blockNumber);
  console.log("   Gas Used:", receipt.gasUsed.toString());
  console.log("");

  // Verify approval
  const isApprovedNow = await nftContract.isApprovedForAll(wallet.address, TRANSFER_CONTRACT);
  console.log("🔍 New approval status:", isApprovedNow ? "✅ Approved" : "❌ Not Approved");
  
  if (isApprovedNow) {
    console.log("✅ Successfully approved contract to transfer NFTs!");
  } else {
    console.log("❌ Approval failed. Please check the transaction.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
