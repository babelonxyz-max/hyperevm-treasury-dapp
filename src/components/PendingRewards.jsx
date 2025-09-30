import React from 'react';
import { Coins, Clock, TrendingUp } from 'lucide-react';

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

  if (!isConnected) {
    return (
      <div className="pending-rewards-card">
        <div className="card-header">
          <div className="card-title">
            <Coins className="card-icon" />
            <h3>Pending Rewards</h3>
          </div>
        </div>
        <div className="card-content">
          <p className="connect-prompt">Connect your wallet to view pending rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-rewards-card">
      <div className="card-header">
        <div className="card-title">
          <Coins className="card-icon" />
          <h3>Pending Rewards</h3>
        </div>
        <div className="rewards-value">
          <span className="value-amount">${pendingRewards.totalValue}</span>
          <span className="value-label">Total</span>
        </div>
      </div>

      <div className="card-content">
        <div className="rewards-breakdown">
          <div className="reward-item">
            <div className="reward-info">
              <div className="reward-icon">
                <TrendingUp size={16} />
              </div>
              <div className="reward-details">
                <span className="reward-amount">{pendingRewards.zHypeRewards}</span>
                <span className="reward-token">zHYPE</span>
              </div>
            </div>
            <div className="reward-value">~$12.45</div>
          </div>

          <div className="reward-item">
            <div className="reward-info">
              <div className="reward-icon">
                <Coins size={16} />
              </div>
              <div className="reward-details">
                <span className="reward-amount">{pendingRewards.usdhRewards}</span>
                <span className="reward-token">USDH</span>
              </div>
            </div>
            <div className="reward-value">~$8.32</div>
          </div>
        </div>

        <div className="rewards-actions">
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleClaimRewards}
          >
            Claim All Rewards
          </button>
        </div>

        <div className="rewards-info">
          <div className="info-item">
            <Clock size={14} />
            <span>Last claimed: {pendingRewards.lastClaimed}</span>
          </div>
          <div className="info-item">
            <Clock size={14} />
            <span>Next claim: {pendingRewards.nextClaim}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRewards;
