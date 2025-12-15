"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platforms: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('Creating campaign:', formData);
    router.push('/campaigns/scanning');
  };

  const handleCancel = () => {
    router.push('/campaigns');
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Create New Campaign"
            subtitle="Set up your influencer vetting campaign"
          />

          <div className="campaign-form-container">
            <form onSubmit={handleSubmit} className="campaign-form">
              <div className="form-group">
                <label htmlFor="name">Campaign Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your campaign objectives"
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Platforms</label>
                <div className="platform-checkboxes">
                  {['Instagram', 'YouTube', 'TikTok', 'Twitter'].map((platform) => (
                    <label key={platform} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              platforms: [...formData.platforms, platform],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              platforms: formData.platforms.filter((p) => p !== platform),
                            });
                          }
                        }}
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Start AI Scanning
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
