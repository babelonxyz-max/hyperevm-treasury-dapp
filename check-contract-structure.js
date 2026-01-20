import { ethers } from 'ethers';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function checkContract() {
  // Check if it has upgradeTo function
  const UPGRADE_ABI = [
    "function upgradeTo(address newImplementation) external",
    "function upgradeToAndCall(address newImplementation, bytes memory data) external",
    "function implementation() external view returns (address)",
    "function proxiableUUID() external view returns (bytes32)",
    "function owner() external view returns (address)"
  ];
  
  try {
    const contract = new ethers.Contract(TRANSFER_CONTRACT, UPGRADE_ABI, provider);
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
    
    try {
      const impl = await contract.implementation();
      console.log('Implementation address:', impl);
      console.log('✅ Has implementation() - likely UUPS proxy');
    } catch (e) {
      console.log('❌ No implementation() function');
    }
    
    try {
      const uuid = await contract.proxiableUUID();
      console.log('Proxiable UUID:', uuid);
      console.log('✅ Has proxiableUUID() - confirmed UUPS');
    } catch (e) {
      console.log('❌ No proxiableUUID() - may not be UUPS');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

checkContract();
