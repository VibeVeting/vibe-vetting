"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

// Creator Data - Enhanced
const creatorData = {
  name: 'Jessica Davis',
  handle: '@jessicad',
  username: 'jessicad',
  platform: 'Instagram',
  followers: '245.3K',
  following: '892',
  posts: '1,247',
  engagement: '4.2%',
  avgViews: '45.2K',
  avgLikes: '12.4K',
  avgComments: '847',
  avgShares: '234',
  score: 96,
  recommendation: 'perfect',
  isRisingStar: true,
  growthRate: '+23%',
  joinedDate: 'March 2019',
  niche: 'Lifestyle & Fashion',
  location: 'Los Angeles, CA',
  bio: 'Fashion enthusiast | Lifestyle blogger | Sharing my journey through style, travel & wellness ✨',
};

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

// Core Metrics - 6 categories
const coreMetrics = [
  { label: 'Audience Authenticity', value: 94, description: 'Real followers vs bots/fake accounts', icon: 'fa-users-viewfinder' },
  { label: 'Content Quality', value: 92, description: 'Visual & editorial excellence', icon: 'fa-star' },
  { label: 'Brand Safety', value: 98, description: 'Content appropriateness score', icon: 'fa-shield-halved' },
  { label: 'Engagement Rate', value: 88, description: 'Active audience participation', icon: 'fa-comments' },
  { label: 'Professionalism', value: 95, description: 'Consistency & reliability', icon: 'fa-briefcase' },
  { label: 'Growth Trajectory', value: 91, description: 'Account growth momentum', icon: 'fa-arrow-trend-up' },
];

// Engagement Breakdown
const engagementData = {
  likes: { value: 12400, percentage: 68, trend: '+12%' },
  comments: { value: 847, percentage: 18, trend: '+8%' },
  shares: { value: 234, percentage: 8, trend: '+15%' },
  saves: { value: 412, percentage: 6, trend: '+22%' },
};

// Content Analysis
const contentAnalysis = {
  totalPosts: 1247,
  avgPostsPerWeek: 4.2,
  topPerformingType: 'Reels',
  contentTypes: [
    { type: 'Photos', count: 623, percentage: 50 },
    { type: 'Reels/Videos', count: 436, percentage: 35 },
    { type: 'Carousels', count: 188, percentage: 15 },
  ],
  topHashtags: ['#fashion', '#lifestyle', '#ootd', '#styleinspo', '#wellness'],
  postingSchedule: 'Most active: Tue-Thu, 10AM-2PM PST',
};

// Brand Alignment Scores
const brandAlignment = {
  overallScore: 94,
  vision: { score: 96, description: 'Strong alignment with forward-thinking, innovative brand vision' },
  mission: { score: 92, description: 'Content naturally supports brand mission of authenticity' },
  values: { score: 95, description: 'Shared values in sustainability, quality, and community' },
  audience: { score: 93, description: 'Target demographic overlap: 87% match' },
  tone: { score: 91, description: 'Communication style aligns with brand voice' },
};

// Future Prediction Data
const futurePrediction = {
  overall: 'positive',
  confidence: 89,
  prediction: 'High likelihood of continued growth and positive brand association',
  factors: [
    { factor: 'Audience Growth', impact: 'positive', score: 92, description: 'Projected to reach 500K followers in 12 months' },
    { factor: 'Content Consistency', impact: 'positive', score: 88, description: 'Maintains regular posting schedule with quality' },
    { factor: 'Brand Partnerships', impact: 'neutral', score: 75, description: 'Has worked with competitors, but maintains professionalism' },
    { factor: 'Community Sentiment', impact: 'positive', score: 94, description: 'Overwhelmingly positive audience interactions' },
    { factor: 'Trend Alignment', impact: 'positive', score: 90, description: 'Early adopter of emerging content trends' },
  ],
};

// Rising Star Indicators
const risingStarData = {
  isRisingStar: true,
  starScore: 87,
  indicators: [
    { label: 'Rapid Growth', value: true, detail: '+23% followers in last 30 days' },
    { label: 'High Engagement', value: true, detail: '4.2% vs 1.5% industry average' },
    { label: 'Viral Content', value: true, detail: '3 posts with 100K+ views this month' },
    { label: 'Community Building', value: true, detail: 'Strong audience loyalty metrics' },
    { label: 'Untapped Potential', value: true, detail: 'Undervalued for current reach' },
  ],
  projectedReach: '500K-750K in 12 months',
  recommendedAction: 'Partner early for optimal ROI before market rates increase',
};

// Authenticity Analysis
const authenticityData = {
  score: 94,
  realFollowers: 94,
  suspiciousActivity: 2,
  engagementQuality: 96,
  audienceGrowth: 'organic',
  checks: [
    { check: 'Follower/Following Ratio', status: 'pass', detail: 'Healthy ratio of 275:1' },
    { check: 'Engagement Pattern', status: 'pass', detail: 'Natural engagement distribution' },
    { check: 'Comment Quality', status: 'pass', detail: '92% genuine, meaningful comments' },
    { check: 'Growth Pattern', status: 'pass', detail: 'Organic growth, no suspicious spikes' },
    { check: 'Bot Detection', status: 'pass', detail: 'Only 2% potential bot followers' },
    { check: 'Audience Location', status: 'pass', detail: 'Geographic distribution matches niche' },
  ],
};

// Recent Posts
const recentPosts = [
  { id: 1, type: 'reel', thumbnail: '🎬', likes: 24500, comments: 1230, shares: 456, views: 128000 },
  { id: 2, type: 'photo', thumbnail: '📸', likes: 15200, comments: 892, shares: 234, views: 45000 },
  { id: 3, type: 'carousel', thumbnail: '🖼️', likes: 18700, comments: 1045, shares: 312, views: 67000 },
  { id: 4, type: 'reel', thumbnail: '🎬', likes: 31200, comments: 1567, shares: 623, views: 185000 },
];

// Strengths
const strengths = [
  { title: 'Exceptional Engagement', description: 'Consistently outperforms industry benchmarks by 3x' },
  { title: 'Authentic Voice', description: 'Genuine connection with audience, no scripted content feel' },
  { title: 'High-Quality Production', description: 'Professional photography and editing standards' },
  { title: 'Responsive Community', description: 'Replies to 78% of comments within 24 hours' },
  { title: 'Trend Awareness', description: 'Early adopter of platform features and trends' },
];

// Concerns
const concerns = [
  { title: 'Competitor Mentions', description: 'Previously worked with 2 competing brands', severity: 'low' },
];

export default function CreatorProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');

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
              <button className="btn btn-primary">
                <i className="fa-solid fa-plus"></i> Add to Campaign
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
              <i className="fa-solid fa-wand-magic-sparkles"></i> Future Prediction
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
                          <i className="fa-solid fa-shield-check"></i>
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
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
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
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
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
            <button className="btn btn-secondary">
              <i className="fa-solid fa-download"></i>
              Export Report
            </button>
            <button className="btn btn-secondary">
              <i className="fa-solid fa-share-nodes"></i>
              Share Report
            </button>
            <button className="btn btn-primary">
              <i className="fa-solid fa-plus"></i>
              Add to Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
