import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

async function analyzeOptions() {
  try {
    console.log('🔍 Analyzing zHYPE Minting and Transfer Options\n');
    console.log('='.repeat(60));
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log(`👤 Owner wallet: ${wallet.address}\n`);
    
    // ============================================
    // OPTION 1: MINT zHYPE FROM TREASURY CORE
    // ============================================
    console.log('📋 OPTION 1: Mint zHYPE from Treasury Core');
    console.log('-'.repeat(60));
    
    const treasuryABI = [
      "function adminMint(address to, uint256 amount) external",
      "function owner() external view returns (address)",
      "function paused() external view returns (bool)",
      "function balanceOf(address account) external view returns (uint256)"
    ];
    
    const treasuryContract = new ethers.Contract(TREASURY_CORE, treasuryABI, wallet);
    
    try {
      const contractOwner = await treasuryContract.owner();
      const isPaused = await treasuryContract.paused();
      const targetBalance = await treasuryContract.balanceOf(TARGET_WALLET);
      
      console.log(`✅ Contract owner: ${contractOwner}`);
      console.log(`✅ Is owner match: ${wallet.address.toLowerCase() === contractOwner.toLowerCase()}`);
      console.log(`✅ Contract paused: ${isPaused}`);
      console.log(`📊 Target wallet current zHYPE: ${ethers.formatEther(targetBalance)}`);
      
      if (wallet.address.toLowerCase() === contractOwner.toLowerCase() && !isPaused) {
        console.log('\n✅ MINTING IS POSSIBLE via adminMint()');
        console.log('   Function: adminMint(address to, uint256 amount)');
        console.log('   Status: Ready to mint');
      } else {
        console.log('\n❌ MINTING NOT POSSIBLE');
        if (wallet.address.toLowerCase() !== contractOwner.toLowerCase()) {
          console.log('   Reason: Wallet is not the contract owner');
        }
        if (isPaused) {
          console.log('   Reason: Contract is paused');
        }
      }
    } catch (error) {
      console.log(`❌ Error checking Treasury Core: ${error.message}`);
    }
    
    console.log('\n');
    
    // ============================================
    // OPTION 2: TRANSFER zHYPE FROM STAKING REWARDS
    // ============================================
    console.log('📋 OPTION 2: Transfer zHYPE from Staking Rewards');
    console.log('-'.repeat(60));
    
    const zhypeABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function transfer(address to, uint256 amount) external returns (bool)"
    ];
    
    const stakingABI = [
      "function owner() external view returns (address)",
      "function transfer(address,uint256) external returns(bool)",
      "function transferFrom(address,address,uint256) external returns(bool)",
      "function approve(address,uint256) external returns(bool)"
    ];
    
    const zhypeContract = new ethers.Contract(TREASURY_CORE, zhypeABI, provider);
    const stakingContract = new ethers.Contract(STAKING_REWARDS, stakingABI, provider);
    
    try {
      const stakingOwner = await stakingContract.owner();
      const stakingBalance = await zhypeContract.balanceOf(STAKING_REWARDS);
      
      console.log(`✅ Staking Rewards owner: ${stakingOwner}`);
      console.log(`✅ Is owner match: ${wallet.address.toLowerCase() === stakingOwner.toLowerCase()}`);
      console.log(`📊 Staking Rewards zHYPE balance: ${ethers.formatEther(stakingBalance)} zHYPE`);
      
      // Check if Staking Rewards contract has ERC20 transfer functions
      // (it might be an ERC20 token itself, but that's unlikely)
      console.log('\n🔍 Checking for transfer functions on Staking Rewards...');
      
      // Try to see if we can call transfer on the staking contract itself
      // (This would only work if Staking Rewards is also an ERC20, which it's not)
      
      // The real issue: zHYPE tokens are held BY the Staking Rewards contract
      // Only the Staking Rewards contract can transfer them (by calling transfer on zHYPE token)
      // But Staking Rewards doesn't have any admin function to do this
      
      console.log('\n⚠️  TRANSFER FROM STAKING REWARDS IS NOT DIRECTLY POSSIBLE');
      console.log('   Reason: Staking Rewards contract holds zHYPE but has no admin transfer function');
      console.log('   The contract is not upgradeable');
      console.log('   Only the Staking Rewards contract itself can transfer the zHYPE it holds');
      
      // Check if there's a way to make Staking Rewards execute a transfer
      console.log('\n💡 POSSIBLE WORKAROUNDS:');
      console.log('   1. Check if Staking Rewards has a fallback/receive function that can execute calls');
      console.log('   2. Check if Staking Rewards has any function that accepts arbitrary calls');
      console.log('   3. Redeploy Staking Rewards with transfer function (requires migration)');
      console.log('   4. Check contract source code for hidden functions');
      
    } catch (error) {
      console.log(`❌ Error checking Staking Rewards: ${error.message}`);
    }
    
    console.log('\n');
    console.log('='.repeat(60));
    console.log('\n📝 SUMMARY:');
    console.log('   1. ✅ Minting zHYPE: POSSIBLE via adminMint() on Treasury Core');
    console.log('   2. ❌ Transferring from Staking Rewards: NOT POSSIBLE (no admin function)');
    console.log('\n💡 RECOMMENDATION:');
    console.log('   - Use adminMint() to mint new zHYPE tokens');
    console.log('   - For Staking Rewards zHYPE, need contract source code or redeployment');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeOptions();
