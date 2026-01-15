import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const TREASURY_CORE = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";

async function checkAllMintOptions() {
  try {
    console.log('🔍 Checking all possible minting options...\n');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    // Get contract bytecode
    const code = await provider.getCode(TREASURY_CORE);
    console.log(`Contract bytecode length: ${code.length} bytes\n`);
    
    // Common minting function selectors
    const mintFunctions = [
      { name: 'adminMint(address,uint256)', sig: 'adminMint(address,uint256)' },
      { name: 'mint(address,uint256)', sig: 'mint(address,uint256)' },
      { name: 'mintTo(address,uint256)', sig: 'mintTo(address,uint256)' },
      { name: 'mintTokens(address,uint256)', sig: 'mintTokens(address,uint256)' },
      { name: 'adminMintTo(address,uint256)', sig: 'adminMintTo(address,uint256)' },
    ];
    
    console.log('Checking for mint function selectors in bytecode:');
    console.log('-'.repeat(60));
    
    for (const func of mintFunctions) {
      const iface = new ethers.Interface([`function ${func.sig} external`]);
      try {
        const selector = iface.getFunction(func.name.split('(')[0]).selector;
        const selectorHex = selector.slice(2);
        
        if (code.toLowerCase().includes(selectorHex.toLowerCase())) {
          console.log(`✅ Found: ${func.name} (selector: ${selector})`);
        } else {
          console.log(`❌ Not found: ${func.name}`);
        }
      } catch (e) {
        console.log(`❌ Error checking: ${func.name}`);
      }
    }
    
    // Check for common access control patterns
    console.log('\n\nChecking for access control patterns:');
    console.log('-'.repeat(60));
    
    const accessControlFunctions = [
      'onlyOwner',
      'hasRole',
      'isAdmin',
      'isMinter'
    ];
    
    // Check if contract has role-based access
    const roleABI = [
      "function hasRole(bytes32 role, address account) external view returns (bool)",
      "function MINTER_ROLE() external view returns (bytes32)",
      "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)"
    ];
    
    try {
      const contract = new ethers.Contract(TREASURY_CORE, roleABI, provider);
      try {
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        console.log(`✅ Contract uses role-based access control`);
        console.log(`   DEFAULT_ADMIN_ROLE: ${adminRole}`);
        
        const hasAdminRole = await contract.hasRole(adminRole, wallet.address);
        console.log(`   Wallet has admin role: ${hasAdminRole}`);
        
        try {
          const minterRole = await contract.MINTER_ROLE();
          console.log(`   MINTER_ROLE: ${minterRole}`);
          const hasMinterRole = await contract.hasRole(minterRole, wallet.address);
          console.log(`   Wallet has minter role: ${hasMinterRole}`);
        } catch (e) {
          console.log(`   No MINTER_ROLE found`);
        }
      } catch (e) {
        console.log(`❌ Not using standard role-based access control`);
      }
    } catch (e) {
      console.log(`❌ Cannot check access control`);
    }
    
    console.log('\n\n📝 SUMMARY:');
    console.log('='.repeat(60));
    console.log('If adminMint selector is found but function reverts:');
    console.log('  1. Function may have additional modifiers/checks');
    console.log('  2. Contract state may prevent minting');
    console.log('  3. Need contract source code to verify implementation');
    console.log('\n💡 RECOMMENDATION:');
    console.log('  - Get Treasury Core contract source code');
    console.log('  - Check if adminMint has additional requirements');
    console.log('  - Verify contract state allows minting');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllMintOptions();
