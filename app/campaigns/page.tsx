"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const campaigns = [
  { id: 1, name: 'Summer Fashion Launch', status: 'active', creators: 12, budget: '$15,000', progress: 65 },
  { id: 2, name: 'Tech Product Review', status: 'active', creators: 8, budget: '$22,500', progress: 40 },
  { id: 3, name: 'Holiday Gift Guide', status: 'planning', creators: 0, budget: '$30,000', progress: 10 },
  { id: 4, name: 'Fitness Challenge', status: 'completed', creators: 15, budget: '$18,000', progress: 100 },
];

export default function CampaignsPage() {
  const router = useRouter();

  const handleNewCampaign = () => {
    router.push('/campaigns/create');
  };

  return (
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
            {campaigns.map((campaign) => (
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
                    <div className="metric-value">{campaign.creators}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Budget</div>
                    <div className="metric-value">{campaign.budget}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Progress</div>
                    <div className="metric-value">{campaign.progress}%</div>
                  </div>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
