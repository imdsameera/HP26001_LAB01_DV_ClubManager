"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, XCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

function VerifyContent() {
  const params  = useSearchParams();
  const success = params.get("success") === "1";
  const email   = params.get("email") ?? "";
  const error   = params.get("error");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-100/50">

          {/* Top accent bar */}
          <div className={`h-1.5 w-full ${success ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`} />

          <div className="p-8">
            {/* Logo mark */}
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066FF] shadow-md shadow-blue-200">
                <span className="text-sm font-black text-white">H</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">Hyke Youth Club</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Club Management System</p>
              </div>
            </div>

            {success ? (
              /* ── Success state ──────────────────────────── */
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-slate-800">Email Verified!</h1>
                <p className="mb-2 text-sm text-gray-500">
                  Your sender email address has been successfully verified.
                </p>
                {email && (
                  <div className="my-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                    <Mail size={14} className="text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">{decodeURIComponent(email)}</span>
                  </div>
                )}
                <p className="mb-8 text-sm text-gray-400">
                  This address will now be used as the <em>From</em> address for all
                  outgoing member emails. You can manage it from Settings.
                </p>
                <Link
                  href="/settings"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
                >
                  Go to Settings
                </Link>
              </div>
            ) : (
              /* ── Error state ────────────────────────────── */
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/60">
                  <XCircle size={40} className="text-red-500" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-slate-800">Verification Failed</h1>
                <p className="mb-6 text-sm text-gray-500">
                  {error && error !== "missing_token"
                    ? decodeURIComponent(error)
                    : "The verification link is missing or invalid."}
                </p>
                <p className="mb-8 text-sm text-gray-400">
                  Please return to Settings and request a new verification email.
                </p>
                <Link
                  href="/settings"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50 active:scale-95"
                >
                  <ArrowLeft size={15} />
                  Back to Settings
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Hyke Youth Club &mdash; Powered by Hyke Global
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#0066FF]" />
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}
