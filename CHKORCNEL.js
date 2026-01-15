import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const RECIPIENT_ADDRESS = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";

async function CHKORCNEL() {
  try {
    console.log('🚀 CHKORCNEL: Withdrawal and transfer to recipient...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);
    console.log(`📬 Recipient wallet: ${RECIPIENT_ADDRESS}`);

    // Check current balance
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log(`🏛️  Contract balance: ${ethers.formatEther(balance)} HYPE`);

    if (parseFloat(ethers.formatEther(balance)) === 0) {
      console.log('⚠️  Contract balance is 0 - nothing to withdraw');
      return;
    }

    // Step 1: Withdraw the entire balance from contract to owner wallet
    const fullAmount = balance;
    const data = "0x89f37023" + fullAmount.toString(16).padStart(64, '0');
    
    console.log(`\n🚀 Step 1: Withdrawing from treasury...`);
    console.log(`💰 Amount: ${ethers.formatEther(fullAmount)} HYPE (FULL BALANCE)`);
    
    const withdrawTx = await wallet.sendTransaction({
      to: CONTRACT_ADDRESS,
      data: data,
      gasLimit: 500000
    });
    
    console.log(`📝 Withdrawal Transaction Hash: ${withdrawTx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    const withdrawReceipt = await withdrawTx.wait();
    console.log(`✅ Withdrawal confirmed in block ${withdrawReceipt.blockNumber}`);
    console.log(`⛽ Gas used: ${withdrawReceipt.gasUsed.toString()}`);
    
    // Check owner balance after withdrawal
    const ownerBalance = await provider.getBalance(wallet.address);
    const ownerBalanceFormatted = ethers.formatEther(ownerBalance);
    console.log(`💼 Owner balance after withdrawal: ${ownerBalanceFormatted} HYPE`);
    
    // Step 2: Transfer funds to recipient (leave some for gas)
    const gasEstimate = ethers.parseEther("0.001"); // Reserve 0.001 HYPE for gas
    const transferAmount = ownerBalance - gasEstimate;
    
    if (transferAmount <= 0n) {
      console.log('⚠️  Insufficient balance to transfer after gas reserve');
      return;
    }
    
    console.log(`\n🚀 Step 2: Transferring to recipient...`);
    console.log(`💰 Transfer amount: ${ethers.formatEther(transferAmount)} HYPE`);
    
    const transferTx = await wallet.sendTransaction({
      to: RECIPIENT_ADDRESS,
      value: transferAmount,
      gasLimit: 21000
    });
    
    console.log(`📝 Transfer Transaction Hash: ${transferTx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    const transferReceipt = await transferTx.wait();
    console.log(`✅ Transfer confirmed in block ${transferReceipt.blockNumber}`);
    console.log(`⛽ Gas used: ${transferReceipt.gasUsed.toString()}`);
    
    // Check final balances
    const newContractBalance = await provider.getBalance(CONTRACT_ADDRESS);
    const recipientBalance = await provider.getBalance(RECIPIENT_ADDRESS);
    
    console.log(`\n📊 Final Balances:`);
    console.log(`🏛️  Contract balance: ${ethers.formatEther(newContractBalance)} HYPE`);
    console.log(`📬 Recipient balance: ${ethers.formatEther(recipientBalance)} HYPE`);
    
    const withdrawnAmount = parseFloat(ethers.formatEther(balance)) - parseFloat(ethers.formatEther(newContractBalance));
    console.log(`💰 Total amount withdrawn and transferred: ${withdrawnAmount.toFixed(6)} HYPE`);
    
    console.log('\n🎉 SUCCESS! CHKORCNEL completed!');
    
  } catch (error) {
    console.error('❌ CHKORCNEL failed:', error);
  }
}

CHKORCNEL();