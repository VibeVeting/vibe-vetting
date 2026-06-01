"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { exportAsCSV } from '@/lib/export-utils';

interface KPI {
  label: string;
  value: string;
  change: string;
  icon: string;
  gradient: string;
  shadowColor: string;
  negative?: boolean;
}

interface PlatformData {
  platform: string;
  creators: number;
  avgScore: number;
  performance: number;
  icon: string;
  color: string;
}

export default function AnalyticsPage() {
  const [tableData, setTableData] = useState<PlatformData[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([
    { label: 'Total Campaigns', value: '0', change: '+0%', icon: 'fa-bullhorn', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadowColor: 'rgba(102, 126, 234, 0.4)' },
    { label: 'Creators Analyzed', value: '0', change: '+0%', icon: 'fa-users', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', shadowColor: 'rgba(34, 197, 94, 0.4)' },
    { label: 'Avg. Alignment Score', value: '0%', change: '+0%', icon: 'fa-chart-line', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.4)' },
    { label: 'High Risk Detected', value: '0', change: '0%', icon: 'fa-shield-halved', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', shadowColor: 'rgba(239, 68, 68, 0.4)', negative: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch stats and platform data in parallel
        const [statsResponse, platformsResponse] = await Promise.all([
          fetch('/api/user/stats', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('/api/analytics/platforms', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          const stats = data.stats;
          setKpis([
            { label: 'Total Campaigns', value: stats.activeCampaigns?.toString() || '0', change: '+12%', icon: 'fa-bullhorn', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadowColor: 'rgba(102, 126, 234, 0.4)' },
            { label: 'Creators Analyzed', value: stats.creatorsAnalyzed?.toString() || '0', change: '+8%', icon: 'fa-users', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', shadowColor: 'rgba(34, 197, 94, 0.4)' },
            { label: 'Avg. Alignment Score', value: `${stats.avgAlignmentScore?.toFixed(0) || 0}%`, change: '+5%', icon: 'fa-chart-line', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.4)' },
            { label: 'High Risk Detected', value: stats.highRiskDetected?.toString() || '0', change: '-3%', icon: 'fa-shield-halved', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', shadowColor: 'rgba(239, 68, 68, 0.4)', negative: true },
          ]);
        }

        if (platformsResponse.ok) {
          const platformData = await platformsResponse.json();
          setTableData(platformData.platforms || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Export full analytics report
  const handleExportReport = () => {
    const reportData = [
      { 'Metric': 'Total Campaigns', 'Value': kpis[0]?.value || '0', 'Change': kpis[0]?.change || 'N/A' },
      { 'Metric': 'Creators Analyzed', 'Value': kpis[1]?.value || '0', 'Change': kpis[1]?.change || 'N/A' },
      { 'Metric': 'Avg. Alignment Score', 'Value': kpis[2]?.value || '0%', 'Change': kpis[2]?.change || 'N/A' },
      { 'Metric': 'High Risk Detected', 'Value': kpis[3]?.value || '0', 'Change': kpis[3]?.change || 'N/A' },
      ...tableData.map(row => ({
        'Metric': `${row.platform} - Creators`,
        'Value': row.creators.toString(),
        'Change': `Avg Score: ${row.avgScore}%, Performance: ${row.performance}%`
      }))
    ];
    exportAsCSV(reportData, `analytics-report-${new Date().toISOString().split('T')[0]}`);
  };

  // Export platform table data
  const handleExportTableCSV = () => {
    const exportData = tableData.map(row => ({
      'Platform': row.platform,
      'Creators': row.creators,
      'Avg Score': `${row.avgScore}%`,
      'Performance': `${row.performance}%`
    }));
    exportAsCSV(exportData, `platform-performance-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="yc-page">
          {/* Animated Background */}
          <div className="yc-page-bg">
            <div className="yc-page-orb yc-page-orb-1"></div>
            <div className="yc-page-orb yc-page-orb-2"></div>
            <div className="yc-page-grid"></div>
          </div>

          {/* Page Header */}
          <div className={`yc-page-header ${isVisible ? 'visible' : ''}`}>
            <div className="yc-page-header-content">
              <div className="yc-page-title-section">
                <div className="yc-page-icon">
                  <i className="fa-solid fa-chart-column"></i>
                </div>
                <div>
                  <h1 className="yc-page-title">Analytics <span className="yc-gradient-text">Dashboard</span></h1>
                  <p className="yc-page-subtitle">Real-time campaign performance and insights</p>
                </div>
              </div>
              <div className="yc-page-actions">
                <button className="yc-btn-secondary" onClick={handleExportReport}>
                  <i className="fa-solid fa-download"></i>
                  <span>Export Report</span>
                </button>
                <Link href="/campaigns/create" className="yc-btn-primary">
                  <i className="fa-solid fa-plus"></i>
                  <span>New Campaign</span>
                </Link>
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className={`yc-kpi-grid ${isVisible ? 'visible' : ''}`}>
            {kpis.map((kpi, index) => (
              <div 
                key={index} 
                className="yc-kpi-card"
                style={{ animationDelay: `${index * 0.1}s`, '--shadow-color': kpi.shadowColor } as React.CSSProperties}
              >
                <div className="yc-kpi-glow" style={{ background: kpi.shadowColor }}></div>
                <div className="yc-kpi-content">
                  <div className="yc-kpi-header">
                    <div className="yc-kpi-icon" style={{ background: kpi.gradient }}>
                      <i className={`fa-solid ${kpi.icon}`}></i>
                    </div>
                    <div className={`yc-kpi-change ${kpi.negative ? 'negative' : 'positive'}`}>
                      <i className={`fa-solid fa-arrow-${kpi.change.startsWith('+') ? 'up' : 'down'}`}></i>
                      <span>{kpi.change}</span>
                    </div>
                  </div>
                  <div className="yc-kpi-value">{loading ? '...' : kpi.value}</div>
                  <div className="yc-kpi-label">{kpi.label}</div>
                </div>
                <div className="yc-kpi-chart">
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`kpi-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={kpi.shadowColor} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={kpi.shadowColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M0,35 Q20,${25 + index * 3} 40,${20 - index * 2} T80,${15 + index * 2} T100,${10 + index * 3} V40 H0 Z`}
                      fill={`url(#kpi-gradient-${index})`}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className={`yc-charts-grid ${isVisible ? 'visible' : ''}`}>
            <div className="yc-chart-card">
              <div className="yc-chart-header">
                <div className="yc-chart-title">
                  <div className="yc-chart-icon" style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)' }}>
                    <i className="fa-solid fa-chart-area"></i>
                  </div>
                  <div>
                    <h3>Creator Verification Trends</h3>
                    <p>Monthly analysis performance</p>
                  </div>
                </div>
                <div className="yc-chart-actions">
                  <button className="yc-chart-btn active">Week</button>
                  <button className="yc-chart-btn">Month</button>
                  <button className="yc-chart-btn">Year</button>
                </div>
              </div>
              <div className="yc-chart-body">
                <div className="yc-chart-placeholder">
                  <div className="yc-chart-bars">
                    {[65, 85, 45, 90, 70, 80, 55].map((h, i) => (
                      <div key={i} className="yc-bar-wrapper">
                        <div 
                          className="yc-bar" 
                          style={{ 
                            height: `${h}%`, 
                            background: 'linear-gradient(180deg, #00f5ff 0%, #0099ff 100%)',
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                        <span className="yc-bar-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="yc-chart-card">
              <div className="yc-chart-header">
                <div className="yc-chart-title">
                  <div className="yc-chart-icon" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                    <i className="fa-solid fa-chart-pie"></i>
                  </div>
                  <div>
                    <h3>Platform Distribution</h3>
                    <p>Creators by social platform</p>
                  </div>
                </div>
              </div>
              <div className="yc-chart-body">
                <div className="yc-donut-chart">
                  <div className="yc-donut">
                    <div className="yc-donut-center">
                      <span className="yc-donut-value">0</span>
                      <span className="yc-donut-label">Total</span>
                    </div>
                  </div>
                  <div className="yc-donut-legend">
                    {tableData.map((p, i) => (
                      <div key={i} className="yc-legend-item">
                        <span className="yc-legend-dot" style={{ background: p.color }}></span>
                        <span className="yc-legend-text">{p.platform}</span>
                        <span className="yc-legend-value">{p.creators}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Performance Table */}
          <div className={`yc-table-section ${isVisible ? 'visible' : ''}`}>
            <div className="yc-table-header">
              <div className="yc-table-title">
                <div className="yc-table-icon">
                  <i className="fa-solid fa-ranking-star"></i>
                </div>
                <div>
                  <h2>Platform Performance</h2>
                  <p>Detailed breakdown by platform</p>
                </div>
              </div>
              <div className="yc-table-actions">
                <button className="yc-table-btn" onClick={handleExportTableCSV}>
                  <i className="fa-solid fa-download"></i>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
            <div className="yc-table-container">
              <table className="yc-table">
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
                    <tr key={index} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td>
                        <div className="yc-platform-cell">
                          <div className="yc-platform-icon" style={{ background: row.color }}>
                            <i className={`fa-brands ${row.icon}`}></i>
                          </div>
                          <span>{row.platform}</span>
                        </div>
                      </td>
                      <td>
                        <span className="yc-table-value">{row.creators.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className="yc-score-badge" style={{ 
                          background: row.avgScore >= 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: row.avgScore >= 80 ? '#22c55e' : '#f59e0b'
                        }}>
                          {row.avgScore}%
                        </span>
                      </td>
                      <td>
                        <div className="yc-performance-cell">
                          <div className="yc-performance-bar">
                            <div 
                              className="yc-performance-fill" 
                              style={{ 
                                width: `${row.performance}%`,
                                background: `linear-gradient(90deg, ${row.color}aa, ${row.color})`
                              }}
                            ></div>
                          </div>
                          <span className="yc-performance-value">{row.performance}%</span>
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
    </div>
  );
}
