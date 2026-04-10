"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";

// ---------------------------------------------------------------------------
// Route → readable page title (kept in sync with NAV_ITEMS)
// ---------------------------------------------------------------------------
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/members":    "Members",
  "/dashboard/attendance": "Attendance",
  "/dashboard/events":     "Events & Calendar",
  "/dashboard/finance":    "Finance",
  "/dashboard/settings":   "Settings",
};

function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? "Dashboard";
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
    // Sidebar is fixed-position; this flex container just sizes the right column
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* ── Sidebar (fixed, w-64) ────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right column — offset by sidebar width on desktop ── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Top navigation bar */}
        <TopNav
          pageTitle={pageTitle}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Page content */}
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
