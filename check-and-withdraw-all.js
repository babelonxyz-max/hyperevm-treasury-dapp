import { ethers } from 'ethers';

const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16"
};

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// Owner private key (you'll need to provide this)
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";

const TREASURY_ABI = [
  "function getTreasuryBalance() external view returns (uint256)",
  "function emergencyWithdrawHype() external",
  "function owner() external view returns (address)"
];

async function checkAndWithdrawAll() {
  try {
    console.log('💰 Checking treasury balance and withdrawing all...');
    
    if (OWNER_PRIVATE_KEY === "YOUR_PRIVATE_KEY_HERE") {
      console.log('❌ Please set OWNER_PRIVATE_KEY environment variable or update the script');
      console.log('   Example: OWNER_PRIVATE_KEY=0x... node check-and-withdraw-all.js');
      process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, TREASURY_ABI, wallet);

    // Check current treasury balance
    console.log('\n📊 Current Treasury Status:');
    const treasuryBalance = await treasuryContract.getTreasuryBalance();
    const treasuryBalanceFormatted = ethers.formatEther(treasuryBalance);
    console.log(`🏛️  Treasury Balance: ${treasuryBalanceFormatted} HYPE`);

    if (treasuryBalance === 0n) {
      console.log('❌ Treasury is empty - nothing to withdraw');
      process.exit(0);
    }

    // Verify owner
    const contractOwner = await treasuryContract.owner();
    console.log(`🔐 Contract Owner: ${contractOwner}`);
    
    if (wallet.address.toLowerCase() !== contractOwner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      process.exit(1);
    }

    console.log('✅ Owner verification passed');

    // Get owner's current balance
    const ownerBalance = await provider.getBalance(wallet.address);
    console.log(`💼 Owner Balance Before: ${ethers.formatEther(ownerBalance)} HYPE`);

    // Show what we're about to withdraw
    console.log(`\n🚀 About to withdraw ${treasuryBalanceFormatted} HYPE from treasury...`);
    console.log('⚠️  This will withdraw ALL treasury balance!');

    // Withdraw treasury
    console.log('\n🚀 Withdrawing ALL treasury balance...');
    const tx = await treasuryContract.emergencyWithdrawHype({
      gasLimit: 200000
    });
    
    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

    // Check new balances
    const newTreasuryBalance = await treasuryContract.getTreasuryBalance();
    const newOwnerBalance = await provider.getBalance(wallet.address);
    
    console.log('\n📊 Updated Balances:');
    console.log(`🏛️  Treasury Balance: ${ethers.formatEther(newTreasuryBalance)} HYPE`);
    console.log(`💼 Owner Balance After: ${ethers.formatEther(newOwnerBalance)} HYPE`);
    
    const withdrawnAmount = treasuryBalanceFormatted;
    const balanceIncrease = ethers.formatEther(newOwnerBalance - ownerBalance);
    
    console.log(`\n🎉 Successfully withdrew ${withdrawnAmount} HYPE to owner!`);
    console.log(`📈 Owner balance increased by: ${balanceIncrease} HYPE`);

    if (newTreasuryBalance === 0n) {
      console.log('✅ Treasury is now completely empty');
    } else {
      console.log(`⚠️  Treasury still has ${ethers.formatEther(newTreasuryBalance)} HYPE remaining`);
    }

  } catch (error) {
    console.error('❌ Withdrawal failed:', error);
    process.exit(1);
  }
}

checkAndWithdrawAll();






