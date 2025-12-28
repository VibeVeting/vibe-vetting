"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const creatorData = {
  name: 'Jessica Davis',
  handle: '@jessicad',
  platform: 'Instagram',
  followers: '245.3K',
  engagement: '4.2%',
  avgViews: '45.2K',
  score: 96,
  recommendation: 'perfect',
};

const metrics = [
  { label: 'Audience Authenticity', value: 94 },
  { label: 'Content Quality', value: 92 },
  { label: 'Brand Safety', value: 98 },
  { label: 'Engagement Rate', value: 88 },
];

const strengths = [
  { title: 'Consistent Brand Voice', description: 'Maintains professional tone across all content' },
  { title: 'High-Quality Production', description: 'Professional photography and editing standards' },
  { title: 'Engaged Community', description: 'Active and positive audience interactions' },
];

const concerns = [
  { title: 'Competitor Mentions', description: 'Previously worked with 2 competing brands' },
];

export default function CreatorProfilePage() {
  const params = useParams();

  return (
    <ProtectedRoute>
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title="Creator Profile"
              subtitle={creatorData.name}
              showSearch={false}
            />
          {/* Creator Header */}
          <div className="creator-header">
            <div className="creator-avatar-large">
              {creatorData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="creator-info">
              <h1>{creatorData.name}</h1>
              <div className="creator-platform">
                <i className={`fa-brands fa-${creatorData.platform.toLowerCase()}`}></i>
                <span>{creatorData.handle}</span>
              </div>
              <div className="creator-stats">
                <div className="stat">
                  <div className="stat-label">Followers</div>
                  <div className="stat-value">{creatorData.followers}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Engagement</div>
                  <div className="stat-value">{creatorData.engagement}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Avg Views</div>
                  <div className="stat-value">{creatorData.avgViews}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className={`recommendation-box ${creatorData.recommendation}`}>
            <div className="recommendation-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="recommendation-text">
              <h3>Perfect Match for Your Brand</h3>
              <p>This creator aligns exceptionally well with your brand values and target audience.</p>
            </div>
          </div>

          {/* Report Sections Grid */}
          <div className="report-grid">
            {/* Performance Metrics */}
            <div className="report-section">
              <div className="section-header">
                <i className="fa-solid fa-chart-line"></i>
                <h3 className="section-title">Performance Metrics</h3>
              </div>
              {metrics.map((metric, index) => (
                <div key={index} className="metric-row">
                  <span className="metric-row-label">{metric.label}</span>
                  <div className="metric-bar">
                    <div className="metric-bar-fill" style={{ width: `${metric.value}%` }}></div>
                  </div>
                  <span className="metric-row-value">{metric.value}%</span>
                </div>
              ))}
            </div>

            {/* Risk Assessment */}
            <div className="report-section">
              <div className="section-header">
                <i className="fa-solid fa-shield-halved"></i>
                <h3 className="section-title">Risk Assessment</h3>
              </div>
              <div className="risk-circle-container">
                <div className="risk-circle low">
                  <div className="risk-circle-inner">
                    <span className="risk-circle-label">RISK</span>
                    <span className="risk-circle-value low">12%</span>
                  </div>
                </div>
                <span className="risk-level risk-low">
                  <i className="fa-solid fa-shield"></i>
                  Low Risk
                </span>
              </div>
            </div>
          </div>

          {/* Strengths and Concerns */}
          <div className="report-grid">
            <div className="report-section">
              <div className="section-header">
                <i className="fa-solid fa-thumbs-up"></i>
                <h3 className="section-title">Strengths</h3>
              </div>
              {strengths.map((item, index) => (
                <div key={index} className="list-item">
                  <div className="list-icon positive">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div className="list-content">
                    <div className="list-title">{item.title}</div>
                    <div className="list-description">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="report-section">
              <div className="section-header">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <h3 className="section-title">Concerns</h3>
              </div>
              {concerns.map((item, index) => (
                <div key={index} className="list-item">
                  <div className="list-icon negative">
                    <i className="fa-solid fa-exclamation"></i>
                  </div>
                  <div className="list-content">
                    <div className="list-title">{item.title}</div>
                    <div className="list-description">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link href="/creators" className="btn btn-secondary">
              <i className="fa-solid fa-arrow-left"></i>
              Back to Results
            </Link>
            <button className="btn btn-secondary">
              <i className="fa-solid fa-download"></i>
              Export Report
            </button>
            <button className="btn btn-primary">
              <i className="fa-solid fa-plus"></i>
              Add to Campaign
            </button>
          </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
