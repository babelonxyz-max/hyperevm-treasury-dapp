import React from 'react';
import { Wallet, LogOut } from 'lucide-react';

const Header = ({ account, isConnected, onConnect, onDisconnect, theme, onThemeChange, onTestPrice }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="felix-navbar">
      <div className="felix-nav-container">
        <div className="felix-nav-left">
          <a href="https://usefelix.xyz" className="felix-logo">
            <img 
              src="/felix-logo.svg" 
              alt="Felix" 
              className="felix-logo-image"
              onError={(e) => {
                // Fallback to text if image doesn't exist
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="felix-logo-fallback" style={{ display: 'none' }}>
              <div className="felix-logo-icon">
                <span className="felix-logo-letter">F</span>
              </div>
              <span className="felix-logo-text">Felix</span>
            </div>
          </a>
        </div>
        <div className="felix-nav-right">
          {isConnected ? (
            <div className="felix-wallet-info">
              <span className="felix-wallet-address">{formatAddress(account)}</span>
              <button 
                className="felix-disconnect-btn"
                onClick={onDisconnect}
                title="Disconnect Wallet"
                aria-label="Disconnect wallet"
                type="button"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="felix-connect-btn" onClick={onConnect}>
              <Wallet size={16} />
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
