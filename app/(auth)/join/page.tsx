"use client";

import { useState, useRef, useCallback, ChangeEvent, DragEvent } from "react";
import {
  Upload,
  ImagePlus,
  CheckCircle2,
  ShieldCheck,
  X,
  Trash2
} from "lucide-react";
import PhoneInput from "@/components/ui/PhoneInput";

const INITIAL_FORM = {
  initials: "",
  firstName: "",
  lastName: "",
  nic: "",
  email: "",
  phoneCode: "+94",
  phone: "",
  whatsappCode: "+94",
  whatsapp: "",
  address: "",
};

export default function JoinPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Handlers --
  const handleField = (key: keyof typeof form) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handlePhoneChange = (val: string) => {
    setForm(prev => {
      const updates = { ...prev, phone: val };
      if (sameAsPhone) updates.whatsapp = val;
      return updates;
    });
  };

  const handlePhoneCodeChange = (val: string) => {
    setForm(prev => {
      const updates = { ...prev, phoneCode: val };
      if (sameAsPhone) updates.whatsappCode = val;
      return updates;
    });
  };

  const applyFile = useCallback((file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", form, avatarFile);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg border border-gray-100">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Application received!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your membership application has been submitted. An admin will review
            it and get back to you soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-gray-50 px-4 py-8 sm:py-12 overflow-x-hidden">
      <div className="w-full max-w-2xl px-2">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0066FF] shadow-md shadow-blue-200">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            Join the Club
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto px-4">
            Fill in your details below. Your application will be reviewed by an
            admin before activation.
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-xl shadow-gray-100/50">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            
            {/* Avatar Upload */}
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-slate-700">Profile Photo</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !avatarFile && fileInputRef.current?.click()}
                className={`
                  relative flex w-full flex-col items-center justify-center gap-4
                  rounded-xl border-2 border-dashed p-6 text-center
                  transition-all duration-200 cursor-pointer min-h-[160px]
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

                {/* Preview */}
                {avatarPreview ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                    <div className="flex flex-col justify-center items-center flex-1 gap-2 border flex items-center justify-center p-3 rounded-lg bg-emerald-100 border-emerald-200 font-medium text-emerald-700 w-full sm:w-auto overflow-hidden">
                      <p className="flex w-full items-center justify-center gap-1.5 text-sm break-all">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{avatarFile?.name}</span>
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAvatar();
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white text-gray-500 rounded-md shadow-sm hover:text-red-500 hover:bg-red-50 transition w-fit"
                      >
                        <Trash2 size={14} /> Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${dragging ? "bg-[#0066FF] text-white" : "bg-white shadow-sm ring-1 ring-gray-200 text-[#0066FF]"}`}>
                      {dragging ? <Upload size={24} /> : <ImagePlus size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drag & Drop Profile Image
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Supported: jpg, jpeg, png, gif, bmp
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="my-2 border-t border-gray-100 w-full" />

            {/* Name Row */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start">
              <label className="sm:mt-2.5 w-full sm:w-36 shrink-0 text-sm font-medium text-slate-700">
                Name
              </label>
              <div className="flex w-full flex-1 flex-col sm:flex-row gap-3 min-w-0">
                <input
                  type="text"
                  placeholder="Initials"
                  value={form.initials}
                  onChange={handleField("initials")}
                  className="w-full sm:w-24 shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleField("firstName")}
                  required
                  className="w-full sm:w-1/2 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleField("lastName")}
                  required
                  className="w-full sm:w-1/2 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* NIC */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="w-full sm:w-36 shrink-0 text-sm font-medium text-slate-700">
                NIC
              </label>
              <div className="flex w-full flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="National Identity Card Number"
                  value={form.nic}
                  onChange={handleField("nic")}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <label className="w-full sm:w-36 shrink-0 text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="flex w-full flex-1 min-w-0">
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={form.email}
                  onChange={handleField("email")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Phone Row */}
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <label className="w-full sm:w-36 shrink-0 text-sm font-medium text-slate-700 sm:mt-2.5">
                Phone
              </label>
              <div className="flex w-full flex-1 flex-col gap-3 min-w-0">
                <div className="flex w-full flex-col lg:flex-row gap-3 min-w-0">
                  <div className="w-full lg:w-1/2 min-w-0">
                    <PhoneInput
                      phoneValue={form.phone}
                      onPhoneChange={handlePhoneChange}
                      countryDialCode={form.phoneCode}
                      onCountryChange={handlePhoneCodeChange}
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                  
                  <div className="w-full lg:w-1/2 min-w-0">
                    <PhoneInput
                      phoneValue={form.whatsapp}
                      onPhoneChange={(val) => setForm(prev => ({ ...prev, whatsapp: val }))}
                      countryDialCode={form.whatsappCode}
                      onCountryChange={(val) => setForm(prev => ({ ...prev, whatsappCode: val }))}
                      placeholder="WhatsApp (Optional)"
                      disabled={sameAsPhone}
                    />
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2 self-start group">
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
                    className="h-4 w-4 shrink-0 cursor-pointer accent-[#0066FF] rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-500 transition group-hover:text-slate-700">
                    Use as WhatsApp number
                  </span>
                </label>
              </div>
            </div>

            {/* Address */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start">
              <label className="sm:mt-2.5 w-full sm:w-36 shrink-0 text-sm font-medium text-slate-700">
                Home Address
              </label>
              <div className="flex w-full flex-1 min-w-0">
                <textarea
                  placeholder="Residential address"
                  value={form.address}
                  onChange={handleField("address")}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder:text-gray-400 outline-none hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-2 w-full border-t border-gray-100 pt-6">
              <button
                type="submit"
                className="w-full rounded-lg bg-[#0066FF] px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] cursor-pointer"
              >
                Submit Application
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400 sm:text-xs">
                By submitting, you agree to our club's membership terms and
                privacy policy.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
