"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  User,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Phone,
  MessageCircle,
  Mail,
  Home,
  IdCard,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ChevronDown,
  Shield,
  Hash,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type DateFilter = "this_month" | "last_month" | "this_year";

interface MemberData {
  id:         string;
  name:       string;
  memberId:   string;
  email?:     string;
  phone:      string;
  whatsapp:   string;
  nic:        string;
  address:    string;
  role:       string;
  joinDate:   string;
  avatarUrl?: string;
  paletteIdx: number;
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#0369A1" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  President:      { bg: "#EDE9FE", text: "#6D28D9" },
  "Vice President": { bg: "#DBEAFE", text: "#1E40AF" },
  Secretary:      { bg: "#D1FAE5", text: "#065F46" },
  Treasurer:      { bg: "#FEF3C7", text: "#92400E" },
  Member:         { bg: "#F3F4F6", text: "#6B7280" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getInitials(name: string): string {
  if (!name) return "?";
  const tokens = name.trim().split(/[\s.]+/).filter(Boolean);
  if (tokens.length === 1) return tokens[0].substring(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
}

function buildAttendanceData(filter: DateFilter) {
  const count = filter === "this_year" ? 12 : 4;
  return Array.from({ length: count }, (_, i) => ({
    label:    filter === "this_year" ? MONTHS[i] : `Week ${i + 1}`,
    attended: Math.random() > 0.3,
  }));
}

// ─── QR Code component ────────────────────────────────────────────────────────
function QRCodeDisplay({ value }: { value: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    import("qrcode").then(QRCode => {
      QRCode.toDataURL(value, {
        width:  180,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      }).then(setSrc).catch(console.error);
    });
  }, [value]);

  if (!src) return (
    <div className="flex h-[140px] w-[140px] items-center justify-center rounded-xl bg-gray-100">
      <QrCode size={32} className="animate-pulse text-gray-300" />
    </div>
  );

  return (
    <div className="rounded-xl border-4 border-white p-1 shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`QR code for ${value}`} width={132} height={132} className="rounded-lg" />
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ title, icon: Icon, children, className = "" }: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4 bg-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
          <Icon size={14} className="text-[#0066FF]" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 mt-0.5">
        <Icon size={13} className="text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-700 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MemberPortalPage() {
  const params    = useParams<{ memberId: string }>();
  const memberId  = decodeURIComponent(params.memberId ?? "");

  const [filter,  setFilter]  = useState<DateFilter>("this_month");
  const [member,  setMember]  = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const attendance  = buildAttendanceData(filter);
  const attended    = attendance.filter(a => a.attended).length;
  const pct         = Math.round((attended / attendance.length) * 100);

  const filterLabel: Record<DateFilter, string> = {
    this_month: "This Month",
    last_month: "Last Month",
    this_year:  "This Year",
  };

  useEffect(() => {
    if (!memberId) { setLoading(false); setError("No member ID provided."); return; }
    fetch(`/api/members?memberId=${encodeURIComponent(memberId)}`)
      .then(async r => {
        if (!r.ok) { setError("Member not found."); setLoading(false); return; }
        const data: { members?: MemberData[] } = await r.json();
        const m = data.members?.[0] ?? null;
        setMember(m);
        if (!m) setError("Member not found.");
        setLoading(false);
      })
      .catch(() => { setError("Failed to load member data."); setLoading(false); });
  }, [memberId]);

  const palette   = PALETTE[(member?.paletteIdx ?? 0) % PALETTE.length];
  const roleColor = ROLE_COLOR[member?.role ?? "Member"] ?? ROLE_COLOR["Member"];

  const upcomingEvents = [
    { title: "Monthly General Meeting", date: "Apr 20, 2026", type: "Meeting" },
    { title: "Charity Fundraiser Walk",  date: "Apr 27, 2026", type: "Event"   },
    { title: "Sports Day",               date: "May 10, 2026", type: "Event"   },
  ];

  const payments = [
    { month: "March 2026",    status: "paid",    amount: "Rs. 500" },
    { month: "February 2026", status: "paid",    amount: "Rs. 500" },
    { month: "January 2026",  status: "overdue", amount: "Rs. 500" },
  ];

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Member Not Found</h2>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <p className="mt-0.5 font-mono text-xs text-gray-400">ID: {memberId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ───────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {loading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <>{member?.name ?? "Member"}&apos;s Portal</>
            )}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Member profile &amp; membership overview.</p>
        </div>

        {/* Date filter */}
        <div className="relative">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as DateFilter)}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-[#0066FF]"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* ── Hero Profile Banner ───────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Gradient accent bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0066FF] via-blue-400 to-indigo-500" />

        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            {loading ? (
              <Skeleton className="h-24 w-24 rounded-2xl" />
            ) : (
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-3xl font-bold shadow-md"
                style={!member?.avatarUrl ? { background: palette.bg, color: palette.text } : {}}
              >
                {member?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  getInitials(member?.name ?? "")
                )}
              </div>
            )}
            {/* QR Code */}
            <QRCodeDisplay value={memberId} />
            <p className="text-center text-[10px] text-gray-400">Scan for check-in</p>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1 mb-4">
              {loading ? (
                <>
                  <Skeleton className="h-7 w-56" />
                  <Skeleton className="mt-2 h-5 w-24" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900">{member?.name ?? "—"}</h2>
                  <span
                    className="mt-1 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: roleColor.bg, color: roleColor.text }}
                  >
                    {member?.role ?? "Member"}
                  </span>
                </>
              )}
            </div>

