"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { CardMenu } from '@/components/common/CardMenu';
import { AIButton, AIQuickAction } from '@/components/common/AIButton';
import { AddToPipelineModal } from '@/components/pipeline/AddToPipelineModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { exportAsCSV } from '@/lib/export-utils';

interface Campaign {
  id: string;
  name: string;
  status: string;
  creatorsCount: number;
  budget: number;
  matchedCreators: number;
}

// Empty campaigns state - no sample data
const defaultCampaigns: Campaign[] = [];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [selectedCampaignForPipeline, setSelectedCampaignForPipeline] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleAddCreatorsToPipeline = (campaignId: string) => {
    setSelectedCampaignForPipeline(campaignId);
    setShowPipelineModal(true);
  };
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const handleUpdateStatus = async (campaignId: string, newStatus: string) => {
    setUpdatingStatusId(campaignId);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/user/campaigns?id=${campaignId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setCampaigns(campaigns.map(c => 
          c.id === campaignId ? { ...c, status: newStatus } : c
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string, campaignName: string) => {
    if (!confirm(`Are you sure you want to move "${campaignName}" to trash? You can restore it later from settings.`)) {
      return;
    }

    setDeletingId(campaignId);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/user/campaigns?id=${campaignId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setCampaigns(campaigns.filter(c => c.id !== campaignId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    } finally {
      setDeletingId(null);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store', // Prevent caching to always get fresh data
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch campaigns on mount and when returning to the page
  useEffect(() => {
    fetchCampaigns();
    
    // Refetch when window regains focus (user returns from another page)
    const handleFocus = () => {
      fetchCampaigns();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleNewCampaign = () => {
    router.push('/campaigns/create');
  };

  const getProgress = (campaign: Campaign) => {
    if (campaign.status === 'completed') return 100;
    if (campaign.status === 'draft') return 10;
    return campaign.creatorsCount > 0 ? Math.min(90, (campaign.matchedCreators / campaign.creatorsCount) * 100) : 20;
  };

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!campaign.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    // Status filter
    if (statusFilter !== 'all' && campaign.status !== statusFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    // Sorting
    switch (sortBy) {
      case 'newest':
        return b.id.localeCompare(a.id); // Assuming newer IDs are greater
      case 'oldest':
        return a.id.localeCompare(b.id);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'budget-high':
        return (b.budget || 0) - (a.budget || 0);
      case 'budget-low':
        return (a.budget || 0) - (b.budget || 0);
      case 'creators-high':
        return (b.creatorsCount || 0) - (a.creatorsCount || 0);
      case 'creators-low':
        return (a.creatorsCount || 0) - (b.creatorsCount || 0);
      default:
        return 0;
    }
  });

  // Get counts for tabs
  const statusCounts = {
    all: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

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
                  <div className="yc-page-icon" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                    <i className="fa-solid fa-bullhorn"></i>
                  </div>
                  <div>
                    <h1 className="yc-page-title">Campaigns</h1>
                    <p className="yc-page-subtitle">Manage your influencer campaigns • {filteredCampaigns.length} campaigns</p>
                  </div>
                </div>
                <div className="yc-page-actions">
                  <button 
                    className="yc-btn-secondary"
                    onClick={() => {
                      if (campaigns.length === 0) {
                        alert('No campaigns to export');
                        return;
                      }
                      const exportData = campaigns.map(c => ({
                        'Campaign Name': c.name,
                        'Status': c.status,
                        'Creators': c.creatorsCount,
                        'Budget': `₹${c.budget?.toLocaleString('en-IN') || 0}`,
                        'Matched Creators': c.matchedCreators || 0
                      }));
                      exportAsCSV(exportData, `campaigns-${new Date().toISOString().split('T')[0]}`);
                    }}
                  >
                    <i className="fa-solid fa-file-csv"></i> Export CSV
                  </button>
                  <button className="yc-btn-primary" onClick={handleNewCampaign}>
                    <i className="fa-solid fa-plus"></i> New Campaign
                  </button>
                </div>
              </div>
            </div>

            {/* YC Status Tabs */}
            <div className="yc-tabs">
              <button 
                className={`yc-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span>All</span>
                <span className="yc-tab-count">{statusCounts.all}</span>
              </button>
              <button 
                className={`yc-tab ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                <i className="fa-solid fa-circle-play"></i>
                <span>Active</span>
                <span className="yc-tab-count">{statusCounts.active}</span>
              </button>
              <button 
                className={`yc-tab ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                <i className="fa-solid fa-file-pen"></i>
                <span>Draft</span>
                <span className="yc-tab-count">{statusCounts.draft}</span>
              </button>
              <button 
                className={`yc-tab ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                <i className="fa-solid fa-circle-check"></i>
                <span>Completed</span>
                <span className="yc-tab-count">{statusCounts.completed}</span>
              </button>
            </div>

            {/* YC Filters */}
            <div className="yc-filters">
              <div className="yc-search-wrapper">
                <i className="fa-solid fa-search"></i>
                <input
                  type="text"
                  className="yc-search-input"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="yc-filter-group">
                <span className="yc-filter-label">Sort By</span>
                <select 
                  className="yc-filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="budget-high">Budget (High-Low)</option>
                  <option value="budget-low">Budget (Low-High)</option>
                  <option value="creators-high">Creators (Most)</option>
                  <option value="creators-low">Creators (Least)</option>
                </select>
              </div>
            </div>

            {/* YC Campaigns Grid */}
            <div className={`yc-campaigns-grid ${isVisible ? 'visible' : ''}`} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.2s' }}>
              {loading ? (
                <div className="yc-empty-state-card">
                  <div className="yc-empty-icon">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="45" stroke="url(#loadGrad)" strokeWidth="2" strokeDasharray="8 8">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <defs>
                        <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#667eea"/>
                          <stop offset="100%" stopColor="#764ba2"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3>Loading campaigns...</h3>
                  <p>Fetching your campaign data</p>
                </div>
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign, index) => (
                  <div key={campaign.id} className="yc-campaign-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="yc-campaign-header">
                      <div>
                        <h3 className="yc-campaign-title">{campaign.name}</h3>
                        <span className={`yc-campaign-status ${campaign.status}`}>
                          <i className={`fa-solid ${campaign.status === 'active' ? 'fa-circle-play' : campaign.status === 'completed' ? 'fa-circle-check' : 'fa-file-pen'}`}></i>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </div>
                      <CardMenu items={[
                        { label: 'Edit Campaign', icon: 'fa-pen', onClick: () => router.push(`/campaigns/${campaign.id}/edit`) },
                        { label: 'View Pipeline', icon: 'fa-users', onClick: () => router.push(`/campaigns/${campaign.id}/pipeline`) },
                        // Status change options
                        ...(campaign.status !== 'active' ? [{ 
                          label: updatingStatusId === campaign.id ? 'Updating...' : 'Mark as Active', 
                          icon: updatingStatusId === campaign.id ? 'fa-spinner fa-spin' : 'fa-circle-play', 
                          onClick: () => handleUpdateStatus(campaign.id, 'active'),
                          disabled: updatingStatusId === campaign.id 
                        }] : []),
                        ...(campaign.status !== 'draft' ? [{ 
                          label: updatingStatusId === campaign.id ? 'Updating...' : 'Mark as Draft', 
                          icon: updatingStatusId === campaign.id ? 'fa-spinner fa-spin' : 'fa-file-pen', 
                          onClick: () => handleUpdateStatus(campaign.id, 'draft'),
                          disabled: updatingStatusId === campaign.id 
                        }] : []),
                        ...(campaign.status !== 'completed' ? [{ 
                          label: updatingStatusId === campaign.id ? 'Updating...' : 'Mark as Completed', 
                          icon: updatingStatusId === campaign.id ? 'fa-spinner fa-spin' : 'fa-circle-check', 
                          onClick: () => handleUpdateStatus(campaign.id, 'completed'),
                          disabled: updatingStatusId === campaign.id 
                        }] : []),
                        { label: deletingId === campaign.id ? 'Moving...' : 'Move to Trash', icon: deletingId === campaign.id ? 'fa-spinner fa-spin' : 'fa-trash-can', onClick: () => handleDeleteCampaign(campaign.id, campaign.name), danger: true, disabled: deletingId === campaign.id },
                      ]} />
                    </div>

                    <div className="yc-campaign-metrics">
                      <div className="yc-campaign-metric">
                        <div className="yc-campaign-metric-value">{campaign.creatorsCount}</div>
                        <div className="yc-campaign-metric-label">Creators</div>
                      </div>
                      <div className="yc-campaign-metric">
                        <div className="yc-campaign-metric-value">${(campaign.budget / 1000).toFixed(0)}K</div>
                        <div className="yc-campaign-metric-label">Budget</div>
                      </div>
                      <div className="yc-campaign-metric">
                        <div className="yc-campaign-metric-value">{getProgress(campaign).toFixed(0)}%</div>
                        <div className="yc-campaign-metric-label">Progress</div>
                      </div>
                    </div>

                    <div className="yc-campaign-progress">
                      <div className="yc-campaign-progress-bar">
                        <div className="yc-campaign-progress-fill" style={{ width: `${getProgress(campaign)}%` }}></div>
                      </div>
                    </div>

                    <div className="yc-campaign-actions">
                      <Link href={`/campaigns/${campaign.id}/pipeline`} className="yc-campaign-btn yc-campaign-btn-primary">
                        <i className="fa-solid fa-diagram-project"></i> Pipeline
                      </Link>
                      <button 
                        className="yc-campaign-btn yc-campaign-btn-secondary"
                        onClick={() => handleAddCreatorsToPipeline(campaign.id)}
                      >
                        <i className="fa-solid fa-user-plus"></i> Add
                      </button>
                    </div>
                  </div>
              ))
              ) : (
                <div className="yc-empty-state-card">
                  <div className="yc-empty-icon">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="40" stroke="url(#emptyGrad)" strokeWidth="2" strokeDasharray="4 4"/>
                      <path d="M35 50 L65 50 M50 35 L50 65" stroke="url(#emptyGrad)" strokeWidth="2" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#667eea"/>
                          <stop offset="100%" stopColor="#764ba2"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3>{campaigns.length === 0 ? 'No campaigns yet' : 'No matches found'}</h3>
                  <p>{campaigns.length === 0 ? 'Create your first campaign to get started with influencer marketing' : 'Try adjusting your search or filters'}</p>
                  {campaigns.length === 0 && (
                    <button className="yc-btn-primary" onClick={handleNewCampaign} style={{ marginTop: '20px' }}>
                      <i className="fa-solid fa-plus"></i> Create Campaign
                    </button>
                  )}
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
            setSelectedCampaignForPipeline(null);
          }}
          preSelectedCampaignId={selectedCampaignForPipeline || undefined}
          onSuccess={(campaignId) => {
            router.push(`/campaigns/${campaignId}/pipeline`);
          }}
        />
      </div>
  );
}
