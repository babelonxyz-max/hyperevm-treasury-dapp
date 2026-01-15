import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

// Get amount from command line or use default
const amount = process.argv[2] || "100"; // Default: 100 HYPE

/**
 * This script deposits HYPE into Treasury Core to mint zHYPE
 * 
 * IMPORTANT: This is the WORKING way to mint zHYPE since adminMint() doesn't exist
 * 
 * How it works:
 * 1. Deposits HYPE into Treasury Core contract
 * 2. Contract automatically mints zHYPE 1:1 with deposited HYPE
 * 3. zHYPE is minted to the depositor's address (or target wallet if contract allows)
 * 
 * Note: You need HYPE tokens in the owner wallet to use this
 */
async function depositToMintZhype() {
  try {
    console.log('🚀 Depositing HYPE to mint zHYPE...');
    console.log(`💰 Amount to deposit: ${amount} HYPE`);
    console.log(`📬 Target wallet: ${TARGET_WALLET}`);
    console.log('\n⚠️  NOTE: zHYPE will be minted to the address that deposits');
    console.log('   If you want zHYPE in target wallet, you may need to transfer after minting\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log(`👤 Depositing from: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💵 Wallet HYPE balance: ${ethers.formatEther(balance)} HYPE`);
    
    const amountWei = ethers.parseEther(amount);
    
    if (balance < amountWei) {
      console.log(`❌ Insufficient balance. Need ${amount} HYPE, have ${ethers.formatEther(balance)} HYPE`);
      return;
    }
    
    // Treasury Core ABI
    const treasuryABI = [
      "function depositHype() external payable",
      "function balanceOf(address account) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)"
    ];
    
    const treasuryContract = new ethers.Contract(TREASURY_CORE, treasuryABI, wallet);
    
    // Check zHYPE balance before
    const zhypeBalanceBefore = await treasuryContract.balanceOf(wallet.address);
    const totalSupplyBefore = await treasuryContract.totalSupply();
    
    console.log(`\n📊 Before deposit:`);
    console.log(`   Wallet zHYPE: ${ethers.formatEther(zhypeBalanceBefore)} zHYPE`);
    console.log(`   Total zHYPE supply: ${ethers.formatEther(totalSupplyBefore)} zHYPE`);
    
    // Deposit HYPE
    console.log(`\n🚀 Depositing ${amount} HYPE...`);
    const tx = await treasuryContract.depositHype({
      value: amountWei,
      gasLimit: 300000
    });
    
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check zHYPE balance after
    const zhypeBalanceAfter = await treasuryContract.balanceOf(wallet.address);
    const totalSupplyAfter = await treasuryContract.totalSupply();
    
    console.log(`\n📊 After deposit:`);
    console.log(`   Wallet zHYPE: ${ethers.formatEther(zhypeBalanceAfter)} zHYPE`);
    console.log(`   Total zHYPE supply: ${ethers.formatEther(totalSupplyAfter)} zHYPE`);
    
    const minted = parseFloat(ethers.formatEther(zhypeBalanceAfter)) - parseFloat(ethers.formatEther(zhypeBalanceBefore));
    console.log(`\n💰 zHYPE minted: ${minted.toFixed(6)} zHYPE`);
    
    // If zHYPE was minted to owner wallet but we want it in target wallet, transfer it
    if (wallet.address.toLowerCase() !== TARGET_WALLET.toLowerCase() && minted > 0) {
      console.log(`\n🔄 Transferring zHYPE to target wallet...`);
      
      const transferABI = ["function transfer(address to, uint256 amount) external returns (bool)"];
      const transferContract = new ethers.Contract(TREASURY_CORE, transferABI, wallet);
      
      const transferTx = await transferContract.transfer(TARGET_WALLET, ethers.parseEther(minted.toString()), {
        gasLimit: 100000
      });
      
      console.log(`📝 Transfer Transaction Hash: ${transferTx.hash}`);
      await transferTx.wait();
      
      const targetBalance = await treasuryContract.balanceOf(TARGET_WALLET);
      console.log(`✅ Target wallet now has: ${ethers.formatEther(targetBalance)} zHYPE`);
    }
    
    console.log('\n🎉 SUCCESS! zHYPE minted via deposit!');
    
  } catch (error) {
    console.error('❌ Deposit failed:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
    if (error.data) {
      console.error('   Data:', error.data);
    }
  }
}

depositToMintZhype();
