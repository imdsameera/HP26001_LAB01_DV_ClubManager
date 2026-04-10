"use client";

import { useState, useEffect } from "react";
import { useSession }          from "next-auth/react";
import {
  User, CalendarDays, ClipboardCheck, CreditCard,
  ChevronDown, QrCode, CheckCircle2, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type DateFilter = "this_month" | "last_month" | "this_year";

interface MemberData {
  firstName:  string;
  lastName:   string;
  memberId:   string;
  email:      string;
  phone:      string;
  role:       string;
  joinDate:   string;
  avatarUrl?: string;
  status:     string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getInitials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

// Simple placeholder attendance data
function buildAttendanceData(filter: DateFilter) {
  const now   = new Date();
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
        width:  200,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      }).then(setSrc).catch(console.error);
    });
  }, [value]);

  if (!src) return (
    <div className="flex h-[120px] w-[120px] items-center justify-center rounded-xl bg-gray-100">
      <QrCode size={32} className="animate-pulse text-gray-300" />
    </div>
  );

  return (
    <div className="rounded-xl border-4 border-white p-1 shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`QR code for ${value}`} width={112} height={112} className="rounded-lg" />
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ title, icon: Icon, children, className = "" }: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
          <Icon size={14} className="text-[#0066FF]" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PortalPage() {
  const { data: session } = useSession();
  const [filter,   setFilter]   = useState<DateFilter>("this_month");
  const [member,   setMember]   = useState<MemberData | null>(null);
  const [loading,  setLoading]  = useState(true);

  const memberId    = session?.user?.memberId;
  const attendance  = buildAttendanceData(filter);
  const attended    = attendance.filter(a => a.attended).length;
  const pct         = Math.round((attended / attendance.length) * 100);

  // Fetch member data
  useEffect(() => {
    if (!memberId) { setLoading(false); return; }
    fetch(`/api/members?memberId=${encodeURIComponent(memberId)}`)
      .then(r => r.json())
      .then((data: { members?: MemberData[] }) => {
        setMember(data.members?.[0] ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [memberId]);

  const upcomingEvents = [
    { title: "Monthly General Meeting", date: "Apr 20, 2026", type: "Meeting" },
    { title: "Charity Fundraiser Walk",  date: "Apr 27, 2026", type: "Event"   },
    { title: "Sports Day",               date: "May 10, 2026", type: "Event"   },
  ];

  const payments = [
    { month: "March 2026",   status: "paid",    amount: "Rs. 500" },
    { month: "February 2026", status: "paid",   amount: "Rs. 500" },
    { month: "January 2026",  status: "overdue", amount: "Rs. 500" },
  ];

  const filterLabel: Record<DateFilter, string> = {
    this_month: "This Month",
    last_month: "Last Month",
    this_year:  "This Year",
  };

  return (
    <div className="space-y-5">
      {/* ── Page header + date filter ─────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Member"}! 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Here's your membership overview.</p>
        </div>

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

      {/* ── 2×2 Grid ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* ── Card 1: Profile + QR ───────────────────── */}
        <Card title="My Profile" icon={User}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#0066FF]" />
            </div>
          ) : (
            <div className="flex items-start gap-5">
              <QRCodeDisplay value={memberId ?? "HYKE-0000"} />

              <div className="min-w-0 flex-1 space-y-2.5">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {member ? `${member.firstName} ${member.lastName}` : session?.user?.name}
                  </p>
                  <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                    {member?.role ?? "Member"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  {[
                    { label: "Member ID",  val: member?.memberId  ?? memberId ?? "—" },
                    { label: "Email",      val: member?.email     ?? session?.user?.email ?? "—" },
                    { label: "Phone",      val: member?.phone     ?? "—" },
                    { label: "Joined",     val: member?.joinDate  ? formatDate(member.joinDate) : "—" },
                    { label: "Status",     val: member?.status    ?? "Active" },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex gap-2">
                      <span className="w-20 shrink-0 font-medium text-gray-400">{label}</span>
                      <span className="text-slate-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <p className="mt-4 text-center text-[10px] text-gray-400">
            Scan QR code for quick check-in · {memberId ?? ""}
          </p>
        </Card>

        {/* ── Card 2: Notice Board / Upcoming Events ─── */}
        <Card title="Notice Board" icon={CalendarDays}>
          <div className="space-y-3">
            {upcomingEvents.map(ev => (
              <div key={ev.title} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-3">
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0066FF] text-white">
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

        {/* ── Card 3: Attendance ─────────────────────── */}
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

        {/* ── Card 4: Finance / Dues ─────────────────── */}
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
      </div>
    </div>
  );
}
