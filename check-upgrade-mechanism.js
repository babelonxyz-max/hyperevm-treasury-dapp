import { ethers } from 'ethers';

const TRANSFER_CONTRACT = "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

// Check storage slot for UUPS implementation (ERC1967)
async function checkStorage() {
  // ERC1967 implementation slot: keccak256("eip1967.proxy.implementation") - 1
  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  
  const impl = await provider.getStorage(TRANSFER_CONTRACT, IMPLEMENTATION_SLOT);
  console.log('Implementation slot value:', impl);
  
  if (impl !== ethers.ZeroHash && impl !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
    const implAddr = "0x" + impl.slice(-40);
    console.log('✅ Found implementation address:', implAddr);
    console.log('   Contract IS a proxy!');
    return implAddr;
  } else {
    console.log('❌ No implementation found - may not be a proxy');
    return null;
  }
}

checkStorage();
