"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { StatsGrid } from './components/StatsGrid';
import { ChartsSection } from './components/ChartsSection';
import { RecentAnalysesTable } from './components/RecentAnalysesTable';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const handleNewCampaign = () => {
    window.location.href = '/campaigns/create';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title={`Welcome Back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`}
              subtitle={today}
              actionButton={{
                label: 'New Campaign',
                icon: 'fa-plus',
                onClick: handleNewCampaign,
              }}
            />

            <StatsGrid />
            <ChartsSection />
            <RecentAnalysesTable />
          </div>
        </div>
      </div>
  );
}
