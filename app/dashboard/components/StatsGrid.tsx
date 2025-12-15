'use client';

import { StatCard } from './StatCard';

const stats = [
  {
    label: 'Total Creators Verified',
    icon: '👥',
    value: '127',
    change: '↑ 12 this week',
    positive: true,
  },
  {
    label: 'Perfect Matches',
    icon: '🎯',
    value: '34',
    change: '↑ 8 new matches',
    positive: true,
  },
  {
    label: 'Active Campaigns',
    icon: '📊',
    value: '8',
    change: '↓ 2 completed',
    positive: false,
  },
  {
    label: 'Avg Alignment Score',
    icon: '⭐',
    value: '94.2%',
    change: '↑ 2.1% increase',
    positive: true,
  },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
