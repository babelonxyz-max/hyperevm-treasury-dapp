import { ethers } from "ethers";

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const TRANSFER_CONTRACT = process.env.TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const NEW_DESTINATION_WALLET = "0x25b155C387bcf2434F0df5e2f34E9D68E0A99228";

// Transfer Contract ABI
const TRANSFER_ABI = [
  "function destinationWallet() external view returns (address)",
  "function updateDestinationWallet(address _newDestination) external",
  "function owner() external view returns (address)",
  "function paused() external view returns (bool)"
];

async function main() {
  console.log("🔄 Updating Destination Wallet...\n");

  if (!PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not set in environment variables");
  }

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("📝 Wallet:", wallet.address);
  console.log("📍 Transfer Contract:", TRANSFER_CONTRACT);
  console.log("🎯 New Destination Wallet:", NEW_DESTINATION_WALLET);
  console.log("");

  const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
  
  // Check current destination wallet
  try {
    const currentDestination = await transferContract.destinationWallet();
    console.log("📍 Current Destination Wallet:", currentDestination);
    
    if (currentDestination.toLowerCase() === NEW_DESTINATION_WALLET.toLowerCase()) {
      console.log("✅ Destination wallet is already set to this address. No update needed.");
      return;
    }
  } catch (error) {
    console.log("⚠️  Could not read current destination wallet:", error.message);
  }

  // Check if contract is paused
  try {
    const isPaused = await transferContract.paused();
    if (isPaused) {
      console.log("⚠️  Warning: Contract is paused");
    }
  } catch (error) {
    console.log("⚠️  Could not check pause status:", error.message);
  }

  // Check if wallet is owner
  try {
    const owner = await transferContract.owner();
    console.log("👤 Contract Owner:", owner);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`❌ Wallet ${wallet.address} is not the contract owner. Only owner can update destination wallet.`);
    }
    console.log("✅ Wallet is the contract owner\n");
  } catch (error) {
    if (error.message.includes("not the contract owner")) {
      throw error;
    }
    console.log("⚠️  Could not verify ownership:", error.message);
  }

  // Update destination wallet
  console.log("⏳ Updating destination wallet...");
  try {
    const tx = await transferContract.updateDestinationWallet(NEW_DESTINATION_WALLET);
    console.log("📤 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas Used:", receipt.gasUsed.toString());
    
    // Verify the update
    const newDestination = await transferContract.destinationWallet();
    console.log("\n✅ Destination wallet updated successfully!");
    console.log("📍 New Destination Wallet:", newDestination);
    
    if (newDestination.toLowerCase() === NEW_DESTINATION_WALLET.toLowerCase()) {
      console.log("✅ Verification: Destination wallet matches expected address");
    } else {
      console.log("⚠️  Warning: Destination wallet does not match expected address");
    }
  } catch (error) {
    console.error("❌ Error updating destination wallet:", error.message);
    if (error.reason) {
      console.error("   Reason:", error.reason);
    }
    throw error;
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
