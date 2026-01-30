"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const [autoFillData, setAutoFillData] = useState({
    companyName: '',
    productName: '',
    websiteUrl: '',
    customPrompt: '',
  });
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    industry: '',
    budget: '',
    // Platform & Reach
    platforms: [] as string[],
    followerRange: '',
    // Creator Matching Criteria
    engagementRate: '',
    audienceAge: [] as string[],
    audienceGender: '',
    audienceLocation: [] as string[],
    // Content Requirements
    contentType: [] as string[],
    contentStyle: '',
    postingFrequency: '',
    // Brand Safety & Quality
    minTrustScore: '',
    maxRiskLevel: '',
    brandValues: [] as string[],
    excludeCategories: [] as string[],
    // Campaign Timeline
    startDate: '',
    endDate: '',
    deliverables: '',
  });

  const handleAutoFill = async () => {
    if (!autoFillData.companyName || !autoFillData.productName) {
      alert('Please enter company name and product name');
      return;
    }

    setIsAutoFilling(true);
    try {
      const response = await fetch('/api/campaigns/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoFillData),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const data = result.data;
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          description: data.description || prev.description,
          industry: data.industry || prev.industry,
          budget: data.budget || prev.budget,
          platforms: data.platforms || prev.platforms,
          followerRange: data.followerRange || prev.followerRange,
          engagementRate: data.engagementRate || prev.engagementRate,
          audienceAge: data.audienceAge || prev.audienceAge,
          audienceGender: data.audienceGender || prev.audienceGender,
          audienceLocation: data.audienceLocation || prev.audienceLocation,
          contentType: data.contentType || prev.contentType,
          contentStyle: data.contentStyle || prev.contentStyle,
          postingFrequency: data.postingFrequency || prev.postingFrequency,
          minTrustScore: data.minTrustScore?.toString() || prev.minTrustScore,
          maxRiskLevel: data.maxRiskLevel || prev.maxRiskLevel,
          brandValues: data.brandValues || prev.brandValues,
          excludeCategories: data.excludeCategories || prev.excludeCategories,
          deliverables: data.deliverables || prev.deliverables,
        }));
      } else {
        alert(result.error || 'Failed to auto-fill campaign data');
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
      alert('Failed to connect to AI service');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a campaign name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to create a campaign');
        router.push('/login');
        return;
      }

      // Parse budget to number (e.g., "5000-10000" -> 7500 average)
      let budgetNum = 0;
      if (formData.budget) {
        if (formData.budget.includes('+')) {
          budgetNum = parseInt(formData.budget.replace(/[^0-9]/g, ''));
        } else if (formData.budget.includes('-')) {
          const parts = formData.budget.split('-');
          budgetNum = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
        }
      }

      const response = await fetch('/api/user/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: 'active',
          budget: budgetNum,
          startDate: formData.startDate || new Date().toISOString(),
          endDate: formData.endDate || null,
          // Platform & Reach
          industry: formData.industry,
          platforms: formData.platforms,
          followerRange: formData.followerRange,
          engagementRate: formData.engagementRate,
          // Audience Demographics
          audienceAge: formData.audienceAge,
          audienceGender: formData.audienceGender,
          audienceLocation: formData.audienceLocation,
          // Content Requirements
          contentType: formData.contentType,
          contentStyle: formData.contentStyle,
          postingFrequency: formData.postingFrequency,
          deliverables: formData.deliverables,
          // Brand Safety
          minTrustScore: formData.minTrustScore,
          maxRiskLevel: formData.maxRiskLevel,
          brandValues: formData.brandValues,
          excludeCategories: formData.excludeCategories,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store campaign data for the scanning page
        sessionStorage.setItem('newCampaign', JSON.stringify({
          ...formData,
          id: data.campaign?.id,
        }));
        router.push('/campaigns/scanning');
      } else {
        alert(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayToggle = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      setFormData({
        ...formData,
        [field]: currentArray.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      });
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="yc-page" ref={pageRef}>
          {/* YC Background Effects */}
          <div className="yc-page-bg">
            <div className="yc-page-orb yc-page-orb-1"></div>
            <div className="yc-page-orb yc-page-orb-2"></div>
            <div className="yc-page-grid"></div>
          </div>

          {/* YC Page Header */}
          <div className={`yc-page-header ${isVisible ? 'visible' : ''}`}>
            <div className="yc-page-header-content">
              <div className="yc-page-title-section">
                <div className="yc-page-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <i className="fa-solid fa-rocket"></i>
                </div>
                <div>
                  <h1 className="yc-page-title">Create New Campaign</h1>
                  <p className="yc-page-subtitle">Set up your influencer vetting campaign with AI-powered creator matching</p>
                </div>
              </div>
              <div className="yc-page-actions">
                <button className="yc-btn-secondary" onClick={() => router.back()}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
              </div>
            </div>
          </div>

          {/* AI Auto-Fill Box */}
          <div className="ai-autofill-card" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <i className="fa-solid fa-wand-magic" style={{ color: '#fff', fontSize: '18px' }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                  ✨ AI Auto-Fill
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  Enter your company details and let AI fill the entire form for you
                </p>
              </div>
            </div>
            
            <div className="autofill-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={autoFillData.companyName}
                  onChange={(e) => setAutoFillData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g., Nike, Apple, Spotify"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                  className="autofill-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={autoFillData.productName}
                  onChange={(e) => setAutoFillData(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="e.g., Running Shoes, iPhone 16"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                  className="autofill-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={autoFillData.websiteUrl}
                  onChange={(e) => setAutoFillData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                  className="autofill-input"
                />
              </div>
            </div>

            {/* Custom Prompt Textarea */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                Custom Instructions (optional)
              </label>
              <textarea
                value={autoFillData.customPrompt}
                onChange={(e) => setAutoFillData(prev => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="Add any specific requirements, e.g., 'Focus on Gen-Z audience in India', 'Budget-friendly micro-influencers only', 'Emphasize sustainability and eco-friendly messaging'..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                className="autofill-input"
              />
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isAutoFilling}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: isAutoFilling 
                  ? 'rgba(139, 92, 246, 0.5)' 
                  : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isAutoFilling ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isAutoFilling ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Generating with AI...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic"></i>
                  Auto-Fill with AI
                </>
              )}
            </button>
          </div>

          {/* Form Card */}
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              {/* Section 1: Basic Campaign Info */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fa-solid fa-bullseye"></i>
                  </div>
                  <div>
                    <h3>Campaign Details</h3>
                    <p>Basic information about your campaign</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Campaign Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Summer Product Launch 2025"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Industry <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      required
                    >
                      <option value="">Select industry...</option>
                      <option value="fashion">Fashion & Beauty</option>
                      <option value="tech">Technology & Gadgets</option>
                      <option value="fitness">Health & Fitness</option>
                      <option value="food">Food & Beverage</option>
                      <option value="travel">Travel & Lifestyle</option>
                      <option value="gaming">Gaming & Entertainment</option>
                      <option value="finance">Finance & Business</option>
                      <option value="education">Education & Learning</option>
                      <option value="automotive">Automotive</option>
                      <option value="home">Home & Living</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Campaign Description <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign objectives, target audience, key messages, and what you're looking for in creators..."
                    rows={4}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Budget Range <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      required
                    >
                      <option value="">Select budget range...</option>
                      <option value="500-1000">₹40,000 - ₹80,000</option>
                      <option value="1000-5000">₹80,000 - ₹4,00,000</option>
                      <option value="5000-10000">₹4,00,000 - ₹8,00,000</option>
                      <option value="10000-25000">₹8,00,000 - ₹20,00,000</option>
                      <option value="25000-50000">₹20,00,000 - ₹40,00,000</option>
                      <option value="50000-100000">₹40,00,000 - ₹80,00,000</option>
                      <option value="100000+">₹80,00,000+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Deliverables</label>
                    <select
                      className="form-input"
                      value={formData.deliverables}
                      onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                    >
                      <option value="">Select deliverables count...</option>
                      <option value="1-3">1-3 posts per creator</option>
                      <option value="4-6">4-6 posts per creator</option>
                      <option value="7-10">7-10 posts per creator</option>
                      <option value="10+">10+ posts per creator</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Platform & Reach Requirements */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fa-solid fa-globe"></i>
                  </div>
                  <div>
                    <h3>Platform & Reach Requirements</h3>
                    <p>Select platforms and audience size you want to target</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Target Platforms <span className="required">*</span>
                  </label>
                  <div className="checkbox-group">
                    {[
                      { name: 'Instagram', icon: 'fa-instagram' },
                      { name: 'YouTube', icon: 'fa-youtube' },
                      { name: 'Twitter', icon: 'fa-twitter' },
                      { name: 'LinkedIn', icon: 'fa-linkedin' },
                      { name: 'Facebook', icon: 'fa-facebook' },
                      { name: 'Twitch', icon: 'fa-twitch' },
                    ].map((platform) => (
                      <label key={platform.name} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.platforms.includes(platform.name)}
                          onChange={() => handleArrayToggle('platforms', platform.name)}
                        />
                        <i className={`fa-brands ${platform.icon}`}></i>
                        {platform.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Follower Range <span className="required">*</span>
                  </label>
                  <div className="radio-group">
                    {[
                      { value: 'nano', label: 'Nano (1K-10K)', desc: 'High engagement, niche audiences' },
                      { value: 'micro', label: 'Micro (10K-50K)', desc: 'Strong community connection' },
                      { value: 'mid', label: 'Mid-tier (50K-500K)', desc: 'Balanced reach & engagement' },
                      { value: 'macro', label: 'Macro (500K-1M)', desc: 'Wide reach, brand awareness' },
                      { value: 'mega', label: 'Mega (1M+)', desc: 'Celebrity-level influence' },
                    ].map((tier) => (
                      <label
                        key={tier.value}
                        className={`radio-option ${formData.followerRange === tier.value ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="followerRange"
                          value={tier.value}
                          checked={formData.followerRange === tier.value}
                          onChange={(e) => setFormData({ ...formData, followerRange: e.target.value })}
                        />
                        <div className="radio-content">
                          <strong>{tier.label}</strong>
                          <span>{tier.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Minimum Engagement Rate <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.engagementRate}
                    onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                    required
                  >
                    <option value="">Select minimum engagement...</option>
                    <option value="1">1%+ (Average)</option>
                    <option value="2">2%+ (Good)</option>
                    <option value="3">3%+ (Great)</option>
                    <option value="5">5%+ (Excellent)</option>
                    <option value="8">8%+ (Exceptional)</option>
                  </select>
                </div>
              </div>

              {/* Section 3: Target Audience Demographics */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <h3>Target Audience Demographics</h3>
                    <p>Define the audience you want creators to reach</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Audience Age Groups</label>
                  <div className="checkbox-group">
                    {[
                      { value: '13-17', label: 'Gen Z (13-17)' },
                      { value: '18-24', label: 'Young Adults (18-24)' },
                      { value: '25-34', label: 'Millennials (25-34)' },
                      { value: '35-44', label: 'Gen X (35-44)' },
                      { value: '45-54', label: 'Middle Age (45-54)' },
                      { value: '55+', label: 'Seniors (55+)' },
                    ].map((age) => (
                      <label key={age.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.audienceAge.includes(age.value)}
                          onChange={() => handleArrayToggle('audienceAge', age.value)}
                        />
                        {age.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Audience Gender</label>
                    <select
                      className="form-input"
                      value={formData.audienceGender}
                      onChange={(e) => setFormData({ ...formData, audienceGender: e.target.value })}
                    >
                      <option value="">Any gender...</option>
                      <option value="female">Primarily Female (60%+)</option>
                      <option value="male">Primarily Male (60%+)</option>
                      <option value="balanced">Balanced Mix</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Locations</label>
                  <div className="checkbox-group">
                    {[
                      { value: 'us', label: '🇺🇸 United States' },
                      { value: 'uk', label: '🇬🇧 United Kingdom' },
                      { value: 'ca', label: '🇨🇦 Canada' },
                      { value: 'au', label: '🇦🇺 Australia' },
                      { value: 'eu', label: '🇪🇺 Europe' },
                      { value: 'in', label: '🇮🇳 India' },
                      { value: 'latam', label: '🌎 Latin America' },
                      { value: 'global', label: '🌍 Global' },
                    ].map((loc) => (
                      <label key={loc.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.audienceLocation.includes(loc.value)}
                          onChange={() => handleArrayToggle('audienceLocation', loc.value)}
                        />
                        {loc.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Content Requirements */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fa-solid fa-video"></i>
                  </div>
                  <div>
                    <h3>Content Requirements</h3>
                    <p>Specify the type of content you need</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Content Types Needed</label>
                  <div className="checkbox-group">
                    {[
                      { value: 'posts', label: 'Static Posts', icon: 'fa-image' },
                      { value: 'stories', label: 'Stories', icon: 'fa-clock' },
                      { value: 'reels', label: 'Reels/Shorts', icon: 'fa-film' },
                      { value: 'videos', label: 'Long-form Videos', icon: 'fa-video' },
                      { value: 'live', label: 'Live Streams', icon: 'fa-broadcast-tower' },
                      { value: 'reviews', label: 'Product Reviews', icon: 'fa-star' },
                      { value: 'tutorials', label: 'Tutorials/How-to', icon: 'fa-graduation-cap' },
                      { value: 'unboxing', label: 'Unboxing', icon: 'fa-box-open' },
                    ].map((content) => (
                      <label key={content.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.contentType.includes(content.value)}
                          onChange={() => handleArrayToggle('contentType', content.value)}
                        />
                        <i className={`fa-solid ${content.icon}`}></i>
                        {content.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Content Style</label>
                    <select
                      className="form-input"
                      value={formData.contentStyle}
                      onChange={(e) => setFormData({ ...formData, contentStyle: e.target.value })}
                    >
                      <option value="">Select content style...</option>
                      <option value="polished">Polished & Professional</option>
                      <option value="authentic">Raw & Authentic</option>
                      <option value="educational">Educational & Informative</option>
                      <option value="entertaining">Fun & Entertaining</option>
                      <option value="lifestyle">Lifestyle & Aspirational</option>
                      <option value="humorous">Comedy & Humor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Posting Frequency</label>
                    <select
                      className="form-input"
                      value={formData.postingFrequency}
                      onChange={(e) => setFormData({ ...formData, postingFrequency: e.target.value })}
                    >
                      <option value="">Select frequency...</option>
                      <option value="daily">Daily posters</option>
                      <option value="3-5week">3-5 times per week</option>
                      <option value="1-2week">1-2 times per week</option>
                      <option value="weekly">Weekly</option>
                      <option value="any">Any frequency</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 5: Brand Safety & Quality */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h3>Brand Safety & Quality</h3>
                    <p>Set trust and safety requirements for creator vetting</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Minimum Trust Score <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formData.minTrustScore}
                      onChange={(e) => setFormData({ ...formData, minTrustScore: e.target.value })}
                      required
                    >
                      <option value="">Select minimum score...</option>
                      <option value="90">90%+ (Premium quality)</option>
                      <option value="80">80%+ (High quality)</option>
                      <option value="70">70%+ (Good quality)</option>
                      <option value="60">60%+ (Standard)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Maximum Risk Level <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formData.maxRiskLevel}
                      onChange={(e) => setFormData({ ...formData, maxRiskLevel: e.target.value })}
                      required
                    >
                      <option value="">Select max risk level...</option>
                      <option value="low">Low Risk Only</option>
                      <option value="medium">Medium Risk & Below</option>
                      <option value="high">Include High Risk</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand Values Alignment</label>
                  <div className="checkbox-group">
                    {[
                      { value: 'sustainability', label: '🌱 Sustainability' },
                      { value: 'diversity', label: '🌈 Diversity & Inclusion' },
                      { value: 'authenticity', label: '✨ Authenticity' },
                      { value: 'innovation', label: '🚀 Innovation' },
                      { value: 'family', label: '👨‍👩‍👧‍👦 Family-friendly' },
                      { value: 'luxury', label: '💎 Luxury & Premium' },
                      { value: 'health', label: '💪 Health & Wellness' },
                      { value: 'community', label: '🤝 Community Focus' },
                    ].map((value) => (
                      <label key={value.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.brandValues.includes(value.value)}
                          onChange={() => handleArrayToggle('brandValues', value.value)}
                        />
                        {value.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Exclude Creators Who Post About</label>
                  <div className="checkbox-group">
                    {[
                      { value: 'politics', label: '🏛️ Politics' },
                      { value: 'controversy', label: '⚠️ Controversial Topics' },
                      { value: 'adult', label: '🔞 Adult Content' },
                      { value: 'gambling', label: '🎰 Gambling' },
                      { value: 'alcohol', label: '🍺 Alcohol' },
                      { value: 'tobacco', label: '🚬 Tobacco/Vaping' },
                      { value: 'competitors', label: '🏢 Competitor Brands' },
                      { value: 'crypto', label: '₿ Crypto/NFTs' },
                    ].map((cat) => (
                      <label key={cat.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.excludeCategories.includes(cat.value)}
                          onChange={() => handleArrayToggle('excludeCategories', cat.value)}
                        />
                        {cat.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 6: Campaign Timeline */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fa-solid fa-calendar"></i>
                  </div>
                  <div>
                    <h3>Campaign Timeline</h3>
                    <p>Set the duration for your campaign</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" onClick={() => router.back()} className="btn btn-secondary" disabled={isSubmitting}>
                  <i className="fa-solid fa-arrow-left"></i>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-rocket"></i>
                      Find Matching Creators
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
