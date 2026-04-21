"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LogOut,
  Bell,
  User,
  Hash,
  Mail,
  Phone,
  MessageCircle,
  Home,
  IdCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  LayoutDashboard,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import { getInitials, getGreetingName } from "@/lib/utils/nameUtils";

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

// ─── Shared Components ────────────────────────────────────────────────────────

function Badge({ children, variant = "blue" }: { children: React.ReactNode; variant?: "blue" | "amber" | "gray" }) {
  const styles = {
    blue:  "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    gray:  "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
}

function SectionCard({ title, icon: Icon, comingSoon, children }: { 
  title: string; icon: React.ElementType; comingSoon?: boolean; children: React.ReactNode 
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Icon size={16} />
          </div>
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        {comingSoon && <Badge variant="amber">Coming Soon</Badge>}
      </div>
      <div className={comingSoon ? "opacity-60 grayscale-[0.5]" : ""}>
        {children}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Main Portal UI ────────────────────────────────────────────────────────

export default function PortalPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.email) {
      const mid   = session.user.memberId ? encodeURIComponent(session.user.memberId) : "";
      const email = encodeURIComponent(session.user.email);
      
      fetch(`/api/members?memberId=${mid}&email=${email}`)
        .then(async res => {
          if (!res.ok) throw new Error("Failed to load");
          const data = await res.json();
          setMember(data.members?.[0] ?? null);
        })
        .catch(err => console.error("Portal fetch error:", err))
        .finally(() => setLoading(false));
    } else if (sessionStatus === "unauthenticated") {
      setLoading(false);
    }
  }, [sessionStatus, session?.user?.memberId, session?.user?.email]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-100 border-t-blue-600" />
      </div>
    );
  }

  const name = member?.name ?? session?.user?.name ?? "Member";
  const firstName = getGreetingName(name);
  const memberId = member?.memberId ?? session?.user?.memberId ?? "M-???";

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      {/* ── 1. Header ── */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0066FF]">Portal</p>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Hello, {firstName}</h1>
            </div>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 shadow-sm transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 active:scale-95"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="px-5 mt-6 max-w-5xl mx-auto space-y-6">
        
        {/* ── 2. Profile Card (Priority) ── */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm shadow-gray-200/50">
          <div className="h-24 bg-gradient-to-r from-[#0066FF] via-blue-400 to-blue-600" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex items-end justify-between">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-md">
                  {member?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatarUrl} alt={name} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    getInitials(name)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <div className="mb-2">
                <Badge variant="blue">Active {member?.role ?? "Member"}</Badge>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-bold text-slate-900">{name}</h2>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <Hash size={14} className="text-blue-500" />
                <span>{memberId}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <ReadOnlyField label="NIC Number" value={member?.nic ?? "—"} icon={IdCard} />
              <ReadOnlyField label="Email Address" value={member?.email ?? "—"} icon={Mail} />
              <ReadOnlyField label="Phone Number" value={member?.phone ?? "—"} icon={Phone} />
              <ReadOnlyField label="WhatsApp" value={member?.whatsapp ?? "—"} icon={MessageCircle} />
              <ReadOnlyField label="Permanent Address" value={member?.address ?? "—"} icon={Home} />
              <ReadOnlyField label="Joined Date" value={member?.joinDate ?? "—"} icon={Calendar} />
            </div>
          </div>
        </div>

        {/* ── 3. Feature Cards (Stacked/Grid) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Notice Board */}
          <SectionCard title="Notice Board" icon={Megaphone} comingSoon>
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-3">
                <p className="text-xs font-bold text-slate-800">Monthly General Meeting</p>
                <p className="mt-1 text-[10px] font-medium text-gray-500">Scheduled for next Saturday at 10 AM.</p>
              </div>
              <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-3">
                <p className="text-xs font-bold text-slate-800">Annual Subscriptions</p>
                <p className="mt-1 text-[10px] font-medium text-gray-500">Please settle your dues before end of the month.</p>
              </div>
            </div>
          </SectionCard>

          {/* My Attendance */}
          <SectionCard title="My Attendance" icon={CheckCircle2} comingSoon>
            <div className="flex items-center gap-4 py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <span className="text-lg font-black italic">85%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Regular Member</p>
                <p className="mt-0.5 text-[10px] text-gray-400">Showing this month's status</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1.5">
              {[1,1,1,1,0,1,1].map((a, i) => (
                <div key={i} className={`h-2.5 flex-1 rounded-full ${a ? 'bg-emerald-400' : 'bg-gray-100'}`} />
              ))}
            </div>
          </SectionCard>

          {/* My Finance */}
          <SectionCard title="My Finance" icon={CreditCard} comingSoon>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-gray-400">Total Paid</span>
                <span className="text-slate-700 font-bold">Rs. 1,500</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-gray-400">Outstanding</span>
                <span className="text-red-500 font-bold underline decoration-red-200">Rs. 500</span>
              </div>
              <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 py-2.5 text-[11px] font-bold text-blue-600 transition hover:bg-blue-50">
                Full Transaction History
                <ChevronRight size={14} />
              </button>
            </div>
          </SectionCard>

        </div>

        {/* ── 4. Digital ID / QR Card ── */}
        <DigitalIDCard memberId={memberId} />

      </div>
    </div>
  );
}

function DigitalIDCard({ memberId }: { memberId: string }) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    import("qrcode").then(QRCode => {
      QRCode.toDataURL(memberId, {
        width: 160,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      }).then(setQrSrc).catch(console.error);
    });
  }, [memberId]);

  return (
    <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-between text-center sm:text-left">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 font-mono">Digital Identity</p>
          <h3 className="mt-1 text-lg font-bold">Official Member Card</h3>
          <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed max-w-sm">
            Present this QR code during club meetings or events for seamless check-in and attendance recording.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-white p-2 shadow-inner">
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt="QR Code" width={100} height={100} className="rounded-xl" />
          ) : (
            <div className="h-24 w-24 animate-pulse bg-gray-100 rounded-xl flex items-center justify-center">
              <QrCode size={30} className="text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
