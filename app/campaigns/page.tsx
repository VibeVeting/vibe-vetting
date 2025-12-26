"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
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

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

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
          setCampaigns(data.campaigns);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
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

  return (
    <ProtectedRoute>
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            {/* Page Header */}
            <div className="page-header">
              <div className="header-top">
                <div className="header-left">
                  <h1>Campaigns</h1>
                  <p>Manage your influencer campaigns</p>
                </div>
                <button onClick={handleNewCampaign} className="btn btn-primary">
                  <i className="fa-solid fa-plus"></i>
                  New Campaign
                </button>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="campaigns-grid">
              {loading ? (
                <div style={{ gridColumn: 'span 2', padding: '60px', textAlign: 'center', color: '#718096' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
                  <p>Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div style={{ gridColumn: 'span 2', padding: '60px', textAlign: 'center', color: '#718096' }}>
                  <i className="fa-solid fa-bullhorn" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
                  <h3 style={{ marginBottom: '8px', color: '#1a202c' }}>No campaigns yet</h3>
                  <p>Create your first campaign to start finding creators</p>
                  <button onClick={handleNewCampaign} className="btn btn-primary" style={{ marginTop: '16px' }}>
                    <i className="fa-solid fa-plus"></i>
                    Create Campaign
                  </button>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="campaign-card">
                    <div className="campaign-header">
                      <div>
                        <h3>{campaign.name}</h3>
                        <span className={`badge ${campaign.status === 'active' ? 'badge-verified' : campaign.status === 'completed' ? 'badge-pending' : 'badge-risk'}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <button className="card-menu">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
