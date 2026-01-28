"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { CardMenu, MenuItem } from '@/components/common/CardMenu';
import { useEffect, useState } from 'react';
import { exportAsCSV } from '@/lib/export-utils';

interface KPI {
  label: string;
  value: string;
  change: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  negative?: boolean;
}

const tableData = [
  { platform: 'Instagram', creators: 0, avgScore: 0, performance: 0 },
  { platform: 'YouTube', creators: 0, avgScore: 0, performance: 0 },
  { platform: 'TikTok', creators: 0, avgScore: 0, performance: 0 },
  { platform: 'Twitter', creators: 0, avgScore: 0, performance: 0 },
];

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<KPI[]>([
    { label: 'Total Campaigns', value: '0', change: '0%', icon: 'fa-bullhorn', iconBg: 'rgba(102, 126, 234, 0.15)', iconColor: '#667eea' },
    { label: 'Creators Analyzed', value: '0', change: '0%', icon: 'fa-users', iconBg: 'rgba(34, 197, 94, 0.15)', iconColor: '#22c55e' },
    { label: 'Avg. Alignment Score', value: '0%', change: '0%', icon: 'fa-chart-line', iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#f59e0b' },
    { label: 'High Risk Detected', value: '0', change: '0%', icon: 'fa-shield-halved', iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444', negative: true },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const stats = data.stats;
          setKpis([
            { label: 'Total Campaigns', value: stats.activeCampaigns?.toString() || '0', change: '+0%', icon: 'fa-bullhorn', iconBg: 'rgba(102, 126, 234, 0.15)', iconColor: '#667eea' },
            { label: 'Creators Analyzed', value: stats.creatorsAnalyzed?.toString() || '0', change: '+0%', icon: 'fa-users', iconBg: 'rgba(34, 197, 94, 0.15)', iconColor: '#22c55e' },
            { label: 'Avg. Alignment Score', value: `${stats.avgAlignmentScore?.toFixed(0) || 0}%`, change: '+0%', icon: 'fa-chart-line', iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#f59e0b' },
            { label: 'High Risk Detected', value: stats.highRiskDetected?.toString() || '0', change: '0%', icon: 'fa-shield-halved', iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444', negative: true },
          ]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title="Analytics Dashboard"
              subtitle="Campaign performance and insights"
            />

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
                  <div className="kpi-value">{loading ? '...' : kpi.value}</div>
                  <div className={`kpi-change ${kpi.negative ? 'negative' : ''}`}>{kpi.change}</div>
                </div>
              ))}
            </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Creator Verification Trends</h3>
                <CardMenu items={[
                  { label: 'Download Data', icon: 'fa-download', onClick: () => {
                    exportAsCSV(kpis.map(k => ({ Metric: k.label, Value: k.value, Change: k.change })), 'analytics-kpis');
                  }},
                  { label: 'View Full Report', icon: 'fa-expand', onClick: () => window.location.href = '/analytics' },
                  { label: 'Share', icon: 'fa-share-nodes', onClick: () => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); } },
                ]} />
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
                <CardMenu items={[
                  { label: 'Download Data', icon: 'fa-download', onClick: () => {
                    exportAsCSV(tableData.map(t => ({ Platform: t.platform, Creators: t.creators, 'Avg Score': `${t.avgScore}%`, Performance: `${t.performance}%` })), 'platform-distribution');
                  }},
                  { label: 'View Full Report', icon: 'fa-expand', onClick: () => window.location.href = '/analytics' },
                  { label: 'Share', icon: 'fa-share-nodes', onClick: () => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); } },
                ]} />
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
              <CardMenu items={[
                { label: 'Export to CSV', icon: 'fa-file-csv', onClick: () => {
                  exportAsCSV(tableData.map(t => ({ 
                    Platform: t.platform, 
                    Creators: t.creators, 
                    'Avg Score': `${t.avgScore}%`, 
                    Performance: `${t.performance}%` 
                  })), 'platform-performance');
                }},
              ]} />
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
