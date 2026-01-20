import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CONTRACT = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const OWNER_WALLET = "0x29c1319f090c52e61c7099FD400234Fe83a82bB7";

async function sendHypeToTreasury() {
  try {
    console.log('🚀 Sending HYPE to Treasury Contract...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);
    console.log(`🏛️  Treasury contract: ${TREASURY_CONTRACT}\n`);

    // Check owner balance
    const ownerBalance = await provider.getBalance(OWNER_WALLET);
    const ownerBalanceFormatted = ethers.formatEther(ownerBalance);
    console.log(`💰 Owner balance: ${ownerBalanceFormatted} HYPE`);

    if (parseFloat(ownerBalanceFormatted) === 0) {
      console.log('⚠️  Owner wallet has 0 HYPE - nothing to send');
      return;
    }

    // Check treasury balance before
    const treasuryBalanceBefore = await provider.getBalance(TREASURY_CONTRACT);
    const treasuryBalanceBeforeFormatted = ethers.formatEther(treasuryBalanceBefore);
    console.log(`🏛️  Treasury balance (before): ${treasuryBalanceBeforeFormatted} HYPE\n`);

    // Reserve some HYPE for gas (0.01 HYPE should be enough)
    const gasReserve = ethers.parseEther("0.01");
    const transferAmount = ownerBalance - gasReserve;

    if (transferAmount <= 0n) {
      console.log('⚠️  Insufficient balance after gas reserve');
      return;
    }

    console.log(`📤 Depositing ${ethers.formatEther(transferAmount)} HYPE to treasury...`);
    console.log(`⛽ Reserving ${ethers.formatEther(gasReserve)} HYPE for gas\n`);

    // Treasury Core ABI
    const treasuryABI = [
      "function depositHype() external payable",
      "function getTreasuryBalance() external view returns (uint256)"
    ];

    const treasuryContract = new ethers.Contract(TREASURY_CONTRACT, treasuryABI, wallet);

    // Deposit HYPE using depositHype() function
    const tx = await treasuryContract.depositHype({
      value: transferAmount,
      gasLimit: 300000
    });

    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}\n`);

    // Check balances after
    const ownerBalanceAfter = await provider.getBalance(OWNER_WALLET);
    const treasuryBalanceAfter = await provider.getBalance(TREASURY_CONTRACT);
    
    console.log('📊 Final Balances:');
    console.log(`👤 Owner balance: ${ethers.formatEther(ownerBalanceAfter)} HYPE`);
    console.log(`🏛️  Treasury balance: ${ethers.formatEther(treasuryBalanceAfter)} HYPE`);
    
    const transferred = parseFloat(ethers.formatEther(treasuryBalanceAfter)) - parseFloat(treasuryBalanceBeforeFormatted);
    console.log(`\n✅ Successfully transferred ${transferred.toFixed(6)} HYPE to treasury!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) {
      console.error('   Reason:', error.reason);
    }
  }
}

sendHypeToTreasury();
