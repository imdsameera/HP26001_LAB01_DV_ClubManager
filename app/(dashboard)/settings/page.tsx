"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Building2,
  ShieldAlert,
  Palette,
  Mail,
  DollarSign,
  ChevronRight,
  AlertCircle,
  Upload,
  ImagePlus,
  Save,
  X,
  Trash2,
  UserCircle2,
  Send,
  CheckCircle2,
} from "lucide-react";
import type { ClubSettings } from "@/lib/services/settingsService";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "general" | "admin-access" | "branding" | "emails" | "finance";

interface NavGroup {
  label: string;
  items: { id: TabId; label: string; icon: React.ElementType }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Club Management",
    items: [
      { id: "general",      label: "General Profile", icon: Building2 },
      { id: "admin-access", label: "Admin Access",    icon: ShieldAlert },
    ],
  },
  {
    label: "Preferences",
    items: [
      { id: "branding", label: "Branding",        icon: Palette },
      { id: "emails",   label: "Emails & Alerts", icon: Mail },
      { id: "finance",  label: "Finance Config",  icon: DollarSign },
    ],
  },
];

const MOCK_ADMINS = [
  { id: "1", name: "Sameera Dissanayake", email: "sameera@hyke.lk", role: "Super Admin", avatar: "SD" },
  { id: "2", name: "Nimal Jayasuriya",    email: "nimal@hyke.lk",   role: "Admin",       avatar: "NJ" },
  { id: "3", name: "Kasun Perera",        email: "kasun@hyke.lk",   role: "Moderator",   avatar: "KP" },
];

const TAB_META: Record<TabId, { title: string; subtitle: string }> = {
  general:       { title: "General Profile",  subtitle: "Manage your club's public identity and contact information." },
  "admin-access":{ title: "Admin Access",      subtitle: "Control who can administer this dashboard." },
  branding:      { title: "Branding",          subtitle: "Customise the visual identity of your club." },
  emails:        { title: "Emails & Alerts",   subtitle: "Configure outgoing emails and notification preferences." },
  finance:       { title: "Finance Config",    subtitle: "Set up currency, dues, and payment policies." },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 " +
  "placeholder:text-gray-400 outline-none transition-all " +
  "hover:border-gray-400 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20";

const INPUT_DISABLED_CLS =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 " +
  "outline-none cursor-not-allowed select-none";

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function Card({ title, description, children }: {
  title?: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {(title || description) && (
        <div className="border-b border-gray-100 px-6 py-4">
          {title && <p className="text-sm font-semibold text-slate-800">{title}</p>}
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
      )}
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, optional, children }: {
  label: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start">
      <div className="w-52 shrink-0 pt-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {optional && <span className="ml-1.5 text-[11px] text-gray-400">(optional)</span>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 ${
        checked ? "bg-[#0066FF]" : "bg-gray-300"
      }`}
    >
      <span
        style={{ height: 18, width: 18 }}
        className={`inline-block transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function WarningBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3.5">
      <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
      <p className="text-sm text-amber-800 leading-relaxed">{message}</p>
    </div>
  );
}

// ─── General Profile tab ──────────────────────────────────────────────────────

function GeneralProfileTab({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-6">
      <Card title="Club Identity" description="Basic information about your organisation.">
        <FieldRow label="Club Name">
          <input className={INPUT_CLS} defaultValue="Hyke Youth Club" onChange={onChange} />
        </FieldRow>
        <FieldRow label="Tagline" optional>
          <input className={INPUT_CLS} defaultValue="Empowering youth through adventure." onChange={onChange} />
        </FieldRow>
        <FieldRow label="Club ID">
          <input className={INPUT_DISABLED_CLS} value="HYKE-ORG-001" readOnly />
          <p className="mt-1.5 text-[11px] text-gray-400">System-generated — cannot be changed.</p>
        </FieldRow>
      </Card>
      <Card title="Contact Information" description="How members and the public can reach your club.">
        <FieldRow label="Public Email" optional>
          <input type="email" className={INPUT_CLS} defaultValue="info@hyke.lk" onChange={onChange} />
        </FieldRow>
        <FieldRow label="Phone Number" optional>
          <input type="tel" className={INPUT_CLS} defaultValue="+94 77 000 0000" onChange={onChange} />
        </FieldRow>
        <FieldRow label="Headquarters" optional>
          <textarea rows={2} className={`${INPUT_CLS} resize-none`} defaultValue="No. 12, Kandy Road, Colombo 05, Sri Lanka" onChange={onChange} />
        </FieldRow>
      </Card>
    </div>
  );
}

