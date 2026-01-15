import { ethers } from "ethers";

// Configuration
const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const HYPURR_NFT_CONTRACT = "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";

// Common ERC721 functions + potential mint functions
const NFT_ABI = [
  // Standard ERC721
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  
  // Enumerable
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function tokenByIndex(uint256 index) external view returns (uint256)",
  
  // Common mint functions
  "function mint(address to) external",
  "function mint(address to, uint256 amount) external",
  "function mint(address to, uint256 tokenId) external",
  "function safeMint(address to) external",
  "function safeMint(address to, uint256 tokenId) external",
  "function mintTo(address to) external",
  "function mintTo(address to, uint256 quantity) external",
  "function adminMint(address to, uint256 quantity) external",
  "function ownerMint(address to, uint256 quantity) external",
  "function publicMint(uint256 quantity) external",
  
  // Access control
  "function owner() external view returns (address)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
];

async function main() {
  console.log("🔍 Checking Hypurr NFT Contract...\n");
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(HYPURR_NFT_CONTRACT, NFT_ABI, provider);
  
  try {
    // Get basic info
    console.log("📋 Contract Info:");
    try {
      const name = await contract.name();
      console.log("  Name:", name);
    } catch (e) {}
    
    try {
      const symbol = await contract.symbol();
      console.log("  Symbol:", symbol);
    } catch (e) {}
    
    try {
      const totalSupply = await contract.totalSupply();
      console.log("  Total Supply:", totalSupply.toString());
    } catch (e) {}
    
    // Check owner
    try {
      const owner = await contract.owner();
      console.log("  Owner:", owner);
    } catch (e) {}
    
    console.log("");
    
    // Try to find mint functions by checking function selectors
    console.log("🔍 Checking for mint functions...");
    const code = await provider.getCode(HYPURR_NFT_CONTRACT);
    console.log("  Contract Code Length:", code.length, "bytes");
    
    // Common mint function selectors
    const mintSelectors = {
      "mint(address)": "0x40c10f19",
      "mint(address,uint256)": "0x4e6ec247",
      "safeMint(address)": "0x6a627842",
      "safeMint(address,uint256)": "0x5b5e139f",
      "mintTo(address)": "0x4e6ec247",
      "adminMint(address,uint256)": "0x5b5e139f",
      "ownerMint(address,uint256)": "0x5b5e139f",
    };
    
    console.log("\n📝 Checking function selectors in bytecode:");
    for (const [func, selector] of Object.entries(mintSelectors)) {
      if (code.includes(selector)) {
        console.log("  ✅ Found:", func, "(" + selector + ")");
      }
    }
    
    // Try to call common mint functions (will fail if not available, but we'll see the error)
    console.log("\n🧪 Testing mint function calls...");
    const testAddress = "0x0000000000000000000000000000000000000001";
    
    const functionsToTest = [
      { name: "mint(address)", call: () => contract.mint(testAddress) },
      { name: "safeMint(address)", call: () => contract.safeMint(testAddress) },
      { name: "mintTo(address)", call: () => contract.mintTo(testAddress) },
    ];
    
    for (const func of functionsToTest) {
      try {
        // Just check if function exists (will revert, but that's ok)
        await func.call();
      } catch (error) {
        if (error.message.includes("function") && error.message.includes("not found")) {
          console.log("  ❌", func.name, "- Function not found");
        } else {
          console.log("  ✅", func.name, "- Function exists (call would revert without proper params/auth)");
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
