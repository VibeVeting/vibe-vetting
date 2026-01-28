"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { StatsGrid } from './components/StatsGrid';
import { RecentAnalysesTable } from './components/RecentAnalysesTable';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { AIQuickAction } from '@/components/common/AIButton';
import { LinkedInSearch } from '@/components/common/LinkedInSearch';
import { useAuth } from '@/contexts/auth-context';

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

            <CompanyInfoSection />
            
            <RecentAnalysesTable />
          </div>
        </div>
      </div>
  );
}
