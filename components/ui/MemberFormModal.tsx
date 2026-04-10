"use client";

import {
  useState,
  useRef,
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
} from "react";
import { X, Upload, ImagePlus, CheckCircle2, Trash2 } from "lucide-react";
import type { Role, Member } from "@/components/ui/MemberDetailPanel";
import Modal from "@/components/ui/Modal";
import PhoneInput from "@/components/ui/PhoneInput";
import RoleSelect from "@/components/ui/RoleSelect";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: unknown) => void;
  initialData?: Member | null;
}

// Assigned roles will be fetched dynamically

const INITIAL_FORM = {
  initials: "",
  firstName: "",
  lastName: "",
  role: "Member" as Role,
  nic: "",
  email: "",
  phoneCode: "+94",
  phone: "",
  whatsappCode: "+94",
  whatsapp: "",
  address: "",
};

export default function MemberFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: MemberFormModalProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [userRemovedAvatar, setUserRemovedAvatar] = useState(false);
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      fetch("/api/members/roles")
        .then(r => r.json())
        .then(d => {
          // Exclude the current member's role from disabled roles so they can keep it
          if (d.roles) {
             let rolesToDisable = d.roles;
             if (initialData?.role) {
                 rolesToDisable = rolesToDisable.filter((r: string) => r !== initialData.role);
             }
             setAssignedRoles(rolesToDisable);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, initialData]);

  /* eslint-disable react-hooks/set-state-in-effect -- initialize form when modal opens */
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Approximate splitting name for edit
        const parts = initialData.name.split(" ");
        const lastName = parts.length > 1 ? parts.pop() || "" : "";
        const firstOrInit = parts.join(" ") || initialData.name;

        // Try extracting country code from phone if it exists. Simplified parsing.
        let pCode = "+94";
        let pNum = initialData.phone;
        if (pNum.startsWith("+")) {
          const spaceIdx = pNum.indexOf(" ");
          if (spaceIdx > 0) {
            pCode = pNum.substring(0, spaceIdx);
            pNum = pNum.substring(spaceIdx + 1);
          }
        }

        let wCode = "+94";
        let wNum = initialData.whatsapp;
        if (wNum.startsWith("+")) {
          const spaceIdx = wNum.indexOf(" ");
          if (spaceIdx > 0) {
            wCode = wNum.substring(0, spaceIdx);
            wNum = wNum.substring(spaceIdx + 1);
          }
        }

        setForm({
          initials: "",
          firstName: firstOrInit,
          lastName,
          role: initialData.role,
          nic: initialData.nic,
          email: initialData.email || "",
          phoneCode: pCode,
          phone: pNum,
          whatsappCode: wCode,
          whatsapp: wNum,
          address: initialData.address,
        });
        setAvatarPreview(initialData.avatarUrl || null);
        setSameAsPhone(pNum === wNum && pNum.length > 0);
      } else {
        setForm(INITIAL_FORM);
        setAvatarPreview(null);
        setSameAsPhone(false);
      }
      setAvatarFile(null);
      setUserRemovedAvatar(false);
    }
  }, [isOpen, initialData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handlePhoneChange = (val: string) => {
    setForm((prev) => {
      const updates = { ...prev, phone: val };
      if (sameAsPhone) updates.whatsapp = val;
      return updates;
    });
  };

  const handlePhoneCodeChange = (val: string) => {
    setForm((prev) => {
      const updates = { ...prev, phoneCode: val };
      if (sameAsPhone) updates.whatsappCode = val;
      return updates;
    });
  };

  const handleField =
    (key: keyof typeof form) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const applyFile = useCallback((file: File) => {
    setAvatarFile(file);
    setUserRemovedAvatar(false);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (initialData?.avatarUrl) setUserRemovedAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) applyFile(file);
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setSameAsPhone(false);
    clearAvatar();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, avatarFile, clearExistingAvatar: userRemovedAvatar });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Member" : "Add New Member"}
      maxWidth="max-w-[1000px]"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col-reverse gap-8 p-6 md:flex-row">
          {/* Left side: Form Fields */}
          <div className="flex-1 space-y-6">
            {/* Name Row (Initials, First Name, Last Name) */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="w-36 shrink-0 text-sm font-medium text-slate-700">
                Name
              </label>
              <div className="flex flex-1 gap-3">
                <input
                  type="text"
                  placeholder="Initials"
                  value={form.initials}
                  onChange={handleField("initials")}
                  required
                  className="w-24 shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleField("firstName")}
                  required
                  className="w-1/2 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
                <input
                  type="text"
                  placeholder="Last Name (Optional)"
                  value={form.lastName}
                  onChange={handleField("lastName")}
                  className="w-1/2 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="w-36 shrink-0 flex items-center justify-between pr-4 text-sm font-medium text-slate-700">
                <span>Member Role</span>
              </label>
              <div className="flex-1">
                <RoleSelect
                  value={form.role}
                  onChange={(r) => setForm((prev) => ({ ...prev, role: r }))}
                  disabledRoles={assignedRoles}
                />
              </div>
            </div>

            <div className="my-4 border-t border-gray-100" />

            {/* NIC */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="w-36 shrink-0 text-sm font-medium text-slate-700">
                NIC <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="National Identity Card Number"
                  value={form.nic}
                  onChange={handleField("nic")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="w-36 shrink-0 text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={form.email}
                  onChange={handleField("email")}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Phone Row */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="w-36 shrink-0 text-sm font-medium text-slate-700 sm:mt-2">
                Phone
              </label>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <PhoneInput
                    phoneValue={form.phone}
                    onPhoneChange={handlePhoneChange}
                    countryDialCode={form.phoneCode}
                    onCountryChange={handlePhoneCodeChange}
                    placeholder="Phone Number"
                    required
                  />

                  <PhoneInput
                    phoneValue={form.whatsapp}
                    onPhoneChange={(val) =>
                      setForm((prev) => ({ ...prev, whatsapp: val }))
                    }
                    countryDialCode={form.whatsappCode}
                    onCountryChange={(val) =>
                      setForm((prev) => ({ ...prev, whatsappCode: val }))
                    }
                    placeholder="WhatsApp (Optional)"
                    disabled={sameAsPhone}
                  />
                </div>
                <label className="mt-1 flex cursor-pointer items-center gap-2 self-start group">
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSameAsPhone(checked);
                      if (checked) {
                        setForm((prev) => ({
                          ...prev,
                          whatsapp: prev.phone,
                          whatsappCode: prev.phoneCode,
                        }));
                      }
                    }}
                    className="h-4 w-4 cursor-pointer accent-[#0066FF] rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-500 transition group-hover:text-slate-700">
                    Use as WhatsApp number
                  </span>
                </label>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <label className="mt-2 w-36 shrink-0 text-sm font-medium text-slate-700">
                Home Address
              </label>
              <div className="flex-1">
                <textarea
                  placeholder="Residential address"
                  value={form.address}
                  onChange={handleField("address")}
                  required
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>
          </div>

          {/* Right side: Profile Upload */}
          <div className="w-full md:w-60 shrink-0">
            {avatarPreview && !avatarFile && isEditMode ? (
              // Existing remote image layout in Edit mode
              <div className="relative flex h-60 w-full items-center justify-center overflow-hidden rounded-[8px] border border-gray-100 bg-[#F9FAFB] p-8">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAvatar();
                  }}
                  className="absolute right-2 top-2 z-10 text-[#FF4D4F] transition hover:scale-110 hover:text-[#CF1322] active:scale-95 cursor-pointer"
                >
                  <Trash2 strokeWidth={1.5} size={18} />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview}
                  alt="Current Member Profile"
                  className="h-full w-full rounded-[6px] object-cover bg-white"
                />
              </div>
            ) : (
              // General Drag & Drop Layout
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !avatarFile && fileInputRef.current?.click()}
                className={`
                    relative flex flex-col items-center justify-center gap-4
                    rounded-xl border-2 border-dashed p-4 text-center
                    transition-all duration-200 cursor-pointer h-60
                    ${
                      dragging
                        ? "border-[#0066FF] bg-blue-50 scale-[1.01]"
                        : avatarFile
                          ? "border-emerald-500 bg-emerald-50 cursor-default"
                          : "border-gray-300 bg-gray-50 hover:border-[#0066FF] hover:bg-blue-50/50"
                    }
                  `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) applyFile(file);
                  }}
                />

                {/* Preview of newly dropped local file */}
                {avatarPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                    <p className="text-sm border flex items-center justify-center p-2 rounded-lg bg-emerald-100 border-emerald-200 font-medium text-emerald-700 break-all w-full leading-tight">
                      <CheckCircle2
                        size={16}
                        className="mr-1 inline shrink-0"
                      />
                      <span className="truncate">{avatarFile?.name}</span>
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAvatar();
                      }}
                      className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-gray-400 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className={`
                        flex h-14 w-14 items-center justify-center rounded-full
                        transition-colors duration-200
                        ${
                          dragging
                            ? "bg-[#0066FF] text-white"
                            : "bg-white shadow-sm ring-1 ring-gray-200 text-[#0066FF]"
                        }
                      `}
                    >
                      {dragging ? (
                        <Upload size={24} />
                      ) : (
                        <ImagePlus size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drag & Drop Profile Image
                      </p>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Supported: jpg, jpeg, png, gif, bmp
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Maximum File Size: 5MB
                      </p>
                      <span className="mt-3 inline-block font-medium text-sm text-[#0066FF] underline underline-offset-2">
                        Upload File
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex items-center gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="submit"
            className="rounded-lg bg-[#0066FF] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
