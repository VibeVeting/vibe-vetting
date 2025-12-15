"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useParams } from 'next/navigation';

export default function CreatorProfilePage() {
  const params = useParams();
  const creatorId = params.id;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Creator Profile"
            subtitle={`Detailed vetting report for creator ${creatorId}`}
          />
          <div className="creator-profile">
            <p>Creator profile coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
