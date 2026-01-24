"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { CardMenu } from '@/components/common/CardMenu';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  creatorsCount: number;
  budget: number;
  matchedCreators: number;
}

// Default sample campaigns to show immediately
const defaultCampaigns: Campaign[] = [
  {
    id: 'sample-1',
    name: 'Summer Fashion Launch',
    status: 'active',
    creatorsCount: 25,
    budget: 50000,
    matchedCreators: 18,
  },
  {
    id: 'sample-2',
    name: 'Tech Product Review',
    status: 'active',
    creatorsCount: 15,
    budget: 30000,
    matchedCreators: 12,
  },
  {
    id: 'sample-3',
    name: 'Holiday Special',
    status: 'draft',
    creatorsCount: 30,
    budget: 75000,
    matchedCreators: 0,
  },
  {
    id: 'sample-4',
    name: 'Q3 Brand Awareness',
    status: 'completed',
    creatorsCount: 20,
    budget: 45000,
    matchedCreators: 20,
  },
];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [isUsingDefaults, setIsUsingDefaults] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/campaigns', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.campaigns && data.campaigns.length > 0) {
            setCampaigns(data.campaigns);
            setIsUsingDefaults(false);
          }
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
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
  });

  return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title="Campaigns"
              subtitle={isUsingDefaults ? `Manage your influencer campaigns (Sample Data) • ${filteredCampaigns.length} campaigns` : `Manage your influencer campaigns • ${filteredCampaigns.length} campaigns`}
              actionButton={{
                label: 'New Campaign',
                icon: 'fa-plus',
                onClick: handleNewCampaign,
              }}
            />

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
                <span className="filter-label">Status</span>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="campaigns-grid">
              {filteredCampaigns.length > 0 ? (
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
                        { label: 'Edit Campaign', icon: 'fa-pen', onClick: () => router.push(`/campaigns/create?edit=${campaign.id}`) },
                        { label: 'View Matches', icon: 'fa-users', onClick: () => router.push('/campaigns/matches') },
                        { label: 'Duplicate', icon: 'fa-copy', onClick: () => alert('Duplicate coming soon!') },
                        { label: 'Delete', icon: 'fa-trash', onClick: () => alert('Delete coming soon!'), danger: true },
                      ]} />
                    </div>

                    <div className="card-metrics">
                      <div className="metric">
                        <div className="metric-label">Creators</div>
                        <div className="metric-value">{campaign.creatorsCount}</div>
                      </div>
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
                      <Link href={`/campaigns/matches`} className="btn btn-secondary">
                        View Details
                      </Link>
                      <Link href={`/campaigns/add-creator`} className="btn btn-primary">
                        Add Creators
                      </Link>
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
      </div>
  );
}
