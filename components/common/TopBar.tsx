'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'creator' | 'campaign';
  name: string;
  subtitle: string;
  icon: string;
  url: string;
}

interface Notification {
  _id: string;
  title: string;
  body: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  actionButton?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
  secondaryButton?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
}

export function TopBar({ title, subtitle, showSearch = true, actionButton, secondaryButton }: TopBarProps) {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = [];

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Search creators
      const creatorsResponse = await fetch('/api/user/analyses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (creatorsResponse.ok) {
        const creatorsData = await creatorsResponse.json();
        const matchingCreators = creatorsData.analyses?.filter((a: any) => 
          a.name?.toLowerCase().includes(query.toLowerCase()) ||
          a.handle?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5) || [];

        matchingCreators.forEach((creator: any) => {
          results.push({
            id: creator.id,
            type: 'creator',
            name: creator.name || creator.handle,
            subtitle: `${creator.platform || 'Instagram'} • ${creator.followers || '0'} followers`,
            icon: 'fa-user',
            url: `/creators/${creator.id}`,
          });
        });
      }

      // Search campaigns
      const campaignsResponse = await fetch('/api/user/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        const matchingCampaigns = campaignsData.campaigns?.filter((c: any) =>
          c.name?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5) || [];

        matchingCampaigns.forEach((campaign: any) => {
          results.push({
            id: campaign.id,
            type: 'campaign',
            name: campaign.name,
            subtitle: `${campaign.status} • ${campaign.creatorsCount || 0} creators`,
            icon: 'fa-bullhorn',
            url: `/campaigns/matches`,
          });
        });
      }

      // Add quick navigation results if query matches
      const quickLinks = [
        { name: 'Dashboard', url: '/dashboard', icon: 'fa-gauge-high' },
        { name: 'Creators', url: '/creators', icon: 'fa-users' },
        { name: 'Discover Creators', url: '/creators/discover', icon: 'fa-compass' },
        { name: 'Campaigns', url: '/campaigns', icon: 'fa-bullhorn' },
        { name: 'Create Campaign', url: '/campaigns/create', icon: 'fa-plus' },
        { name: 'Analytics', url: '/analytics', icon: 'fa-chart-line' },
        { name: 'Settings', url: '/settings', icon: 'fa-gear' },
      ];

      quickLinks.forEach((link) => {
        if (link.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: `nav-${link.url}`,
            type: 'campaign',
            name: link.name,
            subtitle: 'Quick navigation',
            icon: link.icon,
            url: link.url,
          });
        }
      });

      setSearchResults(results);
      setShowSearchResults(results.length > 0 || query.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setNotificationsLoading(true);
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
      setNotificationsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ read: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      }
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAllRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    router.push(result.url);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  return (
    <div className="top-bar-enhanced">
      <div className="top-bar-left">
        <div className="top-bar-title-group">
          <h1 className="top-bar-title">{title}</h1>
          {subtitle && <p className="top-bar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="top-bar-right">
        {showSearch && (
          <div className={`search-container ${searchFocused ? 'focused' : ''}`} ref={searchRef}>
            <i className="fa-solid fa-search search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search creators, campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setSearchFocused(true);
                if (searchQuery) setShowSearchResults(true);
              }}
              onBlur={() => setSearchFocused(false)}
            />
            {isSearching ? (
              <div className="search-loading">
                <i className="fa-solid fa-spinner fa-spin"></i>
              </div>
            ) : (
              <div className="search-shortcut">
                <kbd>⌘</kbd>
                <kbd>K</kbd>
              </div>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="search-results-dropdown">
                {searchResults.length === 0 ? (
                  <div className="search-no-results">
                    <i className="fa-solid fa-search"></i>
                    <p>{searchQuery ? `No results for "${searchQuery}"` : 'Start typing to search...'}</p>
                  </div>
                ) : (
                  <>
                    <div className="search-results-list">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          <div className={`search-result-icon ${result.type}`}>
                            <i className={`fa-solid ${result.icon}`}></i>
                          </div>
                          <div className="search-result-content">
                            <span className="search-result-name">{result.name}</span>
                            <span className="search-result-subtitle">{result.subtitle}</span>
                          </div>
                          <i className="fa-solid fa-arrow-right search-result-arrow"></i>
                        </div>
                      ))}
                    </div>
                    <div className="search-results-footer">
                      <span><kbd>↵</kbd> to select</span>
                      <span><kbd>esc</kbd> to close</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {secondaryButton && (
          <button onClick={secondaryButton.onClick} className="action-btn-secondary">
            {secondaryButton.icon && <i className={`fa-solid ${secondaryButton.icon}`}></i>}
            <span>{secondaryButton.label}</span>
          </button>
        )}

        {actionButton && (
          <button onClick={actionButton.onClick} className="action-btn-primary">
            {actionButton.icon && <i className={`fa-solid ${actionButton.icon}`}></i>}
            <span>{actionButton.label}</span>
          </button>
        )}

        {/* Notifications */}
        <div className="notification-container" ref={notifRef}>
          <button
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <button className="mark-all-btn" onClick={handleMarkAllRead} disabled={unreadCount === 0}>Mark all read</button>
              </div>
              <div className="notification-list">
                {notificationsLoading ? (
                  <div className="notification-item"><i className="fa-solid fa-spinner fa-spin"></i> Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="notification-item">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif._id}
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => !notif.read && handleMarkRead(notif._id)}
                      style={{ cursor: !notif.read ? 'pointer' : 'default' }}
                    >
                      <div className={`notification-icon ${notif.type || 'info'}`}>
                        <i className={`fa-solid ${
                          notif.type === 'match' ? 'fa-heart' :
                          notif.type === 'alert' ? 'fa-triangle-exclamation' :
                          notif.type === 'campaign' ? 'fa-bullhorn' :
                          'fa-bell'
                        }`}></i>
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">{notif.title}</p>
                        <p className="notification-desc">{notif.body}</p>
                        <span className="notification-time">{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                      {!notif.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
              <a href="/notifications" className="view-all-notifications">
                View all notifications
              </a>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="user-profile-container" ref={dropdownRef}>
          <div
            className="user-avatar-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar-circle">
              {userInitials}
            </div>
            <i className={`fa-solid fa-chevron-down avatar-chevron ${showDropdown ? 'open' : ''}`}></i>
          </div>

          {showDropdown && (
            <div className="user-dropdown-enhanced">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{userInitials}</div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{user?.name || 'User'}</span>
                  <span className="dropdown-email">{user?.email || ''}</span>
                </div>
              </div>

              <div className="dropdown-section">
                <a href="/dashboard" className="dropdown-item">
                  <i className="fa-solid fa-gauge-high"></i>
                  Dashboard
                </a>
                <a href="/settings" className="dropdown-item">
                  <i className="fa-solid fa-gear"></i>
                  Settings
                </a>
                <a href="/help-support" className="dropdown-item">
                  <i className="fa-solid fa-circle-question"></i>
                  Help & Support
                </a>
              </div>

              <div className="dropdown-footer">
                <button className="dropdown-logout" onClick={logout}>
                  <i className="fa-solid fa-right-from-bracket"></i>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .top-bar-enhanced {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0 28px;
          margin-bottom: 8px;
          position: relative;
          z-index: 9999;
        }

        .top-bar-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .top-bar-subtitle {
          font-size: 14px;
          color: #718096;
          font-weight: 500;
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #edf2f7;
          border-radius: 14px;
          padding: 0 16px;
          transition: all 0.2s ease;
          width: 320px;
        }

        .search-container.focused {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          color: #a0aec0;
          font-size: 14px;
          margin-right: 12px;
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 12px 0;
          font-size: 14px;
          color: #1a202c;
          outline: none;
        }

        .search-input::placeholder {
          color: #a0aec0;
        }

        .search-shortcut {
          display: flex;
          gap: 4px;
        }

        .search-shortcut kbd {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
          color: #718096;
          font-family: inherit;
        }

        .search-results-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          z-index: 99999;
          overflow: hidden;
          max-height: 400px;
        }

        .search-results-loading {
          padding: 24px;
          text-align: center;
          color: #718096;
          font-size: 14px;
        }

        .search-results-loading i {
          margin-right: 8px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .search-results-empty {
          padding: 24px;
          text-align: center;
          color: #718096;
          font-size: 14px;
        }

        .search-results-section {
          padding: 8px;
        }

        .search-results-section-title {
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .search-result-item:hover {
          background: #f7fafc;
        }

        .search-result-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .search-result-icon.creator {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .search-result-icon.campaign {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .search-result-icon.navigation {
          background: #f7fafc;
          color: #667eea;
        }

        .search-result-content {
          flex: 1;
          min-width: 0;
        }

        .search-result-name {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-result-subtitle {
          display: block;
          font-size: 12px;
          color: #718096;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-result-arrow {
          color: #a0aec0;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .search-result-item:hover .search-result-arrow {
          opacity: 1;
        }

        .search-results-footer {
          padding: 12px;
          background: #f7fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: center;
          gap: 24px;
          font-size: 12px;
          color: #718096;
        }

        .search-results-footer kbd {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 600;
          margin-right: 4px;
        }

        .action-btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .action-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
        }

        .icon-btn {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-input, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: 10px;
          color: var(--text-secondary, #9ca3af);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          border-color: var(--primary, #667eea);
          color: var(--primary, #667eea);
          background: rgba(102, 126, 234, 0.1);
        }

        .theme-btn i {
          transition: transform 0.3s ease;
        }

        .theme-btn:hover i {
          transform: rotate(20deg);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .notification-container {
          position: relative;
          z-index: 99999;
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 360px;
          background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
          border-radius: 18px;
          box-shadow: 
            0 25px 60px rgba(0, 0, 0, 0.18),
            0 10px 20px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-bottom: 3px solid rgba(102, 126, 234, 0.2);
          overflow: hidden;
          z-index: 99999;
          animation: dropdownIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #edf2f7;
        }

        .notification-header h4 {
          font-size: 15px;
          font-weight: 700;
          color: #1a202c;
        }

        .mark-all-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .notification-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #f7fafc;
          transition: background 0.2s ease;
          cursor: pointer;
        }

        .notification-item:hover {
          background: #f7fafc;
        }

        .notification-item.unread {
          background: rgba(102, 126, 234, 0.03);
        }

        .notification-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          transition: all 0.2s ease;
        }

        .notification-item:hover .notification-icon {
          transform: scale(1.08);
        }

        .notification-icon.match {
          background: linear-gradient(180deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%);
          color: #ec4899;
        }

        .notification-icon.alert {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .notification-icon.campaign {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-size: 13px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 2px;
        }

        .notification-desc {
          font-size: 12px;
          color: #718096;
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 11px;
          color: #a0aec0;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .view-all-notifications {
          display: block;
          text-align: center;
          padding: 14px;
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          border-top: 1px solid #edf2f7;
          transition: background 0.2s ease;
        }

        .view-all-notifications:hover {
          background: #f7fafc;
        }

        .user-profile-container {
          position: relative;
        }

        .user-avatar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 6px;
          border-radius: 12px;
          transition: background 0.2s ease;
        }

        .user-avatar-btn:hover {
          background: #f7fafc;
        }

        .user-avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 
            0 4px 12px rgba(102, 126, 234, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .user-avatar-btn:hover .user-avatar-circle {
          transform: scale(1.05);
          box-shadow: 
            0 6px 16px rgba(102, 126, 234, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3);
        }

        .avatar-chevron {
          font-size: 10px;
          color: #718096;
          transition: transform 0.2s ease;
        }

        .avatar-chevron.open {
          transform: rotate(180deg);
        }

        .user-dropdown-enhanced {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 240px;
          background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
          border-radius: 18px;
          box-shadow: 
            0 25px 60px rgba(0, 0, 0, 0.18),
            0 10px 20px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-bottom: 3px solid rgba(102, 126, 234, 0.2);
          overflow: hidden;
          z-index: 100;
          animation: dropdownIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(180deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.04) 100%);
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }

        .dropdown-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 
            0 4px 12px rgba(102, 126, 234, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
        }

        .dropdown-user-info {
          flex: 1;
          min-width: 0;
        }

        .dropdown-name {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #1a202c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-email {
          display: block;
          font-size: 12px;
          color: #718096;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-section {
          padding: 8px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          color: #4a5568;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background: #f7fafc;
          color: #667eea;
        }

        .dropdown-item i {
          width: 18px;
          text-align: center;
          font-size: 14px;
        }

        .dropdown-footer {
          padding: 8px;
          border-top: 1px solid #edf2f7;
        }

        .dropdown-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          border-radius: 10px;
          color: #ef4444;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dropdown-logout:hover {
          background: #fef2f2;
        }

        .dropdown-logout i {
          width: 18px;
          text-align: center;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .search-container {
            width: 200px;
          }

          .search-shortcut {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .top-bar-enhanced {
            flex-wrap: wrap;
            gap: 16px;
          }

          .search-container {
            order: 3;
            width: 100%;
          }

          .action-btn-primary span {
            display: none;
          }

          .action-btn-primary {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
