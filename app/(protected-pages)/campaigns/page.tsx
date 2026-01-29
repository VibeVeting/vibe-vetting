"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { CardMenu } from '@/components/common/CardMenu';
import { AIButton, AIQuickAction } from '@/components/common/AIButton';
import { AddToPipelineModal } from '@/components/pipeline/AddToPipelineModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
          <div className="container">
            <TopBar
              title="Campaigns"
              subtitle={`Manage your influencer campaigns • ${filteredCampaigns.length} campaigns`}
              actionButton={{
                label: 'New Campaign',
                icon: 'fa-plus',
                onClick: handleNewCampaign,
              }}
              secondaryButton={{
                label: 'Export CSV',
                icon: 'fa-file-csv',
                onClick: () => {
                  if (campaigns.length === 0) {
                    alert('No campaigns to export');
                    return;
                  }
                  const exportData = campaigns.map(c => ({
                    'Campaign Name': c.name,
                    'Status': c.status,
                    'Creators': c.creatorsCount,
                    'Budget': `$${c.budget?.toLocaleString() || 0}`,
                    'Matched Creators': c.matchedCreators || 0
                  }));
                  exportAsCSV(exportData, `campaigns-${new Date().toISOString().split('T')[0]}`);
                },
              }}
            />

            {/* Status Tabs */}
            <div className="campaign-status-tabs">
              <button 
                className={`campaign-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span>All</span>
                <span className="campaign-tab-count">{statusCounts.all}</span>
              </button>
              <button 
                className={`campaign-tab ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                <span>Active</span>
                <span className="campaign-tab-count">{statusCounts.active}</span>
              </button>
              <button 
                className={`campaign-tab ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                <span>Draft</span>
                <span className="campaign-tab-count">{statusCounts.draft}</span>
              </button>
              <button 
                className={`campaign-tab ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                <span>Completed</span>
                <span className="campaign-tab-count">{statusCounts.completed}</span>
              </button>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group search-filter">
                <span className="filter-label">Search</span>
                <div className="search-input-wrapper">
                  <i className="fa-solid fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search campaigns..."
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
                <span className="filter-label">Sort By</span>
                <select 
                  className="filter-select"
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

            {/* AI Quick Actions */}
            {/* <div className="ai-quick-actions-row">
              <AIQuickAction 
                title="Find Matching Creators"
                description="AI finds creators perfect for this campaign"
                icon="fa-user-plus"
                type="find-creators"
                defaultData={{ goal: 'Brand awareness', target: 'Gen Z and Millennials', budget: '$50,000' }}
              />
              <AIQuickAction 
                title="Compare Creators"
                description="Compare shortlisted creators side-by-side"
                icon="fa-code-compare"
                type="compare-creators"
                defaultData={{ creators: 'Selected creators' }}
              />
              <AIQuickAction 
                title="Bulk Outreach"
                description="Generate emails for multiple creators"
                icon="fa-paper-plane"
                type="outreach-email"
                defaultData={{ creatorName: 'Creator', niche: 'Fashion', brandName: 'Your Brand', campaignGoal: 'Summer campaign' }}
              />
            </div> */}

            {/* Campaigns Grid */}
            <div className="campaigns-grid">
              {loading ? (
                <div style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center', color: '#718096' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
                  <p>Loading campaigns...</p>
                </div>
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="campaign-card">
                    <div className="campaign-header">
                      <div>
                        <h3>{campaign.name}</h3>
                        <span className={`badge ${campaign.status === 'active' ? 'badge-verified' : campaign.status === 'completed' ? 'badge-pending' : 'badge-risk'}`}>
                          {campaign.status}
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

                    <div className="card-metrics">
                      <Link href={`/campaigns/${campaign.id}/pipeline`} className="metric" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                        <div className="metric-label">Creators</div>
                        <div className="metric-value">{campaign.creatorsCount}</div>
                      </Link>
                      <div className="metric">
                        <div className="metric-label">Budget</div>
                        <div className="metric-value">${campaign.budget?.toLocaleString() || 0}</div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Progress</div>
                        <div className="metric-value">{getProgress(campaign).toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${getProgress(campaign)}%` }}></div>
                    </div>

                    <div className="campaign-actions">
                      <Link href={`/campaigns/${campaign.id}/pipeline`} className="btn btn-primary">
                        <i className="fa-solid fa-diagram-project"></i> Pipeline
                      </Link>
                      <Link href={`/campaigns/${campaign.id}/pipeline`} className="btn btn-secondary">
                        View Details
                      </Link>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleAddCreatorsToPipeline(campaign.id)}
                      >
                        <i className="fa-solid fa-user-plus"></i> Add Creators
                      </button>
                    </div>
                  </div>
              ))
              ) : (
                <div className="no-results" style={{ gridColumn: 'span 3' }}>
                  <i className="fa-solid fa-search"></i>
                  <h3>No campaigns found</h3>
                  <p>{campaigns.length === 0 ? 'Create your first campaign to get started' : 'Try adjusting your search or filters'}</p>
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
