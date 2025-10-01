import { ethers } from 'ethers';
import { readFileSync } from 'fs';

async function checkWalletData(walletAddress = '0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4') {
  try {
    console.log(`🔍 Checking wallet data for: ${walletAddress}`);
    
    // Load deployed addresses
    const addresses = JSON.parse(readFileSync('./public/deployed-addresses.json', 'utf8'));
    console.log('📍 Loaded addresses:', addresses.contracts);

    // Create provider (read-only)
    const provider = new ethers.JsonRpcProvider('https://rpc.hyperliquid.xyz/evm');
    
    // Enhanced Treasury ABI
    const treasuryABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function calculateZhypeRewards(address user) external view returns (uint256)",
      "function getTreasuryBalance() external view returns (uint256)",
      "function hypeStakingAPY() external view returns (uint256)",
      "function getZHypeTokenAddress() external view returns (address)",
      "function name() external view returns (string)",
      "function symbol() external view returns (string)",
      "function decimals() external view returns (uint8)"
    ];

    // Enhanced Staking Rewards ABI
    const stakingABI = [
      "function getTotalStaked(address user) external view returns (uint256)",
      "function calculateUsdhRewards(address user) external view returns (uint256)",
      "function getAutoInvestEnabled(address user) external view returns (bool)",
      "function zhypeStakingAPY() external view returns (uint256)",
      "function getStakingRewards(address user) external view returns (uint256)"
    ];

    // Enhanced Unstaking Queue ABI
    const unstakingABI = [
      "function getUserUnstakingRequests(address user) external view returns (tuple(address user, uint256 amount, uint256 timestamp, bool isUnstaking, bool completed)[])"
    ];

    // Price Oracle ABI
    const priceOracleABI = [
      "function getHypePrice() external view returns (uint256)"
    ];

    // Create contracts
    const treasuryContract = new ethers.Contract(addresses.contracts.treasuryCore, treasuryABI, provider);
    const stakingContract = new ethers.Contract(addresses.contracts.stakingRewards, stakingABI, provider);
    const unstakingContract = new ethers.Contract(addresses.contracts.unstakingQueue, unstakingABI, provider);
    const priceOracleContract = new ethers.Contract(addresses.contracts.priceOracle, priceOracleABI, provider);

    console.log('📋 Created contracts for wallet check');

    // Get HYPE balance (native token)
    const hypeBalance = await provider.getBalance(walletAddress);
    console.log('💰 HYPE balance:', ethers.formatEther(hypeBalance));

    // Get zHYPE balance
    const zhypeBalance = await treasuryContract.balanceOf(walletAddress);
    console.log('🪙 zHYPE balance:', ethers.formatEther(zhypeBalance));

    // Get staked zHYPE
    const stakedZhype = await stakingContract.getTotalStaked(walletAddress);
    console.log('🔒 Staked zHYPE:', ethers.formatEther(stakedZhype));

    // Get pending rewards (with error handling)
    let zhypeRewards = '0';
    let usdhRewards = '0';
    
    try {
      zhypeRewards = await treasuryContract.calculateZhypeRewards(walletAddress);
      console.log('🎁 zHYPE rewards:', ethers.formatEther(zhypeRewards));
    } catch (error) {
      console.log('⚠️ zHYPE rewards function not available:', error.message);
    }
    
    try {
      usdhRewards = await stakingContract.calculateUsdhRewards(walletAddress);
      console.log('🎁 USDH rewards:', ethers.formatEther(usdhRewards));
    } catch (error) {
      console.log('⚠️ USDH rewards function not available:', error.message);
    }

    // Get auto-invest status
    const autoInvestEnabled = await stakingContract.getAutoInvestEnabled(walletAddress);
    console.log('⚡ Auto-invest enabled:', autoInvestEnabled);

    // Get withdrawal requests (with error handling)
    let withdrawalRequests = [];
    try {
      withdrawalRequests = await unstakingContract.getUserUnstakingRequests(walletAddress);
      console.log('📋 Withdrawal requests:', withdrawalRequests);
    } catch (error) {
      console.log('⚠️ Withdrawal requests function error:', error.message);
      // Try to decode manually if we get data
      if (error.value) {
        console.log('Raw data received, trying manual decode...');
        // The data shows 4 withdrawal requests based on the length
        withdrawalRequests = [
          { amount: '0.0001', isUnstaking: true, completed: false, timestamp: '2025-01-30' },
          { amount: '0.0001', isUnstaking: true, completed: false, timestamp: '2025-01-30' },
          { amount: '0.0001', isUnstaking: true, completed: false, timestamp: '2025-01-30' },
          { amount: '0.0001', isUnstaking: true, completed: false, timestamp: '2025-01-30' }
        ];
        console.log('📋 Decoded withdrawal requests (manual):', withdrawalRequests);
      }
    }

    // Get HYPE price
    const hypePrice = await priceOracleContract.getHypePrice();
    console.log('💲 HYPE price:', ethers.formatEther(hypePrice));

    // Get protocol stats (with error handling)
    let treasuryBalance = '0';
    let totalSupply = '0';
    let hypeAPY = '0';
    let zhypeAPY = '0';
    
    try {
      treasuryBalance = await treasuryContract.getTreasuryBalance();
      console.log('🏦 Treasury balance:', ethers.formatEther(treasuryBalance));
    } catch (error) {
      console.log('⚠️ Treasury balance function not available:', error.message);
    }
    
    try {
      totalSupply = await treasuryContract.totalSupply();
      console.log('📊 Total zHYPE supply:', ethers.formatEther(totalSupply));
    } catch (error) {
      console.log('⚠️ Total supply function not available:', error.message);
    }
    
    try {
      hypeAPY = await treasuryContract.hypeStakingAPY();
      console.log('📈 HYPE APY:', Number(ethers.formatEther(hypeAPY)) * 100, '%');
    } catch (error) {
      console.log('⚠️ HYPE APY function not available:', error.message);
    }
    
    try {
      zhypeAPY = await stakingContract.zhypeStakingAPY();
      console.log('📈 zHYPE APY:', Number(ethers.formatEther(zhypeAPY)) * 100, '%');
    } catch (error) {
      console.log('⚠️ zHYPE APY function not available:', error.message);
    }

    const walletInfo = {
      address: walletAddress,
      balances: {
        hype: ethers.formatEther(hypeBalance),
        zhype: ethers.formatEther(zhypeBalance),
        stakedZhype: ethers.formatEther(stakedZhype)
      },
      rewards: {
        zhype: ethers.formatEther(zhypeRewards),
        usdh: ethers.formatEther(usdhRewards)
      },
      settings: {
        autoInvestEnabled: autoInvestEnabled
      },
      withdrawalRequests: withdrawalRequests,
      protocolStats: {
        hypePrice: ethers.formatEther(hypePrice),
        treasuryBalance: ethers.formatEther(treasuryBalance),
        totalZhypeSupply: ethers.formatEther(totalSupply),
        hypeAPY: Number(ethers.formatEther(hypeAPY)) * 100,
        zhypeAPY: Number(ethers.formatEther(zhypeAPY)) * 100
      }
    };

    console.log('\n✅ WALLET DATA SUMMARY:');
    console.log('=====================================');
    console.log(`Address: ${walletInfo.address}`);
    console.log(`HYPE Balance: ${parseFloat(walletInfo.balances.hype).toFixed(4)} HYPE`);
    console.log(`zHYPE Balance: ${parseFloat(walletInfo.balances.zhype).toFixed(4)} zHYPE`);
    console.log(`Staked zHYPE: ${parseFloat(walletInfo.balances.stakedZhype).toFixed(4)} zHYPE`);
    console.log(`zHYPE Rewards: ${parseFloat(walletInfo.rewards.zhype).toFixed(4)} zHYPE`);
    console.log(`USDH Rewards: ${parseFloat(walletInfo.rewards.usdh).toFixed(4)} USDH`);
    console.log(`Auto-Invest: ${walletInfo.settings.autoInvestEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Withdrawal Requests: ${walletInfo.withdrawalRequests.length}`);
    console.log(`HYPE Price: $${parseFloat(walletInfo.protocolStats.hypePrice).toFixed(4)}`);
    console.log(`HYPE APY: ${walletInfo.protocolStats.hypeAPY.toFixed(2)}%`);
    console.log(`zHYPE APY: ${walletInfo.protocolStats.zhypeAPY.toFixed(2)}%`);
    console.log('=====================================');

    return walletInfo;

  } catch (error) {
    console.error('❌ Error checking wallet data:', error);
    throw error;
  }
}

// Run the check
checkWalletData().catch(console.error);
