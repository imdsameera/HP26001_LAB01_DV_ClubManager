"use client";

import { useState } from "react";
import { UserPlus, ChevronDown } from "lucide-react";

type Role = "Member" | "President" | "Vice President" | "Secretary" | "Treasurer";
const ROLES: Role[] = ["Member", "President", "Vice President", "Secretary", "Treasurer"];

interface Member {
  id: string; name: string; initials: string; nic: string; phone: string; role: Role;
}

const PALETTE = [
  { bg: "bg-violet-100",  text: "text-violet-700"  },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100",   text: "text-amber-700"   },
  { bg: "bg-blue-100",    text: "text-blue-700"    },
  { bg: "bg-pink-100",    text: "text-pink-700"    },
];

const SEED: Member[] = [
  { id: "1", name: "Nimal S. Perera",    initials: "NP", nic: "198812345678", phone: "+94 71 987 6543", role: "President"  },
  { id: "2", name: "Ayesha R. Fernando", initials: "AF", nic: "200156789012", phone: "+94 76 555 3210", role: "Secretary"  },
  { id: "3", name: "Kasun M. Bandara",   initials: "KB", nic: "199034567891", phone: "+94 70 444 2200", role: "Treasurer"  },
];

const ROLE_BADGE: Record<Role, string> = {
  "President":      "bg-violet-100 text-violet-700",
  "Vice President": "bg-blue-100 text-blue-700",
  "Secretary":      "bg-emerald-100 text-emerald-700",
  "Treasurer":      "bg-amber-100 text-amber-700",
  "Member":         "bg-gray-100 text-gray-500",
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const handleRoleChange = (id: string, role: Role) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Active Members</h2>
          <p className="mt-0.5 text-sm text-gray-400">Manage the club's member directory and assign roles.</p>
        </div>
        <button className="flex items-center gap-2 self-start rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 sm:self-auto">
          <UserPlus size={16} /> New Member
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Member", "NIC", "Phone", "Role"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m, idx) => (
                <tr key={m.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${PALETTE[idx % PALETTE.length].bg} ${PALETTE[idx % PALETTE.length].text}`}>
                        {m.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.name}</p>
                        <p className="text-xs text-gray-400">#{m.id.padStart(4, "0")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{m.nic}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.phone}</td>
                  <td className="px-6 py-4">
                    <div className="relative inline-flex items-center">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value as Role)}
                        aria-label={`Role for ${m.name}`}
                        className={`h-7 appearance-none rounded-full border-0 py-0 pl-3 pr-7 text-[11px] font-semibold outline-none cursor-pointer transition-opacity hover:opacity-80 focus:ring-2 focus:ring-[#0066FF] ${ROLE_BADGE[m.role]}`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={11} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 px-6 py-3">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-slate-700">{members.length}</span> active members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
