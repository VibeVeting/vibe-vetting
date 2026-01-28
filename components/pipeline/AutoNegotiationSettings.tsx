"use client";

import { useState, useEffect } from 'react';

interface NegotiationSettings {
  enabled: boolean;
  minBudget: number;
  maxBudget: number;
  targetBudget: number;
  maxRounds: number;
  autoAcceptThreshold: number;
  incrementPercentage: number;
  strategy: 'aggressive' | 'balanced' | 'generous';
  considerEngagement: boolean;
  considerFollowers: boolean;
  autoDeclineAbove: number;
}

interface AutoNegotiationSettingsProps {
  campaignId: string;
  onSettingsChange?: (settings: NegotiationSettings) => void;
}

const defaultSettings: NegotiationSettings = {
  enabled: false,
  minBudget: 500,
  maxBudget: 5000,
  targetBudget: 2000,
  maxRounds: 3,
  autoAcceptThreshold: 15,
  incrementPercentage: 15,
  strategy: 'balanced',
  considerEngagement: true,
  considerFollowers: true,
  autoDeclineAbove: 10000,
};

export function AutoNegotiationSettings({ campaignId, onSettingsChange }: AutoNegotiationSettingsProps) {
  const [settings, setSettings] = useState<NegotiationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [campaignId]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'get_settings',
          campaignId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_settings',
          campaignId,
          data: { settings },
        }),
      });

      if (response.ok) {
        setSuccess('Settings saved successfully!');
        if (onSettingsChange) {
          onSettingsChange(settings);
        }
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    const newEnabled = !settings.enabled;
    setSettings({ ...settings, enabled: newEnabled });

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: newEnabled ? 'enable' : 'disable',
          campaignId,
        }),
      });
    } catch (err) {
      console.error('Error toggling auto-negotiation:', err);
    }
  };

  if (loading) {
    return (
      <div className="auto-negotiate-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="auto-negotiate-settings">
      {/* Header with Toggle */}
      <div className="settings-header">
        <div className="header-left">
          <div className="header-icon">
            <i className="fa-solid fa-robot"></i>
          </div>
          <div className="header-text">
            <h3>Auto-Negotiation</h3>
            <p>AI-powered automatic price negotiation with creators</p>
          </div>
        </div>
        <div className="toggle-switch" onClick={handleToggle}>
          <input type="checkbox" checked={settings.enabled} readOnly />
          <span className="slider"></span>
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Strategy Selection */}
          <div className="settings-section">
            <h4><i className="fa-solid fa-chess"></i> Negotiation Strategy</h4>
            <div className="strategy-options">
              <div 
                className={`strategy-card ${settings.strategy === 'aggressive' ? 'selected' : ''}`}
                onClick={() => setSettings({ ...settings, strategy: 'aggressive' })}
              >
                <div className="strategy-icon aggressive">
                  <i className="fa-solid fa-fire"></i>
                </div>
                <h5>Aggressive</h5>
                <p>Small increments, stay closer to initial offer</p>
              </div>
              <div 
                className={`strategy-card ${settings.strategy === 'balanced' ? 'selected' : ''}`}
                onClick={() => setSettings({ ...settings, strategy: 'balanced' })}
              >
                <div className="strategy-icon balanced">
                  <i className="fa-solid fa-balance-scale"></i>
                </div>
                <h5>Balanced</h5>
                <p>Meet in the middle approach</p>
              </div>
              <div 
                className={`strategy-card ${settings.strategy === 'generous' ? 'selected' : ''}`}
                onClick={() => setSettings({ ...settings, strategy: 'generous' })}
              >
                <div className="strategy-icon generous">
                  <i className="fa-solid fa-heart"></i>
                </div>
                <h5>Generous</h5>
                <p>Move toward creator ask faster</p>
              </div>
            </div>
          </div>

          {/* Budget Settings */}
          <div className="settings-section">
            <h4><i className="fa-solid fa-wallet"></i> Budget Parameters</h4>
            <div className="settings-grid">
              <div className="setting-item">
                <label>
                  Target Budget
                  <span className="tooltip">
                    <i className="fa-solid fa-info-circle"></i>
                    <span className="tooltip-text">Ideal price to aim for in negotiations</span>
                  </span>
                </label>
                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    type="number"
                    value={settings.targetBudget}
                    onChange={(e) => setSettings({ ...settings, targetBudget: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="setting-item">
                <label>Minimum Budget</label>
                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    type="number"
                    value={settings.minBudget}
                    onChange={(e) => setSettings({ ...settings, minBudget: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="setting-item">
                <label>Maximum Budget</label>
                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    type="number"
                    value={settings.maxBudget}
                    onChange={(e) => setSettings({ ...settings, maxBudget: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="setting-item">
                <label>
                  Auto-Decline Above
                  <span className="tooltip">
                    <i className="fa-solid fa-info-circle"></i>
                    <span className="tooltip-text">Automatically decline if creator asks above this amount</span>
                  </span>
                </label>
                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    type="number"
                    value={settings.autoDeclineAbove}
                    onChange={(e) => setSettings({ ...settings, autoDeclineAbove: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="settings-section">
            <h4><i className="fa-solid fa-gears"></i> Automation Rules</h4>
            <div className="settings-grid">
              <div className="setting-item">
                <label>
                  Auto-Accept Threshold
                  <span className="tooltip">
                    <i className="fa-solid fa-info-circle"></i>
                    <span className="tooltip-text">Auto-accept if creator ask is within this % of target</span>
                  </span>
                </label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    value={settings.autoAcceptThreshold}
                    onChange={(e) => setSettings({ ...settings, autoAcceptThreshold: parseInt(e.target.value) || 0 })}
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="setting-item">
                <label>
                  Increment Per Round
                  <span className="tooltip">
                    <i className="fa-solid fa-info-circle"></i>
                    <span className="tooltip-text">How much to increase offer each negotiation round</span>
                  </span>
                </label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    value={settings.incrementPercentage}
                    onChange={(e) => setSettings({ ...settings, incrementPercentage: parseInt(e.target.value) || 0 })}
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="setting-item">
                <label>
                  Maximum Rounds
                  <span className="tooltip">
                    <i className="fa-solid fa-info-circle"></i>
                    <span className="tooltip-text">After this many rounds, escalate for manual review</span>
                  </span>
                </label>
                <input
                  type="number"
                  value={settings.maxRounds}
                  onChange={(e) => setSettings({ ...settings, maxRounds: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Smart Adjustments */}
          <div className="settings-section">
            <h4><i className="fa-solid fa-brain"></i> Smart Adjustments</h4>
            <div className="toggle-items">
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Consider Engagement Rate</span>
                  <span className="toggle-description">Adjust offers based on creator's engagement quality</span>
                </div>
                <div className="toggle-switch small" onClick={() => setSettings({ ...settings, considerEngagement: !settings.considerEngagement })}>
                  <input type="checkbox" checked={settings.considerEngagement} readOnly />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Consider Follower Count</span>
                  <span className="toggle-description">Adjust offers based on audience size</span>
                </div>
                <div className="toggle-switch small" onClick={() => setSettings({ ...settings, considerFollowers: !settings.considerFollowers })}>
                  <input type="checkbox" checked={settings.considerFollowers} readOnly />
                  <span className="slider"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Preview */}
          <div className="budget-preview">
            <h4><i className="fa-solid fa-chart-line"></i> Budget Range Preview</h4>
            <div className="budget-bar">
              <div className="budget-labels">
                <span>${settings.minBudget.toLocaleString()}</span>
                <span className="target">${settings.targetBudget.toLocaleString()}</span>
                <span>${settings.maxBudget.toLocaleString()}</span>
              </div>
              <div className="budget-track">
                <div 
                  className="budget-target" 
                  style={{ 
                    left: `${((settings.targetBudget - settings.minBudget) / (settings.maxBudget - settings.minBudget)) * 100}%` 
                  }}
                />
                <div 
                  className="budget-accept-zone" 
                  style={{ 
                    left: `${((settings.targetBudget - settings.minBudget) / (settings.maxBudget - settings.minBudget)) * 100}%`,
                    width: `${(settings.autoAcceptThreshold / 100) * ((settings.maxBudget - settings.minBudget) / (settings.maxBudget - settings.minBudget)) * 100}%`,
                  }}
                />
              </div>
              <div className="budget-legend">
                <span><span className="dot green"></span> Auto-accept zone</span>
                <span><span className="dot blue"></span> Negotiation range</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
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

          {/* Save Button */}
          <div className="settings-footer">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </>
      )}

      {!settings.enabled && (
        <div className="disabled-message">
          <i className="fa-solid fa-toggle-off"></i>
          <h4>Auto-Negotiation is Disabled</h4>
          <p>Enable auto-negotiation to let AI handle price discussions with creators automatically.</p>
          <ul>
            <li><i className="fa-solid fa-check"></i> Automatic response analysis</li>
            <li><i className="fa-solid fa-check"></i> Smart counter-offers</li>
            <li><i className="fa-solid fa-check"></i> Budget-aware decisions</li>
            <li><i className="fa-solid fa-check"></i> 24/7 negotiation</li>
          </ul>
        </div>
      )}

      <style jsx>{`
        .auto-negotiate-settings {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .auto-negotiate-loading {
          padding: 40px;
          text-align: center;
          color: #718096;
        }

        .auto-negotiate-loading i {
          margin-right: 8px;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .header-text h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .header-text p {
          margin: 4px 0 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .toggle-switch {
          position: relative;
          width: 52px;
          height: 28px;
          cursor: pointer;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-switch .slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 28px;
          transition: 0.3s;
        }

        .toggle-switch .slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle-switch input:checked + .slider {
          background-color: #22c55e;
        }

        .toggle-switch input:checked + .slider:before {
          transform: translateX(24px);
        }

        .toggle-switch.small {
          width: 44px;
          height: 24px;
        }

        .toggle-switch.small .slider:before {
          height: 18px;
          width: 18px;
        }

        .toggle-switch.small input:checked + .slider:before {
          transform: translateX(20px);
        }

        .settings-section {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .settings-section h4 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .settings-section h4 i {
          color: #667eea;
        }

        .strategy-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .strategy-card {
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .strategy-card:hover {
          border-color: #667eea;
          background: #f7fafc;
        }

        .strategy-card.selected {
          border-color: #667eea;
          background: #ebf4ff;
        }

        .strategy-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .strategy-icon.aggressive {
          background: #fed7d7;
          color: #c53030;
        }

        .strategy-icon.balanced {
          background: #c6f6d5;
          color: #22543d;
        }

        .strategy-icon.generous {
          background: #feebc8;
          color: #744210;
        }

        .strategy-card h5 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
        }

        .strategy-card p {
          margin: 0;
          font-size: 12px;
          color: #718096;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-item label {
          font-size: 13px;
          font-weight: 500;
          color: #4a5568;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tooltip {
          position: relative;
          color: #a0aec0;
          cursor: help;
        }

        .tooltip-text {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1a202c;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 400;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }

        .tooltip:hover .tooltip-text {
          opacity: 1;
        }

        .input-with-prefix, .input-with-suffix {
          display: flex;
          align-items: center;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .input-with-prefix span, .input-with-suffix span {
          padding: 10px 12px;
          background: #f7fafc;
          color: #718096;
          font-weight: 500;
        }

        .input-with-prefix input, .input-with-suffix input {
          flex: 1;
          border: none;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }

        .setting-item > input {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }

        .setting-item > input:focus,
        .input-with-prefix:focus-within,
        .input-with-suffix:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .toggle-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f7fafc;
          border-radius: 10px;
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
        }

        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: #1a202c;
        }

        .toggle-description {
          font-size: 12px;
          color: #718096;
        }

        .budget-preview {
          padding: 24px;
          background: #f7fafc;
        }

        .budget-preview h4 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .budget-bar {
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .budget-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #718096;
        }

        .budget-labels .target {
          color: #667eea;
          font-weight: 600;
        }

        .budget-track {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          position: relative;
          margin-bottom: 12px;
        }

        .budget-target {
          position: absolute;
          width: 4px;
          height: 16px;
          background: #667eea;
          border-radius: 2px;
          top: -4px;
          transform: translateX(-50%);
        }

        .budget-accept-zone {
          position: absolute;
          height: 100%;
          background: rgba(34, 197, 94, 0.3);
          border-radius: 4px;
        }

        .budget-legend {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #718096;
        }

        .budget-legend span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .budget-legend .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .budget-legend .dot.green {
          background: #22c55e;
        }

        .budget-legend .dot.blue {
          background: #667eea;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          font-size: 14px;
          margin: 0;
        }

        .alert-error {
          background: #fed7d7;
          color: #c53030;
        }

        .alert-success {
          background: #c6f6d5;
          color: #22543d;
        }

        .settings-footer {
          padding: 20px 24px;
          display: flex;
          justify-content: flex-end;
          background: #f7fafc;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
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

        .disabled-message {
          padding: 40px;
          text-align: center;
          color: #718096;
        }

        .disabled-message i {
          font-size: 48px;
          margin-bottom: 16px;
          color: #cbd5e0;
        }

        .disabled-message h4 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #4a5568;
        }

        .disabled-message p {
          margin: 0 0 24px;
        }

        .disabled-message ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: inline-flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
        }

        .disabled-message li {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #4a5568;
        }

        .disabled-message li i {
          font-size: 12px;
          color: #22c55e;
          margin: 0;
        }

        @media (max-width: 768px) {
          .strategy-options {
            grid-template-columns: 1fr;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AutoNegotiationSettings;
