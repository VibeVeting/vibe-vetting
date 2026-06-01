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

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'match': return 'Match';
      case 'alert': return 'Alert';
      case 'campaign': return 'Campaign';
      case 'system': return 'System';
      case 'success': return 'Success';
      case 'insight': return 'AI Insight';
      default: return 'Notification';
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
                <div className="yc-page-icon" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #ec4899 50%, #764ba2 100%)',
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <i className="fa-solid fa-bell"></i>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '22px',
                      height: '22px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'white',
                      border: '2px solid var(--bg-elevated)',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="yc-page-title" style={{ 
                    background: 'linear-gradient(135deg, var(--text-primary) 0%, #667eea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Notifications</h1>
                  <p className="yc-page-subtitle">
                    {unreadCount > 0 
                      ? `${unreadCount} new update${unreadCount !== 1 ? 's' : ''} waiting for you` 
                      : 'Stay updated with your latest activities'}
                  </p>
                </div>
              </div>
              <div className="yc-page-actions">
                {unreadCount > 0 && (
                  <button className="yc-btn-secondary" onClick={markAllAsRead} style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    color: '#22c55e'
                  }}>
                    <i className="fa-solid fa-check-double"></i> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button className="yc-btn-secondary" onClick={clearAll} style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                  }}>
                    <i className="fa-solid fa-trash"></i> Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* YC Notification Controls */}
          <div style={{ 
            position: 'relative', 
            zIndex: 10, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '20px', 
            marginBottom: '28px',
            padding: '16px 20px',
            background: 'var(--bg-elevated)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}>
            <div className="yc-tabs" style={{ marginBottom: 0, gap: '8px' }}>
              <button 
                className={`yc-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
                style={{ 
                  borderRadius: '10px',
                  padding: '10px 18px',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fa-solid fa-inbox" style={{ marginRight: '8px', fontSize: '12px' }}></i>
                <span>All</span>
                <span className="yc-tab-count" style={{ 
                  background: filter === 'all' ? 'rgba(255,255,255,0.2)' : 'var(--bg-active)',
                  marginLeft: '8px'
                }}>{notifications.length}</span>
              </button>
              <button 
                className={`yc-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
                style={{ 
                  borderRadius: '10px',
                  padding: '10px 18px',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fa-solid fa-circle" style={{ marginRight: '8px', fontSize: '8px', color: filter === 'unread' ? 'white' : '#667eea' }}></i>
                <span>Unread</span>
                {unreadCount > 0 && <span className="yc-tab-count" style={{ 
                  background: filter === 'unread' ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  marginLeft: '8px'
                }}>{unreadCount}</span>}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                <i className="fa-solid fa-filter" style={{ marginRight: '6px' }}></i>
                Filter by:
              </span>
              <select 
                className="yc-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  padding: '10px 36px 10px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <option value="all">🔔 All Types</option>
                <option value="match">💜 Matches</option>
                <option value="alert">⚠️ Alerts</option>
                <option value="campaign">📢 Campaigns</option>
                <option value="success">✅ Success</option>
                <option value="insight">💡 AI Insights</option>
                <option value="system">⚙️ System</option>
              </select>
            </div>
          </div>

          {/* YC Notifications List */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {loading ? (
              <div className="yc-empty-state-card" style={{ 
                gridColumn: 'unset', 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(236, 72, 153, 0.03) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <div className="yc-empty-icon">
                  <svg viewBox="0 0 100 100" fill="none" style={{ width: '80px', height: '80px' }}>
                    <circle cx="50" cy="50" r="45" stroke="url(#loadGradNotif)" strokeWidth="3" strokeDasharray="8 8">
                      <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="50" cy="50" r="30" stroke="url(#loadGradNotif2)" strokeWidth="2" strokeDasharray="4 4">
                      <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <path d="M50 30 L50 50 L65 55" stroke="url(#loadGradNotif)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="loadGradNotif" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                      <linearGradient id="loadGradNotif2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899"/>
                        <stop offset="100%" stopColor="#764ba2"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 style={{ marginTop: '16px', background: 'linear-gradient(135deg, #667eea 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Loading notifications...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Fetching your latest updates</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <div 
                  key={notification._id} 
                  className={`yc-notification-item ${!notification.read ? 'unread' : ''}`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {!notification.read && (
                    <div className="yc-notification-unread-indicator"></div>
                  )}
                  
                  <div className={`yc-notification-icon ${notification.type || 'default'}`}>
                    {notification.metadata?.avatar ? (
                      <span style={{ fontSize: '24px' }}>{notification.metadata.avatar}</span>
                    ) : (
                      <i className={`fa-solid ${getTypeIcon(notification.type)}`}></i>
                    )}
                  </div>

                  <div className="yc-notification-content">
                    <div className="yc-notification-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 className="yc-notification-title">{notification.title}</h4>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: notification.type === 'match' ? 'rgba(236, 72, 153, 0.15)' :
                                     notification.type === 'alert' ? 'rgba(245, 158, 11, 0.15)' :
                                     notification.type === 'success' ? 'rgba(34, 197, 94, 0.15)' :
                                     notification.type === 'insight' ? 'rgba(139, 92, 246, 0.15)' :
                                     'rgba(102, 126, 234, 0.15)',
                          color: notification.type === 'match' ? '#ec4899' :
                                notification.type === 'alert' ? '#f59e0b' :
                                notification.type === 'success' ? '#22c55e' :
                                notification.type === 'insight' ? '#8b5cf6' :
                                '#667eea'
                        }}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      <span className="yc-notification-time">
                        <i className="fa-regular fa-clock" style={{ marginRight: '5px', opacity: 0.7 }}></i>
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="yc-notification-body">{notification.body}</p>
                    
                    {notification.metadata?.creatorName && (
                      <div style={{ 
                        marginTop: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--bg-hover)',
                        borderRadius: '10px',
                        width: 'fit-content'
                      }}>
                        <i className="fa-solid fa-user-circle" style={{ color: '#667eea' }}></i>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {notification.metadata.creatorName}
                        </span>
                      </div>
                    )}
                    
                    {notification.metadata?.score && (
                      <div className="yc-notification-score">
                        <div className="yc-notification-score-bar">
                          <div className="yc-notification-score-fill" style={{ width: `${notification.metadata.score}%` }}></div>
                        </div>
                        <span className="yc-notification-score-text">{notification.metadata.score}% Match</span>
                      </div>
                    )}

                    {notification.metadata?.actionUrl && (
                      <a href={notification.metadata.actionUrl} className="yc-btn-primary" style={{ 
                        padding: '10px 18px', 
                        fontSize: '13px', 
                        marginTop: '14px', 
                        display: 'inline-flex',
                        gap: '8px',
                        borderRadius: '10px',
                        fontWeight: 600
                      }}>
                        {notification.metadata.actionLabel || 'View Details'}
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px' }}></i>
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
              <div className="yc-empty-state-card" style={{ 
                gridColumn: 'unset',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(236, 72, 153, 0.02) 100%)',
                border: '1px dashed rgba(102, 126, 234, 0.3)',
                padding: '60px 40px'
              }}>
                <div className="yc-empty-icon" style={{ position: 'relative' }}>
                  <svg viewBox="0 0 100 100" fill="none" style={{ width: '100px', height: '100px' }}>
                    <circle cx="50" cy="50" r="45" stroke="url(#emptyGradNotif)" strokeWidth="2" strokeDasharray="6 6" opacity="0.5"/>
                    <circle cx="50" cy="50" r="32" fill="url(#emptyGradBg)" opacity="0.1"/>
                    <path d="M50 25 L50 35 M50 40 L50 50 L60 55" stroke="url(#emptyGradNotif)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="50" cy="50" r="22" stroke="url(#emptyGradNotif)" strokeWidth="2" fill="none"/>
                    <path d="M65 65 L75 75" stroke="url(#emptyGradNotif)" strokeWidth="3" strokeLinecap="round"/>
                    <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite"/>
                    <defs>
                      <linearGradient id="emptyGradNotif" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea"/>
                        <stop offset="50%" stopColor="#ec4899"/>
                        <stop offset="100%" stopColor="#764ba2"/>
                      </linearGradient>
                      <radialGradient id="emptyGradBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#667eea"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </radialGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '28px'
                  }}>
                    {filter === 'unread' ? '✨' : '🔔'}
                  </div>
                </div>
                <h3 style={{ 
                  marginTop: '24px', 
                  fontSize: '22px',
                  background: 'linear-gradient(135deg, #667eea 0%, #ec4899 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800
                }}>
                  {filter === 'unread' ? 'All Caught Up!' : 'No Notifications Yet'}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginTop: '12px',
                  fontSize: '15px',
                  maxWidth: '300px',
                  lineHeight: 1.6
                }}>
                  {filter === 'unread' 
                    ? "You've read all your notifications. Great job staying on top of things!" 
                    : "When you have new matches, alerts, or updates, they'll appear here."}
                </p>
                <div style={{
                  marginTop: '24px',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    padding: '8px 16px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#667eea',
                    fontWeight: 600
                  }}>
                    <i className="fa-solid fa-heart" style={{ marginRight: '6px' }}></i>
                    Matches
                  </span>
                  <span style={{
                    padding: '8px 16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#f59e0b',
                    fontWeight: 600
                  }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                    Alerts
                  </span>
                  <span style={{
                    padding: '8px 16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#8b5cf6',
                    fontWeight: 600
                  }}>
                    <i className="fa-solid fa-lightbulb" style={{ marginRight: '6px' }}></i>
                    AI Insights
                  </span>
                </div>
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
