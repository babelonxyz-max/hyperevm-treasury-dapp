import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const STAKING_REWARDS = "0x716E8c9E464736293EB46B71e81f6e9AA9c09058";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

async function analyzeBytecode() {
  try {
    console.log('🔍 Analyzing contract bytecode for functions...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    // Function selectors to check
    const functionsToCheck = {
      treasury: [
        { name: 'adminMint', sig: 'adminMint(address,uint256)', expected: '0xe58306f9' },
        { name: 'upgradeTo', sig: 'upgradeTo(address)', expected: '0x3659cfe6' },
        { name: 'upgradeToAndCall', sig: 'upgradeToAndCall(address,bytes)', expected: '0x4f1ef286' },
        { name: 'depositHype', sig: 'depositHype()', expected: '0x62614715' },
        { name: 'owner', sig: 'owner()', expected: '0x8da5cb5b' },
        { name: 'pause', sig: 'pause()', expected: '0x8456cb59' },
        { name: 'unpause', sig: 'unpause()', expected: '0x3f4ba83a' },
      ],
      staking: [
        { name: 'transferToken', sig: 'transferToken(address,address,uint256)', expected: null },
        { name: 'adminTransfer', sig: 'adminTransfer(address,address,uint256)', expected: null },
        { name: 'emergencyWithdraw', sig: 'emergencyWithdraw(address,address,uint256)', expected: null },
        { name: 'upgradeTo', sig: 'upgradeTo(address)', expected: '0x3659cfe6' },
        { name: 'owner', sig: 'owner()', expected: '0x8da5cb5b' },
      ]
    };
    
    async function checkContract(address, name, functions) {
      console.log(`${name} (${address}):`);
      console.log('='.repeat(60));
      
      const code = await provider.getCode(address);
      const codeLower = code.toLowerCase();
      
      console.log(`Bytecode length: ${code.length} bytes\n`);
      
      console.log('Checking function selectors:');
      console.log('-'.repeat(60));
      
      for (const func of functions) {
        let selector = func.expected;
        if (!selector) {
          // Calculate selector
          const iface = new ethers.Interface([`function ${func.sig} external`]);
          try {
            selector = iface.getFunction(func.name.split('(')[0]).selector;
          } catch (e) {
            console.log(`  ⚠️  ${func.name}: Could not calculate selector`);
            continue;
          }
        }
        
        const selectorHex = selector.slice(2).toLowerCase();
        const found = codeLower.includes(selectorHex);
        
        if (found) {
          console.log(`  ✅ ${func.name} (${selector}) - FOUND`);
        } else {
          console.log(`  ❌ ${func.name} (${selector}) - NOT FOUND`);
        }
      }
      
      // Try to call upgrade functions if they exist
      console.log('\nTesting upgrade functions:');
      console.log('-'.repeat(60));
      
      const upgradeABI = [
        "function upgradeTo(address) external",
        "function upgradeToAndCall(address,bytes) external",
        "function implementation() view returns(address)"
      ];
      
      try {
        const contract = new ethers.Contract(address, upgradeABI, wallet);
        
        try {
          const impl = await contract.implementation();
          console.log(`  ✅ implementation() returns: ${impl}`);
        } catch (e) {
          console.log(`  ❌ implementation() not callable`);
        }
        
        // Check if we can estimate gas for upgradeTo (means function exists)
        try {
          await contract.upgradeTo.estimateGas("0x0000000000000000000000000000000000000000");
          console.log(`  ✅ upgradeTo() exists and is callable`);
        } catch (e) {
          if (e.message.includes('function')) {
            console.log(`  ❌ upgradeTo() does not exist`);
          } else {
            console.log(`  ⚠️  upgradeTo() exists but may have restrictions`);
          }
        }
      } catch (e) {
        console.log(`  ⚠️  Could not test upgrade functions`);
      }
      
      console.log('\n');
    }
    
    await checkContract(TREASURY_CORE, 'Treasury Core', functionsToCheck.treasury);
    await checkContract(STAKING_REWARDS, 'Staking Rewards', functionsToCheck.staking);
    
    console.log('\n📝 SUMMARY:');
    console.log('='.repeat(60));
    console.log('If adminMint is NOT in bytecode but contracts are upgradeable:');
    console.log('  1. Contracts may need to be upgraded to add adminMint');
    console.log('  2. Implementation contract may have adminMint but proxy does not');
    console.log('  3. Need to check implementation address if using proxy pattern');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzeBytecode();
