import React from 'react';
import { TrendingUp, Zap, Coins, Shield } from 'lucide-react';

const FloatingStatsBar = ({ contractAPYs, protocolStats }) => {
  return (
    <div className="floating-stats-bar">
      <div className="stats-container">
        <div className="stat-item">
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <span className="stat-label">HYPE APY</span>
            <span className="stat-value">{contractAPYs?.hypeAPY || '0.00'}%</span>
          </div>
        </div>
        
        <div className="stat-item">
          <Zap className="stat-icon" />
          <div className="stat-content">
            <span className="stat-label">zHYPE APY</span>
            <span className="stat-value">{contractAPYs?.zhypeAPY || '0.00'}%</span>
          </div>
        </div>
        
        <div className="stat-item">
          <Coins className="stat-icon" />
          <div className="stat-content">
            <span className="stat-label">TVL</span>
            <span className="stat-value">{protocolStats?.totalHypeTVL || '0.000'} HYPE</span>
          </div>
        </div>
        
        <div className="stat-item">
          <Shield className="stat-icon" />
          <div className="stat-content">
            <span className="stat-label">zHYPE Minted</span>
            <span className="stat-value">{protocolStats?.totalZhypeMinted || '0.000'} zHYPE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingStatsBar;
