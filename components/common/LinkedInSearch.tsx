'use client';

import { useState } from 'react';

interface LinkedInPerson {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  title?: string;
  location?: string;
  profileUrl?: string;
  profilePicture?: string;
  connectionDegree?: string;
  summary?: string;
  industry?: string;
  followers?: string;
}

interface LinkedInSearchProps {
  onSelectPerson?: (person: LinkedInPerson) => void;
}

const industries = [
  { value: '', label: 'All Industries' },
  { value: 'technology', label: 'Technology' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'fitness', label: 'Fitness & Wellness' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel & Tourism' },
  { value: 'retail', label: 'Retail' },
  { value: 'media', label: 'Media & Publishing' },
];

const locations = [
  { value: '', label: 'All Locations' },
  { value: 'india', label: 'India' },
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'uae', label: 'UAE' },
  { value: 'brazil', label: 'Brazil' },
];

const followerRanges = [
  { value: '', label: 'All Sizes' },
  { value: 'nano', label: 'Nano (1K - 10K)' },
  { value: 'micro', label: 'Micro (10K - 50K)' },
  { value: 'mid', label: 'Mid-tier (50K - 500K)' },
  { value: 'macro', label: 'Macro (500K - 1M)' },
  { value: 'mega', label: 'Mega (1M+)' },
];

