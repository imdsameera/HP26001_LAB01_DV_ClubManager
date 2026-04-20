"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname }    from "next/navigation";
import { useSession }     from "next-auth/react";
import Sidebar            from "@/components/layout/Sidebar";
import TopNav             from "@/components/layout/TopNav";
import type { UserRole }  from "@/lib/models/user";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/members":    "Members",
  "/attendance": "Attendance",
  "/events":     "Events & Calendar",
  "/finance":    "Finance",
  "/settings":   "Settings",
};

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return title;
  }
  return "Dashboard";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [clubName, setClubName] = useState("Management System");
  const pathname  = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { data: session } = useSession();

  const fetchClubData = useCallback(async () => {
    try {
      const [profileRes, settingsRes] = await Promise.all([
        fetch("/api/auth/profile"),
        fetch("/api/settings"),
      ]);
      const profileData = await profileRes.json();
      const settingsData = await settingsRes.json();

      if (profileData.avatarUrl) setUserAvatar(profileData.avatarUrl);
      if (settingsData.settings?.clubName) setClubName(settingsData.settings.clubName);
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    }
  }, []);

  useEffect(() => {
    fetchClubData();
    window.addEventListener("profile-updated", fetchClubData);
    return () => window.removeEventListener("profile-updated", fetchClubData);
  }, [fetchClubData]);

  const userName  = session?.user?.name  ?? "Admin User";
  const userEmail = session?.user?.email ?? "";
  const userRole  = (session?.user?.role ?? "SUPER_ADMIN") as UserRole;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
        userAvatar={userAvatar}
        clubName={clubName}
      />

      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        <TopNav
          pageTitle={pageTitle}
          onMenuToggle={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          userAvatar={userAvatar}
        />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