            {/* Info grid */}
            <div className="grid gap-0 divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-2.5 w-16 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <InfoRow icon={Hash}          label="Member ID"   value={member?.memberId ?? memberId} />
                  <InfoRow icon={IdCard}         label="NIC Number"  value={member?.nic ?? "—"} />
                  <InfoRow icon={Mail}           label="Email"       value={member?.email ?? "Not Provided"} />
                  <InfoRow icon={Phone}          label="Phone"       value={member?.phone ?? "—"} />
                  <InfoRow icon={MessageCircle}  label="WhatsApp"    value={member?.whatsapp ?? "—"} />
                  <InfoRow icon={Home}           label="Address"     value={member?.address ?? "—"} />
                  <InfoRow icon={CalendarDays}   label="Joined"      value={member?.joinDate ? formatDate(member.joinDate) : "—"} />
                  <InfoRow icon={Shield}         label="Status"      value="Active" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2×2 Grid ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* ── Card: Notice Board ───────────────────────── */}
        <Card title="Notice Board" icon={CalendarDays}>
          <div className="space-y-3">
            {upcomingEvents.map(ev => (
              <div key={ev.title} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-3">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0066FF] text-white">
                  <span className="text-[11px] font-bold leading-none">
                    {ev.date.split(" ")[1]?.replace(",", "")}
                  </span>
                  <span className="text-[9px] opacity-80">{ev.date.split(" ")[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      {ev.type}
                    </span>
                    <span className="text-[11px] text-gray-400">{ev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-gray-400">
            {filterLabel[filter]} · showing next 3 events
          </p>
        </Card>

        {/* ── Card: Attendance ────────────────────────── */}
        <Card title="My Attendance" icon={ClipboardCheck}>
          {/* Summary bar */}
          <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
            <div>
              <p className="text-2xl font-bold text-[#0066FF]">{pct}%</p>
              <p className="text-[11px] text-blue-500">Attendance rate</p>
            </div>
            <div className="text-right text-xs text-blue-600">
              <p className="font-semibold">{attended} attended</p>
              <p className="text-blue-400">of {attendance.length} sessions</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Grid dots */}
          <div className="grid grid-cols-6 gap-1.5">
            {attendance.map((a, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`h-7 w-7 rounded-md ${a.attended ? "bg-[#0066FF]" : "bg-gray-100"}`} />
                <span className="text-[9px] text-gray-400">{a.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-gray-400">{filterLabel[filter]} attendance</p>
        </Card>

        {/* ── Card: Finance ───────────────────────────── */}
        <Card title="My Finance" icon={CreditCard}>
          {/* Status badge */}
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Dues up to date</p>
              <p className="text-[11px] text-emerald-600">Next payment: May 1, 2026 — Rs. 500</p>
            </div>
          </div>

          {/* Payment history */}
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.month} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.month}</p>
                  <p className="text-[11px] text-gray-400">Monthly dues</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-slate-800">{p.amount}</span>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.status === "paid"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}>
                    {p.status === "paid"
                      ? <CheckCircle2 size={10} />
                      : <AlertCircle  size={10} />
                    }
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Card: Profile Summary ───────────────────── */}
        <Card title="My Profile" icon={User}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#0066FF]" />
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Full Name",  value: member?.name ?? "—" },
                { label: "Member ID",  value: member?.memberId ?? memberId },
                { label: "Role",       value: member?.role ?? "Member" },
                { label: "Joined",     value: member?.joinDate ? formatDate(member.joinDate) : "—" },
                { label: "Status",     value: "Active Member" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-medium text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-slate-700">{value}</span>
                </div>
              ))}
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-center">
                <p className="text-[11px] font-mono font-medium text-blue-600">{memberId}</p>
                <p className="text-[10px] text-blue-400 mt-0.5">Your unique member identifier</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
