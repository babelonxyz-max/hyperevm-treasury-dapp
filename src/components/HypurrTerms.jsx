import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './HypurrTerms.css';

const HypurrTerms = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nftCount, setNftCount] = useState(0);
  const [hasSigned, setHasSigned] = useState(false);
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState(null);

  // Hypurr NFT Contract Address (update with actual address)
  const HYPURR_NFT_CONTRACT = process.env.REACT_APP_HYPURR_NFT_CONTRACT || "0x0000000000000000000000000000000000000000";
  
  // ERC-721 ABI for balanceOf
  const ERC721_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)"
  ];

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
    checkExistingSignature();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
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
      
      if (typeof window.ethereum === 'undefined') {
        setError('Please install MetaMask or another Web3 wallet');
        return;
      }

      const accounts = await window.ethereum.request({ 
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
    if (!address || HYPURR_NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
      setNftCount(0);
      return;
    }

    try {
      setIsVerifying(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(HYPURR_NFT_CONTRACT, ERC721_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      const count = parseInt(balance.toString());
      setNftCount(count);
      
      console.log(`Verified ${count} Hypurr NFT(s) for ${address}`);
    } catch (error) {
      console.error('Error verifying NFTs:', error);
      setError('Failed to verify Hypurr NFTs. Please check the contract address.');
      setNftCount(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const signTerms = async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setIsVerifying(true);

      // Create message to sign
      const message = `I accept the Hypurr Terms of Service and verify ownership of my Hypurr NFTs.\n\nWallet: ${account}\nDate: ${new Date().toISOString()}`;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Sign the message
      const signature = await signer.signMessage(message);
      
      // Store signature
      localStorage.setItem(`hypurr_signature_${account}`, signature);
      localStorage.setItem(`hypurr_signature_date_${account}`, new Date().toISOString());
      
      setHasSigned(true);
      setSignature(signature);
      
      console.log('Terms signed successfully:', signature);
    } catch (error) {
      console.error('Error signing terms:', error);
      if (error.code === 4001) {
        setError('Signature rejected. Please approve the signature request.');
      } else {
        setError('Failed to sign terms. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
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
      {/* Navigation Header - Aligned with usefelix.xyz */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <a href="/" className="logo">Hypurr</a>
            <div className="nav-links">
              <a href="/" className="nav-link">Home</a>
              <a href="/docs" className="nav-link">Docs</a>
              <a href="/terms" className="nav-link">Terms</a>
            </div>
          </div>
          <div className="nav-right">
            {isConnected ? (
              <div className="wallet-info">
                {nftCount > 0 && (
                  <span className="nft-badge">{nftCount} Hypurr{nftCount !== 1 ? 's' : ''}</span>
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
            <p><strong>Wallet:</strong> {account}</p>
            <p><strong>Hypurr NFTs:</strong> {isVerifying ? 'Verifying...' : `${nftCount} found`}</p>
            {nftCount === 0 && (
              <p className="warning-text">No Hypurr NFTs found in this wallet. Please ensure you're using the correct wallet.</p>
            )}
          </div>
        )}

        {/* Signature Status */}
        {hasSigned && signature && (
          <div className="signature-status">
            <h3>✓ Terms Accepted</h3>
            <p>You have accepted the Terms of Service.</p>
            <p className="signature-hash">Signature: {signature.substring(0, 20)}...</p>
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
          Hypurr NFTs and agree to be bound by these Terms. Ensure you are using the correct 
          wallet that contains your Hypurr NFTs.</p>
        </div>

        {/* Terms Content - Simplified version */}
        <div className="section">
          <h2>1. Who May Use the Services</h2>
          <h3>1.1 Eligibility</h3>
          <p>You must be 18 years of age or older and own at least one Hypurr NFT to use the Services. 
          You must connect a wallet that contains your Hypurr NFTs for verification purposes.</p>
        </div>

        <div className="section">
          <h2>2. NFT Verification</h2>
          <h3>2.1 Verification Process</h3>
          <p>By connecting your wallet, you allow us to verify ownership of Hypurr NFTs in your wallet. 
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
              onClick={signTerms}
              disabled={isVerifying || nftCount === 0}
            >
              {isVerifying ? 'Signing...' : 'Accept Terms & Sign'}
            </button>
            {nftCount === 0 && (
              <p className="help-text">Please connect a wallet with Hypurr NFTs to proceed.</p>
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
              <div className="footer-logo">Hypurr</div>
              <p className="footer-text">© 2026 Hypurr Protocol. All rights reserved.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Legal</h4>
                <a href="/terms">Terms</a>
                <a href="/privacy">Privacy</a>
              </div>
              <div className="footer-col">
                <h4>Community</h4>
                <a href="https://x.com/hypurr" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://discord.gg/hypurr" target="_blank" rel="noopener noreferrer">Discord</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HypurrTerms;
