const { ethers } = require("ethers");

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const TRANSFER_CONTRACT = process.env.TRANSFER_CONTRACT || "0x0000000000000000000000000000000000000000";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const TOKEN_IDS = process.env.TOKEN_IDS ? process.env.TOKEN_IDS.split(",").map(id => id.trim()) : [];

// Transfer Contract ABI
const TRANSFER_ABI = [
  "function checkNFTs(address nftContract, address wallet) external view returns (uint256)",
  "function checkAllNFTs(address wallet) external view returns (uint256)",
  "function isNFTContractEnabled(address nftContract) external view returns (bool)",
  "function transferNFT(address nftContract, uint256 tokenId) external",
  "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
  "function transferNFTsFromMultiple(address[] calldata nftContracts, uint256[][] calldata tokenIdsArray) external",
  "function checkAndTransfer(address nftContract, uint256[] calldata tokenIds) external",
  "function destinationWallet() external view returns (address)",
  "function paused() external view returns (bool)",
  "function acceptAllNFTs() external view returns (bool)",
  "function getEnabledNFTContracts() external view returns (address[] memory)",
  "function getEnabledNFTContractCount() external view returns (uint256)"
];

async function main() {
  console.log("🚀 Transferring Hypurr NFTs...\n");

  if (!PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not set in environment variables");
  }
  if (TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ TRANSFER_CONTRACT not set");
  }

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("📝 Wallet:", wallet.address);
  console.log("📍 Transfer Contract:", TRANSFER_CONTRACT);
  console.log("");

  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, provider);
  
  // Check if contract is paused
  const isPaused = await transferContract.paused();
  if (isPaused) {
    throw new Error("❌ Contract is paused. Transfers are disabled.");
  }

  // Get destination wallet
  const destination = await transferContract.destinationWallet();
  console.log("📍 Destination Wallet:", destination);
  console.log("");

  // Get NFT contract address
  const NFT_CONTRACT = process.env.NFT_CONTRACT || "0x0000000000000000000000000000000000000000";
  if (NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ NFT_CONTRACT not set. Set the NFT contract address to transfer from.");
  }

  // Check if contract is enabled
  const isEnabled = await transferContract.isNFTContractEnabled(NFT_CONTRACT);
  if (!isEnabled) {
    throw new Error("❌ NFT contract is not enabled. Owner must add it first.");
  }

  // Check NFT count
  const nftCount = await transferContract.checkNFTs(NFT_CONTRACT, wallet.address);
  console.log("📊 NFTs found in contract:", nftCount.toString());
  
  if (nftCount === 0n) {
    console.log("❌ No NFTs found in wallet. Nothing to transfer.");
    return;
  }

  // Determine token IDs
  let tokenIds = [];
  if (TOKEN_IDS.length > 0) {
    tokenIds = TOKEN_IDS.map(id => BigInt(id));
    console.log("📋 Using provided token IDs:", tokenIds.map(id => id.toString()).join(", "));
  } else {
    console.log("⚠️  No token IDs provided. You need to provide TOKEN_IDS environment variable.");
    console.log("   Example: TOKEN_IDS=1,2,3,4,5");
    console.log("");
    console.log("💡 Note: To get token IDs, you can:");
    console.log("   1. Check the NFT contract directly");
    console.log("   2. Use a block explorer");
    console.log("   3. Query the contract if it supports ERC721Enumerable");
    return;
  }

  if (tokenIds.length === 0) {
    throw new Error("❌ No token IDs provided");
  }

  console.log("");
  console.log("⏳ Transferring NFTs...");
  
  const contractWithSigner = transferContract.connect(wallet);
  
  // Use checkAndTransfer for convenience (checks ownership and transfers)
  const tx = await contractWithSigner.checkAndTransfer(NFT_CONTRACT, tokenIds);
  
  console.log("📤 Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed!");
  console.log("   Block:", receipt.blockNumber);
  console.log("   Gas Used:", receipt.gasUsed.toString());
  console.log("");
  console.log("✅ Successfully transferred", tokenIds.length, "NFT(s) from", NFT_CONTRACT, "to", destination);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
