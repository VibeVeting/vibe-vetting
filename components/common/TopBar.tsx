'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  actionButton?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
}

export function TopBar({ title, subtitle, showSearch = true, actionButton }: TopBarProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="top-bar-right">
        {showSearch && (
          <input
            type="text"
            className="search-box"
            placeholder="Search creators, campaigns..."
          />
        )}
        {actionButton && (
          <button onClick={actionButton.onClick} className="btn btn-primary">
            {actionButton.icon && <i className={`fa-solid ${actionButton.icon}`}></i>}
            {actionButton.label}
          </button>
        )}
        <div className="user-profile" ref={dropdownRef}>
          <div 
            className="user-avatar" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          >
            {userInitials}
          </div>
          {showDropdown && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-avatar">{userInitials}</div>
                <div className="user-dropdown-info">
                  <span className="user-dropdown-name">{user?.name || 'User'}</span>
                  <span className="user-dropdown-email">{user?.email || ''}</span>
                </div>
              </div>
              <div className="user-dropdown-divider"></div>
              <a href="/settings" className="user-dropdown-item">
                <i className="fa-solid fa-gear"></i>
                Settings
              </a>
              <button className="user-dropdown-item" onClick={logout}>
                <i className="fa-solid fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
