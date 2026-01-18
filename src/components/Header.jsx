import React, { useState, useEffect } from 'react';
import { Wallet, LogOut } from 'lucide-react';

const Header = ({ account, isConnected, onConnect, onDisconnect, theme, onThemeChange, onTestPrice }) => {
  const [version, setVersion] = useState('');
  
  // Detect domain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isFelixDomain = hostname === 'felix-foundation.xyz' || 
                       hostname === 'www.felix-foundation.xyz' ||
                       hostname.includes('felix-foundation');
  const isBabelonDomain = hostname === 'babelon.xyz' || 
                         hostname === 'www.babelon.xyz' ||
                         hostname.includes('babelon');

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

  // Determine branding based on domain
  const logoUrl = isFelixDomain 
    ? 'https://www.usefelix.xyz/_next/static/media/felix.db823ff1.webp'
    : '/logo.svg'; // Babelon logo
  const logoText = isFelixDomain ? 'Felix' : 'Babelon';
  const logoHref = isFelixDomain ? 'https://usefelix.xyz' : '/';
  const logoAlt = isFelixDomain ? 'Felix' : 'Babelon Protocol';
  const logoLetter = isFelixDomain ? 'F' : 'B';

  return (
    <nav className="felix-navbar">
      <div className="felix-nav-container">
        <div className="felix-nav-left">
          <a href={logoHref} className="felix-logo">
            {!isBabelonDomain && (
              <img 
                src={logoUrl}
                alt={logoAlt} 
                className="felix-logo-image"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            )}
            <span className="felix-logo-text">{logoText}</span>
            <div className="felix-logo-fallback" style={{ display: isBabelonDomain ? 'flex' : 'none' }}>
              <div className="felix-logo-icon">
                <span className="felix-logo-letter">{logoLetter}</span>
              </div>
              <span className="felix-logo-text-fallback">{logoText}</span>
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
