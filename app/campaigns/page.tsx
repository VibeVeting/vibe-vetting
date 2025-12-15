"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useRouter } from 'next/navigation';

export default function CampaignsPage() {
  const router = useRouter();

  const handleNewCampaign = () => {
    router.push('/campaigns/create');
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Campaigns"
            subtitle="Manage your influencer campaigns"
            actionButton={{
              label: 'New Campaign',
              icon: 'fa-plus',
              onClick: handleNewCampaign,
            }}
          />

          <div className="campaigns-grid">
            <p>Campaigns list coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
