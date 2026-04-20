"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  User,
  Shield,
  Trash2,
  X,
  Check,
  Camera,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { getInitials } from "@/lib/utils/nameUtils";
import type { UserRole } from "@/lib/models/user";

type TabId = "profile" | "security" | "danger";

interface Props {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  onClose: () => void;
  initialTab?: TabId;
}

export default function AccountSettingsModal({
  name,
  email,
  avatarUrl: initialAvatarUrl,
  role,
  onClose,
  initialTab = "profile",
}: Props) {
  const { update } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Profile State
  const [newName, setNewName] = useState(name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialAvatarUrl || null,
  );
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Danger Zone State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarRemoved(false);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const fd = new FormData();
      fd.append("name", newName.trim());
      if (avatarFile) fd.append("avatar", avatarFile);
      if (avatarRemoved) fd.append("clearAvatar", "1");

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      await update({ name: newName.trim() });
      window.dispatchEvent(new Event("profile-updated"));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setSuccess(false);
        signOut({ callbackUrl: "/login" });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/delete-account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");

      signOut({ callbackUrl: "/register?deleted=true" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server error");
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex h-[600px] w-full max-w-4xl overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-2xl">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-gray-50 bg-gray-50/50 p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200">
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {name}
              </p>
              <p className="truncate text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                {role.replace("_", " ")}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Shield },
              {
                id: "danger",
                label: "Danger Zone",
                icon: Trash2,
                color: "text-red-500",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabId);
                  setError("");
                  setSuccess(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : `text-gray-500 hover:bg-gray-100 ${tab.color || ""}`
                }`}
              >
                <tab.icon
                  size={18}
                  className={
                    activeTab === tab.id
                      ? "text-blue-600"
                      : tab.color || "text-gray-400"
                  }
                />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-white">
          <header className="flex items-center justify-between border-b border-gray-50 px-8 py-5">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {activeTab.replace("-", " ")}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-600">
                <Check size={16} />
                Successfully updated!
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="max-w-md space-y-8">
                {/* Avatar Update */}
                <div className="flex items-center gap-6">
                  <div className="group relative h-24 w-24 overflow-hidden rounded-[2rem] border-2 border-gray-100 bg-gray-50 shadow-inner">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <User size={40} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Camera size={20} className="text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-800">
                      Profile Photo
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Upload new
                      </button>
                      {(avatarPreview || initialAvatarUrl) && (
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="text-xs font-bold text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-400 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form
                onSubmit={handleChangePassword}
                className="max-w-md space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-4" />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Confirm New Password
                    </label>
                    <input
                      type={showNew ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Change Password"}
                  </button>
                </div>

                <div className="mt-8 rounded-2xl bg-gray-50 p-6 border border-gray-100">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Shield className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Two-Factor Authentication
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Add an extra layer of security to your account.{" "}
                        <span className="text-blue-600 font-medium cursor-help">
                          Learn more
                        </span>
                      </p>
                      <button
                        disabled
                        className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {activeTab === "danger" && (
              <div className="max-w-md space-y-8">
                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900">Delete Account</h3>
                      <p className="mt-1 text-sm text-red-700/80 leading-relaxed">
                        Permanently remove your account and all associated data.
                        This action cannot be undone.
                        {role === "SUPER_ADMIN" &&
                          " Since you are a Super Admin, your club and all member data will also be deleted."}
                      </p>

                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95 shadow-lg shadow-red-200"
                        >
                          Delete Account
                        </button>
                      ) : (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-xs font-bold text-red-900">
                            Please type{" "}
                            <span className="underline decoration-red-900/30">
                              DELETE
                            </span>{" "}
                            to confirm
                          </p>
                          <input
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-red-500/10"
                            placeholder="Type DELETE"
                            autoFocus
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 rounded-xl bg-white border border-red-200 py-3 text-sm font-bold text-red-900 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={deleteInput !== "DELETE" || loading}
                              onClick={handleDeleteAccount}
                              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {loading ? "Deleting..." : "Permanently Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
