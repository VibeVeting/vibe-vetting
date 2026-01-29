"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CreatorProfile {
  niche: string;
  followerCount: string;
  primaryPlatform: string;
  socialHandles: Record<string, string>;
  city?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  userType: string;
  creatorProfile?: CreatorProfile;
}

interface BarterOffer {
  _id: string;
  brandName: string;
  brandLogo?: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
  productValue: number;
  productCategory: string;
  contentType: string;
  contentRequirement: string;
  script?: string;
  hashtags: string[];
  dos: string[];
  donts: string[];
  totalSlots: number;
  filledSlots: number;
  deadline: string;
  hasApplied: boolean;
  application?: BarterApplication;
}

interface BarterApplication {
  _id: string;
  offerId: string;
  status: string;
  contentLink?: string;
  contentSubmittedAt?: string;
  appliedAt: string;
  offer?: BarterOffer;
}

interface Stats {
  totalApplications: number;
  pending: number;
  approved: number;
  submitted: number;
  completed: number;
  rejected: number;
  totalEarned: number;
}

const contentTypeIcons: Record<string, { icon: string; color: string; label: string }> = {
  reel: { icon: 'fa-film', color: '#E4405F', label: 'Reel' },
  video: { icon: 'fa-video', color: '#FF0000', label: 'Video' },
  photo: { icon: 'fa-image', color: '#1DA1F2', label: 'Photo' },
  story: { icon: 'fa-clock', color: '#833AB4', label: 'Story' },
  carousel: { icon: 'fa-images', color: '#F56040', label: 'Carousel' },
};

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending Review' },
  approved: { bg: '#d1fae5', color: '#059669', label: 'Approved' },
  rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Not Selected' },
  content_pending: { bg: '#dbeafe', color: '#2563eb', label: 'Create Content' },
  submitted: { bg: '#e0e7ff', color: '#4f46e5', label: 'Under Review' },
  revision_requested: { bg: '#fef3c7', color: '#d97706', label: 'Revision Needed' },
  completed: { bg: '#d1fae5', color: '#059669', label: 'Completed' },
  shipped: { bg: '#d1fae5', color: '#059669', label: 'Product Shipped' },
};

