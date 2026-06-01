"use client";

import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  _id?: string;
  name: string;
  status: string;
  budget?: number;
}

interface Creator {
  creatorId: string;
  creatorName: string;
  creatorEmail?: string;
  creatorHandle: string;
  platform: string;
  followers: string;
  engagementRate?: number;
  avatarUrl?: string;
}

interface AnalyzedCreator {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: string;
  alignmentScore: number;
}

interface AddToPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator?: Creator;
  creators?: Creator[];
  preSelectedCampaignId?: string;
  onSuccess?: (campaignId: string, addedCount: number) => void;
}

export function AddToPipelineModal({
  isOpen,
  onClose,
  creator,
  creators = [],
  preSelectedCampaignId,
  onSuccess
}: AddToPipelineModalProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(preSelectedCampaignId || '');
  const [loading, setLoading] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Creator discovery state (when no creators passed in)
  const [showCreatorDiscovery, setShowCreatorDiscovery] = useState(false);
  const [analyzedCreators, setAnalyzedCreators] = useState<AnalyzedCreator[]>([]);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<Set<string>>(new Set());
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [creatorSearchQuery, setCreatorSearchQuery] = useState('');

  // Get creators to add (either single, multiple passed in, or selected from discovery)
  const getCreatorsToAdd = (): Creator[] => {
    if (creator) return [creator];
    if (creators.length > 0) return creators;
    
    // From discovery
    return analyzedCreators
      .filter(c => selectedCreatorIds.has(c.id))
      .map(c => ({
        creatorId: c.id,
        creatorName: c.name,
        creatorHandle: c.handle,
        platform: c.platform,
        followers: c.followers,
        engagementRate: 0
      }));
  };

  const creatorsToAdd = getCreatorsToAdd();
  
  // Check if we need to show creator discovery
  const needsCreatorDiscovery = !creator && creators.length === 0;

  useEffect(() => {
    if (isOpen) {
      fetchCampaigns();
      setError(null);
      setSuccess(null);
      
      // If no creators passed, fetch analyzed creators
      if (needsCreatorDiscovery) {
        setShowCreatorDiscovery(true);
        fetchAnalyzedCreators();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (preSelectedCampaignId) {
      setSelectedCampaignId(preSelectedCampaignId);
    }
  }, [preSelectedCampaignId]);

  const fetchAnalyzedCreators = async () => {
    setLoadingCreators(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/analyses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const mapped = (data.analyses || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          handle: a.handle || `@${a.name.toLowerCase().replace(' ', '')}`,
          platform: a.platform || 'Instagram',
          followers: a.followers,
          alignmentScore: a.alignmentScore
        }));
        setAnalyzedCreators(mapped);
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
    } finally {
      setLoadingCreators(false);
    }
  };

  const toggleCreatorSelection = (creatorId: string) => {
    setSelectedCreatorIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  };

  const selectAllCreators = () => {
    const filteredIds = filteredAnalyzedCreators.map(c => c.id);
    setSelectedCreatorIds(new Set(filteredIds));
  };

  const clearSelection = () => {
    setSelectedCreatorIds(new Set());
  };

  const filteredAnalyzedCreators = analyzedCreators.filter(c => {
    if (!creatorSearchQuery) return true;
    const query = creatorSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(query) || c.handle.toLowerCase().includes(query);
  });

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const response = await fetch('/api/user/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter to only active and draft campaigns
        const activeCampaigns = (data.campaigns || []).filter(
          (c: Campaign) => c.status === 'active' || c.status === 'draft'
        );
        setCampaigns(activeCampaigns);
        
        // Auto-select first campaign if none selected
        if (!selectedCampaignId && activeCampaigns.length > 0) {
          setSelectedCampaignId(activeCampaigns[0].id || activeCampaigns[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleAddToPipeline = async () => {
    if (!selectedCampaignId) {
      setError('Please select a campaign');
      return;
    }

    if (creatorsToAdd.length === 0) {
      setError('No creators selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const response = await fetch('/api/campaigns/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'add_creators',
          campaignId: selectedCampaignId,
          creators: creatorsToAdd.map(c => ({
            creatorId: c.creatorId,
            creatorName: c.creatorName,
            creatorEmail: c.creatorEmail || '',
            creatorHandle: c.creatorHandle,
            platform: c.platform,
            followers: c.followers,
            engagementRate: c.engagementRate || 0,
            avatarUrl: c.avatarUrl
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        const addedCount = data.addedCount || creatorsToAdd.length;
        setSuccess(`Successfully added ${addedCount} creator${addedCount > 1 ? 's' : ''} to pipeline!`);
        
        if (onSuccess) {
          onSuccess(selectedCampaignId, addedCount);
        }

        // Auto close after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to add creators to pipeline');
      }
    } catch (err) {
      console.error('Error adding to pipeline:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pipeline-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fa-solid fa-diagram-project"></i>
            Add to Campaign Pipeline
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Creator Discovery Section (when no creators passed in) */}
          {showCreatorDiscovery && (
            <div className="creator-discovery-section">
              <label>Select Creators to Add</label>
              
              {/* Search and actions */}
              <div className="creator-discovery-header">
                <div className="creator-search">
                  <i className="fa-solid fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={creatorSearchQuery}
                    onChange={(e) => setCreatorSearchQuery(e.target.value)}
                  />
                </div>
                <div className="creator-actions">
                  {selectedCreatorIds.size > 0 ? (
                    <button className="btn-text" onClick={clearSelection}>
                      Clear ({selectedCreatorIds.size})
                    </button>
                  ) : (
                    <button className="btn-text" onClick={selectAllCreators}>
                      Select All
                    </button>
                  )}
                </div>
              </div>

              {/* Creator list */}
              <div className="creator-discovery-list">
                {loadingCreators ? (
                  <div className="loading-creators">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Loading creators...</span>
                  </div>
                ) : filteredAnalyzedCreators.length === 0 ? (
                  <div className="no-creators-found">
                    <i className="fa-solid fa-user-slash"></i>
                    <p>No creators found</p>
                    <a href="/creators/discover" className="btn btn-primary btn-sm">
                      Discover Creators
                    </a>
                  </div>
                ) : (
                  filteredAnalyzedCreators.map((c) => (
                    <div
                      key={c.id}
                      className={`creator-discovery-item ${selectedCreatorIds.has(c.id) ? 'selected' : ''}`}
                      onClick={() => toggleCreatorSelection(c.id)}
                    >
                      <div className="creator-checkbox">
                        {selectedCreatorIds.has(c.id) ? (
                          <i className="fa-solid fa-square-check"></i>
                        ) : (
                          <i className="fa-regular fa-square"></i>
                        )}
                      </div>
                      <div className="creator-avatar-mini">
                        {c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="creator-info-mini">
                        <span className="creator-name-mini">{c.name}</span>
                        <span className="creator-handle-mini">{c.handle}</span>
                      </div>
                      <div className="creator-meta-mini">
                        <span className="creator-followers-mini">{c.followers}</span>
                        <span className="creator-platform-mini">
                          <i className={`fa-brands fa-${c.platform.toLowerCase()}`}></i>
                        </span>
                      </div>
                      <div className="creator-score-mini">
                        <span className={`score ${c.alignmentScore >= 80 ? 'high' : c.alignmentScore >= 60 ? 'medium' : 'low'}`}>
                          {c.alignmentScore}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Selected Creators Preview (when creators passed in or selected) */}
          {(!showCreatorDiscovery || selectedCreatorIds.size > 0) && creatorsToAdd.length > 0 && (
            <div className="pipeline-creators-preview">
              <label>Creators to Add ({creatorsToAdd.length})</label>
              <div className="creators-chips">
                {creatorsToAdd.slice(0, 5).map((c, idx) => (
                  <div key={idx} className="creator-chip">
                    <div className="chip-avatar">
                      {c.creatorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="chip-info">
                      <span className="chip-name">{c.creatorName}</span>
                      <span className="chip-handle">{c.creatorHandle}</span>
                    </div>
                  </div>
                ))}
                {creatorsToAdd.length > 5 && (
                  <div className="creator-chip more">
                    +{creatorsToAdd.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campaign Selection */}
          <div className="pipeline-campaign-select">
            <label>Select Campaign</label>
            {loadingCampaigns ? (
              <div className="loading-campaigns">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="no-campaigns">
                <i className="fa-solid fa-folder-open"></i>
                <p>No active campaigns found</p>
                <a href="/campaigns/create" className="btn btn-primary btn-sm">
                  Create Campaign
                </a>
              </div>
            ) : (
              <div className="campaign-list">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id || campaign._id}
                    className={`campaign-option ${selectedCampaignId === (campaign.id || campaign._id) ? 'selected' : ''}`}
                    onClick={() => setSelectedCampaignId(campaign.id || campaign._id || '')}
                  >
                    <div className="campaign-radio">
                      {selectedCampaignId === (campaign.id || campaign._id) ? (
                        <i className="fa-solid fa-circle-check"></i>
                      ) : (
                        <i className="fa-regular fa-circle"></i>
                      )}
                    </div>
                    <div className="campaign-info">
                      <span className="campaign-name">{campaign.name}</span>
                      <span className={`campaign-status status-${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.budget && (
                      <span className="campaign-budget">
                        ${campaign.budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pipeline Steps Info */}
          <div className="pipeline-info">
            <h4><i className="fa-solid fa-info-circle"></i> What happens next?</h4>
            <div className="pipeline-steps-mini">
              <div className="step-mini">
                <span className="step-num">1</span>
                <span>Added to Outreach Queue</span>
              </div>
              <div className="step-arrow"><i className="fa-solid fa-arrow-right"></i></div>
              <div className="step-mini">
                <span className="step-num">2</span>
                <span>AI Drafts Email</span>
              </div>
              <div className="step-arrow"><i className="fa-solid fa-arrow-right"></i></div>
              <div className="step-mini">
                <span className="step-num">3</span>
                <span>Review & Send</span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <i className="fa-solid fa-check-circle"></i>
              {success}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAddToPipeline}
            disabled={loading || loadingCampaigns || campaigns.length === 0 || creatorsToAdd.length === 0}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Adding...
              </>
            ) : (
              <>
                <i className="fa-solid fa-plus"></i>
                Add {creatorsToAdd.length > 0 ? `${creatorsToAdd.length} ` : ''}to Pipeline
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
          padding: 20px;
        }

        .modal-content.pipeline-modal {
          background: var(--bg-elevated);
          border-radius: 16px;
          width: 100%;
          max-width: 540px;
          max-height: calc(100vh - 40px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid var(--border-color);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .modal-header h2 i {
          color: #667eea;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 18px;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-hover);
          flex-shrink: 0;
        }

        /* Creator Discovery Styles */
        .creator-discovery-section {
          margin-bottom: 24px;
        }

        .creator-discovery-section label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .creator-discovery-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .creator-search {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .creator-search i {
          color: var(--text-muted);
          font-size: 14px;
        }

        .creator-search input {
          flex: 1;
          border: none;
          background: none;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
        }

        .creator-search input::placeholder {
          color: var(--text-muted);
        }

        .creator-actions .btn-text {
          background: none;
          border: none;
          color: #667eea;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 6px 12px;
        }

        .creator-actions .btn-text:hover {
          text-decoration: underline;
        }

        .creator-discovery-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-card);
        }

        .loading-creators, .no-creators-found {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
        }

        .loading-creators i, .no-creators-found i {
          font-size: 24px;
          margin-bottom: 8px;
          display: block;
        }

        .creator-discovery-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s;
        }

        .creator-discovery-item:last-child {
          border-bottom: none;
        }

        .creator-discovery-item:hover {
          background: var(--bg-hover);
        }

        .creator-discovery-item.selected {
          background: rgba(102, 126, 234, 0.15);
        }

        .creator-checkbox {
          font-size: 18px;
          color: var(--text-muted);
        }

        .creator-discovery-item.selected .creator-checkbox {
          color: #667eea;
        }

        .creator-avatar-mini {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }

        .creator-info-mini {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .creator-name-mini {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .creator-handle-mini {
          font-size: 11px;
          color: var(--text-muted);
        }

        .creator-meta-mini {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .creator-followers-mini {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .creator-platform-mini {
          font-size: 14px;
          color: #667eea;
        }

        .creator-score-mini .score {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .creator-score-mini .score.high {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .creator-score-mini .score.medium {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .creator-score-mini .score.low {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .pipeline-creators-preview {
          margin-bottom: 24px;
        }

        .pipeline-creators-preview label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .creators-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .creator-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-input);
          border-radius: 20px;
          border: 1px solid var(--border-color);
        }

        .creator-chip.more {
          background: var(--bg-hover);
          color: var(--text-muted);
          font-weight: 500;
        }

        .chip-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }

        .chip-info {
          display: flex;
          flex-direction: column;
        }

        .chip-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .chip-handle {
          font-size: 11px;
          color: var(--text-muted);
        }

        .pipeline-campaign-select {
          margin-bottom: 24px;
        }

        .pipeline-campaign-select label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .loading-campaigns, .no-campaigns {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
          background: var(--bg-input);
          border-radius: 12px;
        }

        .loading-campaigns i, .no-campaigns i {
          font-size: 24px;
          margin-bottom: 12px;
          display: block;
        }

        .campaign-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .campaign-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-input);
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .campaign-option:hover {
          background: var(--bg-hover);
        }

        .campaign-option.selected {
          background: rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .campaign-radio {
          font-size: 18px;
          color: var(--text-muted);
        }

        .campaign-option.selected .campaign-radio {
          color: #667eea;
        }

        .campaign-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .campaign-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .campaign-status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 500;
        }

        .campaign-status.status-active {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .campaign-status.status-draft {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .campaign-budget {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .pipeline-info {
          background: var(--bg-input);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid var(--border-color);
        }

        .pipeline-info h4 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pipeline-info h4 i {
          color: #667eea;
        }

        .pipeline-steps-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .step-mini {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .step-num {
          width: 20px;
          height: 20px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }

        .step-arrow {
          color: var(--text-muted);
          font-size: 12px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: var(--bg-elevated);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-hover);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default AddToPipelineModal;
