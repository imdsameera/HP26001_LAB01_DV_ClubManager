"use client";

import { useState, useRef, useCallback, ChangeEvent, DragEvent } from "react";
import {
  User,
  CreditCard,
  Home,
  Phone,
  MessageCircle,
  Upload,
  X,
  CheckCircle2,
  ShieldCheck,
  ImagePlus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FormData {
  fullName: string;
  initials: string;
  nic: string;
  address: string;
  phone: string;
  whatsapp: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Accessible form field wrapper */
function Field({
  id,
  label,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-primary)]"
      >
        {label}
        {optional && (
          <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-[11px] font-normal text-[var(--color-text-secondary)]">
            Optional
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

/** Styled text / tel input */
function Input({
  id,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  required,
}: {
  id: string;
  type?: string;
  placeholder: string;
  icon: React.ElementType;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
        <Icon size={16} />
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete="off"
        className="
          h-11 w-full rounded-lg border border-[var(--color-border)]
          bg-white pl-10 pr-4 text-sm text-[var(--color-text-primary)]
          placeholder:text-[var(--color-text-secondary)]
          outline-none transition-all duration-150
          hover:border-[var(--color-border-strong)]
          focus:border-[var(--color-brand-primary)]
          focus:ring-3 focus:ring-[var(--color-brand-primary-light)]
        "
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Avatar upload zone
// ---------------------------------------------------------------------------
function AvatarUpload({
  file,
  preview,
  dragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onChange,
  onClear,
  inputRef,
}: {
  file: File | null;
  preview: string | null;
  dragging: boolean;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !file && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3
        rounded-xl border-2 border-dashed p-6 text-center
        transition-all duration-200 cursor-pointer
        ${
          dragging
            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-light)] scale-[1.01]"
            : file
              ? "border-[var(--color-success)] bg-[var(--color-success-light)] cursor-default"
              : "border-[var(--color-border-strong)] bg-[var(--color-workspace-bg)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-light)]"
        }
      `}
      role="button"
      tabIndex={0}
      aria-label="Upload avatar image"
      onKeyDown={(e) => e.key === "Enter" && !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        id="avatar"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="sr-only"
        onChange={onChange}
        aria-label="Avatar file input"
      />

      {/* Preview / idle state */}
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Avatar preview"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
          />
          <p className="text-sm font-medium text-[var(--color-success)]">
            <CheckCircle2 size={14} className="mr-1 inline" />
            {file?.name}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="
              flex items-center gap-1 rounded-full border border-[var(--color-border-strong)]
              bg-white px-3 py-1 text-xs text-[var(--color-text-secondary)]
              hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]
              transition-colors duration-150
            "
          >
            <X size={12} /> Remove
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
                ? "bg-[var(--color-brand-primary)] text-white"
                : "bg-[var(--color-border)] text-[var(--color-text-secondary)]"
            }
          `}
          >
            {dragging ? <Upload size={24} /> : <ImagePlus size={24} />}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {dragging ? "Drop your image here" : "Upload a profile photo"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              Drag & drop or{" "}
              <span className="font-medium text-[var(--color-brand-primary)] underline underline-offset-2">
                browse
              </span>{" "}
              · PNG, JPG, WebP up to 5 MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function JoinPage() {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    initials: "",
    nic: "",
    address: "",
    phone: "",
    whatsapp: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Helpers ---------------------------------------------------------------
  const handleField =
    (key: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

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

  // -- Drag-and-drop handlers ------------------------------------------------
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

  // -- Submit ----------------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will wire to API in next step
    console.log("Submitting:", form, avatarFile);
    setSubmitted(true);
  };

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------
  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-workspace-bg)] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-light)]">
            <CheckCircle2 size={32} className="text-[var(--color-success)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Application received!
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Your membership application has been submitted. An admin will review
            it and get back to you soon.
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------
  return (
    <main className="flex min-h-screen items-start justify-center bg-[var(--color-workspace-bg)] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          {/* Brand mark */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-primary)] shadow-md">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Join the Club
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
            Fill in your details below. Your application will be reviewed by an
            admin before activation.
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-lg)]">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Avatar upload */}
            <Field id="avatar" label="Profile Photo" optional>
              <AvatarUpload
                file={avatarFile}
                preview={avatarPreview}
                dragging={dragging}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) applyFile(file);
                }}
                onClear={clearAvatar}
                inputRef={fileInputRef}
              />
            </Field>

            {/* Divider */}
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
              <span className="flex-1 border-t border-[var(--color-border)]" />
              Personal Information
              <span className="flex-1 border-t border-[var(--color-border)]" />
            </div>

            {/* Name + Initials – side by side */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field id="fullName" label="Full Name">
                  <Input
                    id="fullName"
                    placeholder="e.g. John Doe"
                    icon={User}
                    value={form.fullName}
                    onChange={handleField("fullName")}
                    required
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field id="initials" label="Initials">
                  <Input
                    id="initials"
                    placeholder="A.P."
                    icon={User}
                    value={form.initials}
                    onChange={handleField("initials")}
                    required
                  />
                </Field>
              </div>
            </div>

            {/* NIC */}
            <Field id="nic" label="NIC Number">
              <Input
                id="nic"
                placeholder="e.g. 199812345678 or 981234567V"
                icon={CreditCard}
                value={form.nic}
                onChange={handleField("nic")}
                required
              />
            </Field>

            {/* Address */}
            <Field id="address" label="Home Address">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-3 text-[var(--color-text-secondary)]">
                  <Home size={16} />
                </span>
                <textarea
                  id="address"
                  placeholder="No. 12, Divithotawela, Welimada"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  required
                  rows={3}
                  className="
                    w-full rounded-lg border border-[var(--color-border)]
                    bg-white pl-10 pr-4 pt-2.5 pb-2.5 text-sm
                    text-[var(--color-text-primary)] resize-none
                    placeholder:text-[var(--color-text-secondary)]
                    outline-none transition-all duration-150
                    hover:border-[var(--color-border-strong)]
                    focus:border-[var(--color-brand-primary)]
                    focus:ring-3 focus:ring-[var(--color-brand-primary-light)]
                  "
                />
              </div>
            </Field>

            {/* Phone numbers */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="phone" label="Phone Number">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+94 77 123 4567"
                  icon={Phone}
                  value={form.phone}
                  onChange={handleField("phone")}
                  required
                />
              </Field>

              <Field id="whatsapp" label="WhatsApp Number" optional>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+94 77 123 4567"
                  icon={MessageCircle}
                  value={form.whatsapp}
                  onChange={handleField("whatsapp")}
                />
              </Field>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
                mt-2 flex h-11 w-full items-center justify-center gap-2
                rounded-lg bg-[var(--color-brand-primary)] px-6
                text-sm font-semibold text-white shadow-sm
                transition-all duration-150
                hover:bg-[var(--color-brand-primary-hover)] hover:shadow-md
                active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-3
                focus-visible:ring-[var(--color-brand-primary-light)] cursor-pointer
              "
            >
              Submit Application
            </button>

            <p className="text-center text-xs text-[var(--color-text-secondary)]">
              By submitting, you agree to our club's membership terms and
              privacy policy.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
