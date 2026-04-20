"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession }         from "next-auth/react";
import { User, Shield, Activity, Bell, Globe, LogOut, ChevronRight, X, Eye, EyeOff, Check, Upload, ImagePlus, Trash2, Camera } from "lucide-react";
import { getInitials } from "@/lib/utils/nameUtils";
import AccountSettingsModal from "@/components/settings/AccountSettingsModal";
import type { UserRole } from "@/lib/models/user";

interface Props {
  name:       string;
  email:      string;
  role:       UserRole;
  avatarUrl?: string | null;
}

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN:       "bg-purple-100 text-purple-600",
  SECRETARY:   "bg-blue-100 text-blue-700",
  TREASURER:   "bg-emerald-100 text-emerald-700",
  MEMBER:      "bg-gray-100 text-gray-700",
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  SECRETARY:   "Secretary",
  TREASURER:   "Treasurer",
  MEMBER:      "Member",
};


// Legacy modals removed in favour of AccountSettingsModal

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
export default function ProfileDropdown({ name, email, role, avatarUrl }: Props) {
  const [open,                setOpen]                = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [activeTab,           setActiveTab]           = useState<"profile" | "security" | "danger">("profile");
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItems = [
    { icon: User,     label: "Account Settings",       action: () => { setOpen(false); setActiveTab("profile");  setShowAccountSettings(true); }, disabled: false },
    { icon: Shield,   label: "Security",               action: () => { setOpen(false); setActiveTab("security"); setShowAccountSettings(true); },    disabled: false },
    { icon: Activity, label: "Account Activity",       action: () => {}, disabled: true },
    { icon: Bell,     label: "Notification Settings",  action: () => {}, disabled: true },
    { icon: Globe,    label: "Language: English",      action: () => {}, disabled: true },
  ];

  return (
    <>
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen(v => !v)}
          id="profile-avatar-btn"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white transition hover:opacity-90 shadow-sm shadow-blue-200 overflow-hidden"
          aria-label="User profile"
        >
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : getInitials(name)}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10 z-50">
            {/* User info */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white overflow-hidden">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : getInitials(name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                <p className="truncate text-[11px] text-gray-500">{email}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[role]}`}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {menuItems.map(({ icon: Icon, label, action, disabled }) => (
                <button
                  key={label}
                  onClick={disabled ? undefined : action}
                  disabled={disabled}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                    disabled ? "opacity-50 cursor-not-allowed text-gray-400 bg-transparent" : "text-slate-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={15} className={`shrink-0 ${disabled ? "text-gray-300" : "text-gray-400"}`} />
                  <span className="flex-1 text-left">{label}</span>
                  {!disabled && <ChevronRight size={13} className="text-gray-300" />}
                </button>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={15} className="shrink-0" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {showAccountSettings && (
        <AccountSettingsModal 
          name={name} 
          email={email} 
          avatarUrl={avatarUrl} 
          role={role}
          initialTab={activeTab}
          onClose={() => setShowAccountSettings(false)} 
        />
      )}
    </>
  );
}
