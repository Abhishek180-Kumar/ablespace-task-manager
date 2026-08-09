'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme, type Accent } from '@/lib/theme';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tasks', icon: 'tasks' },
  { href: '/projects', label: 'Projects', icon: 'projects' },
  { href: '/tasks/trash', label: 'Trash', icon: 'trash' },
  { href: '/settings', label: 'Password', icon: 'settings' },
];

function NavIcon({ name, className }: { name: string; className?: string }) {
  const cls = className || 'h-5 w-5';
  if (name === 'tasks') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
  if (name === 'trash') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
  if (name === 'projects') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
  if (name === 'settings') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
  return null;
}

function PanelLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

const ACCENT_COLORS = {
  blue: '#3b82f6', amber: '#f59e0b', pink: '#ec4899', rose: '#f43f5e', emerald: '#10b981', black: '#1f2937',
};

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'h-3.5 w-3.5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'h-3.5 w-3.5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function SettingsGearIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

const ACCENT_LABELS: Record<string, string> = {
  amber: 'Amber', blue: 'Blue', pink: 'Pink', rose: 'Rose', emerald: 'Emerald', black: 'Black',
};

export default function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<'theme' | 'color' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeAllMenus = () => { setMenuOpen(false); setSubMenu(null); };

  if (!user) return null;

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2 -ml-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Task Manager</span>
        <div className="w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
          {(user?.name || 'G').charAt(0).toUpperCase()}
        </div>
      </div>

      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />}

      <aside className={`shrink-0 h-screen lg:sticky top-0 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 fixed z-50 transition-all duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${collapsed ? 'lg:w-[56px]' : 'w-64'}`}>
        <div className="relative px-3 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2 min-h-[52px]">
          {!collapsed && (
            <button onClick={() => setMenuOpen((v) => !v)} className="flex-1 flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                  {(user?.name || 'G').charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Workspace'}</span>
              </div>
              <svg className="h-4 w-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          )}
          <button onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 transition-colors">
            <PanelLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {menuOpen && !collapsed && (
          <div className="absolute left-3 right-3 top-[56px] z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1" onMouseLeave={() => setSubMenu(null)}>
            {/* Change Theme */}
            <div className="relative" onMouseEnter={() => setSubMenu('theme')}>
              <button
                onClick={() => setSubMenu((v) => (v === 'theme' ? null : 'theme'))}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-sm ${subMenu === 'theme' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} text-gray-700 dark:text-gray-200`}
              >
                <span className="flex items-center gap-2"><SettingsGearIcon className="h-4 w-4 text-gray-400" /> Change Theme</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {subMenu === 'theme' && (
                <div className="absolute left-full top-0 ml-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-30">
                  <div className="px-3 pt-1.5 pb-1 text-xs font-medium text-gray-400">Theme</div>
                  <button onClick={() => { setTheme('light'); closeAllMenus(); }} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="flex items-center gap-2"><SunIcon className="h-4 w-4" /> Light</span>
                    {theme === 'light' && <CheckIcon />}
                  </button>
                  <button onClick={() => { setTheme('dark'); closeAllMenus(); }} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="flex items-center gap-2"><MoonIcon className="h-4 w-4" /> Dark</span>
                    {theme === 'dark' && <CheckIcon />}
                  </button>
                </div>
              )}
            </div>

            {/* Color Mode */}
            <div className="relative" onMouseEnter={() => setSubMenu('color')}>
              <button
                onClick={() => setSubMenu((v) => (v === 'color' ? null : 'color'))}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-sm ${subMenu === 'color' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} text-gray-700 dark:text-gray-200`}
              >
                <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-sm shrink-0" style={{ backgroundColor: ACCENT_COLORS[accent] }} /> Color Mode</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {subMenu === 'color' && (
                <div className="absolute left-full top-0 ml-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-30">
                  <div className="px-3 pt-1.5 pb-1 text-xs font-medium text-gray-400">Color Mode</div>
                  {Object.entries(ACCENT_COLORS).map(([name, color]) => (
                    <button key={name} onClick={() => { setAccent(name as Accent); closeAllMenus(); }} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-sm shrink-0" style={{ backgroundColor: color }} /> {ACCENT_LABELS[name]}</span>
                      {accent === name && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
            <Link href="/profile" onClick={closeAllMenus} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"><SettingsGearIcon className="h-4 w-4 text-gray-400" /> Settings</Link>
            <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
          </div>
        )}

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-accent-soft text-accent' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'} ${collapsed ? 'justify-center' : ''}`}>
                <span className="shrink-0"><NavIcon name={item.icon} /></span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">Task Manager</div>
        )}
      </aside>
    </>
  );
}