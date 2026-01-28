"use client";

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
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
    // Delete all notifications one by one
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return '#ec4899';
      case 'alert': return '#f59e0b';
      case 'campaign': return '#667eea';
      case 'system': return '#6b7280';
      case 'success': return '#22c55e';
      case 'insight': return '#8b5cf6';
      default: return '#667eea';
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Notifications"
            subtitle={`${unreadCount} unread notifications`}
          />

          {/* Notification Controls */}
          <div className="notification-controls">
            <div className="control-left">
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                  <span className="tab-count">{notifications.length}</span>
                </button>
                <button 
                  className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                  onClick={() => setFilter('unread')}
                >
                  Unread
                  {unreadCount > 0 && <span className="tab-count unread">{unreadCount}</span>}
                </button>
              </div>

              <select 
                className="type-filter"
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

            <div className="control-right">
              {unreadCount > 0 && (
                <button className="control-btn" onClick={markAllAsRead}>
                  <i className="fa-solid fa-check-double"></i>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button className="control-btn danger" onClick={clearAll}>
                  <i className="fa-solid fa-trash"></i>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
                <h3>Loading notifications...</h3>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div 
                    className="notification-icon"
                    style={{ 
                      background: `${getTypeColor(notification.type || 'info')}15`,
                      color: getTypeColor(notification.type || 'info')
                    }}
                  >
                    {notification.metadata?.avatar ? (
                      <span className="notification-avatar">{notification.metadata.avatar}</span>
                    ) : (
                      <i className={`fa-solid ${getTypeIcon(notification.type)}`}></i>
                    )}
                  </div>

                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="notification-message">{notification.body}</p>
                    
                    {notification.metadata?.score && (
                      <div className="notification-score">
                        <div className="score-bar">
                          <div 
                            className="score-fill" 
                            style={{ width: `${notification.metadata.score}%` }}
                          ></div>
                        </div>
                        <span className="score-value">{notification.metadata.score}% Match</span>
                      </div>
                    )}

                    {notification.metadata?.actionUrl && (
                      <a href={notification.metadata.actionUrl} className="notification-action">
                        {notification.metadata.actionLabel || 'View'}
                        <i className="fa-solid fa-arrow-right"></i>
                      </a>
                    )}
                  </div>

                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        className="action-btn mark-read"
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                    <button 
                      className="action-btn delete"
                      onClick={() => deleteNotification(notification._id)}
                      title="Delete"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>

                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fa-solid fa-bell-slash"></i>
                </div>
                <h3>No Notifications</h3>
                <p>{filter === 'unread' ? 'You\'re all caught up!' : 'You don\'t have any notifications yet.'}</p>
              </div>
            )}
          </div>

          {/* Notification Settings Card */}
          <div className="notification-settings-card">
            <div className="settings-header">
              <i className="fa-solid fa-gear"></i>
              <span>Notification Preferences</span>
            </div>
            <div className="settings-grid">
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Creator Matches</span>
                  <span className="setting-desc">Get notified when new creators match your campaigns</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Risk Alerts</span>
                  <span className="setting-desc">Receive alerts about creator risks and fake engagement</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Campaign Updates</span>
                  <span className="setting-desc">Updates about your active campaigns</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">AI Insights</span>
                  <span className="setting-desc">Personalized insights and recommendations from AI</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Email Notifications</span>
                  <span className="setting-desc">Also receive notifications via email</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .notification-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .control-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .filter-tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 4px;
        }

        .filter-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          color: #1a202c;
        }

        .filter-tab.active {
          background: white;
          color: #1a202c;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .tab-count {
          padding: 2px 8px;
          background: #e2e8f0;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
        }

        .tab-count.unread {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .type-filter {
          padding: 10px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c;
          cursor: pointer;
          outline: none;
        }

        .type-filter:focus {
          border-color: #667eea;
        }

        .control-right {
          display: flex;
          gap: 12px;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn:hover {
          background: #f7fafc;
          border-color: #667eea;
          color: #667eea;
        }

        .control-btn.danger:hover {
          background: #fef2f2;
          border-color: #ef4444;
          color: #ef4444;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          position: relative;
          transition: all 0.2s;
          opacity: 0;
          animation: fadeInUp 0.4s ease forwards;
        }

        .notification-item:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .notification-item.unread {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
          border-color: rgba(102, 126, 234, 0.2);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .notification-avatar {
          font-size: 24px;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 6px;
        }

        .notification-title {
          font-size: 15px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }

        .notification-time {
          font-size: 12px;
          color: #a0aec0;
          white-space: nowrap;
        }

        .notification-message {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .notification-score {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .score-bar {
          flex: 1;
          max-width: 150px;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
        }

        .score-value {
          font-size: 13px;
          font-weight: 700;
          color: #667eea;
        }

        .notification-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .notification-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .notification-action i {
          font-size: 11px;
          transition: transform 0.2s;
        }

        .notification-action:hover i {
          transform: translateX(3px);
        }

        .notification-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .notification-item:hover .notification-actions {
          opacity: 1;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.mark-read:hover {
          background: #ecfdf5;
          border-color: #22c55e;
          color: #22c55e;
        }

        .action-btn.delete:hover {
          background: #fef2f2;
          border-color: #ef4444;
          color: #ef4444;
        }

        .unread-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 40px;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 0 4px 4px 0;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 32px;
          color: #667eea;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: #718096;
        }

        .notification-settings-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
        }

        .settings-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .settings-header i {
          color: #667eea;
        }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f7fafc;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .setting-item:hover {
          background: #edf2f7;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-label {
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
        }

        .setting-desc {
          font-size: 13px;
          color: #718096;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 26px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #e2e8f0;
          transition: 0.3s;
          border-radius: 26px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .toggle-switch input:checked + .toggle-slider {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        @media (max-width: 768px) {
          .notification-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .control-left {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-tabs {
            justify-content: center;
          }

          .control-right {
            justify-content: center;
          }

          .notification-item {
            flex-direction: column;
          }

          .notification-header {
            flex-direction: column;
            gap: 4px;
          }

          .notification-actions {
            opacity: 1;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
