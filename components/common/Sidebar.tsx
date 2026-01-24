'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

const menuItems = [
  { icon: 'fa-gauge-high', label: 'Dashboard', href: '/dashboard', badge: null },
  { icon: 'fa-chart-line', label: 'Analytics', href: '/analytics', badge: null },
  { icon: 'fa-users', label: 'Creators', href: '/creators', badge: 'NEW' },
  { icon: 'fa-bullhorn', label: 'Campaigns', href: '/campaigns', badge: null },
  { icon: 'fa-compass', label: 'Discover', href: '/creators/discover', badge: 'AI' },
  { icon: 'fa-chart-pie', label: 'Investor Metrics', href: '/investor-metrics', badge: null },
  { icon: 'fa-gear', label: 'Settings', href: '/settings', badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <Link href="/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="fa-solid fa-bolt"></i>
        </div>
        <div className="sidebar-logo-text">
          <h2>VibeVetting</h2>
          <span className="sidebar-badge">BETA</span>
        </div>
      </Link>

      {/* Quick Stats - Circular */}
      <div className="sidebar-circular-stats">
        {/* SVG Gradient Definitions */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="circular-stat">
          <div className="progress-wrapper">
            <svg className="progress-ring" viewBox="0 0 36 36">
              <circle className="progress-bg" cx="18" cy="18" r="15.5" />
              <circle className="progress-fill" cx="18" cy="18" r="15.5" 
                strokeDasharray="97.4" strokeDashoffset="24.4" style={{ stroke: 'url(#gradient-blue)' }} />
            </svg>
            <span className="circular-value">12</span>
          </div>
          <span className="circular-label">Creators</span>
        </div>
        <div className="circular-stat">
          <div className="progress-wrapper">
            <svg className="progress-ring" viewBox="0 0 36 36">
              <circle className="progress-bg" cx="18" cy="18" r="15.5" />
              <circle className="progress-fill" cx="18" cy="18" r="15.5" 
                strokeDasharray="97.4" strokeDashoffset="53.6" style={{ stroke: 'url(#gradient-blue)' }} />
            </svg>
            <span className="circular-value">3</span>
          </div>
          <span className="circular-label">Campaigns</span>
        </div>
        <div className="circular-stat">
          <div className="progress-wrapper">
            <svg className="progress-ring" viewBox="0 0 36 36">
              <circle className="progress-bg" cx="18" cy="18" r="15.5" />
              <circle className="progress-fill score" cx="18" cy="18" r="15.5" 
                strokeDasharray="97.4" strokeDashoffset="10.7" style={{ stroke: 'url(#gradient-green)' }} />
            </svg>
            <span className="circular-value">89%</span>
          </div>
          <span className="circular-label">Score</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        <div className="sidebar-section-label">MAIN MENU</div>
        {menuItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="sidebar-item-icon">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span className="sidebar-item-label">{item.label}</span>
              {item.badge && (
                <span className={`sidebar-item-badge ${item.badge === 'AI' ? 'ai' : ''}`}>
                  {item.badge}
                </span>
              )}
              {(isActive || hoveredItem === item.href) && (
                <div className="sidebar-item-indicator" />
              )}
            </Link>
          );
        })}

        <div className="sidebar-section-label">TOOLS</div>
        {menuItems.slice(4).map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="sidebar-item-icon">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span className="sidebar-item-label">{item.label}</span>
              {item.badge && (
                <span className={`sidebar-item-badge ${item.badge === 'AI' ? 'ai' : ''}`}>
                  {item.badge}
                </span>
              )}
              {(isActive || hoveredItem === item.href) && (
                <div className="sidebar-item-indicator" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pro Upgrade Card - Creative */}
      <div className="sidebar-upgrade-card">
        <div className="upgrade-sparkles">
          <span className="sparkle sparkle-1">✦</span>
          <span className="sparkle sparkle-2">✧</span>
          <span className="sparkle sparkle-3">✦</span>
        </div>
        <div className="upgrade-icon">
          <i className="fa-solid fa-crown"></i>
        </div>
        <h4>Upgrade to Pro</h4>
        <p>Unlock unlimited AI analyses and premium features</p>
        <Link href="/pricing" className="upgrade-btn">
          <span>Upgrade Now</span>
          <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {userInitials}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
            <button className="sidebar-user-menu" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .sidebar-logo-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: #000;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .sidebar-quick-stats {
          display: none;
        }

        .sidebar-circular-stats {
          display: flex;
          justify-content: space-around;
          padding: 16px 10px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(247, 250, 252, 0.95) 100%);
          border-radius: 16px;
          margin-bottom: 20px;
          border: 1px solid rgba(102, 126, 234, 0.12);
          box-shadow: 
            0 4px 16px rgba(102, 126, 234, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -2px 6px rgba(102, 126, 234, 0.03);
          border-bottom: 3px solid rgba(102, 126, 234, 0.15);
        }

        .circular-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
        }

        .circular-stat:hover {
          transform: translateY(-3px);
        }

        .progress-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 50%;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.06),
            0 1px 3px rgba(0, 0, 0, 0.04),
            inset 0 -2px 6px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }

        .circular-stat:hover .progress-wrapper {
          transform: scale(1.08);
          box-shadow: 
            0 8px 20px rgba(102, 126, 234, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.06),
            inset 0 -2px 6px rgba(0, 0, 0, 0.02);
        }

        .progress-ring {
          width: 56px;
          height: 56px;
          transform: rotate(-90deg);
          position: absolute;
          top: 0;
          left: 0;
          filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.2));
        }

        .progress-bg {
          fill: none;
          stroke: rgba(102, 126, 234, 0.1);
          stroke-width: 3.5;
        }

        .progress-fill {
          fill: none;
          stroke: url(#gradient-blue);
          stroke-width: 3.5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 0 4px rgba(102, 126, 234, 0.4));
        }

        .progress-fill.score {
          stroke: url(#gradient-green);
          filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.4));
        }

        .circular-value {
          font-size: 12px;
          font-weight: 800;
          color: #1a202c;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .circular-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 16px 16px 8px;
        }

        .sidebar-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #4a5568;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .sidebar-item:hover {
          background: rgba(102, 126, 234, 0.08);
          color: #667eea;
        }

        .sidebar-item.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
          color: #667eea;
        }

        .sidebar-item-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(102, 126, 234, 0.08);
          transition: all 0.2s ease;
        }

        .sidebar-item:hover .sidebar-item-icon,
        .sidebar-item.active .sidebar-item-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .sidebar-item-icon i {
          font-size: 14px;
        }

        .sidebar-item-label {
          flex: 1;
        }

        .sidebar-item-badge {
          padding: 3px 8px;
          background: #22c55e;
          color: white;
          font-size: 9px;
          font-weight: 700;
          border-radius: 8px;
          letter-spacing: 0.5px;
        }

        .sidebar-item-badge.ai {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .sidebar-item-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: linear-gradient(180deg, #667eea, #764ba2);
          border-radius: 0 3px 3px 0;
        }

        .sidebar-upgrade-card {
          margin: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 16px;
          text-align: center;
        }

        .upgrade-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .sidebar-upgrade-card h4 {
          font-size: 15px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 6px;
        }

        .sidebar-upgrade-card p {
          font-size: 12px;
          color: #718096;
          line-height: 1.5;
          margin-bottom: 14px;
        }

        .upgrade-btn {
          display: block;
          padding: 10px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .upgrade-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .sidebar-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #f7fafc;
          border-radius: 14px;
        }

        .sidebar-user-avatar {
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
          flex-shrink: 0;
        }

        .sidebar-user-details {
          flex: 1;
          min-width: 0;
        }

        .sidebar-user-name {
          display: block;
          font-weight: 600;
          color: #1a202c;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-email {
          display: block;
          font-size: 11px;
          color: #718096;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-menu {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #a0aec0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-user-menu:hover {
          background: #fee2e2;
          color: #dc2626;
        }
      `}</style>
    </aside>
  );
}
