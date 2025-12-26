'use client';

import { StatCard } from './StatCard';

const stats = [
  {
    label: 'Total Creators Verified',
    icon: 'fa-users',
    iconBg: 'rgba(102, 126, 234, 0.15)',
    iconColor: '#667eea',
    value: '127',
    change: '↑ 12 this week',
    positive: true,
  },
  {
    label: 'Perfect Matches',
    icon: 'fa-bullseye',
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#22c55e',
    value: '34',
    change: '↑ 8 new matches',
    positive: true,
  },
  {
    label: 'Active Campaigns',
    icon: 'fa-chart-line',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#f59e0b',
    value: '8',
    change: '↓ 2 completed',
    positive: false,
  },
  {
    label: 'Avg Alignment Score',
    icon: 'fa-star',
    iconBg: 'rgba(236, 72, 153, 0.15)',
    iconColor: '#ec4899',
    value: '94.2%',
    change: '↑ 2.1% increase',
    positive: true,
  },
];

export function StatsGrid() {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
