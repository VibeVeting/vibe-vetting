"use client";

import { Sidebar } from '@/components/common/Sidebar';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';

interface CampaignData {
  name: string;
  description: string;
  industry: string;
  platforms: string[];
  followerRange: string;
  engagementRate: string;
  audienceLocation: string[];
  minTrustScore: string;
  maxRiskLevel: string;
}

interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: string;
  followersNum: number;
  engagement: string;
  engagementNum: number;
  score: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
  location: string;
  bio: string;
  matchReason?: string;
}

// Helper function to parse follower string to number
const parseFollowers = (followers: string): number => {
  if (!followers) return 0;
  const cleaned = followers.toLowerCase().replace(/[^0-9.kmb]/g, '');
  const num = parseFloat(cleaned) || 0;
  if (followers.toLowerCase().includes('m')) return num * 1000000;
  if (followers.toLowerCase().includes('k')) return num * 1000;
  return num;
};

// Helper function to determine risk level from score
const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score >= 80) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
};

// Helper function to check follower range match
const matchesFollowerRange = (followersNum: number, range: string): boolean => {
  switch (range) {
    case 'nano': return followersNum >= 1000 && followersNum < 10000;
    case 'micro': return followersNum >= 10000 && followersNum < 50000;
    case 'mid': return followersNum >= 50000 && followersNum < 500000;
    case 'macro': return followersNum >= 500000 && followersNum < 1000000;
    case 'mega': return followersNum >= 1000000;
    default: return true;
  }
};

// Helper to map industry to category
const industryToCategory: Record<string, string[]> = {
  'fashion': ['fashion'],
  'tech': ['tech'],
  'fitness': ['fitness'],
  'food': ['food'],
  'travel': ['lifestyle', 'travel'],
  'gaming': ['gaming', 'entertainment'],
  'finance': ['finance'],
  'education': ['education'],
  'automotive': ['tech', 'lifestyle'],
  'home': ['lifestyle'],
};

