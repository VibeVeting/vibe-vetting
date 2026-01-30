"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './barter-company-dashboard.css';

interface CompanyProfile {
  companyName: string;
  industry: string;
  website?: string;
  logo?: string;
  description?: string;
  city?: string;
  contactPerson: string;
  productsCategories: string[];
}

interface UserData {
  id: string;
  email: string;
  userType: string;
  companyProfile?: CompanyProfile;
}

interface BarterOffer {
  _id: string;
  brandName: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
  productLink?: string;
  productValue: number;
  productCategory: string;
  contentType: string;
  contentRequirement: string;
  hashtags: string[];
  dos: string[];
  donts: string[];
  targetNiches: string[];
  totalSlots: number;
  filledSlots: number;
  deadline: string;
  status: string;
  createdAt: string;
}

interface BarterApplication {
  _id: string;
  offerId: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorNiche: string;
  creatorFollowerCount: string;
  creatorPrimaryPlatform: string;
  creatorSocialHandles: Record<string, string>;
  status: string;
  contentLink?: string;
  contentSubmittedAt?: string;
  appliedAt: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
  offer?: {
    productName: string;
    productValue: number;
    productImage?: string;
    contentType: string;
  };
}

interface BarterCreator {
  id: string;
  name: string;
  email: string;
  niche: string;
  primaryPlatform: string;
  followerCount: string;
  followerCountNum: number;
  socialHandles: Record<string, string>;
  city: string;
  barterReady: boolean;
  whyBarter: string;
  createdAt: string;
}

interface Stats {
  totalOffers: number;
  activeOffers: number;
  totalApplications: number;
  approvedApplications: number;
  completedCollabs: number;
}

const contentTypeLabels: Record<string, { icon: string; label: string }> = {
  reel: { icon: 'fa-film', label: 'Reel' },
  video: { icon: 'fa-video', label: 'Video' },
  photo: { icon: 'fa-image', label: 'Photo' },
  story: { icon: 'fa-clock', label: 'Story' },
  carousel: { icon: 'fa-images', label: 'Carousel' },
};

