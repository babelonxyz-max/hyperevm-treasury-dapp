import { ethers } from 'ethers';

const WALLET_TO_CHECK = "0x5183edd724b3ffe0f3216cf65827bcf8f92a99df";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

// All possible staking contract addresses found in the codebase
const STAKING_CONTRACTS = [
  "0x716E8c9E464736293EB46B71e81f6e9AA9c09058", // deployed-addresses.json
  "0xdC903501E97920E8016dbAc22b2Eb73407e34F1F", // check-reward-calculation.js
  "0x23e07562ffe1fAD9545Ca8b7C656Cec97E80A64c", // stakingRewardsFixed
  "0xBd8f5961Eeb024ACE3443C93d12Dea3740e28852"  // stakingRewardsSimple
];

const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";

const STAKING_ABI = [
  "function getTotalStaked(address user) external view returns (uint256)",
  "function virtualZhypeStaked(address user) external view returns (uint256)",
  "function getTotalStakedAmount() external view returns (uint256)",
  "function stakeZhype(uint256 amount) external",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

const TREASURY_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function getZHypeTokenAddress() external view returns (address)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

async function diagnoseWallet() {
  console.log(`🔍 Diagnosing wallet: ${WALLET_TO_CHECK}\n`);
  console.log('='.repeat(70));
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // 1. Check zHYPE balance
  console.log('\n📊 1. zHYPE Token Balance:');
  console.log('-'.repeat(70));
  try {
    const treasuryContract = new ethers.Contract(TREASURY_CORE, TREASURY_ABI, provider);
    
    // Get zHYPE token address
    const zhypeTokenAddress = await treasuryContract.getZHypeTokenAddress();
    console.log(`   zHYPE Token Address: ${zhypeTokenAddress}`);
    
    // Get zHYPE balance
    const zhypeBalance = await treasuryContract.balanceOf(WALLET_TO_CHECK);
    console.log(`   ✅ zHYPE Balance: ${ethers.formatEther(zhypeBalance)} zHYPE`);
    
    // Check zHYPE token contract balance (should match)
    const zhypeTokenContract = new ethers.Contract(zhypeTokenAddress, ERC20_ABI, provider);
    const tokenBalance = await zhypeTokenContract.balanceOf(WALLET_TO_CHECK);
    console.log(`   ✅ zHYPE Token Contract Balance: ${ethers.formatEther(tokenBalance)} zHYPE`);
    
    if (zhypeBalance.toString() !== tokenBalance.toString()) {
      console.log(`   ⚠️  WARNING: Balance mismatch between Treasury and Token contract!`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // 2. Check staked balance across all possible contracts
  console.log('\n💎 2. Staked zHYPE Balance (checking all contracts):');
  console.log('-'.repeat(70));
  
  for (const stakingAddress of STAKING_CONTRACTS) {
    try {
      const contractCode = await provider.getCode(stakingAddress);
      if (contractCode === '0x') {
        console.log(`   ⚠️  ${stakingAddress}: No contract code (not deployed)`);
        continue;
      }
      
      const stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, provider);
      
      try {
        const staked = await stakingContract.getTotalStaked(WALLET_TO_CHECK);
        const totalStaked = await stakingContract.getTotalStakedAmount();
        
        console.log(`   📍 ${stakingAddress}:`);
        console.log(`      Staked: ${ethers.formatEther(staked)} zHYPE`);
        console.log(`      Total Contract Staked: ${ethers.formatEther(totalStaked)} zHYPE`);
        
        // Check virtual staked
        try {
          const virtualStaked = await stakingContract.virtualZhypeStaked(WALLET_TO_CHECK);
          if (virtualStaked > 0n) {
            console.log(`      Virtual Staked: ${ethers.formatEther(virtualStaked)} zHYPE`);
          }
        } catch (e) {
          // Virtual staked not available, skip
        }
        
        // Check allowance for this contract
        const treasuryContract = new ethers.Contract(TREASURY_CORE, TREASURY_ABI, provider);
        const allowance = await treasuryContract.allowance(WALLET_TO_CHECK, stakingAddress);
        console.log(`      Allowance: ${ethers.formatEther(allowance)} zHYPE`);
        
        if (staked > 0n) {
          console.log(`      ✅ FOUND STAKED BALANCE!`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${stakingAddress}: Error calling getTotalStaked - ${error.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${stakingAddress}: Error - ${error.message}`);
    }
  }
  
  // 3. Check which contract the frontend is using
  console.log('\n🌐 3. Frontend Configuration:');
  console.log('-'.repeat(70));
  try {
    const fs = await import('fs');
    const deployedAddresses = JSON.parse(fs.readFileSync('./public/deployed-addresses.json', 'utf8'));
    const frontendStakingAddress = deployedAddresses.contracts.stakingRewards;
    console.log(`   Frontend Staking Contract: ${frontendStakingAddress}`);
    
    // Check if this wallet has staked balance in the frontend contract
    const stakingContract = new ethers.Contract(frontendStakingAddress, STAKING_ABI, provider);
    try {
      const staked = await stakingContract.getTotalStaked(WALLET_TO_CHECK);
      console.log(`   Staked in Frontend Contract: ${ethers.formatEther(staked)} zHYPE`);
      
      if (staked === 0n) {
        console.log(`   ⚠️  WARNING: No staked balance found in frontend contract!`);
        console.log(`   💡 This wallet may have staked to a different contract address.`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking frontend contract: ${error.message}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check frontend config: ${error.message}`);
  }
  
  // 4. Check if wallet can stake (allowance check)
  console.log('\n🔐 4. Staking Permissions:');
  console.log('-'.repeat(70));
  try {
    const treasuryContract = new ethers.Contract(TREASURY_CORE, TREASURY_ABI, provider);
    const zhypeBalance = await treasuryContract.balanceOf(WALLET_TO_CHECK);
    
    if (zhypeBalance > 0n) {
      // Check allowance for the frontend contract
      const frontendStakingAddress = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
      const allowance = await treasuryContract.allowance(WALLET_TO_CHECK, frontendStakingAddress);
      
      console.log(`   zHYPE Balance: ${ethers.formatEther(zhypeBalance)} zHYPE`);
      console.log(`   Allowance for ${frontendStakingAddress}: ${ethers.formatEther(allowance)} zHYPE`);
      
      if (allowance < zhypeBalance) {
        console.log(`   ⚠️  WARNING: Insufficient allowance! Wallet needs to approve the staking contract.`);
        console.log(`   💡 User needs to call: approve(${frontendStakingAddress}, ${zhypeBalance})`);
      } else {
        console.log(`   ✅ Sufficient allowance for staking`);
      }
    } else {
      console.log(`   ℹ️  No zHYPE balance to stake`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Diagnosis complete!');
}

diagnoseWallet().catch(console.error);
