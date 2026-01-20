import { ethers } from 'ethers';
import { execSync } from 'child_process';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

async function deployAndUpgrade() {
  console.log('🔄 Deploying new implementation and upgrading...\n');
  
  // First, compile the contract
  console.log('⏳ Compiling contract...');
  try {
    execSync('npx hardhat compile', { stdio: 'inherit' });
    console.log('✅ Compilation successful\n');
  } catch (e) {
    console.error('❌ Compilation failed');
    process.exit(1);
  }
  
  // Get the compiled bytecode
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  // Read the compiled artifact
  const artifactPath = 'artifacts/contracts/HypurrNFTTransfer.sol/HypurrNFTTransfer.json';
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
  const bytecode = artifact.bytecode;
  const abi = artifact.abi;
  
  console.log('⏳ Deploying new implementation...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const newImpl = await factory.deploy();
  await newImpl.waitForDeployment();
  const newImplAddress = await newImpl.getAddress();
  console.log(`✅ New implementation deployed: ${newImplAddress}\n`);
  
  // Try to upgrade
  console.log('⏳ Upgrading proxy...');
  const UPGRADE_ABI = ["function upgradeTo(address newImplementation) external"];
  const proxy = new ethers.Contract(TRANSFER_CONTRACT, UPGRADE_ABI, wallet);
  
  try {
    const tx = await proxy.upgradeTo(newImplAddress);
    console.log(`📤 Upgrade transaction: ${tx.hash}`);
    await tx.wait();
    console.log('✅ Contract upgraded!\n');
    
    // Now try the transfer
    console.log('🚀 Executing transfer...');
    const TRANSFER_ABI = [
      "function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external"
    ];
    const upgraded = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
    const transferTx = await upgraded.transferNFTsOnBehalf(
      "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83",
      "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f",
      [1, 5, 4, 3, 2].map(id => BigInt(id))
    );
    console.log(`📤 Transfer transaction: ${transferTx.hash}`);
    const receipt = await transferTx.wait();
    console.log('✅ Transfer successful!');
    console.log(`   Hash: ${receipt.transactionHash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
  } catch (e) {
    console.error('❌ Upgrade failed:', e.message);
    process.exit(1);
  }
}

deployAndUpgrade();
