"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { RecentAnalysesTable } from './components/RecentAnalysesTable';
import { CompanyInfoSection } from './components/CompanyInfoSection';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
    else setGreeting('Good Night');
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="yc-dashboard">
          {/* Animated Background */}
          <div className="yc-dash-bg">
            <div className="yc-dash-orb yc-dash-orb-1"></div>
            <div className="yc-dash-orb yc-dash-orb-2"></div>
            <div className="yc-dash-orb yc-dash-orb-3"></div>
            <div className="yc-dash-grid"></div>
          </div>

          {/* Floating Icons */}
          <div className="yc-floating-elements">
            <div className="yc-float-icon" style={{ top: '8%', left: '3%', animationDelay: '0s' }}><i className="fa-solid fa-chart-pie" style={{ color: 'var(--accent-cyan)' }}></i></div>
            <div className="yc-float-icon" style={{ top: '15%', right: '5%', animationDelay: '0.8s' }}><i className="fa-solid fa-rocket" style={{ color: 'var(--accent-purple)' }}></i></div>
            <div className="yc-float-icon" style={{ bottom: '20%', left: '2%', animationDelay: '1.5s' }}><i className="fa-solid fa-gem" style={{ color: 'var(--accent-pink)' }}></i></div>
            <div className="yc-float-icon" style={{ bottom: '12%', right: '4%', animationDelay: '2.2s' }}><i className="fa-solid fa-star" style={{ color: 'var(--accent-orange)' }}></i></div>
            <div className="yc-float-icon" style={{ top: '40%', right: '2%', animationDelay: '1s' }}><i className="fa-solid fa-bullseye" style={{ color: 'var(--accent-green)' }}></i></div>
          </div>

          {/* Hero Header */}
          <div className="yc-dash-header">
            <div className="yc-dash-header-content">
              <div className="yc-dash-welcome">
                <div className="yc-time-widget">
                  <div className="yc-time-display">
                    <span className="yc-time">{formatTime(currentTime)}</span>
                    <span className="yc-date">{formatDate(currentTime)}</span>
                  </div>
                  <div className="yc-time-glow"></div>
                </div>
                <div className="yc-greeting-section">
                  <div className="yc-greeting-badge">
                    <span className="yc-badge-dot"></span>
                    <span>{greeting}</span>
                  </div>
                  <h1 className="yc-main-title">
                    {user?.name ? (
                      <>Welcome back, <span className="yc-gradient-text">{user.name.split(' ')[0]}</span></>
                    ) : (
                      <>Your <span className="yc-gradient-text">Command Center</span></>
                    )}
                  </h1>
                  <p className="yc-subtitle">
                    AI-powered insights • Real-time analytics • Creator intelligence
                  </p>
                </div>
              </div>
              <div className="yc-dash-actions">
                <Link href="/campaigns/create" className="yc-action-btn yc-action-primary">
                  <span className="yc-btn-glow"></span>
                  <i className="fa-solid fa-plus"></i>
                  <span>New Campaign</span>
                </Link>
                <Link href="/creators/discover" className="yc-action-btn yc-action-secondary">
                  <i className="fa-solid fa-robot"></i>
                  <span>AI Discovery</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="yc-quick-actions">
            <Link href="/creators" className="yc-quick-action-card">
              <div className="yc-qa-icon yc-qa-icon-primary">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="yc-qa-content">
                <span className="yc-qa-title">Creators</span>
                <span className="yc-qa-desc">Manage & Analyze</span>
              </div>
              <i className="fa-solid fa-arrow-right yc-qa-arrow"></i>
            </Link>
            <Link href="/campaigns" className="yc-quick-action-card">
              <div className="yc-qa-icon yc-qa-icon-cyan">
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <div className="yc-qa-content">
                <span className="yc-qa-title">Campaigns</span>
                <span className="yc-qa-desc">Track Progress</span>
              </div>
              <i className="fa-solid fa-arrow-right yc-qa-arrow"></i>
            </Link>
            <Link href="/analytics" className="yc-quick-action-card">
              <div className="yc-qa-icon yc-qa-icon-success">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <div className="yc-qa-content">
                <span className="yc-qa-title">Analytics</span>
                <span className="yc-qa-desc">Deep Insights</span>
              </div>
              <i className="fa-solid fa-arrow-right yc-qa-arrow"></i>
            </Link>
            <Link href="/contracts" className="yc-quick-action-card">
              <div className="yc-qa-icon yc-qa-icon-warning">
                <i className="fa-solid fa-file-contract"></i>
              </div>
              <div className="yc-qa-content">
                <span className="yc-qa-title">Contracts</span>
                <span className="yc-qa-desc">AI Negotiation</span>
              </div>
              <i className="fa-solid fa-arrow-right yc-qa-arrow"></i>
            </Link>
          </div>

          {/* Stats Section */}
          <StatsGrid />

          {/* Main Content Grid */}
          <div className="yc-content-grid">
            <div className="yc-content-main">
              <RecentAnalysesTable />
            </div>
            <div className="yc-content-side">
              <CompanyInfoSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
