import React from 'react';
import { TrendingUp, Zap, Coins, Shield } from 'lucide-react';

const FloatingStatsBar = ({ contractAPYs, protocolStats }) => {
  const stats = [
    {
      icon: <TrendingUp size={16} />,
      symbol: 'HYPE',
      value: `${contractAPYs?.hypeAPY?.toFixed(2) || '0.00'}%`,
      color: '#3B82F6'
    },
    {
      icon: <Zap size={16} />,
      symbol: 'zHYPE',
      value: `${contractAPYs?.zhypeAPY?.toFixed(2) || '0.00'}%`,
      color: '#8B5CF6'
    },
    {
      icon: <Coins size={16} />,
      symbol: 'TVL',
      value: `${parseFloat(protocolStats?.totalHypeTVL || '0').toFixed(1)} HYPE`,
      color: '#10B981'
    },
    {
      icon: <Shield size={16} />,
      symbol: 'zHYPE',
      value: `${parseFloat(protocolStats?.totalZhypeMinted || '0').toFixed(1)}`,
      color: '#F59E0B'
    },
  ];

  return (
    <div className="floating-stats-bar">
      <div className="stats-ticker">
        {stats.map((stat, index) => (
          <div key={index} className="ticker-item">
            <div className="ticker-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <span className="ticker-symbol">{stat.symbol}</span>
            <span className="ticker-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloatingStatsBar;
