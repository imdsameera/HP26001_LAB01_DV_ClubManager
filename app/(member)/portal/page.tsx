"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  QrCode,
  ArrowUpRight,
  ChevronDown
} from "lucide-react";

// ─── QR Code Component ────────────────────────────────────────────────────────
function QRCodeHover({ value }: { value: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(value, {
        width: 120,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then(setSrc)
        .catch(console.error);
    });
  }, [value]);

  if (!src)
    return (
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-white">
        <QrCode size={24} className="animate-pulse text-gray-300" />
      </div>
    );

  return (
    <div className="group relative cursor-pointer rounded-lg bg-white p-1.5 shadow-sm transition hover:scale-105 active:scale-95">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="QR Code"
        className="h-[60px] w-[60px] rounded object-contain"
      />
      <div className="absolute inset-0 hidden flex-col items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm group-hover:flex group-active:flex">
        <QrCode size={18} className="text-white" />
        <span className="mt-1 text-[9px] font-bold tracking-widest text-white">
          TAP
        </span>
      </div>
    </div>
  );
}

// ─── Main Portal UI ────────────────────────────────────────────────────────
export default function PortalPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState("This Month");
  
  // Dummy data
  const name = session?.user?.name ?? "Member";
  const firstName = name.split(" ")[0];
  const initials = firstName ? firstName[0].toUpperCase() : "M";
  const memberId = session?.user?.memberId ?? "#POL-042";

  return (
    <div className="flex-1 pb-10">
      {/* ── 1. Top Header ── */}
      <header className="flex h-16 items-center justify-between px-5 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 shadow-sm">
            {initials}
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
              Welcome back
            </p>
            <p className="text-sm font-bold text-slate-900">Hello, {firstName} 👋</p>
          </div>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition active:scale-95">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
      </header>

      <div className="px-5">
        {/* ── 2. The Digital ID Card (Hero Section) ── */}
        <div className="mt-2 relative overflow-hidden rounded-2xl bg-[#0066FF] p-5 text-white shadow-lg shadow-blue-500/20">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-blue-100 text-sm mt-0.5">{memberId}</p>
              <div className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur-md border border-white/10 shadow-sm">
                Player
              </div>
            </div>
            
            <QRCodeHover value={memberId} />
          </div>
        </div>

        {/* ── 3. Quick Stats Row ── */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* Stat 1 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Attendance This Month
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">85%</span>
              <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight size={10} className="mr-0.5" /> 5%
              </span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Outstanding Dues
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-600">Rs. 500</span>
            </div>
          </div>
        </div>

        {/* ── 4. Stacked Content Cards ── */}
        <div className="mt-6 flex flex-col gap-6">
          
          {/* Card A: Next Event */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="text-[#0066FF]" size={14} />
              </div>
              <h3 className="font-bold text-slate-800">Upcoming Calendar</h3>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-[10px] font-bold tracking-wider text-[#0066FF] uppercase mb-1">
                Next Event
              </p>
              <p className="text-[15px] font-bold text-slate-900">Evening Practice</p>
              <p className="text-xs font-medium text-gray-500 mt-1">April 16, 5:00 PM</p>
              
              <div className="mt-5 flex gap-2.5">
                <button className="flex-1 rounded-full bg-[#0066FF] py-3 text-[13px] font-bold text-white transition active:scale-95 shadow-md shadow-blue-500/20">
                  Attending
                </button>
                <button className="flex-1 rounded-full border border-gray-200 bg-white py-3 text-[13px] font-bold text-slate-600 transition hover:bg-gray-50 active:scale-95 shadow-sm">
                  Not Attending
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Attendance Heatmap */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 className="text-emerald-500" size={14} />
                </div>
                <h3 className="font-bold text-slate-800">My Attendance</h3>
              </div>
              <div className="relative">
                <select 
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="appearance-none rounded-lg bg-gray-50 pl-3 pr-7 py-1.5 text-xs font-bold text-slate-600 outline-none border border-gray-100"
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => {
                const isPast = i < 21;
                const attended = isPast && Math.random() > 0.25;
                return (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-full transition-colors ${
                      isPast 
                        ? attended 
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/20' 
                          : 'bg-gray-100' 
                        : 'bg-gray-50 border border-gray-100'
                    }`} 
                  />
                );
              })}
            </div>
          </div>

          {/* Card C: Payment Ledger */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                <CreditCard className="text-indigo-500" size={14} />
              </div>
              <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">April Dues</p>
                  <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                    Paid
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">Rs. 500</p>
              </div>

              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Gear Fund</p>
                  <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600">
                    Pending
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">Rs. 1000</p>
              </div>

              <div className="flex items-center justify-between pb-1">
                <div>
                  <p className="text-sm font-bold text-slate-800">March Dues</p>
                  <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                    Paid
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">Rs. 500</p>
              </div>
            </div>
            
            <button className="mt-5 flex w-full h-[44px] items-center justify-center rounded-xl bg-gray-50/50 text-xs font-bold text-blue-600 transition hover:bg-blue-50 active:scale-95 border border-gray-100">
              View Full History &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
