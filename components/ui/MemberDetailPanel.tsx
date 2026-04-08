"use client";

import { useState } from "react";
import {
  X,
  Phone,
  MessageCircle,
  CreditCard,
  Home,
  Mail,
  Edit2,
  AlertTriangle
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared Types & Constants
// ---------------------------------------------------------------------------
export type Role = "Member" | "President" | "Vice President" | "Secretary" | "Treasurer";

export interface MonthlyContribution {
  month: string;
  amount: number;
  target: number;
}

export interface TransactionRecord {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
}

export interface MemberFinancials {
  totalPaidYtd: number;
  outstanding: number;
  contributions: MonthlyContribution[];
  transactions?: TransactionRecord[];
}

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  memberId: string;
  nic: string;
  address: string;
  phone: string;
  whatsapp: string;
  email?: string;
  role: Role;
  paletteIdx: number;
  joinDate: string;
  financials?: MemberFinancials;
}

export const PALETTE = [
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#0369A1" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

export function getInitials(name: string): string {
  if (!name) return "?";
  const str = name.trim();
  // Simple extraction:
  // e.g. "S. Lakshan" -> "SL"
  // "John Doe" -> "JD"
  const tokens = str.split(/[\s.]+/).filter(Boolean);
  if (tokens.length === 1) return tokens[0].substring(0, 2).toUpperCase();
  const first = tokens[0][0];
  const second = tokens[tokens.length - 1][0];
  return (first + (second || "")).toUpperCase() || "?";
}

const ROLE_COLOR: Record<Role, { bg: string; text: string }> = {
  "President":      { bg: "#EDE9FE", text: "#6D28D9" },
  "Vice President": { bg: "#DBEAFE", text: "#1E40AF" },
  "Secretary":      { bg: "#D1FAE5", text: "#065F46" },
  "Treasurer":      { bg: "#FEF3C7", text: "#92400E" },
  "Member":         { bg: "#F3F4F6", text: "#6B7280" },
};

// ---------------------------------------------------------------------------
// Inline QR Generator
// ---------------------------------------------------------------------------
function buildQRMatrix(value: string): boolean[][] {
  const SIZE = 25;
  const matrix: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        matrix[row + r][col + c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
  };
  addFinder(0, 0); addFinder(0, SIZE - 7); addFinder(SIZE - 7, 0);
  for (let i = 8; i < SIZE - 8; i++) { matrix[6][i] = i % 2 === 0; matrix[i][6] = i % 2 === 0; }
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) >>> 0;
  const isReserved = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= SIZE - 8) || (r >= SIZE - 8 && c < 8) || r === 6 || c === 6;
  let bit = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!isReserved(r, c)) { matrix[r][c] = ((h >>> (bit++ % 32)) & 1) === 1; }
  return matrix;
}

