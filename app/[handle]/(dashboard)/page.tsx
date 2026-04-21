"use client";

import { useCallback, useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import PendingApplicantModal from "@/components/ui/PendingApplicantModal";
import type { Role } from "@/components/ui/MemberDetailPanel";

interface PendingRow {
  id: string;
  initials: string;
  firstName: string;
  lastName: string;
  name: string;
  nic: string;
  email?: string;
  phoneCode: string;
  phone: string;
  whatsappCode: string;
  whatsapp: string;
  address: string;
  avatarUrl?: string;
  role: string;
  dateApplied: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

async function fetchDashboardPatch(): Promise<{
  totalMembers?: number;
  pending?: PendingRow[];
}> {
  try {
    const [statsRes, pendingRes] = await Promise.all([
      fetch("/api/dashboard/stats"),
      fetch("/api/members?status=pending"),
    ]);
    const stats: unknown = await statsRes.json();
    const pendingJson: unknown = await pendingRes.json();
    const patch: { totalMembers?: number; pending?: PendingRow[] } = {};
    if (
      statsRes.ok &&
      typeof stats === "object" &&
      stats !== null &&
      "totalMembers" in stats &&
      typeof (stats as { totalMembers: unknown }).totalMembers === "number"
    ) {
      patch.totalMembers = (stats as { totalMembers: number }).totalMembers;
    }
    if (
      pendingRes.ok &&
      typeof pendingJson === "object" &&
      pendingJson !== null &&
      "pending" in pendingJson &&
      Array.isArray((pendingJson as { pending: unknown }).pending)
    ) {
      patch.pending = (pendingJson as { pending: PendingRow[] }).pending;
    }
    return patch;
  } catch {
    return {};
  }
}

function StatCard({
  label, value, icon: Icon, valueColor = "text-slate-800",
}: {
  label: string; value: string | number; icon: React.ElementType; valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50">
        <Icon size={20} className={valueColor} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
        <p className={`mt-0.5 text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState<PendingRow | null>(null);

  const refreshDashboard = useCallback(async () => {
    const patch = await fetchDashboardPatch();
    if (patch.totalMembers !== undefined) setTotalMembers(patch.totalMembers);
    if (patch.pending !== undefined) setPending(patch.pending);
  }, []);

  const searchParams = useSearchParams();
  const applicantId = searchParams.get("applicantId");
  const processedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const patch = await fetchDashboardPatch();
      if (cancelled) return;
      if (patch.totalMembers !== undefined) setTotalMembers(patch.totalMembers);
      
      if (patch.pending !== undefined) {
        setPending(patch.pending);
        
        // Handle deep link from notification
        if (applicantId && !processedRef.current) {
          processedRef.current = true;
          const target = patch.pending.find(p => p.id === applicantId);
          if (target) setSelectedApplicant(target);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applicantId]);

  const handleApprove = async (id: string, role?: Role) => {
    const body = role ? JSON.stringify({ role }) : undefined;
    const res = await fetch(`/api/members/${id}/approve`, {
      method: "POST",
      headers: role ? { "Content-Type": "application/json" } : undefined,
      body,
    });
    if (res.ok) {
      await refreshDashboard();
      if (selectedApplicant?.id === id) setSelectedApplicant(null);
    }
  };

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (res.ok) {
      await refreshDashboard();
      if (selectedApplicant?.id === id) setSelectedApplicant(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Overview</h2>
          <p className="mt-0.5 text-sm text-gray-400">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
            <QrCode size={16} /> Scan QR
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
            <PlusCircle size={16} /> Log Transaction
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Total Members"      value={totalMembers}   icon={Users}    valueColor="text-slate-800"  />
        <StatCard label="Pending Approvals"  value={pending.length} icon={UserPlus} valueColor="text-orange-500" />
        <StatCard label="Treasury Balance"   value="LKR 4,500.00"   icon={Wallet}   valueColor="text-[#0066FF]"  />
      </div>

      {/* Pending approvals table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-800">Pending Approvals</h3>
          {pending.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-100 px-1.5 text-[11px] font-bold text-orange-500">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <CheckCircle size={22} className="text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">All cleared!</p>
            <p className="mt-0.5 text-xs text-gray-400">No pending applications right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Applicant", "Date Applied", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50/60 cursor-pointer group"
                    onClick={() => setSelectedApplicant(row)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0066FF] overflow-hidden">
                          {row.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.avatarUrl} alt={row.name} className="h-full w-full object-cover" />
                          ) : (
                            row.initials
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 transition group-hover:text-[#0066FF]">{row.name}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-orange-400">
                            <Clock size={10} /> Pending review
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(row.dateApplied)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleApprove(row.id);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-600 hover:text-white active:scale-95"
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleReject(row.id);
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white active:scale-95"
                        >
                          <XCircle size={13} /> Reject
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

      <PendingApplicantModal
        isOpen={selectedApplicant !== null}
        onClose={() => setSelectedApplicant(null)}
        applicant={selectedApplicant as any}
        onApprove={(id, role) => void handleApprove(id, role)}
        onReject={(id) => void handleReject(id)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-32 items-center justify-center"><p className="text-sm text-gray-400 animate-pulse">Loading dashboard...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
