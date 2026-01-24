'use client';

import { useEffect, useState, useRef } from 'react';

export function ChartsSection() {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Mock data for visualization
  const chartData = [
    { day: 'Mon', verified: 8, matches: 5 },
    { day: 'Tue', verified: 12, matches: 7 },
    { day: 'Wed', verified: 6, matches: 4 },
    { day: 'Thu', verified: 15, matches: 9 },
    { day: 'Fri', verified: 11, matches: 8 },
    { day: 'Sat', verified: 9, matches: 6 },
    { day: 'Sun', verified: 14, matches: 10 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.verified));

  const quickStats = [
    { label: 'Verified This Month', value: '127', icon: 'fa-user-check', color: '#667eea', trend: '+23%' },
    { label: 'Risk Cases Flagged', value: '8', icon: 'fa-triangle-exclamation', color: '#f59e0b', trend: '-12%' },
    { label: 'Highest Score', value: '98%', icon: 'fa-crown', color: '#22c55e', trend: '' },
    { label: 'Lowest Score', value: '42%', icon: 'fa-arrow-down', color: '#ef4444', trend: '' },
  ];

  const activityFeed = [
    { type: 'verified', text: 'New creator verified with 94% score', time: '2m ago', icon: 'fa-check-circle', color: '#22c55e' },
    { type: 'campaign', text: 'Summer Campaign matched 5 creators', time: '15m ago', icon: 'fa-bullhorn', color: '#667eea' },
    { type: 'alert', text: 'Risk detected for @username', time: '1h ago', icon: 'fa-exclamation-triangle', color: '#f59e0b' },
    { type: 'match', text: 'Perfect match found: 98% alignment', time: '2h ago', icon: 'fa-star', color: '#ec4899' },
  ];

  return (
    <div className="charts-section" ref={sectionRef}>
      {/* Main Chart Card */}
      <div className={`chart-card-enhanced ${isVisible ? 'visible' : ''}`}>
        <div className="chart-header">
          <div className="chart-title-group">
            <h3 className="chart-title">Creator Verification Trends</h3>
            <p className="chart-subtitle">Weekly overview of verified creators and matches</p>
          </div>
          <div className="chart-controls">
            {['24h', '7d', '30d', '90d'].map(period => (
              <button
                key={period}
                className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot verified"></span>
            Verified
          </div>
          <div className="legend-item">
            <span className="legend-dot matches"></span>
            Matches
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-grid">
            {[100, 75, 50, 25].map(val => (
              <div key={val} className="grid-line">
                <span className="grid-label">{Math.round(maxValue * val / 100)}</span>
              </div>
            ))}
          </div>
          <div className="chart-bars">
            {chartData.map((data, index) => (
              <div key={data.day} className="bar-group" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bars-wrapper">
                  <div
                    className="bar verified"
                    style={{
                      height: isVisible ? `${Math.max((data.verified / maxValue) * 170, 8)}px` : '8px',
                      transitionDelay: `${index * 0.1}s`,
                    }}
                  >
                    <span className="bar-tooltip">{data.verified} verified</span>
                  </div>
                  <div
                    className="bar matches"
                    style={{
                      height: isVisible ? `${Math.max((data.matches / maxValue) * 170, 8)}px` : '8px',
                      transitionDelay: `${index * 0.1 + 0.05}s`,
                    }}
                  >
                    <span className="bar-tooltip">{data.matches} matches</span>
                  </div>
                </div>
                <span className="bar-label">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="charts-side-panel">
        {/* Quick Stats */}
        <div className={`side-card ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="side-card-header">
            <h3 className="side-card-title">Quick Stats</h3>
            <i className="fa-solid fa-chart-simple"></i>
          </div>
          <div className="quick-stats-grid">
            {quickStats.map((stat, index) => (
              <div key={index} className="quick-stat-item">
                <div className="quick-stat-icon" style={{ color: stat.color, background: `${stat.color}15` }}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <div className="quick-stat-content">
                  <span className="quick-stat-value">{stat.value}</span>
                  <span className="quick-stat-label">{stat.label}</span>
                </div>
                {stat.trend && (
                  <span className={`quick-stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className={`side-card ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.4s' }}>
          <div className="side-card-header">
            <h3 className="side-card-title">Recent Activity</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-feed">
            {activityFeed.map((item, index) => (
              <div key={index} className="activity-item" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                <div className="activity-icon" style={{ color: item.color, background: `${item.color}15` }}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <div className="activity-content">
                  <p className="activity-text">{item.text}</p>
                  <span className="activity-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .charts-section {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (max-width: 1200px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
        }

        .chart-card-enhanced {
          background: white;
          border-radius: 20px;
          padding: 28px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .chart-card-enhanced.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .chart-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 4px;
        }

        .chart-subtitle {
          font-size: 13px;
          color: #718096;
        }

        .chart-controls {
          display: flex;
          gap: 4px;
          background: #f7fafc;
          padding: 4px;
          border-radius: 10px;
        }

        .period-btn {
          padding: 8px 14px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #718096;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 44px;
          text-align: center;
        }

        .period-btn:hover {
          color: #4a5568;
        }

        .period-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .chart-legend {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #718096;
          font-weight: 500;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }

        .legend-dot.verified {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .legend-dot.matches {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }

        .chart-container {
          position: relative;
          height: 220px;
          padding-left: 10px;
        }

        .chart-grid {
          position: absolute;
          inset: 0;
          left: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .grid-line {
          border-top: 1px dashed #e2e8f0;
          position: relative;
          margin-left: 35px;
        }

        .grid-label {
          position: absolute;
          left: -35px;
          top: -8px;
          font-size: 12px;
          color: #a0aec0;
          font-weight: 500;
          width: 30px;
          text-align: right;
        }

        .chart-bars {
          position: absolute;
          left: 50px;
          right: 20px;
          bottom: 30px;
          top: 0;
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .bars-wrapper {
          flex: 1;
          display: flex;
          gap: 4px;
          align-items: flex-end;
          width: 100%;
        }

        .bar {
          flex: 1;
          border-radius: 6px 6px 0 0;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          cursor: pointer;
          min-height: 4px;
          box-shadow: 
            inset 2px 0 4px rgba(255, 255, 255, 0.2),
            inset -2px 0 4px rgba(0, 0, 0, 0.05),
            0 -2px 8px rgba(0, 0, 0, 0.1);
        }

        .bar.verified {
          background: linear-gradient(180deg, #818cf8 0%, #667eea 40%, #764ba2 100%);
        }

        .bar.matches {
          background: linear-gradient(180deg, #4ade80 0%, #22c55e 40%, #16a34a 100%);
        }

        .bar:hover {
          transform: scaleY(1.05) scaleX(1.08);
          box-shadow: 
            inset 2px 0 4px rgba(255, 255, 255, 0.3),
            inset -2px 0 4px rgba(0, 0, 0, 0.05),
            0 -4px 16px rgba(0, 0, 0, 0.15);
        }

        .bar-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .bar:hover .bar-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-12px);
        }

        .bar-label {
          margin-top: 10px;
          font-size: 12px;
          color: #718096;
          font-weight: 500;
        }

        .charts-side-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .side-card {
          background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-bottom: 3px solid rgba(226, 232, 240, 0.9);
          opacity: 0;
          transform: translateY(20px) perspective(1000px) rotateX(2deg);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .side-card.visible {
          opacity: 1;
          transform: translateY(0) perspective(1000px) rotateX(0deg);
        }

        .side-card:hover {
          transform: translateY(-4px) perspective(1000px) rotateX(-1deg);
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          border-bottom-color: rgba(102, 126, 234, 0.3);
        }

        .side-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .side-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a202c;
        }

        .side-card-header i {
          color: #a0aec0;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          text-decoration: underline;
          transform: translateX(2px);
        }

        .quick-stats-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .quick-stat-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 14px;
          transition: all 0.25s ease;
          border: 1px solid rgba(226, 232, 240, 0.5);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 1px 3px rgba(0, 0, 0, 0.03);
        }

        .quick-stat-item:hover {
          background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
          transform: translateX(4px);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .quick-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);\n          transition: all 0.2s ease;
        }

        .quick-stat-item:hover .quick-stat-icon {
          transform: scale(1.1);
        }

        .quick-stat-content {
          flex: 1;
        }

        .quick-stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
          line-height: 1;
        }

        .quick-stat-label {
          display: block;
          font-size: 11px;
          color: #718096;
          margin-top: 4px;
        }

        .quick-stat-trend {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .quick-stat-trend.positive {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .quick-stat-trend.negative {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #edf2f7;
          opacity: 0;
          animation: fadeInUp 0.4s ease forwards;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-size: 13px;
          color: #4a5568;
          line-height: 1.4;
          margin-bottom: 2px;
        }

        .activity-time {
          font-size: 11px;
          color: #a0aec0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
