import type { MemberRole } from "@/lib/models/member";

const ROLES: MemberRole[] = [
  "Member",
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
];

export function parseRole(value: string | null | undefined): MemberRole | null {
  if (!value) return null;
  return ROLES.includes(value as MemberRole) ? (value as MemberRole) : null;
}

export interface JoinFields {
  initials: string;
  firstName: string;
  lastName: string;
  nic: string;
  email: string;
  phoneCode: string;
  phone: string;
  whatsappCode: string;
  whatsapp: string;
  address: string;
}

export function joinFieldsFromFormData(fd: FormData): JoinFields {
  return {
    initials: String(fd.get("initials") ?? "").trim(),
    firstName: String(fd.get("firstName") ?? "").trim(),
    lastName: String(fd.get("lastName") ?? "").trim(),
    nic: String(fd.get("nic") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    phoneCode: String(fd.get("phoneCode") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    whatsappCode: String(fd.get("whatsappCode") ?? "").trim(),
    whatsapp: String(fd.get("whatsapp") ?? "").trim(),
    address: String(fd.get("address") ?? "").trim(),
  };
}

export interface AdminMemberFields {
  initials: string;
  firstName: string;
  lastName: string;
  role: MemberRole;
  nic: string;
  email: string;
  phoneCode: string;
  phone: string;
  whatsappCode: string;
  whatsapp: string;
  address: string;
}

export function adminFieldsFromFormData(fd: FormData): AdminMemberFields {
  const role = parseRole(String(fd.get("role") ?? ""));
  return {
    initials: String(fd.get("initials") ?? "").trim(),
    firstName: String(fd.get("firstName") ?? "").trim(),
    lastName: String(fd.get("lastName") ?? "").trim(),
    role: role ?? "Member",
    nic: String(fd.get("nic") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    phoneCode: String(fd.get("phoneCode") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    whatsappCode: String(fd.get("whatsappCode") ?? "").trim(),
    whatsapp: String(fd.get("whatsapp") ?? "").trim(),
    address: String(fd.get("address") ?? "").trim(),
  };
}

export function validateJoinFields(f: JoinFields): string | null {
  if (!f.initials) return "Initials are required";
  if (!f.firstName) return "First name is required";
  if (!f.lastName) return "Last name is required";
  if (!f.address) return "Address is required";
  if (!f.phone) return "Phone is required";
  return null;
}

export function validateAdminMemberFields(f: AdminMemberFields): string | null {
  if (!f.firstName) return "First name is required";
  if (!f.lastName) return "Last name is required";
  if (!f.nic) return "NIC is required";
  if (!f.phone) return "Phone is required";
  return null;
}
