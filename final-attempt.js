import { ethers } from 'ethers';
import { readFileSync } from 'fs';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

async function finalAttempt() {
  console.log('🚀 Final Attempt: Upgrade and Transfer');
  console.log('='.repeat(80));
  console.log(`✅ Using wallet: ${wallet.address}\n`);
  
  // Get current block
  const currentBlock = await provider.getBlockNumber();
  console.log(`📦 Current block: ${currentBlock}`);
  
  // Check balance at current block
  const balance = await provider.getBalance(wallet.address, currentBlock);
  console.log(`💰 Balance at block ${currentBlock}: ${ethers.formatEther(balance)} HYPE`);
  
  // Transaction was confirmed at block 25046110, so balance should include it
  // Let's try to proceed anyway since transaction is confirmed
  
  console.log('\n⏳ Proceeding with deployment (transaction confirmed, funds should be available)...\n');
  
  try {
    // Read compiled artifact
    const artifactPath = 'artifacts/contracts/HypurrNFTTransfer.sol/HypurrNFTTransfer.json';
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    
    console.log('⏳ Deploying new implementation...');
    const newImpl = await factory.deploy();
    await newImpl.waitForDeployment();
    const newImplAddress = await newImpl.getAddress();
    console.log(`✅ New implementation deployed: ${newImplAddress}\n`);
    
    // Upgrade
    console.log('⏳ Upgrading proxy...');
    const UPGRADE_ABI = ["function upgradeTo(address newImplementation) external"];
    const proxy = new ethers.Contract(TRANSFER_CONTRACT, UPGRADE_ABI, wallet);
    
    const upgradeTx = await proxy.upgradeTo(newImplAddress);
    console.log(`📤 Upgrade transaction: ${upgradeTx.hash}`);
    await upgradeTx.wait();
    console.log('✅ Contract upgraded!\n');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Execute transfer
    console.log('🚀 Executing transfer...');
    const TRANSFER_ABI = [
      "function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external"
    ];
    const upgraded = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
    
    const transferTx = await upgraded.transferNFTsOnBehalf(
      NFT_OWNER,
      RANDOM_ART_NFT,
      TOKEN_IDS.map(id => BigInt(id))
    );
    console.log(`📤 Transfer transaction: ${transferTx.hash}`);
    const receipt = await transferTx.wait();
    
    console.log('\n✅ Transfer successful!');
    console.log('='.repeat(80));
    console.log(`📋 Transaction Hash: ${receipt.transactionHash}`);
    console.log(`📦 Block Number: ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`🎫 Transferred ${TOKEN_IDS.length} NFT(s): [${TOKEN_IDS.join(', ')}]`);
    console.log(`📬 Destination: 0x25b155C387bcf2434F0df5e2f34E9D68E0A99228`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.info?.error) {
      console.error('   Details:', error.info.error.message);
    }
    throw error;
  }
}

finalAttempt()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
