"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddCreatorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    campaignId: '',
    compensationType: 'paid',
    budget: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('Adding creator to campaign:', formData);
    router.push('/campaigns');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Add Creator to Campaign"
            subtitle="Configure partnership details"
          />

          <div className="add-creator-container">
            <form onSubmit={handleSubmit} className="add-creator-form">
              <div className="form-group">
                <label htmlFor="campaign">Select Campaign</label>
                <select
                  id="campaign"
                  value={formData.campaignId}
                  onChange={(e) =>
                    setFormData({ ...formData, campaignId: e.target.value })
                  }
                  required
                >
                  <option value="">Choose a campaign...</option>
                  <option value="1">Summer Collection 2024</option>
                  <option value="2">Holiday Special</option>
                  <option value="3">Brand Awareness Q1</option>
                </select>
              </div>

              <div className="form-group">
                <label>Compensation Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="compensation"
                      value="paid"
                      checked={formData.compensationType === 'paid'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          compensationType: e.target.value,
                        })
                      }
                    />
                    Paid Partnership
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="compensation"
                      value="gifted"
                      checked={formData.compensationType === 'gifted'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          compensationType: e.target.value,
                        })
                      }
                    />
                    Gifted Product
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="compensation"
                      value="affiliate"
                      checked={formData.compensationType === 'affiliate'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          compensationType: e.target.value,
                        })
                      }
                    />
                    Affiliate Commission
                  </label>
                </div>
              </div>

              {formData.compensationType === 'paid' && (
                <div className="form-group">
                  <label htmlFor="budget">Budget ($)</label>
                  <input
                    type="number"
                    id="budget"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    placeholder="Enter budget amount"
                    min="0"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add any special notes or requirements"
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add to Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
