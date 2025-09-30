import React from 'react';
import { TrendingUp, Users, Coins, Clock, Shield, Zap } from 'lucide-react';

const StatsPanel = ({ contractAPYs, protocolStats }) => {
  const stats = [
    {
      icon: <TrendingUp className="stat-icon" />,
      label: 'HYPE APY',
      value: `${contractAPYs?.hypeStakingAPY || '0.00'}%`,
      color: 'primary'
    },
    {
      icon: <Zap className="stat-icon" />,
      label: 'zHYPE APY',
      value: `${contractAPYs?.zhypeStakingAPY || '0.00'}%`,
      color: 'secondary'
    },
    {
      icon: <Coins className="stat-icon" />,
      label: 'Total TVL',
      value: `${protocolStats?.totalHypeTvl || '0.0000'} HYPE`,
      color: 'accent'
    },
    {
      icon: <Shield className="stat-icon" />,
      label: 'zHYPE Minted',
      value: `${protocolStats?.zhypeMinted || '0.0000'} zHYPE`,
      color: 'success'
    },
    {
      icon: <Users className="stat-icon" />,
      label: 'Active Stakers',
      value: protocolStats?.activeStakers || '0',
      color: 'warning'
    },
    {
      icon: <Clock className="stat-icon" />,
      label: 'Unstaking Period',
      value: '7 days',
      color: 'info'
    }
  ];

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h3>Protocol Statistics</h3>
      </div>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="protocol-info">
        <h4>About Babelon</h4>
        <p>
          Babelon is an advanced liquid staking protocol built on Hyperliquid, 
          offering competitive APY rewards and seamless staking experiences.
        </p>
        
        <div className="features-list">
          <div className="feature-item">
            <Shield className="feature-icon" />
            <span>Secure Staking</span>
          </div>
          <div className="feature-item">
            <TrendingUp className="feature-icon" />
            <span>High APY Rewards</span>
          </div>
          <div className="feature-item">
            <Clock className="feature-icon" />
            <span>7-Day Unstaking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
