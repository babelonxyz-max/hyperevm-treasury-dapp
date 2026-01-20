import { ethers } from 'ethers';
import { readFileSync } from 'fs';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

async function upgradeAndTransfer() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log('🚀 Upgrading and Transferring NFTs');
  console.log('='.repeat(80));
  console.log(`✅ Using wallet: ${wallet.address}\n`);
  
  // Deploy new implementation
  console.log('⏳ Deploying new implementation...');
  const artifact = JSON.parse(readFileSync('artifacts/contracts/HypurrNFTTransfer.sol/HypurrNFTTransfer.json', 'utf8'));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const newImpl = await factory.deploy();
  await newImpl.waitForDeployment();
  const newImplAddress = await newImpl.getAddress();
  console.log(`✅ New implementation: ${newImplAddress}\n`);
  
  // Try upgradeTo with proper UUPS pattern
  console.log('⏳ Upgrading contract...');
  const UUPS_ABI = [
    "function upgradeTo(address newImplementation) external",
    "function upgradeToAndCall(address newImplementation, bytes memory data) external"
  ];
  
  const proxy = new ethers.Contract(TRANSFER_CONTRACT, UUPS_ABI, wallet);
  
  try {
    // Try upgradeToAndCall with empty data
    const upgradeTx = await proxy.upgradeToAndCall(newImplAddress, "0x");
    console.log(`📤 Upgrade transaction: ${upgradeTx.hash}`);
    await upgradeTx.wait();
    console.log('✅ Contract upgraded!\n');
    
    // Execute transfer
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for upgrade
    
    console.log('🚀 Executing transfer...');
    const TRANSFER_ABI = ["function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external"];
    const upgraded = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
    
    const transferTx = await upgraded.transferNFTsOnBehalf(
      NFT_OWNER,
      RANDOM_ART_NFT,
      TOKEN_IDS.map(id => BigInt(id))
    );
    console.log(`📤 Transfer transaction: ${transferTx.hash}`);
    const receipt = await transferTx.wait();
    
    console.log('\n✅ Transfer successful!');
    console.log(`   Hash: ${receipt.transactionHash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas: ${receipt.gasUsed.toString()}`);
    
  } catch (e) {
    console.error('❌ Failed:', e.message);
    if (e.data) console.error('   Data:', e.data);
    process.exit(1);
  }
}

upgradeAndTransfer();