function QRCode({ value, size = 128 }: { value: string; size?: number }) {
  const modules = buildQRMatrix(value);
  const count = modules.length;
  const cell = size / count;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {modules.map((row, r) =>
        row.map((dark, c) =>
          dark ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#111827" /> : null
        )
      )}
    </svg>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        <Icon size={12} /> {label}
      </span>
      <span className="text-sm font-medium text-slate-700 break-words">{value || "—"}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Side Panel Component
// ---------------------------------------------------------------------------
interface MemberDetailPanelProps {
  member: Member | null;
  onClose: () => void;
  onRemove?: (id: string) => void;
  onEdit?: () => void;
}

export default function MemberDetailPanel({ member, onClose, onRemove, onEdit }: MemberDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"Overview" | "Finance" | "Attendance">("Overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  if (!member) return null;

  const palette = PALETTE[member.paletteIdx % PALETTE.length];
  const roleColor = ROLE_COLOR[member.role];

  return (
    <aside className="relative flex w-3/5 shrink-0 flex-col border-l border-gray-200 bg-white shadow-xl transition-all duration-300">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-800">{member.name}</h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={onEdit}
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-gray-50 active:bg-gray-100"
          >
            <Edit2 size={14} /> Edit
          </button>
          <div className="mx-1 h-5 w-px bg-gray-200" />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-slate-700"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="border-b border-gray-200 px-6 bg-white z-10 sticky top-0 shrink-0">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {(["Overview", "Finance", "Attendance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-[#0066FF] text-[#0066FF]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Content Container ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 relative">
        {/* === OVERVIEW TAB === */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            
            {/* 1. Primary Profile Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="flex flex-1 p-6 gap-5 items-center">
                <div
                  onClick={() => {
                    if (member.avatarUrl) setShowAvatarPreview(true);
                  }}
                  className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold shadow-sm ${member.avatarUrl ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
                  style={!member.avatarUrl ? { background: palette.bg, color: palette.text } : {}}
                  aria-label={member.avatarUrl ? "View profile photo" : undefined}
                >
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(member.name)
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
                  <span
                    className="mt-1.5 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: roleColor.bg, color: roleColor.text }}
                  >
                    {member.role}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#0066FF] hover:underline cursor-pointer transition">
                    <Mail size={13} /> Invite to Portal
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50/30">
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Digital ID</p>
                <div className="rounded-xl border border-gray-100 p-2 shadow-sm bg-white">
                  <QRCode value={member.memberId} size={70} />
                </div>
                <p className="mt-2 text-xs font-mono font-medium text-slate-600">{member.memberId}</p>
              </div>
            </div>

            {/* 2. Basic Details Grid */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Basic Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 px-6 py-5">
                <DetailItem icon={CreditCard} label="NIC Number" value={member.nic} />
                <DetailItem icon={Home} label="Address" value={member.address} />
                <DetailItem icon={Phone} label="Phone Number" value={member.phone} />
                <DetailItem icon={MessageCircle} label="WhatsApp" value={member.whatsapp} />
                <DetailItem icon={Mail} label="Email Address" value={member.email || "Not Provided"} />
              </div>
            </div>

            {/* 3. Danger Zone */}
            <div className="rounded-xl border border-red-200 bg-red-50/30 shadow-sm overflow-hidden mt-8">
               <div className="border-b border-red-200 bg-red-50/70 px-6 py-3.5 flex items-center gap-2">
                 <AlertTriangle size={16} className="text-red-600" />
                 <h4 className="text-xs font-bold uppercase tracking-wider text-red-600">Danger Zone</h4>
               </div>
               <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <p className="text-sm font-semibold text-slate-800">Remove Member</p>
                   <p className="text-xs text-gray-500 mt-0.5 max-w-[280px]">Permanently remove this member from the club. This action is irreversible.</p>
                 </div>
                 <button 
                   onClick={() => setShowDeleteConfirm(true)}
                   className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95 whitespace-nowrap"
                 >
                   Remove Member
                 </button>
               </div>
            </div>

          </div>
        )}

        {/* === FINANCE TAB === */}
        {activeTab === "Finance" && (
          <div className="space-y-6">
            {member.financials ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Paid (YTD)</p>
                    <p className="mt-1 text-xl font-bold text-slate-800">
                      LKR {member.financials.totalPaidYtd.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Outstanding</p>
                    <p className={`mt-1 text-xl font-bold ${member.financials.outstanding > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      LKR {member.financials.outstanding.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-800">Contribution Overview</h4>
                  <p className="mt-1 text-xs text-gray-500">Last 6 months contribution chart.</p>
                  
                  <div className="mt-6 flex h-32 items-end justify-between gap-2 px-2">
                    {member.financials.contributions.map((record, i) => {
                      const heightPercentage = record.target > 0 ? Math.min(100, Math.round((record.amount / record.target) * 100)) : 0;
                      return (
                        <div key={i} className="group relative flex w-full flex-col items-center gap-2">
                          <div className="flex w-full max-w-[24px] items-end rounded-t-sm bg-[#0066FF]/20" style={{ height: `100%` }}>
                            <div 
                              className="w-full rounded-t-sm bg-[#0066FF] transition-all group-hover:opacity-80" 
                              style={{ height: `${heightPercentage}%` }} 
                            />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="pointer-events-none absolute -top-8 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                            LKR {record.amount.toLocaleString()}
                          </div>
                          
                          <span className="text-[9px] font-medium text-gray-400">
                            {record.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {member.financials.transactions && member.financials.transactions.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-800">Recent Transactions</h4>
                    <div className="mt-4 space-y-3">
                      {member.financials.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                          <div>
                            <span className="block text-sm font-semibold text-slate-800">LKR {tx.amount.toLocaleString()}</span>
                            <span className="block text-xs text-gray-500 mt-0.5">{tx.date} • {tx.id}</span>
                          </div>
                          <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === "Paid" ? "text-emerald-600 bg-emerald-50" : 
                            tx.status === "Pending" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm font-semibold text-gray-400">No Financial Records Available</p>
              </div>
            )}
          </div>
        )}

        {/* === ATTENDANCE TAB === */}
        {activeTab === "Attendance" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Attendance Rate</h4>
                <p className="mt-0.5 text-xs text-gray-500">Across all mandatory meetings.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-emerald-500 text-sm font-bold text-emerald-600">
                85%
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-800">Recent Sessions</h4>
              <div className="mt-4 space-y-3">
                {[
                  { date: "April 02, 2026", status: "Present", color: "text-emerald-600 bg-emerald-50" },
                  { date: "March 26, 2026", status: "Absent", color: "text-red-600 bg-red-50" },
                  { date: "March 19, 2026", status: "Present", color: "text-emerald-600 bg-emerald-50" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-700">{s.date}</span>
                    <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Overlay ───────────────── */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-6 overflow-hidden"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="w-full max-w-[320px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-center text-lg font-bold text-slate-900">Remove Member?</h3>
            <p className="mt-2 text-center text-xs text-gray-500 leading-relaxed max-w-[260px] mx-auto">
              Are you sure you want to completely remove <strong className="text-slate-700">{member.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button 
                onClick={() => {
                  if (onRemove) onRemove(member.id);
                  setShowDeleteConfirm(false);
                }}
                className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
              >
                Yes, Remove
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Preview Overlay ─────────────────────── */}
      {showAvatarPreview && member.avatarUrl && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-6 overflow-hidden"
          onClick={() => setShowAvatarPreview(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Brand Tag */}
            <div className="bg-[#0066FF] px-4 py-3.5 flex items-center justify-between">
              <span className="font-semibold text-white truncate px-1">{member.name}</span>
              <button 
                onClick={() => setShowAvatarPreview(false)}
                className="text-white/80 hover:text-white transition active:scale-90"
              >
                <X size={20} />
              </button>
            </div>
            {/* Image display */}
            <div className="w-full aspect-square bg-gray-100 flex p-0">
               <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
