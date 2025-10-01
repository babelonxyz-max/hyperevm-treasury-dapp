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
  protocolStats,
  hypeBalance,
  zhypeBalance,
  onDeposit,
  onWithdraw
}) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');

  // Real data from props
  const balances = {
    hype: hypeBalance || '0.0000',
    zhype: zhypeBalance || '0.0000'
  };

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0.0000';
    return parseFloat(balance).toFixed(4);
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return;
    try {
      if (onDeposit) {
        await onDeposit(amount);
      }
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) return;
    try {
      if (onWithdraw) {
        await onWithdraw(amount);
      }
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  const handleMaxAmount = () => {
    setAmount(balances.hype);
  };

  return (
    <div className="staking-card primary">
      <div className="card-header">
        <div className="card-title">
          <Coins className="card-icon" />
          <span>HYPE Deposit</span>
        </div>
        <div className="card-apy">
          <TrendingUp className="apy-icon" />
          <span>{contractAPYs?.hypeStakingAPY || '0.00'}% APY</span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="balance-section">
          <div className="balance-item">
            <span className="balance-label">Available HYPE</span>
            <span className="balance-amount">{formatBalance(balances?.hype)}</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Available zHYPE</span>
            <span className="balance-amount">{formatBalance(balances?.zhype)}</span>
          </div>
        </div>

        <div className="action-tabs">
          <button 
            className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            <ArrowUpRight className="tab-icon" />
            Deposit
          </button>
          <button 
            className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            <ArrowDownLeft className="tab-icon" />
            Withdraw
          </button>
        </div>

        {activeTab === 'deposit' ? (
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
              onClick={handleDeposit}
            >
              <ArrowUp className="button-icon" />
              DEPOSIT HYPE
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
