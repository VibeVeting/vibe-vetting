"use client";

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { useAuth } from '@/contexts/auth-context';

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
    campaignName?: string;
    score?: number;
  };
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isVisible, setIsVisible] = useState(false);
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    creatorMatches: true,
    riskAlerts: true,
    campaignUpdates: true,
    aiInsights: true,
    emailNotifications: false,
  });

  const toggleNotificationPref = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ read: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAllRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!token) return;
    const ids = notifications.map(n => n._id);
    await Promise.all(ids.map(id => deleteNotification(id)));
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'match': return 'fa-heart';
      case 'alert': return 'fa-triangle-exclamation';
      case 'campaign': return 'fa-bullhorn';
      case 'system': return 'fa-gear';
      case 'success': return 'fa-check-circle';
      case 'insight': return 'fa-lightbulb';
      default: return 'fa-bell';
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="yc-page">
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
                <div className="yc-page-icon" style={{ background: 'var(--gradient-warning)' }}>
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div>
                  <h1 className="yc-page-title">Notifications</h1>
                  <p className="yc-page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="yc-page-actions">
                {unreadCount > 0 && (
                  <button className="yc-btn-secondary" onClick={markAllAsRead}>
                    <i className="fa-solid fa-check-double"></i> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button className="yc-btn-secondary" onClick={clearAll}>
                    <i className="fa-solid fa-trash"></i> Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* YC Notification Controls */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '24px' }}>
            <div className="yc-tabs" style={{ marginBottom: 0 }}>
              <button 
                className={`yc-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <span>All</span>
                <span className="yc-tab-count">{notifications.length}</span>
              </button>
              <button 
                className={`yc-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                <span>Unread</span>
                {unreadCount > 0 && <span className="yc-tab-count">{unreadCount}</span>}
              </button>
            </div>

            <select 
              className="yc-filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="match">Matches</option>
              <option value="alert">Alerts</option>
              <option value="campaign">Campaigns</option>
              <option value="success">Success</option>
              <option value="insight">AI Insights</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* YC Notifications List */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {loading ? (
              <div className="yc-empty-state-card" style={{ gridColumn: 'unset' }}>
                <div className="yc-empty-icon">
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="45" stroke="url(#loadGradNotif)" strokeWidth="2" strokeDasharray="8 8">
                      <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <defs>
                      <linearGradient id="loadGradNotif" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3>Loading notifications...</h3>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <div 
                  key={notification._id} 
                  className={`yc-notification-item ${!notification.read ? 'unread' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {!notification.read && (
                    <div className="yc-notification-unread-indicator"></div>
                  )}
                  
                  <div className={`yc-notification-icon ${notification.type || 'default'}`}>
                    {notification.metadata?.avatar ? (
                      <span>{notification.metadata.avatar}</span>
                    ) : (
                      <i className={`fa-solid ${getTypeIcon(notification.type)}`}></i>
                    )}
                  </div>

                  <div className="yc-notification-content">
                    <div className="yc-notification-header">
                      <h4 className="yc-notification-title">{notification.title}</h4>
                      <span className="yc-notification-time">{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="yc-notification-body">{notification.body}</p>
                    
                    {notification.metadata?.score && (
                      <div className="yc-notification-score">
                        <div className="yc-notification-score-bar">
                          <div className="yc-notification-score-fill" style={{ width: `${notification.metadata.score}%` }}></div>
                        </div>
                        <span className="yc-notification-score-text">{notification.metadata.score}% Match</span>
                      </div>
                    )}

                    {notification.metadata?.actionUrl && (
                      <a href={notification.metadata.actionUrl} className="yc-btn-primary" style={{ padding: '8px 16px', fontSize: '12px', marginTop: '12px', display: 'inline-flex' }}>
                        {notification.metadata.actionLabel || 'View'}
                        <i className="fa-solid fa-arrow-right"></i>
                      </a>
                    )}
                  </div>

                  <div className="yc-notification-actions">
                    {!notification.read && (
                      <button 
                        className="yc-notification-action-btn read"
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                    <button 
                      className="yc-notification-action-btn delete"
                      onClick={() => deleteNotification(notification._id)}
                      title="Delete"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="yc-empty-state-card" style={{ gridColumn: 'unset' }}>
                <div className="yc-empty-icon">
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="40" stroke="url(#emptyGradNotif)" strokeWidth="2" strokeDasharray="4 4"/>
                    <path d="M50 30 L50 55 M50 65 L50 70" stroke="url(#emptyGradNotif)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="emptyGradNotif" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3>{filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}</h3>
                <p>{filter === 'unread' ? 'You have no unread notifications' : "You don't have any notifications yet"}</p>
              </div>
            )}
          </div>

          {/* YC Notification Settings Card */}
          <div className="yc-notification-settings-card">
            <div className="yc-notification-settings-header">
              <div className="yc-notification-settings-icon">
                <i className="fa-solid fa-gear"></i>
              </div>
              <div>
                <h3 className="yc-notification-settings-title">Notification Preferences</h3>
                <p className="yc-notification-settings-subtitle">Customize how you receive updates</p>
              </div>
            </div>
            <div className="yc-notification-settings-list">
              {[
                { key: 'creatorMatches' as const, label: 'Creator Matches', desc: 'Get notified when new creators match your campaigns' },
                { key: 'riskAlerts' as const, label: 'Risk Alerts', desc: 'Receive alerts about creator risks and fake engagement' },
                { key: 'campaignUpdates' as const, label: 'Campaign Updates', desc: 'Updates about your active campaigns' },
                { key: 'aiInsights' as const, label: 'AI Insights', desc: 'Personalized insights and recommendations from AI' },
                { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Also receive notifications via email' },
              ].map((setting) => (
                <div key={setting.key} className="yc-notification-setting-item">
                  <div>
                    <span className="yc-notification-setting-label">{setting.label}</span>
                    <span className="yc-notification-setting-desc">{setting.desc}</span>
                  </div>
                  <div 
                    className={`yc-notification-toggle ${notificationPrefs[setting.key] ? 'active' : 'inactive'}`}
                    onClick={() => toggleNotificationPref(setting.key)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="yc-notification-toggle-knob"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
