"use client";

import { useState, useEffect, useRef } from "react";
import { signOut }                      from "next-auth/react";
import {
  User, Shield, Activity, Bell, Globe,
  LogOut, ChevronRight, X, Eye, EyeOff, Check,
} from "lucide-react";
import type { UserRole } from "@/lib/models/user";

interface Props {
  name:   string;
  email:  string;
  role:   UserRole;
}

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  SECRETARY:   "bg-blue-100 text-blue-700",
  TREASURER:   "bg-emerald-100 text-emerald-700",
  MEMBER:      "bg-gray-100 text-gray-700",
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  SECRETARY:   "Secretary",
  TREASURER:   "Treasurer",
  MEMBER:      "Member",
};

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 8)  { setError("New password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Failed to change password.");
      setSuccess(true);
      setTimeout(() => { onClose(); signOut({ callbackUrl: "/login" }); }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Server error");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Change Password</h2>
            <p className="mt-0.5 text-xs text-gray-500">{email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check size={22} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-800">Password changed!</p>
            <p className="text-xs text-gray-500">You will be signed out shortly…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}
            {[
              { label: "Current Password", val: current, set: setCurrent, show: showCur, toggle: () => setShowCur(v => !v) },
              { label: "New Password",     val: next,    set: setNext,    show: showNew, toggle: () => setShowNew(v => !v) },
              { label: "Confirm New",      val: confirm, set: setConfirm, show: showNew, toggle: () => setShowNew(v => !v) },
            ].map(({ label, val, set, show, toggle }) => (
              <div key={label}>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">{label}</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={val}
                    onChange={e => set(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-9 text-sm outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100"
                    required
                  />
                  <button type="button" onClick={toggle}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 rounded-lg bg-[#0066FF] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Saving…" : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
export default function ProfileDropdown({ name, email, role }: Props) {
  const [open,       setOpen]      = useState(false);
  const [showChangePwd, setChangePwd] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItems = [
    { icon: User,     label: "Account Information",    action: () => {} },
    { icon: Shield,   label: "Security",               action: () => { setOpen(false); setChangePwd(true); } },
    { icon: Activity, label: "Account Activity",       action: () => {} },
    { icon: Bell,     label: "Notification Settings",  action: () => {} },
    { icon: Globe,    label: "Language: English",      action: () => {} },
  ];

  return (
    <>
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen(v => !v)}
          id="profile-avatar-btn"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white transition hover:opacity-90 shadow-sm shadow-blue-200"
          aria-label="User profile"
        >
          {getInitials(name)}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10 z-50">
            {/* User info */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0066FF] text-xs font-bold text-white">
                {getInitials(name)}
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
              {menuItems.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-gray-50"
                >
                  <Icon size={15} className="shrink-0 text-gray-400" />
                  <span className="flex-1 text-left">{label}</span>
                  <ChevronRight size={13} className="text-gray-300" />
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

      {showChangePwd && (
        <ChangePasswordModal email={email} onClose={() => setChangePwd(false)} />
      )}
    </>
  );
}
