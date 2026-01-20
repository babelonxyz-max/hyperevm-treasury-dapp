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
  protocolStats,
  zhypeBalance,
  stakedZhype,
  onStakeZhype
}) => {
  const [activeTab, setActiveTab] = useState('stake-zhype');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real data from props
  const balances = {
    zhype: zhypeBalance || '0.0000',
    stakedZhype: stakedZhype || '0.0000'
  };

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0';
    const num = parseFloat(balance);
    return num.toFixed(4).replace(/\.?0+$/, '');
  };

  const formatAPY = (apy) => {
    if (!apy || apy === '0' || apy === 0) return '0.00';
    const num = parseFloat(apy);
    
    // Handle very small numbers (scientific notation)
    if (num < 0.0001) return '0.00';
    
    // Handle normal numbers
    if (num < 1) {
      return num.toFixed(4).replace(/\.?0+$/, '');
    } else {
      return num.toFixed(2).replace(/\.?0+$/, '');
    }
  };

  const handleStake = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      if (onStakeZhype) {
        await onStakeZhype(amount);
        setAmount(''); // Clear amount on success
        setError(null);
      }
    } catch (error) {
      console.error('Stake zHYPE error:', error);
      // Extract user-friendly error message
      let errorMessage = 'Failed to stake zHYPE';
      if (error.message) {
        if (error.message.includes('insufficient')) {
          errorMessage = error.message;
        } else if (error.message.includes('allowance')) {
          errorMessage = 'Insufficient allowance. Please approve the staking contract first.';
        } else if (error.message.includes('user rejected') || error.code === 4001) {
          errorMessage = 'Transaction rejected. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = () => {
    console.log('Unstaking zHYPE:', amount);
  };

  const handleMaxAmount = () => {
    if (activeTab === 'stake-zhype') {
      setAmount(balances.zhype);
    } else {
      setAmount(balances.stakedZhype);
    }
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
          <span>17.0% APY</span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="balance-section">
          <div className="balance-item">
            <span className="balance-label">Available zHYPE</span>
            <span className="balance-amount">{formatBalance(balances?.zhype)}</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Staked zHYPE</span>
            <span className="balance-amount">{formatBalance(balances?.stakedZhype)}</span>
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
            {error && (
              <div className="error-message" style={{ 
                color: '#ff4444', 
                fontSize: '0.875rem', 
                marginBottom: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#ff444420',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}
            <button 
              className="action-button primary"
              onClick={handleStake}
              disabled={isLoading || !amount || amount <= 0}
            >
              <ArrowUp className="button-icon" />
              {isLoading ? 'STAKING...' : 'STAKE zHYPE'}
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
