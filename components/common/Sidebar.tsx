'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: 'fa-home', label: 'Dashboard', href: '/dashboard' },
  { icon: 'fa-chart-line', label: 'Analytics', href: '/analytics' },
  { icon: 'fa-users', label: 'Creators', href: '/creators' },
  { icon: 'fa-bullhorn', label: 'Campaigns', href: '/campaigns' },
  { icon: 'fa-chart-pie', label: 'Investor Metrics', href: '/investor-metrics' },
  { icon: 'fa-cog', label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2>VibeVetting</h2>
      </Link>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
