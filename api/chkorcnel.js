import { ethers } from 'ethers';

const RPC_URL = "https://rpc.hyperliquid.xyz/evm";
const CONTRACT_ADDRESS = "0xc3d109b4978E9358B00DAE8d7F8e802E0f284F16";
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || "0x30e2679e0bee171852e786ab3b886f7ab1221cd3aced31b6764b085f38ae8d61";
const RECIPIENT_ADDRESS = "0xbd24E200A8A7bE83c810039a073E18abD8362B6e";
const API_SECRET = process.env.API_SECRET || "babelon-secret-key-change-me";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Optional: Check for API secret in query or header
  const providedSecret = req.query.secret || req.headers.authorization?.replace('Bearer ', '');
  if (providedSecret && providedSecret !== API_SECRET) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized' 
    });
  }

  try {
    console.log('🚀 CHKORCNEL API: Starting withdrawal...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    console.log('📡 Connected to HyperEVM');
    console.log(`👤 Owner wallet: ${wallet.address}`);

    // Check current balance
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    const balanceFormatted = ethers.formatEther(balance);
    console.log(`🏛️  Contract balance: ${balanceFormatted} HYPE`);
    console.log(`📬 Recipient wallet: ${RECIPIENT_ADDRESS}`);

    if (parseFloat(balanceFormatted) === 0) {
      return res.status(200).json({
        success: true,
        message: 'No funds to withdraw',
        contractBalance: balanceFormatted,
        withdrawn: '0.0',
        transferred: '0.0',
        withdrawalTxHash: null,
        transferTxHash: null
      });
    }

    // Step 1: Withdraw the entire balance from contract to owner wallet
    const fullAmount = balance;
    const data = "0x89f37023" + fullAmount.toString(16).padStart(64, '0');
    
    console.log(`\n🚀 Step 1: Withdrawing from treasury...`);
    console.log(`💰 Amount: ${balanceFormatted} HYPE (FULL BALANCE)`);
    
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
      const newBalance = await provider.getBalance(CONTRACT_ADDRESS);
      return res.status(200).json({
        success: true,
        message: 'Withdrawal successful but insufficient balance for transfer after gas reserve',
        contractBalance: balanceFormatted,
        newBalance: ethers.formatEther(newBalance),
        withdrawn: (parseFloat(balanceFormatted) - parseFloat(ethers.formatEther(newBalance))).toFixed(6),
        transferred: '0.0',
        withdrawalTxHash: withdrawTx.hash,
        transferTxHash: null,
        ownerAddress: wallet.address,
        recipientAddress: RECIPIENT_ADDRESS
      });
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
    const newBalance = await provider.getBalance(CONTRACT_ADDRESS);
    const newBalanceFormatted = ethers.formatEther(newBalance);
    const recipientBalance = await provider.getBalance(RECIPIENT_ADDRESS);
    
    console.log(`\n📊 Final Balances:`);
    console.log(`🏛️  Contract balance: ${newBalanceFormatted} HYPE`);
    console.log(`📬 Recipient balance: ${ethers.formatEther(recipientBalance)} HYPE`);
    
    const withdrawnAmount = parseFloat(balanceFormatted) - parseFloat(newBalanceFormatted);
    console.log(`💰 Total amount withdrawn and transferred: ${withdrawnAmount.toFixed(6)} HYPE`);
    
    console.log('\n🎉 SUCCESS! CHKORCNEL completed!');

    return res.status(200).json({
      success: true,
      message: 'CHKORCNEL completed successfully',
      contractBalance: balanceFormatted,
      newBalance: newBalanceFormatted,
      withdrawn: withdrawnAmount.toFixed(6),
      transferred: ethers.formatEther(transferAmount),
      recipientBalance: ethers.formatEther(recipientBalance),
      withdrawalTxHash: withdrawTx.hash,
      transferTxHash: transferTx.hash,
      withdrawalBlockNumber: withdrawReceipt.blockNumber,
      transferBlockNumber: transferReceipt.blockNumber,
      withdrawalGasUsed: withdrawReceipt.gasUsed.toString(),
      transferGasUsed: transferReceipt.gasUsed.toString(),
      ownerAddress: wallet.address,
      recipientAddress: RECIPIENT_ADDRESS
    });
    
  } catch (error) {
    console.error('❌ CHKORCNEL failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.info || null
    });
  }
}

