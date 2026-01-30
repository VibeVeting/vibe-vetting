"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NotificationPreferences {
  // Email Notifications
  emailApplicationReceived: boolean;
  emailApplicationApproved: boolean;
  emailContentSubmitted: boolean;
  emailContentApproved: boolean;
  emailOfferExpiring: boolean;
  emailWeeklyDigest: boolean;
  emailMarketingUpdates: boolean;

  // Push Notifications
  pushApplicationReceived: boolean;
  pushApplicationApproved: boolean;
  pushContentSubmitted: boolean;
  pushContentApproved: boolean;
  pushOfferExpiring: boolean;

  // Security Notifications
  securityLoginAlert: boolean;
  securityPasswordChange: boolean;
  securityTwoFactorChange: boolean;
  securityNewDevice: boolean;
  securityUnusualActivity: boolean;
}

interface SecurityLog {
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  success: boolean;
  details?: string;
}

const defaultPreferences: NotificationPreferences = {
  emailApplicationReceived: true,
  emailApplicationApproved: true,
  emailContentSubmitted: true,
  emailContentApproved: true,
  emailOfferExpiring: true,
  emailWeeklyDigest: true,
  emailMarketingUpdates: false,
  pushApplicationReceived: true,
  pushApplicationApproved: true,
  pushContentSubmitted: true,
  pushContentApproved: true,
  pushOfferExpiring: true,
  securityLoginAlert: true,
  securityPasswordChange: true,
  securityTwoFactorChange: true,
  securityNewDevice: true,
  securityUnusualActivity: true,
};

