'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface BrandInsights {
  summary: string;
  marketPosition: string;
  brandPersonality: string[];
  targetAudience: string;
  competitiveAdvantage: string;
  growthOpportunities: string[];
  recommendedCreatorTypes: string[];
  brandVoice: string;
  keyStrengths: string[];
}

interface Company {
  _id?: string;
  uuid: string;
  companyName: string;
  location?: string;
  continent?: string;
  region?: string;
  revenue_range?: string;
  employee_range?: string;
  total_funding_amount_usd?: number;
  last_funding_date?: string;
  funding_types?: string[];
  industry?: string;
  description?: string;
}

// Editable Field Component
function EditableField({ 
  value, 
  onSave, 
  type = 'text',
  placeholder = 'Click to edit',
  className = '',
  displayValue
}: {
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'number' | 'textarea';
  placeholder?: string;
  className?: string;
  displayValue?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`editable-field editing ${className}`}>
        {type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="edit-input textarea"
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="edit-input"
            placeholder={placeholder}
          />
        )}
        <style jsx>{`
          .editable-field.editing {
            display: inline-flex;
          }
          .edit-input {
            background: rgba(102, 126, 234, 0.08);
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 6px 10px;
            font-size: inherit;
            font-weight: inherit;
            color: inherit;
            width: 100%;
            outline: none;
            transition: all 0.2s ease;
          }
          .edit-input.textarea {
            min-height: 80px;
            resize: vertical;
          }
          .edit-input:focus {
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <span 
      className={`editable-field ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {displayValue || value || placeholder}
      <svg className="edit-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      <style jsx>{`
        .editable-field {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 2px 6px;
          margin: -2px -6px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .editable-field:hover {
          background: rgba(102, 126, 234, 0.08);
        }
        .edit-icon {
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #667eea;
        }
        .editable-field:hover .edit-icon {
          opacity: 1;
        }
      `}</style>
    </span>
  );
}

// Editable List Component
function EditableList({
  items,
  onSave,
  type = 'check',
  color = '#10b981'
}: {
  items: string[];
  onSave: (items: string[]) => void;
  type?: 'check' | 'numbered' | 'pill';
  color?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(items);

  useEffect(() => {
    setEditItems(items);
  }, [items]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index] = value;
    setEditItems(newItems);
  };

  const handleAddItem = () => {
    setEditItems([...editItems, '']);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editItems.filter((_, i) => i !== index);
    setEditItems(newItems);
  };

  const handleSave = () => {
    const filteredItems = editItems.filter(item => item.trim() !== '');
    onSave(filteredItems);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="editable-list editing">
        {editItems.map((item, idx) => (
          <div key={idx} className="edit-item-row">
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              className="edit-item-input"
              placeholder={`Item ${idx + 1}`}
            />
            <button onClick={() => handleRemoveItem(idx)} className="remove-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
        <div className="edit-actions">
          <button onClick={handleAddItem} className="add-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Item
          </button>
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={() => { setEditItems(items); setIsEditing(false); }} className="cancel-btn">Cancel</button>
        </div>
        <style jsx>{`
          .editable-list.editing {
            background: rgba(102, 126, 234, 0.04);
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 12px;
          }
          .edit-item-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }
          .edit-item-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid rgba(102, 126, 234, 0.2);
            border-radius: 8px;
            font-size: 13px;
            outline: none;
          }
          .edit-item-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .remove-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }
          .remove-btn:hover {
            background: rgba(239, 68, 68, 0.2);
          }
          .edit-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          .add-btn, .save-btn, .cancel-btn {
            padding: 8px 14px;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
          }
          .add-btn {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }
          .save-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .cancel-btn {
            background: rgba(0, 0, 0, 0.05);
            color: #666;
          }
          .add-btn:hover, .save-btn:hover, .cancel-btn:hover {
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="editable-list" onClick={() => setIsEditing(true)} title="Click to edit">
      {type === 'pill' && (
        <div className="personality-pills">
          {items.map((item, idx) => (
            <span key={idx} className="pill pill-pink">{item}</span>
          ))}
        </div>
      )}
      {type === 'check' && (
        <ul className="check-list">
          {items.map((item, idx) => (
            <li key={idx}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {type === 'numbered' && (
        <ul className="numbered-list">
          {items.map((item, idx) => (
            <li key={idx}>
              <span className="number">{idx + 1}</span>
              <span className="text">{item}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="edit-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Click to edit
      </div>
      <style jsx>{`
        .editable-list {
          cursor: pointer;
          position: relative;
          padding: 4px;
          margin: -4px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .editable-list:hover {
          background: rgba(102, 126, 234, 0.04);
        }
        .edit-hint {
          display: none;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #667eea;
          margin-top: 8px;
        }
        .editable-list:hover .edit-hint {
          display: flex;
        }
        .personality-pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .pill { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .pill-pink { background: linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(219,39,119,0.1) 100%); color: #db2777; }
        .check-list, .numbered-list { list-style: none; padding: 0; margin: 0; }
        .check-list li, .numbered-list li { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; font-size: 13px; color: #4a4a6a; }
        .numbered-list .number { width: 20px; height: 20px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
      `}</style>
    </div>
  );
}

export function CompanyInfoSection() {
  const { user, token } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [insights, setInsights] = useState<BrandInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!user?.company) {
        setCompany({
          uuid: 'demo',
          companyName: user?.company || 'Your Company',
          industry: 'Technology',
          location: 'Bangalore, India',
          continent: 'North America',
          employee_range: '51-100',
          revenue_range: '$1M-$10M',
          total_funding_amount_usd: 5000000,
          last_funding_date: '2024-01',
          funding_types: ['Seed', 'Series A'],
        });
        setInsights(getDemoInsights());
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/company?name=${encodeURIComponent(user.company)}&insights=true`);
        const data = await res.json();

        if (data.success && data.company) {
          setCompany(data.company);
          setInsights(data.insights);
        } else {
          setCompany({
            uuid: 'user-company',
            companyName: user.company,
            industry: 'Technology',
            location: 'United States',
          });
          setInsights(getDemoInsights());
        }
      } catch (err) {
        console.error('Failed to fetch company:', err);
        setInsights(getDemoInsights());
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [user]);

  const getDemoInsights = (): BrandInsights => ({
    summary: 'A forward-thinking company positioned for significant growth in the digital marketplace. With a focus on innovation and customer satisfaction, the brand is building a strong foundation for long-term success.',
    marketPosition: 'Growth Stage Innovator',
    brandPersonality: ['Innovative', 'Authentic', 'Customer-Focused', 'Agile', 'Trustworthy'],
    targetAudience: 'Tech-savvy professionals and businesses seeking innovative solutions, ages 25-45, who value quality and efficiency.',
    competitiveAdvantage: 'Unique combination of cutting-edge technology and personalized service that sets the brand apart in a competitive market.',
    growthOpportunities: [
      'Expand strategic influencer partnerships',
      'Leverage micro-influencers for authentic reach',
      'Build ambassador program for brand advocacy',
      'Explore emerging content platforms'
    ],
    recommendedCreatorTypes: [
      'Industry Thought Leaders',
      'Tech Reviewers',
      'Business Influencers',
      'Lifestyle Creators',
      'Micro-Influencers'
    ],
    brandVoice: 'Professional yet approachable, innovative without being intimidating, and focused on delivering genuine value.',
    keyStrengths: [
      'Strong market positioning',
      'Innovative product offering',
      'Customer-centric approach',
      'Scalable business model'
    ]
  });

  const saveToDatabase = async (updates: Partial<Company>) => {
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          companyName: company?.companyName,
          ...updates
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setCompany(prev => prev ? { ...prev, ...updates } : null);
        setSaveMessage({ type: 'success', text: 'Saved successfully!' });
        setTimeout(() => setSaveMessage(null), 2000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveMessage({ type: 'error', text: 'Failed to save. Please try again.' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const saveInsightsToDatabase = async (updates: Partial<BrandInsights>) => {
    setInsights(prev => prev ? { ...prev, ...updates } : null);
    // Insights are regenerated by AI, but we can store customizations
    // For now, just update local state. In production, you'd save to brandInsights field
  };

  const updateCompanyField = (field: keyof Company, value: string | number | string[]) => {
    saveToDatabase({ [field]: value });
  };

  const formatFunding = (amount?: number) => {
    if (!amount) return 'Private';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const parseFunding = (value: string): number => {
    const num = parseFloat(value.replace(/[$,]/g, ''));
    if (value.toLowerCase().includes('b')) return num * 1000000000;
    if (value.toLowerCase().includes('m')) return num * 1000000;
    if (value.toLowerCase().includes('k')) return num * 1000;
    return num || 0;
  };

  if (loading) {
    return (
      <div ref={sectionRef} className="company-section">
        <div className="loading-grid">
          <div className="shimmer-card large"></div>
          <div className="shimmer-card"></div>
          <div className="shimmer-card"></div>
          <div className="shimmer-card"></div>
          <div className="shimmer-card"></div>
          <div className="shimmer-card"></div>
          <div className="shimmer-card"></div>
        </div>
        <style jsx>{`
          .company-section { padding: 0; }
          .loading-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .shimmer-card { height: 180px; background: linear-gradient(110deg, #f0f4ff 8%, #e8eeff 18%, #f0f4ff 33%); background-size: 200% 100%; animation: shimmer 1.5s linear infinite; border-radius: 16px; }
          .shimmer-card.large { grid-column: span 3; height: 120px; }
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={`company-section ${isVisible ? 'visible' : ''}`}>
      {/* Save Status Indicator */}
      {(saving || saveMessage) && (
        <div className={`save-indicator ${saveMessage?.type || 'saving'}`}>
          {saving ? (
            <>
              <div className="spinner"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              {saveMessage?.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              )}
              <span>{saveMessage?.text}</span>
            </>
          )}
        </div>
      )}

      {/* Section Header */}
      <div className="section-header">
        <div className="header-left">
          <div className="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h2 className="section-title">Brand Intelligence</h2>
            <p className="section-subtitle">AI-powered insights for {company?.companyName || 'your brand'}</p>
          </div>
        </div>
        <div className="ai-powered-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span>AI Powered • Editable</span>
        </div>
      </div>

      {/* Company Hero */}
      <div className="hero-card">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="company-avatar">
            <span>{company?.companyName?.charAt(0) || 'C'}</span>
          </div>
          <div className="company-info">
            <h1 className="company-name">
              <EditableField 
                value={company?.companyName || ''} 
                onSave={(v) => updateCompanyField('companyName', v)}
                placeholder="Company Name"
              />
            </h1>
            <div className="company-tags">
              <span className="tag tag-industry">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <EditableField 
                  value={company?.industry || ''} 
                  onSave={(v) => updateCompanyField('industry', v)}
                  placeholder="Industry"
                />
              </span>
              <span className="tag tag-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <EditableField 
                  value={company?.location || ''} 
                  onSave={(v) => updateCompanyField('location', v)}
                  placeholder="Location"
                />
              </span>
              {insights?.marketPosition && (
                <span className="tag tag-position">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  <EditableField 
                    value={insights.marketPosition} 
                    onSave={(v) => saveInsightsToDatabase({ marketPosition: v })}
                    placeholder="Market Position"
                  />
                </span>
              )}
            </div>
          </div>
          <div className="hero-metrics">
            <div className="metric">
              <span className="metric-value">
                <EditableField 
                  value={company?.employee_range || ''} 
                  onSave={(v) => updateCompanyField('employee_range', v)}
                  placeholder="N/A"
                />
              </span>
              <span className="metric-label">Team Size</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric">
              <span className="metric-value">
                <EditableField 
                  value={formatFunding(company?.total_funding_amount_usd)} 
                  onSave={(v) => updateCompanyField('total_funding_amount_usd', parseFunding(v))}
                  placeholder="Private"
                  displayValue={formatFunding(company?.total_funding_amount_usd)}
                />
              </span>
              <span className="metric-label">Raised</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric">
              <span className="metric-value">
                <EditableField 
                  value={company?.revenue_range || ''} 
                  onSave={(v) => updateCompanyField('revenue_range', v)}
                  placeholder="Private"
                />
              </span>
              <span className="metric-label">Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Card */}
      <div className="summary-card">
        <div className="summary-header">
          <div className="summary-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span>Brand Analysis</span>
        </div>
        <p className="summary-text">
          <EditableField 
            value={insights?.summary || ''} 
            onSave={(v) => saveInsightsToDatabase({ summary: v })}
            placeholder="Brand summary..."
            type="textarea"
          />
        </p>
        <div className="voice-section">
          <span className="voice-label">Brand Voice</span>
          <p className="voice-text">
            <EditableField 
              value={insights?.brandVoice || ''} 
              onSave={(v) => saveInsightsToDatabase({ brandVoice: v })}
              placeholder="Describe your brand voice..."
              type="textarea"
            />
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="insights-grid">
        {/* Brand Personality */}
        <div className="insight-card">
          <div className="card-icon icon-pink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3 className="card-title">Brand Personality</h3>
          <EditableList 
            items={insights?.brandPersonality || []} 
            onSave={(items) => saveInsightsToDatabase({ brandPersonality: items })}
            type="pill"
          />
        </div>

        {/* Target Audience */}
        <div className="insight-card">
          <div className="card-icon icon-cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 className="card-title">Target Audience</h3>
          <p className="card-description">
            <EditableField 
              value={insights?.targetAudience || ''} 
              onSave={(v) => saveInsightsToDatabase({ targetAudience: v })}
              placeholder="Describe target audience..."
              type="textarea"
            />
          </p>
        </div>

        {/* Competitive Edge */}
        <div className="insight-card">
          <div className="card-icon icon-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7"/>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
          </div>
          <h3 className="card-title">Competitive Edge</h3>
          <p className="card-description">
            <EditableField 
              value={insights?.competitiveAdvantage || ''} 
              onSave={(v) => saveInsightsToDatabase({ competitiveAdvantage: v })}
              placeholder="What makes you unique..."
              type="textarea"
            />
          </p>
        </div>

        {/* Key Strengths */}
        <div className="insight-card">
          <div className="card-icon icon-emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h3 className="card-title">Key Strengths</h3>
          <EditableList 
            items={insights?.keyStrengths || []} 
            onSave={(items) => saveInsightsToDatabase({ keyStrengths: items })}
            type="check"
            color="#10b981"
          />
        </div>

        {/* Growth Opportunities */}
        <div className="insight-card">
          <div className="card-icon icon-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h3 className="card-title">Growth Opportunities</h3>
          <EditableList 
            items={insights?.growthOpportunities || []} 
            onSave={(items) => saveInsightsToDatabase({ growthOpportunities: items })}
            type="numbered"
          />
        </div>

        {/* Ideal Creator Types */}
        <div className="insight-card">
          <div className="card-icon icon-coral">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h3 className="card-title">Ideal Creator Types</h3>
          <EditableList 
            items={insights?.recommendedCreatorTypes || []} 
            onSave={(items) => saveInsightsToDatabase({ recommendedCreatorTypes: items })}
            type="check"
            color="#ef4444"
          />
        </div>
      </div>

      {/* Funding Timeline */}
      <div className="funding-section">
        <div className="funding-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Funding Journey</span>
        </div>
        <EditableList 
          items={company?.funding_types || ['Seed']} 
          onSave={(items) => updateCompanyField('funding_types', items)}
          type="pill"
        />
        <div className="funding-date-edit">
          <span className="date-label">Last funding:</span>
          <EditableField 
            value={company?.last_funding_date || ''} 
            onSave={(v) => updateCompanyField('last_funding_date', v)}
            placeholder="YYYY-MM"
          />
        </div>
      </div>

      <style jsx>{`
        .company-section {
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .company-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Save Indicator */
        .save-indicator {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          z-index: 1000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.3s ease;
        }
        .save-indicator.saving {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .save-indicator.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .save-indicator.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Section Header */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .section-subtitle {
          font-size: 13px;
          color: #8b8b9e;
          margin: 2px 0 0 0;
        }
        .ai-powered-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        /* Hero Card */
        .hero-card {
          position: relative;
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          border: 1px solid rgba(102, 126, 234, 0.12);
          box-shadow: 0 4px 24px rgba(102, 126, 234, 0.08);
          overflow: hidden;
        }
        .hero-bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea);
          background-size: 300% 100%;
          animation: gradientShift 8s ease infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .hero-content {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .company-avatar {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }
        .company-info {
          flex: 1;
          min-width: 200px;
        }
        .company-name {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 10px 0;
        }
        .company-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }
        .tag-industry {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }
        .tag-location {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .tag-position {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
        .hero-metrics {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          background: linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%);
          border-radius: 14px;
          margin-left: auto;
        }
        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 70px;
        }
        .metric-value {
          font-size: 16px;
          font-weight: 700;
          color: #667eea;
        }
        .metric-label {
          font-size: 11px;
          color: #8b8b9e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        .metric-divider {
          width: 1px;
          height: 32px;
          background: linear-gradient(180deg, transparent, rgba(102,126,234,0.2), transparent);
        }

        /* Summary Card */
        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          color: white;
        }
        .summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .summary-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .summary-header span {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.95;
        }
        .summary-text {
          font-size: 15px;
          line-height: 1.65;
          margin: 0 0 16px 0;
          opacity: 0.95;
        }
        .voice-section {
          background: rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 14px 16px;
        }
        .voice-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.8;
          display: block;
          margin-bottom: 6px;
        }
        .voice-text {
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          opacity: 0.92;
        }

        /* Insights Grid */
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 1024px) {
          .insights-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .insights-grid { grid-template-columns: 1fr; }
        }

        .insight-card {
          background: linear-gradient(145deg, #ffffff 0%, #fafbff 100%);
          border-radius: 20px;
          padding: 22px;
          border: 1px solid rgba(102, 126, 234, 0.08);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .insight-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--card-accent, #667eea), var(--card-accent-end, #764ba2));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .insight-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          border-color: rgba(102, 126, 234, 0.12);
        }
        .insight-card:hover::before {
          opacity: 1;
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          position: relative;
          transition: all 0.3s ease;
        }
        .insight-card:hover .card-icon {
          transform: scale(1.08) rotate(-2deg);
        }
        .icon-pink {
          background: linear-gradient(145deg, #ec4899 0%, #db2777 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        .icon-cyan {
          background: linear-gradient(145deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        .icon-orange {
          background: linear-gradient(145deg, #f97316 0%, #ea580c 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        .icon-emerald {
          background: linear-gradient(145deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        .icon-green {
          background: linear-gradient(145deg, #22c55e 0%, #16a34a 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        .icon-coral {
          background: linear-gradient(145deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 12px 0;
        }
        .card-description {
          font-size: 13px;
          line-height: 1.6;
          color: #5a5a7a;
          margin: 0;
        }

        /* Funding Section */
        .funding-section {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .funding-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 14px;
        }
        .funding-header svg {
          color: #f59e0b;
        }
        .funding-date-edit {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          font-size: 12px;
          color: #8b8b9e;
        }
        .date-label {
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-metrics {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
