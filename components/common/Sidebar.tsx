'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '📊', label: 'Analytics', href: '/analytics' },
  { icon: '👥', label: 'Creators', href: '/creators' },
  { icon: '📁', label: 'Campaigns', href: '/campaigns' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white border-r border-slate-200 py-8 px-5 shadow-lg fixed w-[280px] h-screen overflow-y-auto">
      <Link href="/dashboard" className="flex items-center gap-3 mb-10 no-underline text-indigo-600">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-black">
          ✓
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">VibeVetting</h2>
      </Link>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 no-underline ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-500/15 to-purple-600/15 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <span className="w-5 text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
