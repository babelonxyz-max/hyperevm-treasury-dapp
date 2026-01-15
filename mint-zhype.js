import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

// Get amount from command line argument or use default
const amount = process.argv[2] || "1000"; // Default: 1000 zHYPE

async function mintZhype() {
  try {
    console.log('🚀 Minting zHYPE to target wallet...');
    console.log(`📬 Target wallet: ${TARGET_WALLET}`);
    console.log(`💰 Amount: ${amount} zHYPE`);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Treasury Core ABI with adminMint
    const treasuryABI = [
      "function adminMint(address to, uint256 amount) external",
      "function balanceOf(address account) external view returns (uint256)",
      "function owner() external view returns (address)",
      "function paused() external view returns (bool)"
    ];

    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESS, treasuryABI, wallet);

    // Verify owner
    const contractOwner = await treasuryContract.owner();
    console.log(`🔐 Contract Owner: ${contractOwner}`);
    
    if (wallet.address.toLowerCase() !== contractOwner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      return;
    }

    // Check if contract is paused
    const isPaused = await treasuryContract.paused();
    console.log(`⏸️  Contract paused: ${isPaused}`);
    
    if (isPaused) {
      console.log('❌ Contract is paused. Cannot mint zHYPE.');
      return;
    }

    // Check current balance before minting
    const balanceBefore = await treasuryContract.balanceOf(TARGET_WALLET);
    console.log(`📊 Current zHYPE balance: ${ethers.formatEther(balanceBefore)} zHYPE`);

    // Convert amount to wei
    const amountWei = ethers.parseEther(amount);
    
    console.log(`\n🚀 Minting ${amount} zHYPE...`);
    
    // Try to estimate gas first
    try {
      const gasEstimate = await treasuryContract.adminMint.estimateGas(TARGET_WALLET, amountWei);
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
    } catch (estimateError) {
      console.error('❌ Gas estimation failed:', estimateError.message);
      if (estimateError.reason) {
        console.error('Reason:', estimateError.reason);
      }
      throw estimateError;
    }
    
    const tx = await treasuryContract.adminMint(TARGET_WALLET, amountWei, {
      gasLimit: 200000
    });
    
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check new balance
    const balanceAfter = await treasuryContract.balanceOf(TARGET_WALLET);
    console.log(`📊 New zHYPE balance: ${ethers.formatEther(balanceAfter)} zHYPE`);
    
    const mintedAmount = parseFloat(ethers.formatEther(balanceAfter)) - parseFloat(ethers.formatEther(balanceBefore));
    console.log(`💰 Amount minted: ${mintedAmount.toFixed(6)} zHYPE`);
    
    console.log('\n🎉 SUCCESS! zHYPE minted successfully!');
    
  } catch (error) {
    console.error('❌ Mint failed:', error);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
  }
}

mintZhype();

