import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://rpc.hyperliquid.xyz/evm";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DESTINATION_WALLET = process.env.DESTINATION_WALLET || "0x25b155C387bcf2434F0df5e2f34E9D68E0A99228";

if (!PRIVATE_KEY) {
  console.error('❌ ERROR: PRIVATE_KEY environment variable not set!');
  process.exit(1);
}

async function deploy() {
  console.log('🚀 Deploying HypurrNFTTransferWithSignature contract...');
  console.log('📋 Destination Wallet:', DESTINATION_WALLET);
  console.log('🌐 RPC URL:', RPC_URL);
  console.log('');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log('✅ Deployer:', wallet.address);
  console.log('');

  // Read contract source
  const contractPath = join(__dirname, '../contracts/HypurrNFTTransferWithSignature.sol');
  console.log('📄 Reading contract from:', contractPath);
  
  // For now, we'll compile and deploy using Hardhat
  console.log('');
  console.log('💡 To deploy this contract, use Hardhat:');
  console.log('');
  console.log('   npx hardhat compile');
  console.log('   npx hardhat run scripts/deploy-transfer-with-signature-hardhat.js --network hyperevm');
  console.log('');
  console.log('Or deploy via Remix with:');
  console.log('   - Contract: HypurrNFTTransferWithSignature.sol');
  console.log('   - Constructor param:', DESTINATION_WALLET);
  console.log('');
}

deploy()
  .then(() => {
    console.log('✅ Deployment instructions provided');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
