"use client";

import { useState } from "react";
import {
  QrCode,
  PlusCircle,
  Users,
  UserPlus,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PendingRow {
  id: string;
  initials: string;
  name: string;
  dateApplied: string;
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const PENDING: PendingRow[] = [
  { id: "1", initials: "RP", name: "Ruwan P. Kumara",    dateApplied: "2026-04-04" },
  { id: "2", initials: "TJ", name: "Tharushi Jayaratne", dateApplied: "2026-04-05" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon: Icon,
  valueColor = "text-slate-800",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50">
        <Icon size={20} className={valueColor} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className={`mt-0.5 text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [pending, setPending] = useState<PendingRow[]>(PENDING);

  const removePending = (id: string) =>
    setPending((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-8">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Overview</h2>
          <p className="mt-0.5 text-sm text-gray-400">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
            <QrCode size={16} />
            Scan QR
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
            <PlusCircle size={16} />
            Log Transaction
          </button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          label="Total Members"
          value={15}
          icon={Users}
          valueColor="text-slate-800"
        />
        <StatCard
          label="Pending Approvals"
          value={pending.length}
          icon={UserPlus}
          valueColor="text-orange-500"
        />
        <StatCard
          label="Treasury Balance"
          value="LKR 4,500.00"
          icon={Wallet}
          valueColor="text-[#0066FF]"
        />
      </div>

      {/* ── Pending Approvals Table ───────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Pending Approvals
            </h3>
            {pending.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-100 px-1.5 text-[11px] font-bold text-orange-500">
                {pending.length}
              </span>
            )}
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <CheckCircle size={22} className="text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">All cleared!</p>
            <p className="mt-0.5 text-xs text-gray-400">
              No pending applications right now.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Applicant", "Date Applied", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50/60"
                  >
                    {/* Applicant */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0066FF]">
                          {row.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {row.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-orange-400">
                            <Clock size={10} />
                            Pending review
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDate(row.dateApplied)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removePending(row.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-600 hover:text-white active:scale-95"
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => removePending(row.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white active:scale-95"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
