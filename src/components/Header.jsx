import React, { useState, useEffect } from 'react';
import { Wallet, LogOut } from 'lucide-react';

const Header = ({ account, isConnected, onConnect, onDisconnect, theme, onThemeChange, onTestPrice }) => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    // Load version from JSON file with aggressive cache busting
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
          setVersion('v?.?');
        });
    };
    
    loadVersion();
    // Also retry after a short delay in case of cache issues
    const retryTimer = setTimeout(loadVersion, 2000);
    return () => clearTimeout(retryTimer);
  }, []);

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
              src={`/felix-logo.svg?v=${Date.now()}`}
              alt="Felix" 
              className="felix-logo-image"
              onError={(e) => {
                // Fallback to text if image doesn't exist
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div className="felix-logo-fallback" style={{ display: 'none' }}>
              <div className="felix-logo-icon">
                <span className="felix-logo-letter">F</span>
              </div>
              <span className="felix-logo-text">Felix</span>
            </div>
          </a>
          {version && (
            <span className="felix-version">{version}</span>
          )}
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
