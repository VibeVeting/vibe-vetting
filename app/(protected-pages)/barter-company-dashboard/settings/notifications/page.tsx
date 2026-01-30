"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  _id: string;
  type?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  metadata?: {
    actionUrl?: string;
    actionLabel?: string;
    avatar?: string;
    creatorName?: string;
    offerName?: string;
    applicationId?: string;
  };
}

interface SecurityLog {
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
}

export default function BarterCompanyNotifications() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'applications' | 'content' | 'security'>('all');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
      // Fetch notifications
      const notifRes = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }

      // Fetch security logs
      const secRes = await fetch('/api/barter/company/security?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (secRes.ok) {
        const data = await secRes.json();
        setSecurityLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, read: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
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
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'application': return 'fa-user-plus';
      case 'content': return 'fa-image';
      case 'security': return 'fa-shield-halved';
      case 'offer': return 'fa-gift';
      case 'system': return 'fa-gear';
      case 'success': return 'fa-check-circle';
      default: return 'fa-bell';
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'application': return '#22c55e';
      case 'content': return '#6366f1';
      case 'security': return '#ef4444';
      case 'offer': return '#f59e0b';
      case 'system': return '#64748b';
      case 'success': return '#22c55e';
      default: return '#6366f1';
    }
  };

  const getSecurityIcon = (action: string) => {
    if (action.includes('password')) return 'fa-key';
    if (action.includes('2fa')) return 'fa-shield-halved';
    if (action.includes('login')) return 'fa-right-to-bracket';
    return 'fa-circle-info';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (activeTab === 'applications' && n.type !== 'application') return false;
    if (activeTab === 'content' && n.type !== 'content') return false;
    if (activeTab === 'security' && n.type !== 'security') return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
        <h1 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-bell" style={{ color: '#f59e0b' }}></i>
          Notifications
          {unreadCount > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {unreadCount}
            </span>
          )}
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#94a3b8',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-check-double"></i>
              Mark all read
            </button>
          )}
          <Link
            href="/barter-company-dashboard/settings/security"
            style={{
              padding: '8px 16px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: '#a5b4fc',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-gear"></i>
            Settings
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(15, 23, 42, 0.4)',
        flexWrap: 'wrap',
      }}>
        {[
          { id: 'all', label: 'All', icon: 'fa-inbox' },
          { id: 'applications', label: 'Applications', icon: 'fa-user-plus' },
          { id: 'content', label: 'Content', icon: 'fa-image' },
          { id: 'security', label: 'Security', icon: 'fa-shield-halved' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
              borderRadius: '10px',
              color: activeTab === tab.id ? '#a5b4fc' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              background: filter === 'all' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: filter === 'all' ? '#f8fafc' : '#64748b',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              padding: '8px 16px',
              background: filter === 'unread' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: filter === 'unread' ? '#f8fafc' : '#64748b',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Main Notifications */}
          <div>
            {filteredNotifications.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '60px 40px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#6366f1',
                  fontSize: '24px',
                }}>
                  <i className="fa-solid fa-bell-slash"></i>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No notifications</h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '16px',
                      background: notification.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.05)',
                      border: `1px solid ${notification.read ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.2)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: `${getTypeColor(notification.type)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getTypeColor(notification.type),
                      flexShrink: 0,
                    }}>
                      <i className={`fa-solid ${getTypeIcon(notification.type)}`}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ 
                          fontWeight: notification.read ? 400 : 600, 
                          marginBottom: '4px', 
                          fontSize: '14px',
                          color: notification.read ? '#94a3b8' : '#f8fafc',
                        }}>
                          {notification.title}
                        </p>
                        <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                        {notification.body}
                      </p>
                      {notification.metadata?.actionUrl && (
                        <Link
                          href={notification.metadata.actionUrl}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '6px',
                            color: '#a5b4fc',
                            fontSize: '12px',
                            textDecoration: 'none',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.metadata.actionLabel || 'View Details'}
                          <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i>
                        </Link>
                      )}
                    </div>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        flexShrink: 0,
                        marginTop: '6px',
                      }}></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        opacity: 0.6,
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Security Activity */}
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: '#ef4444' }}></i>
                  Security Activity
                </h3>
                <Link
                  href="/barter-company-dashboard/settings/security"
                  style={{
                    fontSize: '12px',
                    color: '#6366f1',
                    textDecoration: 'none',
                  }}
                >
                  View all
                </Link>
              </div>

              {securityLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  <i className="fa-solid fa-shield-check" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                  <p style={{ fontSize: '13px' }}>No security activity</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {securityLogs.slice(0, 5).map((log, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: log.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: log.success ? '#22c55e' : '#ef4444',
                        fontSize: '12px',
                      }}>
                        <i className={`fa-solid ${getSecurityIcon(log.action)}`}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details || log.action.replace(/_/g, ' ')}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>
                          {formatTimeAgo(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginTop: '16px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  href="/barter-company-dashboard/settings/security"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                >
                  <i className="fa-solid fa-key" style={{ color: '#6366f1' }}></i>
                  Change Password
                  <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: '#64748b', fontSize: '10px' }}></i>
                </Link>
                <Link
                  href="/barter-company-dashboard/settings/security"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                >
                  <i className="fa-solid fa-shield-halved" style={{ color: '#22c55e' }}></i>
                  Enable 2FA
                  <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: '#64748b', fontSize: '10px' }}></i>
                </Link>
                <Link
                  href="/barter-company-dashboard/settings/security"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#f8fafc',
                    fontSize: '13px',
                  }}
                >
                  <i className="fa-solid fa-bell" style={{ color: '#f59e0b' }}></i>
                  Notification Preferences
                  <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: '#64748b', fontSize: '10px' }}></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
