"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { AIButton } from '@/components/common/AIButton';
import { AddToPipelineModal } from '@/components/pipeline/AddToPipelineModal';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { exportCreatorReport } from '@/lib/export-utils';

// Interfaces for API data
interface CoreMetric {
  label: string;
  value: number;
  description: string;
  icon: string;
}

interface EngagementData {
  likes: { value: number; percentage: number; trend: string };
  comments: { value: number; percentage: number; trend: string };
  shares: { value: number; percentage: number; trend: string };
  saves: { value: number; percentage: number; trend: string };
}

interface ContentAnalysis {
  totalPosts: number;
  avgPostsPerWeek: number;
  topPerformingType: string;
  contentTypes: { type: string; count: number; percentage: number }[];
  topHashtags: string[];
  postingSchedule: string;
}

interface BrandAlignment {
  overallScore: number;
  vision: { score: number; description: string };
  mission: { score: number; description: string };
  values: { score: number; description: string };
  audience: { score: number; description: string };
  tone: { score: number; description: string };
}

interface FuturePrediction {
  overall: string;
  confidence: number;
  prediction: string;
  factors: { factor: string; impact: string; score: number; description: string }[];
}

interface RisingStarData {
  isRisingStar: boolean;
  starScore: number;
  indicators: { label: string; value: boolean; detail: string }[];
  projectedReach: string;
  recommendedAction: string;
}

interface AuthenticityData {
  score: number;
  realFollowers: number;
  suspiciousActivity: number;
  engagementQuality: number;
  audienceGrowth: string;
  checks: { check: string; status: string; detail: string }[];
}

