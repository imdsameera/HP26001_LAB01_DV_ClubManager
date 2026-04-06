'use client';

import { Menu, Bell, Search } from 'lucide-react';

interface TopNavProps {
  /** Current page title displayed in the nav */
  pageTitle: string;
  /** Callback to toggle the mobile sidebar */
  onMenuToggle: () => void;
}

export default function TopNav({ pageTitle, onMenuToggle }: TopNavProps) {
  return (
    <header
      className="sticky top-0 z-10 flex h-[64px] w-full items-center justify-between gap-4 border-b border-[var(--color-border)] bg-white px-4 sm:px-6"
      aria-label="Top navigation"
    >
      {/* ── Left: menu toggle + page title ─────────────────── */}
      <div className="flex items-center gap-3">
        {/* Hamburger – visible only on mobile */}
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <h1 className="text-[17px] font-semibold text-[var(--color-text-primary)]">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right: search + notifications + avatar ──────────── */}
      <div className="flex items-center gap-2">
        {/* Global search (desktop only) */}
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <input
            type="search"
            placeholder="Search…"
            className="h-9 w-52 rounded-lg border border-[var(--color-border)] bg-[var(--color-workspace-bg)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary-light)]"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Unread dot */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-brand-primary)] ring-2 ring-white" />
        </button>

        {/* Avatar */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xs font-bold text-white transition-opacity hover:opacity-90"
          aria-label="User profile"
        >
          AD
        </button>
      </div>
    </header>
  );
}
