"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import MemberFormModal from "@/components/ui/MemberFormModal";
import { UserPlus, MessageCircle, ChevronRight } from "lucide-react";
import MemberDetailPanel, {
  type Member,
  type Role,
  PALETTE,
} from "@/components/ui/MemberDetailPanel";
import { getInitials } from "@/lib/utils/nameUtils";

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

type MemberFormSavePayload = {
  initials: string;
  firstName: string;
  lastName: string;
  role: Role;
  nic: string;
  email: string;
  phoneCode: string;
  phone: string;
  whatsappCode: string;
  whatsapp: string;
  address: string;
  avatarFile: File | null;
  clearExistingAvatar?: boolean;
};

async function fetchActiveMembers(): Promise<Member[] | null> {
  try {
    const res = await fetch("/api/members");
    const j: unknown = await res.json();
    if (!res.ok || typeof j !== "object" || j === null || !("members" in j)) return null;
    const raw = (j as { members: unknown }).members;
    if (!Array.isArray(raw)) return null;
    return raw as Member[];
  } catch {
    return null;
  }
}

function buildMemberFormData(d: MemberFormSavePayload): FormData {
  const fd = new FormData();
  fd.append("initials", d.initials);
  fd.append("firstName", d.firstName);
  fd.append("lastName", d.lastName);
  fd.append("role", d.role);
  fd.append("nic", d.nic);
  fd.append("email", d.email);
  fd.append("phoneCode", d.phoneCode);
  fd.append("phone", d.phone);
  fd.append("whatsappCode", d.whatsappCode);
  fd.append("whatsapp", d.whatsapp);
  fd.append("address", d.address);
  if (d.avatarFile) fd.append("avatar", d.avatarFile);
  if (d.clearExistingAvatar) fd.append("clearAvatar", "1");
  return fd;
}

// ---------------------------------------------------------------------------
// Page Component (Split View)
// ---------------------------------------------------------------------------
export default function MembersPage() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get("id");
  const processedSearchRef = useRef(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const loadMembers = useCallback(async () => {
    const list = await fetchActiveMembers();
    if (list === null) return;
    setMembers(list);
    
    // Auto-select based on URL or previous state
    setSelected((prev) => {
      // If we haven't processed the deep link search param yet, do it now
      if (searchId && !processedSearchRef.current) {
        processedSearchRef.current = true;
        const target = list.find(m => m.id === searchId);
        if (target) return target;
      }
      if (!prev) return null;
      return list.find((m) => m.id === prev.id) ?? null;
    });
  }, [searchId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchActiveMembers();
      if (cancelled || list === null) return;
      setMembers(list);
      setSelected((prev) => {
        if (searchId && !processedSearchRef.current) {
          processedSearchRef.current = true;
          const target = list.find((m) => m.id === searchId);
          if (target) return target;
        }
        if (!prev) return null;
        return list.find((m) => m.id === prev.id) ?? null;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [searchId]);

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
                  {(searchId ? members.filter(m => m.id === searchId) : members).map((m) => {
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
                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase ${ROLE_BADGE[m.role]}`}
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
                    {searchId ? members.filter(m => m.id === searchId).length : members.length}
                  </span>{" "}
                  {searchId ? "filtered member" : "active members"}
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
          onRemove={async (id) => {
            const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              window.alert(typeof j === "object" && j && "error" in j && typeof (j as { error: string }).error === "string" ? (j as { error: string }).error : "Could not remove member.");
              return;
            }
            await loadMembers();
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
        onSave={async (data) => {
          const d = data as MemberFormSavePayload;
          const fd = buildMemberFormData(d);
          const editing = editingMember;
          const url = editing ? `/api/members/${editing.id}` : "/api/members";
          const method = editing ? "PATCH" : "POST";
          const res = await fetch(url, { method, body: fd });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            window.alert(typeof j === "object" && j && "error" in j && typeof (j as { error: string }).error === "string" ? (j as { error: string }).error : "Could not save member.");
            return;
          }
          await loadMembers();
        }}
      />
    </div>
  );
}
