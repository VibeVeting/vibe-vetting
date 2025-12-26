"use client";

import { Sidebar } from '@/components/common/Sidebar';

const kpis = [
  { label: 'Monthly Revenue', value: '$127K', change: '+18%', icon: 'fa-dollar-sign', iconBg: 'rgba(34, 197, 94, 0.15)', iconColor: '#22c55e' },
  { label: 'Active Users', value: '2,847', change: '+24%', icon: 'fa-users', iconBg: 'rgba(102, 126, 234, 0.15)', iconColor: '#667eea' },
  { label: 'Conversion Rate', value: '4.2%', change: '+0.8%', icon: 'fa-percent', iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#f59e0b' },
  { label: 'Churn Rate', value: '2.1%', change: '-0.3%', icon: 'fa-arrow-trend-down', iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444' },
];

const riskItems = [
  { title: 'Political Content', level: 'high', label: 'Not Allowed' },
  { title: 'Financial Advice', level: 'medium', label: 'With Disclaimers' },
  { title: 'Humor / Satire', level: 'low', label: 'Allowed' },
  { title: 'Crypto / High Risk', level: 'high', label: 'Restricted' },
];

export default function InvestorMetricsPage() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <h1>Brand Compatibility & Risk</h1>
            <p>Digital brand blueprint and risk assessment</p>
          </div>

          {/* KPI Grid */}
          <div className="kpi-grid">
            {kpis.map((kpi, index) => (
              <div key={index} className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-label">{kpi.label}</span>
                  <div className="kpi-icon" style={{ background: kpi.iconBg, color: kpi.iconColor }}>
                    <i className={`fa-solid ${kpi.icon}`}></i>
                  </div>
                </div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-change">{kpi.change}</div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Brand DNA */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fa-solid fa-dna" style={{ marginRight: '10px', color: '#667eea' }}></i>
                  Brand DNA
                </h3>
              </div>
              <div className="card-metrics" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                  <div className="metric-label">Industry</div>
                  <div className="metric-value" style={{ fontSize: '14px' }}>Fintech / Investments</div>
                </div>
                <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                  <div className="metric-label">Tone</div>
                  <div className="metric-value" style={{ fontSize: '14px' }}>Educational · Conservative</div>
                </div>
                <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                  <div className="metric-label">Audience</div>
                  <div className="metric-value" style={{ fontSize: '14px' }}>Retail Investors</div>
                </div>
                <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                  <div className="metric-label">Sensitivity</div>
                  <div className="metric-value" style={{ fontSize: '14px' }}>Very High</div>
                </div>
              </div>
            </div>

            {/* Brand Safety Score */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-header" style={{ justifyContent: 'center' }}>
                <h3 className="card-title">
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: '10px', color: '#667eea' }}></i>
                  Brand Safety Score
                </h3>
              </div>
              <div style={{ fontSize: '72px', fontWeight: 900, color: '#667eea', margin: '20px 0' }}>94</div>
              <span className="badge badge-verified" style={{ fontSize: '14px', padding: '8px 20px' }}>Excellent</span>
            </div>

            {/* Risk Tolerance Matrix */}
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '10px', color: '#667eea' }}></i>
                  Risk Tolerance Matrix
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {riskItems.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 20px', 
                    background: '#f7fafc', 
                    borderRadius: '12px' 
                  }}>
                    <span style={{ fontWeight: 700 }}>{item.title}</span>
                    <span className={`risk-level risk-${item.level}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons" style={{ marginTop: '30px' }}>
            <button className="btn btn-secondary">
              <i className="fa-solid fa-clock-rotate-left"></i>
              View Change History
            </button>
            <button className="btn btn-primary">
              <i className="fa-solid fa-shield"></i>
              Lock Blueprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
