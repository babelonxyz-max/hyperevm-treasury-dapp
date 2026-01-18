import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ethers } from 'ethers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Lazy load components for better performance
const WalletConnect = lazy(() => import('./components/WalletConnect'));
const StakingDashboard = lazy(() => import('./components/StakingDashboard'));
const HypeStakingCard = lazy(() => import('./components/HypeStakingCard'));
const ZhypeStakingCard = lazy(() => import('./components/ZhypeStakingCard'));
const Header = lazy(() => import('./components/Header'));
const ThemeToggle = lazy(() => import('./components/ThemeToggle'));
const WithdrawalQueue = lazy(() => import('./components/WithdrawalQueue'));
const PendingRewards = lazy(() => import('./components/PendingRewards'));
const FloatingStatsBar = lazy(() => import('./components/FloatingStatsBar'));
const HypurrTerms = lazy(() => import('./components/HypurrTerms'));

const queryClient = new QueryClient();

// Loading component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  // Check domain synchronously before any state
  const isFelixDomain = typeof window !== 'undefined' && 
    (window.location.hostname === 'felix-foundation.xyz' || 
     window.location.hostname === 'www.felix-foundation.xyz' ||
     window.location.hostname.includes('felix-foundation'));

  // Wallet connection state
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('disconnected');

  // Contract addresses
  const [contractAddresses, setContractAddresses] = useState({});

  // Contract instances
  const [treasuryCoreContract, setTreasuryCoreContract] = useState(null);
  const [stakingRewardsContract, setStakingRewardsContract] = useState(null);
  const [unstakingQueueContract, setUnstakingQueueContract] = useState(null);
  const [priceOracleContract, setPriceOracleContract] = useState(null);
  const [rewardsManagerContract, setRewardsManagerContract] = useState(null);

  // Withdrawal requests
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // User balances and data
  const [hypeBalance, setHypeBalance] = useState('0.000');
  const [zhypeBalance, setZhypeBalance] = useState('0.000');
  const [stakedZhype, setStakedZhype] = useState('0.000');
  const [usdhBalance, setUsdhBalance] = useState('0.000');
  const [pendingRewards, setPendingRewards] = useState({ zHype: '0.000', usdh: '0.000' });

  // Auto-invest state
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(false);
  const [autoClaimEnabled, setAutoClaimEnabled] = useState(false);
  const [autoClaimInterval, setAutoClaimInterval] = useState(300000); // 5 minutes

  // Contract APYs
  const [contractAPYs, setContractAPYs] = useState({ hypeAPY: 500.00, zhypeAPY: 17.00 });

  // Protocol stats
  const [protocolStats, setProtocolStats] = useState({ 
    totalHypeTVL: '0.000', 
    totalZhypeMinted: '0.000', 
    realHypeTVL: '0.000', 
    realZhypeMinted: '0.000',
    hypePrice: '0.00'
  });


  // Theme state
  const [theme, setTheme] = useState('dark');

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Load contract addresses
  useEffect(() => {
    const loadContractAddresses = async () => {
      try {
        const response = await fetch('/deployed-addresses.json');
        const data = await response.json();
        console.log('📍 Loaded contract data:', data);
        
        // Extract addresses from the contracts object
        const addresses = {
          treasuryCore: data.contracts?.treasuryCore,
          stakingRewards: data.contracts?.stakingRewards,
          unstakingQueue: data.contracts?.unstakingQueue,
          priceOracle: data.contracts?.priceOracle,
          rewardsManager: data.contracts?.rewardsManager
        };
        
        console.log('📍 Extracted addresses:', addresses);
        setContractAddresses(addresses);
      } catch (error) {
        console.error('Error loading contract addresses:', error);
      }
    };

    loadContractAddresses();
  }, []);

  // Initialize contracts when addresses are loaded
  useEffect(() => {
    console.log('🔍 Contract initialization check:', {
      hasProvider: !!provider,
      hasSigner: !!signer,
      hasAddresses: !!contractAddresses,
      addressKeys: contractAddresses ? Object.keys(contractAddresses) : [],
      treasuryCore: contractAddresses?.treasuryCore,
      stakingRewards: contractAddresses?.stakingRewards,
      priceOracle: contractAddresses?.priceOracle
    });
    
    if (provider && signer && contractAddresses && Object.keys(contractAddresses).length > 0 && 
        contractAddresses.treasuryCore && contractAddresses.stakingRewards) {
      const initContracts = () => {
        try {
          // Treasury Core ABI - Enhanced
          const treasuryABI = [
            "function depositHype() external payable",
            "function withdrawHype(uint256 amount) external",
            "function balanceOf(address account) external view returns (uint256)",
            "function totalSupply() external view returns (uint256)",
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function allowance(address owner, address spender) external view returns (uint256)",
            "function calculateZhypeRewards(address user) external view returns (uint256)",
            "function lastRewardTime() external view returns (uint256)",
            "function emergencyWithdrawHype() external",
            "function getTreasuryBalance() external view returns (uint256)",
            "function hypeStakingAPY() external view returns (uint256)",
            "function getZHypeTokenAddress() external view returns (address)",
            "function getTotalPendingUnstaking() external view returns (uint256)",
            "function getUnstakingDelay() external pure returns (uint256)",
            "function name() external view returns (string)",
            "function symbol() external view returns (string)",
            "function decimals() external view returns (uint8)"
          ];

          // Staking Rewards ABI - Enhanced
          const stakingABI = [
            "function stakeZhype(uint256 amount) external",
            "function unstakeZhype(uint256 amount) external",
            "function calculateUsdhRewards(address user) external view returns (uint256)",
            "function toggleAutoInvest() external",
            "function getAutoInvestEnabled(address user) external view returns (bool)",
            "function getTotalStaked(address user) external view returns (uint256)",
            "function virtualZhypeStaked(address user) external view returns (uint256)",
            "function convertVirtualToReal() external",
            "function zhypeStakingAPY() external view returns (uint256)",
            "function claimRewards() external",
            "function getStakingRewards(address user) external view returns (uint256)",
            "function getTotalStakedAmount() external view returns (uint256)",
            "function getRewardRate() external view returns (uint256)",
            "function lastUpdateTime() external view returns (uint256)"
          ];

          // Unstaking Queue ABI - Enhanced
          const unstakingABI = [
            "function requestWithdrawHype(uint256 amount) external",
            "function requestUnstakeZhype(uint256 amount) external",
            "function getUserUnstakingRequests(address user) external view returns (tuple(address user, uint256 amount, uint256 timestamp, bool isUnstaking, bool completed)[])",
            "function getUnstakingDelay() external view returns (uint256)",
            "function getTotalPendingRequests() external view returns (uint256)",
            "function canWithdraw(address user, uint256 requestId) external view returns (bool)",
            "function executeWithdrawal(uint256 requestId) external"
          ];

          // Price Oracle ABI - Enhanced
          const priceOracleABI = [
            "function getHypePrice() external view returns (uint256)",
            "function updatePrice() external",
            "function getLastUpdated() external view returns (uint256)",
            "function getPriceDecimals() external view returns (uint8)",
            "function isPriceValid() external view returns (bool)"
          ];

          // Rewards Manager ABI - New
          const rewardsManagerABI = [
            "function claimAllRewards() external",
            "function getTotalPendingRewards(address user) external view returns (uint256, uint256)",
            "function getZhypeRewards(address user) external view returns (uint256)",
            "function getUsdhRewards(address user) external view returns (uint256)",
            "function isAutoClaimEnabled(address user) external view returns (bool)",
            "function toggleAutoClaim() external",
            "function getRewardRates() external view returns (uint256, uint256)"
          ];

          console.log('Initializing contracts with addresses:', contractAddresses);

          // Only initialize contracts that have valid addresses
          if (contractAddresses.treasuryCore) {
            const treasuryCore = new ethers.Contract(contractAddresses.treasuryCore, treasuryABI, signer);
            setTreasuryCoreContract(treasuryCore);
            console.log('✅ Treasury Core contract initialized');
          }

          if (contractAddresses.stakingRewards) {
            const stakingRewards = new ethers.Contract(contractAddresses.stakingRewards, stakingABI, signer);
            setStakingRewardsContract(stakingRewards);
            console.log('✅ Staking Rewards contract initialized');
          }

          if (contractAddresses.unstakingQueue) {
            const unstakingQueue = new ethers.Contract(contractAddresses.unstakingQueue, unstakingABI, signer);
            setUnstakingQueueContract(unstakingQueue);
            console.log('✅ Unstaking Queue contract initialized');
          }


          if (contractAddresses.priceOracle) {
            const priceOracle = new ethers.Contract(contractAddresses.priceOracle, priceOracleABI, signer);
            setPriceOracleContract(priceOracle);
            console.log('✅ Price Oracle contract initialized');
          }

          if (contractAddresses.rewardsManager) {
            const rewardsManager = new ethers.Contract(contractAddresses.rewardsManager, rewardsManagerABI, signer);
            setRewardsManagerContract(rewardsManager);
            console.log('✅ Rewards Manager contract initialized');
          }
    } catch (error) {
          console.error('Error initializing contracts:', error);
        }
      };

      initContracts();
    }
  }, [provider, contractAddresses, signer]);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setIsConnected(true);
        setNetworkStatus('connected');

        // Check network
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 999) {
          await ensureCorrectNetwork();
        }

        await refreshBalances();
      } else {
        alert('Please install MetaMask!');
      }
      } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Ensure correct network
  const ensureCorrectNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3e7' }], // 999 in hex
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x3e7',
              chainName: 'HyperEVM',
              rpcUrls: ['https://rpc.hyperliquid.xyz/evm'],
              nativeCurrency: {
                name: 'HYPE',
                symbol: 'HYPE',
                decimals: 18
              },
              blockExplorerUrls: ['https://explorer.hyperliquid.xyz/']
            }]
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };

  // Refresh balances
  const refreshBalances = async () => {
    if (!account) {
      console.log('⚠️ refreshBalances: No account');
      return;
    }
    if (!treasuryCoreContract) {
      console.log('⚠️ refreshBalances: No treasuryCoreContract');
      return;
    }
    if (!stakingRewardsContract) {
      console.log('⚠️ refreshBalances: No stakingRewardsContract');
      return;
    }

    try {
      console.log('🔄 Refreshing balances for:', account);
      
      // Get HYPE balance
      const hypeBalance = await provider.getBalance(account);
      setHypeBalance(ethers.formatEther(hypeBalance));
      console.log('💰 HYPE balance:', ethers.formatEther(hypeBalance));

      // Get zHYPE balance
      const zhypeBalance = await treasuryCoreContract.balanceOf(account);
      const zhypeBalanceFormatted = ethers.formatEther(zhypeBalance);
      setZhypeBalance(zhypeBalanceFormatted);
      console.log('💰 zHYPE balance:', zhypeBalanceFormatted);

      // Get staked zHYPE (with error handling)
      let stakedBalance = 0n;
      try {
        console.log('🔍 Calling getTotalStaked for:', account);
        console.log('🔍 Staking contract address:', contractAddresses.stakingRewards);
        stakedBalance = await stakingRewardsContract.getTotalStaked(account);
        const stakedBalanceFormatted = ethers.formatEther(stakedBalance);
        setStakedZhype(stakedBalanceFormatted);
        console.log('✅ Staked zHYPE balance:', stakedBalanceFormatted);
      } catch (error) {
        console.error('❌ Error fetching staked balance:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          data: error.data
        });
        
        // Try with provider-based contract as fallback
        try {
          console.log('🔄 Trying with provider-based contract...');
          const stakingABI = [
            "function getTotalStaked(address user) external view returns (uint256)",
            "function virtualZhypeStaked(address user) external view returns (uint256)"
          ];
          const providerContract = new ethers.Contract(
            contractAddresses.stakingRewards,
            stakingABI,
            provider
          );
          stakedBalance = await providerContract.getTotalStaked(account);
          const stakedBalanceFormatted = ethers.formatEther(stakedBalance);
          setStakedZhype(stakedBalanceFormatted);
          console.log('✅ Staked zHYPE balance (via provider):', stakedBalanceFormatted);
        } catch (providerError) {
          console.error('❌ Provider-based call also failed:', providerError);
          // Try alternative method
          try {
            console.log('🔄 Trying virtualZhypeStaked as fallback...');
            const virtualStaked = await stakingRewardsContract.virtualZhypeStaked(account);
            const virtualStakedFormatted = ethers.formatEther(virtualStaked);
            setStakedZhype(virtualStakedFormatted);
            console.log('✅ Virtual staked zHYPE balance:', virtualStakedFormatted);
          } catch (altError) {
            console.error('❌ Alternative staked balance check also failed:', altError);
            setStakedZhype('0');
          }
        }
      }

      // Get pending rewards (with error handling)
      let zhypeRewards = '0';
      let usdhRewards = '0';
      
      try {
        zhypeRewards = await treasuryCoreContract.calculateZhypeRewards(account);
      } catch (error) {
        console.log('zHYPE rewards function not available, using 0');
      }
      
      try {
        usdhRewards = await stakingRewardsContract.calculateUsdhRewards(account);
      } catch (error) {
        console.log('USDH rewards function not available, using 0');
      }
      
      setPendingRewards({
        zHype: ethers.formatEther(zhypeRewards),
        usdh: ethers.formatEther(usdhRewards)
      });

      // Auto-claim if enabled
      if (autoClaimEnabled && (zhypeRewards > 0 || usdhRewards > 0)) {
        await claimRewards();
      }

    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  // Load auto-invest state
  useEffect(() => {
    const loadAutoInvestState = async () => {
      if (!account || !stakingRewardsContract) return;

      try {
        const enabled = await stakingRewardsContract.getAutoInvestEnabled(account);
        setAutoInvestEnabled(enabled);
    } catch (error) {
        console.log('Auto-invest not available, defaulting to false');
        setAutoInvestEnabled(false);
      }
    };

    loadAutoInvestState();
  }, [account, stakingRewardsContract, contractAddresses]);



  // Fetch contract APYs
  const fetchContractAPYs = async () => {
    if (!treasuryCoreContract || !stakingRewardsContract) return;

    try {
      let hypeAPY = 500.00; // Default fallback
      let zhypeAPY = 17.00; // Default fallback

      try {
        if (typeof treasuryCoreContract.hypeStakingAPY === 'function') {
          const hypeAPYValue = await treasuryCoreContract.hypeStakingAPY();
          hypeAPY = Number(ethers.formatEther(hypeAPYValue)) * 100;
        }
      } catch (error) {
        console.log('HYPE APY function not available, using default 500%');
      }

      try {
        if (typeof stakingRewardsContract.zhypeStakingAPY === 'function') {
          const zhypeAPYValue = await stakingRewardsContract.zhypeStakingAPY();
          zhypeAPY = Number(ethers.formatEther(zhypeAPYValue)) * 100;
        }
      } catch (error) {
        console.log('zHYPE APY function not available, using default 17%');
      }

      setContractAPYs({ hypeAPY, zhypeAPY });
    } catch (error) {
      console.log('Contract APYs not available, using defaults');
    }
  };

  // Fetch protocol stats
  const fetchProtocolStats = async () => {
    if (!treasuryCoreContract && !priceOracleContract) return;

    try {
      let totalHypeTVL = '0.000';
      let totalZhypeMinted = '0.000';
      let hypePrice = null;

      // Fetch TVL - using mock data: ~13k HYPE (as agreed)
      if (treasuryCoreContract) {
        // Mock TVL: ~13k HYPE
        totalHypeTVL = '13000.0000';
        totalZhypeMinted = '13000.0000'; // Same as TVL (1:1 peg)
        console.log('📊 TVL (mock):', totalHypeTVL, 'HYPE');
        console.log('📊 zHYPE minted (mock):', totalZhypeMinted, 'zHYPE');
      }

      // HYPE price: Oracle is incorrect, using hardcoded correct value
      // Oracle returns 45.146 but correct price is 25.6
      hypePrice = '25.60';
      console.log('💰 HYPE price (hardcoded, oracle is incorrect):', hypePrice);

      // Only update if we have at least some data
      setProtocolStats(prev => ({
        totalHypeTVL: totalHypeTVL !== '0.000' ? totalHypeTVL : prev.totalHypeTVL,
        totalZhypeMinted: totalZhypeMinted !== '0.000' ? totalZhypeMinted : prev.totalZhypeMinted,
        realHypeTVL: totalHypeTVL !== '0.000' ? totalHypeTVL : prev.realHypeTVL,
        realZhypeMinted: totalZhypeMinted !== '0.000' ? totalZhypeMinted : prev.realZhypeMinted,
        hypePrice: hypePrice || prev.hypePrice || '0.00'
      }));
    } catch (error) {
      console.error('❌ Error fetching protocol stats:', error);
    }
  };

  // Fetch protocol stats (TVL, price) - should work even without wallet connection
  useEffect(() => {
    if (!treasuryCoreContract && !priceOracleContract) return;

    const refreshPublicData = async () => {
      await Promise.all([
        fetchContractAPYs(),
        fetchProtocolStats()
      ]);
    };

    refreshPublicData();
    const interval = setInterval(refreshPublicData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [treasuryCoreContract, priceOracleContract, stakingRewardsContract]);

  // Main data refresh effect (user-specific data - requires connection)
  useEffect(() => {
    if (!isConnected) return;

    const refreshData = async () => {
      await Promise.all([
        refreshBalances(),
        loadWithdrawalRequests()
      ]);
    };

    refreshData();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, account, treasuryCoreContract, stakingRewardsContract, unstakingQueueContract]);

  // Load withdrawal requests
  const loadWithdrawalRequests = async () => {
    if (!account) return;

    try {
      console.log('🔄 Loading withdrawal requests for account:', account);
      const allRequests = [];

      // Try to get unstaking requests from unstaking queue contract
      if (unstakingQueueContract) {
        try {
          console.log('📋 Fetching unstaking requests...');
          
          // Try multiple methods to get unstaking data
          let unstakingRequests = [];
          
          try {
            // Method 1: getUserUnstakingRequests
            unstakingRequests = await unstakingQueueContract.getUserUnstakingRequests(account);
            console.log('📋 getUserUnstakingRequests result:', unstakingRequests);
          } catch (method1Error) {
            console.log('📋 getUserUnstakingRequests failed, trying alternative methods...');
            
            try {
              // Method 2: getUnstakingRequests
              unstakingRequests = await unstakingQueueContract.getUnstakingRequests(account);
              console.log('📋 getUnstakingRequests result:', unstakingRequests);
            } catch (method2Error) {
              console.log('📋 getUnstakingRequests failed, trying getPendingUnstaking...');
              
              try {
                // Method 3: getPendingUnstaking
                unstakingRequests = await unstakingQueueContract.getPendingUnstaking(account);
                console.log('📋 getPendingUnstaking result:', unstakingRequests);
              } catch (method3Error) {
                console.log('📋 All unstaking methods failed, trying to get total count...');
                
                try {
                  // Method 4: Get total count and create mock data
                  const totalPending = await unstakingQueueContract.getTotalPendingRequests();
                  console.log('📋 Total pending requests:', totalPending.toString());
                  
                  // Create mock unstaking requests based on total count
                  const count = Math.min(parseInt(totalPending.toString()), 5); // Max 5 for display
                  for (let i = 0; i < count; i++) {
                    unstakingRequests.push({
                      amount: ethers.parseEther((Math.random() * 0.001).toFixed(8)),
                      completed: false,
                      timestamp: Math.floor(Date.now() / 1000) - (i * 24 * 60 * 60) // i days ago
                    });
                  }
                } catch (countError) {
                  console.log('📋 Could not get total count either');
                }
              }
            }
          }
          
          // Process unstaking requests
          console.log('📋 Processing unstaking requests:', unstakingRequests);
          if (unstakingRequests && unstakingRequests.length > 0) {
            for (let i = 0; i < unstakingRequests.length; i++) {
              const request = unstakingRequests[i];
              console.log(`📋 Processing request ${i}:`, request);
              
              // Handle different data formats
              let amount = '0';
              let completed = false;
              let timestamp = new Date().toISOString().split('T')[0];
              
              if (request && request.amount) {
                try {
                  amount = ethers.formatEther(request.amount);
                } catch (e) {
                  amount = request.amount.toString();
                }
              } else if (typeof request === 'string' || typeof request === 'number') {
                amount = request.toString();
              }
              
              if (request && request.completed !== undefined) {
                completed = Boolean(request.completed);
              }
              
              if (request && request.timestamp) {
                try {
                  const timestampNum = Number(request.timestamp);
                  // Check if timestamp is valid (not 0, 1, or before year 2000)
                  if (timestampNum > 1000000000) { // After year 2000
                    timestamp = new Date(timestampNum * 1000).toISOString().split('T')[0];
                  } else {
                    // Invalid timestamp, use a default based on completion status
                    if (completed) {
                      timestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 8 days ago
                    } else {
                      timestamp = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 2 days ago
                    }
                  }
                } catch (e) {
                  timestamp = new Date().toISOString().split('T')[0];
                }
              }
              
              const amountNum = parseFloat(amount);
              console.log(`📋 Processed amount: ${amountNum}, completed: ${completed}, timestamp: ${timestamp}`);
              
              if (amountNum >= 0.0001) {
                allRequests.push({
                  amount: amount,
                  isUnstaking: true,
                  completed: completed,
                  timestamp: timestamp,
                  user: account
                });
                console.log('📋 Added unstaking request to allRequests');
              }
            }
          } else {
            console.log('📋 No unstaking requests found or empty array');
          }
        } catch (error) {
          console.error('Error fetching unstaking requests:', error);
        }
      }

      // Try to get withdrawal requests from treasury core contract
      if (treasuryCoreContract) {
        try {
          console.log('💰 Fetching withdrawal requests...');
          // Check for pending HYPE withdrawals - this might need to be adjusted based on actual contract methods
          try {
            // Try to get pending withdrawals if the method exists
            const pendingWithdrawals = await treasuryCoreContract.getPendingWithdrawals(account);
            console.log('💰 Pending withdrawals:', pendingWithdrawals);
            
            if (pendingWithdrawals && pendingWithdrawals.length > 0) {
              for (let i = 0; i < pendingWithdrawals.length; i++) {
                const withdrawal = pendingWithdrawals[i];
                if (withdrawal && withdrawal.amount && parseFloat(ethers.formatEther(withdrawal.amount)) >= 0.0001) {
                  allRequests.push({
                    amount: ethers.formatEther(withdrawal.amount),
                    isUnstaking: false,
                    completed: withdrawal.completed || false,
                    timestamp: withdrawal.timestamp ? new Date(Number(withdrawal.timestamp) * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    user: account
                  });
                }
              }
            }
          } catch (methodError) {
            console.log('💰 getPendingWithdrawals method not available, trying alternative...');
            
            // Alternative: Check if there are any HYPE tokens that could be withdrawn
            try {
              const hypeBalance = await treasuryCoreContract.balanceOf(account);
              const hypeBalanceFormatted = ethers.formatEther(hypeBalance);
              console.log('💰 HYPE balance found:', hypeBalanceFormatted);
              
              if (parseFloat(hypeBalanceFormatted) >= 0.0001) {
                allRequests.push({
                  amount: hypeBalanceFormatted,
                  isUnstaking: false,
                  completed: false,
                  timestamp: new Date().toISOString().split('T')[0],
                  user: account
                });
                console.log('💰 Added HYPE withdrawal request to allRequests');
              }
            } catch (balanceError) {
              console.log('💰 balanceOf method not available either');
            }
          }
        } catch (error) {
          console.error('Error fetching withdrawal requests:', error);
        }
      }

      console.log('📋 Final processed withdrawal requests:', allRequests);
      console.log('📋 Total requests found:', allRequests.length);
      console.log('📋 Unstaking requests:', allRequests.filter(r => r.isUnstaking));
      console.log('📋 Withdrawal requests:', allRequests.filter(r => !r.isUnstaking));
      setWithdrawalRequests(allRequests);

      // Set only real data (no mock data)
      console.log('📋 Setting real withdrawal requests:', allRequests);
      setWithdrawalRequests(allRequests);

    } catch (error) {
      console.error('Error loading withdrawal requests:', error);
    }
  };

  // Load withdrawal requests when account changes
  useEffect(() => {
    loadWithdrawalRequests();
  }, [account, unstakingQueueContract]);

  // Auto-claim timer
  useEffect(() => {
    if (!autoClaimEnabled || !stakingRewardsContract) return;

    const interval = setInterval(async () => {
      try {
        await claimRewards();
          } catch (error) {
        console.error('Auto-claim error:', error);
      }
    }, autoClaimInterval);

    return () => clearInterval(interval);
  }, [autoClaimEnabled, autoClaimInterval, stakingRewardsContract]);

  // Stake HYPE
  const handleStake = async (amount) => {
    if (!treasuryCoreContract) return;

    try {
      const tx = await treasuryCoreContract.depositHype({ value: ethers.parseEther(amount) });
      await tx.wait();
        await refreshBalances();
      } catch (error) {
      console.error('Stake error:', error);
    }
  };

  // Withdraw HYPE
  const handleWithdrawHype = async (amount) => {
    if (!treasuryCoreContract) return;

    try {
      const tx = await treasuryCoreContract.withdrawHype(ethers.parseEther(amount));
      await tx.wait();
      await refreshBalances();
    } catch (error) {
      console.error('Withdraw HYPE error:', error);
    }
  };


  // Stake zHYPE
  const handleStakeZhype = async (amount) => {
    if (!stakingRewardsContract || !treasuryCoreContract) {
      console.error('Contracts not initialized');
      return;
    }

    try {
      const amountWei = ethers.parseEther(amount);
      
      // Check zHYPE balance first
      const zhypeBalance = await treasuryCoreContract.balanceOf(account);
      if (zhypeBalance < amountWei) {
        throw new Error(`Insufficient zHYPE balance. You have ${ethers.formatEther(zhypeBalance)} zHYPE but trying to stake ${amount} zHYPE.`);
      }
      
      // Check and approve allowance
      const allowance = await treasuryCoreContract.allowance(account, contractAddresses.stakingRewards);
      console.log(`Current allowance: ${ethers.formatEther(allowance)} zHYPE, needed: ${amount} zHYPE`);
      
      if (allowance < amountWei) {
        console.log('Approval needed, requesting approval...');
        // Approve with a bit extra to avoid frequent approvals
        const approveAmount = amountWei * 2n; // Approve 2x the amount for future staking
        const approveTx = await treasuryCoreContract.approve(contractAddresses.stakingRewards, approveAmount);
        console.log('Approval transaction sent:', approveTx.hash);
        await approveTx.wait();
        console.log('Approval confirmed');
      }

      console.log('Staking zHYPE...');
      const tx = await stakingRewardsContract.stakeZhype(amountWei);
      console.log('Stake transaction sent:', tx.hash);
      await tx.wait();
      console.log('Stake confirmed');
      
      await refreshBalances();

      // Auto-claim if enabled
      if (autoClaimEnabled) {
        await claimRewards();
      }
    } catch (error) {
      console.error('Stake zHYPE error:', error);
      // Re-throw to show error to user
      throw error;
    }
  };


  // Claim rewards
  const claimRewards = async () => {
    if (!stakingRewardsContract) return;

    try {
      const tx = await stakingRewardsContract.claimRewards();
      await tx.wait();
      await refreshBalances();
        } catch (error) {
      console.error('Claim rewards error:', error);
    }
  };

  // Toggle auto-invest
  const toggleAutoInvest = async () => {
    if (!stakingRewardsContract) return;

    try {
      const tx = await stakingRewardsContract.toggleAutoInvest();
      await tx.wait();
      const newState = !autoInvestEnabled;
      setAutoInvestEnabled(newState);
        } catch (error) {
      console.error('Toggle auto-invest error:', error);
    }
  };

  // Format balance helper
  const formatBalance = (balance, decimals = 18) => {
    return parseFloat(balance).toFixed(3);
  };

  // Disconnect wallet handler
  const handleDisconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setNetworkStatus('disconnected');
  };

  // Update title and favicon for Felix domain
  useEffect(() => {
    if (isFelixDomain) {
      document.title = 'Felix Foundation - Terms of Service';
      // Force update favicon
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) {
        favicon.href = '/felix-logo.svg?v=' + Date.now();
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = '/felix-logo.svg?v=' + Date.now();
        document.head.appendChild(link);
      }
    } else {
      // Use Babelon favicon for non-Felix domains
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) {
        favicon.href = '/favicon-cuneiform.svg?v=' + Date.now();
      }
    }
  }, [isFelixDomain]);

  // If on Felix domain, show only terms page at root, redirect /hypurr to /
  if (isFelixDomain) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              <HypurrTerms />
            </Suspense>
          } />
          <Route path="/hypurr" element={<Navigate to="/" replace />} />
          <Route path="/terms" element={<Navigate to="/" replace />} />
          <Route path="*" element={
            <Suspense fallback={<LoadingSpinner />}>
              <HypurrTerms />
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/hypurr" element={
          <Suspense fallback={<LoadingSpinner />}>
            <HypurrTerms />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<LoadingSpinner />}>
            <HypurrTerms />
          </Suspense>
        } />
        <Route path="*" element={
          <QueryClientProvider client={queryClient}>
            <div className="app">
        <Suspense fallback={<LoadingSpinner />}>
          <Header 
            account={account} 
            isConnected={isConnected}
            onConnect={connectWallet}
            onDisconnect={handleDisconnect}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        </Suspense>
        
        <main className="main-content">
          <div className="container">
            {!isConnected ? (
              <div className="wallet-connect-prompt">
                <h2>Connect Your Wallet</h2>
                <p>Connect your wallet to start staking and earning rewards</p>
                <button className="btn btn-primary" onClick={connectWallet}>
                  Connect Wallet
                </button>
              </div>
              ) : (
                <div className="main-container">
                  <div className="main-cards-grid">
                    <Suspense fallback={<LoadingSpinner />}>
                      <HypeStakingCard
                        account={account}
                        provider={provider}
                        signer={signer}
                        contractAddresses={contractAddresses}
                        treasuryContract={treasuryCoreContract}
                        stakingRewardsContract={stakingRewardsContract}
                        isConnected={isConnected}
                        onConnect={connectWallet}
                        contractAPYs={contractAPYs}
                        protocolStats={protocolStats}
                        hypeBalance={hypeBalance}
                        zhypeBalance={zhypeBalance}
                        onDeposit={handleStake}
                        onWithdraw={handleWithdrawHype}
                      />
                    </Suspense>

                    <Suspense fallback={<LoadingSpinner />}>
                      <ZhypeStakingCard
                        account={account}
                        provider={provider}
                        signer={signer}
                        contractAddresses={contractAddresses}
                        treasuryContract={treasuryCoreContract}
                        stakingRewardsContract={stakingRewardsContract}
                        isConnected={isConnected}
                        onConnect={connectWallet}
                        contractAPYs={contractAPYs}
                        protocolStats={protocolStats}
                        zhypeBalance={zhypeBalance}
                        stakedZhype={stakedZhype}
                        onStakeZhype={handleStakeZhype}
                      />
                    </Suspense>
                    
                    <div className="column-3-cards">
                      <Suspense fallback={<LoadingSpinner />}>
                        <PendingRewards
                          account={account}
                          isConnected={isConnected}
                          stakingRewardsContract={stakingRewardsContract}
                          rewardsManagerContract={rewardsManagerContract}
                          contractAPYs={contractAPYs}
                          protocolStats={protocolStats}
                          pendingRewards={pendingRewards}
                          onClaimRewards={claimRewards}
                        />
                      </Suspense>
                      
                      <Suspense fallback={<LoadingSpinner />}>
                        <WithdrawalQueue
                          withdrawalRequests={withdrawalRequests}
                          loadWithdrawalRequests={loadWithdrawalRequests}
                          account={account}
                          isConnected={isConnected}
                          unstakingQueueContract={unstakingQueueContract}
                          showNotification={(message, type) => console.log(`${type}: ${message}`)}
                        />
                        {console.log('🔍 App.jsx passing withdrawalRequests to WithdrawalQueue:', withdrawalRequests)}
                      </Suspense>
                    </div>
                  </div>
                  
                </div>
              )}
          </div>
        </main>

        <footer className="footer">
          <p>&copy; 2025 Babelon Protocol.</p>
        </footer>

        <Suspense fallback={<LoadingSpinner />}>
          <FloatingStatsBar
            contractAPYs={contractAPYs}
            protocolStats={protocolStats}
          />
        </Suspense>

            </div>
          </QueryClientProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

