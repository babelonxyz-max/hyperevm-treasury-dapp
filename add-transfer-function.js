import { ethers } from 'ethers';
import fs from 'fs';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS_ADDRESS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

async function addTransferFunction() {
  try {
    console.log('🔍 Checking Staking Rewards contract upgradeability...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Check if contract is upgradeable
    const stakingABI = [
      "function owner() external view returns (address)",
      "function upgradeTo(address newImplementation) external",
      "function upgradeToAndCall(address newImplementation, bytes calldata data) external",
      "function implementation() external view returns (address)"
    ];

    const stakingContract = new ethers.Contract(STAKING_REWARDS_ADDRESS, stakingABI, wallet);

    // Verify owner
    const contractOwner = await stakingContract.owner();
    console.log(`🔐 Contract Owner: ${contractOwner}`);
    
    if (wallet.address.toLowerCase() !== contractOwner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      return;
    }

    // Check for upgrade functions
    let isUpgradeable = false;
    try {
      await stakingContract.implementation();
      isUpgradeable = true;
      console.log('✅ Contract appears to be upgradeable (has implementation function)');
    } catch (e) {
      console.log('⚠️  Contract does not have standard upgrade functions');
    }

    if (!isUpgradeable) {
      console.log('\n📝 Creating helper contract to add transfer functionality...');
      console.log('⚠️  Note: Since the contract is not upgradeable, we need to create a helper contract');
      console.log('   that can be called by the Staking Rewards contract owner.');
      console.log('\n💡 Solution: Deploy a helper contract that the owner can use to transfer tokens');
      
      // Create a simple helper contract that can be deployed
      const helperContractCode = `
// Helper contract to transfer tokens from Staking Rewards
// Deploy this and call transferToken function
contract TokenTransferHelper {
    function transferTokenFromContract(
        address tokenContract,
        address fromContract,
        address to,
        uint256 amount
    ) external {
        // This would need to be called by the Staking Rewards contract itself
        // Since we can't modify the contract, we need a different approach
    }
}`;
      
      console.log('\n❌ Cannot directly add function to non-upgradeable contract');
      console.log('\n💡 Alternative Solutions:');
      console.log('1. Check if Staking Rewards contract has any admin functions we missed');
      console.log('2. Create a new Staking Rewards contract with transfer function and migrate');
      console.log('3. Check contract source code for any hidden functions');
      
      return;
    }

    // If upgradeable, proceed with upgrade
    console.log('\n🚀 Contract is upgradeable! Proceeding with upgrade...');
    console.log('⚠️  This requires the contract source code to compile and deploy');
    console.log('   Please ensure you have the original Staking Rewards contract source code');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTransferFunction();

