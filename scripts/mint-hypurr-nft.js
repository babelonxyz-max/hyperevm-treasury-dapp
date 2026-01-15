import { ethers } from "ethers";

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const HYPURR_NFT_CONTRACT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const TARGET_WALLET = process.env.TARGET_WALLET || "0x0000000000000000000000000000000000000000";
const QUANTITY = parseInt(process.env.QUANTITY || "1");

// NFT Contract ABI - try different mint functions
const NFT_ABI = [
  // Standard ERC721
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function owner() external view returns (address)",
  
  // Mint functions
  "function mint(address to) external",
  "function safeMint(address to) external",
  "function mintTo(address to) external",
  "function mint(address to, uint256 quantity) external",
  "function safeMint(address to, uint256 quantity) external",
  "function mintTo(address to, uint256 quantity) external",
  "function adminMint(address to, uint256 quantity) external",
  "function ownerMint(address to, uint256 quantity) external",
];

async function main() {
  console.log("🎨 Minting Hypurr NFTs for Testing...\n");

  if (!PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not set in environment variables");
  }

  if (TARGET_WALLET === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ TARGET_WALLET not set in environment variables");
  }

  console.log("📋 Configuration:");
  console.log("  NFT Contract:", HYPURR_NFT_CONTRACT);
  console.log("  Target Wallet:", TARGET_WALLET);
  console.log("  Quantity:", QUANTITY);
  console.log("");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("👤 Minting from:", wallet.address);
  console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "HYPE");
  console.log("");

  const contract = new ethers.Contract(HYPURR_NFT_CONTRACT, NFT_ABI, provider);
  
  // Check contract info
  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();
    
    console.log("📋 Contract Info:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Total Supply:", totalSupply.toString());
    console.log("  Owner:", owner);
    console.log("");
    
    // Check if we're the owner
    if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
      console.log("⚠️  Warning: Wallet is not the contract owner");
      console.log("   Minting may fail if owner-only functions are used");
      console.log("");
    }
  } catch (error) {
    console.log("⚠️  Could not fetch contract info:", error.message);
  }

  // Check current balance
  const balanceBefore = await contract.balanceOf(TARGET_WALLET);
  console.log("📊 Current NFT balance:", balanceBefore.toString());
  console.log("");

  // Try different mint functions
  const contractWithSigner = contract.connect(wallet);
  
  const mintFunctions = [
    { name: "mint(address)", func: () => contractWithSigner.mint(TARGET_WALLET) },
    { name: "safeMint(address)", func: () => contractWithSigner.safeMint(TARGET_WALLET) },
    { name: "mintTo(address)", func: () => contractWithSigner.mintTo(TARGET_WALLET) },
    { name: "mint(address,uint256)", func: () => contractWithSigner.mint(TARGET_WALLET, QUANTITY) },
    { name: "safeMint(address,uint256)", func: () => contractWithSigner.safeMint(TARGET_WALLET, QUANTITY) },
    { name: "mintTo(address,uint256)", func: () => contractWithSigner.mintTo(TARGET_WALLET, QUANTITY) },
    { name: "adminMint(address,uint256)", func: () => contractWithSigner.adminMint(TARGET_WALLET, QUANTITY) },
    { name: "ownerMint(address,uint256)", func: () => contractWithSigner.ownerMint(TARGET_WALLET, QUANTITY) },
  ];

  console.log("⏳ Attempting to mint...");
  
  for (let i = 0; i < QUANTITY; i++) {
    let minted = false;
    
    for (const mintFunc of mintFunctions) {
      try {
        console.log(`  Trying ${mintFunc.name}...`);
        const tx = await mintFunc.func();
        console.log(`  ✅ Transaction sent: ${tx.hash}`);
        console.log("  ⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log(`  ✅ Minted successfully!`);
        console.log(`     Block: ${receipt.blockNumber}`);
        console.log(`     Gas Used: ${receipt.gasUsed.toString()}`);
        console.log("");
        
        minted = true;
        break; // Success, move to next NFT
      } catch (error) {
        // Try next function
        if (error.message.includes("function") && error.message.includes("not found")) {
          continue; // Function doesn't exist, try next
        }
        // Other errors might be auth/permission issues, but let's try next function anyway
        if (i === 0 && mintFunc === mintFunctions[0]) {
          // Only show error for first attempt of first NFT
          console.log(`  ⚠️  ${mintFunc.name} failed: ${error.message.substring(0, 100)}`);
        }
      }
    }
    
    if (!minted) {
      console.log(`  ❌ Could not mint NFT #${i + 1}. All mint functions failed.`);
      console.log("     Please check:");
      console.log("     - Are you the contract owner?");
      console.log("     - Do you have the required role?");
      console.log("     - Is the contract paused?");
      break;
    }
  }

  // Check final balance
  const balanceAfter = await contract.balanceOf(TARGET_WALLET);
  const mintedCount = balanceAfter - balanceBefore;
  
  console.log("📊 Final Results:");
  console.log("  Balance Before:", balanceBefore.toString());
  console.log("  Balance After:", balanceAfter.toString());
  console.log("  NFTs Minted:", mintedCount.toString());
  console.log("");
  
  if (mintedCount > 0n) {
    console.log("✅ Successfully minted", mintedCount.toString(), "NFT(s) to", TARGET_WALLET);
  } else {
    console.log("❌ No NFTs were minted. Please check permissions and try again.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
