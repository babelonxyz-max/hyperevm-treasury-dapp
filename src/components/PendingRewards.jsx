import React, { useState } from 'react';
import { Coins, TrendingUp, Zap, Settings } from 'lucide-react';

const PendingRewards = ({ 
  account, 
  isConnected, 
  stakingRewardsContract, 
  contractAPYs,
  protocolStats 
}) => {
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(false);

  // Mock data - replace with real contract calls
  const pendingRewards = {
    zHypeRewards: '12.45',
    usdhRewards: '8.32',
    totalValue: '20.77',
    lastClaimed: '2 hours ago',
    nextClaim: '3 hours'
  };

  const handleClaimRewards = async () => {
    if (!isConnected || !stakingRewardsContract) {
      console.log('Wallet not connected or contract not available');
      return;
    }

    try {
      console.log('Claiming rewards...');
      // Add real contract interaction here
      // const tx = await stakingRewardsContract.claimRewards();
      // await tx.wait();
      console.log('Rewards claimed successfully!');
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  const handleAutoInvestToggle = async () => {
    if (!isConnected || !stakingRewardsContract) {
      console.log('Wallet not connected or contract not available');
      return;
    }

    try {
      console.log(`Toggling auto-invest: ${!autoInvestEnabled}`);
      // Add real contract interaction here
      // const tx = await stakingRewardsContract.setAutoInvest(!autoInvestEnabled);
      // await tx.wait();
      setAutoInvestEnabled(!autoInvestEnabled);
      console.log(`Auto-invest ${!autoInvestEnabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling auto-invest:', error);
    }
  };

  const formatBalance = (balance, decimals = 4) => {
    if (!balance || balance === '0') return '0.0000';
    return parseFloat(balance).toFixed(decimals);
  };

  if (!isConnected) {
    return (
      <div className="rewards-card">
        <div className="card-header">
          <div className="card-title">
            <Coins className="card-icon" />
            <span>Pending Rewards</span>
          </div>
        </div>
        <div className="card-content">
          <p className="connect-prompt">Connect your wallet to view pending rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-card">
      <div className="card-header">
        <div className="card-title">
          <Coins className="card-icon" />
          <span>Pending Rewards</span>
        </div>
      </div>
      
      <div className="card-content">
        {/* Rewards Balance Section */}
        <div className="rewards-balance-section">
          <div className="rewards-balance-item">
            <div className="rewards-balance-header">
              <div className="rewards-balance-icon">
                <Coins />
              </div>
              <span className="rewards-balance-label">zHYPE Rewards</span>
            </div>
            <span className="rewards-balance-amount">{formatBalance(pendingRewards?.zHypeRewards)}</span>
            <span className="rewards-balance-token">zHYPE</span>
          </div>
          
          <div className="rewards-balance-item">
            <div className="rewards-balance-header">
              <div className="rewards-balance-icon">
                <TrendingUp />
              </div>
              <span className="rewards-balance-label">USDH Rewards</span>
            </div>
            <span className="rewards-balance-amount">{formatBalance(pendingRewards?.usdhRewards)}</span>
            <span className="rewards-balance-token">USDH</span>
          </div>
        </div>

        {/* Auto-Invest Toggle Section */}
        <div className="auto-invest-section">
          <div className="auto-invest-header">
            <div className="auto-invest-title">
              <Zap className="auto-invest-icon" />
              <span>Auto-Invest</span>
            </div>
            <button
              className={`auto-invest-toggle ${autoInvestEnabled ? 'enabled' : 'disabled'}`}
              onClick={handleAutoInvestToggle}
              title={autoInvestEnabled ? 'Disable auto-invest' : 'Enable auto-invest'}
            >
              <div className="toggle-track">
                <div className="toggle-thumb"></div>
              </div>
            </button>
          </div>
          <p className="auto-invest-description">
            {autoInvestEnabled 
              ? 'Automatically reinvest rewards into staking' 
              : 'Manually claim rewards to your wallet'
            }
          </p>
        </div>

        {/* Claim Button */}
        <button
          className="claim-all-button"
          onClick={handleClaimRewards}
        >
          <Coins className="claim-icon" />
          Claim All Rewards
        </button>
      </div>
    </div>
  );
};

export default PendingRewards;
