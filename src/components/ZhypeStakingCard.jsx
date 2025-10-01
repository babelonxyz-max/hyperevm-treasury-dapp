import React, { useState } from 'react';
import { Zap, TrendingUp, ArrowUpRight, ArrowDownLeft, ArrowUp } from 'lucide-react';

const ZhypeStakingCard = ({ 
  account, 
  provider, 
  signer, 
  contractAddresses, 
  treasuryContract, 
  stakingRewardsContract, 
  isConnected, 
  onConnect, 
  contractAPYs, 
  protocolStats 
}) => {
  const [activeTab, setActiveTab] = useState('stake-zhype');
  const [amount, setAmount] = useState('');

  // Mock data - replace with actual data fetching
  const balances = {
    zhype: '0.0000',
    stakedZhype: '0.0000'
  };

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  const handleStake = () => {
    console.log('Staking zHYPE:', amount);
  };

  const handleUnstake = () => {
    console.log('Unstaking zHYPE:', amount);
  };

  const handleMaxAmount = () => {
    setAmount(balances.zhype);
  };

  return (
    <div className="staking-card secondary">
      <div className="card-header">
        <div className="card-title">
          <Zap className="card-icon" />
          <span>zHYPE Staking</span>
        </div>
        <div className="card-apy">
          <TrendingUp className="apy-icon" />
          <span>{contractAPYs?.zhypeStakingAPY || '0.00'}% APY</span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="balance-section">
          <div className="balance-item">
            <span className="balance-label">Available</span>
            <span className="balance-amount">{formatBalance(balances?.zhype)} zHYPE</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Staked</span>
            <span className="balance-amount">{formatBalance(balances?.stakedZhype)} zHYPE</span>
          </div>
        </div>

        <div className="action-tabs">
          <button 
            className={`tab-button ${activeTab === 'stake-zhype' ? 'active' : ''}`}
            onClick={() => setActiveTab('stake-zhype')}
          >
            <ArrowUpRight className="tab-icon" />
            Stake
          </button>
          <button 
            className={`tab-button ${activeTab === 'unstake-zhype' ? 'active' : ''}`}
            onClick={() => setActiveTab('unstake-zhype')}
          >
            <ArrowDownLeft className="tab-icon" />
            Unstake
          </button>
        </div>

        {activeTab === 'stake-zhype' ? (
          <div className="action-form">
            <div className="input-group">
              <input
                type="number"
                className="amount-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button 
                className="max-button"
                onClick={handleMaxAmount}
              >
                MAX
              </button>
            </div>
            <button 
              className="action-button primary"
              onClick={handleStake}
            >
              <ArrowUp className="button-icon" />
              STAKE zHYPE
            </button>
          </div>
        ) : (
          <div className="action-form">
            <div className="input-group">
              <input
                type="number"
                className="amount-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button 
                className="max-button"
                onClick={handleMaxAmount}
              >
                MAX
              </button>
            </div>
            <button 
              className="action-button secondary"
              onClick={handleUnstake}
            >
              <ArrowDownLeft className="button-icon" />
              UNSTAKE zHYPE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZhypeStakingCard;
