import React, { useState } from 'react';
import { Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, ArrowUp } from 'lucide-react';

const HypeStakingCard = ({ 
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
  const [activeTab, setActiveTab] = useState('stake');
  const [amount, setAmount] = useState('');

  // Mock data - replace with actual data fetching
  const balances = {
    hype: '0.0288',
    zhype: '0.0000'
  };

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  const handleStake = () => {
    console.log('Staking HYPE:', amount);
  };

  const handleWithdraw = () => {
    console.log('Withdrawing HYPE:', amount);
  };

  const handleMaxAmount = () => {
    setAmount(balances.hype);
  };

  return (
    <div className="staking-card primary">
      <div className="card-header">
        <div className="card-title">
          <Coins className="card-icon" />
          <span>HYPE Staking</span>
        </div>
        <div className="card-apy">
          <TrendingUp className="apy-icon" />
          <span>{contractAPYs?.hypeStakingAPY || '0.00'}% APY</span>
        </div>
      </div>
      
      {/* DEBUG: Add visible test content */}
      <div style={{background: 'red', padding: '10px', color: 'white'}}>
        DEBUG: Card content is rendering
      </div>
      
      <div className="card-content">
        <div className="balance-section">
          <div className="balance-item">
            <span className="balance-label">Available</span>
            <span className="balance-amount">{formatBalance(balances?.hype)} HYPE</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Staked</span>
            <span className="balance-amount">{formatBalance(balances?.zhype)} zHYPE</span>
          </div>
        </div>

        <div className="action-tabs">
          <button 
            className={`tab-button ${activeTab === 'stake' ? 'active' : ''}`}
            onClick={() => setActiveTab('stake')}
          >
            <ArrowUpRight className="tab-icon" />
            Stake
          </button>
          <button 
            className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            <ArrowDownLeft className="tab-icon" />
            Withdraw
          </button>
        </div>

        {activeTab === 'stake' ? (
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
              STAKE HYPE
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
              onClick={handleWithdraw}
            >
              <ArrowDownLeft className="button-icon" />
              WITHDRAW HYPE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HypeStakingCard;
