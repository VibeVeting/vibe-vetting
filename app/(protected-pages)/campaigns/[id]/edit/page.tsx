"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    industry: '',
    budget: '',
    status: 'active' as 'active' | 'completed' | 'draft',
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

  // Fetch existing campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/user/campaigns?id=${campaignId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Campaign not found');
          } else if (response.status === 401) {
            router.push('/login');
            return;
          } else {
            setError('Failed to load campaign');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        const campaign = data.campaign;

        // Convert budget to string for the select element
        const budgetValue = getBudgetRangeFromNumber(campaign.budget);

        setFormData({
          name: campaign.name || '',
          description: campaign.description || '',
          industry: campaign.industry || '',
          budget: budgetValue,
          status: campaign.status || 'draft',
          platforms: campaign.platforms || [],
          followerRange: campaign.followerRange || '',
          engagementRate: campaign.engagementRate || '',
          audienceAge: campaign.audienceAge || [],
          audienceGender: campaign.audienceGender || '',
          audienceLocation: campaign.audienceLocation || [],
          contentType: campaign.contentType || [],
          contentStyle: campaign.contentStyle || '',
          postingFrequency: campaign.postingFrequency || '',
          minTrustScore: campaign.minTrustScore || '',
          maxRiskLevel: campaign.maxRiskLevel || '',
          brandValues: campaign.brandValues || [],
          excludeCategories: campaign.excludeCategories || [],
          startDate: campaign.startDate ? formatDateForInput(campaign.startDate) : '',
          endDate: campaign.endDate ? formatDateForInput(campaign.endDate) : '',
          deliverables: campaign.deliverables || '',
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign');
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, router]);

  // Helper to format date for input[type="date"]
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper to convert numeric budget to range string
  const getBudgetRangeFromNumber = (budget: number): string => {
    if (!budget || budget === 0) return '';
    if (budget >= 100000) return '100000+';
    if (budget >= 50000) return '50000-100000';
    if (budget >= 25000) return '25000-50000';
    if (budget >= 10000) return '10000-25000';
    if (budget >= 5000) return '5000-10000';
    if (budget >= 1000) return '1000-5000';
    return '500-1000';
  };

  // Helper to convert budget range to number
  const parseBudgetToNumber = (budgetRange: string): number => {
    if (!budgetRange) return 0;
    if (budgetRange.includes('+')) {
      return parseInt(budgetRange.replace(/[^0-9]/g, ''));
    }
    if (budgetRange.includes('-')) {
      const parts = budgetRange.split('-');
      return (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    return 0;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to update campaign');
        router.push('/login');
        return;
      }

      const budgetNum = parseBudgetToNumber(formData.budget);

      const response = await fetch('/api/user/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: campaignId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          status: formData.status,
          budget: budgetNum,
          industry: formData.industry,
          platforms: formData.platforms,
          followerRange: formData.followerRange,
          engagementRate: formData.engagementRate,
          audienceAge: formData.audienceAge,
          audienceGender: formData.audienceGender,
          audienceLocation: formData.audienceLocation,
          contentType: formData.contentType,
          contentStyle: formData.contentStyle,
          postingFrequency: formData.postingFrequency,
          deliverables: formData.deliverables,
          minTrustScore: formData.minTrustScore,
          maxRiskLevel: formData.maxRiskLevel,
          brandValues: formData.brandValues,
          excludeCategories: formData.excludeCategories,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success and redirect to campaigns list
        router.push('/campaigns');
      } else {
        alert(data.error || 'Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title="Edit Campaign"
              subtitle="Loading campaign data..."
              showSearch={false}
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#667eea' }}></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title="Edit Campaign"
              subtitle="Error loading campaign"
              showSearch={false}
            />
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '100px 0',
              gap: '16px'
            }}>
              <i className="fa-solid fa-exclamation-circle" style={{ fontSize: '48px', color: '#ef4444' }}></i>
              <p style={{ fontSize: '18px', color: '#4a5568' }}>{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => router.push('/campaigns')}
              >
                <i className="fa-solid fa-arrow-left"></i> Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Edit Campaign"
            subtitle="Update your campaign details"
            showSearch={false}
          />

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
                    <label className="form-label">Industry</label>
                    <select
                      className="form-input"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'draft' })}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget Range</label>
                    <select
                      className="form-input"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    >
                      <option value="">Select budget range...</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="10000-25000">$10,000 - $25,000</option>
                      <option value="25000-50000">$25,000 - $50,000</option>
                      <option value="50000-100000">$50,000 - $100,000</option>
                      <option value="100000+">$100,000+</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Campaign Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign objectives, target audience, key messages..."
                    rows={4}
                  />
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
                  <label className="form-label">Target Platforms</label>
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
                  <label className="form-label">Follower Range</label>
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
                  <label className="form-label">Minimum Engagement Rate</label>
                  <select
                    className="form-input"
                    value={formData.engagementRate}
                    onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
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
                    <label className="form-label">Minimum Trust Score</label>
                    <select
                      className="form-input"
                      value={formData.minTrustScore}
                      onChange={(e) => setFormData({ ...formData, minTrustScore: e.target.value })}
                    >
                      <option value="">Select minimum score...</option>
                      <option value="90">90%+ (Premium quality)</option>
                      <option value="80">80%+ (High quality)</option>
                      <option value="70">70%+ (Good quality)</option>
                      <option value="60">60%+ (Standard)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Maximum Risk Level</label>
                    <select
                      className="form-input"
                      value={formData.maxRiskLevel}
                      onChange={(e) => setFormData({ ...formData, maxRiskLevel: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => router.push('/campaigns')} 
                  className="btn btn-secondary" 
                  disabled={isSubmitting}
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Save Changes
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
