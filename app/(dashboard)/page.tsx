"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ClipboardList,
  Search,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------
type Status = "pending";

interface PendingMember {
  id: string;
  name: string;
  initials: string;
  phone: string;
  dateApplied: string;
  status: Status;
}

const SEED: PendingMember[] = [
  { id: "1", name: "John D.  Silva",      initials: "JS", phone: "+94 77 123 4567", dateApplied: "2026-04-01", status: "pending" },
  { id: "2", name: "Nimal S. Perera",     initials: "NP", phone: "+94 71 987 6543", dateApplied: "2026-04-02", status: "pending" },
  { id: "3", name: "Ayesha R. Fernando",  initials: "AF", phone: "+94 76 555 3210", dateApplied: "2026-04-02", status: "pending" },
  { id: "4", name: "Kasun M. Bandara",    initials: "KB", phone: "+94 70 444 2200", dateApplied: "2026-04-03", status: "pending" },
  { id: "5", name: "Dilini P. Jayaratne", initials: "DJ", phone: "+94 78 321 0099", dateApplied: "2026-04-04", status: "pending" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Avatar initials bubble
// ---------------------------------------------------------------------------
function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-xs font-bold text-[var(--color-brand-primary)]">
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyQueue() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-light)]">
        <CheckCircle size={28} className="text-[var(--color-success)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
        All caught up!
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        There are no pending applications right now.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ApprovalQueuePage() {
  const [queue, setQueue] = useState<PendingMember[]>(SEED);
  const [search, setSearch] = useState("");
  const [toasting, setToasting] = useState<{ id: string; type: "approved" | "rejected" } | null>(null);

  const filtered = queue.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleAction(id: string, action: "approve" | "reject") {
    const type = action === "approve" ? "approved" : "rejected";
    setToasting({ id, type });
    setTimeout(() => {
      setQueue((prev) => prev.filter((m) => m.id !== id));
      setToasting(null);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-[var(--color-brand-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Approval Queue
            </h2>
            {queue.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-1.5 text-[11px] font-bold text-white">
                {queue.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Review and act on new membership applications.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <input
            type="search"
            placeholder="Search applicants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-white pl-8 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none transition focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary-light)] sm:w-56"
          />
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Pending",  value: queue.length,  icon: Clock,       color: "var(--color-warning)",        bg: "var(--color-warning-light)"  },
          { label: "This Week", value: SEED.length,  icon: Users,       color: "var(--color-brand-primary)",  bg: "var(--color-brand-primary-light)" },
          { label: "Approved", value: SEED.length - queue.length, icon: CheckCircle, color: "var(--color-success)", bg: "var(--color-success-light)" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-sm)]"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ background: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{value}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        {filtered.length === 0 ? (
          <EmptyQueue />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-workspace-bg)]">
                  {["Applicant", "Phone", "Date Applied", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((member) => {
                  const isActing = toasting?.id === member.id;
                  return (
                    <tr
                      key={member.id}
                      className={`transition-colors duration-150 ${
                        isActing
                          ? toasting?.type === "approved"
                            ? "bg-[var(--color-success-light)]"
                            : "bg-[var(--color-danger-light)]"
                          : "hover:bg-[var(--color-workspace-bg)]"
                      }`}
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar initials={member.initials} />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              {member.name}
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-warning-light)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-warning)]">
                              <Clock size={10} />
                              Pending
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                        {member.phone}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                        {formatDate(member.dateApplied)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        {isActing ? (
                          <span
                            className={`text-sm font-semibold ${
                              toasting?.type === "approved"
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-danger)]"
                            }`}
                          >
                            {toasting?.type === "approved" ? "✓ Approved" : "✕ Rejected"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction(member.id, "approve")}
                              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-light)] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)] transition-all hover:bg-[var(--color-success)] hover:text-white active:scale-95"
                              aria-label={`Approve ${member.name}`}
                            >
                              <CheckCircle size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(member.id, "reject")}
                              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)] transition-all hover:bg-[var(--color-danger)] hover:text-white active:scale-95"
                              aria-label={`Reject ${member.name}`}
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