export default function CreatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('offers');
  const [offers, setOffers] = useState<BarterOffer[]>([]);
  const [applications, setApplications] = useState<BarterApplication[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<BarterOffer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<BarterApplication | null>(null);
  const [submitLink, setSubmitLink] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

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
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const [offersRes, applicationsRes, profileRes] = await Promise.all([
        fetch('/api/barter/offers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/barter/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/barter/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData.offers || []);
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData.applications || []);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setStats(profileData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login-barter');
  };

  const handleApply = async () => {
    if (!selectedOffer) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    setApplyLoading(true);
    try {
      const response = await fetch('/api/barter/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerId: selectedOffer._id,
        }),
      });

      if (response.ok) {
        setShowApplyModal(false);
        setSelectedOffer(null);
        fetchData(token);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to apply');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Something went wrong');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleSubmitContent = async () => {
    if (!selectedApplication || !submitLink) {
      setSubmitError('Please enter your content link');
      return;
    }

    if (!submitLink.includes('http')) {
      setSubmitError('Please enter a valid URL');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setApplyLoading(true);
    try {
      const response = await fetch(`/api/barter/applications/${selectedApplication._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'submit_content',
          contentLink: submitLink,
        }),
      });

      if (response.ok) {
        setShowSubmitModal(false);
        setSelectedApplication(null);
        setSubmitLink('');
        setSubmitError('');
        fetchData(token);
      } else {
        const data = await response.json();
        setSubmitError(data.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setSubmitError('Something went wrong');
    } finally {
      setApplyLoading(false);
    }
  };

  const getFilteredOffers = () => {
    let filtered = offers.filter(o => !o.hasApplied);
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(o => o.productCategory.toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    return filtered;
  };

  const categories = [...new Set(offers.map(o => o.productCategory))];

  if (loading || !user) {
    return (
      <div className="creator-dashboard-loading">
        <div className="loading-spinner">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
        <p>Loading your dashboard...</p>
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
            className={`creator-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <i className="fa-solid fa-gift"></i>
            <span>Browse Offers</span>
            <span className="nav-badge">{getFilteredOffers().length}</span>
          </button>
          <button 
            className={`creator-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <i className="fa-solid fa-file-alt"></i>
            <span>My Applications</span>
            <span className="nav-badge">{applications.length}</span>
          </button>
          <button 
            className={`creator-nav-item ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="fa-solid fa-clock"></i>
            <span>Pending Content</span>
            <span className="nav-badge">{applications.filter(a => ['approved', 'content_pending', 'revision_requested'].includes(a.status)).length}</span>
          </button>
          <button 
            className={`creator-nav-item ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <i className="fa-solid fa-check-circle"></i>
            <span>Completed</span>
            <span className="nav-badge">{applications.filter(a => ['completed', 'shipped', 'submitted'].includes(a.status)).length}</span>
          </button>
          <div className="nav-divider"></div>
          <button 
            className={`creator-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fa-solid fa-user"></i>
            <span>My Profile</span>
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
        {/* Stats Header */}
        {stats && (
          <div className="creator-stats-bar">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalApplications}</span>
                <span className="stat-label">Total Applications</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <i className="fa-solid fa-hourglass-half"></i>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.approved}</span>
                <span className="stat-label">Approved</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
                <i className="fa-solid fa-gift"></i>
              </div>
              <div className="stat-content">
                <span className="stat-value">₹{stats.totalEarned.toLocaleString()}</span>
                <span className="stat-label">Products Earned</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="creator-content">
          {/* Browse Offers Tab */}
          {activeTab === 'offers' && (
            <>
              <div className="content-header">
                <div className="header-left">
                  <h1>🎁 Available Brand Offers</h1>
                  <p>Apply to get free products in exchange for content</p>
                </div>
                <div className="header-filters">
                  <select 
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="offers-grid">
                {getFilteredOffers().length === 0 ? (
                  <div className="empty-state">
                    <i className="fa-solid fa-box-open"></i>
                    <h3>No offers available</h3>
                    <p>Check back soon for new brand opportunities!</p>
                  </div>
                ) : (
                  getFilteredOffers().map((offer) => (
                    <div key={offer._id} className="offer-card">
                      <div className="offer-card-header">
                        <div className="brand-info">
                          <span className="brand-logo">{offer.brandLogo || '🏢'}</span>
                          <div>
                            <h3>{offer.brandName}</h3>
                            <span className="brand-category">{offer.productCategory}</span>
                          </div>
                        </div>
                        <div 
                          className="content-type-badge" 
                          style={{ 
                            background: `${contentTypeIcons[offer.contentType]?.color || '#666'}20`, 
                            color: contentTypeIcons[offer.contentType]?.color || '#666' 
                          }}
                        >
                          <i className={`fa-solid ${contentTypeIcons[offer.contentType]?.icon || 'fa-file'}`}></i>
                          {contentTypeIcons[offer.contentType]?.label || offer.contentType}
                        </div>
                      </div>

                      <div className="offer-product">
                        <span className="product-image">{offer.productImage || '📦'}</span>
                        <div className="product-details">
                          <h4>{offer.productName}</h4>
                          <span className="product-value">Worth ₹{offer.productValue.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="offer-meta">
                        <div className="meta-item">
                          <i className="fa-solid fa-calendar"></i>
                          <span>Due: {new Date(offer.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="meta-item">
                          <i className="fa-solid fa-users"></i>
                          <span>{offer.filledSlots}/{offer.totalSlots} slots</span>
                        </div>
                      </div>

                      <div className="offer-actions">
                        <button 
                          className="btn-view-details"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setShowApplyModal(true);
                          }}
                        >
                          View & Apply
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* My Applications Tab */}
          {activeTab === 'applications' && (
            <>
              <div className="content-header">
                <div className="header-left">
                  <h1>📋 My Applications</h1>
                  <p>Track all your brand collaboration applications</p>
                </div>
              </div>

              <div className="applications-list">
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <i className="fa-solid fa-file-alt"></i>
                    <h3>No applications yet</h3>
                    <p>Apply to some offers to see them here</p>
                    <button className="btn-primary" onClick={() => setActiveTab('offers')}>
                      Browse Offers
                    </button>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app._id} className="application-card">
                      <div className="application-left">
                        <span className="app-brand-logo">{app.offer?.brandLogo || '🏢'}</span>
                        <div className="app-details">
                          <h4>{app.offer?.brandName || 'Brand'}</h4>
                          <p>{app.offer?.productName || 'Product'}</p>
                          <span className="app-date">Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="application-right">
                        <span 
                          className="status-badge"
                          style={{ 
                            background: statusColors[app.status]?.bg || '#f3f4f6',
                            color: statusColors[app.status]?.color || '#374151'
                          }}
                        >
                          {statusColors[app.status]?.label || app.status}
                        </span>
                        {['approved', 'content_pending', 'revision_requested'].includes(app.status) && !app.contentLink && (
                          <button 
                            className="btn-submit-content"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowSubmitModal(true);
                            }}
                          >
                            Submit Content
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Pending Content Tab */}
          {activeTab === 'pending' && (
            <>
              <div className="content-header">
                <div className="header-left">
                  <h1>⏳ Pending Content</h1>
                  <p>Create and submit content for approved applications</p>
                </div>
              </div>

              <div className="pending-content-list">
                {applications.filter(a => ['approved', 'content_pending', 'revision_requested'].includes(a.status)).length === 0 ? (
                  <div className="empty-state">
                    <i className="fa-solid fa-camera"></i>
                    <h3>No pending content</h3>
                    <p>Get approved on applications to create content</p>
                  </div>
                ) : (
                  applications
                    .filter(a => ['approved', 'content_pending', 'revision_requested'].includes(a.status))
                    .map((app) => (
                      <div key={app._id} className="pending-content-card">
                        <div className="pending-header">
                          <div className="brand-product-info">
                            <span className="brand-logo">{app.offer?.brandLogo || '🏢'}</span>
                            <div>
                              <h4>{app.offer?.brandName}</h4>
                              <p>{app.offer?.productName}</p>
                            </div>
                          </div>
                          <div 
                            className="content-type-badge" 
                            style={{ 
                              background: `${contentTypeIcons[app.offer?.contentType || 'photo']?.color || '#666'}20`, 
                              color: contentTypeIcons[app.offer?.contentType || 'photo']?.color || '#666' 
                            }}
                          >
                            <i className={`fa-solid ${contentTypeIcons[app.offer?.contentType || 'photo']?.icon}`}></i>
                            {app.offer?.contentRequirement}
                          </div>
                        </div>

                        {app.offer?.script && (
                          <div className="content-brief">
                            <h5><i className="fa-solid fa-scroll"></i> Content Brief</h5>
                            <p>{app.offer.script}</p>
                          </div>
                        )}

                        {app.offer?.hashtags && app.offer.hashtags.length > 0 && (
                          <div className="hashtags-row">
                            {app.offer.hashtags.map((tag, i) => (
                              <span key={i} className="hashtag">{tag}</span>
                            ))}
                          </div>
                        )}

                        <div className="pending-footer">
                          <span className="deadline">
                            <i className="fa-solid fa-calendar"></i>
                            Due: {app.offer?.deadline ? new Date(app.offer.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                          <button 
                            className="btn-submit-content"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowSubmitModal(true);
                            }}
                          >
                            <i className="fa-solid fa-upload"></i>
                            Submit Content
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <>
              <div className="content-header">
                <div className="header-left">
                  <h1>✅ Completed Collaborations</h1>
                  <p>Your successfully completed brand partnerships</p>
                </div>
              </div>

              <div className="completed-list">
                {applications.filter(a => ['completed', 'shipped', 'submitted'].includes(a.status)).length === 0 ? (
                  <div className="empty-state">
                    <i className="fa-solid fa-trophy"></i>
                    <h3>No completed collabs yet</h3>
                    <p>Complete your first collaboration to see it here</p>
                  </div>
                ) : (
                  applications
                    .filter(a => ['completed', 'shipped', 'submitted'].includes(a.status))
                    .map((app) => (
                      <div key={app._id} className="completed-card">
                        <div className="completed-left">
                          <span className="brand-logo">{app.offer?.brandLogo || '🏢'}</span>
                          <div>
                            <h4>{app.offer?.brandName}</h4>
                            <p>{app.offer?.productName}</p>
                          </div>
                        </div>
                        <div className="completed-center">
                          <span className="product-value">₹{app.offer?.productValue?.toLocaleString() || 0}</span>
                          <span className="product-label">Product Value</span>
                        </div>
                        <div className="completed-right">
                          <span 
                            className="status-badge"
                            style={{ 
                              background: statusColors[app.status]?.bg,
                              color: statusColors[app.status]?.color
                            }}
                          >
                            <i className="fa-solid fa-check"></i>
                            {statusColors[app.status]?.label}
                          </span>
                          {app.contentLink && (
                            <a href={app.contentLink} target="_blank" rel="noopener noreferrer" className="view-content-link">
                              <i className="fa-solid fa-external-link"></i>
                              View Content
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="content-header">
                <div className="header-left">
                  <h1>👤 My Profile</h1>
                  <p>Manage your creator profile and social handles</p>
                </div>
              </div>

              <div className="profile-section">
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-header-info">
                      <h2>{user.name}</h2>
                      <p>{user.email}</p>
                      <div className="profile-badges">
                        <span className="badge niche-badge">
                          <i className="fa-solid fa-tag"></i>
                          {user.creatorProfile?.niche || 'Creator'}
                        </span>
                        <span className="badge followers-badge">
                          <i className="fa-solid fa-users"></i>
                          {user.creatorProfile?.followerCount || '0'} Followers
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-social-handles">
                    <h3>Connected Platforms</h3>
                    <div className="social-handles-grid">
                      {user.creatorProfile?.socialHandles && Object.entries(user.creatorProfile.socialHandles).map(([platform, handle]) => (
                        handle && (
                          <div key={platform} className={`social-handle-card ${platform}`}>
                            <i className={`fa-brands fa-${platform === 'twitter' ? 'x-twitter' : platform}`}></i>
                            <span>{handle}</span>
                            {user.creatorProfile?.primaryPlatform === platform && (
                              <span className="primary-badge">Primary</span>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {stats && (
                    <div className="profile-stats">
                      <h3>Performance Stats</h3>
                      <div className="stats-grid">
                        <div className="stat-box">
                          <span className="stat-number">{stats.totalApplications}</span>
                          <span className="stat-text">Total Applications</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-number">{stats.completed}</span>
                          <span className="stat-text">Completed Collabs</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-number">₹{stats.totalEarned.toLocaleString()}</span>
                          <span className="stat-text">Total Earned</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-number">{stats.totalApplications > 0 ? Math.round((stats.approved / stats.totalApplications) * 100) : 0}%</span>
                          <span className="stat-text">Success Rate</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link href="/creator-dashboard/settings" className="btn-edit-profile">
                    <i className="fa-solid fa-pen"></i>
                    Edit Profile
                  </Link>
                </div>
              </div>
            </>
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
                <span className="brand-logo-large">{selectedOffer.brandLogo || '🏢'}</span>
                <div>
                  <h2>{selectedOffer.brandName}</h2>
                  <p>{selectedOffer.productCategory}</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="product-showcase">
                <span className="product-image-large">{selectedOffer.productImage || '📦'}</span>
                <div>
                  <h3>{selectedOffer.productName}</h3>
                  <span className="product-value-large">FREE (Worth ₹{selectedOffer.productValue.toLocaleString()})</span>
                </div>
              </div>

              <div className="content-requirement-box">
                <div className="requirement-header">
                  <i className={`fa-solid ${contentTypeIcons[selectedOffer.contentType]?.icon}`} style={{ color: contentTypeIcons[selectedOffer.contentType]?.color }}></i>
                  <span>{selectedOffer.contentRequirement}</span>
                </div>
                <p className="deadline-text">
                  <i className="fa-solid fa-calendar"></i>
                  Deadline: {new Date(selectedOffer.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {selectedOffer.script && (
                <div className="script-section">
                  <h4><i className="fa-solid fa-scroll"></i> Content Script / Brief</h4>
                  <p>{selectedOffer.script}</p>
                </div>
              )}

              {selectedOffer.hashtags && selectedOffer.hashtags.length > 0 && (
                <div className="hashtags-section">
                  <h4><i className="fa-solid fa-hashtag"></i> Required Hashtags</h4>
                  <div className="hashtag-list">
                    {selectedOffer.hashtags.map((tag, i) => (
                      <span key={i} className="hashtag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="guidelines-grid">
                {selectedOffer.dos && selectedOffer.dos.length > 0 && (
                  <div className="guidelines-box dos">
                    <h4><i className="fa-solid fa-check"></i> Do&apos;s</h4>
                    <ul>
                      {selectedOffer.dos.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedOffer.donts && selectedOffer.donts.length > 0 && (
                  <div className="guidelines-box donts">
                    <h4><i className="fa-solid fa-times"></i> Don&apos;ts</h4>
                    <ul>
                      {selectedOffer.donts.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowApplyModal(false); setSelectedOffer(null); }}>
                Cancel
              </button>
              <button className="btn-primary-pink" onClick={handleApply} disabled={applyLoading}>
                {applyLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Applying...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    Apply for This Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Content Modal */}
      {showSubmitModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => { setShowSubmitModal(false); setSelectedApplication(null); setSubmitLink(''); setSubmitError(''); }}>
          <div className="modal-content submit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowSubmitModal(false); setSelectedApplication(null); setSubmitLink(''); setSubmitError(''); }}>
              <i className="fa-solid fa-times"></i>
            </button>

            <div className="modal-header">
              <h2>Submit Your Content</h2>
              <p>for {selectedApplication.offer?.brandName} - {selectedApplication.offer?.productName}</p>
            </div>

            <div className="modal-body">
              <div className="submit-reminder">
                <div className="reminder-header">
                  <i className={`fa-solid ${contentTypeIcons[selectedApplication.offer?.contentType || 'photo']?.icon}`} style={{ color: contentTypeIcons[selectedApplication.offer?.contentType || 'photo']?.color }}></i>
                  <span>{selectedApplication.offer?.contentRequirement}</span>
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
              <button className="btn-secondary" onClick={() => { setShowSubmitModal(false); setSelectedApplication(null); setSubmitLink(''); setSubmitError(''); }}>
                Cancel
              </button>
              <button className="btn-primary-pink" onClick={handleSubmitContent} disabled={applyLoading}>
                {applyLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Submit Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
