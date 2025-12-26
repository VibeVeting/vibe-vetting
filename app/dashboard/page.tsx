"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { StatsGrid } from './components/StatsGrid';
import { ChartsSection } from './components/ChartsSection';
import { RecentAnalysesTable } from './components/RecentAnalysesTable';

export default function DashboardPage() {
  const handleNewCampaign = () => {
    window.location.href = '/campaigns/create';
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Welcome Back!"
            subtitle="Tuesday, December 24, 2024"
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
