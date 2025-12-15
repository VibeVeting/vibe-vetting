"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';

export default function CreatorsPage() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Creators"
            subtitle="Browse and analyze influencers"
          />
          <div className="creators-grid">
            <p>Creators list coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
