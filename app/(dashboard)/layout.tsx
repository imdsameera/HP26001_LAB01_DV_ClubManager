'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

// ---------------------------------------------------------------------------
// Derive a readable page title from the current route
// ---------------------------------------------------------------------------
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard':          'Approval Queue',
    '/dashboard/members':  'Members',
    '/dashboard/finances': 'Finances',
    '/dashboard/settings': 'Settings',
  };
  return map[pathname] ?? 'Dashboard';
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-workspace-bg)]">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right column (TopNav + main content) ────────────── */}
      {/*
        On desktop (lg+): offset by sidebar width using a left margin.
        On mobile: full width — sidebar overlays as a drawer.
      */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-[260px]">
        {/* TopNav – sticky inside this column */}
        <TopNav
          pageTitle={pageTitle}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Main content area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
