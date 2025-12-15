"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';

export default function SettingsPage() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Settings"
            subtitle="Manage your account and preferences"
          />
          <div className="settings-content">
            <p>Settings page coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
