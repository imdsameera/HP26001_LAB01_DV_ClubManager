'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Users,
  Wallet,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  /** Controls mobile open/close state */
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Navigation definition
// ---------------------------------------------------------------------------
const NAV_ITEMS: NavItem[] = [
  { label: 'Approval Queue', href: '/dashboard',         icon: ClipboardList },
  { label: 'Members',        href: '/dashboard/members', icon: Users          },
  { label: 'Finances',       href: '/dashboard/finances',icon: Wallet         },
  { label: 'Settings',       href: '/dashboard/settings',icon: Settings       },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={clsx(
          // Base
          'fixed top-0 left-0 z-30 flex h-full w-[260px] flex-col',
          'transition-transform duration-300 ease-in-out',
          // Dark sidebar background (registered in @theme)
          'bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)]',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible
          'lg:translate-x-0',
        )}
        aria-label="Sidebar navigation"
      >
        {/* ── Logo area ─────────────────────────────────────── */}
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-[var(--color-sidebar-border)] px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              ClubManager
            </span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-sidebar-icon)] hover:bg-[var(--color-sidebar-hover-bg)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────────── */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5" role="list">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={clsx(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      'transition-all duration-150',
                      active
                        ? 'bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]'
                        : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)] hover:text-white',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        'shrink-0 transition-colors duration-150',
                        active
                          ? 'text-[var(--color-sidebar-active-text)]'
                          : 'text-[var(--color-sidebar-icon)] group-hover:text-white',
                      )}
                    />
                    {label}

                    {/* Active indicator dot */}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-brand-primary)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-[var(--color-sidebar-border)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xs font-bold text-white">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Admin User</p>
              <p className="truncate text-xs text-[var(--color-sidebar-text-muted)]">
                admin@clubmanager.io
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
