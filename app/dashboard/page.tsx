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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <div className="max-w-[1400px] mx-auto">
          <TopBar
            title="Welcome Back!"
            subtitle="Monday, December 11, 2024"
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
      </main>
    </div>
  );
}
