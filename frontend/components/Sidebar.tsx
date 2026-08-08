'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tasks', icon: '☰' },
  { href: '/tasks/trash', label: 'Trash', icon: '🗑' },
];

const ACCENT_COLORS = {
  blue: '#3b82f6', amber: '#f59e0b', pink: '#ec4899', rose: '#f43f5e', emerald: '#10b981', black: '#1f2937'
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="relative px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
              {(user?.name || 'G').charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || 'Guest'}
            </span>
          </div>
          <span className="text-gray-400 text-xs">▾</span>
        </button>

        {menuOpen && (
          <div className="absolute left-4 right-4 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-500 mb-2">Accent Color</div>
              <div className="flex gap-2">
                {Object.entries(ACCENT_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => { setAccent(name as any); setMenuOpen(false); }}
                    className={`w-5 h-5 rounded-full border-2 ${accent === name ? 'border-gray-400' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? '☀️ Light theme' : '🌙 Dark theme'}
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-accent-soft text-accent' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
        Task Manager
      </div>
    </aside>
  );
}