const statusLabels: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', label: 'Pending' },
  approved: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', label: 'Approved' },
  content_pending: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', label: 'Awaiting Content' },
  submitted: { bg: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', label: 'Content Submitted' },
  revision_requested: { bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', label: 'Revision Needed' },
  completed: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', label: 'Completed' },
  shipped: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', label: 'Shipped' },
  rejected: { bg: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', label: 'Rejected' },
};

const categoryEmojis: Record<string, string> = {
  'Fashion': '👗', 'Beauty': '💄', 'Tech': '📱', 'Food': '🍕',
  'Fitness': '💪', 'Travel': '✈️', 'Lifestyle': '🏠', 'Gaming': '🎮',
  'Health': '🏥', 'Finance': '💰', 'Education': '📚', 'Entertainment': '🎬',
};

export default function BarterCompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('offers');
  const [offers, setOffers] = useState<BarterOffer[]>([]);
  const [applications, setApplications] = useState<BarterApplication[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<BarterOffer | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<BarterApplication | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [offerFilter, setOfferFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');

  // Discover creators state
  const [creators, setCreators] = useState<BarterCreator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [creatorSearch, setCreatorSearch] = useState('');
  const [creatorNicheFilter, setCreatorNicheFilter] = useState('all');
  const [creatorPlatformFilter, setCreatorPlatformFilter] = useState('all');
  const [creatorFollowerFilter, setCreatorFollowerFilter] = useState('all');
  const [filterOptions, setFilterOptions] = useState<{ niches: string[]; platforms: string[] }>({ niches: [], platforms: [] });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedOfferForInvite, setSelectedOfferForInvite] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Create offer form state
  const [offerForm, setOfferForm] = useState({
    productName: '',
    productDescription: '',
    productImage: '',
    productLink: '',
    productValue: '',
    productCategory: '',
    contentType: 'reel',
    contentRequirement: '',
    hashtags: '',
    dos: '',
    donts: '',
    targetNiches: [] as string[],
    totalSlots: '5',
    deadline: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login-barter-company');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'barter_company') {
      // Wrong user type - redirect to their appropriate login page
      // Clear the storage since they need to login as a barter company
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login-barter-company');
      return;
    }

    setUser(parsedUser);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const [profileRes, offersRes, applicationsRes] = await Promise.all([
        fetch('/api/barter/company/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/barter/company/offers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/barter/company/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setStats(profileData.stats);
      }

      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData.offers || []);
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData.applications || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async (token: string) => {
    setCreatorsLoading(true);
    try {
      const params = new URLSearchParams();
      if (creatorSearch) params.append('search', creatorSearch);
      if (creatorNicheFilter !== 'all') params.append('niche', creatorNicheFilter);
      if (creatorPlatformFilter !== 'all') params.append('platform', creatorPlatformFilter);
      if (creatorFollowerFilter !== 'all') {
        const [min, max] = creatorFollowerFilter.split('-');
        if (min) params.append('minFollowers', min);
        if (max) params.append('maxFollowers', max);
      }

      const response = await fetch(`/api/barter/company/creators?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators || []);
        setFilterOptions(data.filterOptions || { niches: [], platforms: [] });
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setCreatorsLoading(false);
    }
  };

  // Fetch creators when filters change or tab is active
  useEffect(() => {
    if (activeTab === 'discover') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchCreators(token);
      }
    }
  }, [activeTab, creatorSearch, creatorNicheFilter, creatorPlatformFilter, creatorFollowerFilter]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login-barter-company');
  };

  const handleSelectCreator = (creatorId: string) => {
    setSelectedCreators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(creatorId)) {
        newSet.delete(creatorId);
      } else {
        newSet.add(creatorId);
      }
      return newSet;
    });
  };

  const handleSelectAllCreators = () => {
    if (selectedCreators.size === creators.length) {
      setSelectedCreators(new Set());
    } else {
      setSelectedCreators(new Set(creators.map(c => c.id)));
    }
  };

  const handleBulkInvite = async () => {
    if (selectedCreators.size === 0 || !selectedOfferForInvite) return;

    setInviteLoading(true);
    setInviteSuccess('');
    setActionError('');

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/barter/company/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          creatorIds: Array.from(selectedCreators),
          offerId: selectedOfferForInvite,
          message: inviteMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteSuccess(`Successfully invited ${data.invitedCount} creators!${data.skippedCount > 0 ? ` (${data.skippedCount} already invited)` : ''}`);
        setSelectedCreators(new Set());
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess('');
          setInviteMessage('');
          setSelectedOfferForInvite('');
        }, 2000);
      } else {
        setActionError(data.error || 'Failed to send invitations');
      }
    } catch (error) {
      console.error('Bulk invite error:', error);
      setActionError('Something went wrong');
    } finally {
      setInviteLoading(false);
    }
  };

  const formatFollowerCount = (count: string | number): string => {
    if (typeof count === 'string') return count;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/barter/company/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName: offerForm.productName,
          productDescription: offerForm.productDescription,
          productImage: offerForm.productImage || undefined,
          productLink: offerForm.productLink || undefined,
          productValue: parseInt(offerForm.productValue),
          productCategory: offerForm.productCategory,
          contentType: offerForm.contentType,
          contentRequirement: offerForm.contentRequirement,
          hashtags: offerForm.hashtags.split(',').map(h => h.trim()).filter(Boolean),
          dos: offerForm.dos.split('\n').map(d => d.trim()).filter(Boolean),
          donts: offerForm.donts.split('\n').map(d => d.trim()).filter(Boolean),
          targetNiches: offerForm.targetNiches,
          totalSlots: parseInt(offerForm.totalSlots),
          deadline: offerForm.deadline,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setActionError(data.error || 'Failed to create offer');
        return;
      }

      // Reset form and refresh data
      setOfferForm({
        productName: '',
        productDescription: '',
        productImage: '',
        productLink: '',
        productValue: '',
        productCategory: '',
        contentType: 'reel',
        contentRequirement: '',
        hashtags: '',
        dos: '',
        donts: '',
        targetNiches: [],
        totalSlots: '5',
        deadline: '',
      });
      setShowCreateModal(false);
      fetchData(token);
    } catch (error) {
      setActionError('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: string, data?: Record<string, string>) => {
    setActionLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/barter/company/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        setShowApplicationModal(false);
        setShowShipModal(false);
        setTrackingNumber('');
        fetchData(token);
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOfferStatusChange = async (offerId: string, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`/api/barter/company/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData(token);
    } catch (error) {
      console.error('Status change error:', error);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (offerFilter === 'all') return true;
    return offer.status === offerFilter;
  });

  const filteredApplications = applications.filter(app => {
    if (appFilter === 'all') return true;
    if (appFilter === 'pending') return app.status === 'pending';
    if (appFilter === 'active') return ['approved', 'content_pending', 'submitted', 'shipped'].includes(app.status);
    if (appFilter === 'completed') return app.status === 'completed';
    return true;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bc-dashboard">
        <div className="bc-loading">
          <div className="bc-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bc-dashboard">
      {/* Header */}
      <header className="bc-header">
        <div className="bc-logo">
          <div className="bc-logo-hexagon">V</div>
          <span className="bc-logo-text">
            <span className="bc-logo-vibe">VIBE</span>
            <span className="bc-logo-vetting">VETTING</span>
          </span>
        </div>

        <div className="bc-header-actions">
          <div className="bc-company-badge">
            <i className="fa-solid fa-building"></i>
            <span>Barter Company</span>
          </div>
          <Link 
            href="/barter-company-dashboard/settings/notifications" 
            className="bc-header-icon-btn"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            <i className="fa-solid fa-bell"></i>
          </Link>
          <Link 
            href="/barter-company-dashboard/settings/security" 
            className="bc-header-icon-btn"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            <i className="fa-solid fa-shield-halved"></i>
          </Link>
          <div className="bc-user-menu">
            <div className="bc-user-avatar">
              {user?.companyProfile?.companyName ? getInitials(user.companyProfile.companyName) : 'BC'}
            </div>
            <div className="bc-user-info">
              <span className="bc-user-name">{user?.companyProfile?.companyName}</span>
              <span className="bc-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="bc-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </header>

      <div className="bc-main">
        {/* Sidebar */}
        <aside className="bc-sidebar">
          <button 
            className={`bc-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <i className="fa-solid fa-gift"></i>
            <span>My Offers</span>
            {offers.length > 0 && <span className="bc-nav-badge">{offers.length}</span>}
          </button>
          <button 
            className={`bc-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <i className="fa-solid fa-users"></i>
            <span>Applications</span>
            {applications.filter(a => a.status === 'pending').length > 0 && (
              <span className="bc-nav-badge">{applications.filter(a => a.status === 'pending').length}</span>
            )}
          </button>
          <button 
            className={`bc-nav-item ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <i className="fa-solid fa-user-plus"></i>
            <span>Discover Creators</span>
          </button>
          <button 
            className={`bc-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fa-solid fa-chart-line"></i>
            <span>Analytics</span>
          </button>
          <button 
            className={`bc-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </button>
        </aside>

        {/* Content */}
        <main className="bc-content">
          {/* Stats */}
          <div className="bc-stats-grid">
            <div className="bc-stat-card">
              <div className="bc-stat-icon purple">
                <i className="fa-solid fa-gift"></i>
              </div>
              <div>
                <div className="bc-stat-value">{stats?.totalOffers || 0}</div>
                <div className="bc-stat-label">Total Offers</div>
              </div>
            </div>
            <div className="bc-stat-card">
              <div className="bc-stat-icon blue">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <div>
                <div className="bc-stat-value">{stats?.activeOffers || 0}</div>
                <div className="bc-stat-label">Active Offers</div>
              </div>
            </div>
            <div className="bc-stat-card">
              <div className="bc-stat-icon orange">
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <div>
                <div className="bc-stat-value">{stats?.totalApplications || 0}</div>
                <div className="bc-stat-label">Applications</div>
              </div>
            </div>
            <div className="bc-stat-card">
              <div className="bc-stat-icon green">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <div>
                <div className="bc-stat-value">{stats?.completedCollabs || 0}</div>
                <div className="bc-stat-label">Completed</div>
              </div>
            </div>
          </div>

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <>
              <div className="bc-section-header">
                <h2 className="bc-section-title">
                  <i className="fa-solid fa-gift"></i>
                  My Barter Offers
                </h2>
                <button className="bc-btn-primary" onClick={() => setShowCreateModal(true)}>
                  <i className="fa-solid fa-plus"></i>
                  Create Offer
                </button>
              </div>

              <div className="bc-tabs">
                <button 
                  className={`bc-tab ${offerFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setOfferFilter('all')}
                >
                  All ({offers.length})
                </button>
                <button 
                  className={`bc-tab ${offerFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setOfferFilter('active')}
                >
                  Active ({offers.filter(o => o.status === 'active').length})
                </button>
                <button 
                  className={`bc-tab ${offerFilter === 'paused' ? 'active' : ''}`}
                  onClick={() => setOfferFilter('paused')}
                >
                  Paused ({offers.filter(o => o.status === 'paused').length})
                </button>
                <button 
                  className={`bc-tab ${offerFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setOfferFilter('completed')}
                >
                  Completed ({offers.filter(o => o.status === 'completed').length})
                </button>
              </div>

              {filteredOffers.length === 0 ? (
                <div className="bc-empty-state">
                  <div className="bc-empty-icon">
                    <i className="fa-solid fa-gift"></i>
                  </div>
                  <h3 className="bc-empty-title">No offers yet</h3>
                  <p className="bc-empty-text">Create your first barter offer to start receiving applications from creators</p>
                  <button className="bc-btn-primary" onClick={() => setShowCreateModal(true)}>
                    <i className="fa-solid fa-plus"></i>
                    Create Your First Offer
                  </button>
                </div>
              ) : (
                <div className="bc-cards-grid">
                  {filteredOffers.map((offer) => (
                    <div key={offer._id} className="bc-offer-card">
                      <div className="bc-offer-image">
                        {offer.productImage ? (
                          <img src={offer.productImage} alt={offer.productName} />
                        ) : (
                          <span>{categoryEmojis[offer.productCategory] || '📦'}</span>
                        )}
                        <span className={`bc-offer-status ${offer.status}`}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                      </div>
                      <div className="bc-offer-body">
                        <h3 className="bc-offer-title">{offer.productName}</h3>
                        <div className="bc-offer-meta">
                          <span className="bc-offer-value">
                            <i className="fa-solid fa-indian-rupee-sign"></i>
                            {offer.productValue.toLocaleString()}
                          </span>
                          <span>
                            <i className={`fa-solid ${contentTypeLabels[offer.contentType]?.icon || 'fa-camera'}`}></i>
                            {contentTypeLabels[offer.contentType]?.label || offer.contentType}
                          </span>
                        </div>
                        <div className="bc-offer-stats">
                          <div className="bc-offer-stat">
                            <i className="fa-solid fa-users"></i>
                            {offer.filledSlots}/{offer.totalSlots} filled
                          </div>
                          <div className="bc-offer-stat">
                            <i className="fa-solid fa-calendar"></i>
                            {formatDate(offer.deadline)}
                          </div>
                        </div>
                        <div className="bc-offer-actions">
                          <button 
                            className="bc-offer-btn secondary"
                            onClick={() => {
                              setSelectedOffer(offer);
                              setActiveTab('applications');
                              setAppFilter('all');
                            }}
                          >
                            <i className="fa-solid fa-eye"></i>
                            View Apps
                          </button>
                          {offer.status === 'active' ? (
                            <button 
                              className="bc-offer-btn secondary"
                              onClick={() => handleOfferStatusChange(offer._id, 'paused')}
                            >
                              <i className="fa-solid fa-pause"></i>
                              Pause
                            </button>
                          ) : offer.status === 'paused' ? (
                            <button 
                              className="bc-offer-btn primary"
                              onClick={() => handleOfferStatusChange(offer._id, 'active')}
                            >
                              <i className="fa-solid fa-play"></i>
                              Activate
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <>
              <div className="bc-section-header">
                <h2 className="bc-section-title">
                  <i className="fa-solid fa-users"></i>
                  Creator Applications
                  {selectedOffer && (
                    <span style={{ fontSize: '14px', fontWeight: 400, color: '#94a3b8', marginLeft: '12px' }}>
                      for {selectedOffer.productName}
                    </span>
                  )}
                </h2>
                {selectedOffer && (
                  <button className="bc-btn-secondary" onClick={() => setSelectedOffer(null)}>
                    <i className="fa-solid fa-xmark"></i>
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="bc-tabs">
                <button 
                  className={`bc-tab ${appFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setAppFilter('all')}
                >
                  All ({applications.length})
                </button>
                <button 
                  className={`bc-tab ${appFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setAppFilter('pending')}
                >
                  Pending ({applications.filter(a => a.status === 'pending').length})
                </button>
                <button 
                  className={`bc-tab ${appFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setAppFilter('active')}
                >
                  Active ({applications.filter(a => ['approved', 'content_pending', 'submitted', 'shipped'].includes(a.status)).length})
                </button>
                <button 
                  className={`bc-tab ${appFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setAppFilter('completed')}
                >
                  Completed ({applications.filter(a => a.status === 'completed').length})
                </button>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="bc-empty-state">
                  <div className="bc-empty-icon">
                    <i className="fa-solid fa-inbox"></i>
                  </div>
                  <h3 className="bc-empty-title">No applications yet</h3>
                  <p className="bc-empty-text">Applications from creators will appear here</p>
                </div>
              ) : (
                <div className="bc-cards-grid">
                  {filteredApplications
                    .filter(app => !selectedOffer || app.offerId === selectedOffer._id)
                    .map((app) => (
                    <div key={app._id} className="bc-application-card">
                      <div className="bc-application-header">
                        <div className="bc-creator-avatar">
                          {getInitials(app.creatorName)}
                        </div>
                        <div className="bc-creator-info">
                          <div className="bc-creator-name">{app.creatorName}</div>
                          <div className="bc-creator-meta">
                            <span>{app.creatorFollowerCount} followers</span>
                            <span>•</span>
                            <span>{app.creatorNiche}</span>
                          </div>
                        </div>
                        <span 
                          className="bc-application-status"
                          style={{ 
                            background: statusLabels[app.status]?.bg,
                            color: statusLabels[app.status]?.color 
                          }}
                        >
                          {statusLabels[app.status]?.label || app.status}
                        </span>
                      </div>

                      {app.offer && (
                        <div className="bc-application-product">
                          <div className="bc-product-thumb">
                            {app.offer.productImage ? (
                              <img src={app.offer.productImage} alt={app.offer.productName} />
                            ) : (
                              <i className="fa-solid fa-gift" style={{ color: '#6366f1' }}></i>
                            )}
                          </div>
                          <div>
                            <div className="bc-product-name">{app.offer.productName}</div>
                            <div className="bc-product-value">₹{app.offer.productValue?.toLocaleString()}</div>
                          </div>
                        </div>
                      )}

                      <div className="bc-application-actions">
                        {app.status === 'pending' && (
                          <>
                            <button 
                              className="bc-offer-btn primary"
                              onClick={() => handleApplicationAction(app._id, 'approve')}
                              disabled={actionLoading}
                            >
                              <i className="fa-solid fa-check"></i>
                              Approve
                            </button>
                            <button 
                              className="bc-offer-btn secondary"
                              onClick={() => handleApplicationAction(app._id, 'reject')}
                              disabled={actionLoading}
                            >
                              <i className="fa-solid fa-xmark"></i>
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'content_pending' && app.shippingAddress && (
                          <button 
                            className="bc-offer-btn primary"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowShipModal(true);
                            }}
                          >
                            <i className="fa-solid fa-truck"></i>
                            Ship Product
                          </button>
                        )}
                        {app.status === 'submitted' && (
                          <>
                            <button 
                              className="bc-offer-btn primary"
                              onClick={() => handleApplicationAction(app._id, 'approve_content')}
                              disabled={actionLoading}
                            >
                              <i className="fa-solid fa-check"></i>
                              Approve
                            </button>
                            <button 
                              className="bc-offer-btn secondary"
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowApplicationModal(true);
                              }}
                            >
                              <i className="fa-solid fa-eye"></i>
                              View Content
                            </button>
                          </>
                        )}
                        {['completed', 'shipped'].includes(app.status) && (
                          <button 
                            className="bc-offer-btn secondary"
                            style={{ flex: 1 }}
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowApplicationModal(true);
                            }}
                          >
                            <i className="fa-solid fa-eye"></i>
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Discover Creators Tab */}
          {activeTab === 'discover' && (
            <>
              <div className="bc-section-header">
                <h2 className="bc-section-title">
                  <i className="fa-solid fa-user-plus"></i>
                  Discover Creators
                </h2>
                {selectedCreators.size > 0 && (
                  <div className="bc-bulk-actions">
                    <span className="bc-selected-count">{selectedCreators.size} selected</span>
                    <button 
                      className="bc-btn-primary"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                      Invite to Campaign
                    </button>
                    <button 
                      className="bc-btn-secondary"
                      onClick={() => setSelectedCreators(new Set())}
                    >
                      <i className="fa-solid fa-xmark"></i>
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="bc-filters-bar">
                <div className="bc-search-box">
                  <i className="fa-solid fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search by name, handle, or niche..."
                    value={creatorSearch}
                    onChange={(e) => setCreatorSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="bc-filter-select"
                  value={creatorNicheFilter}
                  onChange={(e) => setCreatorNicheFilter(e.target.value)}
                >
                  <option value="all">All Niches</option>
                  {filterOptions.niches.map(niche => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
                <select 
                  className="bc-filter-select"
                  value={creatorPlatformFilter}
                  onChange={(e) => setCreatorPlatformFilter(e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  {filterOptions.platforms.map(platform => (
                    <option key={platform} value={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</option>
                  ))}
                </select>
                <select 
                  className="bc-filter-select"
                  value={creatorFollowerFilter}
                  onChange={(e) => setCreatorFollowerFilter(e.target.value)}
                >
                  <option value="all">All Followers</option>
                  <option value="0-10000">0 - 10K (Nano)</option>
                  <option value="10000-50000">10K - 50K (Micro)</option>
                  <option value="50000-500000">50K - 500K (Mid-Tier)</option>
                  <option value="500000-1000000">500K - 1M (Macro)</option>
                  <option value="1000000-">1M+ (Mega)</option>
                </select>
              </div>

              {/* Select All */}
              <div className="bc-select-all-bar">
                <label className="bc-checkbox-label">
                  <input
                    type="checkbox"
                    checked={creators.length > 0 && selectedCreators.size === creators.length}
                    onChange={handleSelectAllCreators}
                  />
                  <span className="bc-checkbox-custom"></span>
                  Select All ({creators.length} creators)
                </label>
              </div>

              {creatorsLoading ? (
                <div className="bc-loading" style={{ minHeight: '200px' }}>
                  <div className="bc-spinner"></div>
                </div>
              ) : creators.length === 0 ? (
                <div className="bc-empty-state">
                  <div className="bc-empty-icon">
                    <i className="fa-solid fa-users-slash"></i>
                  </div>
                  <h3 className="bc-empty-title">No creators found</h3>
                  <p className="bc-empty-text">Try adjusting your filters to find creators</p>
                </div>
              ) : (
                <div className="bc-creators-grid">
                  {creators.map((creator) => (
                    <div 
                      key={creator.id} 
                      className={`bc-creator-card ${selectedCreators.has(creator.id) ? 'selected' : ''}`}
                      onClick={() => handleSelectCreator(creator.id)}
                    >
                      <div className="bc-creator-card-select">
                        <input
                          type="checkbox"
                          checked={selectedCreators.has(creator.id)}
                          onChange={() => handleSelectCreator(creator.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="bc-checkbox-custom"></span>
                      </div>
                      <div className="bc-creator-card-header">
                        <div className="bc-creator-avatar">
                          {getInitials(creator.name)}
                        </div>
                        <div className="bc-creator-info">
                          <div className="bc-creator-name">
                            {creator.name}
                            {creator.barterReady && (
                              <span className="bc-barter-ready-badge">
                                <i className="fa-solid fa-circle-check"></i>
                              </span>
                            )}
                          </div>
                          <div className="bc-creator-handle">
                            {creator.socialHandles?.instagram && (
                              <span>@{creator.socialHandles.instagram.replace('@', '')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bc-creator-stats">
                        <div className="bc-creator-stat">
                          <div className="bc-stat-number">{formatFollowerCount(creator.followerCountNum || creator.followerCount)}</div>
                          <div className="bc-stat-label-small">Followers</div>
                        </div>
                        <div className="bc-creator-stat">
                          <div className="bc-stat-number">
                            <i className={`fa-brands fa-${creator.primaryPlatform}`}></i>
                          </div>
                          <div className="bc-stat-label-small">{creator.primaryPlatform}</div>
                        </div>
                      </div>

                      <div className="bc-creator-tags">
                        <span className="bc-niche-tag">{creator.niche}</span>
                        {creator.city && <span className="bc-location-tag">
                          <i className="fa-solid fa-location-dot"></i>
                          {creator.city}
                        </span>}
                      </div>

                      <div className="bc-creator-socials">
                        {creator.socialHandles?.instagram && (
                          <a 
                            href={`https://instagram.com/${creator.socialHandles.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bc-social-link"
                          >
                            <i className="fa-brands fa-instagram"></i>
                          </a>
                        )}
                        {creator.socialHandles?.youtube && (
                          <a 
                            href={`https://youtube.com/@${creator.socialHandles.youtube.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bc-social-link"
                          >
                            <i className="fa-brands fa-youtube"></i>
                          </a>
                        )}
                        {creator.socialHandles?.twitter && (
                          <a 
                            href={`https://twitter.com/${creator.socialHandles.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bc-social-link"
                          >
                            <i className="fa-brands fa-twitter"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <>
              <div className="bc-section-header">
                <h2 className="bc-section-title">
                  <i className="fa-solid fa-chart-line"></i>
                  Analytics Overview
                </h2>
              </div>

              {/* Quick Stats */}
              <div className="bc-analytics-overview" style={{ marginBottom: '28px' }}>
                <div className="bc-analytics-card" style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '16px', 
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '24px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#a78bfa', marginBottom: '8px' }}>
                      {stats?.totalOffers || 0}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total Campaigns</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>
                      {stats?.completedCollabs || 0}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Successful Collabs</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#60a5fa', marginBottom: '8px' }}>
                      {Math.round((stats?.completedCollabs || 0) / Math.max(stats?.totalApplications || 1, 1) * 100)}%
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Conversion Rate</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#fb923c', marginBottom: '8px' }}>
                      {applications.filter(a => a.status === 'pending').length}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Pending Review</div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Notice */}
              <div className="bc-empty-state" style={{ padding: '40px' }}>
                <div className="bc-empty-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                  <i className="fa-solid fa-rocket" style={{ color: '#a78bfa' }}></i>
                </div>
                <h3 className="bc-empty-title">Advanced Analytics Coming Soon</h3>
                <p className="bc-empty-text" style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
                  We&apos;re building detailed campaign performance analytics, engagement tracking, and creator engagement metrics.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ 
                    padding: '10px 16px', 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    color: '#a5b4fc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-chart-pie"></i>
                    Engagement Metrics
                  </div>
                  <div style={{ 
                    padding: '10px 16px', 
                    background: 'rgba(34, 197, 94, 0.1)', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-heart"></i>
                    Engagement Calculator
                  </div>
                  <div style={{ 
                    padding: '10px 16px', 
                    background: 'rgba(244, 114, 182, 0.1)', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    color: '#f472b6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-users"></i>
                    Creator Insights
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bc-settings-tab">
              <div className="bc-settings-grid">
                <a href="/barter-company-dashboard/settings" className="bc-settings-card">
                  <div className="bc-settings-card-icon">
                    <i className="fa-solid fa-building"></i>
                  </div>
                  <h4>Company Profile</h4>
                  <p>Edit your company information and branding</p>
                </a>
                <a href="/barter-company-dashboard/settings#password" className="bc-settings-card">
                  <div className="bc-settings-card-icon">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <h4>Security</h4>
                  <p>Change password and security settings</p>
                </a>
                <a href="/barter-company-dashboard/settings#notifications" className="bc-settings-card">
                  <div className="bc-settings-card-icon">
                    <i className="fa-solid fa-bell"></i>
                  </div>
                  <h4>Notifications</h4>
                  <p>Manage notification preferences</p>
                </a>
                <a href="/barter-company-dashboard/settings#preferences" className="bc-settings-card">
                  <div className="bc-settings-card-icon">
                    <i className="fa-solid fa-sliders"></i>
                  </div>
                  <h4>Preferences</h4>
                  <p>Customize your barter preferences</p>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="bc-mobile-nav">
        <button 
          className={`bc-mobile-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          <i className="fa-solid fa-gift"></i>
          <span>Offers</span>
        </button>
        <button 
          className={`bc-mobile-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <i className="fa-solid fa-users"></i>
          <span>Apps</span>
          {applications.filter(a => a.status === 'pending').length > 0 && (
            <span className="bc-mobile-badge">{applications.filter(a => a.status === 'pending').length}</span>
          )}
        </button>
        <button 
          className="bc-mobile-nav-item bc-mobile-nav-create"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fa-solid fa-plus"></i>
        </button>
        <button 
          className={`bc-mobile-nav-item ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <i className="fa-solid fa-compass"></i>
          <span>Discover</span>
        </button>
        <button 
          className={`bc-mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fa-solid fa-gear"></i>
          <span>More</span>
        </button>
      </nav>

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div className="bc-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="bc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bc-modal-header">
              <h3 className="bc-modal-title">
                <i className="fa-solid fa-gift"></i>
                Create New Barter Offer
              </h3>
              <button className="bc-modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="bc-modal-body">
              <form onSubmit={handleCreateOffer}>
                {actionError && (
                  <div style={{ 
                    background: 'rgba(239, 68, 68, 0.2)', 
                    color: '#fca5a5', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    marginBottom: '20px',
                    fontSize: '14px'
                  }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                    {actionError}
                  </div>
                )}

                <div className="bc-form-group">
                  <label className="bc-form-label">
                    <i className="fa-solid fa-cube"></i>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    className="bc-form-input"
                    placeholder="e.g., Premium Skincare Set"
                    value={offerForm.productName}
                    onChange={(e) => setOfferForm({ ...offerForm, productName: e.target.value })}
                    required
                  />
                </div>

                <div className="bc-form-row">
                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-indian-rupee-sign"></i>
                      Product Value (₹) *
                    </label>
                    <input
                      type="number"
                      className="bc-form-input"
                      placeholder="e.g., 2000"
                      value={offerForm.productValue}
                      onChange={(e) => setOfferForm({ ...offerForm, productValue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-tag"></i>
                      Category *
                    </label>
                    <select
                      className="bc-form-input bc-form-select"
                      value={offerForm.productCategory}
                      onChange={(e) => setOfferForm({ ...offerForm, productCategory: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {Object.keys(categoryEmojis).map(cat => (
                        <option key={cat} value={cat}>{categoryEmojis[cat]} {cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bc-form-group">
                  <label className="bc-form-label">
                    <i className="fa-solid fa-align-left"></i>
                    Product Description
                  </label>
                  <textarea
                    className="bc-form-input bc-form-textarea"
                    placeholder="Describe your product..."
                    value={offerForm.productDescription}
                    onChange={(e) => setOfferForm({ ...offerForm, productDescription: e.target.value })}
                  />
                </div>

                <div className="bc-form-row">
                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-image"></i>
                      Product Photo URL
                    </label>
                    <input
                      type="url"
                      className="bc-form-input"
                      placeholder="https://example.com/product-image.jpg"
                      value={offerForm.productImage}
                      onChange={(e) => setOfferForm({ ...offerForm, productImage: e.target.value })}
                    />
                  </div>
                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-link"></i>
                      Product Link
                    </label>
                    <input
                      type="url"
                      className="bc-form-input"
                      placeholder="https://yourstore.com/product"
                      value={offerForm.productLink}
                      onChange={(e) => setOfferForm({ ...offerForm, productLink: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bc-form-row">
                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-camera"></i>
                      Content Type *
                    </label>
                    <select
                      className="bc-form-input bc-form-select"
                      value={offerForm.contentType}
                      onChange={(e) => setOfferForm({ ...offerForm, contentType: e.target.value })}
                      required
                    >
                      <option value="reel">📱 Reel</option>
                      <option value="video">🎬 Video</option>
                      <option value="photo">📷 Photo</option>
                      <option value="story">⏰ Story</option>
                      <option value="carousel">🖼️ Carousel</option>
                    </select>
                  </div>
                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-users"></i>
                      Total Slots *
                    </label>
                    <input
                      type="number"
                      className="bc-form-input"
                      placeholder="e.g., 5"
                      value={offerForm.totalSlots}
                      onChange={(e) => setOfferForm({ ...offerForm, totalSlots: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="bc-form-group">
                  <label className="bc-form-label">
                    <i className="fa-solid fa-file-lines"></i>
                    Content Requirements *
                  </label>
                  <textarea
                    className="bc-form-input bc-form-textarea"
                    placeholder="What kind of content do you expect? Be specific..."
                    value={offerForm.contentRequirement}
                    onChange={(e) => setOfferForm({ ...offerForm, contentRequirement: e.target.value })}
                    required
                  />
                </div>

                <div className="bc-form-group">
                  <label className="bc-form-label">
                    <i className="fa-solid fa-hashtag"></i>
                    Hashtags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="bc-form-input"
                    placeholder="e.g., #brandname, #skincare, #ad"
                    value={offerForm.hashtags}
                    onChange={(e) => setOfferForm({ ...offerForm, hashtags: e.target.value })}
                  />
                </div>

                <div className="bc-form-group">
                  <label className="bc-form-label">
                    <i className="fa-solid fa-calendar"></i>
                    Deadline *
                  </label>
                  <input
                    type="date"
                    className="bc-form-input"
                    value={offerForm.deadline}
                    onChange={(e) => setOfferForm({ ...offerForm, deadline: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="bc-modal-footer" style={{ marginTop: '20px', padding: 0, border: 'none' }}>
                  <button type="button" className="bc-btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="bc-btn-primary" disabled={actionLoading}>
                    {actionLoading ? (
                      <>
                        <div className="bc-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus"></i>
                        Create Offer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ship Modal */}
      {showShipModal && selectedApplication && (
        <div className="bc-modal-overlay" onClick={() => setShowShipModal(false)}>
          <div className="bc-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="bc-modal-header">
              <h3 className="bc-modal-title">
                <i className="fa-solid fa-truck"></i>
                Ship Product
              </h3>
              <button className="bc-modal-close" onClick={() => setShowShipModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="bc-modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', color: '#a5b4fc' }}>Shipping Address</h4>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  padding: '16px', 
                  borderRadius: '12px',
                  fontSize: '14px',
                  lineHeight: 1.6
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{selectedApplication.shippingAddress?.fullName}</div>
                  <div style={{ color: '#94a3b8' }}>{selectedApplication.shippingAddress?.phone}</div>
                  <div style={{ color: '#94a3b8', marginTop: '8px' }}>
                    {selectedApplication.shippingAddress?.addressLine1}<br />
                    {selectedApplication.shippingAddress?.city}, {selectedApplication.shippingAddress?.state} - {selectedApplication.shippingAddress?.pincode}
                  </div>
                </div>
              </div>

              <div className="bc-form-group">
                <label className="bc-form-label">
                  <i className="fa-solid fa-barcode"></i>
                  Tracking Number *
                </label>
                <input
                  type="text"
                  className="bc-form-input"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="bc-modal-footer">
              <button className="bc-btn-secondary" onClick={() => setShowShipModal(false)}>
                Cancel
              </button>
              <button 
                className="bc-btn-primary" 
                onClick={() => handleApplicationAction(selectedApplication._id, 'ship', { trackingNumber })}
                disabled={actionLoading || !trackingNumber}
              >
                {actionLoading ? (
                  <>
                    <div className="bc-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    Marking...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Mark as Shipped
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="bc-modal-overlay" onClick={() => setShowApplicationModal(false)}>
          <div className="bc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bc-modal-header">
              <h3 className="bc-modal-title">
                <i className="fa-solid fa-user"></i>
                Application Details
              </h3>
              <button className="bc-modal-close" onClick={() => setShowApplicationModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="bc-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div className="bc-creator-avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                  {getInitials(selectedApplication.creatorName)}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                    {selectedApplication.creatorName}
                  </h3>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                    {selectedApplication.creatorFollowerCount} followers • {selectedApplication.creatorNiche}
                  </div>
                </div>
              </div>

              {selectedApplication.creatorSocialHandles && Object.keys(selectedApplication.creatorSocialHandles).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', color: '#a5b4fc', marginBottom: '12px' }}>Social Profiles</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(selectedApplication.creatorSocialHandles)
                      .filter(([, handle]) => handle)
                      .map(([platform, handle]) => (
                        <a 
                          key={platform}
                          href={platform === 'instagram' ? `https://instagram.com/${handle.replace('@', '')}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#94a3b8',
                            textDecoration: 'none',
                          }}
                        >
                          <i className={`fa-brands fa-${platform}`}></i>
                          {handle}
                        </a>
                      ))
                    }
                  </div>
                </div>
              )}

              {selectedApplication.contentLink && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', color: '#a5b4fc', marginBottom: '12px' }}>Submitted Content</h4>
                  <a 
                    href={selectedApplication.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: '10px',
                      color: '#a5b4fc',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                  >
                    <i className="fa-solid fa-external-link"></i>
                    View Content
                  </a>
                </div>
              )}

              {selectedApplication.trackingNumber && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', color: '#a5b4fc', marginBottom: '12px' }}>Shipping Info</h4>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    padding: '12px 16px', 
                    borderRadius: '10px',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: '#94a3b8' }}>Tracking: </span>
                    <span style={{ color: '#f8fafc', fontWeight: 500 }}>{selectedApplication.trackingNumber}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bc-modal-footer">
              <button className="bc-btn-secondary" onClick={() => setShowApplicationModal(false)}>
                Close
              </button>
              {selectedApplication.status === 'submitted' && (
                <>
                  <button 
                    className="bc-btn-secondary"
                    onClick={() => handleApplicationAction(selectedApplication._id, 'request_revision', { feedback: 'Please revise the content' })}
                    disabled={actionLoading}
                  >
                    <i className="fa-solid fa-edit"></i>
                    Request Revision
                  </button>
                  <button 
                    className="bc-btn-primary"
                    onClick={() => handleApplicationAction(selectedApplication._id, 'approve_content')}
                    disabled={actionLoading}
                  >
                    <i className="fa-solid fa-check"></i>
                    Approve Content
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Invite Modal */}
      {showInviteModal && (
        <div className="bc-modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="bc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bc-modal-header">
              <h3 className="bc-modal-title">
                <i className="fa-solid fa-paper-plane"></i>
                Invite {selectedCreators.size} Creators to Campaign
              </h3>
              <button className="bc-modal-close" onClick={() => setShowInviteModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="bc-modal-body">
              {inviteSuccess ? (
                <div className="bc-success-message">
                  <i className="fa-solid fa-check-circle"></i>
                  {inviteSuccess}
                </div>
              ) : (
                <>
                  {actionError && (
                    <div style={{ 
                      background: 'rgba(239, 68, 68, 0.2)', 
                      color: '#fca5a5', 
                      padding: '12px', 
                      borderRadius: '10px', 
                      marginBottom: '20px',
                      fontSize: '14px'
                    }}>
                      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                      {actionError}
                    </div>
                  )}

                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-gift"></i>
                      Select Campaign/Offer *
                    </label>
                    <select
                      className="bc-form-input bc-form-select"
                      value={selectedOfferForInvite}
                      onChange={(e) => setSelectedOfferForInvite(e.target.value)}
                      required
                    >
                      <option value="">Choose an offer to invite creators</option>
                      {offers.filter(o => o.status === 'active').map(offer => (
                        <option key={offer._id} value={offer._id}>
                          {offer.productName} - ₹{offer.productValue.toLocaleString()} ({offer.filledSlots}/{offer.totalSlots} filled)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bc-form-group">
                    <label className="bc-form-label">
                      <i className="fa-solid fa-message"></i>
                      Custom Message (Optional)
                    </label>
                    <textarea
                      className="bc-form-input bc-form-textarea"
                      placeholder="Add a personalized message for the creators..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="bc-selected-creators-preview">
                    <h4>Selected Creators ({selectedCreators.size})</h4>
                    <div className="bc-selected-avatars">
                      {creators
                        .filter(c => selectedCreators.has(c.id))
                        .slice(0, 8)
                        .map(creator => (
                          <div key={creator.id} className="bc-mini-avatar" title={creator.name}>
                            {getInitials(creator.name)}
                          </div>
                        ))
                      }
                      {selectedCreators.size > 8 && (
                        <div className="bc-mini-avatar more">+{selectedCreators.size - 8}</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {!inviteSuccess && (
              <div className="bc-modal-footer">
                <button className="bc-btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button 
                  className="bc-btn-primary" 
                  onClick={handleBulkInvite}
                  disabled={inviteLoading || !selectedOfferForInvite}
                >
                  {inviteLoading ? (
                    <>
                      <div className="bc-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Send Invitations
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
