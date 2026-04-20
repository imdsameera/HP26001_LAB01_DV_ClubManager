"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Phone, Mail, MapPin, Building, CreditCard } from "lucide-react";
import Modal from "@/components/ui/Modal";
import RoleSelect from "@/components/ui/RoleSelect";
import type { PendingApprovalRow } from "@/lib/services/memberService";
import type { Role } from "@/components/ui/MemberDetailPanel";

interface PendingApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, role: Role) => void;
  onReject: (id: string) => void;
  applicant: PendingApprovalRow | null;
}

export default function PendingApplicantModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  applicant,
}: PendingApplicantModalProps) {
  const [role, setRole] = useState<Role>("Member");
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/members/roles")
        .then(r => r.json())
        .then(d => {
          if (d.roles) setAssignedRoles(d.roles);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && applicant) {
      setRole((applicant.role as Role) || "Member");
    }
  }, [isOpen, applicant]);

  if (!applicant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Application"
      maxWidth="max-w-[800px]"
    >
      <div className="flex flex-col md:flex-row gap-8 p-6">
        {/* Left: Applicant Details */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-[#0066FF] shadow-sm shrink-0">
              {applicant.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={applicant.avatarUrl}
                  alt={applicant.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                applicant.initials
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{applicant.name}</h3>
              <p className="text-sm text-gray-500">Applied on {applicant.dateApplied}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <CreditCard size={14} /> NIC
              </div>
              <p className="text-sm font-medium text-slate-800">{applicant.nic || "N/A"}</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Mail size={14} /> Email
              </div>
              <p className="text-sm font-medium text-slate-800 break-all">{applicant.email || "N/A"}</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Phone size={14} /> Phone
              </div>
              <p className="text-sm font-medium text-slate-800">
                {applicant.phoneCode} {applicant.phone}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Building size={14} /> WhatsApp
              </div>
              <p className="text-sm font-medium text-slate-800">
                {applicant.whatsappCode} {applicant.whatsapp || applicant.phone}
              </p>
            </div>

            <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <MapPin size={14} /> Address
              </div>
              <p className="text-sm font-medium text-slate-800">{applicant.address || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions & Role Assignment */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
            <h4 className="font-semibold text-slate-800 mb-3 text-sm">Assign Member Role</h4>
            <RoleSelect
              value={role}
              onChange={(r) => setRole(r as Role)}
              disabledRoles={assignedRoles}
            />
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Before approving the application, you can assign an executive role if appropriate. By default, applications are approved as standard members.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 px-6 py-4">
        <button
          type="button"
          onClick={() => onReject(applicant.id)}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 active:scale-95"
        >
          <XCircle size={16} /> Reject Application
        </button>
        <button
          type="button"
          onClick={() => onApprove(applicant.id, role)}
          className="flex items-center gap-2 rounded-lg bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <CheckCircle size={16} /> Approve &amp; Save
        </button>
      </div>
    </Modal>
  );
}