export default function MatchesPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Animation trigger
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Fetch real creators from database
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user/analyses', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const creators = (data.analyses || []).map((a: any) => ({
            id: a.id,
            name: a.name || 'Unknown Creator',
            handle: a.handle || `@${(a.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
            platform: a.platform || 'Instagram',
            followers: a.followers || '0',
            followersNum: parseFollowers(a.followers || '0'),
            engagement: `${(a.alignmentScore ? Math.min(a.alignmentScore / 10, 10) : 0).toFixed(1)}%`,
            engagementNum: a.alignmentScore ? Math.min(a.alignmentScore / 10, 10) : 0,
            score: a.alignmentScore || 0,
            risk: getRiskLevel(a.alignmentScore || 0),
            category: a.niche?.toLowerCase() || 'lifestyle',
            location: 'us', // Default location
            bio: a.bio || `${a.platform || 'Instagram'} creator`,
          }));
          setAllCreators(creators);
        }
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  // Load campaign data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('newCampaign');
    if (stored) {
      try {
        setCampaignData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse campaign data:', e);
      }
    }
  }, []);

  // Filter creators based on campaign criteria + manual filters
  const filteredInfluencers = useMemo(() => {
    let creators = [...allCreators];
    
    // Apply campaign-based filters first
    if (campaignData) {
      // Filter by platforms from campaign
      if (campaignData.platforms && campaignData.platforms.length > 0) {
        creators = creators.filter(c => 
          campaignData.platforms.some(p => p.toLowerCase() === c.platform.toLowerCase())
        );
      }
      
      // Filter by follower range from campaign
      if (campaignData.followerRange) {
        creators = creators.filter(c => matchesFollowerRange(c.followersNum, campaignData.followerRange));
      }
      
      // Filter by engagement rate from campaign
      if (campaignData.engagementRate) {
        const minEngagement = parseFloat(campaignData.engagementRate);
        creators = creators.filter(c => c.engagementNum >= minEngagement);
      }
      
      // Filter by industry/category from campaign
      if (campaignData.industry) {
        const matchingCategories = industryToCategory[campaignData.industry] || [];
        if (matchingCategories.length > 0) {
          creators = creators.filter(c => matchingCategories.includes(c.category));
        }
      }
      
      // Filter by location from campaign
      if (campaignData.audienceLocation && campaignData.audienceLocation.length > 0) {
        if (!campaignData.audienceLocation.includes('global')) {
          creators = creators.filter(c => campaignData.audienceLocation.includes(c.location));
        }
      }
      
      // Filter by minimum trust score from campaign
      if (campaignData.minTrustScore) {
        const minScore = parseInt(campaignData.minTrustScore);
        creators = creators.filter(c => c.score >= minScore);
      }
      
      // Filter by max risk level from campaign
      if (campaignData.maxRiskLevel) {
        const riskLevels = ['low', 'medium', 'high'];
        const maxRiskIndex = riskLevels.indexOf(campaignData.maxRiskLevel);
        if (maxRiskIndex !== -1) {
          creators = creators.filter(c => riskLevels.indexOf(c.risk) <= maxRiskIndex);
        }
      }
      
      // Add match reasons
      creators = creators.map(c => ({
        ...c,
        matchReason: `Matches ${campaignData.industry || 'your'} campaign • ${c.platform} • ${c.engagement} engagement`
      }));
    }
    
    // Apply manual page filters
    if (platformFilter !== 'all') {
      creators = creators.filter(c => c.platform.toLowerCase() === platformFilter.toLowerCase());
    }
    
    if (scoreFilter !== 'all') {
      if (scoreFilter === '90+') creators = creators.filter(c => c.score >= 90);
      else if (scoreFilter === '80-89') creators = creators.filter(c => c.score >= 80 && c.score < 90);
      else if (scoreFilter === '70-79') creators = creators.filter(c => c.score >= 70 && c.score < 80);
      else if (scoreFilter === 'below70') creators = creators.filter(c => c.score < 70);
    }
    
    if (riskFilter !== 'all') {
      creators = creators.filter(c => c.risk === riskFilter);
    }
    
    // Sort by score (highest first)
    creators.sort((a, b) => b.score - a.score);
    
    return creators;
  }, [campaignData, platformFilter, scoreFilter, riskFilter]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="yc-page" ref={pageRef}>
          {/* YC Background Effects */}
          <div className="yc-page-bg">
            <div className="yc-page-orb yc-page-orb-1"></div>
            <div className="yc-page-orb yc-page-orb-2"></div>
            <div className="yc-page-grid"></div>
          </div>

          {/* YC Page Header */}
          <div className={`yc-page-header ${isVisible ? 'visible' : ''}`}>
            <div className="yc-page-header-content">
              <div className="yc-page-title-section">
                <div className="yc-page-icon" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)' }}>
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <div>
                  <h1 className="yc-page-title">{campaignData?.name ? `Matches for "${campaignData.name}"` : "Influencer Matches"}</h1>
                  <p className="yc-page-subtitle">{loading ? 'Loading creators...' : `AI-vetted creators aligned with your brand • ${filteredInfluencers.length} creators found`}</p>
                </div>
              </div>
              <div className="yc-page-actions">
                <Link href="/campaigns" className="yc-btn-secondary">
                  <i className="fa-solid fa-arrow-left"></i> Back to Campaigns
                </Link>
              </div>
            </div>
          </div>

          {/* Campaign Criteria Summary */}
          {campaignData && (
            <div className="campaign-criteria-banner">
              <div className="criteria-header">
                <i className="fa-solid fa-filter"></i>
                <span>Campaign Filters Applied</span>
              </div>
              <div className="criteria-tags">
                {campaignData.platforms?.length > 0 && (
                  <span className="criteria-tag">
                    <i className="fa-solid fa-globe"></i>
                    {campaignData.platforms.join(', ')}
                  </span>
                )}
                {campaignData.followerRange && (
                  <span className="criteria-tag">
                    <i className="fa-solid fa-users"></i>
                    {campaignData.followerRange} tier
                  </span>
                )}
                {campaignData.engagementRate && (
                  <span className="criteria-tag">
                    <i className="fa-solid fa-chart-line"></i>
                    {campaignData.engagementRate}%+ engagement
                  </span>
                )}
                {campaignData.industry && (
                  <span className="criteria-tag">
                    <i className="fa-solid fa-tag"></i>
                    {campaignData.industry}
                  </span>
                )}
                {campaignData.audienceLocation?.length > 0 && (
                  <span className="criteria-tag">
                    <i className="fa-solid fa-location-dot"></i>
                    {campaignData.audienceLocation.join(', ').toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          )}

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
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="twitch">Twitch</option>
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
            {loading ? (
              <div className="loading-state" style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center', color: '#718096' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
                <p>Loading analyzed creators...</p>
              </div>
            ) : filteredInfluencers.length > 0 ? (
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

                  {influencer.matchReason && (
                    <div className="match-reason">
                      <i className="fa-solid fa-star"></i>
                      {influencer.matchReason}
                    </div>
                  )}

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
              <div className="no-results" style={{ gridColumn: 'span 3' }}>
                <i className="fa-solid fa-search"></i>
                <h3>No creators found</h3>
                {allCreators.length === 0 ? (
                  <>
                    <p>You haven&apos;t analyzed any creators yet. Discover and analyze creators to see matches.</p>
                    <Link href="/creators/discover" className="btn btn-primary" style={{ marginTop: '16px' }}>
                      Discover Creators
                    </Link>
                  </>
                ) : (
                  <>
                    <p>Try adjusting your campaign filters or page filters to see more results</p>
                    <Link href="/campaigns/create" className="btn btn-primary" style={{ marginTop: '16px' }}>
                      Create New Campaign
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .campaign-criteria-banner {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }

        .criteria-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 12px;
        }

        .criteria-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .criteria-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .criteria-tag i {
          color: #667eea;
          font-size: 11px;
        }

        .match-reason {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-radius: 8px;
          font-size: 11px;
          color: #667eea;
          margin-bottom: 12px;
        }

        .match-reason i {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
