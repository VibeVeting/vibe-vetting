'use client';

import { useEffect, useState } from 'react';
import { StatCard } from './StatCard';

interface Stats {
  totalCreatorsVerified: number;
  perfectMatches: number;
  activeCampaigns: number;
  avgAlignmentScore: number;
  weeklyCreatorChange: number;
  weeklyMatchChange: number;
}

// Default stats - shows actual zeros when no data exists
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
  const [isUsingDefaults, setIsUsingDefaults] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found in localStorage');
          return;
        }

        const response = await fetch('/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Stats data received:', data);
          if (data.stats) {
            setStats(data.stats);
            setIsUsingDefaults(false);
          }
        } else {
          console.error('Stats API error:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      label: 'Total Creators Verified',
      icon: 'fa-users',
      iconBg: 'rgba(102, 126, 234, 0.15)',
      iconColor: '#667eea',
      value: stats.totalCreatorsVerified.toLocaleString(),
      change: `↑ ${stats.weeklyCreatorChange} this week`,
      positive: true,
    },
    {
      label: 'Perfect Matches',
      icon: 'fa-bullseye',
      iconBg: 'rgba(34, 197, 94, 0.15)',
      iconColor: '#22c55e',
      value: stats.perfectMatches.toString(),
      change: `↑ ${stats.weeklyMatchChange} new matches`,
      positive: true,
    },
    {
      label: 'Active Campaigns',
      icon: 'fa-chart-line',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#f59e0b',
      value: stats.activeCampaigns.toString(),
      change: 'Currently running',
      positive: true,
    },
    {
      label: 'Avg Alignment Score',
      icon: 'fa-star',
      iconBg: 'rgba(236, 72, 153, 0.15)',
      iconColor: '#ec4899',
      value: `${stats.avgAlignmentScore.toFixed(1)}%`,
      change: isUsingDefaults ? 'Sample data' : 'Overall average',
      positive: true,
    },
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} index={index} />
      ))}
    </div>
  );
}
