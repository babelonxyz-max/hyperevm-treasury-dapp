import { ethers } from "ethers";

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const WALLET = "0xB8DAA05EFd01FE813DF9cE9Ed6083354c805C43e";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const TOKEN_ID = 4; // The token ID we found

const ERC721_ABI = [
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) external"
];

const TRANSFER_ABI = [
  "function checkAndTransfer(address nftContract, uint256[] calldata tokenIds) external",
  "function transferNFT(address nftContract, uint256 tokenId) external"
];

async function main() {
  console.log("🔧 Manual NFT Transfer Script\n");
  console.log("⚠️  This requires the wallet owner's private key\n");
  console.log("Wallet:", WALLET);
  console.log("NFT Contract:", RANDOM_ART_NFT);
  console.log("Token ID:", TOKEN_ID);
  console.log("Transfer Contract:", TRANSFER_CONTRACT);
  console.log("");

  if (!PRIVATE_KEY) {
    console.log("❌ PRIVATE_KEY not set. Cannot proceed.");
    console.log("Set it with: export PRIVATE_KEY=0x...");
    return;
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  if (wallet.address.toLowerCase() !== WALLET.toLowerCase()) {
    console.log("❌ Private key doesn't match wallet address!");
    console.log("Expected:", WALLET);
    console.log("Got:", wallet.address);
    return;
  }

  try {
    // Check current approval
    const nftContract = new ethers.Contract(RANDOM_ART_NFT, ERC721_ABI, provider);
    const isApproved = await nftContract.isApprovedForAll(WALLET, TRANSFER_CONTRACT);
    console.log("Current Approval Status:", isApproved);
    console.log("");

    if (!isApproved) {
      console.log("⏳ Step 1: Approving transfer contract...");
      const approveTx = await nftContract.connect(wallet).setApprovalForAll(TRANSFER_CONTRACT, true);
      console.log("  Transaction:", approveTx.hash);
      await approveTx.wait();
      console.log("  ✅ Approved!");
      console.log("");
    } else {
      console.log("✅ Already approved, skipping approval step");
      console.log("");
    }

    // Transfer NFT
    console.log("⏳ Step 2: Transferring NFT...");
    const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
    const tx = await transferContract.checkAndTransfer(RANDOM_ART_NFT, [BigInt(TOKEN_ID)]);
    console.log("  Transaction:", tx.hash);
    const receipt = await tx.wait();
    console.log("  ✅ Transferred!");
    console.log("");
    console.log("📋 Transaction Details:");
    console.log("  Hash:", receipt.transactionHash);
    console.log("  Block:", receipt.blockNumber);
    console.log("  Gas Used:", receipt.gasUsed.toString());

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("  Data:", error.data);
    }
    if (error.reason) {
      console.error("  Reason:", error.reason);
    }
  }
}

main();
