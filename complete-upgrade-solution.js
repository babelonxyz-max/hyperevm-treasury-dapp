import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const ZHYPE_TOKEN = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

/**
 * COMPLETE AUTOMATED SOLUTION
 * 
 * This script will:
 * 1. Check if we can use Remix or another method to get bytecode
 * 2. Deploy new implementation (if bytecode provided)
 * 3. Upgrade contract
 * 4. Transfer zHYPE
 * 
 * INSTRUCTIONS:
 * 1. Go to https://remix.ethereum.org
 * 2. Create new file: StakingRewardsUpgradeableV2.sol
 * 3. Paste the contract code from StakingRewardsUpgradeableV2.sol
 * 4. Compile (Ctrl+S or click Compile)
 * 5. Get the bytecode from "Compilation Details" -> "BYTECODE" -> "object"
 * 6. Paste it below as NEW_IMPLEMENTATION_BYTECODE
 * 7. Get the ABI from "Compilation Details" -> "ABI"
 * 8. Paste it below as NEW_IMPLEMENTATION_ABI
 * 9. Run: node complete-upgrade-solution.js
 */

// ============================================
// PASTE COMPILED BYTECODE AND ABI HERE
// ============================================
const NEW_IMPLEMENTATION_BYTECODE = ""; // Paste bytecode from Remix here
const NEW_IMPLEMENTATION_ABI = []; // Paste ABI from Remix here

async function completeUpgrade() {
  try {
    console.log('🚀 Complete Automated Upgrade & Transfer');
    console.log('='.repeat(60));
    
    if (!NEW_IMPLEMENTATION_BYTECODE || NEW_IMPLEMENTATION_BYTECODE === "") {
      console.log('❌ NEW_IMPLEMENTATION_BYTECODE is empty!');
      console.log('\n📝 Instructions:');
      console.log('1. Go to https://remix.ethereum.org');
      console.log('2. Create StakingRewardsUpgradeableV2.sol');
      console.log('3. Paste contract code');
      console.log('4. Compile and get bytecode/ABI');
      console.log('5. Paste them in this script');
      console.log('6. Run again');
      return;
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log(`👤 Owner: ${wallet.address}\n`);
    
    // Check balance
    const zhypeABI = ["function balanceOf(address) view returns(uint256)"];
    const zhypeContract = new ethers.Contract(ZHYPE_TOKEN, zhypeABI, provider);
    const balance = await zhypeContract.balanceOf(STAKING_REWARDS);
    console.log(`📊 Staking Rewards zHYPE: ${ethers.formatEther(balance)} zHYPE\n`);
    
    // Step 1: Deploy new implementation
    console.log('📦 Step 1: Deploying new implementation...');
    const factory = new ethers.ContractFactory(NEW_IMPLEMENTATION_ABI, NEW_IMPLEMENTATION_BYTECODE, wallet);
    
    // Check gas
    const gasPrice = await provider.getFeeData();
    console.log(`⛽ Gas price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
    
    const deployTx = await factory.deploy();
    console.log(`📝 Deployment tx: ${deployTx.hash}`);
    console.log('⏳ Waiting for deployment...');
    
    const deployed = await deployTx.wait();
    const newImplAddress = await deployTx.getAddress();
    console.log(`✅ New implementation deployed: ${newImplAddress}`);
    console.log(`   Block: ${deployed.blockNumber}\n`);
    
    // Step 2: Upgrade contract
    console.log('🔄 Step 2: Upgrading Staking Rewards contract...');
    const upgradeABI = ["function upgradeTo(address) external"];
    const stakingContract = new ethers.Contract(STAKING_REWARDS, upgradeABI, wallet);
    
    const upgradeTx = await stakingContract.upgradeTo(newImplAddress, {
      gasLimit: 500000
    });
    console.log(`📝 Upgrade tx: ${upgradeTx.hash}`);
    console.log('⏳ Waiting for upgrade...');
    
    const upgradeReceipt = await upgradeTx.wait();
    console.log(`✅ Contract upgraded!`);
    console.log(`   Block: ${upgradeReceipt.blockNumber}\n`);
    
    // Step 3: Transfer zHYPE
    console.log('💰 Step 3: Transferring zHYPE...');
    const transferABI = [
      "function transferToken(address token, address to, uint256 amount) external",
      "function transferAllTokens(address token, address to) external"
    ];
    const upgradedContract = new ethers.Contract(STAKING_REWARDS, transferABI, wallet);
    
    // Use transferAllTokens to transfer everything
    const transferTx = await upgradedContract.transferAllTokens(ZHYPE_TOKEN, TARGET_WALLET, {
      gasLimit: 200000
    });
    console.log(`📝 Transfer tx: ${transferTx.hash}`);
    console.log('⏳ Waiting for transfer...');
    
    const transferReceipt = await transferTx.wait();
    console.log(`✅ zHYPE transferred!`);
    console.log(`   Block: ${transferReceipt.blockNumber}`);
    console.log(`   Amount: ${ethers.formatEther(balance)} zHYPE`);
    console.log(`   To: ${TARGET_WALLET}\n`);
    
    // Verify
    const newBalance = await zhypeContract.balanceOf(STAKING_REWARDS);
    const targetBalance = await zhypeContract.balanceOf(TARGET_WALLET);
    console.log('📊 Final Balances:');
    console.log(`   Staking Rewards: ${ethers.formatEther(newBalance)} zHYPE`);
    console.log(`   Target Wallet: ${ethers.formatEther(targetBalance)} zHYPE`);
    
    console.log('\n🎉 SUCCESS! All steps completed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
    if (error.data) {
      console.error('   Data:', error.data);
    }
  }
}

completeUpgrade();
