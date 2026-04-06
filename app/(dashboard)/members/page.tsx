"use client";

import { useState } from "react";
import { Users, Search, ChevronDown } from "lucide-react";
import MemberDetailModal, {
  type MemberDetail,
} from "@/components/ui/MemberDetailModal";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------
type Role =
  | "Member"
  | "President"
  | "Vice President"
  | "Secretary"
  | "Treasurer";

const ROLES: Role[] = [
  "Member",
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
];

interface Member extends MemberDetail {
  role: Role;
}

// Deterministic palette for seed avatars
const AVATAR_COLORS = [
  { bg: "#EDE9FE", text: "#7C3AED" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#0369A1" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

const SEED: Member[] = [
  {
    id: "1", name: "Nimal S. Perera",      initials: "NP",
    nic: "198812345678", address: "14, Galle Road, Colombo 03",
    phone: "+94 71 987 6543", whatsapp: "+94 71 987 6543",
    role: "President",    uuid: "member-uuid-0001",
  },
  {
    id: "2", name: "Ayesha R. Fernando",   initials: "AF",
    nic: "200156789012", address: "No. 5, Temple Lane, Kandy",
    phone: "+94 76 555 3210", whatsapp: "",
    role: "Secretary",    uuid: "member-uuid-0002",
  },
  {
    id: "3", name: "Kasun M. Bandara",     initials: "KB",
    nic: "199034567891", address: "22/B, Peradeniya Road, Kandy",
    phone: "+94 70 444 2200", whatsapp: "+94 70 444 2200",
    role: "Treasurer",    uuid: "member-uuid-0003",
  },
  {
    id: "4", name: "Dilini P. Jayaratne",  initials: "DJ",
    nic: "199823456780", address: "7, Marine Drive, Negombo",
    phone: "+94 78 321 0099", whatsapp: "",
    role: "Vice President", uuid: "member-uuid-0004",
  },
  {
    id: "5", name: "Sampath W. Wickrama",  initials: "SW",
    nic: "199145678901", address: "33, High Level Road, Maharagama",
    phone: "+94 77 666 1122", whatsapp: "+94 77 666 1122",
    role: "Member",       uuid: "member-uuid-0005",
  },
  {
    id: "6", name: "Tharushi K. Gamage",   initials: "TG",
    nic: "200267890123", address: "No. 2, Divithotawela, Welimada",
    phone: "+94 75 223 8844", whatsapp: "",
    role: "Member",       uuid: "member-uuid-0006",
  },
  {
    id: "7", name: "Ruwan D. Dissanayake", initials: "RD",
    nic: "198978901234", address: "45, Baseline Road, Colombo 09",
    phone: "+94 71 112 5599", whatsapp: "+94 71 112 5599",
    role: "Member",       uuid: "member-uuid-0007",
  },
];

// Role badge styles
const ROLE_BADGE: Record<Role, string> = {
  "President":      "bg-[#EDE9FE] text-[#7C3AED]",
  "Vice President": "bg-[#DBEAFE] text-[#1E40AF]",
  "Secretary":      "bg-[#D1FAE5] text-[#065F46]",
  "Treasurer":      "bg-[#FEF3C7] text-[#92400E]",
  "Member":         "bg-[var(--color-border)] text-[var(--color-text-secondary)]",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar({ initials, idx }: { initials: string; idx: number }) {
  const palette = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: palette.bg, color: palette.text }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function RoleSelect({
  memberId,
  value,
  onChange,
}: {
  memberId: string;
  value: Role;
  onChange: (id: string, role: Role) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        id={`role-${memberId}`}
        value={value}
        onChange={(e) => onChange(memberId, e.target.value as Role)}
        aria-label="Change member role"
        onClick={(e) => e.stopPropagation()} // prevent row click
        className={`
          h-7 appearance-none rounded-full border-0 py-0 pl-2.5 pr-6
          text-[11px] font-semibold outline-none cursor-pointer
          transition-opacity duration-100 hover:opacity-80
          focus:ring-2 focus:ring-[var(--color-brand-primary)]
          ${ROLE_BADGE[value]}
        `}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <ChevronDown
        size={11}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");

  // Modal state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleRoleChange = (id: string, role: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const openModal = (member: Member, idx: number) => {
    setSelectedMember(member);
    setSelectedIdx(idx);
  };

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <>
      <div className="space-y-6">
        {/* ── Page header ───────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[var(--color-brand-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Active Members
              </h2>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-border)] px-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                {members.length}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
              Click any row to view full details. Assign roles inline.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
              />
              <input
                type="search"
                placeholder="Search members…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-44 rounded-lg border border-[var(--color-border)] bg-white pl-8 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none transition focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary-light)]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "All")}
              aria-label="Filter by role"
              className="h-9 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-secondary)] outline-none transition focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary-light)] cursor-pointer"
            >
              <option value="All">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table card ────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-border)]">
                <Users size={24} className="text-[var(--color-text-secondary)]" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">No members found</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-workspace-bg)]">
                    {["Member", "Phone", "Role"].map((h) => (
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
                  {filtered.map((member, idx) => (
                    <tr
                      key={member.id}
                      onClick={() => openModal(member, idx)}
                      className="group cursor-pointer transition-colors duration-100 hover:bg-[var(--color-brand-primary-light)]"
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${member.name}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openModal(member, idx);
                      }}
                    >
                      {/* Member name + avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar initials={member.initials} idx={idx} />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {member.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              #{member.id.padStart(4, "0")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5 text-sm text-[var(--color-text-secondary)]">
                        {member.phone}
                      </td>

                      {/* Role select — stopPropagation prevents modal from opening */}
                      <td className="px-5 py-3.5">
                        <RoleSelect
                          memberId={member.id}
                          value={member.role}
                          onChange={handleRoleChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="border-t border-[var(--color-border)] px-5 py-3">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Showing{" "}
                  <span className="font-medium text-[var(--color-text-primary)]">{filtered.length}</span>
                  {" "}of{" "}
                  <span className="font-medium text-[var(--color-text-primary)]">{members.length}</span>
                  {" "}members · Click a row to view full profile
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Member Detail Modal ────────────────────────────── */}
      <MemberDetailModal
        member={selectedMember}
        memberIdx={selectedIdx}
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
