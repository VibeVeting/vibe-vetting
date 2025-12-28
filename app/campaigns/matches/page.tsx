"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const influencers = [
  { id: 1, name: 'Sarah Johnson', handle: '@sarahj', platform: 'Instagram', followers: '125K', engagement: '4.5%', score: 94, risk: 'low' },
  { id: 2, name: 'Mike Chen', handle: '@mikec_yt', platform: 'YouTube', followers: '250K', engagement: '6.2%', score: 89, risk: 'low' },
  { id: 3, name: 'Emma Davis', handle: '@emmad_tt', platform: 'TikTok', followers: '500K', engagement: '8.1%', score: 87, risk: 'medium' },
  { id: 4, name: 'Alex Rivera', handle: '@alexr', platform: 'Instagram', followers: '312K', engagement: '5.8%', score: 92, risk: 'low' },
  { id: 5, name: 'Jordan Lee', handle: '@jordanl_tech', platform: 'YouTube', followers: '890K', engagement: '7.4%', score: 78, risk: 'medium' },
  { id: 6, name: 'Taylor Kim', handle: '@taylork', platform: 'TikTok', followers: '1.2M', engagement: '9.2%', score: 85, risk: 'low' },
];

export default function MatchesPage() {
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
    <ProtectedRoute>
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Influencer Matches"
            subtitle={`AI-vetted creators aligned with your brand • ${filteredInfluencers.length} creators found`}
          />

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
    </ProtectedRoute>
  );
}
