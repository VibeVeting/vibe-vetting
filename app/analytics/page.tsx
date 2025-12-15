"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';

export default function AnalyticsPage() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Analytics"
            subtitle="Campaign performance and insights"
          />
          <div className="analytics-content">
            <p>Analytics dashboard coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
