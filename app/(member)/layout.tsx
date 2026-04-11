"use client";

import { signOut }    from "next-auth/react";
import { useSession } from "next-auth/react";
import { LogOut }     from "lucide-react";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const name  = session?.user?.name  ?? "Member";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-blue-100 bg-white/80 px-5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0066FF] text-xs font-black text-white">H</div>
          <span className="text-sm font-bold text-slate-800">Hyke Youth Club</span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Member Portal</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0066FF] text-[11px] font-bold text-white">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-gray-50"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
