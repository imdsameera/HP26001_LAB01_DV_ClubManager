"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarDays,
  CircleDollarSign,
  Settings,
  X,
} from "lucide-react";
import { clsx } from "clsx";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Navigation links — exactly as specified
// ---------------------------------------------------------------------------
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       href: "/dashboard",  icon: LayoutDashboard },
  { label: "Members",         href: "/members",    icon: Users },
  { label: "Attendance",      href: "/attendance", icon: ClipboardCheck },
  { label: "Events & Calendar", href: "/events",  icon: CalendarDays },
  { label: "Finance",         href: "/finance",   icon: CircleDollarSign },
  { label: "Settings",        href: "/settings",  icon: Settings },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Mobile backdrop ───────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ─────────────────────────────────── */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-30 flex h-screen w-64 flex-col",
          "bg-[#1E222D]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
        aria-label="Admin sidebar"
      >
        {/* ── Header / Logo ─────────────────────────────── */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
          <span className="text-base font-bold tracking-tight text-white">
            Hyke Youth Club
          </span>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────── */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Main Menu
          </p>
          <ul className="space-y-0.5" role="list">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      "transition-all duration-150",
                      active
                        ? "bg-[#0066FF] text-white shadow-sm"
                        : "text-gray-400 hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        "shrink-0 transition-colors duration-150",
                        active
                          ? "text-white"
                          : "text-gray-500 group-hover:text-white",
                      )}
                    />
                    {label}

                    {/* Active pill indicator */}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer / User ─────────────────────────────── */}
        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                Admin User
              </p>
              <p className="truncate text-[11px] text-gray-500">
                admin@hyke.lk
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
