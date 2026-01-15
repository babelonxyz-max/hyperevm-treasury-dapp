import React, { useState } from 'react';
import { Coins, TrendingUp, Zap, Settings, Loader2 } from 'lucide-react';

const PendingRewards = ({ 
  account, 
  isConnected, 
  stakingRewardsContract, 
  rewardsManagerContract,
  contractAPYs,
  protocolStats,
  pendingRewards,
  onClaimRewards,
  autoInvestEnabled,
  onToggleAutoInvest
}) => {
  const [isToggling, setIsToggling] = useState(false);

  // Use real data from props
  const rewardsData = pendingRewards || {
    zHype: '0.0000',
    usdh: '0.0000'
  };

  const handleClaimRewards = async () => {
    if (!isConnected || !onClaimRewards) {
      console.log('Wallet not connected or claim function not available');
      return;
    }

    try {
      console.log('Claiming rewards...');
      await onClaimRewards();
      console.log('Rewards claimed successfully!');
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  const handleAutoInvestToggle = async () => {
    if (!isConnected || !onToggleAutoInvest || isToggling) {
      console.log('Wallet not connected, toggle function not available, or already toggling');
      return;
    }

    try {
      setIsToggling(true);
      console.log(`Toggling auto-invest: ${!autoInvestEnabled}`);
      
      // Call the parent function which handles the transaction
      await onToggleAutoInvest();
      
      console.log(`Auto-invest ${!autoInvestEnabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling auto-invest:', error);
      // The error handling is done in the parent function (App.jsx)
    } finally {
      setIsToggling(false);
    }
  };

  const formatBalance = (balance, decimals = 4) => {
    if (!balance || balance === '0') return '0';
    const num = parseFloat(balance);
    return num.toFixed(decimals).replace(/\.?0+$/, '');
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
        {/* Rewards Balance Section - Horizontal Layout */}
        <div className="rewards-balance-section">
          <div className="rewards-balance-item">
            <span className="rewards-balance-label">zHYPE Rewards</span>
            <span className="rewards-balance-amount">{formatBalance(rewardsData?.zHype)}</span>
            <span className="rewards-balance-token">zHYPE</span>
          </div>
          
          <div className="rewards-balance-item">
            <span className="rewards-balance-label">USDH Rewards</span>
            <span className="rewards-balance-amount">{formatBalance(rewardsData?.usdh)}</span>
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
              className={`auto-invest-toggle ${autoInvestEnabled ? 'enabled' : 'disabled'} ${isToggling ? 'loading' : ''}`}
              onClick={handleAutoInvestToggle}
              disabled={isToggling}
              title={isToggling ? 'Signing transaction...' : (autoInvestEnabled ? 'Disable auto-invest' : 'Enable auto-invest')}
            >
              <div className="toggle-track">
                <div className="toggle-thumb">
                  {isToggling && <Loader2 size={10} className="toggle-loader" />}
                </div>
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