// ─── Admin Access tab ─────────────────────────────────────────────────────────

function AdminAccessTab({ onChange }: { onChange: () => void }) {
  const [admins, setAdmins] = useState(MOCK_ADMINS);
  const revoke = (id: string) => { setAdmins(p => p.filter(a => a.id !== id)); onChange(); };
  return (
    <div className="space-y-6">
      <WarningBanner message="Changes to admin access take effect immediately. Revoking access will sign the user out of all dashboard sessions." />
      <Card title="Admin Users" description="Manage who has administrative access to this dashboard.">
        <div className="overflow-hidden rounded-lg border border-gray-100">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["User", "Role", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map(admin => (
                <tr key={admin.id} className="group transition-colors hover:bg-blue-50/30">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0066FF]">{admin.avatar}</div>
                      <div>
                        <p className="font-medium text-slate-800">{admin.name}</p>
                        <p className="text-[11px] text-gray-400">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0066FF]">{admin.role}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {admin.role !== "Super Admin" && (
                      <button type="button" onClick={() => revoke(admin.id)}
                        className="invisible flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 group-hover:visible">
                        <Trash2 size={12} /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50 active:scale-95" onClick={onChange}>
          <UserCircle2 size={15} /> Invite Admin
        </button>
      </Card>
    </div>
  );
}

// ─── Branding tab ─────────────────────────────────────────────────────────────

function BrandingTab({ onChange }: { onChange: () => void }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="space-y-6">
      <Card title="Club Logo" description="Upload your club's logo. SVG or PNG, min 256×256px.">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); onChange(); }}
          className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
            dragging ? "border-[#0066FF] bg-blue-50 scale-[1.01]" : "border-gray-300 bg-gray-50 hover:border-[#0066FF] hover:bg-blue-50/40"
          }`}
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${dragging ? "bg-[#0066FF] text-white" : "bg-white shadow-sm ring-1 ring-gray-200 text-[#0066FF]"}`}>
            {dragging ? <Upload size={24} /> : <ImagePlus size={24} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Drag & Drop your logo here</p>
            <p className="mt-1 text-xs text-gray-500">SVG, PNG, JPG — max 2 MB</p>
          </div>
          <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-gray-50">
            Choose File <input type="file" className="sr-only" accept="image/*" onChange={onChange} />
          </label>
        </div>
      </Card>
      <Card title="Brand Colours">
        <FieldRow label="Primary Colour">
          <div className="flex items-center gap-3">
            <input type="color" defaultValue="#0066FF" onChange={onChange} className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 hover:border-gray-400 transition" />
            <input className={`flex-1 ${INPUT_CLS}`} defaultValue="#0066FF" onChange={onChange} />
          </div>
        </FieldRow>
        <FieldRow label="Accent Colour">
          <div className="flex items-center gap-3">
            <input type="color" defaultValue="#FF6B35" onChange={onChange} className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 hover:border-gray-400 transition" />
            <input className={`flex-1 ${INPUT_CLS}`} defaultValue="#FF6B35" onChange={onChange} />
          </div>
        </FieldRow>
      </Card>
    </div>
  );
}

// ─── Emails & Alerts tab ──────────────────────────────────────────────────────

