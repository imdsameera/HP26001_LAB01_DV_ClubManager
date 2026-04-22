"use client";
import { SessionProvider } from "next-auth/react";
import InactivityHandler from "@/components/auth/InactivityHandler";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InactivityHandler />
      {children}
    </SessionProvider>
  );
}
