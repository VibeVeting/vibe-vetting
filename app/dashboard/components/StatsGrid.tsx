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

export function StatsGrid() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found in localStorage');
          setLoading(false);
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
          setStats(data.stats);
        } else {
          console.error('Stats API error:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
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
      value: loading ? '...' : (stats?.totalCreatorsVerified?.toString() || '0'),
      change: loading ? '' : `↑ ${stats?.weeklyCreatorChange || 0} this week`,
      positive: true,
    },
    {
      label: 'Perfect Matches',
      icon: 'fa-bullseye',
      iconBg: 'rgba(34, 197, 94, 0.15)',
      iconColor: '#22c55e',
      value: loading ? '...' : (stats?.perfectMatches?.toString() || '0'),
      change: loading ? '' : `↑ ${stats?.weeklyMatchChange || 0} new matches`,
      positive: true,
    },
    {
      label: 'Active Campaigns',
      icon: 'fa-chart-line',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#f59e0b',
      value: loading ? '...' : (stats?.activeCampaigns?.toString() || '0'),
      change: 'Currently running',
      positive: true,
    },
    {
      label: 'Avg Alignment Score',
      icon: 'fa-star',
      iconBg: 'rgba(236, 72, 153, 0.15)',
      iconColor: '#ec4899',
      value: loading ? '...' : `${stats?.avgAlignmentScore?.toFixed(1) || '0'}%`,
      change: 'Overall average',
      positive: true,
    },
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
