'use client';

import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-[1280px] py-8 px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
