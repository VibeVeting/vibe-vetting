"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Sample brand offers data
const sampleBrandOffers = [
  {
    id: '1',
    brandName: 'GlowSkin Naturals',
    brandLogo: '🧴',
    productName: 'Vitamin C Serum (30ml)',
    productImage: '✨',
    productValue: '₹1,299',
    contentType: 'reel',
    contentRequirement: 'Instagram Reel (30-60 sec)',
    deadline: '2026-02-15',
    script: 'Show your morning skincare routine. Start with clean face, apply 2-3 drops of serum, and show the glow! Mention benefits: brightening, anti-aging, and hydration. End with your honest review.',
    hashtags: ['#GlowSkinNaturals', '#VitaminCSerum', '#SkincareRoutine', '#Ad'],
    dos: ['Show the product clearly', 'Mention key benefits', 'Be authentic and genuine', 'Good lighting is must'],
    donts: ['No competitor products in frame', 'Don\'t make medical claims', 'No filters that hide skin'],
    status: 'available',
    applicants: 12,
    slots: 20,
    category: 'Beauty & Skincare',
  },
  {
    id: '2',
    brandName: 'FitFuel Protein',
    brandLogo: '💪',
    productName: 'Whey Protein Chocolate (1kg)',
    productImage: '🏋️',
    productValue: '₹2,499',
    contentType: 'video',
    contentRequirement: 'YouTube Short or Long Video',
    deadline: '2026-02-20',
    script: 'Create a workout video featuring the protein shake. Show preparation, taste test, and post-workout consumption. Share your fitness journey and how protein helps.',
    hashtags: ['#FitFuelProtein', '#FitnessJourney', '#ProteinShake', '#Sponsored'],
    dos: ['Show product packaging', 'Demonstrate mixing', 'Share taste review', 'Mention protein content'],
    donts: ['No other supplement brands', 'Don\'t skip showing the product', 'No negative health claims'],
    status: 'available',
    applicants: 8,
    slots: 15,
    category: 'Fitness & Health',
  },
  {
    id: '3',
    brandName: 'TechGear India',
    brandLogo: '📱',
    productName: 'Wireless Earbuds Pro',
    productImage: '🎧',
    productValue: '₹1,999',
    contentType: 'photo',
    contentRequirement: 'Instagram Photo Post (Carousel)',
    deadline: '2026-02-10',
    script: 'Create a carousel post: 1) Unboxing shot 2) Product close-up 3) You wearing them 4) Lifestyle shot. Caption should cover sound quality, battery life, and comfort.',
    hashtags: ['#TechGearIndia', '#WirelessEarbuds', '#TechReview', '#Collab'],
    dos: ['High quality photos', 'Show product details', 'Lifestyle integration', 'Honest caption'],
    donts: ['No competitor products', 'No low quality images', 'Don\'t hide the product'],
    status: 'available',
    applicants: 25,
    slots: 30,
    category: 'Tech & Gadgets',
  },
  {
    id: '4',
    brandName: 'HomeBrew Coffee',
    brandLogo: '☕',
    productName: 'Premium Arabica Beans (250g)',
    productImage: '🫘',
    productValue: '₹599',
    contentType: 'reel',
    contentRequirement: 'Instagram Reel (15-30 sec)',
    deadline: '2026-02-25',
    script: 'Morning coffee routine! Show brewing process, the aroma appreciation moment, and first sip reaction. Cozy vibes are perfect for this content.',
    hashtags: ['#HomeBrewCoffee', '#CoffeeLover', '#MorningRoutine', '#Ad'],
    dos: ['Aesthetic setup', 'Show brewing process', 'Genuine reaction', 'Tag the brand'],
    donts: ['No other coffee brands', 'Don\'t rush the content', 'No cluttered background'],
    status: 'available',
    applicants: 18,
    slots: 25,
    category: 'Food & Cooking',
  },
];

const contentTypeIcons: Record<string, { icon: string; color: string; label: string }> = {
  reel: { icon: 'fa-film', color: '#E4405F', label: 'Reel' },
  video: { icon: 'fa-video', color: '#FF0000', label: 'Video' },
  photo: { icon: 'fa-image', color: '#1DA1F2', label: 'Photo' },
  story: { icon: 'fa-clock', color: '#833AB4', label: 'Story' },
};

