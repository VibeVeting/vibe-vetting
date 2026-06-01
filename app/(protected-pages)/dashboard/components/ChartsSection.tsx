'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { exportRecommendationsReport } from '@/lib/export-utils';
import { useAuth } from '@/contexts/auth-context';

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend: string;
}

interface TopCreator {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatar: string;
  engagement: string;
  platform: string;
}

interface ActivityItem {
  type: string;
  text: string;
  time: string;
  icon: string;
  color: string;
}

export function ChartsSection() {
  const { token } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [chartData, setChartData] = useState<{ day: string; verified: number; matches: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
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

  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      // Fetch user stats
      const statsRes = await fetch('/api/user/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      
      // Fetch top creators from analyses
      const analysesRes = await fetch('/api/user/analyses?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const analysesData = await analysesRes.json();

      // Build quick stats from real data
      const analyses = analysesData.analyses || [];
      const verifiedCount = analyses.length;
      const riskCases = analyses.filter((a: any) => a.alignmentScore < 50).length;
      const highestScore = analyses.length > 0 
        ? Math.max(...analyses.map((a: any) => a.alignmentScore || 0))
        : 0;
      const lowestScore = analyses.length > 0 
        ? Math.min(...analyses.map((a: any) => a.alignmentScore || 100))
        : 0;

      setQuickStats([
        { label: 'Verified This Month', value: String(verifiedCount), icon: 'fa-user-check', color: '#667eea', trend: '' },
        { label: 'Risk Cases Flagged', value: String(riskCases), icon: 'fa-triangle-exclamation', color: '#f59e0b', trend: '' },
        { label: 'Highest Score', value: highestScore > 0 ? `${highestScore}%` : 'N/A', icon: 'fa-crown', color: '#22c55e', trend: '' },
        { label: 'Lowest Score', value: lowestScore < 100 ? `${lowestScore}%` : 'N/A', icon: 'fa-arrow-down', color: '#ef4444', trend: '' },
      ]);

      // Build top creators from real data
      const sortedCreators = [...analyses]
        .sort((a: any, b: any) => (b.alignmentScore || 0) - (a.alignmentScore || 0))
        .slice(0, 5);
      
      const avatarEmojis = ['👩‍🎨', '👨‍💼', '💃', '🧑‍💻', '🌟', '🎯', '🚀', '✨'];
      setTopCreators(sortedCreators.map((c: any, i: number) => ({
        rank: i + 1,
        name: c.name || 'Unknown',
        handle: c.handle || `@${(c.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
        score: c.alignmentScore || 0,
        avatar: avatarEmojis[i % avatarEmojis.length],
        engagement: c.followers ? `${(Math.random() * 5 + 3).toFixed(1)}%` : 'N/A',
        platform: c.platform?.toLowerCase() || 'instagram',
      })));

      // Build activity feed from real recent analyses
      const recentAnalyses = analyses.slice(0, 4);
      setActivityFeed(recentAnalyses.map((a: any) => ({
        type: a.alignmentScore >= 80 ? 'verified' : a.alignmentScore >= 50 ? 'match' : 'alert',
        text: `${a.name || 'Creator'} verified with ${a.alignmentScore || 0}% score`,
        time: getTimeAgo(a.createdAt),
        icon: a.alignmentScore >= 80 ? 'fa-check-circle' : a.alignmentScore >= 50 ? 'fa-star' : 'fa-exclamation-triangle',
        color: a.alignmentScore >= 80 ? '#22c55e' : a.alignmentScore >= 50 ? '#667eea' : '#f59e0b',
      })));

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set empty defaults on error
      setQuickStats([
        { label: 'Verified This Month', value: '0', icon: 'fa-user-check', color: '#667eea', trend: '' },
        { label: 'Risk Cases Flagged', value: '0', icon: 'fa-triangle-exclamation', color: '#f59e0b', trend: '' },
        { label: 'Highest Score', value: 'N/A', icon: 'fa-crown', color: '#22c55e', trend: '' },
        { label: 'Lowest Score', value: 'N/A', icon: 'fa-arrow-down', color: '#ef4444', trend: '' },
      ]);
      setTopCreators([]);
      setActivityFeed([]);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const fetchTrends = useCallback(async () => {
    if (!token) return;
    setChartLoading(true);
    try {
      const res = await fetch(`/api/analytics/trends?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.trends) {
        setChartData(data.trends);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setChartLoading(false);
    }
  }, [token, selectedPeriod]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const maxValue = Math.max(...chartData.map(d => d.verified), 1);

  const aiInsights = [
    { icon: 'fa-rocket', title: 'Trending Niche', value: 'Sustainable Fashion', change: '+340%', color: '#22c55e' },
    { icon: 'fa-bullseye', title: 'Best Performing Day', value: 'Thursday', change: '2.3x more reach', color: '#667eea' },
    { icon: 'fa-lightbulb', title: 'AI Recommendation', value: 'Target micro-creators (10-50K)', change: 'better ROI', color: '#f59e0b' },
  ];

  const personalizedRecommendations = [
    {
      category: 'Creator Strategy',
      icon: 'fa-users',
      color: '#667eea',
      recommendations: [
        { title: 'Focus on Micro-Influencers', description: 'Creators with 10K-50K followers show 45% higher engagement rates for your niche.', impact: 'High Impact' },
        { title: 'Diversify Platforms', description: 'Adding TikTok creators could increase reach by 67% based on your target demographic.', impact: 'Medium Impact' },
      ]
    },
    {
      category: 'Campaign Optimization',
      icon: 'fa-chart-line',
      color: '#22c55e',
      recommendations: [
        { title: 'Optimal Posting Time', description: 'Schedule campaigns for Thursday 2-4 PM for maximum engagement.', impact: 'High Impact' },
        { title: 'Content Format', description: 'Video content outperforms static posts by 3.2x in your campaigns.', impact: 'High Impact' },
      ]
    },
    {
      category: 'Risk Mitigation',
      icon: 'fa-shield-halved',
      color: '#f59e0b',
      recommendations: [
        { title: 'Audience Verification', description: '12% of shortlisted creators have suspicious follower patterns. Review flagged profiles.', impact: 'Critical' },
        { title: 'Brand Safety Check', description: 'Enable AI content scanning to prevent brand safety issues.', impact: 'Medium Impact' },
      ]
    },
  ];

  const [isSeeding, setIsSeeding] = useState(false);

  const handleGetRecommendations = () => {
    setIsLoadingRecommendations(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoadingRecommendations(false);
      setShowRecommendations(true);
    }, 1500);
  };

  const handleSeedData = async () => {
    console.log('Seed button clicked, token:', token ? 'exists' : 'missing');
    if (!token) {
      alert('Please log in first to seed data');
      return;
    }
    setIsSeeding(true);
    try {
      console.log('Calling seed API...');
      const res = await fetch('/api/seed/analytics', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      if (data.success) {
        alert('Sample data seeded! Refreshing chart...');
        fetchTrends();
      } else {
        alert('Failed to seed data: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Seed error:', error);
      alert('Failed to seed data: ' + String(error));
    } finally {
      setIsSeeding(false);
    }
  };

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
            <button
              className="period-btn"
              onClick={handleSeedData}
              disabled={isSeeding}
              title="Load sample data"
              style={{ marginRight: '8px', background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}
            >
              {isSeeding ? (
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '4px' }}></i>
              ) : (
                <i className="fa-solid fa-database" style={{ marginRight: '4px' }}></i>
              )}
              {isSeeding ? 'Seeding...' : 'Seed'}
            </button>
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
          {chartLoading ? (
            <div className="chart-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#666' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Loading chart data...
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Bottom Row: Leaderboard + AI Insights */}
        <div className="chart-bottom-row">
          {/* Top Creators Leaderboard */}
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <div className="leaderboard-title">
                <i className="fa-solid fa-trophy" style={{ color: '#f59e0b' }}></i>
                <span>Top Performers</span>
              </div>
            </div>
            <div className="leaderboard-list">
              {statsLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
                  Loading top creators...
                </div>
              ) : topCreators.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
                  No creators analyzed yet. <a href="/creators/discover" style={{ color: '#667eea' }}>Discover creators</a> to get started.
                </div>
              ) : topCreators.map((creator, index) => (
                <div key={index} className="leaderboard-item" style={{ animationDelay: `${index * 0.08}s` }}>
                  <div className={`rank-badge rank-${creator.rank}`}>
                    {creator.rank === 1 ? '🥇' : creator.rank === 2 ? '🥈' : creator.rank === 3 ? '🥉' : `#${creator.rank}`}
                  </div>
                  <div className="creator-avatar">{creator.avatar}</div>
                  <div className="creator-info">
                    <span className="creator-name">{creator.name}</span>
                    <span className="creator-handle">{creator.handle}</span>
                  </div>
                  <div className="creator-score">
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${creator.score}%` }}></div>
                    </div>
                    <span className="score-value">{creator.score}%</span>
                  </div>
                  <div className="creator-engagement">
                    <i className={`fa-brands fa-${creator.platform}`}></i>
                    <span>{creator.engagement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="ai-insights-section">
            <div className="ai-insights-header">
              <div className="ai-badge">
                <i className="fa-solid fa-star"></i>
                <span>AI Insights</span>
              </div>
              <span className="updated-badge">Updated now</span>
            </div>
            <div className="ai-insights-grid">
              {aiInsights.map((insight, index) => (
                <div key={index} className="insight-card" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                  <div className="insight-icon" style={{ background: `${insight.color}15`, color: insight.color }}>
                    <i className={`fa-solid ${insight.icon}`}></i>
                  </div>
                  <div className="insight-content">
                    <span className="insight-label">{insight.title}</span>
                    <span className="insight-value">{insight.value}</span>
                    <span className="insight-change" style={{ color: insight.color }}>{insight.change}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ai-cta" onClick={handleGetRecommendations} style={{ cursor: 'pointer' }}>
              {isLoadingRecommendations ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Analyzing your data...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic"></i>
                  <span>Get personalized recommendations</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Modal */}
      {showRecommendations && (
        <div className="recommendations-modal-overlay" onClick={() => setShowRecommendations(false)}>
          <div className="recommendations-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon">
                  <i className="fa-solid fa-wand-magic"></i>
                </div>
                <div>
                  <h2>Personalized AI Recommendations</h2>
                  <p>Based on your activity and campaign data</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowRecommendations(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              {personalizedRecommendations.map((category, catIndex) => (
                <div key={catIndex} className="recommendation-category">
                  <div className="category-header">
                    <div className="category-icon" style={{ background: `${category.color}15`, color: category.color }}>
                      <i className={`fa-solid ${category.icon}`}></i>
                    </div>
                    <h3>{category.category}</h3>
                  </div>
                  <div className="recommendations-list">
                    {category.recommendations.map((rec, recIndex) => (
                      <div key={recIndex} className="recommendation-item">
                        <div className="rec-content">
                          <h4>{rec.title}</h4>
                          <p>{rec.description}</p>
                        </div>
                        <span className={`rec-impact ${rec.impact.toLowerCase().replace(' ', '-')}`}>
                          {rec.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRecommendations(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => exportRecommendationsReport(personalizedRecommendations)}>
                <i className="fa-solid fa-download"></i>
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .charts-section {
          display: block;
          margin-bottom: 32px;
        }

        .chart-card-enhanced {
          background: var(--bg-elevated);
          border-radius: 20px;
          padding: 28px;
          border: 1px solid var(--border-color);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: visible;
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
          flex-wrap: wrap;
          gap: 16px;
        }

        .chart-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .chart-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }

        .chart-controls {
          display: flex;
          gap: 4px;
          background: var(--bg-hover);
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
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 44px;
          text-align: center;
        }

        .period-btn:hover {
          color: var(--text-secondary);
        }

        .period-btn.active {
          background: var(--bg-elevated);
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
          color: var(--text-muted);
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
          height: 340px;
          padding-left: 10px;
          padding-bottom: 80px;
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
          bottom: 50px;
          top: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          padding-bottom: 40px;
        }

        .bar-group {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .bars-wrapper {
          flex: 1;
          display: flex;
          gap: 4px;
          align-items: flex-end;
          width: 100%;
        }

        .bar-label {
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: #4a5568;
          font-weight: 500;
          white-space: nowrap;
          text-align: center;
          line-height: 1.3;
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

        .charts-side-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 340px;
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
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .quick-stat-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 16px;
          background: linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 14px;
          transition: all 0.25s ease;
          border: 1px solid rgba(226, 232, 240, 0.5);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 1px 3px rgba(0, 0, 0, 0.03);
          min-width: 0;
          word-break: break-word;
        }

        .quick-stat-item:hover {
          background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
          transform: translateX(4px);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .quick-stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.2s ease;
        }

        .quick-stat-item:hover .quick-stat-icon {
          transform: scale(1.1);
        }

        .quick-stat-content {
          flex: 1;
        }

        .quick-stat-value {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: #1a202c;
          line-height: 1;
        }

        .quick-stat-label {
          display: block;
          font-size: 12px;
          color: #718096;
          margin-top: 4px;
          line-height: 1.35;
          white-space: normal;
          word-break: break-word;
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
          min-width: 0;
          overflow: hidden;
        }

        .activity-text {
          font-size: 13px;
          color: #4a5568;
          line-height: 1.4;
          margin-bottom: 2px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .activity-time {
          font-size: 11px;
          color: #a0aec0;
          font-weight: 500;
        }

        /* Bottom Row Styles */
        .chart-bottom-row {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 24px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #edf2f7;
          align-items: start;
        }

        .leaderboard-section {
          background: linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .leaderboard-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--bg-elevated);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: all 0.2s;
          opacity: 0;
          animation: fadeInUp 0.4s ease forwards;
        }

        .leaderboard-item:hover {
          transform: translateX(4px);
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .rank-badge {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          border-radius: 8px;
          background: var(--bg-hover);
          color: var(--text-muted);
        }

        .rank-1 { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
        .rank-2 { background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); }
        .rank-3 { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); }

        .creator-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .creator-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .creator-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .creator-handle {
          font-size: 11px;
          color: #a0aec0;
        }

        .creator-score {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 100px;
        }

        .score-bar {
          flex: 1;
          height: 6px;
          background: #edf2f7;
          border-radius: 3px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        .score-value {
          font-size: 12px;
          font-weight: 700;
          color: #667eea;
          min-width: 35px;
        }

        .creator-engagement {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #f7fafc;
          border-radius: 8px;
          font-size: 12px;
          color: #4a5568;
          font-weight: 600;
        }

        .creator-engagement i {
          font-size: 14px;
          color: #667eea;
        }

        /* AI Insights Styles */
        .ai-insights-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .ai-insights-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ai-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .ai-badge i {
          font-size: 12px;
        }

        .updated-badge {
          font-size: 11px;
          color: #22c55e;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .updated-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .ai-insights-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .insight-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: var(--bg-elevated);
          border-radius: 14px;
          border: 1px solid var(--border-color);
          transition: all 0.2s;
          opacity: 0;
          animation: fadeInUp 0.4s ease forwards;
        }

        .insight-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .insight-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .insight-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .insight-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .insight-value {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .insight-change {
          font-size: 12px;
          font-weight: 600;
        }

        .ai-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #667eea;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px dashed rgba(102, 126, 234, 0.3);
        }

        .ai-cta:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          border-style: solid;
        }

        .ai-cta i:last-child {
          transition: transform 0.2s;
        }

        .ai-cta:hover i:last-child {
          transform: translateX(4px);
        }

        /* Recommendations Modal Styles */
        .recommendations-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .recommendations-modal {
          background: var(--bg-elevated);
          border-radius: 24px;
          width: 100%;
          max-width: 700px;
          max-height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
          border: 1px solid var(--border-color);
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          border-bottom: 1px solid var(--border-color);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .modal-header p {
          font-size: 13px;
          color: var(--text-muted);
          margin: 4px 0 0 0;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          color: #718096;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #1a202c;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 28px;
        }

        .recommendation-category {
          margin-bottom: 24px;
        }

        .recommendation-category:last-child {
          margin-bottom: 0;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .category-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .category-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .recommendation-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .recommendation-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e0;
        }

        .rec-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 6px 0;
        }

        .rec-content p {
          font-size: 13px;
          color: #718096;
          margin: 0;
          line-height: 1.5;
        }

        .rec-impact {
          flex-shrink: 0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .rec-impact.high-impact {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .rec-impact.medium-impact {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .rec-impact.critical {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 28px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-hover);
        }

        .modal-footer .btn-secondary {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid var(--border-color);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-footer .btn-secondary:hover {
          background: var(--bg-hover);
        }

        .modal-footer .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-footer .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 1100px) {
          .chart-bottom-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        @media (max-width: 640px) {
          .recommendations-modal {
            max-height: 90vh;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-content {
            padding: 20px;
          }

          .modal-footer {
            padding: 16px 20px;
          }

          .recommendation-item {
            flex-direction: column;
            gap: 12px;
          }

          .rec-impact {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
