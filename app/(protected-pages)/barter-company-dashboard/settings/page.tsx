"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CompanyProfile {
  companyName: string;
  industry: string;
  website?: string;
  logo?: string;
  description?: string;
  city?: string;
  address?: string;
  gstNumber?: string;
  contactPerson: string;
  contactPhone?: string;
  socialHandles?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  productsCategories: string[];
  averageProductValue?: number;
  monthlyBarterBudget?: string;
}

export default function BarterCompanySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login-barter-company');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'barter_company') {
      router.push('/login-barter-company');
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/barter/company/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.company.companyProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token || !profile) return;

    try {
      const response = await fetch('/api/barter/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ companyProfile: profile }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess('Profile updated successfully!');
      
      // Update local storage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.companyProfile = profile;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/barter-company-dashboard" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px',
          }}>
            <i className="fa-solid fa-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Company Settings</h1>
        <div style={{ width: '120px' }}></div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Quick Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <Link
            href="/barter-company-dashboard/settings/security"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              textDecoration: 'none',
              color: '#f8fafc',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
            }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>Security & Notifications</p>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Password, 2FA, and notification preferences</p>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: '#64748b' }}></i>
          </Link>
          <Link
            href="/barter-company-dashboard/settings/notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              textDecoration: 'none',
              color: '#f8fafc',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
            }}>
              <i className="fa-solid fa-bell"></i>
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>Notifications</p>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>View all your notifications</p>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: '#64748b' }}></i>
          </Link>
        </div>

        <form onSubmit={handleSave}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#4ade80',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <i className="fa-solid fa-check-circle"></i>
              {success}
            </div>
          )}

          {/* Company Info Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-building" style={{ color: '#6366f1' }}></i>
              Company Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={profile?.companyName || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  Industry
                </label>
                <input
                  type="text"
                  value={profile?.industry || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, industry: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  Website
                </label>
                <input
                  type="url"
                  value={profile?.website || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, website: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  City
                </label>
                <input
                  type="text"
                  value={profile?.city || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, city: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                Company Description
              </label>
              <textarea
                value={profile?.description || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, description: e.target.value } : null)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Contact Info Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-user" style={{ color: '#6366f1' }}></i>
              Contact Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  Contact Person *
                </label>
                <input
                  type="text"
                  value={profile?.contactPerson || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, contactPerson: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={profile?.contactPhone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, contactPhone: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  GST Number
                </label>
                <input
                  type="text"
                  value={profile?.gstNumber || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, gstNumber: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={profile?.address || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-share-nodes" style={{ color: '#6366f1' }}></i>
              Social Media
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { id: 'instagram', icon: 'fa-instagram', color: '#E4405F' },
                { id: 'facebook', icon: 'fa-facebook', color: '#1877F2' },
                { id: 'linkedin', icon: 'fa-linkedin', color: '#0A66C2' },
                { id: 'twitter', icon: 'fa-x-twitter', color: '#000' },
                { id: 'youtube', icon: 'fa-youtube', color: '#FF0000' },
              ].map((platform) => (
                <div key={platform.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: platform.color,
                  }}>
                    <i className={`fa-brands ${platform.icon}`}></i>
                  </div>
                  <input
                    type="text"
                    value={(profile?.socialHandles as Record<string, string>)?.[platform.id] || ''}
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev,
                      socialHandles: {
                        ...prev.socialHandles,
                        [platform.id]: e.target.value,
                      }
                    } : null)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '14px',
                    }}
                    placeholder={`@${platform.id}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link
              href="/barter-company-dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Saving...
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

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
}
