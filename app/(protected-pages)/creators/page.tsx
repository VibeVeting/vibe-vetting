"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Creator {
  id: string;
  name: string;
  handle: string;
  username: string;
  platform: string;
  followers: string;
  alignmentScore: number;
  riskLevel: string;
}

// Helper function to get profile URL based on platform
const getProfileUrl = (platform: string, username: string) => {
  const urls: Record<string, string> = {
    instagram: `https://instagram.com/${username}`,
    twitter: `https://twitter.com/${username}`,
    youtube: `https://youtube.com/@${username}`,
    tiktok: `https://tiktok.com/@${username}`,
    linkedin: `https://linkedin.com/in/${username}`,
    facebook: `https://facebook.com/${username}`,
  };
  return urls[platform.toLowerCase()] || '#';
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/analyses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCreators(data.analyses.map((a: any) => {
            const username = a.handle?.replace('@', '') || a.name.toLowerCase().replace(' ', '');
            return {
              id: a.id,
              name: a.name,
              handle: a.handle || `@${username}`,
              username: username,
              platform: a.platform || 'Instagram',
              followers: a.followers,
              alignmentScore: a.alignmentScore,
              riskLevel: a.riskLevel?.toLowerCase() || 'medium',
            };
          }));
        }
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const filteredCreators = creators.filter((creator) => {
    // Search filter - check name and handle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = creator.name.toLowerCase().includes(query);
      const matchesHandle = creator.handle.toLowerCase().includes(query);
      if (!matchesName && !matchesHandle) return false;
    }
    if (platformFilter !== 'all' && creator.platform.toLowerCase() !== platformFilter.toLowerCase()) {
      return false;
    }
    if (scoreFilter !== 'all') {
      if (scoreFilter === '90+' && creator.alignmentScore < 90) return false;
      if (scoreFilter === '80-89' && (creator.alignmentScore < 80 || creator.alignmentScore >= 90)) return false;
      if (scoreFilter === '70-79' && (creator.alignmentScore < 70 || creator.alignmentScore >= 80)) return false;
      if (scoreFilter === 'below70' && creator.alignmentScore >= 70) return false;
    }
    if (riskFilter !== 'all' && creator.riskLevel !== riskFilter) {
      return false;
    }
    return true;
  });

  return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title="Analyzed Creators"
              subtitle={`Your AI-vetted creators • ${filteredCreators.length} creators found`}
            />

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group search-filter">
                <span className="filter-label">Search</span>
                <div className="search-input-wrapper">
                  <i className="fa-solid fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-filter-input"
                  />
                  {searchQuery && (
                    <button 
                      className="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="filter-group">
                <span className="filter-label">Platform</span>
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
                <span className="filter-label">Score</span>
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
                <span className="filter-label">Risk</span>
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

            {/* Creators Grid */}
            <div className="influencers-grid">
              {loading ? (
                <div style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center', color: '#718096' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
                  <p>Loading creators...</p>
                </div>
              ) : filteredCreators.length > 0 ? (
                filteredCreators.map((creator) => (
                  <div key={creator.id} className="influencer-card">
                    <div className="card-header-section">
                      <div className="influencer-avatar">
                        {creator.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="influencer-name">
                        <h3>{creator.name}</h3>
                        <a 
                          href={getProfileUrl(creator.platform, creator.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="platform-badge platform-badge-link"
                        >
                          <i className={`fa-brands fa-${creator.platform.toLowerCase()}`}></i>
                          {creator.handle}
                          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}></i>
                        </a>
                      </div>
                    </div>

                    <div className="card-metrics">
                      <div className="metric">
                        <div className="metric-label">Followers</div>
                        <div className="metric-value">{creator.followers}</div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Score</div>
                        <div className="metric-value">{creator.alignmentScore}%</div>
                      </div>
                    </div>

                    <div className="score-bar">
                      <div 
                        className={`score-fill ${creator.alignmentScore >= 90 ? 'high' : creator.alignmentScore >= 70 ? 'medium' : 'low'}`}
                        style={{ width: `${creator.alignmentScore}%` }}
                      ></div>
                    </div>

                    <div className="card-footer">
                      <span className={`risk-level risk-${creator.riskLevel}`}>
                        <i className="fa-solid fa-shield"></i>
                        {creator.riskLevel} Risk
                      </span>
                      <Link href={`/creators/${creator.id}`} className="btn btn-primary btn-sm">
                        View Report
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results" style={{ gridColumn: 'span 3' }}>
                  <i className="fa-solid fa-search"></i>
                  <h3>No creators found</h3>
                  <p>{creators.length === 0 ? 'Start analyzing creators to see them here' : 'Try adjusting your filters to see more results'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