export default function SecurityNotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'security' | 'notifications'>('security');
  
  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);
  
  // Notification preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  
  // Security logs
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

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

    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      // Fetch profile for 2FA status
      const profileRes = await fetch('/api/barter/company/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setTwoFactorEnabled(data.company.twoFactorEnabled || false);
      }

      // Fetch notification preferences
      const prefsRes = await fetch('/api/barter/company/notification-preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prefsRes.ok) {
        const data = await prefsRes.json();
        setPreferences({ ...defaultPreferences, ...data.preferences });
      }

      // Fetch security logs
      await fetchSecurityLogs(token);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityLogs = async (token?: string) => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) return;
    
    setLoadingLogs(true);
    try {
      const response = await fetch('/api/barter/company/security?limit=20', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSecurityLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setChangingPassword(true);
    try {
      const response = await fetch('/api/barter/company/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      await fetchSecurityLogs();
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setChangingPassword(false);
    }
  };

  const handle2FAToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setToggling2FA(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/barter/company/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'toggle_2fa',
          twoFactorEnabled: !twoFactorEnabled,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to toggle 2FA');
        return;
      }

      setTwoFactorEnabled(data.twoFactorEnabled);
      setSuccess(data.message);
      await fetchSecurityLogs();
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setToggling2FA(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const savePreferences = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/barter/company/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save preferences');
        return;
      }

      setSuccess('Notification preferences saved!');
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const clearSecurityLogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/barter/company/security', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setSecurityLogs([]);
        setSuccess('Security logs cleared');
      }
    } catch (err) {
      setError('Failed to clear logs');
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  const getLogIcon = (action: string) => {
    if (action.includes('password')) return 'fa-key';
    if (action.includes('2fa')) return 'fa-shield-halved';
    if (action.includes('login')) return 'fa-right-to-bracket';
    if (action.includes('device')) return 'fa-desktop';
    return 'fa-circle-info';
  };

  const getLogColor = (success: boolean, action: string) => {
    if (!success) return '#ef4444';
    if (action.includes('enabled')) return '#22c55e';
    if (action.includes('disabled')) return '#f59e0b';
    return '#6366f1';
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
          <Link href="/barter-company-dashboard/settings" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px',
          }}>
            <i className="fa-solid fa-arrow-left"></i>
            Back to Settings
          </Link>
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Security & Notifications</h1>
        <div style={{ width: '120px' }}></div>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(15, 23, 42, 0.4)',
      }}>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'security' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'security' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
            borderRadius: '10px',
            color: activeTab === 'security' ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-shield-halved"></i>
          Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'notifications' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'notifications' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
            borderRadius: '10px',
            color: activeTab === 'notifications' ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-bell"></i>
          Notifications
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {/* Messages */}
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

        {activeTab === 'security' && (
          <div>
            {/* Two-Factor Authentication */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-shield-halved" style={{ color: '#6366f1' }}></i>
                Two-Factor Authentication
              </h2>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
              }}>
                <div>
                  <p style={{ fontWeight: 500, marginBottom: '4px' }}>
                    {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Add an extra layer of security to your account by requiring a verification code.
                  </p>
                </div>
                <button
                  onClick={handle2FAToggle}
                  disabled={toggling2FA}
                  style={{
                    padding: '10px 20px',
                    background: twoFactorEnabled ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: twoFactorEnabled ? '1px solid rgba(239, 68, 68, 0.5)' : 'none',
                    borderRadius: '10px',
                    color: twoFactorEnabled ? '#fca5a5' : 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: toggling2FA ? 0.7 : 1,
                  }}
                >
                  {toggling2FA ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : twoFactorEnabled ? (
                    <i className="fa-solid fa-toggle-on"></i>
                  ) : (
                    <i className="fa-solid fa-toggle-off"></i>
                  )}
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Password Change */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-key" style={{ color: '#6366f1' }}></i>
                Password
              </h2>

              {!showPasswordChange ? (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-pen"></i>
                  Change Password
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
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
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '14px',
                      }}
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#a5b4fc', marginBottom: '8px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setError('');
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#94a3b8',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={changingPassword}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: changingPassword ? 0.7 : 1,
                      }}
                    >
                      {changingPassword ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa-solid fa-check"></i>
                      )}
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Security Activity Log */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ color: '#6366f1' }}></i>
                  Security Activity
                </h2>
                {securityLogs.length > 0 && (
                  <button
                    onClick={clearSecurityLogs}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#fca5a5',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fa-solid fa-trash"></i>
                    Clear Logs
                  </button>
                )}
              </div>

              {loadingLogs ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
                </div>
              ) : securityLogs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#64748b',
                }}>
                  <i className="fa-solid fa-shield-check" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
                  <p>No security activity recorded yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {securityLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '10px',
                        borderLeft: `3px solid ${getLogColor(log.success, log.action)}`,
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${getLogColor(log.success, log.action)}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getLogColor(log.success, log.action),
                        flexShrink: 0,
                      }}>
                        <i className={`fa-solid ${getLogIcon(log.action)}`}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 500, marginBottom: '4px', fontSize: '14px' }}>
                          {log.details || log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                          <span>{formatTimeAgo(log.timestamp)}</span>
                          {log.ipAddress && log.ipAddress !== 'Unknown' && (
                            <span>IP: {log.ipAddress}</span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: log.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: log.success ? '#4ade80' : '#fca5a5',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>
                        {log.success ? 'Success' : 'Failed'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            {/* Email Notifications */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-envelope" style={{ color: '#6366f1' }}></i>
                Email Notifications
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'emailApplicationReceived', label: 'New Applications', desc: 'Get notified when creators apply to your offers' },
                  { key: 'emailApplicationApproved', label: 'Application Updates', desc: 'Status changes on applications' },
                  { key: 'emailContentSubmitted', label: 'Content Submissions', desc: 'When creators submit content for review' },
                  { key: 'emailContentApproved', label: 'Content Approvals', desc: 'Content approval confirmations' },
                  { key: 'emailOfferExpiring', label: 'Offer Expiry Reminders', desc: 'Reminders before your offers expire' },
                  { key: 'emailWeeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of your barter activity' },
                  { key: 'emailMarketingUpdates', label: 'Marketing & Tips', desc: 'Product updates and marketing tips' },
                ].map((item) => (
                  <NotificationToggle
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    checked={preferences[item.key as keyof NotificationPreferences]}
                    onChange={() => handlePreferenceChange(item.key as keyof NotificationPreferences)}
                  />
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-mobile-screen" style={{ color: '#6366f1' }}></i>
                Push Notifications
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'pushApplicationReceived', label: 'New Applications', desc: 'Instant alerts for new applications' },
                  { key: 'pushApplicationApproved', label: 'Application Updates', desc: 'Real-time status changes' },
                  { key: 'pushContentSubmitted', label: 'Content Submissions', desc: 'Alerts when content is submitted' },
                  { key: 'pushContentApproved', label: 'Content Approvals', desc: 'Confirmation alerts' },
                  { key: 'pushOfferExpiring', label: 'Offer Expiry Alerts', desc: 'Urgent reminders for expiring offers' },
                ].map((item) => (
                  <NotificationToggle
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    checked={preferences[item.key as keyof NotificationPreferences]}
                    onChange={() => handlePreferenceChange(item.key as keyof NotificationPreferences)}
                  />
                ))}
              </div>
            </div>

            {/* Security Notifications */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-shield-halved" style={{ color: '#6366f1' }}></i>
                Security Notifications
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'securityLoginAlert', label: 'Login Alerts', desc: 'Get notified of new sign-ins' },
                  { key: 'securityPasswordChange', label: 'Password Changes', desc: 'Alerts when password is changed' },
                  { key: 'securityTwoFactorChange', label: '2FA Changes', desc: 'Alerts when 2FA settings change' },
                  { key: 'securityNewDevice', label: 'New Device Login', desc: 'Alerts for logins from new devices' },
                  { key: 'securityUnusualActivity', label: 'Unusual Activity', desc: 'Alerts for suspicious account activity' },
                ].map((item) => (
                  <NotificationToggle
                    key={item.key}
                    label={item.label}
                    description={item.desc}
                    checked={preferences[item.key as keyof NotificationPreferences]}
                    onChange={() => handlePreferenceChange(item.key as keyof NotificationPreferences)}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={savePreferences}
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
                  opacity: saving ? 0.7 : 1,
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
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
}

// Toggle component
function NotificationToggle({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: () => void; 
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        cursor: 'pointer',
      }}
      onClick={onChange}
    >
      <div>
        <p style={{ fontWeight: 500, marginBottom: '2px', fontSize: '14px' }}>{label}</p>
        <p style={{ fontSize: '12px', color: '#64748b' }}>{description}</p>
      </div>
      <div
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          background: checked ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255, 255, 255, 0.1)',
          position: 'relative',
          transition: 'background 0.2s',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'white',
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>
    </div>
  );
}
