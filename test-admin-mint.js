import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

// Get amount from command line or use default
const amount = process.argv[2] || "100"; // Default: 100 zHYPE

async function testAdminMint() {
  try {
    console.log('🧪 Testing adminMint function...');
    console.log(`📬 Target wallet: ${TARGET_WALLET}`);
    console.log(`💰 Amount: ${amount} zHYPE\n`);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    const treasuryABI = [
      "function adminMint(address to, uint256 amount) external",
      "function balanceOf(address account) external view returns (uint256)",
      "function owner() external view returns (address)",
      "function paused() external view returns (bool)"
    ];
    
    const treasuryContract = new ethers.Contract(TREASURY_CORE, treasuryABI, wallet);
    
    // Check balance before
    const balanceBefore = await treasuryContract.balanceOf(TARGET_WALLET);
    console.log(`📊 Balance before: ${ethers.formatEther(balanceBefore)} zHYPE`);
    
    const amountWei = ethers.parseEther(amount);
    
    // Try gas estimation first
    console.log('\n⛽ Estimating gas...');
    try {
      const gasEstimate = await treasuryContract.adminMint.estimateGas(TARGET_WALLET, amountWei);
      console.log(`✅ Gas estimate: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError.message);
      if (gasError.reason) {
        console.error('   Reason:', gasError.reason);
      }
      if (gasError.data) {
        console.error('   Data:', gasError.data);
      }
      console.log('\n💡 This means adminMint() will revert. Possible reasons:');
      console.log('   1. Function not implemented in contract');
      console.log('   2. Access control restrictions');
      console.log('   3. Contract state prevents minting');
      return;
    }
    
    // If gas estimation succeeds, try the actual transaction
    console.log('\n🚀 Attempting mint transaction...');
    const tx = await treasuryContract.adminMint(TARGET_WALLET, amountWei, {
      gasLimit: 200000
    });
    
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Check balance after
    const balanceAfter = await treasuryContract.balanceOf(TARGET_WALLET);
    console.log(`📊 Balance after: ${ethers.formatEther(balanceAfter)} zHYPE`);
    console.log(`💰 Minted: ${ethers.formatEther(balanceAfter - balanceBefore)} zHYPE`);
    
    console.log('\n🎉 SUCCESS! adminMint() works!');
    
  } catch (error) {
    console.error('\n❌ adminMint() failed:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
    if (error.data) {
      console.error('   Data:', error.data);
    }
  }
}

testAdminMint();
