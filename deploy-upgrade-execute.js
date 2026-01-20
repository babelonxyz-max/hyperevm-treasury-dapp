import { ethers } from 'ethers';
import { readFileSync } from 'fs';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const NFT_OWNER = "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83";
const RANDOM_ART_NFT = "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
const TOKEN_IDS = [1, 5, 4, 3, 2];

async function deployUpgradeAndTransfer() {
  console.log('🚀 Deploying, Upgrading, and Transferring NFTs');
  console.log('='.repeat(80));
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  
  console.log(`✅ Using wallet: ${wallet.address}`);
  console.log('');
  
  try {
    // Read compiled artifact
    console.log('📖 Reading compiled contract...');
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
    
    // Check if contract has upgradeTo
    console.log('🔍 Checking for upgradeTo function...');
    const UPGRADE_ABI = ["function upgradeTo(address newImplementation) external"];
    const proxy = new ethers.Contract(TRANSFER_CONTRACT, UPGRADE_ABI, wallet);
    
    try {
      console.log('⏳ Upgrading proxy...');
      const upgradeTx = await proxy.upgradeTo(newImplAddress);
      console.log(`📤 Upgrade transaction: ${upgradeTx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      await upgradeTx.wait();
      console.log('✅ Contract upgraded!\n');
      
      // Wait a bit for the upgrade to propagate
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Now execute transfer
      console.log('🚀 Executing transfer with transferNFTsOnBehalf...');
      const TRANSFER_ABI = [
        "function transferNFTsOnBehalf(address owner, address nftContract, uint256[] calldata tokenIds) external",
        "function paused() external view returns (bool)"
      ];
      const upgraded = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, wallet);
      
      const isPaused = await upgraded.paused();
      if (isPaused) {
        console.error('❌ Contract is paused!');
        process.exit(1);
      }
      
      const transferTx = await upgraded.transferNFTsOnBehalf(
        NFT_OWNER,
        RANDOM_ART_NFT,
        TOKEN_IDS.map(id => BigInt(id))
      );
      console.log(`📤 Transfer transaction: ${transferTx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      const receipt = await transferTx.wait();
      
      console.log('');
      console.log('✅ Transfer successful!');
      console.log('='.repeat(80));
      console.log(`📋 Transaction Hash: ${receipt.transactionHash}`);
      console.log(`📦 Block Number: ${receipt.blockNumber}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(`📬 Destination: 0x25b155C387bcf2434F0df5e2f34E9D68E0A99228`);
      console.log(`🎫 Transferred ${TOKEN_IDS.length} NFT(s): [${TOKEN_IDS.join(', ')}]`);
      console.log('');
      
    } catch (upgradeError) {
      console.error('❌ Upgrade failed:', upgradeError.message);
      if (upgradeError.message.includes('upgradeTo')) {
        console.error('   Contract may not have upgradeTo function or may not be upgradeable');
      }
      throw upgradeError;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
    process.exit(1);
  }
}

deployUpgradeAndTransfer()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
