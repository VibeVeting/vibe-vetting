"use client";

import { Sidebar } from '@/components/common/Sidebar';

const kpis = [
  { label: 'Total Campaigns', value: '24', change: '+12%', icon: 'fa-bullhorn', iconBg: 'rgba(102, 126, 234, 0.15)', iconColor: '#667eea' },
  { label: 'Creators Analyzed', value: '1,847', change: '+28%', icon: 'fa-users', iconBg: 'rgba(34, 197, 94, 0.15)', iconColor: '#22c55e' },
  { label: 'Avg. Alignment Score', value: '87%', change: '+5%', icon: 'fa-chart-line', iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#f59e0b' },
  { label: 'High Risk Detected', value: '23', change: '-8%', icon: 'fa-shield-halved', iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444', negative: true },
];

const tableData = [
  { platform: 'Instagram', creators: 847, avgScore: 89, performance: 92 },
  { platform: 'YouTube', creators: 523, avgScore: 85, performance: 88 },
  { platform: 'TikTok', creators: 312, avgScore: 82, performance: 79 },
  { platform: 'Twitter', creators: 165, avgScore: 78, performance: 71 },
];

export default function AnalyticsPage() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-top">
              <div className="header-left">
                <h1>Analytics Dashboard</h1>
                <p>Campaign performance and insights</p>
              </div>
              <div className="date-range">
                <i className="fa-solid fa-calendar"></i>
                Last 30 Days
              </div>
            </div>
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
                <div className={`kpi-change ${kpi.negative ? 'negative' : ''}`}>{kpi.change}</div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Creator Verification Trends</h3>
                <button className="card-menu">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>
              <div className="chart-placeholder">
                <i className="fa-solid fa-chart-area" style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                <br />
                Chart visualization area
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Platform Distribution</h3>
                <button className="card-menu">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>
              <div className="chart-placeholder">
                <i className="fa-solid fa-chart-pie" style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                <br />
                Chart visualization area
              </div>
            </div>
          </div>

          {/* Stats Table */}
          <div className="stats-table-card">
            <div className="table-header">
              <h3 className="table-title">Platform Performance</h3>
            </div>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Creators</th>
                  <th>Avg Score</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <span className="platform-badge">{row.platform}</span>
                    </td>
                    <td>{row.creators.toLocaleString()}</td>
                    <td>{row.avgScore}%</td>
                    <td>
                      <div className="performance-bar">
                        <div className="performance-fill" style={{ width: `${row.performance}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
