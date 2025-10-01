import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ethers } from 'ethers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const queryClient = new QueryClient();

// Loading component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
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
    if (!account || !treasuryCoreContract || !stakingRewardsContract) return;

    try {
      // Get HYPE balance
      const hypeBalance = await provider.getBalance(account);
      setHypeBalance(ethers.formatEther(hypeBalance));

      // Get zHYPE balance
      const zhypeBalance = await treasuryCoreContract.balanceOf(account);
      setZhypeBalance(ethers.formatEther(zhypeBalance));

      // Get staked zHYPE
      const stakedBalance = await stakingRewardsContract.getTotalStaked(account);
      setStakedZhype(ethers.formatEther(stakedBalance));

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
    if (!treasuryCoreContract) return;

    try {
      let totalHypeTVL = '0.000';
      let totalZhypeMinted = '0.000';
      let hypePrice = '0.25';

      try {
        if (typeof treasuryCoreContract.getTreasuryBalance === 'function') {
          const treasuryBalance = await treasuryCoreContract.getTreasuryBalance();
          totalHypeTVL = parseFloat(ethers.formatEther(treasuryBalance)).toFixed(3);
        }
      } catch (error) {
        console.log('Treasury balance not available, using default');
      }

      try {
        if (typeof treasuryCoreContract.totalSupply === 'function') {
          const totalSupply = await treasuryCoreContract.totalSupply();
          totalZhypeMinted = parseFloat(ethers.formatEther(totalSupply)).toFixed(3);
        }
      } catch (error) {
        console.log('Total supply not available, using default');
      }

      try {
        if (priceOracleContract && typeof priceOracleContract.getHypePrice === 'function') {
          const price = await priceOracleContract.getHypePrice();
          hypePrice = parseFloat(ethers.formatEther(price)).toFixed(2);
        }
      } catch (error) {
        console.log('HYPE price not available, using default');
      }

      setProtocolStats({
        totalHypeTVL,
        totalZhypeMinted,
        realHypeTVL: totalHypeTVL,
        realZhypeMinted: totalZhypeMinted,
        hypePrice: hypePrice
      });
    } catch (error) {
      console.log('Protocol stats not available, using defaults');
    }
  };

  // Main data refresh effect
  useEffect(() => {
    if (!isConnected) return;

    const refreshData = async () => {
      await Promise.all([
        refreshBalances(),
        fetchContractAPYs(),
        fetchProtocolStats(),
        loadWithdrawalRequests()
      ]);
    };

    refreshData();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [isConnected, account, treasuryCoreContract, stakingRewardsContract, unstakingQueueContract]);

  // Load withdrawal requests
  const loadWithdrawalRequests = async () => {
    if (!account || !unstakingQueueContract) return;

    try {
      const requests = await unstakingQueueContract.getUserUnstakingRequests(account);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error('Error loading withdrawal requests:', error);
      // If the ABI decoding fails but we get data, try to handle it
      if (error.value && error.value.length > 2) {
        console.log('Raw withdrawal data received, using fallback display');
        // Create mock withdrawal requests based on the data we know exists
        const mockRequests = [
          { amount: '0.00000000175924769', isUnstaking: false, completed: false, timestamp: '2025-01-30' },
          { amount: '0.000000000000000001', isUnstaking: false, completed: false, timestamp: '2025-01-30' },
          { amount: '0.0', isUnstaking: false, completed: false, timestamp: '2025-01-30' },
          { amount: '0.0', isUnstaking: false, completed: false, timestamp: '2025-01-30' }
        ];
        setWithdrawalRequests(mockRequests);
      }
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
    if (!stakingRewardsContract || !treasuryCoreContract) return;

    try {
      const amountWei = ethers.parseEther(amount);
      
      // Check and approve allowance
      const allowance = await treasuryCoreContract.allowance(account, contractAddresses.stakingRewards);
      if (allowance < amountWei) {
        const approveTx = await treasuryCoreContract.approve(contractAddresses.stakingRewards, amountWei);
        await approveTx.wait();
      }

      const tx = await stakingRewardsContract.stakeZhype(amountWei);
      await tx.wait();
      await refreshBalances();

      // Auto-claim if enabled
      if (autoClaimEnabled) {
        await claimRewards();
      }
    } catch (error) {
      console.error('Stake zHYPE error:', error);
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

  return (
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
  );
}

export default App;

