import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS_ADDRESS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const ZHYPE_TOKEN_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
const AMOUNT = "100"; // zHYPE to transfer

async function transferZhype() {
  try {
    console.log('🚀 Transferring zHYPE from Staking Rewards contract...');
    console.log(`📬 From: ${STAKING_REWARDS_ADDRESS}`);
    console.log(`📬 To: ${TARGET_WALLET}`);
    console.log(`💰 Amount: ${AMOUNT} zHYPE`);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // zHYPE Token ABI (ERC-20)
    const zhypeABI = [
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) external view returns (uint256)"
    ];

    // Staking Rewards ABI - check for admin transfer functions
    const stakingABI = [
      "function owner() external view returns (address)",
      "function transferToken(address token, address to, uint256 amount) external",
      "function emergencyWithdraw(address token, address to, uint256 amount) external",
      "function adminTransfer(address token, address to, uint256 amount) external",
      "function withdrawToken(address token, address to, uint256 amount) external"
    ];

    const zhypeContract = new ethers.Contract(ZHYPE_TOKEN_ADDRESS, zhypeABI, wallet);
    const stakingContract = new ethers.Contract(STAKING_REWARDS_ADDRESS, stakingABI, wallet);

    // Verify owner
    const stakingOwner = await stakingContract.owner();
    console.log(`🔐 Staking Rewards Owner: ${stakingOwner}`);
    
    if (wallet.address.toLowerCase() !== stakingOwner.toLowerCase()) {
      console.log('❌ Wallet is not the Staking Rewards contract owner');
      return;
    }

    // Check balances before transfer
    const stakingBalance = await zhypeContract.balanceOf(STAKING_REWARDS_ADDRESS);
    const targetBalanceBefore = await zhypeContract.balanceOf(TARGET_WALLET);
    
    console.log(`\n📊 Current Balances:`);
    console.log(`🏛️  Staking Rewards zHYPE: ${ethers.formatEther(stakingBalance)} zHYPE`);
    console.log(`📬 Target wallet zHYPE: ${ethers.formatEther(targetBalanceBefore)} zHYPE`);

    if (parseFloat(ethers.formatEther(stakingBalance)) < parseFloat(AMOUNT)) {
      console.log(`❌ Insufficient balance. Staking Rewards has ${ethers.formatEther(stakingBalance)} zHYPE, need ${AMOUNT} zHYPE`);
      return;
    }

    const amountWei = ethers.parseEther(AMOUNT);
    
    // Try different methods to transfer
    console.log(`\n🚀 Attempting transfer...`);
    
    // Method 1: Try admin transfer function on Staking Rewards contract
    let tx = null;
    let method = '';
    
    try {
      // Try transferToken function
      try {
        tx = await stakingContract.transferToken(ZHYPE_TOKEN_ADDRESS, TARGET_WALLET, amountWei, { gasLimit: 200000 });
        method = 'transferToken';
      } catch (e1) {
        // Try emergencyWithdraw
        try {
          tx = await stakingContract.emergencyWithdraw(ZHYPE_TOKEN_ADDRESS, TARGET_WALLET, amountWei, { gasLimit: 200000 });
          method = 'emergencyWithdraw';
        } catch (e2) {
          // Try adminTransfer
          try {
            tx = await stakingContract.adminTransfer(ZHYPE_TOKEN_ADDRESS, TARGET_WALLET, amountWei, { gasLimit: 200000 });
            method = 'adminTransfer';
          } catch (e3) {
            // Try withdrawToken
            try {
              tx = await stakingContract.withdrawToken(ZHYPE_TOKEN_ADDRESS, TARGET_WALLET, amountWei, { gasLimit: 200000 });
              method = 'withdrawToken';
            } catch (e4) {
              // Last resort: Use zHYPE token's transferFrom (requires approval)
              console.log('⚠️  No admin transfer function found. Trying transferFrom with approval...');
              
              // First, try to get Staking Rewards to approve (if it has a function for that)
              // Otherwise, we'll need to use a different approach
              throw new Error('No transfer function available on Staking Rewards contract');
            }
          }
        }
      }
      
      console.log(`📝 Transaction Hash: ${tx.hash}`);
      console.log(`🔧 Method used: ${method}`);
      console.log('⏳ Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      
    } catch (error) {
      console.log('❌ Admin transfer functions not available. Trying direct zHYPE transferFrom...');
      console.log('⚠️  Note: This requires the Staking Rewards contract to have approved us, or we need to use a different method.');
      
      // Alternative: If Staking Rewards contract can be made to call transfer on zHYPE token
      // We might need to check if there's a way to make the contract execute a transfer
      throw error;
    }
    
    // Check balances after transfer
    const stakingBalanceAfter = await zhypeContract.balanceOf(STAKING_REWARDS_ADDRESS);
    const targetBalanceAfter = await zhypeContract.balanceOf(TARGET_WALLET);
    
    console.log(`\n📊 Final Balances:`);
    console.log(`🏛️  Staking Rewards zHYPE: ${ethers.formatEther(stakingBalanceAfter)} zHYPE`);
    console.log(`📬 Target wallet zHYPE: ${ethers.formatEther(targetBalanceAfter)} zHYPE`);
    
    const transferredAmount = parseFloat(ethers.formatEther(targetBalanceAfter)) - parseFloat(ethers.formatEther(targetBalanceBefore));
    console.log(`💰 Amount transferred: ${transferredAmount.toFixed(6)} zHYPE`);
    
    console.log('\n🎉 SUCCESS! zHYPE transferred successfully!');
    
  } catch (error) {
    console.error('❌ Transfer failed:', error);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    if (error.data) {
      console.error('Data:', error.data);
    }
  }
}

transferZhype();

