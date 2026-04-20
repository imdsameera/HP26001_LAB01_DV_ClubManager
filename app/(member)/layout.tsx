"use client";

import { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-blue-100">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#F9FAFB] shadow-sm md:max-w-3xl md:border-x md:border-gray-100">
        {children}
      </main>
    </div>
  );
}