function EmailsTab({
  settings,
  onSettingsChange,
}: {
  settings: ClubSettings;
  onSettingsChange: (patch: Partial<ClubSettings>) => void;
}) {
  return (
    <div className="space-y-6">

      {/* ── 1. Sender Display Name (functional) ── */}
      <Card
        title="Sender Display Name"
        description='The name recipients see in their inbox as the "From" name, e.g. "Hyke Youth Club".'
      >
        <FieldRow label="Display Name">
          <input
            className={INPUT_CLS}
            value={settings.senderName}
            onChange={e => onSettingsChange({ senderName: e.target.value })}
            placeholder="Hyke Youth Club"
          />
        </FieldRow>
        <p className="mt-1 text-[11px] text-gray-400 pl-[208px]">
          This name appears alongside your system email address in every outgoing email.
        </p>
      </Card>

      {/* ── 2. Custom Sender Domain — upsell / coming soon ── */}
      <div className="relative overflow-hidden rounded-xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/40">
        {/* Coming Soon badge */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-2.5 py-1 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Coming Soon</span>
        </div>

        <div className="px-6 py-5">
          {/* Header row */}
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200">
              <Mail size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-800">Add Custom Sender Email</p>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">Pro Feature</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Send emails from your own domain address — like{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] text-slate-700">noreply@yourdomain.com</code> —
                instead of the system default. Build trust with your members and strengthen your brand identity.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Custom @yourdomain.com address",
              "Improved email deliverability",
              "Full SPF & DKIM authentication",
              "Remove system branding",
            ].map(f => (
              <span key={f} className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                <CheckCircle2 size={12} className="text-blue-400 shrink-0" />
                {f}
              </span>
            ))}
          </div>

          {/* CTA row */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white opacity-50 shadow-sm"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.09 6.26H21l-5.45 4L17.18 19 12 15.27 6.82 19l1.63-6.74L3 8.26h6.91L12 2z"/>
              </svg>
              Upgrade to Pro
            </button>
            <p className="text-[11px] text-gray-400">
              Available in the Pro plan — launching soon
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Notification Toggles ── */}
      <Card title="Notification Toggles" description="Control which automated emails the system sends.">
        <div className="flex items-center justify-between gap-4 py-1">
          <div>
            <p className="text-sm font-medium text-slate-800">Welcome Email on Approval</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Send the welcome email to a member when their application is approved.
            </p>
          </div>
          <Toggle
            checked={settings.newMemberAlerts}
            onChange={v => onSettingsChange({ newMemberAlerts: v })}
          />
        </div>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4 py-1 opacity-50 cursor-not-allowed">
          <div>
            <p className="text-sm font-medium text-slate-700">Payment Reminder Emails</p>
            <p className="mt-0.5 text-xs text-gray-400">Auto-send dues reminders. <span className="text-blue-400 font-medium">Coming soon</span></p>
          </div>
          <Toggle checked={settings.paymentReminders} onChange={() => {}} />
        </div>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4 py-1 opacity-50 cursor-not-allowed">
          <div>
            <p className="text-sm font-medium text-slate-700">Weekly Event Digest</p>
            <p className="mt-0.5 text-xs text-gray-400">A weekly summary of upcoming events. <span className="text-blue-400 font-medium">Coming soon</span></p>
          </div>
          <Toggle checked={settings.weeklyDigest} onChange={() => {}} />
        </div>
      </Card>

      {/* ── 4. Welcome Email Template ── */}
      <Card title="Welcome Email Template" description="Customise the message new members receive upon approval.">
        <FieldRow label="Subject Line">
          <input
            className={INPUT_CLS}
            value={settings.welcomeSubject}
            onChange={e => onSettingsChange({ welcomeSubject: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Body">
          <textarea
            rows={7}
            className={`${INPUT_CLS} resize-none leading-relaxed`}
            value={settings.welcomeTemplate}
            onChange={e => onSettingsChange({ welcomeTemplate: e.target.value })}
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            Variables:{" "}
            {["{{first_name}}", "{{last_name}}", "{{member_id}}", "{{join_date}}"].map(v => (
              <code key={v} className="mr-1 rounded bg-gray-100 px-1 py-0.5">{v}</code>
            ))}
          </p>
        </FieldRow>
      </Card>
    </div>
  );
}

// ─── Finance Config tab ───────────────────────────────────────────────────────

function FinanceTab({ onChange }: { onChange: () => void }) {
  return (
    <div className="space-y-6">
      <Card title="Currency & Dues">
        <FieldRow label="Base Currency">
          <select className={INPUT_CLS} defaultValue="LKR" onChange={onChange}>
            {[["LKR","Sri Lankan Rupee (LKR)"],["USD","US Dollar (USD)"],["GBP","British Pound (GBP)"],["AUD","Australian Dollar (AUD)"],["EUR","Euro (EUR)"]].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Default Dues Amount">
          <div className="flex items-center gap-2">
            <span className="flex h-[38px] items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-500 select-none">LKR</span>
            <input type="number" min="0" step="50" defaultValue={1500} onChange={onChange} className={`${INPUT_CLS} rounded-l-none flex-1`} />
          </div>
        </FieldRow>
        <FieldRow label="Dues Cycle">
          <select className={INPUT_CLS} defaultValue="monthly" onChange={onChange}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
            <option value="one-time">One-time</option>
          </select>
        </FieldRow>
      </Card>
      <Card title="Late Payment Policy">
        <FieldRow label="Grace Period (days)">
          <input type="number" min="0" max="90" defaultValue={7} onChange={onChange} className={INPUT_CLS} />
        </FieldRow>
        <FieldRow label="Late Fee">
          <div className="flex items-center gap-2">
            <span className="flex h-[38px] items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-500 select-none">LKR</span>
            <input type="number" min="0" step="10" defaultValue={200} onChange={onChange} className={`${INPUT_CLS} rounded-l-none flex-1`} />
          </div>
        </FieldRow>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: ClubSettings = {
  senderEmail:      "",
  senderName:       "Hyke Youth Club",
  newMemberAlerts:  true,
  welcomeTemplate:  `Hi {{first_name}},\n\nWelcome to Hyke Youth Club! Your membership application has been approved.\n\nYour Member ID is: {{member_id}}\n\nWe're excited to have you on board.\n\nBest regards,\nThe Hyke Team`,
  welcomeSubject:   "Welcome to Hyke Youth Club! 🎉",
  paymentReminders: false,
  weeklyDigest:     true,
};

export default function SettingsPage() {
  const [activeTab,   setActiveTab]   = useState<TabId>("general");

  // The last saved state (baseline for dirty comparison)
  const savedRef                       = useRef<ClubSettings>(DEFAULT_SETTINGS);
  const [saved,        setSaved]       = useState<ClubSettings>(DEFAULT_SETTINGS);
  const [current,      setCurrent]     = useState<ClubSettings>(DEFAULT_SETTINGS);
  const [loading,      setLoading]     = useState(true);
  const [saving,       setSaving]      = useState(false);

  // non-email-tab dirty flag (General, Branding, Finance, Admin — uncontrolled inputs)
  const [looseDirty,   setLooseDirty]  = useState(false);

  const dirty = looseDirty || !deepEqual(current, savedRef.current);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const d: { settings?: ClubSettings } = await res.json();
      const s = { ...DEFAULT_SETTINGS, ...(d.settings ?? {}) };
      savedRef.current = s;
      setSaved(s);
      setCurrent(s);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings().finally(() => setLoading(false));
  }, [loadSettings]);

  const handleSettingsChange = useCallback((patch: Partial<ClubSettings>) => {
    setCurrent(prev => ({ ...prev, ...patch }));
  }, []);

  const handleLooseChange = useCallback(() => {
    setLooseDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      const data: { settings?: ClubSettings } = await res.json();
      const next = { ...DEFAULT_SETTINGS, ...(data.settings ?? current) };
      savedRef.current = next;
      setSaved(next);
      setCurrent(next);
      setLooseDirty(false);
    } catch (e) {
      console.error("Failed to save settings", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setCurrent(savedRef.current);
    setSaved(savedRef.current);
    setLooseDirty(false);
  };

  const meta = TAB_META[activeTab];

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Inner Sidebar ─────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-100 px-5 py-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Settings</p>
          <p className="mt-1 text-sm font-bold text-slate-800">Organization Settings</p>
          <p className="text-xs text-gray-500">Hyke Global</p>
        </div>
        <nav className="flex-1 px-3 py-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <ChevronRight size={10} className="opacity-60" />
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`group flex w-full items-center gap-2.5 rounded-r-lg border-l-4 px-3 py-2 text-sm transition-all ${
                          active
                            ? "border-[#0066FF] bg-blue-50 font-semibold text-slate-800"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-slate-700"
                        }`}
                      >
                        <Icon size={15} className={`shrink-0 transition-colors ${active ? "text-[#0066FF]" : "text-gray-400 group-hover:text-slate-600"}`} />
                        {label}
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0066FF]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ──────────────────────────────── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <div className="flex-1 overflow-y-auto pb-28">
          <div className="mx-auto max-w-3xl px-6 py-8">
            {/* Page header */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">{meta.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{meta.subtitle}</p>
              <div className="mt-4 border-b border-gray-200" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-[#0066FF]" />
              </div>
            ) : (
              <>
                {activeTab === "general"       && <GeneralProfileTab onChange={handleLooseChange} />}
                {activeTab === "admin-access"  && <AdminAccessTab    onChange={handleLooseChange} />}
                {activeTab === "branding"      && <BrandingTab       onChange={handleLooseChange} />}
                {activeTab === "emails"        && (
                  <EmailsTab
                    settings={current}
                    onSettingsChange={handleSettingsChange}
                  />
                )}
                {activeTab === "finance"       && <FinanceTab        onChange={handleLooseChange} />}
              </>
            )}
          </div>
        </div>

        {/* ── Unsaved-changes floating bar ───────────── */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-8 py-3.5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ${
          dirty ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <p className="text-sm font-medium text-slate-700">You have unsaved changes.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              <X size={14} /> Discard
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-[#0066FF] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
