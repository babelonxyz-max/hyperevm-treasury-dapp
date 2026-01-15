import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";

async function checkUpgradeability() {
  try {
    console.log('🔍 Checking contract upgradeability...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // UUPS pattern: EIP-1967 implementation slot
    const UUPS_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    // Transparent proxy: admin slot
    const TRANSPARENT_ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
    
    async function checkContract(address, name) {
      console.log(`${name} (${address}):`);
      console.log('-'.repeat(60));
      
      const code = await provider.getCode(address);
      console.log(`Code length: ${code.length} bytes`);
      
      // Check for proxy pattern indicators
      if (code.length < 1000) {
        console.log('⚠️  Very short bytecode - likely a proxy');
      }
      
      // Check storage slots
      const uupsImpl = await provider.getStorage(address, UUPS_SLOT);
      const transparentAdmin = await provider.getStorage(address, TRANSPARENT_ADMIN_SLOT);
      
      if (uupsImpl !== ethers.ZeroHash && uupsImpl !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        const implAddr = "0x" + uupsImpl.slice(-40);
        console.log(`✅ UUPS Proxy detected!`);
        console.log(`   Implementation: ${implAddr}`);
        const implCode = await provider.getCode(implAddr);
        console.log(`   Implementation code length: ${implCode.length} bytes`);
        
        // Check implementation for adminMint
        const implABI = ["function adminMint(address,uint256) external"];
        try {
          const implContract = new ethers.Contract(implAddr, implABI, provider);
          const iface = new ethers.Interface(implABI);
          const selector = iface.getFunction("adminMint").selector;
          if (implCode.includes(selector.slice(2).toLowerCase())) {
            console.log(`   ✅ adminMint() EXISTS in implementation!`);
          } else {
            console.log(`   ❌ adminMint() NOT in implementation`);
          }
        } catch (e) {
          console.log(`   ⚠️  Could not check implementation functions`);
        }
      } else if (transparentAdmin !== ethers.ZeroHash && transparentAdmin !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        console.log(`✅ Transparent Proxy detected!`);
        console.log(`   Admin: ${transparentAdmin}`);
      } else {
        console.log('❌ No standard proxy pattern detected');
        console.log('   Contract appears to be directly deployed (not upgradeable)');
      }
      
      // Check for upgrade functions
      const upgradeABI = [
        "function upgradeTo(address) external",
        "function upgradeToAndCall(address,bytes) external",
        "function implementation() view returns(address)",
        "function proxiableUUID() view returns(bytes32)"
      ];
      
      try {
        const contract = new ethers.Contract(address, upgradeABI, provider);
        try {
          const impl = await contract.implementation();
          console.log(`\n✅ Has implementation() function: ${impl}`);
        } catch (e) {}
        
        try {
          const uuid = await contract.proxiableUUID();
          console.log(`✅ Has proxiableUUID() function: ${uuid}`);
        } catch (e) {}
      } catch (e) {
        console.log('   No upgrade functions found in ABI');
      }
      
      console.log('');
    }
    
    await checkContract(TREASURY_CORE, 'Treasury Core');
    await checkContract(STAKING_REWARDS, 'Staking Rewards');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUpgradeability();
