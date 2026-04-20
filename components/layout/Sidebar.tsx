"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardCheck,
  CalendarDays, CircleDollarSign, Settings, X,
} from "lucide-react";
import { clsx } from "clsx";
import { getInitials } from "@/lib/utils/nameUtils";
import type { UserRole } from "@/lib/models/user";

interface NavItem { label: string; href: string; icon: React.ElementType; roles: UserRole[] }
interface SidebarProps { isOpen: boolean; onClose: () => void; userName: string; userEmail: string; userRole: UserRole; userAvatar?: string | null; clubName: string }

const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         href: "/dashboard",  icon: LayoutDashboard,  roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY", "TREASURER"] },
  { label: "Members",           href: "/members",    icon: Users,            roles: ["SUPER_ADMIN", "SECRETARY"] },
  { label: "Attendance",        href: "/attendance", icon: ClipboardCheck,   roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY", "TREASURER"] },
  { label: "Events & Calendar", href: "/events",     icon: CalendarDays,     roles: ["SUPER_ADMIN", "SECRETARY"] },
  { label: "Finance",           href: "/finance",    icon: CircleDollarSign, roles: ["SUPER_ADMIN", "TREASURER"] },
  { label: "Settings",          href: "/settings",   icon: Settings,         roles: ["SUPER_ADMIN", "ADMIN"] },
];

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  SECRETARY:   "Secretary",
  TREASURER:   "Treasurer",
  MEMBER:      "Member",
};


export default function Sidebar({ isOpen, onClose, userName, userEmail, userRole, userAvatar, clubName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 z-30 flex h-screen w-64 flex-col bg-[#1E222D]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
        aria-label="Admin sidebar"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
          <span className="text-base font-bold tracking-tight text-white">{clubName}</span>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Main Menu</p>
          <ul className="space-y-0.5" role="list">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-[#0066FF] text-white shadow-sm"
                        : "text-gray-400 hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    <Icon size={18} className={clsx("shrink-0 transition-colors", active ? "text-white" : "text-gray-500 group-hover:text-white")} />
                    {label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer user */}
        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white overflow-hidden">
              {userAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={userAvatar} alt="" className="h-full w-full object-cover" />
              ) : getInitials(userName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-[11px] text-gray-500">{ROLE_LABELS[userRole]}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
