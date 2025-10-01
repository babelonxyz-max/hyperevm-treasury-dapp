import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletDataChecker = ({ walletAddress = '0x0D839f429b8f9AA1d4C7A2728f3378450BfEE2C4' }) => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkWalletData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Checking wallet data for: ${walletAddress}`);
      
      // Load deployed addresses
      const response = await fetch('/deployed-addresses.json');
      const addresses = await response.json();
      console.log('📍 Loaded addresses:', addresses);

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

      // Get pending rewards
      const zhypeRewards = await treasuryContract.calculateZhypeRewards(walletAddress);
      const usdhRewards = await stakingContract.calculateUsdhRewards(walletAddress);
      console.log('🎁 zHYPE rewards:', ethers.formatEther(zhypeRewards));
      console.log('🎁 USDH rewards:', ethers.formatEther(usdhRewards));

      // Get auto-invest status
      const autoInvestEnabled = await stakingContract.getAutoInvestEnabled(walletAddress);
      console.log('⚡ Auto-invest enabled:', autoInvestEnabled);

      // Get withdrawal requests
      const withdrawalRequests = await unstakingContract.getUserUnstakingRequests(walletAddress);
      console.log('📋 Withdrawal requests:', withdrawalRequests);

      // Get HYPE price
      const hypePrice = await priceOracleContract.getHypePrice();
      console.log('💲 HYPE price:', ethers.formatEther(hypePrice));

      // Get protocol stats
      const treasuryBalance = await treasuryContract.getTreasuryBalance();
      const totalSupply = await treasuryContract.totalSupply();
      const hypeAPY = await treasuryContract.hypeStakingAPY();
      const zhypeAPY = await stakingContract.zhypeStakingAPY();

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

      setWalletData(walletInfo);
      console.log('✅ Wallet data retrieved successfully:', walletInfo);

    } catch (err) {
      console.error('❌ Error checking wallet data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkWalletData();
  }, [walletAddress]);

  if (loading) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
        <h3>Loading wallet data...</h3>
        <p>Checking wallet: {walletAddress}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid #red', margin: '20px' }}>
        <h3>Error loading wallet data</h3>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={checkWalletData}>Retry</button>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
        <h3>No wallet data available</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', backgroundColor: '#f9f9f9' }}>
      <h3>Wallet Data Check: {walletAddress}</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>💰 Balances</h4>
        <p><strong>HYPE Balance:</strong> {parseFloat(walletData.balances.hype).toFixed(4)} HYPE</p>
        <p><strong>zHYPE Balance:</strong> {parseFloat(walletData.balances.zhype).toFixed(4)} zHYPE</p>
        <p><strong>Staked zHYPE:</strong> {parseFloat(walletData.balances.stakedZhype).toFixed(4)} zHYPE</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>🎁 Pending Rewards</h4>
        <p><strong>zHYPE Rewards:</strong> {parseFloat(walletData.rewards.zhype).toFixed(4)} zHYPE</p>
        <p><strong>USDH Rewards:</strong> {parseFloat(walletData.rewards.usdh).toFixed(4)} USDH</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>⚙️ Settings</h4>
        <p><strong>Auto-Invest:</strong> {walletData.settings.autoInvestEnabled ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>📋 Withdrawal Requests</h4>
        <p><strong>Total Requests:</strong> {walletData.withdrawalRequests.length}</p>
        {walletData.withdrawalRequests.map((request, index) => (
          <div key={index} style={{ marginLeft: '20px', fontSize: '12px' }}>
            <p>Request {index + 1}: {ethers.formatEther(request.amount)} {request.isUnstaking ? 'zHYPE' : 'HYPE'} - {request.completed ? 'Completed' : 'Pending'}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>📊 Protocol Stats</h4>
        <p><strong>HYPE Price:</strong> ${parseFloat(walletData.protocolStats.hypePrice).toFixed(4)}</p>
        <p><strong>Treasury Balance:</strong> {parseFloat(walletData.protocolStats.treasuryBalance).toFixed(2)} HYPE</p>
        <p><strong>Total zHYPE Supply:</strong> {parseFloat(walletData.protocolStats.totalZhypeSupply).toFixed(2)} zHYPE</p>
        <p><strong>HYPE APY:</strong> {walletData.protocolStats.hypeAPY.toFixed(2)}%</p>
        <p><strong>zHYPE APY:</strong> {walletData.protocolStats.zhypeAPY.toFixed(2)}%</p>
      </div>

      <button onClick={checkWalletData} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
        Refresh Data
      </button>
    </div>
  );
};

export default WalletDataChecker;
