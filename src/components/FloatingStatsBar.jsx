import React from 'react';
import { TrendingUp, Zap, Coins, Shield, DollarSign, Scale, Tag, Loader2 } from 'lucide-react';

const FloatingStatsBar = ({ 
  contractAPYs, 
  protocolStats, 
  dynamicZhypeAPY,
  isPriceLoading = false
}) => {
  // Debug logging
  console.log('🔍 FloatingStatsBar props:', {
    protocolStats,
    isPriceLoading,
    hypePrice: protocolStats?.hypePrice
  });
  const stats = [
    {
      icon: <TrendingUp size={14} />,
      symbol: 'HYPE APY',
      value: `${dynamicZhypeAPY?.toFixed(1) || '0.0'}%`,
      color: '#3B82F6'
    },
    {
      icon: <Zap size={14} />,
      symbol: 'zHYPE APY',
      value: '17.0%',
      color: '#8B5CF6'
    },
    {
      icon: isPriceLoading ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />,
      symbol: 'HYPE',
      value: `$${protocolStats?.hypePrice || '0.00'}`,
      color: '#10B981'
    },
    {
      icon: <Coins size={14} />,
      symbol: 'TVL',
      value: `${parseFloat(protocolStats?.totalHypeTVL || '0').toFixed(4).replace(/\.?0+$/, '')} HYPE`,
      color: '#F59E0B'
    },
    {
      icon: <Shield size={14} />,
      symbol: 'Minted',
      value: `${parseFloat(protocolStats?.totalZhypeMinted || '0').toFixed(4).replace(/\.?0+$/, '')} zHYPE`,
      color: '#EF4444'
    },
    {
      icon: <Scale size={14} />,
      symbol: 'Peg',
      value: '1:1',
      color: '#06B6D4'
    },
    {
      icon: <Tag size={14} />,
      symbol: 'v0.9',
      value: '',
      color: '#8B5CF6'
    },
  ];

  return (
    <div className="floating-stats-bar">
      <div className="stats-ticker">
        {stats.map((stat, index) => (
          <div key={index} className={`ticker-item ${stat.symbol === 'v0.9' ? 'version-item' : ''}`}>
            <div className="ticker-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <span className="ticker-symbol">{stat.symbol}</span>
            {stat.value && <span className="ticker-value">{stat.value}</span>}
          </div>
        ))}
        <div className="ticker-brand">
          <span className="brand-text">by Orion Ventures</span>
        </div>
      </div>
    </div>
  );
};

export default FloatingStatsBar;
