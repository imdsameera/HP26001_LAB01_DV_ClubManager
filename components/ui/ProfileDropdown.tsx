"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession }         from "next-auth/react";
import { User, Shield, Activity, Bell, Globe, LogOut, ChevronRight, X, Eye, EyeOff, Check, Upload, ImagePlus, Trash2, Camera } from "lucide-react";
import { getInitials } from "@/lib/utils/nameUtils";
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


// ─── Account Info Modal ─────────────────────────────────────────────────────────
function AccountInfoModal({ name, email, avatarUrl, onClose }: { name: string; email: string; avatarUrl?: string | null; onClose: () => void }) {
  const { update } = useSession();
  const [newName,   setNewName]   = useState(name);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);

  // Avatar states
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl || null);
  const [isRemoved,     setIsRemoved]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setIsRemoved(false);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      const fd = new FormData();
      fd.append("name", newName.trim());
      if (avatarFile)  fd.append("avatar", avatarFile);
      if (isRemoved)   fd.append("clearAvatar", "1");

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: fd, // Fetch automatically sets content-type for FormData
      });

      const data = await res.json() as { ok?: boolean; avatarUrl?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Failed to update profile.");
      
      // Update local session (name only to avoid cookie size limit)
      await update({ name: newName.trim() });
      
      // Notify layout to re-fetch avatar/profile data
      window.dispatchEvent(new Event("profile-updated"));

      setSuccess(true);
      setTimeout(() => { onClose(); }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Server error");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Account Information</h2>
            <p className="mt-0.5 text-[11px] text-gray-500">Update your personal profile details</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check size={22} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-800">Profile Updated!</p>
            <p className="text-xs text-gray-400">Refreshing your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={e => void handleSubmit(e)} className="p-6">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="group relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-gray-50 transition-all hover:ring-blue-100">
                  {avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex h-1/3 items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera size={14} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-500">
                      <User size={32} />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0066FF]"
                  >
                    Change Photo
                  </button>
                  {(avatarPreview || avatarUrl) && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 border-t border-gray-50 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-[#0066FF] py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Security Modal ────────────────────────────────────────────────────────────
function SecurityModal({ email, onClose }: { email: string; onClose: () => void }) {
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
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Security</h2>
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
            <h3 className="text-sm font-semibold text-slate-700">Change Password</h3>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}
            {[
              { label: "Previous Password", val: current, set: setCurrent, show: showCur, toggle: () => setShowCur(v => !v) },
              { label: "New Password",      val: next,    set: setNext,    show: showNew, toggle: () => setShowNew(v => !v) },
              { label: "Confirm Password",  val: confirm, set: setConfirm, show: showNew, toggle: () => setShowNew(v => !v) },
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
export default function ProfileDropdown({ name, email, role, avatarUrl }: Props) {
  const [open,            setOpen]            = useState(false);
  const [showSecurity,    setShowSecurity]    = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItems = [
    { icon: User,     label: "Account Information",    action: () => { setOpen(false); setShowAccountInfo(true); }, disabled: false },
    { icon: Shield,   label: "Security",               action: () => { setOpen(false); setShowSecurity(true); },    disabled: false },
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

      {showSecurity && (
        <SecurityModal email={email} onClose={() => setShowSecurity(false)} />
      )}
      
      {showAccountInfo && (
        <AccountInfoModal name={name} email={email} avatarUrl={avatarUrl} onClose={() => setShowAccountInfo(false)} />
      )}
    </>
  );
}
