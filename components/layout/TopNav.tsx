"use client";

import { useRef, useEffect, useCallback } from "react";
import { Menu, Search }                   from "lucide-react";
import { usePathname }                    from "next/navigation";
import NotificationPanel                  from "@/components/ui/NotificationPanel";
import ProfileDropdown                    from "@/components/ui/ProfileDropdown";
import type { UserRole }                  from "@/lib/models/user";

interface TopNavProps {
  pageTitle:   string;
  onMenuToggle: () => void;
  userName:     string;
  userEmail:    string;
  userRole:     UserRole;
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
  pageTitle, onMenuToggle, userName, userEmail, userRole,
}: TopNavProps) {
  const pathname     = usePathname();
  const searchRef    = useRef<HTMLInputElement>(null);
  const placeholder  = getPlaceholder(pathname);

  // Press "/" to focus search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const active = document.activeElement;
    const isTyping =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      (active as HTMLElement)?.isContentEditable;

    if (e.key === "/" && !isTyping) {
      e.preventDefault();
      searchRef.current?.focus();
    }
    if (e.key === "Escape") {
      searchRef.current?.blur();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
        <div className="relative hidden sm:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchRef}
            id="global-search"
            type="search"
            placeholder={`${placeholder} ( / )`}
            className="h-9 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-gray-400 outline-none transition focus:w-64 focus:border-[#0066FF] focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Notification panel */}
        <NotificationPanel />

        {/* Profile dropdown */}
        <ProfileDropdown
          name={userName}
          email={userEmail}
          role={userRole}
        />
      </div>
    </header>
  );
}
