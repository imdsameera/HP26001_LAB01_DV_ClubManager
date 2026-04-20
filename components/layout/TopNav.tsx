"use client";

import { Menu, RotateCw }               from "lucide-react";
import { usePathname }                    from "next/navigation";
import NotificationPanel                  from "@/components/ui/NotificationPanel";
import ProfileDropdown                    from "@/components/ui/ProfileDropdown";
import GlobalSearch                       from "@/components/ui/GlobalSearch";
import type { UserRole }                  from "@/lib/models/user";

interface TopNavProps {
  pageTitle:   string;
  onMenuToggle: () => void;
  userName:     string;
  userEmail:    string;
  userRole:     UserRole;
  userAvatar?:  string | null;
}

// Map route → search placeholder
const SEARCH_PLACEHOLDERS: Record<string, string> = {
  "/dashboard":  "Search dashboard…",
  "/members":    "Search members…",
  "/attendance": "Search attendance…",
  "/events":     "Search events…",
  "/finance":    "Search finance…",
  "/settings":   "Search settings…",
  "/portal":     "Search portal…",
};

function getPlaceholder(pathname: string): string {
  for (const [prefix, label] of Object.entries(SEARCH_PLACEHOLDERS)) {
    if (pathname.startsWith(prefix)) return label;
  }
  return "Search…";
}

export default function TopNav({
  pageTitle, onMenuToggle, userName, userEmail, userRole, userAvatar,
}: TopNavProps) {
  const pathname     = usePathname();
  const placeholder  = getPlaceholder(pathname);

  return (
    <header
      className="sticky top-0 z-10 flex h-[64px] w-full items-center justify-between gap-4 border-b border-[var(--color-border)] bg-white px-4 sm:px-6"
      aria-label="Top navigation"
    >
      {/* ── Left: menu + title ───────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[17px] font-semibold text-[var(--color-text-primary)]">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right: search + notifications + avatar ────────── */}
      <div className="flex items-center gap-2">

        {/* Contextual search (desktop only) */}
        <GlobalSearch placeholder={placeholder} />

        {/* Refresh button */}
        <button
          onClick={() => window.location.reload()}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]"
          aria-label="Refresh application"
          title="Refresh database and UI"
        >
          <RotateCw size={18} />
        </button>

        {/* Notification panel */}
        <NotificationPanel />

        {/* Profile dropdown */}
        <ProfileDropdown
          name={userName}
          email={userEmail}
          role={userRole}
          avatarUrl={userAvatar}
        />
      </div>
    </header>
  );
}
