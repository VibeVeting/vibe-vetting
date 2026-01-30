"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { AIButton } from '@/components/common/AIButton';
import { AddToPipelineModal } from '@/components/pipeline/AddToPipelineModal';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { exportAsCSV } from '@/lib/export-utils';

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

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    instagram: 'fa-instagram',
    twitter: 'fa-x-twitter',
    youtube: 'fa-youtube',
    tiktok: 'fa-tiktok',
    linkedin: 'fa-linkedin',
    facebook: 'fa-facebook',
  };
  return icons[platform.toLowerCase()] || 'fa-globe';
};

const getPlatformColor = (platform: string) => {
  const colors: Record<string, string> = {
    instagram: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    twitter: 'linear-gradient(135deg, #1DA1F2, #0d8bd9)',
    youtube: 'linear-gradient(135deg, #FF0000, #cc0000)',
    tiktok: 'linear-gradient(135deg, #000000, #25F4EE)',
    linkedin: 'linear-gradient(135deg, #0077B5, #005582)',
    facebook: 'linear-gradient(135deg, #1877F2, #0d65d9)',
  };
  return colors[platform.toLowerCase()] || 'linear-gradient(135deg, #667eea, #764ba2)';
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [creatorForPipeline, setCreatorForPipeline] = useState<Creator | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const toggleCreatorSelection = (creatorId: string) => {
    setSelectedCreators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  };

  const handleAddSingleToPipeline = (creator: Creator) => {
    setCreatorForPipeline(creator);
    setShowPipelineModal(true);
  };

  const handleAddSelectedToPipeline = () => {
    setCreatorForPipeline(null);
    setShowPipelineModal(true);
  };

  const getSelectedCreatorsData = () => {
    return creators
      .filter(c => selectedCreators.has(c.id))
      .map(c => ({
        creatorId: c.id,
        creatorName: c.name,
        creatorHandle: c.handle,
        platform: c.platform,
        followers: c.followers,
        engagementRate: 0
      }));
  };

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
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <h1 className="yc-page-title">Analyzed Creators</h1>
                    <p className="yc-page-subtitle">Your AI-vetted creators • {filteredCreators.length} creators found</p>
                  </div>
                </div>
                <div className="yc-page-actions">
                  <button 
                    className="yc-btn-secondary"
                    onClick={() => {
                      if (filteredCreators.length === 0) {
                        alert('No creators to export');
                        return;
                      }
                      const exportData = filteredCreators.map(c => ({
                        'Name': c.name,
                        'Handle': c.handle || c.username,
                        'Platform': c.platform,
                        'Followers': c.followers,
                        'Alignment Score': `${c.alignmentScore}%`,
                        'Risk Level': c.riskLevel
                      }));
                      exportAsCSV(exportData, `creators-${new Date().toISOString().split('T')[0]}`);
                    }}
                  >
                    <i className="fa-solid fa-file-csv"></i> Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* YC Filters */}
            <div className="yc-filters">
              <div className="yc-search-wrapper">
                <i className="fa-solid fa-search"></i>
                <input
                  type="text"
                  className="yc-search-input"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="yc-filter-group">
                <span className="yc-filter-label">Platform</span>
                <select 
                  className="yc-filter-select"
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
              <div className="yc-filter-group">
                <span className="yc-filter-label">Score</span>
                <select 
                  className="yc-filter-select"
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
              <div className="yc-filter-group">
                <span className="yc-filter-label">Risk</span>
                <select 
                  className="yc-filter-select"
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

            {/* Selection Bar */}
            {selectedCreators.size > 0 && (
              <div className="yc-selection-bar">
                <div className="yc-selection-info">
                  <i className="fa-solid fa-check-circle"></i>
                  <span>{selectedCreators.size} creator{selectedCreators.size > 1 ? 's' : ''} selected</span>
                </div>
                <div className="yc-selection-actions">
                  <button 
                    className="yc-btn-secondary"
                    onClick={() => setSelectedCreators(new Set())}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className="fa-solid fa-times"></i> Clear
                  </button>
                  <button 
                    className="yc-btn-primary"
                    onClick={handleAddSelectedToPipeline}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className="fa-solid fa-diagram-project"></i> Add to Pipeline
                  </button>
                </div>
              </div>
            )}

            {/* YC Creators Grid */}
            <div className={`yc-creators-grid ${isVisible ? 'visible' : ''}`} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.2s' }}>
              {loading ? (
                <div className="yc-empty-state-card">
                  <div className="yc-empty-icon">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="45" stroke="url(#loadGradCreator)" strokeWidth="2" strokeDasharray="8 8">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <defs>
                        <linearGradient id="loadGradCreator" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00f5ff"/>
                          <stop offset="100%" stopColor="#667eea"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3>Loading creators...</h3>
                  <p>Fetching your analyzed creator data</p>
                </div>
              ) : filteredCreators.length > 0 ? (
                filteredCreators.map((creator, index) => (
                  <div 
                    key={creator.id} 
                    className={`yc-creator-card ${selectedCreators.has(creator.id) ? 'selected' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div 
                      className="yc-creator-checkbox" 
                      onClick={() => toggleCreatorSelection(creator.id)}
                    >
                      {selectedCreators.has(creator.id) ? (
                        <i className="fa-solid fa-square-check"></i>
                      ) : (
                        <i className="fa-regular fa-square"></i>
                      )}
                    </div>

                    <div className="yc-creator-avatar-section">
                      <div className="yc-creator-avatar" style={{ background: getPlatformColor(creator.platform) }}>
                        {creator.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="yc-creator-info">
                        <h3>{creator.name}</h3>
                        <a 
                          href={getProfileUrl(creator.platform, creator.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="yc-creator-handle"
                        >
                          <i className={`fa-brands ${getPlatformIcon(creator.platform)}`}></i>
                          {creator.handle}
                        </a>
                      </div>
                    </div>

                    <div className="yc-creator-stats">
                      <div className="yc-creator-stat">
                        <div className="yc-creator-stat-value">{creator.followers}</div>
                        <div className="yc-creator-stat-label">Followers</div>
                      </div>
                      <div className="yc-creator-stat">
                        <div className="yc-creator-stat-value">{creator.alignmentScore}%</div>
                        <div className="yc-creator-stat-label">Score</div>
                      </div>
                    </div>

                    <div className="yc-creator-score-bar">
                      <div 
                        className={`yc-creator-score-fill ${creator.alignmentScore >= 90 ? 'high' : creator.alignmentScore >= 70 ? 'medium' : 'low'}`}
                        style={{ width: `${creator.alignmentScore}%` }}
                      ></div>
                    </div>

                    <div className="yc-creator-footer">
                      <span className={`yc-creator-risk ${creator.riskLevel}`}>
                        <i className="fa-solid fa-shield"></i>
                        {creator.riskLevel.charAt(0).toUpperCase() + creator.riskLevel.slice(1)} Risk
                      </span>
                      <div className="yc-creator-actions">
                        <button 
                          className="yc-creator-btn yc-btn-secondary"
                          onClick={() => handleAddSingleToPipeline(creator)}
                          title="Add to Pipeline"
                          style={{ padding: '8px 12px' }}
                        >
                          <i className="fa-solid fa-diagram-project"></i>
                        </button>
                        <Link 
                          href={`/creators/${creator.id}`} 
                          className="yc-creator-btn yc-btn-primary"
                          style={{ padding: '8px 14px' }}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="yc-empty-state-card">
                  <div className="yc-empty-icon">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="40" stroke="url(#emptyGradCreator)" strokeWidth="2" strokeDasharray="4 4"/>
                      <circle cx="40" cy="40" r="15" stroke="url(#emptyGradCreator)" strokeWidth="2"/>
                      <circle cx="60" cy="40" r="15" stroke="url(#emptyGradCreator)" strokeWidth="2" opacity="0.6"/>
                      <circle cx="50" cy="60" r="15" stroke="url(#emptyGradCreator)" strokeWidth="2" opacity="0.4"/>
                      <defs>
                        <linearGradient id="emptyGradCreator" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00f5ff"/>
                          <stop offset="100%" stopColor="#667eea"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3>{creators.length === 0 ? 'No creators analyzed yet' : 'No matches found'}</h3>
                  <p>{creators.length === 0 ? 'Start analyzing creators to see them here' : 'Try adjusting your filters to see more results'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add to Pipeline Modal */}
        <AddToPipelineModal
          isOpen={showPipelineModal}
          onClose={() => {
            setShowPipelineModal(false);
            setCreatorForPipeline(null);
          }}
          creator={creatorForPipeline ? {
            creatorId: creatorForPipeline.id,
            creatorName: creatorForPipeline.name,
            creatorHandle: creatorForPipeline.handle,
            platform: creatorForPipeline.platform,
            followers: creatorForPipeline.followers,
            engagementRate: 0
          } : undefined}
          creators={!creatorForPipeline ? getSelectedCreatorsData() : undefined}
          onSuccess={() => {
            setSelectedCreators(new Set());
          }}
        />
      </div>
  );
}
