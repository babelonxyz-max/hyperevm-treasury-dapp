import React from 'react';

const AssetCard = ({
  asset,
  userBalance,
  stakeBalance,
  onStake,
  onUnstake,
  onStakeZHype,
  onUnstakeZHype,
  formatBalance,
  error,
  isStaking,
  isUnstaking,
  pendingRewards,
  onClaimRewards,
  isClaiming,
  isConnected
}) => {
  return (
    <div className="asset-card">
      <div className="asset-card-header">
        <h3>{asset.symbol}</h3>
        <div className="asset-balance">
          {formatBalance(userBalance, asset.decimals)} {asset.symbol}
        </div>
      </div>
      
      <div className="asset-card-content">
        <div className="asset-info">
          <div className="info-row">
            <span>APY:</span>
            <span>{asset.apy}%</span>
          </div>
          <div className="info-row">
            <span>Staked:</span>
            <span>{formatBalance(stakeBalance, asset.decimals)}</span>
          </div>
        </div>
        
        <div className="asset-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onStake(asset)}
            disabled={!isConnected || isStaking}
          >
            {isStaking ? 'Staking...' : 'Stake'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => onUnstake(asset)}
            disabled={!isConnected || isUnstaking}
          >
            {isUnstaking ? 'Unstaking...' : 'Unstake'}
          </button>
        </div>
        
        {pendingRewards && pendingRewards.zHype !== '0.000' && (
          <div className="rewards-section">
            <div className="rewards-info">
              <span>Pending Rewards:</span>
              <span>{pendingRewards.zHype} zHYPE</span>
            </div>
            <button 
              className="btn btn-success"
              onClick={onClaimRewards}
              disabled={!isConnected || isClaiming}
            >
              {isClaiming ? 'Claiming...' : 'Claim Rewards'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetCard;

