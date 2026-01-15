import { ethers } from 'ethers';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const ZHYPE_TOKEN = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

/**
 * Automated script to:
 * 1. Check if contract is upgradeable
 * 2. Compile upgrade contract (if needed)
 * 3. Deploy new implementation
 * 4. Upgrade existing contract
 * 5. Transfer zHYPE tokens
 */
async function autoUpgradeAndTransfer() {
  try {
    console.log('🚀 Automated Upgrade & Transfer Script');
    console.log('='.repeat(60));
    console.log(`📋 Staking Rewards: ${STAKING_REWARDS}`);
    console.log(`📋 zHYPE Token: ${ZHYPE_TOKEN}`);
    console.log(`📬 Target Wallet: ${TARGET_WALLET}\n`);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log(`👤 Owner: ${wallet.address}\n`);
    
    // Step 1: Check zHYPE balance
    console.log('📊 Step 1: Checking zHYPE balance...');
    const zhypeABI = ["function balanceOf(address) view returns(uint256)"];
    const zhypeContract = new ethers.Contract(ZHYPE_TOKEN, zhypeABI, provider);
    const stakingBalance = await zhypeContract.balanceOf(STAKING_REWARDS);
    console.log(`✅ Staking Rewards holds: ${ethers.formatEther(stakingBalance)} zHYPE\n`);
    
    if (stakingBalance === 0n) {
      console.log('❌ No zHYPE to transfer');
      return;
    }
    
    // Step 2: Verify contract ownership
    console.log('🔐 Step 2: Verifying contract ownership...');
    const ownerABI = ["function owner() view returns(address)"];
    const stakingContract = new ethers.Contract(STAKING_REWARDS, ownerABI, provider);
    const contractOwner = await stakingContract.owner();
    
    if (wallet.address.toLowerCase() !== contractOwner.toLowerCase()) {
      console.log('❌ Wallet is not the contract owner');
      return;
    }
    console.log('✅ Ownership verified\n');
    
    // Step 3: Check if upgradeable
    console.log('🔍 Step 3: Checking upgradeability...');
    const upgradeABI = [
      "function upgradeTo(address) external",
      "function implementation() view returns(address)"
    ];
    
    const upgradeContract = new ethers.Contract(STAKING_REWARDS, upgradeABI, wallet);
    
    let isUpgradeable = false;
    try {
      await upgradeContract.implementation();
      isUpgradeable = true;
      console.log('✅ Contract has implementation() - is upgradeable');
    } catch (e) {
      // Try upgradeTo directly
      try {
        await upgradeContract.upgradeTo.estimateGas("0x0000000000000000000000000000000000000000");
        isUpgradeable = true;
        console.log('✅ Contract has upgradeTo() - is upgradeable');
      } catch (e2) {
        console.log('❌ Contract does not appear to be upgradeable');
        console.log('   Cannot add transferToken function');
        return;
      }
    }
    
    if (!isUpgradeable) {
      console.log('\n❌ Contract is not upgradeable. Cannot proceed.');
      console.log('💡 Alternative: Need to check contract source code for other methods');
      return;
    }
    
    console.log('\n⚠️  IMPORTANT: To complete the upgrade, we need to:');
    console.log('   1. Compile StakingRewardsUpgradeableV2.sol');
    console.log('   2. Deploy new implementation');
    console.log('   3. Call upgradeTo(newImplementation)');
    console.log('   4. Call transferToken() to move zHYPE\n');
    
    // Check if we have compilation tools
    console.log('🔧 Step 4: Checking for compilation tools...');
    let hasHardhat = false;
    let hasFoundry = false;
    let hasSolc = false;
    
    try {
      await execAsync('which hardhat');
      hasHardhat = true;
      console.log('✅ Hardhat found');
    } catch (e) {
      console.log('❌ Hardhat not found');
    }
    
    try {
      await execAsync('which forge');
      hasFoundry = true;
      console.log('✅ Foundry found');
    } catch (e) {
      console.log('❌ Foundry not found');
    }
    
    try {
      await execAsync('which solc');
      hasSolc = true;
      console.log('✅ solc found');
    } catch (e) {
      console.log('❌ solc not found');
    }
    
    if (!hasHardhat && !hasFoundry && !hasSolc) {
      console.log('\n⚠️  No Solidity compiler found!');
      console.log('\n📝 Manual Steps Required:');
      console.log('='.repeat(60));
      console.log('1. Install Hardhat or Foundry:');
      console.log('   npm install --save-dev hardhat');
      console.log('   OR');
      console.log('   curl -L https://foundry.paradigm.xyz | bash');
      console.log('');
      console.log('2. Compile the contract:');
      console.log('   npx hardhat compile');
      console.log('   OR');
      console.log('   forge build');
      console.log('');
      console.log('3. Run this script again, or use the manual upgrade script');
      console.log('');
      console.log('💡 Alternative: Use Remix IDE to compile and deploy');
      return;
    }
    
    // Try to compile
    console.log('\n📦 Step 5: Compiling upgrade contract...');
    if (hasHardhat) {
      try {
        console.log('   Using Hardhat to compile...');
        // Check if hardhat.config.js exists
        if (!fs.existsSync('hardhat.config.js') && !fs.existsSync('hardhat.config.ts')) {
          console.log('   ⚠️  No Hardhat config found. Creating basic setup...');
          // We could create a basic hardhat config, but for now, let's guide the user
          console.log('   Please set up Hardhat first or use manual compilation');
          return;
        }
        const { stdout } = await execAsync('npx hardhat compile');
        console.log('✅ Compilation successful');
      } catch (e) {
        console.log('❌ Compilation failed:', e.message);
        console.log('   Please compile manually and try again');
        return;
      }
    }
    
    console.log('\n⚠️  Automated compilation and deployment requires:');
    console.log('   1. Hardhat/Foundry setup with dependencies');
    console.log('   2. OpenZeppelin contracts installed');
    console.log('   3. Proper contract structure');
    console.log('\n💡 Creating manual upgrade script instead...');
    
    // Create a manual upgrade script
    createManualUpgradeScript();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function createManualUpgradeScript() {
  const script = `import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const ZHYPE_TOKEN = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const TARGET_WALLET = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

// STEP 1: After compiling StakingRewardsUpgradeableV2.sol, 
// get the bytecode and ABI, then set them here:
const NEW_IMPLEMENTATION_BYTECODE = "0x..."; // Paste compiled bytecode here
const NEW_IMPLEMENTATION_ABI = [...]; // Paste ABI here

async function upgradeAndTransfer() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log('🚀 Step 1: Deploying new implementation...');
  const factory = new ethers.ContractFactory(NEW_IMPLEMENTATION_ABI, NEW_IMPLEMENTATION_BYTECODE, wallet);
  const newImpl = await factory.deploy();
  await newImpl.waitForDeployment();
  const newImplAddress = await newImpl.getAddress();
  console.log(\`✅ New implementation deployed: \${newImplAddress}\`);
  
  console.log('\\n🚀 Step 2: Upgrading contract...');
  const upgradeABI = ["function upgradeTo(address) external"];
  const staking = new ethers.Contract(STAKING_REWARDS, upgradeABI, wallet);
  const upgradeTx = await staking.upgradeTo(newImplAddress);
  await upgradeTx.wait();
  console.log(\`✅ Contract upgraded! Tx: \${upgradeTx.hash}\`);
  
  console.log('\\n🚀 Step 3: Transferring zHYPE...');
  const transferABI = ["function transferToken(address,address,uint256) external"];
  const upgraded = new ethers.Contract(STAKING_REWARDS, transferABI, wallet);
  const zhypeABI = ["function balanceOf(address) view returns(uint256)"];
  const zhype = new ethers.Contract(ZHYPE_TOKEN, zhypeABI, provider);
  const balance = await zhype.balanceOf(STAKING_REWARDS);
  
  const transferTx = await upgraded.transferToken(ZHYPE_TOKEN, TARGET_WALLET, balance);
  await transferTx.wait();
  console.log(\`✅ zHYPE transferred! Tx: \${transferTx.hash}\`);
  console.log(\`✅ \${ethers.formatEther(balance)} zHYPE sent to \${TARGET_WALLET}\`);
}

upgradeAndTransfer();
`;

  fs.writeFileSync('manual-upgrade-and-transfer.js', script);
  console.log('\n✅ Created manual-upgrade-and-transfer.js');
  console.log('   Fill in the bytecode and ABI after compilation, then run it');
}

autoUpgradeAndTransfer();
