"use client";

import { useState } from "react";
import MemberFormModal from "@/components/ui/MemberFormModal";
import {
  UserPlus,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import MemberDetailPanel, {
  type Member,
  type Role,
  PALETTE,
  getInitials,
} from "@/components/ui/MemberDetailPanel";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLE_BADGE: Record<Role, string> = {
  President: "bg-violet-100 text-violet-700",
  "Vice President": "bg-blue-100   text-blue-700",
  Secretary: "bg-emerald-100 text-emerald-700",
  Treasurer: "bg-amber-100  text-amber-700",
  Member: "bg-gray-100   text-gray-500",
};

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------
const SEED: Member[] = [
  {
    id: "1",
    memberId: "HYKE-001",
    name: "S. Lakshan",
    avatarUrl:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=400&h=400",
    nic: "199823456780",
    address: "14, Divithotawela, Welimada",
    phone: "077 123 4567",
    whatsapp: "077 123 4567",
    email: "s.lakshan@hyke.lk",
    role: "President",
    paletteIdx: 0,
    joinDate: "2023-01-15",
    financials: {
      totalPaidYtd: 15000,
      outstanding: 0,
      contributions: [
        { month: "Oct", amount: 2500, target: 2500 },
        { month: "Nov", amount: 2500, target: 2500 },
        { month: "Dec", amount: 2500, target: 2500 },
        { month: "Jan", amount: 2500, target: 2500 },
        { month: "Feb", amount: 2500, target: 2500 },
        { month: "Mar", amount: 2500, target: 2500 },
      ],
      transactions: [
        { id: "TRX-1092", date: "Mar 15, 2026", amount: 2500, status: "Paid" },
        { id: "TRX-0945", date: "Feb 15, 2026", amount: 2500, status: "Paid" },
        { id: "TRX-0821", date: "Jan 15, 2026", amount: 2500, status: "Paid" },
      ],
    },
  },
  {
    id: "2",
    memberId: "HYKE-002",
    name: "P. Malinda",
    nic: "200156789012",
    address: "No. 5, Divithotawela, Welimada",
    phone: "076 555 3210",
    whatsapp: "076 555 3210",
    email: "p.malinda@hyke.lk",
    role: "Secretary",
    paletteIdx: 1,
    joinDate: "2023-03-22",
    financials: {
      totalPaidYtd: 10000,
      outstanding: 5000,
      contributions: [
        { month: "Oct", amount: 2500, target: 2500 },
        { month: "Nov", amount: 2500, target: 2500 },
        { month: "Dec", amount: 2500, target: 2500 },
        { month: "Jan", amount: 0, target: 2500 },
        { month: "Feb", amount: 0, target: 2500 },
        { month: "Mar", amount: 2500, target: 2500 },
      ],
      transactions: [
        { id: "TRX-1105", date: "Mar 20, 2026", amount: 2500, status: "Paid" },
        {
          id: "TRX-0988",
          date: "Feb 20, 2026",
          amount: 2500,
          status: "Failed",
        },
        {
          id: "TRX-0850",
          date: "Jan 20, 2026",
          amount: 2500,
          status: "Failed",
        },
      ],
    },
  },
  {
    id: "3",
    memberId: "HYKE-003",
    name: "A. Chanaka",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400",
    nic: "199034567891",
    address: "22/B, Peradeniya Road, Kandy",
    phone: "070 444 2200",
    whatsapp: "",
    email: "k.bandara@gmail.com",
    role: "Treasurer",
    paletteIdx: 2,
    joinDate: "2023-05-10",
    financials: {
      totalPaidYtd: 12500,
      outstanding: 2500,
      contributions: [
        { month: "Oct", amount: 2500, target: 2500 },
        { month: "Nov", amount: 2500, target: 2500 },
        { month: "Dec", amount: 2500, target: 2500 },
        { month: "Jan", amount: 2500, target: 2500 },
        { month: "Feb", amount: 0, target: 2500 },
        { month: "Mar", amount: 2500, target: 2500 },
      ],
      transactions: [
        { id: "TRX-1088", date: "Mar 10, 2026", amount: 2500, status: "Paid" },
        {
          id: "TRX-0932",
          date: "Feb 10, 2026",
          amount: 2500,
          status: "Pending",
        },
        { id: "TRX-0811", date: "Jan 10, 2026", amount: 2500, status: "Paid" },
      ],
    },
  },
  {
    id: "4",
    memberId: "HYKE-004",
    name: "K. Dilshan",
    nic: "199823410099",
    address: "7, Marine Drive, Negombo",
    phone: "078 321 0099",
    whatsapp: "078 321 0099",
    email: "d.jayaratne@hyke.lk",
    role: "Vice President",
    paletteIdx: 3,
    joinDate: "2023-07-01",
    financials: {
      totalPaidYtd: 7500,
      outstanding: 7500,
      contributions: [
        { month: "Oct", amount: 2500, target: 2500 },
        { month: "Nov", amount: 2500, target: 2500 },
        { month: "Dec", amount: 0, target: 2500 },
        { month: "Jan", amount: 2500, target: 2500 },
        { month: "Feb", amount: 0, target: 2500 },
        { month: "Mar", amount: 0, target: 2500 },
      ],
      transactions: [
        {
          id: "TRX-1120",
          date: "Mar 05, 2026",
          amount: 2500,
          status: "Failed",
        },
        {
          id: "TRX-0960",
          date: "Feb 05, 2026",
          amount: 2500,
          status: "Pending",
        },
        { id: "TRX-0805", date: "Jan 05, 2026", amount: 2500, status: "Paid" },
      ],
    },
  },
  {
    id: "5",
    memberId: "HYKE-005",
    name: "K.M. Sanjitha",
    nic: "199145678901",
    address: "33, High Level Road, Maharagama",
    phone: "077 666 1122",
    whatsapp: "077 666 1122",
    email: "s.wickrama@outlook.com",
    role: "Member",
    paletteIdx: 4,
    joinDate: "2023-11-12",
    financials: {
      totalPaidYtd: 15000,
      outstanding: 0,
      contributions: [
        { month: "Oct", amount: 2500, target: 2500 },
        { month: "Nov", amount: 2500, target: 2500 },
        { month: "Dec", amount: 2500, target: 2500 },
        { month: "Jan", amount: 2500, target: 2500 },
        { month: "Feb", amount: 2500, target: 2500 },
        { month: "Mar", amount: 2500, target: 2500 },
      ],
      transactions: [
        { id: "TRX-1099", date: "Mar 12, 2026", amount: 2500, status: "Paid" },
        { id: "TRX-0951", date: "Feb 12, 2026", amount: 2500, status: "Paid" },
        { id: "TRX-0818", date: "Jan 12, 2026", amount: 2500, status: "Paid" },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Page Component (Split View)
// ---------------------------------------------------------------------------
export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [selected, setSelected] = useState<Member | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return (
    // Height minus TopNav (65px) so the panel stretches exactly screen height without creating a nested scrollbar
    // Negative margins counteract the padding from layout.tsx
    <div className="flex h-[calc(100vh-65px)] -m-4 sm:-m-6 lg:-m-8">
      {/* ── Left Column: Table View ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Active Members
              </h2>
              <p className="mt-0.5 text-sm text-gray-400">
                {members.length} members · Click a row to view full profile.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMember(null);
                setIsFormModalOpen(true);
              }}
              className={`flex items-center gap-2 self-start rounded-lg bg-[#0066FF] ${selected ? "w-10 h-10 justify-center p-0" : "px-4 py-2.5"} text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 sm:self-auto cursor-pointer`}
              aria-label="New Member"
            >
              <UserPlus size={16} /> {!selected && "New Member"}
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Member
                    </th>
                    {!selected && (
                      <>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          ID
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Contact
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Join Date
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          Role
                        </th>
                        <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400"></th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {members.map((m) => {
                    const palette = PALETTE[m.paletteIdx % PALETTE.length];
                    const isSelected = selected?.id === m.id;

                    return (
                      <tr
                        key={m.id}
                        onClick={() => setSelected(m)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50/50 hover:bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* ── Member: avatar + name ─────────── */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold transition-shadow ${isSelected ? "ring-2 ring-blue-200 ring-offset-2" : ""}`}
                              style={
                                !m.avatarUrl
                                  ? {
                                      background: palette.bg,
                                      color: palette.text,
                                    }
                                  : {}
                              }
                            >
                              {m.avatarUrl ? (
                                <img
                                  src={m.avatarUrl}
                                  alt={m.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getInitials(m.name)
                              )}
                            </div>
                            <span
                              className={`text-sm font-semibold ${isSelected ? "text-[#0066FF]" : "text-slate-800"}`}
                            >
                              {m.name}
                            </span>
                          </div>
                        </td>

                        {!selected && (
                          <>
                            {/* ── Member ID badge ───────────────── */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`rounded-md px-2 py-0.5 font-mono text-xs ${isSelected ? "bg-blue-100 text-[#0066FF]" : "bg-gray-100 text-gray-500"}`}
                              >
                                {m.memberId}
                              </span>
                            </td>

                            {/* ── Contact: phone + WhatsApp ─────── */}
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm text-gray-600">
                                  {m.phone}
                                </span>
                                {m.whatsapp && (
                                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                    <MessageCircle size={11} />
                                    WhatsApp
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* ── Join Date ───────────────────── */}
                            <td className="px-5 py-3.5 text-sm text-gray-500">
                              {m.joinDate}
                            </td>

                            {/* ── Role badge ───────────────────── */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold ${ROLE_BADGE[m.role]}`}
                              >
                                {m.role}
                              </span>
                            </td>

                            {/* ── Action chevron ────────────────── */}
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(m);
                                }}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                  isSelected
                                    ? "bg-blue-100 text-[#0066FF]"
                                    : "text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                                }`}
                                aria-label={`View ${m.name}`}
                              >
                                <ChevronRight size={16} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-3 bg-white">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {members.length}
                  </span>{" "}
                  active members
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column: Detail Panel ───────────────────────── */}
      {selected && (
        <MemberDetailPanel
          member={selected}
          onClose={() => setSelected(null)}
          onRemove={(id) => {
            setMembers((prev) => prev.filter((m) => m.id !== id));
            setSelected(null);
          }}
          onEdit={() => {
            setEditingMember(selected);
            setIsFormModalOpen(true);
          }}
        />
      )}

      {/* Add / Edit Member Modal */}
      <MemberFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMember(null);
        }}
        initialData={editingMember}
        onSave={(data) => {
          console.log("Member data saved:", data);
        }}
      />
    </div>
  );
}
