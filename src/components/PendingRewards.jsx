import React from 'react';
import { Coins, TrendingUp } from 'lucide-react';

const PendingRewards = ({ 
  account, 
  isConnected, 
  stakingRewardsContract, 
  contractAPYs,
  protocolStats 
}) => {
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

  const formatBalance = (balance, decimals = 4) => {
    if (!balance || balance === '0') return '0.0000';
    return parseFloat(balance).toFixed(decimals);
  };

  if (!isConnected) {
    return (
      <div className="rewards-card">
        <div className="rewards-header">
          <h3>
            <Coins className="card-icon" />
            Pending Rewards
          </h3>
        </div>
        <div className="rewards-content">
          <p className="connect-prompt">Connect your wallet to view pending rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-card">
      <div className="rewards-header">
        <h3>
          <Coins className="card-icon" />
          Pending Rewards
        </h3>
        <button
          className="claim-button"
          onClick={handleClaimRewards}
        >
          Claim All
        </button>
      </div>
      
      <div className="rewards-grid">
        <div className="reward-item">
          <div className="reward-icon">
            <Coins />
          </div>
          <div className="reward-info">
            <span className="reward-label">zHYPE Rewards</span>
            <span className="reward-amount">{formatBalance(pendingRewards?.zHypeRewards)} zHYPE</span>
          </div>
        </div>
        
        <div className="reward-item">
          <div className="reward-icon">
            <TrendingUp />
          </div>
          <div className="reward-info">
            <span className="reward-label">USDH Rewards</span>
            <span className="reward-amount">{formatBalance(pendingRewards?.usdhRewards)} USDH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRewards;
