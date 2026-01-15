import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, ArrowDown, ArrowUp, RefreshCw, TrendingUp, Clock, DollarSign } from 'lucide-react';
import AssetCard from './AssetCard';

// Contract ABIs for APY Treasury
const TREASURY_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function claimRewards() external",
  "function getDepositBalance(address user) external view returns (uint256)",
  "function getTreasuryBalance() external view returns (uint256)",
  "function balanceOf(address user) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getAPYPercentage() external view returns (uint256)",
  "function getTotalDeposits() external view returns (uint256)",
  "function getTotalRewardsDistributed() external view returns (uint256)",
  "function setAPY(uint256 newAPY) external",
  "function pause() external",
  "function unpause() external",
  "function adminWithdraw(uint256 amount) external",
  "function adminWithdrawAll() external",
  "function adminMint(address to, uint256 amount) external",
  "function adminBurn(address from, uint256 amount) external",
  "function paused() external view returns (bool)",
  "function owner() external view returns (address)",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdraw(address indexed user, uint256 amount)",
  "event ClaimRewards(address indexed user, uint256 amount)",
  "event Transfer(address indexed from, address to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event APYUpdated(uint256 newAPY)",
  "event AdminWithdraw(address indexed owner, uint256 amount)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

const UNSTAKING_QUEUE_ABI = [
  "function getUserUnstakingRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool processed)[])",
  "function getUserRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool processed)[])",
  "function getRequests(address user) external view returns (tuple(uint256 amount, uint256 timestamp, bool processed)[])",
  "function requestCount(address user) external view returns (uint256)",
  "function requests(address user, uint256 index) external view returns (uint256 amount, uint256 timestamp, bool processed)"
];

