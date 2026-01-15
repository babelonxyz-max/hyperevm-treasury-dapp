import React from 'react';
import { Wallet, Sun, Moon, LogOut } from 'lucide-react';

const Header = ({ account, isConnected, onConnect, onDisconnect, theme, onThemeChange, onTestPrice }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleThemeToggle = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="felix-navbar">
      <div className="felix-nav-container">
        <div className="felix-nav-left">
          <a href="https://usefelix.xyz" className="felix-logo">
            <div className="felix-logo-icon">
              <span className="felix-logo-letter">F</span>
            </div>
            <span className="felix-logo-text">Felix</span>
          </a>
          <div className="felix-nav-links">
            <a href="https://usefelix.xyz/borrow" className="felix-nav-link">Borrow</a>
            <a href="https://usefelix.xyz/lend" className="felix-nav-link">Lend</a>
            <a href="https://usefelix.xyz/docs" className="felix-nav-link">Docs</a>
          </div>
        </div>
        <div className="felix-nav-right">
          <button 
            className="felix-theme-toggle" 
            data-theme={theme}
            onClick={handleThemeToggle}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            type="button"
          >
            <Sun size={16} className={`felix-theme-icon ${theme === 'light' ? 'active' : ''}`} />
            <Moon size={16} className={`felix-theme-icon ${theme === 'dark' ? 'active' : ''}`} />
          </button>
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
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
