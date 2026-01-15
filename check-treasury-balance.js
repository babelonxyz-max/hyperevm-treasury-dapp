import { ethers } from 'ethers';

const CONTRACT_ADDRESSES = {
  treasuryCore: "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16"
};

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

const TREASURY_ABI = [
  "function getTreasuryBalance() external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function owner() external view returns (address)"
];

async function checkTreasuryBalance() {
  try {
    console.log('💰 Checking current treasury balance...');
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log('📡 Connected to HyperEVM');

    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESSES.treasuryCore, TREASURY_ABI, provider);

    // Check current treasury balance
    const treasuryBalance = await treasuryContract.getTreasuryBalance();
    const totalSupply = await treasuryContract.totalSupply();
    const owner = await treasuryContract.owner();
    
    console.log('\n📊 Treasury Status:');
    console.log('==================');
    console.log(`🏛️  Treasury Balance: ${ethers.formatEther(treasuryBalance)} HYPE`);
    console.log(`🪙  Total zHYPE Supply: ${ethers.formatEther(totalSupply)} zHYPE`);
    console.log(`👤 Contract Owner: ${owner}`);
    
    if (treasuryBalance > 0n) {
      console.log(`\n✅ Treasury has ${ethers.formatEther(treasuryBalance)} HYPE available for withdrawal`);
    } else {
      console.log(`\n❌ Treasury is empty`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkTreasuryBalance();