const AssetManagerWithAPY = ({ account, provider, signer, contractAddresses, treasuryContract, isConnected, onConnect, contractAPYs, protocolStats }) => {
  // State for deposit/withdraw
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Debug logging
  console.log("🔍 AssetManagerWithAPY - contractAddresses:", contractAddresses);
  console.log("🔍 AssetManagerWithAPY - treasury address:", contractAddresses?.treasury);
  console.log("🔍 AssetManagerWithAPY - zHYPE token address:", contractAddresses?.zHypeToken);
  
  // Mock data for now - these should be fetched from contracts
  // Convert to wei format for proper formatting
  const hypeBalance = ethers.parseEther("0.008249").toString();
  const zhypeBalance = ethers.parseEther("0.000").toString();
  const stakedZhype = ethers.parseEther("0.000").toString();
  const treasuryBalance = ethers.parseEther("0.000").toString();
  const zhypeTotalSupply = ethers.parseEther("0.000").toString();
  
  // Handler functions
  const handleDeposit = () => {
    console.log('Deposit clicked:', depositAmount);
    // TODO: Implement deposit logic
  };
  
  const handleWithdraw = () => {
    console.log('Withdraw clicked:', withdrawAmount);
    // TODO: Implement withdraw logic
  };
  
  const handleStakeZhype = () => {
    console.log('Stake zHYPE clicked');
    // TODO: Implement zHYPE staking logic
  };
  
  const handleUnstakeZhype = () => {
    console.log('Unstake zHYPE clicked');
    // TODO: Implement zHYPE unstaking logic
  };
  
  
  // Removed modal states - now using inline interface
  const queryClient = useQueryClient();
  
  // Unstaking queue state
  const [unstakingQueue, setUnstakingQueue] = useState([]);
  
  // UnstakingQueue contract - use the same provider as other contracts
  const unstakingQueueContract = contractAddresses?.unstakingQueue && provider ? 
    new ethers.Contract(contractAddresses.unstakingQueue, UNSTAKING_QUEUE_ABI, provider) : null;
  
  console.log('🔍 UnstakingQueue contract setup:', {
    hasAddress: !!contractAddresses?.unstakingQueue,
    hasProvider: !!provider,
    hasContract: !!unstakingQueueContract,
    address: contractAddresses?.unstakingQueue,
    account: account
  });
  
  console.log('🔍 Query enabled check:', {
    unstakingQueueContract: !!unstakingQueueContract,
    account: !!account,
    enabled: !!unstakingQueueContract && !!account
  });

  // Main assets configuration - beautiful 2-card layout
  const mainAssets = [
    {
      address: 'native', // Special address for native HYPE
      symbol: 'HYPE',
      name: 'Hyperliquid Native',
      decimals: 18,
      color: '#FF6B35',
      isNative: true,
      apy: contractAPYs?.hypeAPY || 500.00
    }
  ];

  // zHYPE staking asset - separate below
  const zhypeAsset = {
    address: contractAddresses?.zHypeToken || '0x0000000000000000000000000000000000000000',
    symbol: 'zHYPE',
    name: 'zHYPE Token',
    decimals: 18,
    color: '#8B5CF6',
    isNative: false,
    isZHypeStaking: true, // Special flag for zHYPE staking
    apy: contractAPYs?.zhypeAPY || 17.00
  };

  // Treasury contract is now passed as a prop
  console.log("🏦 Treasury contract:", treasuryContract);

  // Fetch user balances for all assets
  const { data: userBalances, refetch: refetchBalances } = useQuery({
    queryKey: ['userBalances', account],
    queryFn: async () => {
      const balances = {};
      for (const asset of mainAssets) {
        try {
          console.log(`Checking ${asset.symbol} at address: ${asset.address}`);
          
          let balance;
          let depositBalance = '0';
          
          if (asset.isNative) {
            // Handle native HYPE token
            balance = await provider.getBalance(account);
            console.log(`${asset.symbol} native balance:`, balance.toString());
            
            // Get native deposit balance (zHYPE balance represents deposited amount)
            try {
              const zHypeTokenAddress = await treasuryContract.getZHypeTokenAddress();
              const zHypeTokenContract = new ethers.Contract(zHypeTokenAddress, ERC20_ABI, provider);
              depositBalance = await zHypeTokenContract.balanceOf(account);
            } catch (treasuryError) {
              console.log(`Treasury not configured for native ${asset.symbol}, using 0 for deposit balance`);
            }
          }
          
          console.log(`${asset.symbol} balance:`, balance.toString(), 'decimals:', asset.decimals);
          console.log(`${asset.symbol} formatted:`, ethers.formatUnits(balance, asset.decimals));
          
          balances[asset.address] = {
            balance: balance.toString(),
            depositBalance: depositBalance.toString(),
            decimals: asset.decimals
          };
        } catch (error) {
          console.error(`Error fetching balance for ${asset.symbol}:`, error);
          balances[asset.address] = {
            balance: '0',
            depositBalance: '0',
            decimals: asset.decimals,
            error: error.message
          };
        }
      }
      return balances;
    },
    enabled: !!account && !!provider,
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Fetch zHYPE token balance
  const { data: zHypeTokenBalance, error: zHypeError } = useQuery({
    queryKey: ['zHypeTokenBalance', account, contractAddresses.treasury],
    queryFn: async () => {
      console.log("🔍 Fetching zHYPE balance for account:", account);
      console.log("🔍 Treasury contract address:", contractAddresses.treasury);
      
      if (!contractAddresses.treasury || contractAddresses.treasury === '0x0000000000000000000000000000000000000000') {
        throw new Error("Treasury contract not available");
      }
      
      // Create treasury contract instance
      const treasuryContract = new ethers.Contract(
        contractAddresses.treasury,
        ["function getZHypeTokenAddress() external view returns (address)"],
        provider
      );
      
      // Get zHYPE token address from treasury contract
      const zHypeTokenAddress = await treasuryContract.getZHypeTokenAddress();
      console.log("🔍 zHYPE token address:", zHypeTokenAddress);
      
      // Create zHYPE token contract instance
      const zHypeTokenContract = new ethers.Contract(
        zHypeTokenAddress,
        ERC20_ABI,
        provider
      );
      
      // Get balance from zHYPE token contract
      const balance = await zHypeTokenContract.balanceOf(account);
      console.log("🔍 zHYPE balance:", ethers.formatEther(balance), "zHYPE");
      return balance.toString();
    },
    enabled: !!account && !!provider && !!contractAddresses.treasury && contractAddresses.treasury !== '0x0000000000000000000000000000000000000000',
    refetchInterval: 10000
  });

  // Debug logging
  console.log("🔍 zHYPE balance data:", zHypeTokenBalance);
  console.log("🔍 zHYPE error:", zHypeError);
  
  // Fallback zHYPE balance using ContractTest logic
  const [fallbackZHypeBalance, setFallbackZHypeBalance] = useState('0');
  
  useEffect(() => {
    const fetchFallbackBalance = async () => {
      if (!account || !provider || !contractAddresses.treasury || contractAddresses.treasury === '0x0000000000000000000000000000000000000000') {
        return;
      }
      
      try {
        console.log("🔄 Fetching fallback zHYPE balance...");
        const treasuryContract = new ethers.Contract(
          contractAddresses.treasury,
          ["function getZHypeTokenAddress() external view returns (address)"],
          provider
        );
        
        const zHypeTokenAddress = await treasuryContract.getZHypeTokenAddress();
        const zHypeTokenContract = new ethers.Contract(zHypeTokenAddress, ERC20_ABI, provider);
        const balance = await zHypeTokenContract.balanceOf(account);
        const formattedBalance = ethers.formatEther(balance);
        console.log("🔄 Fallback zHYPE balance:", formattedBalance);
        setFallbackZHypeBalance(formattedBalance);
      } catch (error) {
        console.error("❌ Fallback balance fetch failed:", error);
      }
    };
    
    fetchFallbackBalance();
  }, [account, provider, contractAddresses.treasury]);

  // Fetch APY information
  const { data: apyInfo, refetch: refetchAPYInfo } = useQuery({
    queryKey: ['apyInfo', contractAddresses.treasury],
    queryFn: async () => {
      if (!treasuryContract) return null;
      const [apy, totalDeposits, totalRewards] = await Promise.all([
        treasuryContract.getAPYPercentage(),
        treasuryContract.getTotalDeposits(),
        treasuryContract.getTotalRewardsDistributed()
      ]);
      return {
        apy: apy.toString(),
        totalDeposits: totalDeposits.toString(),
        totalRewards: totalRewards.toString()
      };
    },
    enabled: !!treasuryContract,
    refetchInterval: 30000
  });

  // Fetch user's pending rewards
  const { data: pendingRewards, refetch: refetchPendingRewards } = useQuery({
    queryKey: ['pendingRewards', account, contractAddresses.treasury],
    queryFn: async () => {
      if (!treasuryContract || !account) return '0';
      const rewards = await treasuryContract.getPendingRewards(account);
      return rewards.toString();
    },
    enabled: !!treasuryContract && !!account,
    refetchInterval: 10000
  });

  // Fetch HYPE withdrawal requests from Treasury
  const { data: hypeWithdrawalRequests, refetch: refetchHypeWithdrawals } = useQuery({
    queryKey: ['hypeWithdrawals', account, contractAddresses?.treasuryCore],
    queryFn: async () => {
      console.log('🚀 HYPE WITHDRAWAL QUERY STARTING!');
      if (!treasuryContract || !account) {
        console.log('❌ Missing treasury contract or account');
        return [];
      }
      
      try {
        // TODO: Implement HYPE withdrawal requests in Treasury contract
        // For now, return empty array as placeholder
        console.log('🔍 HYPE withdrawal requests not yet implemented in contract');
        return [];
      } catch (error) {
        console.error('❌ Error fetching HYPE withdrawals:', error);
        return [];
      }
    },
    enabled: !!treasuryContract && !!account,
    refetchInterval: 10000
  });

  // Fetch zHYPE unstaking requests from UnstakingQueue
  const { data: zhypeUnstakingRequests, refetch: refetchZhypeUnstaking } = useQuery({
    queryKey: ['zhypeUnstaking', account, contractAddresses?.unstakingQueue],
    queryFn: async () => {
      console.log('🚀 zHYPE UNSTAKING QUERY STARTING!');
      console.log('🔍 Contract check:', { 
        hasContract: !!unstakingQueueContract, 
        hasAccount: !!account,
        contractAddress: contractAddresses?.unstakingQueue,
        account: account
      });
      
      if (!unstakingQueueContract || !account) {
        console.log('❌ Missing contract or account - returning empty array');
        return [];
      }
      
      console.log('🔍 Fetching zHYPE unstaking requests for account:', account);
      console.log('🔍 Contract address:', contractAddresses.unstakingQueue);
      console.log('🔍 Contract instance:', unstakingQueueContract);
      
      try {
        let requests = [];
        
        // Try different function names to see which one works
        const functionNames = [
          'getUserUnstakingRequests',
          'getUserRequests', 
          'getRequests'
        ];
        
        for (const funcName of functionNames) {
          try {
            console.log(`🔍 Trying function: ${funcName}`);
            requests = await unstakingQueueContract[funcName](account);
            console.log(`✅ Success with ${funcName}:`, requests);
            break;
          } catch (funcError) {
            console.log(`❌ ${funcName} failed:`, funcError.message);
          }
        }
        
        // If array functions don't work, try the mapping approach
        if (!requests || requests.length === 0) {
          try {
            console.log('🔍 Trying mapping approach with requestCount');
            const count = await unstakingQueueContract.requestCount(account);
            console.log('📊 Request count:', count.toString());
            
            requests = [];
            for (let i = 0; i < Number(count); i++) {
              try {
                const request = await unstakingQueueContract.requests(account, i);
                requests.push(request);
              } catch (reqError) {
                console.log(`❌ Failed to get request ${i}:`, reqError.message);
              }
            }
            console.log('📋 Mapped requests:', requests);
          } catch (mapError) {
            console.log('❌ Mapping approach failed:', mapError.message);
          }
        }
        
        console.log('📋 Final zHYPE unstaking data:', requests);
        
        // Convert contract data to our format
        const formattedRequests = requests.map((request, index) => {
          console.log(`🔍 Processing request ${index}:`, request);
          
          // Handle different response formats
          let amount, timestamp, isUnstaking, completed;
          
          if (Array.isArray(request)) {
            // If it's an array, assume [amount, timestamp, isUnstaking, completed] or similar
            amount = request[0] || request.amount || '0';
            timestamp = request[1] || request.timestamp || '0';
            isUnstaking = request[2] !== undefined ? request[2] : (request.isUnstaking !== undefined ? request.isUnstaking : false);
            completed = request[3] !== undefined ? request[3] : (request.completed !== undefined ? request.completed : false);
          } else if (typeof request === 'object') {
            // If it's an object, extract properties
            amount = request.amount || '0';
            timestamp = request.timestamp || '0';
            isUnstaking = request.isUnstaking !== undefined ? request.isUnstaking : false;
            completed = request.completed !== undefined ? request.completed : false;
          } else {
            // If it's a single value, assume it's the amount
            amount = request || '0';
            timestamp = '0';
            isUnstaking = false;
            completed = false;
          }
          
          const timeRemaining = Math.max(0, 7 * 24 * 60 * 60 - (Date.now() / 1000 - Number(timestamp)));
          const isReadyToClaim = timeRemaining <= 0 || completed;
          
          console.log(`🔍 Processed request ${index}:`, {
            amount: amount.toString(),
            timestamp: timestamp.toString(),
            isUnstaking: isUnstaking,
            completed: completed,
            isReady: isReadyToClaim,
            timeRemaining: timeRemaining
          });
          
          return {
            id: `zhype-${index}`,
            amount: amount.toString(),
            timestamp: timestamp.toString(),
            processed: completed,
            readyTime: (Number(timestamp) + 7 * 24 * 60 * 60) * 1000, // 7 days in milliseconds
            type: 'zHYPE',
            isUnstaking: isUnstaking
          };
        });
        
        console.log('✅ Formatted zHYPE unstaking requests:', formattedRequests);
        return formattedRequests;
      } catch (error) {
        console.error('❌ Error fetching zHYPE unstaking requests:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          data: error.data
        });
        return [];
      }
    },
    enabled: !!unstakingQueueContract && !!account,
    refetchInterval: 30000
  });

  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: async ({ asset, amount }) => {
      console.log("🚀 Starting stake:", { asset: asset.symbol, amount: amount.toString(), isNative: asset.isNative });
      
      if (asset.isNative) {
        // Handle native HYPE stake
        console.log("💰 Staking native HYPE...");
        const stakeTx = await treasuryContract.deposit({ 
          value: amount,
          gasLimit: 200000
        });
        console.log("📝 Stake transaction sent:", stakeTx.hash);
        await stakeTx.wait();
        console.log("✅ Stake confirmed!");
      } else {
        throw new Error("Only native HYPE staking supported");
      }
    },
    onSuccess: () => {
      console.log("🎉 Stake successful!");
      queryClient.invalidateQueries(['userBalances']);
      queryClient.invalidateQueries(['zHypeTokenBalance']);
      queryClient.invalidateQueries(['pendingRewards']);
      queryClient.invalidateQueries(['apyInfo']);
      setShowStakeModal(false);
    },
    onError: (error) => {
      console.error("❌ Stake failed:", error);
    }
  });

  // Unstake mutation
  const unstakeMutation = useMutation({
    mutationFn: async ({ asset, amount }) => {
      if (asset.isNative) {
        // Handle native HYPE unstake - use requestUnstake for 7-day queue
        console.log("💰 Requesting unstake for HYPE...");
        console.log("💰 Amount to unstake:", amount, "zHYPE");
        console.log("💰 Amount type:", typeof amount);
        console.log("💰 Amount as string:", amount.toString());
        
        // Convert amount to wei for the contract
        const amountWei = ethers.parseEther(amount.toString());
        console.log("💰 Amount in wei:", amountWei.toString());
        
        const unstakeTx = await treasuryContract.requestUnstake(amountWei, {
          gasLimit: 200000
        });
        console.log("📝 Unstake request transaction sent:", unstakeTx.hash);
        await unstakeTx.wait();
        console.log("✅ Unstake request confirmed! Added to 7-day queue.");
      } else {
        throw new Error("Only native HYPE unstaking supported");
      }
    },
    onSuccess: () => {
      console.log("🎉 Unstake request successful! Added to 7-day queue.");
      queryClient.invalidateQueries(['userBalances']);
      queryClient.invalidateQueries(['zHypeTokenBalance']);
      queryClient.invalidateQueries(['pendingRewards']);
      queryClient.invalidateQueries(['apyInfo']);
      setShowUnstakeModal(false);
    },
    onError: (error) => {
      console.error("❌ Unstake failed:", error);
    }
  });

  // Claim rewards mutation
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      console.log("🎁 Claiming rewards...");
      console.log("🔍 Treasury contract:", treasuryContract);
      console.log("🔍 Contract address:", contractAddresses.treasury);
      
      if (!treasuryContract) {
        throw new Error("Treasury contract not initialized");
      }
      
      const claimTx = await treasuryContract.claimRewards({
        gasLimit: 150000
      });
      console.log("📝 Claim transaction sent:", claimTx.hash);
      await claimTx.wait();
      console.log("✅ Rewards claimed!");
    },
    onSuccess: () => {
      console.log("🎉 Rewards claimed successfully!");
      queryClient.invalidateQueries(['userBalances']);
      queryClient.invalidateQueries(['zHypeTokenBalance']);
      queryClient.invalidateQueries(['pendingRewards']);
      queryClient.invalidateQueries(['apyInfo']);
    },
    onError: (error) => {
      console.error("❌ Claim rewards failed:", error);
    }
  });

  // zHYPE Staking mutations
  const stakeZHypeMutation = useMutation({
    mutationFn: async ({ amount }) => {
      console.log("🔄 Staking zHYPE...");
      console.log("🔄 Amount to stake:", amount, "zHYPE");
      
      if (!treasuryContract) {
        throw new Error("Treasury contract not initialized");
      }
      
      // For now, we'll simulate the staking since the contract doesn't have this function yet
      // In the future, this will call: treasuryContract.stakeZHype(amountWei)
      console.log("⚠️ zHYPE staking not yet implemented in contract");
      throw new Error("zHYPE staking not yet implemented");
    },
    onSuccess: () => {
      console.log("🎉 zHYPE staked successfully!");
      queryClient.invalidateQueries(['userBalances']);
      queryClient.invalidateQueries(['zHypeTokenBalance']);
    },
    onError: (error) => {
      console.error("❌ zHYPE staking failed:", error);
    }
  });

  const unstakeZHypeMutation = useMutation({
    mutationFn: async ({ amount }) => {
      console.log("🔄 Requesting zHYPE unstake...");
      console.log("🔄 Amount to unstake:", amount, "zHYPE");
      
      if (!treasuryContract) {
        throw new Error("Treasury contract not initialized");
      }
      
      // For now, we'll simulate the unstaking since the contract doesn't have this function yet
      // In the future, this will call: treasuryContract.requestUnstakeZHype(amountWei)
      console.log("⚠️ zHYPE unstaking not yet implemented in contract");
      throw new Error("zHYPE unstaking not yet implemented");
    },
    onSuccess: () => {
      console.log("🎉 zHYPE unstake request successful! Added to 7-day queue.");
      queryClient.invalidateQueries(['userBalances']);
      queryClient.invalidateQueries(['zHypeTokenBalance']);
    },
    onError: (error) => {
      console.error("❌ zHYPE unstaking failed:", error);
    }
  });

  // Handle zHYPE staking action
  const handleStakeZHype = async (amount) => {
    if (!isConnected) {
      onConnect();
      return;
    }
    
    try {
      await stakeZHypeMutation.mutateAsync({ amount });
    } catch (error) {
      console.error("❌ zHYPE staking error:", error);
    }
  };

  // Handle zHYPE unstaking action
  const handleUnstakeZHype = async (amount) => {
    if (!isConnected) {
      onConnect();
      return;
    }
    
    try {
      await unstakeZHypeMutation.mutateAsync({ amount });
    } catch (error) {
      console.error("❌ zHYPE unstaking error:", error);
    }
  };

  // Handle claim rewards action
  const handleClaimRewards = async () => {
    if (!isConnected) {
      onConnect();
      return;
    }
    
    try {
      await claimRewardsMutation.mutateAsync();
    } catch (error) {
      console.error('Claim rewards error:', error);
    }
  };

  // Handle stake action with amount
  const handleStake = async (amount) => {
    if (!isConnected) {
      onConnect();
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) return;
    
    try {
      const asset = supportedAssets[0]; // HYPE asset
      const tx = await stakeMutation.mutateAsync({
        asset: asset,
        amount: ethers.parseEther(amount.toString())
      });
      console.log('Stake transaction:', tx);
    } catch (error) {
      console.error('Stake error:', error);
    }
  };

  // Handle unstake action with amount - now goes to queue
  const handleUnstake = async (amount) => {
    console.log("🔍 handleUnstake called with amount:", amount);
    
    if (!isConnected) {
      console.log("🔍 Not connected, calling onConnect");
      onConnect();
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      console.log("🔍 Invalid amount:", amount);
      return;
    }
    
    try {
      console.log("🔍 Starting unstake process...");
      const asset = supportedAssets[0]; // HYPE asset
      
      // Pass the amount in ether format to the mutation
      const tx = await unstakeMutation.mutateAsync({
        asset: asset,
        amount: parseFloat(amount) // Pass as number, not wei
      });
      
      console.log('✅ Unstake transaction successful:', tx);
    } catch (error) {
      console.error('❌ Unstake error:', error);
    }
  };

  const formatBalance = (balance, decimals) => {
    if (!balance) return '0';
    const formatted = ethers.formatUnits(balance, decimals);
    const num = parseFloat(formatted);
    // Format with up to 4 decimal places, removing trailing zeros
    return num.toFixed(4).replace(/\.?0+$/, '');
  };

  const formatAPY = (apy) => {
    if (!apy) return '0';
    return parseFloat(apy).toFixed(2);
  };

  // Unstaking queue functions
  const addToUnstakingQueue = (amount) => {
    const newRequest = {
      id: Date.now(),
      amount: amount,
      requestTime: Date.now(),
      processed: false,
      readyTime: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days in milliseconds
    };
    
    setUnstakingQueue(prev => [...prev, newRequest]);
    
    // Store in localStorage for persistence
    const stored = JSON.parse(localStorage.getItem('unstakingQueue') || '[]');
    stored.push(newRequest);
    localStorage.setItem('unstakingQueue', JSON.stringify(stored));
  };

  const processUnstakingRequest = (requestId) => {
    setUnstakingQueue(prev => prev.map(req => 
      req.id === requestId ? { ...req, processed: true } : req
    ));
    
    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('unstakingQueue') || '[]');
    const updated = stored.map(req => 
      req.id === requestId ? { ...req, processed: true } : req
    );
    localStorage.setItem('unstakingQueue', JSON.stringify(updated));
  };

  // Load unstaking queue from contract data
  useEffect(() => {
    if (zhypeUnstakingRequests) {
      console.log('🔄 Updating zHYPE unstaking queue with contract data:', zhypeUnstakingRequests);
      setUnstakingQueue(zhypeUnstakingRequests);
    }
  }, [zhypeUnstakingRequests]);

  // Get pending unstaking amount
  const getPendingUnstakingAmount = () => {
    return unstakingQueue
      .filter(req => !req.processed)
      .reduce((total, req) => total + parseFloat(ethers.formatEther(req.amount)), 0);
  };

  // Get ready requests (7 days have passed)
  const getReadyRequests = () => {
    const now = Date.now();
    return unstakingQueue.filter(req => 
      !req.processed && now >= req.readyTime
    );
  };

  return (
    <div className="asset-manager-content">
      {/* Left Column - Asset Management */}
      <div className="asset-management">
        <h2>Asset Management</h2>
        
        {/* Shield Asset Management Card */}
        <div className="asset-card shield-card">
          <div className="card-header">
            <div className="shield-icon">🛡️</div>
            <h3>HYPE Staking</h3>
          </div>
          
          <div className="asset-info">
            <div className="balance-display">
              <span className="balance-label">Your Balance</span>
              <span className="balance-amount">{formatBalance(hypeBalance, 18)} HYPE</span>
            </div>
            <div className="apy-display">
              <span className="apy-label">APY</span>
              <span className="apy-amount">500%</span>
            </div>
          </div>
          
          <div className="asset-actions">
            <button className="btn btn-primary" onClick={handleDeposit}>
              Stake
            </button>
            <button className="btn btn-secondary" onClick={handleWithdraw}>
              Unstake
            </button>
          </div>
        </div>

        {/* Deposit & Withdraw Card */}
        <div className="asset-card">
          <div className="tab-container">
            <button className="tab-button active">Deposit</button>
            <button className="tab-button">Withdraw</button>
          </div>
          
          <div className="form-group">
            <label className="form-label">AMOUNT TO DEPOSIT</label>
            <div className="input-group">
              <input 
                type="text" 
                className="input-field" 
                placeholder="0.000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button className="max-button">MAX</button>
            </div>
            <div className="available-text">Available: {formatBalance(hypeBalance, 18)} HYPE</div>
          </div>
          
          <button className="btn btn-primary" onClick={handleDeposit}>
            Deposit
          </button>
        </div>

        {/* zHYPE Staking Card */}
        <div className="asset-card zhype-card">
          <div className="card-header">
            <h3>zHYPE Staking</h3>
            <div className="auto-invest-toggle">
              <span className="toggle-label">Auto-Invest</span>
              <div className="toggle-switch">
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
          
          <div className="asset-info">
            <div className="balance-display">
              <span className="balance-label">Your zHYPE</span>
              <span className="balance-amount">{formatBalance(zhypeBalance, 18)} zHYPE</span>
            </div>
            <div className="staked-display">
              <span className="staked-label">Staked</span>
              <span className="staked-amount">{formatBalance(stakedZhype, 18)} zHYPE</span>
            </div>
            <div className="apy-display">
              <span className="apy-label">USDH APR</span>
              <span className="apy-amount">17%</span>
            </div>
          </div>
          
          <div className="asset-actions">
            <button className="btn btn-primary" onClick={handleStakeZhype}>
              Stake
            </button>
            <button className="btn btn-secondary" onClick={handleUnstakeZhype}>
              Unstake
            </button>
          </div>
        </div>

        {/* Claim Rewards Card */}
        <div className="reward-card">
          <div className="reward-amount">{formatBalance(pendingRewards || "0", 18)} HYPE</div>
          <div className="reward-label">Available to Claim</div>
          
          <div className="reward-stats">
            <div className="stat-row">
              <span className="stat-label">Daily APR</span>
              <span className="stat-value">1.37%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Annual APR</span>
              <span className="stat-value accent">500%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Last Claim</span>
              <span className="stat-value">Never</span>
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={handleClaimRewards}>
            Claim
          </button>
        </div>
      </div>

      {/* Right Column - Protocol Statistics */}
      <div className="protocol-stats">
        <h3>Protocol Overview</h3>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <span className="stat-value">500%</span>
              <span className="stat-label">APY</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-value">{formatBalance(treasuryBalance, 18)}</span>
              <span className="stat-label">TVL</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🪙</div>
            <div className="stat-content">
              <span className="stat-value">{formatBalance(zhypeTotalSupply, 18)}</span>
              <span className="stat-label">zHYPE</span>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">Active</span>
              <span className="stat-label">Status</span>
            </div>
          </div>
        </div>
        
        <div className="protocol-info">
          <div className="info-item">
            <span className="info-label">Network</span>
            <span className="info-value">Hyperliquid</span>
          </div>
          <div className="info-item">
            <span className="info-label">Version</span>
            <span className="info-value">v0.3</span>
          </div>
        </div>
        
        <div className="protocol-actions">
          <button className="btn btn-outline btn-sm">
            <span className="btn-icon">📊</span>
            View Details
          </button>
        </div>
      </div>

      {/* Withdrawal Queue Section - Now Separate */}
      <div className="withdrawal-queue-section">
        <h3>Withdrawal Queue</h3>
        
        {/* HYPE Withdrawal Requests */}
        <div className="queue-section">
          <h4>HYPE Withdrawals</h4>
          {hypeWithdrawalRequests && hypeWithdrawalRequests.length > 0 ? (
            <div className="queue-list">
              {hypeWithdrawalRequests.map((request) => (
                <div key={request.id} className="queue-item">
                  <div className="queue-info">
                    <span className="queue-amount">{formatBalance(request.amount, 18)} HYPE</span>
                    <span className="queue-status">
                      {request.processed ? 'Completed' : 
                       Date.now() >= request.readyTime ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                  <div className="queue-time">
                    {request.processed ? 'Processed' : 
                     Date.now() >= request.readyTime ? 'Ready to claim' : 
                     `Ready in ${Math.ceil((request.readyTime - Date.now()) / (1000 * 60 * 60 * 24))} days`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No HYPE withdrawal requests</p>
          )}
        </div>

        {/* zHYPE Unstaking Requests */}
        <div className="queue-section">
          <h4>zHYPE Unstaking</h4>
          {zhypeUnstakingRequests && zhypeUnstakingRequests.length > 0 ? (
            <div className="queue-list">
              {zhypeUnstakingRequests.map((request) => (
                <div key={request.id} className="queue-item">
                  <div className="queue-info">
                    <span className="queue-amount">{formatBalance(request.amount, 18)} zHYPE</span>
                    <span className="queue-status">
                      {request.processed ? 'Completed' : 
                       Date.now() >= request.readyTime ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                  <div className="queue-time">
                    {request.processed ? 'Processed' : 
                     Date.now() >= request.readyTime ? 'Ready to claim' : 
                     `Ready in ${Math.ceil((request.readyTime - Date.now()) / (1000 * 60 * 60 * 24))} days`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No zHYPE unstaking requests</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetManagerWithAPY;

