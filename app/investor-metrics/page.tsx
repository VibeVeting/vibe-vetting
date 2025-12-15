"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';

export default function InvestorMetricsPage() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Investor Metrics"
            subtitle="Business performance and growth indicators"
          />
          <div className="investor-metrics-content">
            <p>Investor metrics dashboard coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
