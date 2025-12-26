"use client";

import { Sidebar } from '@/components/common/Sidebar';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const influencers = [
  { id: 1, name: 'Jessica Davis', handle: '@jessicad', platform: 'Instagram', followers: '245.3K', engagement: '4.2%', score: 96, risk: 'low' },
  { id: 2, name: 'Michael Johnson', handle: '@mikej_official', platform: 'YouTube', followers: '892.1K', engagement: '6.8%', score: 92, risk: 'low' },
  { id: 3, name: 'Sarah Kumar', handle: '@sarahkbeauty', platform: 'TikTok', followers: '567.8K', engagement: '8.1%', score: 78, risk: 'medium' },
  { id: 4, name: 'Chris Martinez', handle: '@chrism', platform: 'Twitter', followers: '123.4K', engagement: '2.1%', score: 45, risk: 'high' },
  { id: 5, name: 'Emma Wilson', handle: '@emmaw_lifestyle', platform: 'Instagram', followers: '734.2K', engagement: '5.4%', score: 89, risk: 'low' },
  { id: 6, name: 'Alex Chen', handle: '@alexchen_tech', platform: 'YouTube', followers: '1.2M', engagement: '7.2%', score: 94, risk: 'low' },
];

export default function CreatorsPage() {
  const [platformFilter, setPlatformFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredInfluencers = useMemo(() => {
    return influencers.filter((influencer) => {
      // Platform filter
      if (platformFilter !== 'all' && influencer.platform.toLowerCase() !== platformFilter.toLowerCase()) {
        return false;
      }
      
      // Score filter
      if (scoreFilter !== 'all') {
        if (scoreFilter === '90+' && influencer.score < 90) return false;
        if (scoreFilter === '80-89' && (influencer.score < 80 || influencer.score >= 90)) return false;
        if (scoreFilter === '70-79' && (influencer.score < 70 || influencer.score >= 80)) return false;
        if (scoreFilter === 'below70' && influencer.score >= 70) return false;
      }
      
      // Risk filter
      if (riskFilter !== 'all' && influencer.risk !== riskFilter) {
        return false;
      }
      
      return true;
    });
  }, [platformFilter, scoreFilter, riskFilter]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-top">
              <div className="header-left">
                <h1>Influencer Matches</h1>
                <p>AI-vetted creators aligned with your brand</p>
              </div>
              <div className="result-count">
                <i className="fa-solid fa-users"></i>
                {filteredInfluencers.length} creators found
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <span className="filter-label">Platform:</span>
              <select 
                className="filter-select"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Score:</span>
              <select 
                className="filter-select"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
              >
                <option value="all">All Scores</option>
                <option value="90+">90%+</option>
                <option value="80-89">80-89%</option>
                <option value="70-79">70-79%</option>
                <option value="below70">Below 70%</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Risk:</span>
              <select 
                className="filter-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          {/* Influencer Grid */}
          <div className="influencers-grid">
            {filteredInfluencers.length > 0 ? (
              filteredInfluencers.map((influencer) => (
                <div key={influencer.id} className="influencer-card">
                  <div className="card-header-section">
                    <div className="influencer-avatar">
                      {influencer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="influencer-name">
                      <h3>{influencer.name}</h3>
                      <span className="platform-badge">
                        <i className={`fa-brands fa-${influencer.platform.toLowerCase()}`}></i>
                        {influencer.handle}
                      </span>
                    </div>
                  </div>

                  <div className="card-metrics">
                    <div className="metric">
                      <div className="metric-label">Followers</div>
                      <div className="metric-value">{influencer.followers}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Engagement</div>
                      <div className="metric-value">{influencer.engagement}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Score</div>
                      <div className="metric-value">{influencer.score}%</div>
                    </div>
                  </div>

                  <div className="score-bar">
                    <div 
                      className={`score-fill ${influencer.score >= 90 ? 'high' : influencer.score >= 70 ? 'medium' : 'low'}`}
                      style={{ width: `${influencer.score}%` }}
                    ></div>
                  </div>

                  <div className="card-footer">
                    <span className={`risk-level risk-${influencer.risk}`}>
                      <i className="fa-solid fa-shield"></i>
                      {influencer.risk} Risk
                    </span>
                    <Link href={`/creators/${influencer.id}`} className="btn btn-primary btn-sm">
                      View Report
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <i className="fa-solid fa-search"></i>
                <h3>No creators found</h3>
                <p>Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
