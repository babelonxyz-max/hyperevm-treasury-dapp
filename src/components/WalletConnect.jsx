import React from 'react';
import { Wallet, ExternalLink, Shield, TrendingUp, Zap, ArrowRight, Star, Users, Lock, Award } from 'lucide-react';

const WalletConnect = ({ onConnect }) => {
  return (
    <div className="wallet-connect-container">
      <div className="wallet-connect-wrapper">
        {/* Hero Section */}
        <div className="wallet-hero">
          <div className="wallet-hero-content">
            <div className="wallet-hero-badge">
              <Star size={16} />
              <span>Premium DeFi Protocol</span>
            </div>
            <h1 className="wallet-hero-title">
              Welcome to <span className="gradient-text">Babelon Protocol</span>
            </h1>
            <p className="wallet-hero-subtitle">
              Ancient wisdom meets modern DeFi. The most advanced liquid staking protocol on Hyperliquid. 
              Earn up to 500% APY with instant liquidity and institutional-grade security.
            </p>
            <div className="wallet-hero-actions">
              <button className="btn btn-primary btn-lg animate-bounce-in" onClick={onConnect}>
                <Wallet size={20} />
                Connect Wallet
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-secondary btn-lg">
                <ExternalLink size={20} />
                View Documentation
              </button>
            </div>
            <div className="wallet-hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">500%</div>
                <div className="hero-stat-label">Max APY</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">$0</div>
                <div className="hero-stat-label">Total Value Locked</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">0</div>
                <div className="hero-stat-label">Active Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="wallet-features">
          <div className="features-header">
            <h2 className="features-title">Why Choose Our Protocol?</h2>
            <p className="features-subtitle">
              Built for the future of DeFi with cutting-edge technology and user-centric design
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3 className="feature-title">High APY Rewards</h3>
              <p className="feature-description">
                Earn up to 500% APY on your deposits with our advanced rewards system
              </p>
              <div className="feature-highlight">Up to 500% APY</div>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3 className="feature-title">Instant Liquidity</h3>
              <p className="feature-description">
                Deposit and withdraw anytime with our liquid staking mechanism
              </p>
              <div className="feature-highlight">24/7 Available</div>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3 className="feature-title">Secure & Audited</h3>
              <p className="feature-description">
                Built on HyperEVM with smart contract security and transparency
              </p>
              <div className="feature-highlight">Fully Audited</div>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3 className="feature-title">Community Driven</h3>
              <p className="feature-description">
                Join a growing community of DeFi enthusiasts and early adopters
              </p>
              <div className="feature-highlight">Growing Community</div>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <Lock size={32} />
              </div>
              <h3 className="feature-title">Non-Custodial</h3>
              <p className="feature-description">
                You maintain full control of your assets with our non-custodial approach
              </p>
              <div className="feature-highlight">Your Keys, Your Assets</div>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <Award size={32} />
              </div>
              <h3 className="feature-title">Premium Experience</h3>
              <p className="feature-description">
                Enjoy a premium DeFi experience with our intuitive and beautiful interface
              </p>
              <div className="feature-highlight">Award-Winning UI</div>
            </div>
          </div>
        </div>

        {/* Protocol Stats */}
        <div className="protocol-stats">
          <div className="stats-header">
            <h2 className="stats-title">Protocol Overview</h2>
            <p className="stats-subtitle">Real-time treasury statistics and performance metrics</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card hover-glow">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-value">500%</div>
              <div className="stat-label">Maximum APY</div>
              <div className="stat-change positive">+0.00%</div>
            </div>
            <div className="stat-card hover-glow">
              <div className="stat-icon">
                <Wallet size={24} />
              </div>
              <div className="stat-value">0.000</div>
              <div className="stat-label">Total Deposits (HYPE)</div>
              <div className="stat-change">$0.00</div>
            </div>
            <div className="stat-card hover-glow">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-value">0.000</div>
              <div className="stat-label">zHYPE Tokens Minted</div>
              <div className="stat-change">1:1 Ratio</div>
            </div>
            <div className="stat-card hover-glow">
              <div className="stat-icon">
                <Shield size={24} />
              </div>
              <div className="stat-value">Active</div>
              <div className="stat-label">Protocol Status</div>
              <div className="stat-change positive">Live</div>
            </div>
          </div>
        </div>

        {/* Network Requirements */}
        <div className="network-requirements">
          <div className="network-card">
            <div className="network-header">
              <h3 className="network-title">Network Requirements</h3>
              <div className="network-status">
                <div className="status-indicator"></div>
                <span>Hyperliquid Network</span>
              </div>
            </div>
            <p className="network-description">
              To use this protocol, you need to connect to the Hyperliquid network. 
              Make sure your wallet is configured for HyperEVM.
            </p>
            <div className="network-actions">
              <a 
                href="https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/how-to-use-the-hyperevm" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink size={16} />
                Learn about HyperEVM
              </a>
              <button className="btn btn-primary" onClick={onConnect}>
                <Wallet size={16} />
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;