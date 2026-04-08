import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function JoinPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg border border-gray-100 flex flex-col items-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[20px] bg-emerald-100 ring-[10px] ring-emerald-50 shadow-inner">
          <CheckCircle2
            size={40}
            strokeWidth={2.5}
            className="text-emerald-600"
          />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Application Received!
        </h2>

        <div className="mt-4 px-2">
          <p className="text-[15px] leading-relaxed text-gray-500">
            Your membership application is currently under review.
            Administrative teams usually process requests within{" "}
            <span className="font-semibold text-slate-700">
              1-2 business days
            </span>
            .
          </p>
          <p className="mt-3 text-[14px] text-gray-400">
            We will notify you via email once approved.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 w-full">
          <Link
            href="/join"
            className="inline-flex items-center text-sm font-medium text-[#0066FF] hover:text-blue-700 hover:opacity-80 transition active:scale-95 cursor-pointer"
          >
            ← Back to Join Page
          </Link>
        </div>
      </div>
    </main>
  );
}
