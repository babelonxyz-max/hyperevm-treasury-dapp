import React from 'react';
import { Wallet, Sun, Moon, LogOut } from 'lucide-react';

const Header = ({ account, isConnected, onConnect, onDisconnect, theme, onThemeChange }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleThemeToggle = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };



  return (
    <header className="header" role="banner">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <span className="cuneiform-symbol">𒀭</span>
          </div>
          <div className="logo-text">
            <h1 className="logo-title">Babelon Protocol</h1>
            <span className="logo-subtitle">v0.5 • Hyperliquid</span>
          </div>
        </div>
        
        <div className="header-center">
          {/* Empty center as requested */}
        </div>
        
        <nav className="header-actions" role="navigation" aria-label="Main navigation">
          <button 
            className="theme-toggle" 
            data-theme={theme}
            onClick={handleThemeToggle}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            type="button"
          >
            <div className="theme-toggle-track">
              <div className="theme-toggle-thumb">
                {/* Empty thumb - no icon inside */}
              </div>
              <div className="theme-icons">
                <Sun className={`theme-icon sun ${theme === 'light' ? 'active' : ''}`} size={16} />
                <Moon className={`theme-icon moon ${theme === 'dark' ? 'active' : ''}`} size={16} />
              </div>
            </div>
          </button>
          
          {isConnected ? (
            <div className="wallet-section">
              <div className="wallet-address">
                <Wallet size={16} className="wallet-icon" />
                <span className="wallet-text">{formatAddress(account)}</span>
              </div>
              <button 
                className="logout-btn"
                onClick={onDisconnect}
                title="Logout"
                aria-label="Logout"
                type="button"
              >
                <LogOut size={16} />
              </button>
              <button 
                className="disconnect-btn"
                onClick={onDisconnect}
                title="Disconnect Wallet"
                aria-label="Disconnect wallet"
                type="button"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              className="connect-btn" 
              onClick={onConnect}
              aria-label="Connect your wallet to start using the protocol"
              type="button"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
