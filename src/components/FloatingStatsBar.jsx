import React from 'react';
import { TrendingUp, Zap, Coins, Shield, DollarSign, Scale, Tag } from 'lucide-react';

const FloatingStatsBar = ({ contractAPYs, protocolStats }) => {
  const stats = [
    {
      icon: <TrendingUp size={16} />,
      symbol: 'HYPE APY',
      value: `${contractAPYs?.hypeAPY?.toFixed(2) || '0.00'}%`,
      color: '#3B82F6'
    },
    {
      icon: <Zap size={16} />,
      symbol: 'zHYPE APY',
      value: `${contractAPYs?.zhypeAPY?.toFixed(2) || '0.00'}%`,
      color: '#8B5CF6'
    },
    {
      icon: <DollarSign size={16} />,
      symbol: 'HYPE',
      value: `$${protocolStats?.hypePrice || '0.00'}`,
      color: '#10B981'
    },
    {
      icon: <Coins size={16} />,
      symbol: 'TVL',
      value: `${parseFloat(protocolStats?.totalHypeTVL || '0').toFixed(1)} HYPE`,
      color: '#F59E0B'
    },
    {
      icon: <Shield size={16} />,
      symbol: 'Minted',
      value: `${parseFloat(protocolStats?.totalZhypeMinted || '0').toFixed(1)} zHYPE`,
      color: '#EF4444'
    },
    {
      icon: <Scale size={16} />,
      symbol: 'Peg',
      value: '1:1',
      color: '#06B6D4'
    },
    {
      icon: <Tag size={16} />,
      symbol: 'v0.5',
      value: '',
      color: '#8B5CF6'
    },
  ];

  return (
    <div className="floating-stats-bar">
      <div className="stats-ticker">
        {stats.map((stat, index) => (
          <div key={index} className={`ticker-item ${stat.symbol === 'v0.5' ? 'version-item' : ''}`}>
            <div className="ticker-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <span className="ticker-symbol">{stat.symbol}</span>
            {stat.value && <span className="ticker-value">{stat.value}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloatingStatsBar;
