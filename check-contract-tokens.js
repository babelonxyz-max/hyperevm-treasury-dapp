import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

// HYPE token contract (if it exists)
const HYPE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // We need to find this

const TREASURY_ABI = [
  "function getTreasuryBalance() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function owner() external view returns (address)",
  "function getZHypeTokenAddress() external view returns (address)"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function decimals() external view returns (uint8)"
];

async function checkContractTokens() {
  try {
    console.log('🔍 Checking what tokens/currencies the contract actually holds...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    const treasuryContract = new ethers.Contract(CONTRACT_ADDRESS, TREASURY_ABI, wallet);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Check ETH balance (native currency)
    const ethBalance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log(`\n💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
    
    // Check what getTreasuryBalance() returns
    try {
      const treasuryBalance = await treasuryContract.getTreasuryBalance();
      console.log(`🏛️  getTreasuryBalance(): ${ethers.formatEther(treasuryBalance)} (assuming HYPE)`);
    } catch (error) {
      console.log(`❌ getTreasuryBalance() failed: ${error.message}`);
    }
    
    // Check if contract has balanceOf function
    try {
      const balanceOf = await treasuryContract.balanceOf(CONTRACT_ADDRESS);
      console.log(`📊 balanceOf(self): ${ethers.formatEther(balanceOf)} (assuming HYPE)`);
    } catch (error) {
      console.log(`❌ balanceOf(self) failed: ${error.message}`);
    }
    
    // Try to get zHYPE token address
    try {
      const zhypeTokenAddress = await treasuryContract.getZHypeTokenAddress();
      console.log(`🪙 zHYPE Token Address: ${zhypeTokenAddress}`);
      
      // Check zHYPE token balance
      const zhypeContract = new ethers.Contract(zhypeTokenAddress, ERC20_ABI, provider);
      const zhypeBalance = await zhypeContract.balanceOf(CONTRACT_ADDRESS);
      const symbol = await zhypeContract.symbol();
      const name = await zhypeContract.name();
      const decimals = await zhypeContract.decimals();
      
      console.log(`🪙 ${name} (${symbol}) Balance: ${ethers.formatUnits(zhypeBalance, decimals)} ${symbol}`);
      
    } catch (error) {
      console.log(`❌ zHYPE token check failed: ${error.message}`);
    }
    
    // Check if this contract is actually an ERC-20 token itself
    try {
      const symbol = await treasuryContract.symbol();
      const name = await treasuryContract.name();
      const decimals = await treasuryContract.decimals();
      const totalSupply = await treasuryContract.totalSupply();
      
      console.log(`\n🪙 Contract is ERC-20 Token:`);
      console.log(`   Name: ${name}`);
      console.log(`   Symbol: ${symbol}`);
      console.log(`   Decimals: ${decimals}`);
      console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
      
    } catch (error) {
      console.log(`❌ Contract is not an ERC-20 token: ${error.message}`);
    }
    
    // Check owner's ETH balance
    const ownerEthBalance = await provider.getBalance(wallet.address);
    console.log(`\n👤 Owner ETH Balance: ${ethers.formatEther(ownerEthBalance)} ETH`);
    
    // Check owner's HYPE balance (if contract is HYPE token)
    try {
      const ownerHypeBalance = await treasuryContract.balanceOf(wallet.address);
      console.log(`👤 Owner HYPE Balance: ${ethers.formatEther(ownerHypeBalance)} HYPE`);
    } catch (error) {
      console.log(`❌ Could not check owner HYPE balance: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Token check failed:', error);
  }
}

checkContractTokens();






