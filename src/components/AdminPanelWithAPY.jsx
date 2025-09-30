import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, DollarSign, Pause, Play, PlusCircle, MinusCircle, RefreshCw, Crown, TrendingUp, Settings } from 'lucide-react';

const AdminPanelWithAPY = ({ account, provider, signer, contractAddresses, treasuryContract }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [newAPY, setNewAPY] = useState('');
  const [message, setMessage] = useState('');

  // Check if current account is the treasury owner
  const isOwner = account && contractAddresses.owner && 
    account.toLowerCase() === contractAddresses.owner.toLowerCase();

  console.log("🔍 Admin Panel Debug:");
  console.log("  Account:", account);
  console.log("  Contract Owner:", contractAddresses.owner);
  console.log("  Is Owner:", isOwner);

  if (!isOwner) {
    console.log("❌ Not owner, hiding admin panel");
    return null; // Don't show admin panel if not owner
  }

  console.log("✅ Owner detected, showing admin panel");

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const queryClient = useQueryClient();

  // Fetch treasury status and APY info
  const { data: treasuryStatus, refetch: refetchTreasuryStatus } = useQuery({
    queryKey: ['treasuryStatus', contractAddresses.treasury],
    queryFn: async () => {
      if (!treasuryContract) return null;
      const [balance, paused, owner, apy, totalDeposits, totalRewards] = await Promise.all([
        treasuryContract.getTreasuryBalance(),
        treasuryContract.paused(),
        treasuryContract.owner(),
        treasuryContract.getAPYPercentage(),
        treasuryContract.getTotalDeposits(),
        treasuryContract.getTotalRewardsDistributed()
      ]);
      return {
        balance: balance.toString(),
        paused,
        owner,
        apy: apy.toString(),
        totalDeposits: totalDeposits.toString(),
        totalRewards: totalRewards.toString()
      };
    },
    enabled: !!treasuryContract,
    refetchInterval: 5000
  });

  // Admin Withdraw Mutation
  const adminWithdrawMutation = useMutation({
    mutationFn: async (amount) => {
      const amountWei = ethers.parseEther(amount);
      const tx = await treasuryContract.adminWithdraw(amountWei, { gasLimit: 200000 });
      await tx.wait();
    },
    onSuccess: () => {
      showMessage('HYPE withdrawn successfully!');
      setWithdrawAmount('');
      queryClient.invalidateQueries(['treasuryStatus']);
      queryClient.invalidateQueries(['userBalances']);
    },
    onError: (error) => {
      console.error("Admin withdraw failed:", error);
      showMessage(`Withdraw failed: ${error.reason || error.message}`, 'error');
    }
  });

  // Admin Withdraw All Mutation
  const adminWithdrawAllMutation = useMutation({
    mutationFn: async () => {
      const tx = await treasuryContract.adminWithdrawAll({ gasLimit: 200000 });
      await tx.wait();
    },
    onSuccess: () => {
      showMessage('All HYPE withdrawn successfully!');
      queryClient.invalidateQueries(['treasuryStatus']);
      queryClient.invalidateQueries(['userBalances']);
    },
    onError: (error) => {
      console.error("Admin withdraw all failed:", error);
      showMessage(`Withdraw all failed: ${error.reason || error.message}`, 'error');
    }
  });

  // Admin Mint Mutation
  const adminMintMutation = useMutation({
    mutationFn: async ({ to, amount }) => {
      const amountWei = ethers.parseEther(amount);
      const tx = await treasuryContract.adminMint(to, amountWei, { gasLimit: 200000 });
      await tx.wait();
    },
    onSuccess: () => {
      showMessage('zHYPE minted successfully!');
      setMintAmount('');
      setMintTo('');
      queryClient.invalidateQueries(['zHypeTokenBalance']);
    },
    onError: (error) => {
      console.error("Admin mint failed:", error);
      showMessage(`Mint failed: ${error.reason || error.message}`, 'error');
    }
  });

  // Set APY Mutation
  const setAPYMutation = useMutation({
    mutationFn: async (apyValue) => {
      const apyBasisPoints = apyValue * 100; // Convert percentage to basis points
      const tx = await treasuryContract.setAPY(apyBasisPoints, { gasLimit: 150000 });
      await tx.wait();
    },
    onSuccess: () => {
      showMessage(`APY updated to ${newAPY}%!`);
      setNewAPY('');
      queryClient.invalidateQueries(['treasuryStatus']);
      queryClient.invalidateQueries(['apyInfo']);
    },
    onError: (error) => {
      console.error("Set APY failed:", error);
      showMessage(`APY update failed: ${error.reason || error.message}`, 'error');
    }
  });

  // Pause/Unpause Mutations
  const pauseMutation = useMutation({
    mutationFn: async () => {
      const tx = await treasuryContract.pause({ gasLimit: 100000 });
      await tx.wait();
    },
    onSuccess: () => {
      showMessage('Treasury paused!');
      queryClient.invalidateQueries(['treasuryStatus']);
    },
    onError: (error) => {
      console.error("Pause failed:", error);
      showMessage(`Pause failed: ${error.reason || error.message}`, 'error');
    }
  });

  const unpauseMutation = useMutation({
    mutationFn: async () => {
      const tx = await treasuryContract.unpause({ gasLimit: 100000 });
      await tx.wait();
    },
    onSuccess: () => {
      showMessage('Treasury unpaused!');
      queryClient.invalidateQueries(['treasuryStatus']);
    },
    onError: (error) => {
      console.error("Unpause failed:", error);
      showMessage(`Unpause failed: ${error.reason || error.message}`, 'error');
    }
  });

  const formatBalance = (balance) => {
    if (!balance) return '0';
    return ethers.formatUnits(balance, 18);
  };

  const formatAPY = (apy) => {
    if (!apy) return '0.00';
    return parseFloat(apy).toFixed(2);
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>Treasury Admin Panel v0.3</h2>
        <span className="owner-badge"><Crown size={16} /> OWNER</span>
        <button 
          className="refresh-btn"
          onClick={() => refetchTreasuryStatus()}
          title="Refresh Status"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-status">
        <div className="status-item">
          <span>Treasury Balance:</span>
          <span>{treasuryStatus ? formatBalance(treasuryStatus.balance) : '0'} HYPE</span>
        </div>
        <div className="status-item">
          <span>Status:</span>
          <span className={treasuryStatus?.paused ? 'status-paused' : 'status-active'}>
            {treasuryStatus?.paused ? 'Paused' : 'Active'}
          </span>
        </div>
        <div className="status-item">
          <span>Current APY:</span>
          <span className="apy-value">
            <TrendingUp size={14} />
            {treasuryStatus ? formatAPY(treasuryStatus.apy) : '0.00'}%
          </span>
        </div>
        <div className="status-item">
          <span>Total Deposits:</span>
          <span>{treasuryStatus ? formatBalance(treasuryStatus.totalDeposits) : '0'} HYPE</span>
        </div>
        <div className="status-item">
          <span>Rewards Distributed:</span>
          <span>{treasuryStatus ? formatBalance(treasuryStatus.totalRewards) : '0'} HYPE</span>
        </div>
        <div className="status-item">
          <span>Owner:</span>
          <span>{treasuryStatus?.owner ? `${treasuryStatus.owner.slice(0, 6)}...${treasuryStatus.owner.slice(-4)}` : 'N/A'}</span>
        </div>
      </div>

      <div className="admin-actions-grid">
        {/* APY Control */}
        <div className="admin-action-card apy-card">
          <h3>🎯 APY Control</h3>
          <div className="input-group">
            <input
              type="number"
              placeholder="New APY (%)"
              value={newAPY}
              onChange={(e) => setNewAPY(e.target.value)}
              min="0"
              max="500"
              step="0.1"
            />
            <button 
              className="action-btn apy-btn"
              onClick={() => setAPYMutation.mutate(parseFloat(newAPY))}
              disabled={setAPYMutation.isPending || !newAPY || parseFloat(newAPY) < 0 || parseFloat(newAPY) > 500}
            >
              {setAPYMutation.isPending ? <RefreshCw size={16} className="spinner" /> : <Settings size={16} />}
              Set APY
            </button>
          </div>
          <div className="current-apy">
            Current: {treasuryStatus ? formatAPY(treasuryStatus.apy) : '0.00'}%
          </div>
        </div>

        {/* Withdraw HYPE */}
        <div className="admin-action-card">
          <h3>Withdraw HYPE</h3>
          <div className="input-group">
            <input
              type="number"
              placeholder="Amount (HYPE)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              min="0"
              step="0.001"
            />
            <button 
              className="action-btn withdraw-btn"
              onClick={() => adminWithdrawMutation.mutate(withdrawAmount)}
              disabled={adminWithdrawMutation.isPending || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            >
              {adminWithdrawMutation.isPending ? <RefreshCw size={16} className="spinner" /> : <DollarSign size={16} />}
              Withdraw
            </button>
          </div>
          <button 
            className="action-btn withdraw-all-btn"
            onClick={() => adminWithdrawAllMutation.mutate()}
            disabled={adminWithdrawAllMutation.isPending}
          >
            {adminWithdrawAllMutation.isPending ? <RefreshCw size={16} className="spinner" /> : <DollarSign size={16} />}
            Withdraw All
          </button>
        </div>

        {/* Mint zHYPE */}
        <div className="admin-action-card">
          <h3>Mint zHYPE</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Recipient Address"
              value={mintTo}
              onChange={(e) => setMintTo(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount (zHYPE)"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              min="0"
              step="0.001"
            />
            <button 
              className="action-btn mint-btn"
              onClick={() => adminMintMutation.mutate({ to: mintTo, amount: mintAmount })}
              disabled={adminMintMutation.isPending || !mintTo || !mintAmount || parseFloat(mintAmount) <= 0}
            >
              {adminMintMutation.isPending ? <RefreshCw size={16} className="spinner" /> : <PlusCircle size={16} />}
              Mint
            </button>
          </div>
        </div>

        {/* Pause/Unpause */}
        <div className="admin-action-card">
          <h3>Control Operations</h3>
          <div className="button-group">
            <button 
              className="action-btn pause-btn"
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending || treasuryStatus?.paused}
            >
              {pauseMutation.isPending ? <RefreshCw size={16} className="spinner" /> : <Pause size={16} />}
              Pause
            </button>
            <button 
              className="action-btn unpause-btn"
              onClick={() => unpauseMutation.mutate()}
              disabled={unpauseMutation.isPending || !treasuryStatus?.paused}
            >
              {unpauseMutation.isPending ? <RefreshCw size={16} className="spinner" /> : <Play size={16} />}
              Unpause
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelWithAPY;