interface RecentPost {
  id: number;
  type: string;
  thumbnail: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface Strength {
  title: string;
  description: string;
}

interface Concern {
  title: string;
  description: string;
  severity: string;
}

interface CreatorData {
  _id: string;
  creatorId: string;
  name: string;
  handle: string;
  username: string;
  platform: string;
  profileUrl?: string;
  followers: string;
  following: string;
  posts: string;
  engagement: string;
  avgViews: string;
  avgLikes: string;
  avgComments: string;
  avgShares: string;
  score: number;
  alignmentScore: number;
  recommendation: string;
  isRisingStar: boolean;
  growthRate: string;
  joinedDate: string;
  niche: string;
  location: string;
  bio: string;
  riskLevel: string;
  coreMetrics: {
    audienceAuthenticity: number;
    contentQuality: number;
    brandSafety: number;
    engagementRate: number;
    professionalism: number;
    growthTrajectory: number;
  };
  engagementData: EngagementData;
  contentAnalysis: ContentAnalysis;
  brandAlignment: BrandAlignment;
  futurePrediction: FuturePrediction;
  risingStarData: RisingStarData;
  authenticityData: AuthenticityData;
  recentPosts: RecentPost[];
  strengths: Strength[];
  concerns: Concern[];
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

// Convert core metrics object to array format for display
const formatCoreMetrics = (metrics: CreatorData['coreMetrics']): CoreMetric[] => [
  { label: 'Audience Authenticity', value: metrics.audienceAuthenticity, description: 'Real followers vs bots/fake accounts', icon: 'fa-users-viewfinder' },
  { label: 'Content Quality', value: metrics.contentQuality, description: 'Visual & editorial excellence', icon: 'fa-star' },
  { label: 'Brand Safety', value: metrics.brandSafety, description: 'Content appropriateness score', icon: 'fa-shield-halved' },
  { label: 'Engagement Rate', value: metrics.engagementRate, description: 'Active audience participation', icon: 'fa-comments' },
  { label: 'Professionalism', value: metrics.professionalism, description: 'Consistency & reliability', icon: 'fa-briefcase' },
  { label: 'Growth Trajectory', value: metrics.growthTrajectory, description: 'Account growth momentum', icon: 'fa-arrow-trend-up' },
];

export default function CreatorProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view creator analysis');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/creators/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCreatorData(data.creator);
        } else if (response.status === 404) {
          setError('Creator analysis not found. This creator has not been analyzed yet.');
        } else {
          setError('Failed to load creator data');
        }
      } catch (err) {
        console.error('Error fetching creator:', err);
        setError('Failed to load creator data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCreatorData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container creator-analysis-page">
            <TopBar title="Creator Analysis" subtitle="Loading..." showSearch={false} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <div style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '48px', color: '#667eea', marginBottom: '20px' }}></i>
                <p style={{ color: '#64748b' }}>Loading creator analysis...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creatorData) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container creator-analysis-page">
            <TopBar title="Creator Analysis" subtitle="Error" showSearch={false} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '20px' }}></i>
                <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>{error || 'Creator not found'}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  The creator you are looking for may not exist or has not been analyzed yet.
                </p>
                <Link href="/creators" className="btn btn-primary">
                  <i className="fa-solid fa-arrow-left"></i> Back to Creators
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format core metrics for display
  const coreMetrics = formatCoreMetrics(creatorData.coreMetrics);
  const engagementData = creatorData.engagementData;
  const contentAnalysis = creatorData.contentAnalysis;
  const brandAlignment = creatorData.brandAlignment;
  const futurePrediction = creatorData.futurePrediction;
  const risingStarData = creatorData.risingStarData;
  const authenticityData = creatorData.authenticityData;
  const recentPosts = creatorData.recentPosts;
  const strengths = creatorData.strengths;
  const concerns = creatorData.concerns;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container creator-analysis-page">
          <TopBar
            title="Creator Analysis"
            subtitle={`vibeAI™ Deep Analysis Report`}
            showSearch={false}
          />

          {/* Enhanced Creator Header */}
          <div className="creator-profile-header">
            <div className="profile-left">
              <div className="creator-avatar-xl">
                {creatorData.name.split(' ').map(n => n[0]).join('')}
                {creatorData.isRisingStar && (
                  <div className="rising-star-badge" title="Rising Star">
                    <i className="fa-solid fa-star"></i>
                  </div>
                )}
              </div>
              <div className="creator-details">
                <div className="name-row">
                  <h1>{creatorData.name}</h1>
                  <span className="verified-badge"><i className="fa-solid fa-circle-check"></i></span>
                  {creatorData.isRisingStar && (
                    <span className="rising-star-tag">
                      <i className="fa-solid fa-rocket"></i> Rising Star
                    </span>
                  )}
                </div>
                <a 
                  href={getProfileUrl(creatorData.platform, creatorData.username)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="creator-platform creator-platform-link"
                >
                  <i className={`fa-brands fa-${creatorData.platform.toLowerCase()}`}></i>
                  <span>{creatorData.handle}</span>
                  <i className="fa-solid fa-arrow-up-right-from-square external-link-icon"></i>
                </a>
                <p className="creator-bio-text">{creatorData.bio}</p>
                <div className="creator-meta">
                  <span><i className="fa-solid fa-location-dot"></i> {creatorData.location}</span>
                  <span><i className="fa-solid fa-tag"></i> {creatorData.niche}</span>
                  <span><i className="fa-solid fa-calendar"></i> Since {creatorData.joinedDate}</span>
                </div>
              </div>
            </div>
            <div className="profile-right">
              <div className="vibeai-score-card">
                <div className="score-header">
                  <span className="score-label">vibeAI™ Score</span>
                  <span className="score-badge excellent">Excellent</span>
                </div>
                <div className="score-circle-large">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                    <circle 
                      cx="60" cy="60" r="54" fill="none" 
                      stroke="url(#scoreGradient)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(creatorData.score / 100) * 339.3} 339.3`}
                      transform="rotate(-90 60 60)"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#667eea"/>
                        <stop offset="100%" stopColor="#22c55e"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-value-large">{creatorData.score}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="quick-stats-row">
            <div className="quick-stat">
              <div className="stat-icon-wrap purple"><i className="fa-solid fa-users"></i></div>
              <div className="stat-info">
                <span className="stat-number">{creatorData.followers}</span>
                <span className="stat-name">Followers</span>
              </div>
              <span className="stat-trend positive">{creatorData.growthRate}</span>
            </div>
            <div className="quick-stat">
              <div className="stat-icon-wrap blue"><i className="fa-solid fa-heart"></i></div>
              <div className="stat-info">
                <span className="stat-number">{creatorData.avgLikes}</span>
                <span className="stat-name">Avg Likes</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="stat-icon-wrap green"><i className="fa-solid fa-comment"></i></div>
              <div className="stat-info">
                <span className="stat-number">{creatorData.avgComments}</span>
                <span className="stat-name">Avg Comments</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="stat-icon-wrap orange"><i className="fa-solid fa-share"></i></div>
              <div className="stat-info">
                <span className="stat-number">{creatorData.avgShares}</span>
                <span className="stat-name">Avg Shares</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="stat-icon-wrap pink"><i className="fa-solid fa-eye"></i></div>
              <div className="stat-info">
                <span className="stat-number">{creatorData.avgViews}</span>
                <span className="stat-name">Avg Views</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="stat-icon-wrap teal"><i className="fa-solid fa-bolt"></i></div>
              <div className="stat-info">
                <span className="stat-number">{creatorData.engagement}</span>
                <span className="stat-name">Engagement</span>
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className={`recommendation-banner ${creatorData.recommendation}`}>
            <div className="rec-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="rec-content">
              <h3>🎯 Perfect Match for Your Brand</h3>
              <p>This creator aligns exceptionally well with your brand values, target audience, and campaign objectives. vibeAI™ analysis indicates high probability of successful partnership.</p>
            </div>
            <div className="rec-actions">
              <AIButton 
                type="outreach-email" 
                data={{ 
                  creatorName: creatorData.name, 
                  niche: creatorData.niche, 
                  brandName: 'Your Brand', 
                  campaignGoal: 'Brand awareness campaign' 
                }}
                label="Draft Outreach"
                icon="fa-envelope"
              />
              <AIButton 
                type="rate-negotiation" 
                data={{ 
                  followers: creatorData.followers, 
                  engagement: creatorData.engagement, 
                  deliverables: '2 posts, 4 stories, 1 reel' 
                }}
                label="Suggest Rate"
                icon="fa-calculator"
              />
              <button className="btn btn-primary" onClick={() => setShowPipelineModal(true)}>
                <i className="fa-solid fa-diagram-project"></i> Add to Pipeline
              </button>
            </div>
          </div>

          {/* Analysis Tabs */}
          <div className="analysis-tabs">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <i className="fa-solid fa-chart-pie"></i> Overview
            </button>
            <button className={`tab-btn ${activeTab === 'engagement' ? 'active' : ''}`} onClick={() => setActiveTab('engagement')}>
              <i className="fa-solid fa-comments"></i> Engagement
            </button>
            <button className={`tab-btn ${activeTab === 'authenticity' ? 'active' : ''}`} onClick={() => setActiveTab('authenticity')}>
              <i className="fa-solid fa-fingerprint"></i> Authenticity
            </button>
            <button className={`tab-btn ${activeTab === 'alignment' ? 'active' : ''}`} onClick={() => setActiveTab('alignment')}>
              <i className="fa-solid fa-bullseye"></i> Brand Alignment
            </button>
            <button className={`tab-btn ${activeTab === 'prediction' ? 'active' : ''}`} onClick={() => setActiveTab('prediction')}>
              <i className="fa-solid fa-wand-magic"></i> Future Prediction
            </button>
            <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
              <i className="fa-solid fa-images"></i> Content Analysis
            </button>
          </div>

          {/* Tab Content */}
          <div className="analysis-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Rising Star Section */}
                {risingStarData.isRisingStar && (
                  <div className="rising-star-section">
                    <div className="section-header-fancy">
                      <div className="header-left">
                        <i className="fa-solid fa-rocket"></i>
                        <h2>Rising Star Alert</h2>
                      </div>
                      <div className="star-score">
                        <span className="score">{risingStarData.starScore}</span>
                        <span className="label">Star Score</span>
                      </div>
                    </div>
                    <div className="rising-star-content">
                      <div className="star-indicators">
                        {risingStarData.indicators.map((indicator, idx) => (
                          <div key={idx} className="star-indicator">
                            <div className="indicator-check">
                              <i className="fa-solid fa-check"></i>
                            </div>
                            <div className="indicator-info">
                              <span className="indicator-label">{indicator.label}</span>
                              <span className="indicator-detail">{indicator.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="star-projection">
                        <div className="projection-card">
                          <i className="fa-solid fa-chart-line"></i>
                          <div>
                            <span className="projection-label">Projected Reach</span>
                            <span className="projection-value">{risingStarData.projectedReach}</span>
                          </div>
                        </div>
                        <div className="recommendation-action">
                          <i className="fa-solid fa-lightbulb"></i>
                          <p>{risingStarData.recommendedAction}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Core Metrics Grid */}
                <div className="metrics-section">
                  <div className="section-header-fancy">
                    <div className="header-left">
                      <i className="fa-solid fa-chart-simple"></i>
                      <h2>Core Performance Metrics</h2>
                    </div>
                  </div>
                  <div className="metrics-grid-6">
                    {coreMetrics.map((metric, idx) => (
                      <div key={idx} className="metric-card-visual">
                        <div className="metric-icon-circle">
                          <i className={`fa-solid ${metric.icon}`}></i>
                        </div>
                        <div className="metric-score-ring">
                          <svg viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="6"/>
                            <circle 
                              cx="40" cy="40" r="36" fill="none" 
                              stroke={metric.value >= 90 ? '#22c55e' : metric.value >= 70 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${(metric.value / 100) * 226.2} 226.2`}
                              transform="rotate(-90 40 40)"
                            />
                          </svg>
                          <span className="ring-value">{metric.value}%</span>
                        </div>
                        <h4 className="metric-label">{metric.label}</h4>
                        <p className="metric-desc">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Concerns */}
                <div className="report-grid">
                  <div className="analysis-card strengths-card">
                    <div className="card-header green">
                      <i className="fa-solid fa-thumbs-up"></i>
                      <h3>Key Strengths</h3>
                      <span className="count-badge">{strengths.length}</span>
                    </div>
                    <div className="card-body">
                      {strengths.map((item, index) => (
                        <div key={index} className="strength-item">
                          <div className="item-icon success">
                            <i className="fa-solid fa-check"></i>
                          </div>
                          <div className="item-content">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="analysis-card concerns-card">
                    <div className="card-header orange">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      <h3>Areas of Concern</h3>
                      <span className="count-badge">{concerns.length}</span>
                    </div>
                    <div className="card-body">
                      {concerns.length > 0 ? concerns.map((item, index) => (
                        <div key={index} className="concern-item">
                          <div className={`item-icon ${item.severity}`}>
                            <i className="fa-solid fa-exclamation"></i>
                          </div>
                          <div className="item-content">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                            <span className={`severity-badge ${item.severity}`}>{item.severity} risk</span>
                          </div>
                        </div>
                      )) : (
                        <div className="no-concerns">
                          <i className="fa-solid fa-shield-halved"></i>
                          <p>No significant concerns detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Engagement Tab */}
            {activeTab === 'engagement' && (
              <div className="engagement-analysis">
                <div className="section-header-fancy">
                  <div className="header-left">
                    <i className="fa-solid fa-comments"></i>
                    <h2>Engagement Deep Dive</h2>
                  </div>
                </div>
                
                <div className="engagement-grid">
                  <div className="engagement-breakdown-card">
                    <h3>Engagement Breakdown</h3>
                    <div className="engagement-bars">
                      <div className="eng-bar-row">
                        <div className="eng-label">
                          <i className="fa-solid fa-heart"></i> Likes
                        </div>
                        <div className="eng-bar-wrap">
                          <div className="eng-bar" style={{width: `${engagementData.likes.percentage}%`}}></div>
                        </div>
                        <div className="eng-stats">
                          <span className="eng-value">{(engagementData.likes.value / 1000).toFixed(1)}K</span>
                          <span className="eng-trend positive">{engagementData.likes.trend}</span>
                        </div>
                      </div>
                      <div className="eng-bar-row">
                        <div className="eng-label">
                          <i className="fa-solid fa-comment"></i> Comments
                        </div>
                        <div className="eng-bar-wrap">
                          <div className="eng-bar comments" style={{width: `${engagementData.comments.percentage}%`}}></div>
                        </div>
                        <div className="eng-stats">
                          <span className="eng-value">{engagementData.comments.value}</span>
                          <span className="eng-trend positive">{engagementData.comments.trend}</span>
                        </div>
                      </div>
                      <div className="eng-bar-row">
                        <div className="eng-label">
                          <i className="fa-solid fa-share"></i> Shares
                        </div>
                        <div className="eng-bar-wrap">
                          <div className="eng-bar shares" style={{width: `${engagementData.shares.percentage}%`}}></div>
                        </div>
                        <div className="eng-stats">
                          <span className="eng-value">{engagementData.shares.value}</span>
                          <span className="eng-trend positive">{engagementData.shares.trend}</span>
                        </div>
                      </div>
                      <div className="eng-bar-row">
                        <div className="eng-label">
                          <i className="fa-solid fa-bookmark"></i> Saves
                        </div>
                        <div className="eng-bar-wrap">
                          <div className="eng-bar saves" style={{width: `${engagementData.saves.percentage}%`}}></div>
                        </div>
                        <div className="eng-stats">
                          <span className="eng-value">{engagementData.saves.value}</span>
                          <span className="eng-trend positive">{engagementData.saves.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="recent-posts-card">
                    <h3>Recent Post Performance</h3>
                    <div className="posts-list">
                      {recentPosts.map((post) => (
                        <div key={post.id} className="post-item">
                          <div className="post-thumb">{post.thumbnail}</div>
                          <div className="post-type">{post.type}</div>
                          <div className="post-metrics">
                            <span><i className="fa-solid fa-heart"></i> {(post.likes/1000).toFixed(1)}K</span>
                            <span><i className="fa-solid fa-comment"></i> {post.comments}</span>
                            <span><i className="fa-solid fa-share"></i> {post.shares}</span>
                            <span><i className="fa-solid fa-eye"></i> {(post.views/1000).toFixed(0)}K</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Authenticity Tab */}
            {activeTab === 'authenticity' && (
              <div className="authenticity-analysis">
                <div className="section-header-fancy">
                  <div className="header-left">
                    <i className="fa-solid fa-fingerprint"></i>
                    <h2>Authenticity Verification</h2>
                  </div>
                  <div className="authenticity-score-badge">
                    <span className="score">{authenticityData.score}%</span>
                    <span className="label">Verified Authentic</span>
                  </div>
                </div>

                <div className="authenticity-grid">
                  <div className="auth-metrics-card">
                    <div className="auth-metric">
                      <div className="auth-metric-circle green">
                        <span>{authenticityData.realFollowers}%</span>
                      </div>
                      <div className="auth-metric-info">
                        <h4>Real Followers</h4>
                        <p>Genuine, active accounts</p>
                      </div>
                    </div>
                    <div className="auth-metric">
                      <div className="auth-metric-circle green">
                        <span>{authenticityData.engagementQuality}%</span>
                      </div>
                      <div className="auth-metric-info">
                        <h4>Engagement Quality</h4>
                        <p>Meaningful interactions</p>
                      </div>
                    </div>
                    <div className="auth-metric">
                      <div className="auth-metric-circle yellow">
                        <span>{authenticityData.suspiciousActivity}%</span>
                      </div>
                      <div className="auth-metric-info">
                        <h4>Suspicious Activity</h4>
                        <p>Potential bot/fake activity</p>
                      </div>
                    </div>
                  </div>

                  <div className="auth-checks-card">
                    <h3>Verification Checks</h3>
                    <div className="checks-list">
                      {authenticityData.checks.map((check, idx) => (
                        <div key={idx} className="check-item">
                          <div className={`check-status ${check.status}`}>
                            <i className={`fa-solid fa-${check.status === 'pass' ? 'check' : 'xmark'}`}></i>
                          </div>
                          <div className="check-info">
                            <h4>{check.check}</h4>
                            <p>{check.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Brand Alignment Tab */}
            {activeTab === 'alignment' && (
              <div className="alignment-analysis">
                <div className="section-header-fancy">
                  <div className="header-left">
                    <i className="fa-solid fa-bullseye"></i>
                    <h2>Brand Alignment Analysis</h2>
                  </div>
                  <div className="alignment-score-badge">
                    <span className="score">{brandAlignment.overallScore}%</span>
                    <span className="label">Overall Alignment</span>
                  </div>
                </div>

                <div className="alignment-grid">
                  <div className="alignment-card">
                    <div className="align-header">
                      <i className="fa-solid fa-eye"></i>
                      <h3>Vision Alignment</h3>
                    </div>
                    <div className="align-score">{brandAlignment.vision.score}%</div>
                    <div className="align-bar">
                      <div className="align-fill" style={{width: `${brandAlignment.vision.score}%`}}></div>
                    </div>
                    <p>{brandAlignment.vision.description}</p>
                  </div>

                  <div className="alignment-card">
                    <div className="align-header">
                      <i className="fa-solid fa-flag"></i>
                      <h3>Mission Alignment</h3>
                    </div>
                    <div className="align-score">{brandAlignment.mission.score}%</div>
                    <div className="align-bar">
                      <div className="align-fill" style={{width: `${brandAlignment.mission.score}%`}}></div>
                    </div>
                    <p>{brandAlignment.mission.description}</p>
                  </div>

                  <div className="alignment-card">
                    <div className="align-header">
                      <i className="fa-solid fa-heart"></i>
                      <h3>Values Alignment</h3>
                    </div>
                    <div className="align-score">{brandAlignment.values.score}%</div>
                    <div className="align-bar">
                      <div className="align-fill" style={{width: `${brandAlignment.values.score}%`}}></div>
                    </div>
                    <p>{brandAlignment.values.description}</p>
                  </div>

                  <div className="alignment-card">
                    <div className="align-header">
                      <i className="fa-solid fa-users"></i>
                      <h3>Audience Match</h3>
                    </div>
                    <div className="align-score">{brandAlignment.audience.score}%</div>
                    <div className="align-bar">
                      <div className="align-fill" style={{width: `${brandAlignment.audience.score}%`}}></div>
                    </div>
                    <p>{brandAlignment.audience.description}</p>
                  </div>

                  <div className="alignment-card">
                    <div className="align-header">
                      <i className="fa-solid fa-microphone"></i>
                      <h3>Tone & Voice</h3>
                    </div>
                    <div className="align-score">{brandAlignment.tone.score}%</div>
                    <div className="align-bar">
                      <div className="align-fill" style={{width: `${brandAlignment.tone.score}%`}}></div>
                    </div>
                    <p>{brandAlignment.tone.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Future Prediction Tab */}
            {activeTab === 'prediction' && (
              <div className="prediction-analysis">
                <div className="section-header-fancy">
                  <div className="header-left">
                    <i className="fa-solid fa-wand-magic"></i>
                    <h2>Future Impact Prediction</h2>
                  </div>
                  <div className={`prediction-badge ${futurePrediction.overall}`}>
                    <i className={`fa-solid fa-arrow-trend-${futurePrediction.overall === 'positive' ? 'up' : 'down'}`}></i>
                    <span>{futurePrediction.overall === 'positive' ? 'Positive Outlook' : 'Caution Advised'}</span>
                  </div>
                </div>

                <div className="prediction-hero">
                  <div className="confidence-meter">
                    <div className="meter-circle">
                      <svg viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                        <circle 
                          cx="60" cy="60" r="54" fill="none" 
                          stroke="#22c55e"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${(futurePrediction.confidence / 100) * 339.3} 339.3`}
                          transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="meter-value">
                        <span className="number">{futurePrediction.confidence}%</span>
                        <span className="label">Confidence</span>
                      </div>
                    </div>
                  </div>
                  <div className="prediction-summary">
                    <h3>AI Prediction Summary</h3>
                    <p>{futurePrediction.prediction}</p>
                  </div>
                </div>

                <div className="prediction-factors">
                  <h3>Impact Factors Analysis</h3>
                  <div className="factors-list">
                    {futurePrediction.factors.map((factor, idx) => (
                      <div key={idx} className={`factor-card ${factor.impact}`}>
                        <div className="factor-header">
                          <span className="factor-name">{factor.factor}</span>
                          <span className={`impact-badge ${factor.impact}`}>
                            <i className={`fa-solid fa-arrow-${factor.impact === 'positive' ? 'up' : factor.impact === 'negative' ? 'down' : 'right'}`}></i>
                            {factor.impact}
                          </span>
                        </div>
                        <div className="factor-score-bar">
                          <div className="factor-fill" style={{width: `${factor.score}%`}}></div>
                          <span className="factor-score">{factor.score}%</span>
                        </div>
                        <p className="factor-desc">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Analysis Tab */}
            {activeTab === 'content' && (
              <div className="content-analysis">
                <div className="section-header-fancy">
                  <div className="header-left">
                    <i className="fa-solid fa-images"></i>
                    <h2>Content Analysis</h2>
                  </div>
                </div>

                <div className="content-grid">
                  <div className="content-stats-card">
                    <h3>Content Overview</h3>
                    <div className="content-stat-items">
                      <div className="content-stat">
                        <span className="cs-value">{contentAnalysis.totalPosts.toLocaleString()}</span>
                        <span className="cs-label">Total Posts</span>
                      </div>
                      <div className="content-stat">
                        <span className="cs-value">{contentAnalysis.avgPostsPerWeek}</span>
                        <span className="cs-label">Posts/Week</span>
                      </div>
                      <div className="content-stat">
                        <span className="cs-value">{contentAnalysis.topPerformingType}</span>
                        <span className="cs-label">Top Format</span>
                      </div>
                    </div>
                    
                    <h4>Content Type Distribution</h4>
                    <div className="content-types">
                      {contentAnalysis.contentTypes.map((type, idx) => (
                        <div key={idx} className="content-type-bar">
                          <div className="ct-label">{type.type}</div>
                          <div className="ct-bar-wrap">
                            <div className="ct-bar" style={{width: `${type.percentage}%`}}></div>
                          </div>
                          <div className="ct-stats">
                            <span>{type.count}</span>
                            <span className="ct-pct">{type.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="content-insights-card">
                    <h3>Content Insights</h3>
                    <div className="insight-item">
                      <i className="fa-solid fa-clock"></i>
                      <div>
                        <h4>Optimal Posting Time</h4>
                        <p>{contentAnalysis.postingSchedule}</p>
                      </div>
                    </div>
                    <div className="insight-item">
                      <i className="fa-solid fa-hashtag"></i>
                      <div>
                        <h4>Top Hashtags</h4>
                        <div className="hashtag-cloud">
                          {contentAnalysis.topHashtags.map((tag, idx) => (
                            <span key={idx} className="hashtag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="media-preview-card">
                    <h3>
                      <i className="fa-solid fa-photo-film"></i>
                      Image & Video Analysis
                      <span className="coming-soon-badge">Coming Soon</span>
                    </h3>
                    <div className="coming-soon-content">
                      <div className="coming-soon-icon">
                        <i className="fa-solid fa-wand-magic"></i>
                      </div>
                      <p>Advanced AI-powered visual content analysis including:</p>
                      <ul>
                        <li><i className="fa-solid fa-check"></i> Image quality & composition scoring</li>
                        <li><i className="fa-solid fa-check"></i> Brand visual consistency analysis</li>
                        <li><i className="fa-solid fa-check"></i> Video engagement pattern detection</li>
                        <li><i className="fa-solid fa-check"></i> Content theme classification</li>
                        <li><i className="fa-solid fa-check"></i> Competitor content comparison</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-fixed">
            <Link href="/creators" className="btn btn-secondary">
              <i className="fa-solid fa-arrow-left"></i>
              Back to Results
            </Link>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                exportCreatorReport({
                  name: creatorData.name,
                  handle: creatorData.handle,
                  platform: creatorData.platform,
                  followers: creatorData.followers,
                  engagement: creatorData.engagement,
                  trustScore: creatorData.score,
                  categories: [creatorData.niche],
                  metrics: {
                    avgLikes: creatorData.avgLikes,
                    avgComments: creatorData.avgComments,
                    postsPerWeek: contentAnalysis.avgPostsPerWeek,
                    growthRate: creatorData.growthRate,
                  }
                });
              }}
            >
              <i className="fa-solid fa-download"></i>
              Export Report
            </button>
            <button className="btn btn-secondary">
              <i className="fa-solid fa-share-nodes"></i>
              Share Report
            </button>
            <button className="btn btn-primary" onClick={() => setShowPipelineModal(true)}>
              <i className="fa-solid fa-diagram-project"></i>
              Add to Pipeline
            </button>
          </div>
        </div>

        {/* Add to Pipeline Modal */}
        <AddToPipelineModal
          isOpen={showPipelineModal}
          onClose={() => setShowPipelineModal(false)}
          creator={{
            creatorId: params.id as string,
            creatorName: creatorData.name,
            creatorHandle: creatorData.handle,
            platform: creatorData.platform,
            followers: creatorData.followers,
            engagementRate: parseFloat(creatorData.engagement.replace('%', ''))
          }}
        />
      </div>
    </div>
  );
}
