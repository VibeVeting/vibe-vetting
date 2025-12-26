"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface Creator {
  bio: string;
  category: string | null;
  city: string | null;
  connector: string;
  country: string;
  engagement: number;
  followers: number;
  handle: string;
  handle_link: string;
  posts: number;
}

interface ApiResponse {
  creators: Creator[];
  creators_total: number;
  current_page: number;
  page_maximum: number;
  page_minimum: number;
  error?: string;
}

interface Filters {
  handle_contains: string;
  followers_minimum: string;
  followers_maximum: string;
  engagement_rate_minimum: string;
  engagement_rate_maximum: string;
  category: string;
  city: string;
  country: string;
  bio_contains: string;
  posts_minimum: string;
  posts_maximum: string;
}

const categories = [
  'All Categories',
  'Health & Fitness',
  'Travel & Adventure',
  'Books & Writing',
  'Family & Relationships',
  'Art & Design',
  'Technology',
  'Food & Cooking',
  'Fashion & Beauty',
  'Gaming',
  'Music',
  'Sports',
  'Education',
  'Business',
  'Entertainment',
];

const countries = [
  'All Countries',
  'India',
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Brazil',
  'Indonesia',
  'Japan',
];

export default function DiscoverCreatorsPage() {
  const { logout } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCreators, setTotalCreators] = useState(0);
  const [maxPage, setMaxPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    handle_contains: '',
    followers_minimum: '1000',
    followers_maximum: '50000',
    engagement_rate_minimum: '0',
    engagement_rate_maximum: '100',
    category: '',
    city: '',
    country: '',
    bio_contains: '',
    posts_minimum: '1',
    posts_maximum: '10000',
  });

  const fetchCreators = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('current_page', page.toString());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'All Categories' && value !== 'All Countries') {
          queryParams.set(key, value);
        }
      });

      const response = await fetch(`/api/creators/discover?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch creators');
      }

      const data: ApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setCreators(data.creators || []);
      setTotalCreators(data.creators_total || 0);
      setCurrentPage(data.current_page || 1);
      setMaxPage(data.page_maximum || 1);
    } catch (err) {
      setError('Failed to fetch creators. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCreators(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= maxPage) {
      setCurrentPage(newPage);
      fetchCreators(newPage);
    }
  };

  const formatFollowers = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementColor = (engagement: number): string => {
    if (engagement >= 5) return 'engagement-high';
    if (engagement >= 2) return 'engagement-medium';
    return 'engagement-low';
  };

  const getPlatformIcon = (connector: string): string => {
    switch (connector.toLowerCase()) {
      case 'youtube': return '📺';
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'twitter': return '🐦';
      default: return '🌐';
    }
  };

  return (
    <div className="discover-page">
      {/* Navigation */}
      <nav className="discover-nav">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <span className="logo-vibe">VIBE</span>
            <span className="logo-vetting">VETTING</span>
            <span className="beta-badge">BETA</span>
          </Link>
          <div className="nav-actions">
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/campaigns" className="nav-link">Campaigns</Link>
            <button onClick={logout} className="nav-link logout-btn">
              <i className="fa-solid fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="discover-container">
        {/* Header */}
        <div className="discover-header">
          <div className="header-content">
            <div className="header-badge">
              <span className="pulse-dot"></span>
              vibeAI™ BETA DISCOVERY
            </div>
            <h1 className="discover-title">
              <span className="gradient-mint">Discover</span>
              <span className="gradient-purple">Rising Creators</span>
            </h1>
            <p className="discover-subtitle">
              Find micro-creators (1K-50K) with high engagement and growth potential using our AI-powered discovery engine
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-header">
            <h3 className="filters-title">
              <span className="filter-icon">🔍</span>
              Search Filters
            </h3>
            <button 
              className="toggle-filters-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'} 
              <span className="arrow">{showFilters ? '▲' : '▼'}</span>
            </button>
          </div>

          {showFilters && (
            <div className="filters-grid">
              <div className="filter-group">
                <label>Handle Contains</label>
                <input
                  type="text"
                  placeholder="Search by handle..."
                  value={filters.handle_contains}
                  onChange={(e) => handleFilterChange('handle_contains', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Bio Contains</label>
                <input
                  type="text"
                  placeholder="Keywords in bio..."
                  value={filters.bio_contains}
                  onChange={(e) => handleFilterChange('bio_contains', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                >
                  {countries.map(c => (
                    <option key={c} value={c === 'All Countries' ? '' : c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>City</label>
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Followers Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.followers_minimum}
                    onChange={(e) => handleFilterChange('followers_minimum', e.target.value)}
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.followers_maximum}
                    onChange={(e) => handleFilterChange('followers_maximum', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Engagement Rate (%)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={filters.engagement_rate_minimum}
                    onChange={(e) => handleFilterChange('engagement_rate_minimum', e.target.value)}
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={filters.engagement_rate_maximum}
                    onChange={(e) => handleFilterChange('engagement_rate_maximum', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Posts Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.posts_minimum}
                    onChange={(e) => handleFilterChange('posts_minimum', e.target.value)}
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.posts_maximum}
                    onChange={(e) => handleFilterChange('posts_maximum', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="search-actions">
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Searching...
                </>
              ) : (
                <>
                  <span className="search-icon">🔍</span>
                  Discover Creators
                </>
              )}
            </button>
            <button 
              className="reset-btn"
              onClick={() => {
                setFilters({
                  handle_contains: '',
                  followers_minimum: '1000',
                  followers_maximum: '50000',
                  engagement_rate_minimum: '0',
                  engagement_rate_maximum: '100',
                  category: '',
                  city: '',
                  country: '',
                  bio_contains: '',
                  posts_minimum: '1',
                  posts_maximum: '10000',
                });
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
              <button onClick={() => fetchCreators(currentPage)} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && creators.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Start Your Discovery</h3>
              <p>Use the filters above and click "Discover Creators" to find your perfect creator matches</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>vibeAI™ is finding creators for you...</p>
            </div>
          )}

          {!loading && creators.length > 0 && (
            <>
              <div className="results-header">
                <div className="results-count">
                  <span className="count-number">{totalCreators.toLocaleString()}</span>
                  <span className="count-label">Creators Found</span>
                </div>
                <div className="pagination-info">
                  Page {currentPage} of {maxPage.toLocaleString()}
                </div>
              </div>

              <div className="creators-grid">
                {creators.map((creator, index) => (
                  <div key={`${creator.handle}-${index}`} className="creator-card">
                    <div className="card-header">
                      <div className="platform-badge">
                        <span className="platform-icon">{getPlatformIcon(creator.connector)}</span>
                        <span className="platform-name">{creator.connector}</span>
                      </div>
                      {creator.category && (
                        <span className="category-tag">{creator.category}</span>
                      )}
                    </div>

                    <div className="creator-profile">
                      <div className="creator-avatar">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.handle)}&backgroundColor=0c0c14`}
                          alt={creator.handle}
                          className="avatar-img"
                        />
                        <div className="avatar-ring"></div>
                      </div>
                      <div className="creator-info">
                        <h3 className="creator-handle">@{creator.handle}</h3>
                        <div className="creator-location">
                          📍 {creator.city && <span>{creator.city}, </span>}
                          {creator.country && <span>{creator.country}</span>}
                          {!creator.city && !creator.country && <span>Location N/A</span>}
                        </div>
                      </div>
                    </div>

                    <p className="creator-bio">
                      {creator.bio ? (
                        creator.bio.length > 150 ? `${creator.bio.substring(0, 150)}...` : creator.bio
                      ) : (
                        <span className="no-bio">No bio available</span>
                      )}
                    </p>

                    <div className="creator-stats">
                      <div className="stat">
                        <span className="stat-value">{formatFollowers(creator.followers)}</span>
                        <span className="stat-label">Followers</span>
                      </div>
                      <div className="stat">
                        <span className={`stat-value ${getEngagementColor(creator.engagement)}`}>
                          {creator.engagement.toFixed(2)}%
                        </span>
                        <span className="stat-label">Engagement</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{creator.posts.toLocaleString()}</span>
                        <span className="stat-label">Posts</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <a 
                        href={creator.handle_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-profile-btn"
                      >
                        View Profile
                        <span className="arrow-icon">→</span>
                      </a>
                      <button className="add-campaign-btn">
                        + Add to Campaign
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  ← Previous
                </button>
                
                <div className="page-numbers">
                  {currentPage > 2 && (
                    <button className="page-num" onClick={() => handlePageChange(1)}>1</button>
                  )}
                  {currentPage > 3 && <span className="page-dots">...</span>}
                  
                  {currentPage > 1 && (
                    <button className="page-num" onClick={() => handlePageChange(currentPage - 1)}>
                      {currentPage - 1}
                    </button>
                  )}
                  
                  <button className="page-num active">{currentPage}</button>
                  
                  {currentPage < maxPage && (
                    <button className="page-num" onClick={() => handlePageChange(currentPage + 1)}>
                      {currentPage + 1}
                    </button>
                  )}
                  
                  {currentPage < maxPage - 2 && <span className="page-dots">...</span>}
                  {currentPage < maxPage - 1 && (
                    <button className="page-num" onClick={() => handlePageChange(maxPage)}>
                      {maxPage}
                    </button>
                  )}
                </div>

                <button 
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= maxPage}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