export function LinkedInSearch({ onSelectPerson }: LinkedInSearchProps) {
  const [keywords, setKeywords] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [followerRange, setFollowerRange] = useState('');
  const [results, setResults] = useState<LinkedInPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async () => {
    if (!keywords.trim() && !industry && !location) {
      setError('Please enter keywords or select at least one filter');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('/api/linkedin/creator-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywords.trim(),
          industry,
          location,
          followerRange,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.profiles || []);
        if (data.profiles?.length === 0) {
          setError('No creators found. Try different search criteria.');
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setKeywords('');
    setIndustry('');
    setLocation('');
    setFollowerRange('');
    setResults([]);
    setError('');
  };

  return (
    <>
      <button className="linkedin-search-btn" onClick={() => setShowModal(true)}>
        <i className="fa-brands fa-linkedin"></i>
        <span>LinkedIn Creator Search</span>
      </button>

      {showModal && (
        <div className="linkedin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="linkedin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-title">
                <div className="linkedin-icon">
                  <i className="fa-brands fa-linkedin"></i>
                </div>
                <div>
                  <h2>LinkedIn Creator Search</h2>
                  <p>Find creators by industry, location & audience size</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="search-section">
              <div className="search-input-wrapper">
                <i className="fa-solid fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, keywords, niche..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="filters-row">
                <div className="filter-group">
                  <label>
                    <i className="fa-solid fa-industry"></i>
                    Industry
                  </label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                    {industries.map((ind) => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>
                    <i className="fa-solid fa-location-dot"></i>
                    Location
                  </label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}>
                    {locations.map((loc) => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>
                    <i className="fa-solid fa-users"></i>
                    Audience Size
                  </label>
                  <select value={followerRange} onChange={(e) => setFollowerRange(e.target.value)}>
                    {followerRanges.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-actions">
                <button className="clear-btn" onClick={clearFilters}>
                  <i className="fa-solid fa-rotate-left"></i>
                  Clear
                </button>
                <button 
                  className="search-btn"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
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

            {error && (
              <div className="error-message">
                <i className="fa-solid fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="results-section">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  </div>
                  <span>Searching LinkedIn & Google...</span>
                  <p>Finding creators matching your criteria</p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="results-header">
                    <span className="results-count">{results.length} creators found</span>
                  </div>
                  <div className="results-list">
                    {results.map((person, index) => (
                      <div key={person.id || index} className="person-card">
                        <div className="person-avatar">
                          {person.profilePicture ? (
                            <img src={person.profilePicture} alt={person.fullName || 'Profile'} />
                          ) : (
                            <div className="avatar-placeholder">
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                        </div>
                        <div className="person-info">
                          <h4>{person.fullName || `${person.firstName || ''} ${person.lastName || ''}`}</h4>
                          <p className="headline">{person.headline || person.title || 'No headline'}</p>
                          <div className="person-meta">
                            {person.location && (
                              <span className="meta-item">
                                <i className="fa-solid fa-location-dot"></i>
                                {person.location}
                              </span>
                            )}
                            {person.industry && (
                              <span className="meta-item">
                                <i className="fa-solid fa-briefcase"></i>
                                {person.industry}
                              </span>
                            )}
                            {person.followers && (
                              <span className="meta-item followers">
                                <i className="fa-solid fa-users"></i>
                                {person.followers}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="person-actions">
                          {person.profileUrl && (
                            <a 
                              href={person.profileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="view-profile-btn"
                            >
                              <i className="fa-brands fa-linkedin"></i>
                              View
                            </a>
                          )}
                          {onSelectPerson && (
                            <button 
                              className="add-btn"
                              onClick={() => {
                                onSelectPerson(person);
                                setShowModal(false);
                              }}
                            >
                              <i className="fa-solid fa-plus"></i>
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fa-brands fa-linkedin"></i>
                  </div>
                  <h3>Find LinkedIn Creators</h3>
                  <p>Use the filters above to search for creators by industry, location, and audience size</p>
                  <div className="tips">
                    <div className="tip">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span>Try searching "fashion influencer" in Fashion industry</span>
                    </div>
                    <div className="tip">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span>Combine location with industry for better results</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .linkedin-search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #0077b5 0%, #0a66c2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 119, 181, 0.3);
        }

        .linkedin-search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 119, 181, 0.4);
        }

        .linkedin-search-btn i {
          font-size: 16px;
        }

        .linkedin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .linkedin-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: linear-gradient(135deg, #0077b5 0%, #0a66c2 100%);
          color: white;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-title > div h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .header-title > div p {
          font-size: 13px;
          opacity: 0.9;
          margin: 0;
        }

        .linkedin-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .search-section {
          padding: 20px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          transition: all 0.2s;
          margin-bottom: 16px;
        }

        .search-input-wrapper:focus-within {
          border-color: #0077b5;
          box-shadow: 0 0 0 4px rgba(0, 119, 181, 0.1);
        }

        .search-input-wrapper i {
          color: #718096;
          font-size: 16px;
        }

        .search-input-wrapper input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 15px;
          outline: none;
          color: #1a202c;
        }

        .search-input-wrapper input::placeholder {
          color: #a0aec0;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-group label i {
          color: #0077b5;
          font-size: 11px;
        }

        .filter-group select {
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #1a202c;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #0077b5;
        }

        .search-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #0077b5 0%, #0a66c2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 119, 181, 0.3);
        }

        .search-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #fff5f5;
          color: #c53030;
          font-size: 14px;
        }

        .results-section {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          min-height: 300px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .results-count {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #0077b5 0%, #0a66c2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .loading-spinner i {
          font-size: 24px;
          color: white;
        }

        .loading-state span {
          font-size: 16px;
          font-weight: 600;
          color: #1a202c;
        }

        .loading-state p {
          font-size: 14px;
          color: #718096;
          margin-top: 4px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(0, 119, 181, 0.1) 0%, rgba(10, 102, 194, 0.1) 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .empty-icon i {
          font-size: 36px;
          color: #0077b5;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 8px 0;
        }

        .empty-state > p {
          font-size: 14px;
          color: #718096;
          margin: 0 0 24px 0;
          max-width: 300px;
        }

        .tips {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4a5568;
          background: #f7fafc;
          padding: 10px 16px;
          border-radius: 8px;
        }

        .tip i {
          color: #f59e0b;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .person-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .person-card:hover {
          border-color: #0077b5;
          box-shadow: 0 4px 12px rgba(0, 119, 181, 0.1);
        }

        .person-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .person-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0077b5 0%, #0a66c2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .person-info {
          flex: 1;
          min-width: 0;
        }

        .person-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .person-info .headline {
          font-size: 13px;
          color: #4a5568;
          margin: 0 0 8px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .person-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #718096;
        }

        .meta-item i {
          font-size: 10px;
          color: #0077b5;
        }

        .meta-item.followers {
          background: rgba(0, 119, 181, 0.1);
          color: #0077b5;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .person-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .view-profile-btn,
        .add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .view-profile-btn {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          color: #0077b5;
        }

        .view-profile-btn:hover {
          background: #edf2f7;
          border-color: #0077b5;
        }

        .add-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
        }

        .add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 640px) {
          .filters-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
