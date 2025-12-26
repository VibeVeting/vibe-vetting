"use client";

import { Sidebar } from '@/components/common/Sidebar';
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
    console.log('Adding creator to campaign:', formData);
    router.push('/campaigns');
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-left">
              <h1>Add Creator to Campaign</h1>
              <p>Configure partnership details</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="form-card">
            <div className="form-header">
              <h2>Partnership Details</h2>
              <p>Set up the terms for this creator collaboration</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Campaign</label>
                <select
                  className="form-input"
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                  required
                >
                  <option value="">Choose a campaign...</option>
                  <option value="1">Summer Collection 2024</option>
                  <option value="2">Holiday Special</option>
                  <option value="3">Brand Awareness Q1</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Compensation Type</label>
                <div className="radio-group">
                  {[
                    { value: 'paid', label: 'Paid Partnership', icon: 'fa-dollar-sign' },
                    { value: 'gifted', label: 'Gifted Product', icon: 'fa-gift' },
                    { value: 'affiliate', label: 'Affiliate Commission', icon: 'fa-percent' },
                  ].map((option) => (
                    <label key={option.value} className={`radio-option ${formData.compensationType === option.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="compensation"
                        value={option.value}
                        checked={formData.compensationType === option.value}
                        onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
                      />
                      <i className={`fa-solid ${option.icon}`}></i>
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {formData.compensationType === 'paid' && (
                <div className="form-group">
                  <label className="form-label">Budget ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Enter budget amount"
                    min="0"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any special notes or requirements"
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                  <i className="fa-solid fa-arrow-left"></i>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-plus"></i>
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
