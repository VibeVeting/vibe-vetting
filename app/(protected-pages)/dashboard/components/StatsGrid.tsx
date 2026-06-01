'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalCreatorsVerified: number;
  perfectMatches: number;
  activeCampaigns: number;
  avgAlignmentScore: number;
  weeklyCreatorChange: number;
  weeklyMatchChange: number;
}

const defaultStats: Stats = {
  totalCreatorsVerified: 0,
  perfectMatches: 0,
  activeCampaigns: 0,
  avgAlignmentScore: 0,
  weeklyCreatorChange: 0,
  weeklyMatchChange: 0,
};

export function StatsGrid() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.stats) {
            setStats(data.stats);
          }
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } catch {
        // Silent error handling
      }
    };

    fetchStats();
  }, [router]);

  const statsData = [
    {
      label: 'Creators Verified',
      icon: 'fa-users',
      value: stats.totalCreatorsVerified,
      change: stats.weeklyCreatorChange,
      changeText: 'this week',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadowColor: 'rgba(102, 126, 234, 0.4)',
    },
    {
      label: 'Perfect Matches',
      icon: 'fa-bullseye',
      value: stats.perfectMatches,
      change: stats.weeklyMatchChange,
      changeText: 'new matches',
      gradient: 'linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)',
      shadowColor: 'rgba(0, 245, 255, 0.4)',
    },
    {
      label: 'Active Campaigns',
      icon: 'fa-rocket',
      value: stats.activeCampaigns,
      change: 0,
      changeText: 'in progress',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadowColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
      label: 'Alignment Score',
      icon: 'fa-chart-line',
      value: stats.avgAlignmentScore,
      isPercentage: true,
      changeText: 'avg score',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      shadowColor: 'rgba(34, 197, 94, 0.4)',
    },
  ];

  return (
    <div className={`yc-stats-section ${isVisible ? 'visible' : ''}`}>
      <div className="yc-stats-header">
        <div className="yc-stats-title">
          <div className="yc-stats-icon">
            <i className="fa-solid fa-chart-column"></i>
          </div>
          <div>
            <h2>Performance Metrics</h2>
            <p>Real-time analytics overview</p>
          </div>
        </div>
        <div className="yc-stats-badge">
          <span className="yc-pulse"></span>
          <span>Live Data</span>
        </div>
      </div>
      
      <div className="yc-stats-grid">
        {statsData.map((stat, index) => (
          <YCStatCard key={index} {...stat} index={index} />
        ))}
      </div>
    </div>
  );
}

function YCStatCard({
  label,
  icon,
  value,
  change,
  changeText,
  gradient,
  shadowColor,
  isPercentage,
  index,
}: {
  label: string;
  icon: string;
  value: number;
  change?: number;
  changeText: string;
  gradient: string;
  shadowColor: string;
  isPercentage?: boolean;
  index: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(value * easeProgress * 10) / 10);

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div
      className={`yc-stat-card ${isHovered ? 'hovered' : ''}`}
      style={{ animationDelay: `${index * 0.1}s`, '--shadow-color': shadowColor } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="yc-stat-glow" style={{ background: shadowColor }}></div>
      <div className="yc-stat-content">
        <div className="yc-stat-header">
          <div className="yc-stat-icon-wrapper" style={{ background: gradient }}>
            <i className={`fa-solid ${icon}`}></i>
          </div>
          {change !== undefined && change > 0 && (
            <div className="yc-stat-trend up">
              <i className="fa-solid fa-arrow-trend-up"></i>
              <span>+{change}</span>
            </div>
          )}
        </div>
        <div className="yc-stat-value">
          {isPercentage ? `${displayValue.toFixed(1)}%` : displayValue.toLocaleString()}
        </div>
        <div className="yc-stat-label">{label}</div>
        <div className="yc-stat-meta">
          <span className="yc-stat-dot" style={{ background: gradient }}></span>
          <span>{changeText}</span>
        </div>
      </div>
      <div className="yc-stat-chart">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={shadowColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={shadowColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M0,35 Q15,${25 + index * 3} 25,${30 - index * 2} T50,${20 + index * 4} T75,${15 - index * 2} T100,${10 + index * 3} V40 H0 Z`}
            fill={`url(#gradient-${index})`}
            className="yc-stat-area"
          />
          <path
            d={`M0,35 Q15,${25 + index * 3} 25,${30 - index * 2} T50,${20 + index * 4} T75,${15 - index * 2} T100,${10 + index * 3}`}
            fill="none"
            stroke={shadowColor}
            strokeWidth="2"
            className="yc-stat-line"
          />
        </svg>
      </div>
    </div>
  );
}
