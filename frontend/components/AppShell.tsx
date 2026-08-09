'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
      <main className="flex-1 min-w-0 transition-all duration-200">
        <div className="mx-auto max-w-[1280px] py-8 px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