interface UserData {
  name: string;
  email: string;
  userType: string;
  creatorProfile?: {
    niche: string;
    followerCount: string;
    primaryPlatform: string;
  };
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedOffer, setSelectedOffer] = useState<typeof sampleBrandOffers[0] | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [appliedOffers, setAppliedOffers] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, { link: string; status: string }>>({});
  const [submitLink, setSubmitLink] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login-barter');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'barter_creator') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login-barter');
  };

  const handleApply = (offerId: string) => {
    setAppliedOffers([...appliedOffers, offerId]);
    setShowApplyModal(false);
    setSelectedOffer(null);
  };

  const handleSubmitContent = () => {
    if (!submitLink) {
      setSubmitError('Please enter your content link');
      return;
    }
    if (!submitLink.includes('http')) {
      setSubmitError('Please enter a valid URL');
      return;
    }
    
    if (selectedOffer) {
      setSubmissions({
        ...submissions,
        [selectedOffer.id]: { link: submitLink, status: 'pending' }
      });
    }
    setSubmitLink('');
    setSubmitError('');
    setShowSubmitModal(false);
    setSelectedOffer(null);
  };

  const getOffersByTab = () => {
    switch (activeTab) {
      case 'applied':
        return sampleBrandOffers.filter(o => appliedOffers.includes(o.id) && !submissions[o.id]);
      case 'submitted':
        return sampleBrandOffers.filter(o => submissions[o.id]);
      default:
        return sampleBrandOffers.filter(o => !appliedOffers.includes(o.id));
    }
  };

  if (!user) {
    return (
      <div className="creator-dashboard-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="creator-dashboard">
      {/* Sidebar */}
      <aside className="creator-sidebar">
        <div className="creator-sidebar-header">
          <div className="creator-logo">
            <span className="logo-icon">🎁</span>
            <span className="logo-text">Barter</span>
          </div>
        </div>

        <nav className="creator-nav">
          <button 
            className={`creator-nav-item ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            <i className="fa-solid fa-gift"></i>
            <span>Available Offers</span>
            <span className="nav-badge">{sampleBrandOffers.filter(o => !appliedOffers.includes(o.id)).length}</span>
          </button>
          <button 
            className={`creator-nav-item ${activeTab === 'applied' ? 'active' : ''}`}
            onClick={() => setActiveTab('applied')}
          >
            <i className="fa-solid fa-clock"></i>
            <span>Applied</span>
            <span className="nav-badge">{appliedOffers.filter(id => !submissions[id]).length}</span>
          </button>
          <button 
            className={`creator-nav-item ${activeTab === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveTab('submitted')}
          >
            <i className="fa-solid fa-check-circle"></i>
            <span>Submitted</span>
            <span className="nav-badge">{Object.keys(submissions).length}</span>
          </button>
        </nav>

        <div className="creator-sidebar-footer">
          <div className="creator-profile-mini">
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user.name}</span>
              <span className="profile-niche">{user.creatorProfile?.niche || 'Creator'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="creator-main">
        <header className="creator-header">
          <div className="header-left">
            <h1>
              {activeTab === 'available' && 'Available Brand Offers'}
              {activeTab === 'applied' && 'Your Applications'}
              {activeTab === 'submitted' && 'Submitted Content'}
            </h1>
            <p>
              {activeTab === 'available' && 'Apply to get free products in exchange for content'}
              {activeTab === 'applied' && 'Waiting for brand approval - create content once approved'}
              {activeTab === 'submitted' && 'Track your submitted content and product shipments'}
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <span className="stat-value">{user.creatorProfile?.followerCount || '-'}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{Object.keys(submissions).length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </header>

        {/* Offers Grid */}
        <div className="offers-grid">
          {getOffersByTab().length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-box-open"></i>
              <h3>No offers here yet</h3>
              <p>
                {activeTab === 'available' && 'Check back soon for new brand opportunities!'}
                {activeTab === 'applied' && 'Apply to some offers to see them here'}
                {activeTab === 'submitted' && 'Submit your content to track it here'}
              </p>
            </div>
          ) : (
            getOffersByTab().map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-card-header">
                  <div className="brand-info">
                    <span className="brand-logo">{offer.brandLogo}</span>
                    <div>
                      <h3>{offer.brandName}</h3>
                      <span className="brand-category">{offer.category}</span>
                    </div>
                  </div>
                  <div className="content-type-badge" style={{ background: `${contentTypeIcons[offer.contentType].color}20`, color: contentTypeIcons[offer.contentType].color }}>
                    <i className={`fa-solid ${contentTypeIcons[offer.contentType].icon}`}></i>
                    {contentTypeIcons[offer.contentType].label}
                  </div>
                </div>

                <div className="offer-product">
                  <span className="product-image">{offer.productImage}</span>
                  <div className="product-details">
                    <h4>{offer.productName}</h4>
                    <span className="product-value">Worth {offer.productValue}</span>
                  </div>
                </div>

                <div className="offer-meta">
                  <div className="meta-item">
                    <i className="fa-solid fa-calendar"></i>
                    <span>Due: {new Date(offer.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fa-solid fa-users"></i>
                    <span>{offer.applicants}/{offer.slots} slots</span>
                  </div>
                </div>

                {submissions[offer.id] && (
                  <div className="submission-status">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Content Submitted - Under Review</span>
                  </div>
                )}

                <div className="offer-actions">
                  <button 
                    className="btn-view-details"
                    onClick={() => {
                      setSelectedOffer(offer);
                      if (appliedOffers.includes(offer.id) && !submissions[offer.id]) {
                        setShowSubmitModal(true);
                      } else if (!appliedOffers.includes(offer.id)) {
                        setShowApplyModal(true);
                      }
                    }}
                  >
                    {!appliedOffers.includes(offer.id) && 'View & Apply'}
                    {appliedOffers.includes(offer.id) && !submissions[offer.id] && 'Submit Content'}
                    {submissions[offer.id] && 'View Details'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && selectedOffer && (
        <div className="modal-overlay" onClick={() => { setShowApplyModal(false); setSelectedOffer(null); }}>
          <div className="modal-content offer-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowApplyModal(false); setSelectedOffer(null); }}>
              <i className="fa-solid fa-times"></i>
            </button>

            <div className="modal-header">
              <div className="brand-info-large">
                <span className="brand-logo-large">{selectedOffer.brandLogo}</span>
                <div>
                  <h2>{selectedOffer.brandName}</h2>
                  <p>{selectedOffer.category}</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="product-showcase">
                <span className="product-image-large">{selectedOffer.productImage}</span>
                <div>
                  <h3>{selectedOffer.productName}</h3>
                  <span className="product-value-large">FREE (Worth {selectedOffer.productValue})</span>
                </div>
              </div>

              <div className="content-requirement-box">
                <div className="requirement-header">
                  <i className={`fa-solid ${contentTypeIcons[selectedOffer.contentType].icon}`} style={{ color: contentTypeIcons[selectedOffer.contentType].color }}></i>
                  <span>{selectedOffer.contentRequirement}</span>
                </div>
                <p className="deadline-text">
                  <i className="fa-solid fa-calendar"></i>
                  Deadline: {new Date(selectedOffer.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="script-section">
                <h4><i className="fa-solid fa-scroll"></i> Content Script / Brief</h4>
                <p>{selectedOffer.script}</p>
              </div>

              <div className="hashtags-section">
                <h4><i className="fa-solid fa-hashtag"></i> Required Hashtags</h4>
                <div className="hashtag-list">
                  {selectedOffer.hashtags.map((tag, i) => (
                    <span key={i} className="hashtag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="guidelines-grid">
                <div className="guidelines-box dos">
                  <h4><i className="fa-solid fa-check"></i> Do&apos;s</h4>
                  <ul>
                    {selectedOffer.dos.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="guidelines-box donts">
                  <h4><i className="fa-solid fa-times"></i> Don&apos;ts</h4>
                  <ul>
                    {selectedOffer.donts.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowApplyModal(false); setSelectedOffer(null); }}>
                Cancel
              </button>
              <button className="btn-primary-pink" onClick={() => handleApply(selectedOffer.id)}>
                <i className="fa-solid fa-paper-plane"></i>
                Apply for This Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Content Modal */}
      {showSubmitModal && selectedOffer && (
        <div className="modal-overlay" onClick={() => { setShowSubmitModal(false); setSelectedOffer(null); setSubmitLink(''); setSubmitError(''); }}>
          <div className="modal-content submit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowSubmitModal(false); setSelectedOffer(null); setSubmitLink(''); setSubmitError(''); }}>
              <i className="fa-solid fa-times"></i>
            </button>

            <div className="modal-header">
              <h2>Submit Your Content</h2>
              <p>for {selectedOffer.brandName} - {selectedOffer.productName}</p>
            </div>

            <div className="modal-body">
              <div className="submit-reminder">
                <div className="reminder-header">
                  <i className={`fa-solid ${contentTypeIcons[selectedOffer.contentType].icon}`} style={{ color: contentTypeIcons[selectedOffer.contentType].color }}></i>
                  <span>{selectedOffer.contentRequirement}</span>
                </div>
                <p className="reminder-text">Make sure your content is PUBLIC and follows all guidelines</p>
              </div>

              <div className="form-group">
                <label className="form-label">Content Link *</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-link"></i>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://instagram.com/reel/..."
                    value={submitLink}
                    onChange={(e) => { setSubmitLink(e.target.value); setSubmitError(''); }}
                  />
                </div>
                {submitError && (
                  <span className="form-error">{submitError}</span>
                )}
                <p className="form-hint">Paste the public URL of your posted content</p>
              </div>

              <div className="checklist-section">
                <h4>Before Submitting, Confirm:</h4>
                <label className="checklist-item">
                  <input type="checkbox" />
                  <span>Content is posted and PUBLIC</span>
                </label>
                <label className="checklist-item">
                  <input type="checkbox" />
                  <span>All required hashtags are included</span>
                </label>
                <label className="checklist-item">
                  <input type="checkbox" />
                  <span>Brand is tagged properly</span>
                </label>
                <label className="checklist-item">
                  <input type="checkbox" />
                  <span>Content follows all guidelines</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowSubmitModal(false); setSelectedOffer(null); setSubmitLink(''); setSubmitError(''); }}>
                Cancel
              </button>
              <button className="btn-primary-pink" onClick={handleSubmitContent}>
                <i className="fa-solid fa-check"></i>
                Submit Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
