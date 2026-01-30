"use client";

import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { AIButton } from '@/components/common/AIButton';

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

// Empty default - creators will be fetched from API or discovered
const defaultCreators: Creator[] = [];

export default function DiscoverCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>(defaultCreators);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);
  
  const [filters, setFilters] = useState<Filters>({
    handle_contains: '',
    followers_minimum: '',
    followers_maximum: '',
    engagement_rate_minimum: '',
    engagement_rate_maximum: '',
    category: '',
    city: '',
    country: '',
    bio_contains: '',
  });

  const filteredCreators = useMemo(() => {
    return creators.filter(c => {
      if (filters.country && filters.country !== 'All Countries' && c.country !== filters.country) return false;
      if (filters.category && filters.category !== 'All Categories' && c.category !== filters.category) return false;
      if (filters.city && c.city && !c.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.handle_contains && !c.handle.toLowerCase().includes(filters.handle_contains.toLowerCase())) return false;
      if (filters.bio_contains && c.bio && !c.bio.toLowerCase().includes(filters.bio_contains.toLowerCase())) return false;
      const minFollowers = parseInt(filters.followers_minimum) || 0;
      const maxFollowers = parseInt(filters.followers_maximum) || Infinity;
      if (c.followers < minFollowers || c.followers > maxFollowers) return false;
      const minEngagement = parseFloat(filters.engagement_rate_minimum) || 0;
      const maxEngagement = parseFloat(filters.engagement_rate_maximum) || 100;
      if (c.engagement < minEngagement || c.engagement > maxEngagement) return false;
      return true;
    });
  }, [creators, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Build query params from filters
      const params = new URLSearchParams();
      if (filters.handle_contains) params.append('handle', filters.handle_contains);
      if (filters.category && filters.category !== 'All Categories') params.append('category', filters.category);
      if (filters.country && filters.country !== 'All Countries') params.append('country', filters.country);
      if (filters.followers_minimum) params.append('followersMin', filters.followers_minimum);
      if (filters.followers_maximum) params.append('followersMax', filters.followers_maximum);

      // Try to fetch from API (this would connect to a real creator discovery service)
      // For now, show empty results since we don't have a real discovery API
      // In production, this would call an external API like Phyllo, Modash, etc.
      setCreators([]);
    } catch (error) {
      console.error('Error searching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      handle_contains: '',
      followers_minimum: '',
      followers_maximum: '',
      engagement_rate_minimum: '',
      engagement_rate_maximum: '',
      category: '',
      city: '',
      country: '',
      bio_contains: '',
    });
  };

  const formatFollowers = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformIcon = (connector: string): string => {
    switch (connector.toLowerCase()) {
      case 'youtube': return 'fa-youtube';
      case 'instagram': return 'fa-instagram';
      case 'tiktok': return 'fa-tiktok';
      case 'twitter': return 'fa-twitter';
      default: return 'fa-globe';
    }
  };

  const getPlatformColor = (connector: string): string => {
    switch (connector.toLowerCase()) {
      case 'youtube': return '#FF0000';
      case 'instagram': return '#E4405F';
      case 'tiktok': return '#00f2ea';
      case 'twitter': return '#1DA1F2';
      default: return '#667eea';
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="yc-page">
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
                <div className="yc-page-icon" style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #667eea 100%)' }}>
                  <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <div>
                  <h1 className="yc-page-title">Discover Creators</h1>
                  <p className="yc-page-subtitle">Find micro-creators with high engagement using AI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="discover-filters-card">
            <div className="filters-header">
              <div className="filters-title">
                <i className="fa-solid fa-sliders"></i>
                <span>Search Filters</span>
              </div>
              <div className="filters-actions">
                <button className="toggle-btn" onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? 'Hide' : 'Show'} Filters
                  <i className={`fa-solid fa-chevron-${showFilters ? 'up' : 'down'}`}></i>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="filters-body">
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
                      <span>to</span>
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
                      <span>to</span>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Max"
                        value={filters.engagement_rate_maximum}
                        onChange={(e) => handleFilterChange('engagement_rate_maximum', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="filters-footer">
                  <button className="reset-btn" onClick={resetFilters}>
                    <i className="fa-solid fa-rotate-left"></i>
                    Reset Filters
                  </button>
                  <button className="search-btn" onClick={handleSearch} disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-search"></i>
                        Search Creators
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="results-header">
            <div className="results-count">
              <span className="count-number">{filteredCreators.length}</span>
              <span className="count-label">creators found</span>
            </div>
          </div>

          {/* Creators Grid */}
          <div className="creators-grid">
            {filteredCreators.map((creator, index) => (
              <div key={`${creator.handle}-${index}`} className="creator-card">
                <div className="creator-card-header">
                  <div className="platform-badge" style={{ background: `${getPlatformColor(creator.connector)}15`, color: getPlatformColor(creator.connector) }}>
                    <i className={`fa-brands ${getPlatformIcon(creator.connector)}`}></i>
                    <span>{creator.connector}</span>
                  </div>
                  {creator.category && (
                    <span className="category-badge">{creator.category}</span>
                  )}
                </div>

                <div className="creator-profile">
                  <div className="creator-avatar">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.handle)}&backgroundColor=667eea`}
                      alt={creator.handle}
                    />
                  </div>
                  <div className="creator-info">
                    <a 
                      href={creator.handle_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="creator-handle"
                    >
                      @{creator.handle}
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                    <div className="creator-location">
                      <i className="fa-solid fa-location-dot"></i>
                      {creator.city && <span>{creator.city}, </span>}
                      {creator.country}
                    </div>
                  </div>
                </div>

                <p className="creator-bio">
                  {creator.bio ? (
                    creator.bio.length > 100 ? `${creator.bio.substring(0, 100)}...` : creator.bio
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
                    <span className={`stat-value ${creator.engagement >= 5 ? 'high' : creator.engagement >= 3 ? 'medium' : 'low'}`}>
                      {creator.engagement.toFixed(1)}%
                    </span>
                    <span className="stat-label">Engagement</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{creator.posts.toLocaleString()}</span>
                    <span className="stat-label">Posts</span>
                  </div>
                </div>

                <div className="creator-actions">
                  <AIButton 
                    type="analyze-bio" 
                    data={{ bio: creator.bio || '' }}
                    label="Analyze"
                    icon="fa-brain"
                  />
                  <a 
                    href={creator.handle_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    <i className="fa-solid fa-eye"></i>
                    View Profile
                  </a>
                  <button className="add-btn">
                    <i className="fa-solid fa-plus"></i>
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCreators.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fa-solid fa-search"></i>
              </div>
              {!hasSearched ? (
                <>
                  <h3>Discover Creators</h3>
                  <p>Use the filters above and click &quot;Search&quot; to find creators matching your criteria</p>
                </>
              ) : (
                <>
                  <h3>No Creators Found</h3>
                  <p>No creators match your search criteria. Try adjusting your filters or connect an external creator discovery service.</p>
                  <button className="reset-btn" onClick={resetFilters}>
                    Reset Filters
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .discover-filters-card {
          background: var(--bg-card, #ffffff);
          border-radius: 20px;
          border: 1px solid var(--border-color, #e2e8f0);
          margin-bottom: 24px;
          overflow: hidden;
        }

        .filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }

        .filters-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary, #1a202c);
        }

        .filters-title i {
          color: #667eea;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-hover, #f7fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary, #4a5568);
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn:hover {
          background: var(--bg-elevated, #edf2f7);
        }

        .filters-body {
          padding: 24px;
          overflow: hidden;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
          width: 100%;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .filter-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary, #4a5568);
        }

        .filter-group input,
        .filter-group select {
          padding: 12px 16px;
          background: var(--bg-hover, #f7fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 10px;
          font-size: 14px;
          color: var(--text-primary, #1a202c);
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-group input::placeholder {
          color: var(--text-muted, #a0aec0);
        }

        .range-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .range-inputs input {
          flex: 1;
          min-width: 0;
        }

        .range-inputs span {
          color: var(--text-secondary, #718096);
          font-size: 13px;
          flex-shrink: 0;
        }

        .filters-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color, #e2e8f0);
          flex-wrap: wrap;
        }

        .reset-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--bg-hover, #f7fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary, #4a5568);
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: var(--bg-elevated, #edf2f7);
        }

        .search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .search-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .results-count {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .count-number {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary, #1a202c);
        }

        .count-label {
          font-size: 14px;
          color: var(--text-secondary, #718096);
        }

        .creators-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .creator-card {
          background: var(--bg-card, #ffffff);
          border-radius: 20px;
          border: 1px solid var(--border-color, #e2e8f0);
          padding: 24px;
          transition: all 0.3s;
        }

        .creator-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          border-color: #667eea;
        }

        .creator-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .platform-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .category-badge {
          font-size: 11px;
          font-weight: 600;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .creator-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .creator-avatar {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          overflow: hidden;
          border: 3px solid var(--border-color, #e2e8f0);
          flex-shrink: 0;
        }

        .creator-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .creator-info {
          flex: 1;
          min-width: 0;
        }

        .creator-handle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary, #1a202c);
          text-decoration: none;
          transition: color 0.2s;
        }

        .creator-handle:hover {
          color: #667eea;
        }

        .creator-handle i {
          font-size: 10px;
          opacity: 0.5;
        }

        .creator-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary, #718096);
          margin-top: 4px;
        }

        .creator-location i {
          font-size: 11px;
        }

        .creator-bio {
          font-size: 13px;
          color: var(--text-secondary, #4a5568);
          line-height: 1.6;
          margin-bottom: 16px;
          min-height: 42px;
        }

        .no-bio {
          color: var(--text-muted, #a0aec0);
          font-style: italic;
        }

        .creator-stats {
          display: flex;
          gap: 12px;
          padding: 14px 0;
          border-top: 1px solid var(--border-color, #e2e8f0);
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          margin-bottom: 16px;
        }

        .stat {
          flex: 1;
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary, #1a202c);
        }

        .stat-value.high {
          color: #22c55e;
        }

        .stat-value.medium {
          color: #f59e0b;
        }

        .stat-value.low {
          color: #ef4444;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-secondary, #718096);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .creator-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .creator-actions :global(button) {
          flex: 1;
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px !important;
          border-radius: 10px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          color: #fff !important;
        }

        .creator-actions :global(button:hover) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
        }

        .view-btn,
        .add-btn {
          flex: 1;
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .view-btn {
          background: var(--bg-hover, #f7fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          color: var(--text-secondary, #4a5568);
        }

        .view-btn:hover {
          background: var(--bg-elevated, #edf2f7);
          border-color: var(--border-color, #cbd5e0);
        }

        .add-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: #fff;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: var(--bg-card, #ffffff);
          border-radius: 20px;
          border: 1px solid var(--border-color, #e2e8f0);
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 32px;
          color: #667eea;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary, #1a202c);
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: var(--text-secondary, #718096);
          margin-bottom: 24px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 1200px) {
          .creators-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .creators-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-footer {
            flex-direction: column;
          }
          
          .filters-footer button {
            width: 100%;
            justify-content: center;
          }
          
          .creator-actions {
            flex-direction: column;
          }
          
          .creator-actions > * {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .filters-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .toggle-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
