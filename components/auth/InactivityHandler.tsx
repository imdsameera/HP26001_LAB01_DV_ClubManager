"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, ShieldAlert, Timer } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

/**
 * Configuration for inactivity timings
 * preliminaryInactivity: 30 seconds of no movement/interaction
 * logoutCountdown: 60 seconds of warning before auto sign-out
 */
const PRELIMINARY_INACTIVITY_MS = 300 * 1000;
const LOGOUT_COUNTDOWN_SECONDS = 60;

export default function InactivityHandler() {
  const { data: session, status } = useSession();
  const [isWarning, setIsWarning] = useState(false);
  const [countdown, setCountdown] = useState(LOGOUT_COUNTDOWN_SECONDS);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/login" });
  }, []);

  const resetInactivityTimer = useCallback(() => {
    // If we're already showing the warning, don't reset the background timer
    if (isWarning) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setIsWarning(true);
    }, PRELIMINARY_INACTIVITY_MS);
  }, [isWarning]);

  // Global activity listeners
  useEffect(() => {
    if (status !== "authenticated") return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const handler = () => resetInactivityTimer();

    events.forEach((name) => document.addEventListener(name, handler));
    resetInactivityTimer(); // Initial start

    return () => {
      events.forEach((name) => document.removeEventListener(name, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, resetInactivityTimer]);

  // Countdown logic when warning is shown
  useEffect(() => {
    if (isWarning) {
      setCountdown(LOGOUT_COUNTDOWN_SECONDS);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [isWarning, handleLogout]);

  const staySignedIn = () => {
    setIsWarning(false);
    resetInactivityTimer();
  };

  if (status !== "authenticated") return null;

  return (
    <Modal
      isOpen={isWarning}
      onClose={staySignedIn}
      title="Inactivity Warning"
      maxWidth="max-w-md"
    >
      <div className="p-6 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/50">
          <ShieldAlert size={40} className="text-amber-500 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 group flex items-center justify-center gap-2">
          Are you still there?
        </h3>

        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Your session is about to expire due to inactivity. For your security,
          you will be signed out in:
        </p>

        <div className="my-8 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 text-4xl font-black text-[#0066FF] tracking-tighter">
            <Timer size={32} />
            <span>00:{countdown.toString().padStart(2, "0")}</span>
          </div>
          <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-[#0066FF] transition-all duration-1000 ease-linear"
              style={{
                width: `${(countdown / LOGOUT_COUNTDOWN_SECONDS) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={staySignedIn}
            className="w-full font-bold"
          >
            I'm Still Here
          </Button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Sign Out Now
          </button>
        </div>
      </div>
    </Modal>
  );
}
