import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { TrendingUp, Shield, Zap, Coins, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const StakingDashboard = ({
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
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');

  // Fetch user balances
  const { data: balances, refetch: refetchBalances } = useQuery({
    queryKey: ['userBalances', account],
    queryFn: async () => {
      if (!provider || !account) return { hype: '0', zhype: '0', stakedZhype: '0' };
      
      try {
        const hypeBalance = await provider.getBalance(account);
        const zhypeBalance = await treasuryContract?.balanceOf(account) || '0';
        const stakedZhype = await stakingRewardsContract?.getTotalStaked(account) || '0';
        
        return {
          hype: ethers.formatEther(hypeBalance),
          zhype: ethers.formatEther(zhypeBalance),
          stakedZhype: ethers.formatEther(stakedZhype)
        };
      } catch (error) {
        console.error('Error fetching balances:', error);
        return { hype: '0', zhype: '0', stakedZhype: '0' };
      }
    },
    enabled: !!provider && !!account,
    refetchInterval: 10000
  });

  // Fetch pending rewards
  const { data: pendingRewards } = useQuery({
    queryKey: ['pendingRewards', account],
    queryFn: async () => {
      if (!treasuryContract || !stakingRewardsContract || !account) return { zhype: '0', usdh: '0' };
      
      try {
        const zhypeRewards = await treasuryContract.calculateZhypeRewards(account);
        const usdhRewards = await stakingRewardsContract.calculateUsdhRewards(account);
        
        return {
          zhype: ethers.formatEther(zhypeRewards),
          usdh: ethers.formatEther(usdhRewards)
        };
      } catch (error) {
        console.error('Error fetching rewards:', error);
        return { zhype: '0', usdh: '0' };
      }
    },
    enabled: !!treasuryContract && !!stakingRewardsContract && !!account,
    refetchInterval: 10000
  });

  // Deposit HYPE mutation
  const depositMutation = useMutation({
    mutationFn: async (amount) => {
      const tx = await treasuryContract.depositHype({ value: ethers.parseEther(amount) });
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBalances']);
      setDepositAmount('');
    }
  });

  // Withdraw HYPE mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount) => {
      const tx = await treasuryContract.withdrawHype(ethers.parseEther(amount));
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBalances']);
      setWithdrawAmount('');
    }
  });

  // Stake zHYPE mutation
  const stakeMutation = useMutation({
    mutationFn: async (amount) => {
      const tx = await stakingRewardsContract.stakeZhype(ethers.parseEther(amount));
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBalances']);
      setStakeAmount('');
    }
  });

  // Unstake zHYPE mutation
  const unstakeMutation = useMutation({
    mutationFn: async (amount) => {
      const tx = await stakingRewardsContract.unstakeZhype(ethers.parseEther(amount));
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBalances']);
      setUnstakeAmount('');
    }
  });

  // Claim rewards mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      const tx = await stakingRewardsContract.claimRewards();
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingRewards']);
      queryClient.invalidateQueries(['userBalances']);
    }
  });

  const formatBalance = (balance, decimals = 4) => {
    if (!balance || balance === '0') return '0.0000';
    return parseFloat(balance).toFixed(decimals);
  };

  return (
    <div className="staking-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <Shield className="title-icon" />
            Babelon Staking
          </h1>
          <p className="dashboard-subtitle">
            Advanced liquid staking with APY rewards on Hyperliquid
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Value Locked</span>
            <span className="stat-value">{protocolStats?.totalHypeTvl || '0.0000'} HYPE</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">zHYPE Minted</span>
            <span className="stat-value">{protocolStats?.zhypeMinted || '0.0000'} zHYPE</span>
          </div>
        </div>
      </div>

      {/* Main Staking Cards */}
      <div className="staking-cards">
        {/* HYPE Staking Card */}
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
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="amount-input"
                  />
                  <button 
                    className="max-button"
                    onClick={() => setDepositAmount(balances?.hype || '0')}
                  >
                    MAX
                  </button>
                </div>
                <button
                  className="action-button primary"
                  onClick={() => depositMutation.mutate(depositAmount)}
                  disabled={!depositAmount || depositMutation.isPending}
                >
                  {depositMutation.isPending ? 'Staking...' : 'Stake HYPE'}
                </button>
              </div>
            ) : (
              <div className="action-form">
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="amount-input"
                  />
                  <button 
                    className="max-button"
                    onClick={() => setWithdrawAmount(balances?.zhype || '0')}
                  >
                    MAX
                  </button>
                </div>
                <button
                  className="action-button secondary"
                  onClick={() => withdrawMutation.mutate(withdrawAmount)}
                  disabled={!withdrawAmount || withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw HYPE'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* zHYPE Staking Card */}
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
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="amount-input"
                  />
                  <button 
                    className="max-button"
                    onClick={() => setStakeAmount(balances?.zhype || '0')}
                  >
                    MAX
                  </button>
                </div>
                <button
                  className="action-button primary"
                  onClick={() => stakeMutation.mutate(stakeAmount)}
                  disabled={!stakeAmount || stakeMutation.isPending}
                >
                  {stakeMutation.isPending ? 'Staking...' : 'Stake zHYPE'}
                </button>
              </div>
            ) : (
              <div className="action-form">
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    className="amount-input"
                  />
                  <button 
                    className="max-button"
                    onClick={() => setUnstakeAmount(balances?.stakedZhype || '0')}
                  >
                    MAX
                  </button>
                </div>
                <button
                  className="action-button secondary"
                  onClick={() => unstakeMutation.mutate(unstakeAmount)}
                  disabled={!unstakeAmount || unstakeMutation.isPending}
                >
                  {unstakeMutation.isPending ? 'Unstaking...' : 'Unstake zHYPE'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="rewards-section">
        <div className="rewards-card">
          <div className="rewards-header">
            <h3>Pending Rewards</h3>
            <button
              className="claim-button"
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
            >
              {claimMutation.isPending ? 'Claiming...' : 'Claim All'}
            </button>
          </div>
          
          <div className="rewards-grid">
            <div className="reward-item">
              <div className="reward-icon">
                <Coins />
              </div>
              <div className="reward-info">
                <span className="reward-label">zHYPE Rewards</span>
                <span className="reward-amount">{formatBalance(pendingRewards?.zhype)} zHYPE</span>
              </div>
            </div>
            
            <div className="reward-item">
              <div className="reward-icon">
                <TrendingUp />
              </div>
              <div className="reward-info">
                <span className="reward-label">USDH Rewards</span>
                <span className="reward-amount">{formatBalance(pendingRewards?.usdh)} USDH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;
